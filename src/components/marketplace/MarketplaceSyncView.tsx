import React, { useState } from 'react';
import { MarketplaceChannel, SyncLog, Product, UserProfile } from '../../types';
import {
  Globe2,
  RefreshCw,
  CheckCircle2,
  Clock,
  Key,
  Webhook,
  Activity,
  Layers,
  Sparkles,
  Lock,
  ExternalLink
} from 'lucide-react';

interface MarketplaceSyncViewProps {
  channels: MarketplaceChannel[];
  products: Product[];
  onToggleAutoSync: (channelId: string) => void;
  onTriggerSyncAll: () => Promise<void>;
  currentUser: UserProfile;
}

export const MarketplaceSyncView: React.FC<MarketplaceSyncViewProps> = ({
  channels,
  products,
  onToggleAutoSync,
  onTriggerSyncAll,
  currentUser,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState<string | null>(null);

  const [logs, setLogs] = useState<SyncLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-10-28 18:45:10',
      channel: 'ShopeeFood',
      status: 'success',
      message: '12 varian kue berhasil disinkronkan ke catalog online ShopeeFood.',
      itemsCount: 12,
    },
    {
      id: 'log-2',
      timestamp: '2026-10-28 18:45:12',
      channel: 'GoFood',
      status: 'success',
      message: 'Stok fisik Pain Au Chocolat (5 pcs) & Butter Croissant (22 pcs) diperbarui di Merchant GoFood.',
      itemsCount: 12,
    },
    {
      id: 'log-3',
      timestamp: '2026-10-28 17:30:05',
      channel: 'GrabFood',
      status: 'success',
      message: 'Sinkronisasi rutin GrabFood Merchant API berhasil.',
      itemsCount: 12,
    },
  ]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusText('Menghubungkan ke API Gateway ShopeeFood, GoFood & GrabFood...');

    setTimeout(() => {
      setSyncStatusText('Mendorong stok kue fisik terkini ke etalase online...');
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatusText('✓ Sukses! 12 item kue berhasil disinkronkan ke semua kanal online.');

        const newLog: SyncLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          channel: 'Multi-Channel Push (ShopeeFood, GoFood, GrabFood)',
          status: 'success',
          message: `Stok fisik toko disinkronkan ke 3 marketplace. Tidak ada risiko overselling.`,
          itemsCount: products.length,
        };
        setLogs([newLog, ...logs]);
        onTriggerSyncAll();

        setTimeout(() => setSyncStatusText(null), 4000);
      }, 1000);
    }, 800);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-emerald-700" />
            Integrasi API & Sinkronisasi Stok Marketplace
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Sinkronisasi otomatis stok etalase fisik toko dengan ShopeeFood, GoFood, GrabFood, dan Tokopedia
          </p>
        </div>

        {/* Sync All Button */}
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Semua Stok Sekarang'}</span>
        </button>
      </div>

      {syncStatusText && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatusText}</span>
        </div>
      )}

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className="bg-white rounded-3xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: ch.logoColor }}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-gray-900">{ch.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ch.isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {ch.isConnected ? 'Terhubung (Live)' : 'Belum Terhubung'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Item Terhubung:</span>
                  <span className="font-bold text-gray-800">{ch.syncItemCount} Produk</span>
                </div>
                <div className="flex justify-between">
                  <span>Sync Terakhir:</span>
                  <span className="font-medium text-gray-700">{ch.lastSyncTime}</span>
                </div>
              </div>
            </div>

            {/* Toggle Auto Sync */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-600">Auto-Sync Saat Kasir Jual:</span>
              <button
                type="button"
                onClick={() => onToggleAutoSync(ch.id)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  ch.autoSync ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    ch.autoSync ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Key & Webhook Configuration (RBAC Protected for Admin) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-gray-900">
              Konfigurasi API Gateway & Webhook URL
            </h2>
          </div>
          {!isAdmin && (
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Khusus Otoritas Admin
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Sistem POS Dapur Rasa menyediakan endpoint Webhook standar untuk sinkronisasi inventori dua arah secara real-time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Webhook className="w-4 h-4 text-emerald-600" />
              Production Webhook URL (Inbound Stock Updates)
            </div>
            <div className="font-mono text-xs text-gray-900 bg-white p-2.5 rounded-xl border border-gray-300 break-all select-all">
              https://api.dapurrasa.id/v1/integrations/marketplace/sync
            </div>
            <div className="text-[11px] text-gray-400">
              Menerima order masuk dari GoFood/ShopeeFood & otomatis memotong stok fisik.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              API Secret Bearer Token
            </div>
            <div className="font-mono text-xs text-gray-900 bg-white p-2.5 rounded-xl border border-gray-300 break-all select-all">
              {isAdmin ? 'dr_live_sec_78190283471902837' : '•••••••••••••••••••••••••••• (Terkunci)'}
            </div>
            <div className="text-[11px] text-gray-400">
              Kunci otentikasi aman untuk transmisi data pesanan & inventaris.
            </div>
          </div>
        </div>
      </div>

      {/* Live Sync Log Table */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            Riwayat Sinkronisasi API Marketplace
          </h2>
          <span className="text-xs text-gray-400">Pembaruan otomatis 5 detik</span>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <div>
                  <div className="font-bold text-gray-900">{log.channel}</div>
                  <div className="text-gray-600 text-[11px] mt-0.5">{log.message}</div>
                </div>
              </div>
              <div className="text-right text-[11px] text-gray-400 font-mono shrink-0">
                {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
