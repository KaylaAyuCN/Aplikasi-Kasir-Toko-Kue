import React, { useState } from 'react';
import { UserProfile, Role } from '../../types';
import { ShieldCheck, UserCheck, Lock, KeyRound, AlertCircle, Check, X } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  users: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSwitchUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile>(currentUser);
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleKeypadClick = (val: string) => {
    if (enteredPin.length < 6) {
      setEnteredPin(prev => prev + val);
      setErrorMessage('');
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleVerifyPin = () => {
    if (enteredPin === selectedUser.pin) {
      setSuccessMessage(`Berhasil login sebagai ${selectedUser.name}!`);
      setTimeout(() => {
        onSwitchUser(selectedUser);
        onClose();
        setEnteredPin('');
        setSuccessMessage('');
      }, 500);
    } else {
      setErrorMessage('PIN Salah! Silakan coba lagi. (Admin PIN: 8888, Kasir: 1234)');
      setEnteredPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Otoritas & Ganti Akun Kasir</h2>
              <p className="text-xs text-emerald-200">Sistem Keamanan Berbasis Level Akses (RBAC)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User selector cards */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
              Pilih Pengguna / Shift Kasir
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {users.map(u => {
                const isSelected = selectedUser.id === u.id;
                const isCurrent = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u);
                      setEnteredPin('');
                      setErrorMessage('');
                    }}
                    type="button"
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col items-center sm:items-start ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/30'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-2 right-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md font-bold">
                        Aktif
                      </span>
                    )}
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40 mb-2"
                    />
                    <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                    <div className="text-[11px] font-semibold text-emerald-800 capitalize flex items-center gap-1">
                      {u.role === 'admin' ? (
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                          Admin / Owner
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">
                          Kasir
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{u.shift}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions preview info */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
            <div className="font-bold text-gray-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Tingkat Izin: {selectedUser.role === 'admin' ? 'Pemilik / Admin (Full Access)' : 'Kasir Toko (Terbatas)'}
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              {selectedUser.role === 'admin'
                ? '✓ Akses penuh seluruh transaksi POS, penyesuaian stok bahan, kalkulasi HPP kue, laporan keuangan bulanan, unduh PDF, integrasi API marketplace, dan pengaturan staf.'
                : '✓ Akses transaksi POS kasir, pembayaran tunai/digital, cetak struk thermal bluetooth, penyesuaian stok display harian. (Menu modal HPP dan konfigurasi API dikunci demi keamanan).'}
            </p>
          </div>

          {/* PIN Input Keypad */}
          <div className="max-w-xs mx-auto text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600">
              <Lock className="w-3.5 h-3.5" />
              Masukkan PIN Otoritas {selectedUser.name}
            </div>

            {/* PIN Dots */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    enteredPin.length > i
                      ? 'bg-emerald-600 border-emerald-600 scale-110'
                      : 'border-gray-300 bg-gray-100'
                  }`}
                />
              ))}
            </div>

            {errorMessage && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-xl flex items-center justify-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl flex items-center justify-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                {successMessage}
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadClick(num)}
                  className="py-3 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 active:scale-95 rounded-2xl font-bold text-lg text-gray-800 transition-all shadow-xs"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 bg-gray-100 hover:bg-red-50 hover:text-red-700 active:scale-95 rounded-2xl font-semibold text-xs text-gray-600 transition-all flex items-center justify-center"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => handleKeypadClick('0')}
                className="py-3 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 active:scale-95 rounded-2xl font-bold text-lg text-gray-800 transition-all shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleVerifyPin}
                disabled={enteredPin.length < 4}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none active:scale-95 rounded-2xl font-bold text-xs text-white transition-all shadow-md flex items-center justify-center gap-1"
              >
                <KeyRound className="w-4 h-4" /> Masuk
              </button>
            </div>

            <div className="text-[11px] text-gray-400 pt-2">
              Default Demo PIN: Admin = <span className="font-mono font-bold text-gray-700">8888</span> | Kasir = <span className="font-mono font-bold text-gray-700">1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
