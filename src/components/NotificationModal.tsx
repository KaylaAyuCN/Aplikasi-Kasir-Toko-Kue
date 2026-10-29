import React, { useState } from 'react';
import { RawMaterial, Product } from '../types';
import { formatNumber } from '../utils/formatters';
import { AlertTriangle, PlusCircle, CheckCircle2, Package, ArrowRight, X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawMaterials: RawMaterial[];
  products: Product[];
  onQuickRestockRaw: (id: string, amount: number) => void;
  onQuickRestockProduct: (id: string, amount: number) => void;
  onNavigateToInventory: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  rawMaterials,
  products,
  onQuickRestockRaw,
  onQuickRestockProduct,
  onNavigateToInventory,
}) => {
  if (!isOpen) return null;

  const lowStockMaterials = rawMaterials.filter(rm => rm.currentStock <= rm.minStock);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const [restockAmounts, setRestockAmounts] = useState<{ [key: string]: number }>({});

  const handleRestockMaterial = (id: string, defAmount: number) => {
    const qty = restockAmounts[id] || defAmount;
    onQuickRestockRaw(id, qty);
  };

  const handleRestockProduct = (id: string, defAmount: number) => {
    const qty = restockAmounts[id] || defAmount;
    onQuickRestockProduct(id, qty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pusat Notifikasi Stok Rendah</h2>
              <p className="text-xs text-amber-100">
                {lowStockMaterials.length} bahan baku & {lowStockProducts.length} produk kue di bawah batas minimum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Bahan Baku Kritis */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                Bahan Baku Kritis ({lowStockMaterials.length})
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToInventory();
                }}
                className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1"
              >
                Buka Inventaris Bahan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {lowStockMaterials.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Semua bahan baku dapur dalam level aman. Tidak ada reorder yang mendesak.
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockMaterials.map(rm => {
                  const percent = Math.min(100, Math.round((rm.currentStock / rm.minStock) * 100));
                  return (
                    <div
                      key={rm.id}
                      className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{rm.name}</span>
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            Sisa {formatNumber(rm.currentStock)} {rm.unit} (Min: {formatNumber(rm.minStock)} {rm.unit})
                          </span>
                        </div>
                        <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden mb-1">
                          <div
                            className="bg-red-500 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Supplier: {rm.supplier}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder={`+${rm.unit === 'g' || rm.unit === 'ml' ? '1000' : '10'}`}
                          className="w-24 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                          value={restockAmounts[rm.id] || ''}
                          onChange={(e) =>
                            setRestockAmounts({
                              ...restockAmounts,
                              [rm.id]: Number(e.target.value),
                            })
                          }
                        />
                        <button
                          onClick={() => handleRestockMaterial(rm.id, rm.unit === 'g' || rm.unit === 'ml' ? 2000 : 20)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Restock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Produk Kue Kritis */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                Stok Kue Display Menipis ({lowStockProducts.length})
              </h3>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Stok display semua varian kue mencukupi untuk etalase hari ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {lowStockProducts.map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-amber-200 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</div>
                        <div className="text-[11px] text-red-600 font-semibold">
                          Sisa {p.stock} pcs (Min: {p.minStock})
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestockProduct(p.id, 10)}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      +10 pcs
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Peringatan otomatis diperbarui setiap ada penjualan atau penerimaan bahan.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
