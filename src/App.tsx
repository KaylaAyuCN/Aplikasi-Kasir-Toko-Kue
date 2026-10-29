/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  Product,
  RawMaterial,
  CartItem,
  Transaction,
  StockMovement,
  MarketplaceChannel,
  PaymentMethod
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_RAW_MATERIALS,
  INITIAL_MARKETPLACES,
  INITIAL_STOCK_MOVEMENTS,
  generateSeedTransactions
} from './data/initialData';
import { HeaderNavbar, ActiveTab } from './components/HeaderNavbar';
import { PosView } from './components/pos/PosView';
import { StockAdjustmentView } from './components/pos/StockAdjustmentView';
import { PaymentModal } from './components/pos/PaymentModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { RawMaterialsView } from './components/inventory/RawMaterialsView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { MonthlyReportsView } from './components/reports/MonthlyReportsView';
import { MarketplaceSyncView } from './components/marketplace/MarketplaceSyncView';
import { NotificationModal } from './components/NotificationModal';
import { UserManagementModal } from './components/users/UserManagementModal';
import { generateReceiptNumber } from './utils/formatters';
import { connectBluetoothThermalPrinter } from './utils/thermalPrinter';

export default function App() {
  // Navigation & User
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);

  // Core Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(INITIAL_RAW_MATERIALS);
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateSeedTransactions());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [marketplaces, setMarketplaces] = useState<MarketplaceChannel[]>(INITIAL_MARKETPLACES);

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);

  // Hardware State
  const [isBluetoothPrinterConnected, setIsBluetoothPrinterConnected] = useState(true);

  // Low Stock Count (Both Raw Materials and Products)
  const lowStockCount = useMemo(() => {
    const rawLow = rawMaterials.filter((rm) => rm.currentStock <= rm.minStock).length;
    const prodLow = products.filter((p) => p.stock <= p.minStock).length;
    return rawLow + prodLow;
  }, [rawMaterials, products]);

  // POS Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.product.id === product.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((it) => {
          if (it.product.id === productId) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // COMPLETE PAYMENT & AUTOMATIC RECIPE / INVENTORY DEDUCTION
  const handleCompletePayment = (
    paymentMethod: PaymentMethod,
    paymentDetails: any,
    customerName?: string,
    customerPhone?: string
  ) => {
    const rawSubtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    const tax = Math.round(rawSubtotal * 0.1);
    const discount = 0;
    const total = rawSubtotal + tax - discount;
    const totalCost = cart.reduce((acc, it) => acc + it.product.costPrice * it.quantity, 0);
    const grossProfit = total - tax - totalCost;

    const receiptNumber = generateReceiptNumber();
    const nowIso = new Date().toISOString();
    const nowDateStr = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

    // 1. Create Transaction
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      receiptNumber,
      date: nowIso,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items: cart.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        price: it.product.price,
        costPrice: it.product.costPrice,
        quantity: it.quantity,
        subtotal: it.product.price * it.quantity,
      })),
      subtotal: rawSubtotal,
      tax,
      discount,
      total,
      totalCost,
      grossProfit,
      paymentMethod,
      paymentDetails,
      customerName,
      customerPhone,
    };

    // 2. Deduct Product Physical Stocks
    const newStockMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((it) => it.product.id === prod.id);
      if (cartItem) {
        const newStock = Math.max(0, prod.stock - cartItem.quantity);
        newStockMovements.push({
          id: `sm-${Date.now()}-${prod.id}`,
          date: nowDateStr,
          type: 'sale',
          itemType: 'product',
          itemId: prod.id,
          itemName: prod.name,
          amount: -cartItem.quantity,
          stockBefore: prod.stock,
          stockAfter: newStock,
          unit: 'pcs',
          notes: `Penjualan Nota ${receiptNumber}`,
          operatorName: currentUser.name,
        });
        return { ...prod, stock: newStock };
      }
      return prod;
    });

    // 3. AUTOMATIC BILL OF MATERIALS (BOM) RAW MATERIAL INVENTORY DEDUCTION
    // Calculate total consumption of each raw material based on recipes
    const rawMaterialDeductions: Record<string, { amount: number; productName: string }> = {};

    cart.forEach((cartItem) => {
      cartItem.product.recipe.forEach((recipeItem) => {
        const consumed = recipeItem.amount * cartItem.quantity;
        if (!rawMaterialDeductions[recipeItem.rawMaterialId]) {
          rawMaterialDeductions[recipeItem.rawMaterialId] = { amount: 0, productName: cartItem.product.name };
        }
        rawMaterialDeductions[recipeItem.rawMaterialId].amount += consumed;
      });
    });

    const updatedRawMaterials = rawMaterials.map((rm) => {
      const deduction = rawMaterialDeductions[rm.id];
      if (deduction) {
        const newStock = Math.max(0, rm.currentStock - deduction.amount);
        newStockMovements.push({
          id: `sm-${Date.now()}-${rm.id}`,
          date: nowDateStr,
          type: 'sale',
          itemType: 'raw_material',
          itemId: rm.id,
          itemName: rm.name,
          amount: -deduction.amount,
          stockBefore: rm.currentStock,
          stockAfter: newStock,
          unit: rm.unit,
          notes: `Konsumsi Resep Nota ${receiptNumber} (${deduction.productName})`,
          operatorName: 'Sistem POS Otomatis',
        });
        return { ...rm, currentStock: newStock };
      }
      return rm;
    });

    // 4. Update Marketplace Auto-Sync Timestamp
    const updatedMarketplaces = marketplaces.map((ch) => {
      if (ch.autoSync) {
        return { ...ch, lastSyncTime: nowDateStr };
      }
      return ch;
    });

    // Commit States
    setTransactions([newTransaction, ...transactions]);
    setProducts(updatedProducts);
    setRawMaterials(updatedRawMaterials);
    setStockMovements([...newStockMovements, ...stockMovements]);
    setMarketplaces(updatedMarketplaces);

    setLastCompletedTransaction(newTransaction);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    setCart([]);
  };

  // Stock Adjustment Handler
  const handleUpdateStock = (productId: string, newStock: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const delta = newStock - prod.stock;
    const nowDateStr = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    setStockMovements((prev) => [
      {
        id: `sm-${Date.now()}-${productId}`,
        date: nowDateStr,
        type: 'adjustment',
        itemType: 'product',
        itemId: prod.id,
        itemName: prod.name,
        amount: delta,
        stockBefore: prod.stock,
        stockAfter: newStock,
        unit: 'pcs',
        notes: reason,
        operatorName: currentUser.name,
      },
      ...prev,
    ]);
  };

  // Raw Material Restock Handler
  const handleRestockRawMaterial = (id: string, amount: number, costPerUnit?: number, notes?: string) => {
    const rm = rawMaterials.find((r) => r.id === id);
    if (!rm) return;

    const newStock = rm.currentStock + amount;
    const nowDateStr = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

    setRawMaterials((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              currentStock: newStock,
              costPerUnit: costPerUnit || r.costPerUnit,
              lastRestocked: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );

    setStockMovements((prev) => [
      {
        id: `sm-${Date.now()}-${id}`,
        date: nowDateStr,
        type: 'restock',
        itemType: 'raw_material',
        itemId: rm.id,
        itemName: rm.name,
        amount: amount,
        stockBefore: rm.currentStock,
        stockAfter: newStock,
        unit: rm.unit,
        notes: notes || 'Penerimaan Stok Bahan Baku',
        operatorName: currentUser.name,
      },
      ...prev,
    ]);
  };

  // Quick Restock Product
  const handleQuickRestockProduct = (id: string, amount: number) => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return;
    handleUpdateStock(id, p.stock + amount, 'Baking Display Baru');
  };

  // Add New Product
  const handleAddNewProduct = (newProd: Partial<Product>) => {
    const fullProduct: Product = {
      id: `p-${Date.now()}`,
      name: newProd.name || 'Produk Baru',
      category: newProd.category || 'Pastry & Croissant',
      price: newProd.price || 20000,
      costPrice: newProd.costPrice || 8000,
      stock: newProd.stock || 10,
      minStock: newProd.minStock || 5,
      barcode: newProd.barcode || `899${Math.floor(100000 + Math.random() * 900000)}`,
      image: newProd.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
      recipe: newProd.recipe || [{ rawMaterialId: 'rm-1', amount: 50 }],
      isMarketplaceSynced: true,
    };
    setProducts((prev) => [fullProduct, ...prev]);
  };

  // Add New Raw Material
  const handleAddNewRawMaterial = (newMaterial: Partial<RawMaterial>) => {
    const fullMat: RawMaterial = {
      id: `rm-${Date.now()}`,
      name: newMaterial.name || 'Bahan Baku Baru',
      category: newMaterial.category || 'Tepung & Ragi',
      unit: newMaterial.unit || 'g',
      currentStock: newMaterial.currentStock || 5000,
      minStock: newMaterial.minStock || 2000,
      costPerUnit: newMaterial.costPerUnit || 20,
      supplier: newMaterial.supplier || 'Vendor Grosir',
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setRawMaterials((prev) => [fullMat, ...prev]);
  };

  // Update Recipe BOM
  const handleUpdateRecipe = (productId: string, rawMaterialId: string, newAmount: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedRecipe = p.recipe.map((r) =>
            r.rawMaterialId === rawMaterialId ? { ...r, amount: newAmount } : r
          );
          return { ...p, recipe: updatedRecipe };
        }
        return p;
      })
    );
  };

  // Marketplace Toggle Auto Sync
  const handleToggleAutoSync = (channelId: string) => {
    setMarketplaces((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, autoSync: !ch.autoSync } : ch))
    );
  };

  // Marketplace Trigger Manual Sync All
  const handleTriggerSyncAll = async () => {
    const nowDateStr = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
    setMarketplaces((prev) =>
      prev.map((ch) => (ch.isConnected ? { ...ch, lastSyncTime: nowDateStr } : ch))
    );
  };

  // Thermal Bluetooth Printer Connect
  const handleConnectPrinter = async () => {
    const res = await connectBluetoothThermalPrinter();
    if (res.success) {
      setIsBluetoothPrinterConnected(true);
    }
  };

  // Cart calculations for modal
  const cartSubtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.1);
  const cartTotal = cartSubtotal + cartTax;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-gray-900 select-none">
      {/* Top Tablet Navigation */}
      <HeaderNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        lowStockCount={lowStockCount}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        isBluetoothPrinterConnected={isBluetoothPrinterConnected}
        onConnectPrinter={handleConnectPrinter}
      />

      {/* Main Views Container */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'pos' && (
          <PosView
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onAddNewProduct={handleAddNewProduct}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'stock_adjustment' && (
          <StockAdjustmentView
            products={products}
            onUpdateStock={handleUpdateStock}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'inventory' && (
          <RawMaterialsView
            rawMaterials={rawMaterials}
            products={products}
            stockMovements={stockMovements}
            onRestockRawMaterial={handleRestockRawMaterial}
            onAddNewRawMaterial={handleAddNewRawMaterial}
            onUpdateRecipe={handleUpdateRecipe}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            transactions={transactions}
            products={products}
            rawMaterials={rawMaterials}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReportsView
            transactions={transactions}
            rawMaterials={rawMaterials}
            products={products}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceSyncView
            channels={marketplaces}
            products={products}
            onToggleAutoSync={handleToggleAutoSync}
            onTriggerSyncAll={handleTriggerSyncAll}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        subtotal={cartSubtotal}
        tax={cartTax}
        discount={0}
        total={cartTotal}
        currentUser={currentUser}
        onCompletePayment={handleCompletePayment}
      />

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={lastCompletedTransaction}
        onNewTransaction={() => {
          setIsReceiptModalOpen(false);
          setActiveTab('pos');
        }}
        isBluetoothPrinterConnected={isBluetoothPrinterConnected}
      />

      {/* Low Stock Alert Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        rawMaterials={rawMaterials}
        products={products}
        onQuickRestockRaw={handleRestockRawMaterial}
        onQuickRestockProduct={handleQuickRestockProduct}
        onNavigateToInventory={() => setActiveTab('inventory')}
      />

      {/* User Login & Role Switcher Modal (RBAC) */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onSwitchUser={setCurrentUser}
      />
    </div>
  );
}
