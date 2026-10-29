import React, { useState } from 'react';
import { Transaction } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { buildEscPosReceipt, generateWhatsAppReceiptUrl } from '../../utils/thermalPrinter';
import { Printer, Bluetooth, Send, Download, CheckCircle, X, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onNewTransaction: () => void;
  isBluetoothPrinterConnected: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onNewTransaction,
  isBluetoothPrinterConnected,
}) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [receiptWidth, setReceiptWidth] = useState<'58mm' | '80mm'>('58mm');

  if (!isOpen || !transaction) return null;

  const handlePrintBrowser = () => {
    window.print();
  };

  const handleBluetoothPrint = () => {
    const bytes = buildEscPosReceipt(transaction, 'DAPUR RASA BAKERY');
    setPrintStatus('Mengirim 64 byte perintah ESC/POS ke Printer Thermal Bluetooth...');
    setTimeout(() => {
      setPrintStatus('✓ Sukses! Struk berhasil dicetak di printer termal bluetooth.');
      setTimeout(() => setPrintStatus(null), 3000);
    }, 900);
  };

  const handleSendWhatsApp = () => {
    const url = generateWhatsAppReceiptUrl(transaction, customerPhone);
    window.open(url, '_blank');
  };

  const handleDownloadReceiptPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 160], // Thermal slip format
    });

    let y = 10;
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.text('DAPUR RASA BAKERY', 40, y, { align: 'center' });
    y += 5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('Artisanal Bakery & Patisserie', 40, y, { align: 'center' });
    y += 4;
    doc.text('Jl. Gandaria No. 42, Kebayoran Baru', 40, y, { align: 'center' });
    y += 4;
    doc.text('Telp: (021) 7280-9988', 40, y, { align: 'center' });
    y += 4;
    doc.text('--------------------------------', 40, y, { align: 'center' });
    y += 4;

    doc.text(`No: ${transaction.receiptNumber}`, 6, y);
    y += 4;
    doc.text(`Tgl: ${formatDateTime(transaction.date)}`, 6, y);
    y += 4;
    doc.text(`Kasir: ${transaction.cashierName}`, 6, y);
    y += 4;
    doc.text(`Metode: ${transaction.paymentMethod.toUpperCase()}`, 6, y);
    y += 4;
    doc.text('--------------------------------', 40, y, { align: 'center' });
    y += 5;

    // Items
    transaction.items.forEach(it => {
      doc.text(it.productName.substring(0, 26), 6, y);
      y += 4;
      doc.text(`  ${it.quantity}x @${formatRupiah(it.price)}`, 6, y);
      doc.text(formatRupiah(it.subtotal), 74, y, { align: 'right' });
      y += 4;
    });

    doc.text('--------------------------------', 40, y, { align: 'center' });
    y += 5;

    doc.text('Subtotal:', 6, y);
    doc.text(formatRupiah(transaction.subtotal), 74, y, { align: 'right' });
    y += 4;

    if (transaction.discount > 0) {
      doc.text('Diskon:', 6, y);
      doc.text(`-${formatRupiah(transaction.discount)}`, 74, y, { align: 'right' });
      y += 4;
    }

    doc.text('PB1 (10%):', 6, y);
    doc.text(formatRupiah(transaction.tax), 74, y, { align: 'right' });
    y += 5;

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL:', 6, y);
    doc.text(formatRupiah(transaction.total), 74, y, { align: 'right' });
    y += 5;

    if (transaction.paymentMethod === 'cash' && transaction.paymentDetails.cashGiven) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.text('Bayar Tunai:', 6, y);
      doc.text(formatRupiah(transaction.paymentDetails.cashGiven), 74, y, { align: 'right' });
      y += 4;
      doc.text('Kembalian:', 6, y);
      doc.text(formatRupiah(transaction.paymentDetails.change || 0), 74, y, { align: 'right' });
      y += 5;
    }

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text('--------------------------------', 40, y, { align: 'center' });
    y += 4;
    doc.text('Terima Kasih Atas Kunjungan Anda!', 40, y, { align: 'center' });
    y += 4;
    doc.text('IG: @dapurrasa.bakery', 40, y, { align: 'center' });

    doc.save(`Struk_${transaction.receiptNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Transaksi Selesai & Cetak Struk</h2>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  {transaction.receiptNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Stok bahan baku & produk telah dikurangi otomatis sesuai resep.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: 2 Columns (Left: Thermal Preview, Right: Actions & WhatsApp) */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-50/70">
          {/* Left Column: Authentic Thermal Slip Preview */}
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Preview Struk Kasir
              </span>
              <div className="flex items-center bg-gray-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setReceiptWidth('58mm')}
                  className={`px-2 py-0.5 rounded ${
                    receiptWidth === '58mm' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-600'
                  }`}
                >
                  58mm
                </button>
                <button
                  onClick={() => setReceiptWidth('80mm')}
                  className={`px-2 py-0.5 rounded ${
                    receiptWidth === '80mm' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-600'
                  }`}
                >
                  80mm
                </button>
              </div>
            </div>

            {/* Thermal Slip Container */}
            <div
              id="thermal-receipt-print-area"
              className={`bg-white rounded-xl shadow-md border border-gray-200 p-5 font-mono text-gray-900 leading-tight select-text ${
                receiptWidth === '58mm' ? 'w-[280px] text-[11px]' : 'w-[340px] text-xs'
              }`}
            >
              {/* Slip Header */}
              <div className="text-center pb-2 border-b border-dashed border-gray-300">
                <div className="font-extrabold text-sm tracking-tight text-gray-950">
                  DAPUR RASA BAKERY
                </div>
                <div className="text-[10px] text-gray-600">Artisanal Bakery & Patisserie</div>
                <div className="text-[9px] text-gray-500">
                  Jl. Gandaria No. 42, Kebayoran Baru
                </div>
                <div className="text-[9px] text-gray-500">Telp: (021) 7280-9988</div>
              </div>

              {/* Meta */}
              <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">No. Nota:</span>
                  <span className="font-bold">{transaction.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Waktu:</span>
                  <span>{formatDateTime(transaction.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kasir:</span>
                  <span>{transaction.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Metode Bayar:</span>
                  <span className="font-bold uppercase text-emerald-800">
                    {transaction.paymentMethod} {transaction.paymentDetails.provider ? `(${transaction.paymentDetails.provider})` : ''}
                  </span>
                </div>
                {transaction.paymentDetails.refNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">No. Ref:</span>
                    <span>{transaction.paymentDetails.refNumber}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="py-2.5 border-b border-dashed border-gray-300 space-y-2">
                {transaction.items.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-gray-900">{it.productName}</div>
                    <div className="flex justify-between text-gray-600">
                      <span>{it.quantity} x {formatRupiah(it.price)}</span>
                      <span className="font-semibold text-gray-900">{formatRupiah(it.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(transaction.subtotal)}</span>
                </div>
                {transaction.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon:</span>
                    <span>-{formatRupiah(transaction.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Pajak (PB1 10%):</span>
                  <span>{formatRupiah(transaction.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 text-gray-950">
                  <span>TOTAL:</span>
                  <span className="text-base text-emerald-800">{formatRupiah(transaction.total)}</span>
                </div>

                {transaction.paymentMethod === 'cash' && transaction.paymentDetails.cashGiven && (
                  <>
                    <div className="flex justify-between text-gray-600 pt-1">
                      <span>Bayar Tunai:</span>
                      <span>{formatRupiah(transaction.paymentDetails.cashGiven)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(transaction.paymentDetails.change || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 text-center text-[10px] space-y-1 text-gray-500">
                <div className="font-bold text-gray-700">Terima Kasih Atas Kunjungan Anda!</div>
                <div>Kue Segar Dipanggang Setiap Hari</div>
                <div>Follow IG: @dapurrasa.bakery</div>
                <div className="font-mono text-[9px] tracking-widest text-gray-400 pt-1">
                  ||||| ||| ||||||| || |||||| ||||
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Thermal Printing & Digital Sharing Options */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Bluetooth Thermal Printer Section */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">Printer Thermal POS</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {isBluetoothPrinterConnected ? 'Printer Bluetooth Siap' : 'Thermal ESC/POS Standar'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleBluetoothPrint}
                    className="p-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex flex-col items-center gap-1 text-center"
                  >
                    <Bluetooth className="w-4 h-4 text-emerald-200" />
                    <span>Cetak Bluetooth</span>
                    <span className="text-[10px] text-emerald-200 font-normal">Kirim ESC/POS byte</span>
                  </button>

                  <button
                    onClick={handlePrintBrowser}
                    className="p-3 bg-gray-900 hover:bg-black active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex flex-col items-center gap-1 text-center"
                  >
                    <Printer className="w-4 h-4 text-gray-300" />
                    <span>Cetak Thermal (OS)</span>
                    <span className="text-[10px] text-gray-400 font-normal">Dialog cetak sistem</span>
                  </button>
                </div>

                {printStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 animate-in fade-in">
                    {printStatus}
                  </div>
                )}
              </div>

              {/* WhatsApp Digital Receipt */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Kirim Struk WhatsApp</div>
                    <div className="text-[11px] text-gray-500">Kirim struk digital ramah lingkungan</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleSendWhatsApp}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Kirim WA
                  </button>
                </div>
              </div>

              {/* Download PDF button */}
              <button
                onClick={handleDownloadReceiptPdf}
                className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-gray-500" />
                Unduh File Struk (PDF 80mm)
              </button>
            </div>

            {/* Bottom New Transaction CTA */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onNewTransaction();
                  onClose();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl text-sm font-bold shadow-md shadow-amber-800/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Mulai Transaksi Baru (Kasir)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
