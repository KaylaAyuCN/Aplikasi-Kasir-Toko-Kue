import React, { useState, useMemo } from 'react';
import { Product, UserProfile } from '../../types';
import { formatNumber } from '../../utils/formatters';
import {
  Search,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Menu,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';

interface StockAdjustmentViewProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number, reason: string) => void;
  currentUser: UserProfile;
}

export const StockAdjustmentView: React.FC<StockAdjustmentViewProps> = ({
  products,
  onUpdateStock,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [adjustmentDeltas, setAdjustmentDeltas] = useState<{ [productId: string]: number }>({});
  const [adjustmentReason, setAdjustmentReason] = useState('Stock Opname Harian Toko');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const categories = ['Semua', 'Roti Manis', 'Cake & Tart', 'Pastry & Croissant', 'Cookies', 'Minuman'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAdjustDelta = (productId: string, delta: number) => {
    setAdjustmentDeltas((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + delta,
    }));
  };

  const handleSaveAdjustment = (productId: string) => {
    const delta = adjustmentDeltas[productId] || 0;
    if (delta === 0) return;

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const updatedStock = Math.max(0, prod.stock + delta);
    onUpdateStock(productId, updatedStock, adjustmentReason);

    // Clear delta
    setAdjustmentDeltas((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleSaveAllAdjustments = () => {
    Object.entries(adjustmentDeltas).forEach(([productId, delta]) => {
      if (delta !== 0) {
        const prod = products.find((p) => p.id === productId);
        if (prod) {
          const updatedStock = Math.max(0, prod.stock + delta);
          onUpdateStock(productId, updatedStock, adjustmentReason);
        }
      }
    });
    setAdjustmentDeltas({});
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const totalPendingAdjustments = Object.values(adjustmentDeltas).filter((d) => d !== 0).length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          Penyesuaian stok berhasil disimpan ke buku stok!
        </div>
      )}

      {/* LEFT PANEL: Exact Match to screenshot's "Penyesuaian Stok" table */}
      <div className="w-full lg:w-[360px] xl:w-[400px] bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-xs z-10">
        {/* Title bar identical to screenshot */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Menu className="w-5 h-5 text-gray-700 cursor-pointer" />
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              Penyesuaian Stok
            </h1>
          </div>
          {totalPendingAdjustments > 0 && (
            <button
              onClick={handleSaveAllAdjustments}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan ({totalPendingAdjustments})
            </button>
          )}
        </div>

        {/* Reason Selector */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
            Alasan:
          </span>
          <select
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
            className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Stock Opname Harian Toko">Stock Opname Harian Toko</option>
            <option value="Koreksi Baking Segar">Koreksi Baking Segar Dapur</option>
            <option value="Kue Rusak / Kadaluarsa">Kue Rusak / Display Kadaluarsa</option>
            <option value="Sampel / Tester Pelanggan">Sampel / Tester Pelanggan</option>
          </select>
        </div>

        {/* Items List (Matching "Black Burger 22 pcs", "Nama Item..." format from screenshot) */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {products.map((p) => {
            const isSelected = selectedProductId === p.id;
            const delta = adjustmentDeltas[p.id] || 0;
            const effectiveStock = p.stock + delta;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 pr-3">
                  <div className="font-bold text-sm text-gray-900 line-clamp-1">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Kategori: {p.category}
                  </div>
                  {delta !== 0 && (
                    <div className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                      <span>Penyesuaian: {delta > 0 ? `+${delta}` : delta} pcs</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveAdjustment(p.id);
                        }}
                        className="underline text-emerald-800 hover:text-emerald-900 ml-1"
                      >
                        (Simpan)
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-sm text-gray-900">
                    {effectiveStock} pcs
                  </span>
                  {delta !== 0 && (
                    <div className="text-[10px] text-gray-400 line-through">
                      Awal: {p.stock} pcs
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Search, Category Pills, and Grid from image */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5 space-y-4">
        {/* Search bar identical to image */}
        <div className="bg-white rounded-2xl p-2.5 shadow-2xs border border-gray-200 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk di sini"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-transparent placeholder-gray-400 text-gray-800 focus:outline-none"
            />
          </div>
          <div className="border-l border-gray-200 pl-3 pr-1 text-gray-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Category Pills (Identical to image: [✓ Semua] [Makanan] [Minuman] ...) */}
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

        {/* Product Grid with Stock Badges & Fast Adjusters (like in screenshot) */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
            {filteredProducts.map((p) => {
              const delta = adjustmentDeltas[p.id] || 0;
              const displayStock = p.stock + delta;
              const isNegative = displayStock < 0 || delta < 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  {/* Photo */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2.5 flex items-center justify-center relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title */}
                  <div className="text-center mb-2">
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-1">
                      {p.name}
                    </h3>
                    {/* Stock number with color matching the image (-22 pcs in red, 5 pcs in black/gray) */}
                    <div
                      className={`text-xs font-extrabold mt-0.5 ${
                        delta < 0 || displayStock <= 5
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {delta !== 0 ? (
                        <span>
                          {displayStock} pcs ({delta > 0 ? `+${delta}` : delta})
                        </span>
                      ) : (
                        <span>{p.stock} pcs</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Adjust +/- Buttons */}
                  <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleAdjustDelta(p.id, -1)}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-700 active:scale-95 text-gray-700 flex items-center justify-center font-bold transition-all"
                      title="Kurangi 1 pcs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustDelta(p.id, 1)}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 active:scale-95 text-gray-700 flex items-center justify-center font-bold transition-all"
                      title="Tambah 1 pcs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustDelta(p.id, 5)}
                      className="px-2 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 active:scale-95 text-[11px] font-bold transition-all"
                      title="Tambah 5 pcs (1 Batch Baking)"
                    >
                      +5
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Plus Card identical to image */}
            <div
              onClick={() => {
                const name = prompt('Masukkan nama item penyesuaian khusus:');
                if (name) {
                  alert(`Item "${name}" siap disesuaikan di daftar.`);
                }
              }}
              className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-500 p-3 flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all hover:bg-emerald-50/30 group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 group-hover:scale-110 flex items-center justify-center transition-all">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
