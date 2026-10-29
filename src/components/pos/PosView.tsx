import React, { useState, useMemo } from 'react';
import { Product, CartItem, UserProfile } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Percent,
  Receipt,
  Sparkles,
  Layers,
  Check,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface PosViewProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onOpenPaymentModal: () => void;
  onAddNewProduct: (newProd: Partial<Product>) => void;
  currentUser: UserProfile;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  onOpenPaymentModal,
  onAddNewProduct,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Pastry & Croissant');
  const [newPrice, setNewPrice] = useState<number>(25000);
  const [newCost, setNewCost] = useState<number>(10000);
  const [newStock, setNewStock] = useState<number>(20);

  const categories = ['Semua', 'Roti Manis', 'Cake & Tart', 'Pastry & Croissant', 'Cookies', 'Minuman'];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Calculations
  const rawSubtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const afterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Math.round(afterDiscount * 0.1); // PB1 10%
  const grandTotal = afterDiscount + taxAmount;
  const totalItemCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddNewProduct({
      name: newName,
      category: newCategory,
      price: newPrice,
      costPrice: newCost,
      stock: newStock,
      minStock: 5,
      barcode: `899${Math.floor(100000 + Math.random() * 900000)}`,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
      recipe: [
        { rawMaterialId: 'rm-1', amount: 50 },
        { rawMaterialId: 'rm-2', amount: 20 },
      ],
      isMarketplaceSynced: true,
    });
    setNewName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
      {/* LEFT COLUMN: ORDER BASKET / KERANJANG (Inspired by the left panel of the tablet POS) */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-xs z-10">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Pesanan Pelanggan</h2>
              <span className="text-[11px] text-gray-500">{totalItemCount} item dalam keranjang</span>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Receipt className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-600">Keranjang Masih Kosong</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Pilih menu roti atau kue di katalog sebelah kanan untuk menambahkan pesanan.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const isOverStock = item.quantity > item.product.stock;
              return (
                <div
                  key={item.product.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isOverStock
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-gray-200 bg-white hover:border-emerald-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-bold text-xs text-gray-900 leading-snug">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        {formatRupiah(item.product.price)}
                      </div>
                      {isOverStock && (
                        <div className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" />
                          Melebihi stok display ({item.product.stock} pcs)
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-xs text-gray-900">
                        {formatRupiah(item.product.price * item.quantity)}
                      </div>
                    </div>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">
                      Sisa stok: {item.product.stock} pcs
                    </span>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(item.product.id, -1)}
                        className="w-6 h-6 rounded-md bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs shadow-2xs transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateCartQty(item.product.id, 1)}
                        className="w-6 h-6 rounded-md bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs shadow-2xs transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveFromCart(item.product.id)}
                        className="w-6 h-6 rounded-md text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors ml-1"
                        title="Hapus item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Calculation & Action Footer */}
        <div className="p-4 border-t border-gray-200 bg-white space-y-3">
          {/* Quick Discount toggle */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => setIsDiscountOpen(!isDiscountOpen)}
              className="text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <Percent className="w-3.5 h-3.5" />
              {discountPercent > 0 ? `Diskon Promo (${discountPercent}%)` : '+ Tambah Diskon'}
            </button>
            {discountPercent > 0 && (
              <span className="text-red-600 font-bold">-{formatRupiah(discountAmount)}</span>
            )}
          </div>

          {isDiscountOpen && (
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-1.5 animate-in fade-in">
              <span className="text-xs text-gray-500 font-medium">Diskon:</span>
              {[0, 5, 10, 15, 20].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setDiscountPercent(rate)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    discountPercent === rate
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {rate === 0 ? '0%' : `${rate}%`}
                </button>
              ))}
            </div>
          )}

          {/* Breakdown numbers */}
          <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-800">{formatRupiah(rawSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak Resto (PB1 10%):</span>
              <span className="font-semibold text-gray-800">{formatRupiah(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-200">
              <span>Total Bayar:</span>
              <span className="text-lg text-emerald-800">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={onOpenPaymentModal}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 disabled:opacity-40 disabled:pointer-events-none text-white rounded-2xl font-extrabold text-sm shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: CATALOG & SEARCH & PILLS (Directly matching the tablet POS photo layout) */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5 space-y-4">
        {/* Top Search bar matching reference: "Cari produk di sini" */}
        <div className="bg-white rounded-2xl p-2.5 shadow-2xs border border-gray-200 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk di sini (nama kue, roti, atau barcode)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-transparent placeholder-gray-400 text-gray-800 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                Reset
              </button>
            )}
          </div>
          <div className="border-l border-gray-200 pl-3 pr-1 text-gray-400 cursor-pointer">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Category Selector Pills (Inspired by the green checkmarked pill: [✓ Semua] [Makanan] [Minuman] ...) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-600'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid (Matching the reference layout) */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock <= p.minStock;
              const isOutOfStock = p.stock <= 0;

              return (
                <div
                  key={p.id}
                  onClick={() => onAddToCart(p)}
                  className={`bg-white rounded-2xl border p-3 flex flex-col justify-between transition-all cursor-pointer group hover:shadow-md hover:scale-[1.01] active:scale-98 ${
                    isLowStock
                      ? 'border-amber-200 hover:border-amber-400'
                      : 'border-gray-200 hover:border-emerald-500'
                  }`}
                >
                  {/* Image */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2.5 relative flex items-center justify-center">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Badge Stock (like in the screenshot: 5 pcs, -22 pcs) */}
                    <div
                      className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[11px] font-extrabold shadow-xs ${
                        isLowStock
                          ? 'bg-red-600 text-white'
                          : 'bg-black/60 backdrop-blur-xs text-white'
                      }`}
                    >
                      {p.stock} pcs
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-emerald-800">
                        {formatRupiah(p.price)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Custom Pastry '+' Card (Identical to green '+' card in image) */}
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 p-3 flex flex-col items-center justify-center min-h-[180px] cursor-pointer transition-all hover:bg-emerald-50/40 group active:scale-98"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-emerald-800 mt-2">Tambah Menu Kue</span>
              <span className="text-[10px] text-gray-400 text-center mt-0.5">Custom / Varian Baru</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add New Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 p-6 animate-in fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-1">Tambah Menu Baru Toko</h3>
            <p className="text-xs text-gray-500 mb-4">Tambahkan item kue atau minuman ke katalog kasir.</p>

            <form onSubmit={handleCreateProductSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Kue / Minuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Danish Cinnamon Roll"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {categories.filter((c) => c !== 'Semua').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stok Display Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
