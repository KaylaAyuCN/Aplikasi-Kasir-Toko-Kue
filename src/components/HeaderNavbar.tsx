import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  Store,
  SlidersHorizontal,
  Wheat,
  BarChart3,
  FileSpreadsheet,
  Globe2,
  Bell,
  Printer,
  ChevronDown,
  Clock,
  Bluetooth
} from 'lucide-react';

export type ActiveTab = 'pos' | 'stock_adjustment' | 'inventory' | 'analytics' | 'reports' | 'marketplace';

interface HeaderNavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onOpenUserModal: () => void;
  lowStockCount: number;
  onOpenNotificationModal: () => void;
  isBluetoothPrinterConnected: boolean;
  onConnectPrinter: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onOpenUserModal,
  lowStockCount,
  onOpenNotificationModal,
  isBluetoothPrinterConnected,
  onConnectPrinter,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'pos', label: 'Kasir POS', icon: <Store className="w-4 h-4" /> },
    { id: 'stock_adjustment', label: 'Penyesuaian Stok', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'inventory', label: 'Stok Bahan & Resep', icon: <Wheat className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analitik Penjualan', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'reports', label: 'Laporan Bulanan', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'marketplace', label: 'Marketplace Sync', icon: <Globe2 className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs select-none">
      {/* Tablet status top bar accent (like the Android / iPad top frame in screenshot) */}
      <div className="bg-emerald-700 h-1.5 w-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-900/20">
              <span className="font-extrabold text-lg tracking-tighter">DR</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-gray-900">
                  DAPUR RASA
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md tracking-wider uppercase">
                  Bakery POS
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Artisanal Bakery & Patisserie
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right utility buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Clock display */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{currentTime}</span>
            </div>

            {/* Thermal Printer Button */}
            <button
              onClick={onConnectPrinter}
              title={isBluetoothPrinterConnected ? 'Printer Thermal Bluetooth Aktif' : 'Sambungkan Printer Bluetooth'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isBluetoothPrinterConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Bluetooth className={`w-3.5 h-3.5 ${isBluetoothPrinterConnected ? 'text-emerald-600' : 'text-gray-400'}`} />
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isBluetoothPrinterConnected ? 'BT-58 Siap' : 'Hubungkan Printer'}
              </span>
            </button>

            {/* Low-stock Notification Button with counter */}
            <button
              onClick={onOpenNotificationModal}
              title="Notifikasi Stok Rendah"
              className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                  {lowStockCount}
                </span>
              )}
            </button>

            {/* User Profile / Switch role button */}
            <button
              onClick={onOpenUserModal}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover border border-emerald-200"
              />
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-gray-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-semibold text-emerald-800 capitalize leading-none">
                  {currentUser.role === 'admin' ? 'Pemilik (Admin)' : 'Kasir Shift'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
