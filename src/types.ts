export type Role = 'admin' | 'cashier';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  pin: string;
  avatar: string;
  email: string;
  shift: string;
}

export type UnitType = 'g' | 'kg' | 'ml' | 'l' | 'butir' | 'pcs' | 'lembar';

export interface RawMaterial {
  id: string;
  name: string;
  category: 'Tepung & Ragi' | 'Dairy & Butter' | 'Cokelat & Gula' | 'Telur & Isian' | 'Packaging';
  unit: UnitType;
  currentStock: number;
  minStock: number; // Low stock alert threshold
  costPerUnit: number; // Cost in IDR per unit
  supplier: string;
  lastRestocked: string;
}

export interface RecipeItem {
  rawMaterialId: string;
  amount: number; // Amount in rawMaterial's unit
}

export interface Product {
  id: string;
  name: string;
  category: 'Semua' | 'Roti Manis' | 'Cake & Tart' | 'Pastry & Croissant' | 'Cookies' | 'Minuman';
  price: number; // Selling price in IDR
  costPrice: number; // HPP (Harga Pokok Penjualan)
  stock: number; // Current physical stock
  minStock: number; // Low stock threshold for finished cake
  image: string;
  barcode: string;
  recipe: RecipeItem[];
  isMarketplaceSynced: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  customDiscountPercent?: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'ewallet' | 'transfer';

export interface Transaction {
  id: string;
  receiptNumber: string;
  date: string; // ISO string
  cashierId: string;
  cashierName: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    costPrice: number;
    quantity: number;
    subtotal: number;
    notes?: string;
  }[];
  subtotal: number;
  tax: number; // 10% PB1
  discount: number;
  total: number;
  totalCost: number; // Total HPP
  grossProfit: number;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    cashGiven?: number;
    change?: number;
    provider?: string; // BCA, Mandiri, GoPay, OVO, ShopeePay, DANA
    refNumber?: string;
  };
  customerName?: string;
  customerPhone?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'sale' | 'restock' | 'adjustment' | 'spoilage';
  itemType: 'product' | 'raw_material';
  itemId: string;
  itemName: string;
  amount: number; // positive for addition, negative for deduction
  stockBefore: number;
  stockAfter: number;
  unit: string;
  notes: string;
  operatorName: string;
}

export interface MarketplaceChannel {
  id: string;
  name: 'ShopeeFood' | 'GoFood' | 'GrabFood' | 'Tokopedia';
  logoColor: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncTime: string;
  apiKey: string;
  webhookUrl: string;
  syncItemCount: number;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  channel: string;
  status: 'success' | 'syncing' | 'failed';
  message: string;
  itemsCount: number;
}
