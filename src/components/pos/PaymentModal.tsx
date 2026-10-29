import React, { useState } from 'react';
import { CartItem, PaymentMethod, UserProfile } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import {
  Banknote,
  QrCode,
  Smartphone,
  Building2,
  CheckCircle2,
  Calculator,
  Copy,
  Check,
  X,
  CreditCard
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currentUser: UserProfile;
  onCompletePayment: (paymentMethod: PaymentMethod, paymentDetails: any, customerName?: string, customerPhone?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cart,
  subtotal,
  tax,
  discount,
  total,
  currentUser,
  onCompletePayment,
}) => {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(total);
  const [selectedWallet, setSelectedWallet] = useState<'GoPay' | 'OVO' | 'ShopeePay' | 'DANA'>('GoPay');
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'Mandiri' | 'BRI' | 'BNI'>('BCA');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [copiedVA, setCopiedVA] = useState(false);

  if (!isOpen) return null;

  const change = Math.max(0, cashGiven - total);
  const isCashSufficient = cashGiven >= total;

  const quickCashOptions = [
    total,
    50000,
    100000,
    150000,
    200000,
    500000,
  ].filter((val, idx, arr) => arr.indexOf(val) === idx && val >= total);

  // If filtered list is small, ensure at least total, total rounded up to next 50k, 100k
  const next50k = Math.ceil(total / 50000) * 50000;
  const next100k = Math.ceil(total / 100000) * 100000;
  const uniqueQuickCash = Array.from(new Set([total, next50k, next100k, 200000, 500000])).filter(v => v >= total).slice(0, 5);

  const virtualAccountNumbers: Record<string, string> = {
    BCA: '8801 2938 1092 3810',
    Mandiri: '8910 8271 9023 1182',
    BRI: '1280 0019 2831 9821',
    BNI: '9880 1827 3819 2819',
  };

  const handleFinish = (method: PaymentMethod, details: any) => {
    // Fire confetti for satisfying POS completion
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onCompletePayment(method, details, customerName, customerPhone);
  };

  const handleCopyVA = () => {
    navigator.clipboard?.writeText(virtualAccountNumbers[selectedBank]);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
              Pembayaran Kasir Dapur Rasa
            </div>
            <div className="text-xl font-extrabold flex items-center gap-2">
              <span>Total Tagihan:</span>
              <span className="text-amber-300">{formatRupiah(total)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveMethod('cash')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeMethod === 'cash'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Tunai (Cash)</span>
          </button>

          <button
            onClick={() => setActiveMethod('qris')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeMethod === 'qris'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QRIS Digital</span>
          </button>

          <button
            onClick={() => setActiveMethod('ewallet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeMethod === 'ewallet'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>E-Wallet</span>
          </button>

          <button
            onClick={() => setActiveMethod('transfer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeMethod === 'transfer'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Transfer Bank / VA</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: TUNAI (CASH) */}
          {activeMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Uang Diterima dari Pelanggan
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-gray-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-3 text-2xl font-extrabold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:border-emerald-600 focus:bg-white focus:outline-none text-right"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className="text-xs font-semibold text-gray-500 block mb-2">
                  Pilihan Cepat Pecahan Uang:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {uniqueQuickCash.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCashGiven(amount)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        cashGiven === amount
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {amount === total ? 'Uang Pas' : formatRupiah(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kembalian Box */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  isCashSufficient
                    ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                    : 'border-red-300 bg-red-50 text-red-900'
                }`}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {isCashSufficient ? 'Uang Kembalian Pelanggan' : 'Uang Kurang'}
                  </div>
                  <div className="text-2xl font-black">
                    {formatRupiah(isCashSufficient ? change : total - cashGiven)}
                  </div>
                </div>
                <Calculator className={`w-8 h-8 ${isCashSufficient ? 'text-emerald-600' : 'text-red-500'}`} />
              </div>
            </div>
          )}

          {/* TAB 2: QRIS */}
          {activeMethod === 'qris' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="p-4 rounded-3xl bg-white border-2 border-emerald-300 shadow-md text-center max-w-xs w-full">
                {/* QRIS Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <span className="font-extrabold text-sm tracking-wider text-red-600">QRIS</span>
                  <span className="text-[10px] text-gray-500 font-bold">GPN INDONESIA</span>
                </div>

                {/* Visual QR Code Representation */}
                <div className="bg-gray-950 p-4 rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                  {/* Styled simulated QR pattern */}
                  <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-10 h-10 border-4 border-black rounded-sm flex items-center justify-center">
                        <div className="w-4 h-4 bg-black"></div>
                      </div>
                      <div className="w-10 h-10 border-4 border-black rounded-sm flex items-center justify-center">
                        <div className="w-4 h-4 bg-black"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-[9px] font-bold text-emerald-900 bg-amber-200 px-2 py-0.5 rounded">
                        DAPUR RASA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-10 h-10 border-4 border-black rounded-sm flex items-center justify-center">
                        <div className="w-4 h-4 bg-black"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 w-10 h-10">
                        <div className="bg-black"></div>
                        <div className="bg-black"></div>
                        <div className="bg-black"></div>
                        <div className="border border-black"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs font-bold text-gray-800">
                  Dapur Rasa Bakery & Patisserie
                </div>
                <div className="text-[11px] text-gray-500">NMID: ID1029381920192</div>
                <div className="text-base font-extrabold text-emerald-700 mt-1">
                  {formatRupiah(total)}
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center max-w-sm">
                Pelanggan dapat memindai QRIS ini dari BCA Mobile, GoPay, OVO, ShopeePay, DANA, Livin' Mandiri, atau m-Banking lainnya.
              </p>
            </div>
          )}

          {/* TAB 3: E-WALLET */}
          {activeMethod === 'ewallet' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Pilih Dompet Digital
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'GoPay', color: 'bg-sky-50 border-sky-300 text-sky-800' },
                  { name: 'OVO', color: 'bg-purple-50 border-purple-300 text-purple-800' },
                  { name: 'ShopeePay', color: 'bg-orange-50 border-orange-300 text-orange-800' },
                  { name: 'DANA', color: 'bg-blue-50 border-blue-300 text-blue-800' },
                ].map((w) => (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => setSelectedWallet(w.name as any)}
                    className={`p-3 rounded-2xl border-2 text-center font-bold text-xs transition-all ${
                      selectedWallet === w.name
                        ? `${w.color} ring-2 ring-emerald-500/20`
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nomor HP Pelanggan ({selectedWallet})
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0812-XXXX-XXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                Notifikasi tagihan sebesar <strong>{formatRupiah(total)}</strong> akan otomatis dikirimkan ke aplikasi {selectedWallet} pelanggan.
              </div>
            </div>
          )}

          {/* TAB 4: TRANSFER BANK / VA */}
          {activeMethod === 'transfer' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Pilih Bank Virtual Account
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['BCA', 'Mandiri', 'BRI', 'BNI'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`p-2.5 rounded-xl border-2 font-bold text-xs transition-all ${
                      selectedBank === b
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Bank {b}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="text-xs text-gray-500 font-medium">Nomor Virtual Account Bank {selectedBank}:</div>
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-gray-300">
                  <span className="font-mono font-bold text-base text-gray-900 tracking-wider">
                    {virtualAccountNumbers[selectedBank]}
                  </span>
                  <button
                    onClick={handleCopyVA}
                    className="flex items-center gap-1 text-xs text-emerald-700 font-bold hover:text-emerald-800"
                  >
                    {copiedVA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVA ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-gray-500">
                  Atas Nama: <strong className="text-gray-800">Dapur Rasa Bakery</strong> | Otomatis terverifikasi dalam 3 detik.
                </div>
              </div>
            </div>
          )}

          {/* Customer Optional Info */}
          <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Nama Pelanggan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Ibu Rina"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                No. WhatsApp (Untuk Struk Digital)
              </label>
              <input
                type="tel"
                placeholder="08123456789"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>

          <button
            onClick={() => {
              if (activeMethod === 'cash') {
                if (!isCashSufficient) return;
                handleFinish('cash', { cashGiven, change });
              } else if (activeMethod === 'qris') {
                handleFinish('qris', { refNumber: `QRIS-${Date.now().toString().slice(-6)}`, provider: 'QRIS GPN' });
              } else if (activeMethod === 'ewallet') {
                handleFinish('ewallet', { provider: selectedWallet, customerPhone });
              } else {
                handleFinish('transfer', { provider: `Bank ${selectedBank} VA`, refNumber: virtualAccountNumbers[selectedBank] });
              }
            }}
            disabled={activeMethod === 'cash' && !isCashSufficient}
            className="flex-1 max-w-sm py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none active:scale-98 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {activeMethod === 'cash'
                ? `Konfirmasi Bayar (${formatRupiah(total)})`
                : `Verifikasi & Selesaikan Pembayaran`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
