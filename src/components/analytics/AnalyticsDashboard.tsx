import React, { useState } from 'react';
import { Transaction, Product, RawMaterial } from '../../types';
import { formatRupiah, formatNumber, formatDateTime } from '../../utils/formatters';
import {
  TrendingUp,
  Banknote,
  ShoppingBag,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  Sparkles,
  PieChart,
  CircleDollarSign
} from 'lucide-react';

interface AnalyticsDashboardProps {
  transactions: Transaction[];
  products: Product[];
  rawMaterials: RawMaterial[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  transactions,
  products,
  rawMaterials,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');

  // Filter transactions based on range
  const now = new Date('2026-10-28T23:59:59Z').getTime();
  const filteredTx = transactions.filter((tx) => {
    const txTime = new Date(tx.date).getTime();
    if (timeRange === 'today') {
      return (now - txTime) <= 24 * 3600 * 1000;
    } else if (timeRange === '7days') {
      return (now - txTime) <= 7 * 24 * 3600 * 1000;
    }
    return true; // 30 days
  });

  // KPI calculations
  const totalRevenue = filteredTx.reduce((acc, t) => acc + t.total, 0);
  const totalCOGS = filteredTx.reduce((acc, t) => acc + t.totalCost, 0);
  const totalTax = filteredTx.reduce((acc, t) => acc + t.tax, 0);
  const grossProfit = totalRevenue - totalTax - totalCOGS;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';
  const aov = filteredTx.length > 0 ? Math.round(totalRevenue / filteredTx.length) : 0;

  // Hourly / Day sales distribution
  const hourlyData = [
    { hour: '08:00', sales: 180000 },
    { hour: '10:00', sales: 420000 },
    { hour: '12:00', sales: 650000 },
    { hour: '14:00', sales: 380000 },
    { hour: '16:00', sales: 890000 },
    { hour: '18:00', sales: 740000 },
    { hour: '20:00', sales: 510000 },
  ];

  // Payment Breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {
    qris: { count: 0, total: 0 },
    cash: { count: 0, total: 0 },
    ewallet: { count: 0, total: 0 },
    transfer: { count: 0, total: 0 },
  };

  filteredTx.forEach((tx) => {
    if (!paymentBreakdown[tx.paymentMethod]) {
      paymentBreakdown[tx.paymentMethod] = { count: 0, total: 0 };
    }
    paymentBreakdown[tx.paymentMethod].count += 1;
    paymentBreakdown[tx.paymentMethod].total += tx.total;
  });

  // Top Selling Products Leaderboard
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number; image: string }> = {};
  filteredTx.forEach((tx) => {
    tx.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        const prod = products.find((p) => p.id === item.productId);
        productSalesMap[item.productId] = {
          name: item.productName,
          qty: 0,
          revenue: 0,
          image: prod?.image || '',
        };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const maxHourly = Math.max(...hourlyData.map((d) => d.sales), 1);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-700" />
            Dasbor Analitik Penjualan Real-Time
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Performa omset, margin keuntungan, tren jam ramai, dan item terlaris toko kue
          </p>
        </div>

        {/* Time range pills */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-gray-200 shadow-2xs">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'today'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '7days'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '30days'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Omset */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan (Gross)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +18.4% dibandingkan periode lalu
          </div>
        </div>

        {/* Card 2: Laba Kotor */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Estimasi Laba Kotor</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {formatRupiah(grossProfit)}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            Margin Laba: <strong className="text-emerald-700">{profitMargin}%</strong> (HPP: {formatRupiah(totalCOGS)})
          </div>
        </div>

        {/* Card 3: Transaksi */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {filteredTx.length} Nota
          </div>
          <div className="text-[11px] text-gray-500">
            Rata-rata keranjang (AOV): <strong>{formatRupiah(aov)}</strong>
          </div>
        </div>

        {/* Card 4: Inventory Health */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Kesehatan Inventaris</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {rawMaterials.filter(r => r.currentStock > r.minStock).length} / {rawMaterials.length}
          </div>
          <div className="text-[11px] text-gray-500">
            Bahan baku di atas batas aman (91%)
          </div>
        </div>
      </div>

      {/* Visual Chart & Payment Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hourly Sales Visual Bar/Curve Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                Tren Penjualan & Jam Puncak Belanja (Peak Hours)
              </h2>
              <p className="text-[11px] text-gray-400">
                Puncak transaksi biasanya terjadi pada pukul 12:00 (Makan Siang) dan 16:00 (Afternoon Tea)
              </p>
            </div>
          </div>

          {/* SVG Bar / Area visualization */}
          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end justify-between gap-3 px-2">
              {hourlyData.map((d, idx) => {
                const heightPercent = Math.round((d.sales / maxHourly) * 100);
                const isPeak = heightPercent > 80;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded shadow-2xs">
                      {formatRupiah(d.sales)}
                    </div>
                    <div
                      className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 relative ${
                        isPeak
                          ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-md shadow-emerald-700/20'
                          : 'bg-emerald-100 group-hover:bg-emerald-300'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {isPeak && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 rounded-full whitespace-nowrap">
                          🔥 Ramai
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 group-hover:text-gray-900">
                      {d.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Payment Method Breakdown */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-700" />
              Metode Pembayaran
            </h2>
            <p className="text-[11px] text-gray-400">Distribusi kasir vs digital payment</p>
          </div>

          <div className="space-y-3 py-2">
            {[
              { key: 'qris', label: 'QRIS Digital (BCA, Nobu, Livin)', color: 'bg-emerald-600', text: 'text-emerald-700' },
              { key: 'cash', label: 'Tunai (Cash)', color: 'bg-amber-600', text: 'text-amber-700' },
              { key: 'ewallet', label: 'E-Wallet (GoPay, OVO, Shopee)', color: 'bg-blue-600', text: 'text-blue-700' },
              { key: 'transfer', label: 'Transfer Bank / Virtual Account', color: 'bg-purple-600', text: 'text-purple-700' },
            ].map((method) => {
              const data = paymentBreakdown[method.key] || { count: 0, total: 0 };
              const percent = totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0;
              return (
                <div key={method.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-800">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${method.color}`}></span>
                      {method.label}
                    </span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`${method.color} h-full rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{data.count} transaksi</span>
                    <span className="font-semibold text-gray-600">{formatRupiah(data.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pembayaran Digital (QRIS & E-Wallet) berkontribusi lebih dari 65% dari total omset toko!</span>
          </div>
        </div>
      </div>

      {/* Top 5 Products Leaderboard & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Bakery Products */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            5 Kue & Roti Terlaris (Leaderboard)
          </h2>

          <div className="divide-y divide-gray-100">
            {topProducts.map((p, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-gray-950 shadow-xs'
                        : idx === 1
                        ? 'bg-slate-300 text-gray-900'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">{p.qty} pcs terjual</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-gray-900">{formatRupiah(p.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Live Transactions Feed */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              Aktivitas Transaksi Kasir Terbaru
            </h2>
            <span className="text-[11px] text-gray-400">{filteredTx.length} transaksi tercatat</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">No. Nota</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Kasir</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTx.slice(0, 6).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900 text-[11px]">
                      {tx.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-[11px]">
                      {formatDateTime(tx.date)}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 font-medium">{tx.cashierName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-gray-900">
                      {formatRupiah(tx.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
