import React, { useState } from 'react';
import { Transaction, RawMaterial, Product, UserProfile } from '../../types';
import { formatRupiah, formatNumber, formatDateTime } from '../../utils/formatters';
import { exportMonthlySalesReportPDF, exportMonthlyStockReportPDF } from '../../utils/pdfGenerator';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowDownToLine,
  Filter,
  DollarSign
} from 'lucide-react';

interface MonthlyReportsViewProps {
  transactions: Transaction[];
  rawMaterials: RawMaterial[];
  products: Product[];
  currentUser: UserProfile;
}

export const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({
  transactions,
  rawMaterials,
  products,
  currentUser,
}) => {
  const [reportType, setReportType] = useState<'sales' | 'inventory'>('sales');
  const [selectedMonth, setSelectedMonth] = useState('Oktober 2026');

  // Sales metrics
  const totalOmset = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalHPP = transactions.reduce((acc, t) => acc + t.totalCost, 0);
  const totalTax = transactions.reduce((acc, t) => acc + t.tax, 0);
  const grossProfit = totalOmset - totalTax - totalHPP;
  const marginPercent = totalOmset > 0 ? ((grossProfit / totalOmset) * 100).toFixed(1) : '0';

  // Inventory metrics
  const totalRawValue = rawMaterials.reduce((acc, rm) => acc + rm.currentStock * rm.costPerUnit, 0);
  const totalProductValue = products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
  const criticalCount = rawMaterials.filter((rm) => rm.currentStock <= rm.minStock).length;

  const handleDownloadSalesPDF = () => {
    exportMonthlySalesReportPDF(transactions, selectedMonth, currentUser.name);
  };

  const handleDownloadStockPDF = () => {
    exportMonthlyStockReportPDF(rawMaterials, products, selectedMonth, currentUser.name);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            Laporan Bulanan Otomatis & Unduh PDF
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Laporan resmi toko kue siap cetak dan arsip pembukuan keuangan bulanan
          </p>
        </div>

        {/* Period Selector & PDF Export CTA */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-200 shadow-2xs">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Oktober 2026">Oktober 2026 (Bulan Berjalan)</option>
              <option value="September 2026">September 2026</option>
              <option value="Agustus 2026">Agustus 2026</option>
            </select>
          </div>

          {reportType === 'sales' ? (
            <button
              onClick={handleDownloadSalesPDF}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 shrink-0"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Unduh PDF Penjualan</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadStockPDF}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-amber-900/20 transition-all flex items-center gap-2 shrink-0"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Unduh PDF Stok Gudang</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl px-4 pt-2 gap-2 shadow-2xs">
        <button
          onClick={() => setReportType('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            reportType === 'sales'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Laporan Penjualan & Laba Rugi ({selectedMonth})</span>
        </button>

        <button
          onClick={() => setReportType('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            reportType === 'inventory'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Laporan Stok Bahan Baku & Kue ({selectedMonth})</span>
        </button>
      </div>

      {/* TAB 1: LAPORAN PENJUALAN */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          {/* Summary Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Omset (Gross Revenue)
              </span>
              <div className="text-2xl font-black text-gray-900">{formatRupiah(totalOmset)}</div>
              <div className="text-[11px] text-gray-500">{transactions.length} Transaksi Selesai</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Beban Pokok (HPP)
              </span>
              <div className="text-2xl font-black text-gray-700">{formatRupiah(totalHPP)}</div>
              <div className="text-[11px] text-gray-500">Biaya konsumsi resep bahan</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Laba Kotor (Gross Profit)
              </span>
              <div className="text-2xl font-black text-emerald-900">{formatRupiah(grossProfit)}</div>
              <div className="text-[11px] text-emerald-700 font-bold">Margin Laba Kotor: {marginPercent}%</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Pajak Resto (PB1 10%)
              </span>
              <div className="text-2xl font-black text-blue-800">{formatRupiah(totalTax)}</div>
              <div className="text-[11px] text-gray-500">Kewajiban setoran kas daerah</div>
            </div>
          </div>

          {/* Transactions Table for the Month */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">
                Rincian Transaksi Penjualan - Periode {selectedMonth}
              </h2>
              <span className="text-xs text-gray-500">
                Ditampilkan {transactions.length} data transaksi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-3">No. Nota</th>
                    <th className="py-3 px-3">Tanggal & Waktu</th>
                    <th className="py-3 px-3">Kasir</th>
                    <th className="py-3 px-3">Item Terjual</th>
                    <th className="py-3 px-3">Metode Bayar</th>
                    <th className="py-3 px-3 text-right">Subtotal</th>
                    <th className="py-3 px-3 text-right">HPP</th>
                    <th className="py-3 px-3 text-right">Laba</th>
                    <th className="py-3 px-3 text-right">Total Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">{tx.receiptNumber}</td>
                      <td className="py-3 px-3 text-gray-500 text-[11px]">{formatDateTime(tx.date)}</td>
                      <td className="py-3 px-3 text-gray-700">{tx.cashierName}</td>
                      <td className="py-3 px-3 text-gray-600">
                        {tx.items.map(it => `${it.productName} (${it.quantity}x)`).join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase">
                          {tx.paymentMethod} {tx.paymentDetails.provider ? `(${tx.paymentDetails.provider})` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-600">{formatRupiah(tx.subtotal)}</td>
                      <td className="py-3 px-3 text-right text-gray-500">{formatRupiah(tx.totalCost)}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {formatRupiah(tx.grossProfit)}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-gray-900">{formatRupiah(tx.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAPORAN STOK BULANAN */}
      {reportType === 'inventory' && (
        <div className="space-y-6">
          {/* Summary Inventory Asset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Nilai Aset Bahan Baku (Gudang)
              </span>
              <div className="text-2xl font-black text-emerald-800">{formatRupiah(totalRawValue)}</div>
              <div className="text-[11px] text-gray-500">{rawMaterials.length} Jenis Bahan Terdaftar</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Nilai Aset Produk Jadi (Etalase)
              </span>
              <div className="text-2xl font-black text-gray-900">{formatRupiah(totalProductValue)}</div>
              <div className="text-[11px] text-gray-500">Berdasarkan HPP Kue Siap Jual</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                Item Kritis Perlu Reorder
              </span>
              <div className="text-2xl font-black text-red-700">{criticalCount} Bahan Baku</div>
              <div className="text-[11px] text-red-600 font-semibold">Tercatat di bawah batas minimum</div>
            </div>
          </div>

          {/* Raw Materials Inventory Status Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">
                1. Status Inventaris Bahan Baku Dapur ({selectedMonth})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Bahan Baku</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-right">Batas Reorder</th>
                    <th className="py-3 px-3 text-right">Sisa Stok Akhir</th>
                    <th className="py-3 px-3 text-right">Harga Satuan</th>
                    <th className="py-3 px-3 text-right">Total Nilai Fisik</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rawMaterials.map((rm) => {
                    const isCrit = rm.currentStock <= rm.minStock;
                    return (
                      <tr key={rm.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 font-bold text-gray-900">{rm.name}</td>
                        <td className="py-3 px-3 text-gray-500">{rm.category}</td>
                        <td className="py-3 px-3 text-right text-gray-500">
                          {formatNumber(rm.minStock)} {rm.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-gray-900">
                          {formatNumber(rm.currentStock)} {rm.unit}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-600">{formatRupiah(rm.costPerUnit)}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-800">
                          {formatRupiah(rm.currentStock * rm.costPerUnit)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isCrit ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                              Kritis (Restock)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Aman
                            </span>
                          )}
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
    </div>
  );
};
