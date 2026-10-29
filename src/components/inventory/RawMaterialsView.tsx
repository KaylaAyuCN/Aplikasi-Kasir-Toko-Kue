import React, { useState } from 'react';
import { RawMaterial, Product, StockMovement, UserProfile } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import {
  Wheat,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  History,
  TrendingDown,
  Building,
  Scale,
  Edit3,
  X,
  Search
} from 'lucide-react';

interface RawMaterialsViewProps {
  rawMaterials: RawMaterial[];
  products: Product[];
  stockMovements: StockMovement[];
  onRestockRawMaterial: (id: string, amount: number, costPerUnit?: number, notes?: string) => void;
  onAddNewRawMaterial: (newMaterial: Partial<RawMaterial>) => void;
  onUpdateRecipe: (productId: string, rawMaterialId: string, newAmount: number) => void;
  currentUser: UserProfile;
}

export const RawMaterialsView: React.FC<RawMaterialsViewProps> = ({
  rawMaterials,
  products,
  stockMovements,
  onRestockRawMaterial,
  onAddNewRawMaterial,
  onUpdateRecipe,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'recipes' | 'history'>('materials');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'flour' | 'dairy'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedMaterialForRestock, setSelectedMaterialForRestock] = useState<RawMaterial | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(1000);
  const [restockNotes, setRestockNotes] = useState('Penerimaan PO Supplier');

  // Add Material Modal
  const [addMaterialModalOpen, setAddMaterialModalOpen] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<RawMaterial['category']>('Tepung & Ragi');
  const [newMatUnit, setNewMatUnit] = useState<RawMaterial['unit']>('g');
  const [newMatStock, setNewMatStock] = useState<number>(5000);
  const [newMatMinStock, setNewMatMinStock] = useState<number>(2000);
  const [newMatCost, setNewMatCost] = useState<number>(25);
  const [newMatSupplier, setNewMatSupplier] = useState('');

  // Selected Recipe Inspector
  const [selectedRecipeProductId, setSelectedRecipeProductId] = useState<string>(products[0]?.id || '');

  // Filter raw materials
  const filteredMaterials = rawMaterials.filter((rm) => {
    const matchesSearch = rm.name.toLowerCase().includes(searchQuery.toLowerCase()) || rm.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedFilter === 'critical') return rm.currentStock <= rm.minStock;
    if (selectedFilter === 'flour') return rm.category === 'Tepung & Ragi';
    if (selectedFilter === 'dairy') return rm.category === 'Dairy & Butter';
    return true;
  });

  const lowStockCount = rawMaterials.filter((rm) => rm.currentStock <= rm.minStock).length;
  const totalRawValue = rawMaterials.reduce((acc, rm) => acc + rm.currentStock * rm.costPerUnit, 0);

  const selectedProduct = products.find((p) => p.id === selectedRecipeProductId) || products[0];

  // Calculated HPP from current recipe
  const calculatedRecipeHPP = selectedProduct?.recipe.reduce((acc, rItem) => {
    const raw = rawMaterials.find((rm) => rm.id === rItem.rawMaterialId);
    return acc + (raw ? raw.costPerUnit * rItem.amount : 0);
  }, 0) || 0;

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialForRestock || restockAmount <= 0) return;
    onRestockRawMaterial(selectedMaterialForRestock.id, restockAmount, selectedMaterialForRestock.costPerUnit, restockNotes);
    setRestockModalOpen(false);
    setSelectedMaterialForRestock(null);
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) return;
    onAddNewRawMaterial({
      name: newMatName,
      category: newMatCategory,
      unit: newMatUnit,
      currentStock: newMatStock,
      minStock: newMatMinStock,
      costPerUnit: newMatCost,
      supplier: newMatSupplier || 'Vendor Lokal',
      lastRestocked: new Date().toISOString().split('T')[0],
    });
    setAddMaterialModalOpen(false);
    setNewMatName('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Top Banner & KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="text-xs text-gray-500 font-semibold">Total Item Bahan Baku</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{rawMaterials.length} Jenis</div>
          <div className="text-[11px] text-gray-400 mt-1">Dikelola resep otomatis</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="text-xs text-gray-500 font-semibold">Bahan Hampir Habis</div>
          <div className="text-2xl font-black text-red-600 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>{lowStockCount} Kritis</span>
          </div>
          <div className="text-[11px] text-red-500 mt-1">Perlu reorder segera</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="text-xs text-gray-500 font-semibold">Estimasi Nilai Bahan Baku</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{formatRupiah(totalRawValue)}</div>
          <div className="text-[11px] text-gray-400 mt-1">Aset fisik gudang dapur</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-800 text-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Aksi Cepat</div>
            <div className="text-sm font-bold mt-1">Pengadaan Bahan</div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setAddMaterialModalOpen(true)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Bahan Baru
            </button>
            <button
              onClick={() => {
                const firstCrit = rawMaterials.find(rm => rm.currentStock <= rm.minStock) || rawMaterials[0];
                setSelectedMaterialForRestock(firstCrit);
                setRestockModalOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl text-xs font-extrabold transition-colors"
            >
              Restock Cepat
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl px-4 pt-2 gap-2 shadow-2xs">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'materials'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>Daftar Stok Bahan Baku ({rawMaterials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'recipes'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kelola Resep Kue (BOM & Kalkulator HPP)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Mutasi Stok Bahan Baku</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR BAHAN BAKU */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama bahan atau supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua ({rawMaterials.length})
              </button>
              <button
                onClick={() => setSelectedFilter('critical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedFilter === 'critical'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Hampir Habis ({lowStockCount})
              </button>
              <button
                onClick={() => setSelectedFilter('flour')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'flour'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tepung & Ragi
              </button>
              <button
                onClick={() => setSelectedFilter('dairy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'dairy'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dairy & Butter
              </button>
            </div>
          </div>

          {/* Table of Materials */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Bahan Baku</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Stok Saat Ini</th>
                    <th className="py-3 px-4 text-right">Batas Minimum</th>
                    <th className="py-3 px-4 text-right">Biaya / Satuan</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMaterials.map((rm) => {
                    const isCritical = rm.currentStock <= rm.minStock;
                    return (
                      <tr key={rm.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            {isCritical && (
                              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping"></span>
                            )}
                            <span>{rm.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium">
                            {rm.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`font-black ${
                              isCritical ? 'text-red-600' : 'text-gray-900'
                            }`}
                          >
                            {formatNumber(rm.currentStock)} {rm.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-gray-500">
                          {formatNumber(rm.minStock)} {rm.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-gray-700">
                          {formatRupiah(rm.costPerUnit)} / {rm.unit}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {rm.supplier}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedMaterialForRestock(rm);
                              setRestockModalOpen(true);
                            }}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] transition-colors border border-emerald-200"
                          >
                            + Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESEP KUE (BOM & KALKULATOR HPP) */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Pilih Kue / Roti untuk Melihat Resep
            </h3>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
              {products.map((p) => {
                const isSelected = p.id === selectedProduct.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedRecipeProductId(p.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-gray-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-gray-500">{p.recipe.length} Bahan Baku</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Recipe Details & HPP calculation */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-14 h-14 rounded-xl object-cover border border-emerald-300 shadow-xs"
                />
                <div>
                  <h2 className="text-base font-bold text-gray-900">{selectedProduct.name}</h2>
                  <span className="text-xs text-emerald-700 font-semibold">
                    Harga Jual: {formatRupiah(selectedProduct.price)}
                  </span>
                </div>
              </div>

              {/* HPP Card */}
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-right">
                <div className="text-[11px] text-emerald-800 font-medium">HPP Resep Bahan:</div>
                <div className="text-lg font-black text-emerald-950">
                  {formatRupiah(calculatedRecipeHPP)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Margin Kotor: ~{(((selectedProduct.price - calculatedRecipeHPP) / selectedProduct.price) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Komposisi Bahan per 1 Pcs Kue (Dipotong Otomatis Saat Transaksi)
                </h4>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Bahan Baku</th>
                      <th className="py-2.5 px-3 text-right">Takaran Resep</th>
                      <th className="py-2.5 px-3 text-right">Biaya Bahan</th>
                      <th className="py-2.5 px-3 text-right">Stok Dapur Sisa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedProduct.recipe.map((rItem) => {
                      const mat = rawMaterials.find((rm) => rm.id === rItem.rawMaterialId);
                      const cost = mat ? mat.costPerUnit * rItem.amount : 0;
                      return (
                        <tr key={rItem.rawMaterialId} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-semibold text-gray-800">
                            {mat?.name || 'Bahan tidak ditemukan'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                            {rItem.amount} {mat?.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-700">
                            {formatRupiah(cost)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-500">
                            {mat ? `${formatNumber(mat.currentStock)} ${mat.unit}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              💡 <strong>Integrasi Otomatis:</strong> Setiap kasir menyelesaikan transaksi 1x {selectedProduct.name}, sistem POS secara otomatis mendebet stok bahan-bahan di atas dari inventaris dapur secara proporsional.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOG MUTASI STOK */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Catatan Mutasi Stok Bahan & Kue</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Tipe Mutasi</th>
                  <th className="py-3 px-3">Nama Item</th>
                  <th className="py-3 px-3 text-right">Perubahan</th>
                  <th className="py-3 px-3 text-right">Stok Akhir</th>
                  <th className="py-3 px-3">Keterangan</th>
                  <th className="py-3 px-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">{sm.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          sm.type === 'sale'
                            ? 'bg-blue-50 text-blue-700'
                            : sm.type === 'restock'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {sm.type === 'sale' ? 'Penjualan' : sm.type === 'restock' ? 'Restock Masuk' : 'Penyesuaian'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{sm.itemName}</td>
                    <td className={`py-2.5 px-3 text-right font-black ${sm.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {sm.amount > 0 ? `+${sm.amount}` : sm.amount} {sm.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-800">
                      {sm.stockAfter} {sm.unit}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px]">{sm.notes}</td>
                    <td className="py-2.5 px-3 text-gray-500 text-[11px]">{sm.operatorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Restock Material */}
      {restockModalOpen && selectedMaterialForRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Penerimaan Stok Bahan Baku</h3>
              <button onClick={() => setRestockModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 mt-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-xs font-bold text-gray-800">{selectedMaterialForRestock.name}</div>
                <div className="text-[11px] text-gray-500">
                  Stok Sekarang: {formatNumber(selectedMaterialForRestock.currentStock)} {selectedMaterialForRestock.unit}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Jumlah Masuk ({selectedMaterialForRestock.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Keterangan / No. Faktur PO</label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Simpan Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add New Raw Material */}
      {addMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Tambah Bahan Baku Baru</h3>
              <button onClick={() => setAddMaterialModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Bahan Baku</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Whipping Cream Dairy 35%"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="Tepung & Ragi">Tepung & Ragi</option>
                    <option value="Dairy & Butter">Dairy & Butter</option>
                    <option value="Cokelat & Gula">Cokelat & Gula</option>
                    <option value="Telur & Isian">Telur & Isian</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Satuan</label>
                  <select
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="g">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ml">Mililiter (ml)</option>
                    <option value="l">Liter (l)</option>
                    <option value="butir">Butir</option>
                    <option value="pcs">Pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ambang Batas Minimum</label>
                  <input
                    type="number"
                    min="1"
                    value={newMatMinStock}
                    onChange={(e) => setNewMatMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Harga Beli / Satuan (Rp)</label>
                  <input
                    type="number"
                    min="1"
                    value={newMatCost}
                    onChange={(e) => setNewMatCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    placeholder="Nama vendor/distributor"
                    value={newMatSupplier}
                    onChange={(e) => setNewMatSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddMaterialModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Tambah Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
