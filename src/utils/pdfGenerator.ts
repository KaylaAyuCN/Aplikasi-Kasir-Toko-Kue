import jsPDF from 'jspdf';
import { Transaction, RawMaterial, Product } from '../types';
import { formatRupiah, formatDateTime, formatDateOnly } from './formatters';

export function exportMonthlySalesReportPDF(
  transactions: Transaction[],
  monthName: string,
  managerName = 'Siti Rahma'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header / Kop Toko
  doc.setFillColor(24, 75, 50); // Elegant bakery forest green
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(24, 75, 50);
  doc.text('DAPUR RASA BAKERY & PATISSERIE', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Jl. Gandaria No. 42, Kebayoran Baru, Jakarta Selatan | Telp: (021) 7280-9988', 14, y);
  y += 5;
  doc.text('Email: finance@dapurrasa.id | NPWP: 08.231.982.4-013.000', 14, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 7;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`LAPORAN PENJUALAN BULANAN - ${monthName.toUpperCase()}`, 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dibuat pada: ${formatDateTime(new Date().toISOString())} | Penanggung Jawab: ${managerName}`, 14, y);
  y += 8;

  // Financial KPI Summary Cards
  const totalOmset = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalHPP = transactions.reduce((acc, t) => acc + t.totalCost, 0);
  const totalLaba = totalOmset - (transactions.reduce((acc, t) => acc + t.tax, 0)) - totalHPP;
  const marginLaba = totalOmset > 0 ? ((totalLaba / totalOmset) * 100).toFixed(1) : '0';
  const aov = transactions.length > 0 ? Math.round(totalOmset / transactions.length) : 0;

  // Draw 3 Summary Boxes
  const boxWidth = (pageWidth - 28 - 8) / 3;
  const boxHeight = 20;

  // Box 1: Omset
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL OMSET (GROSS)', 18, y + 6);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(totalOmset), 18, y + 14);

  // Box 2: Laba Kotor
  doc.roundedRect(14 + boxWidth + 4, y, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`ESTIMASI LABA KOTOR (${marginLaba}%)`, 18 + boxWidth + 4, y + 6);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // green
  doc.text(formatRupiah(totalLaba), 18 + boxWidth + 4, y + 14);

  // Box 3: Total Transaksi & AOV
  doc.roundedRect(14 + (boxWidth + 4) * 2, y, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSAKSI / AVG TICKET', 18 + (boxWidth + 4) * 2, y + 6);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${transactions.length} Trx | ${formatRupiah(aov)}`, 18 + (boxWidth + 4) * 2, y + 14);

  y += boxHeight + 8;

  // Table Header
  doc.setFillColor(24, 75, 50);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('NO. NOTA', 17, y + 4.8);
  doc.text('TANGGAL & WAKTU', 50, y + 4.8);
  doc.text('KASIR', 90, y + 4.8);
  doc.text('METODE', 125, y + 4.8);
  doc.text('TOTAL (IDR)', pageWidth - 17, y + 4.8, { align: 'right' });
  y += 7;

  // Table Rows (Up to 24 rows)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const displayTx = transactions.slice(0, 22);
  displayTx.forEach((tx, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    }
    doc.text(tx.receiptNumber, 17, y + 4.5);
    doc.text(formatDateTime(tx.date), 50, y + 4.5);
    doc.text(tx.cashierName, 90, y + 4.5);
    doc.text(`${tx.paymentMethod.toUpperCase()}${tx.paymentDetails.provider ? ' (' + tx.paymentDetails.provider + ')' : ''}`, 125, y + 4.5);
    doc.text(formatRupiah(tx.total), pageWidth - 17, y + 4.5, { align: 'right' });
    y += 6.5;
  });

  if (transactions.length > 22) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`...dan ${transactions.length - 22} transaksi lainnya tercatat dalam basis data sistem kasir.`, 17, y + 4);
    y += 7;
  }

  y += 6;

  // Signatures
  const signY = 250;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Diverifikasi oleh Kasir Kepala,', 25, signY);
  doc.text('Mengetahui / Disetujui Pemilik,', pageWidth - 75, signY);

  doc.line(25, signY + 22, 75, signY + 22);
  doc.line(pageWidth - 75, signY + 22, pageWidth - 25, signY + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('Budi Santoso', 25, signY + 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Kepala Kasir & Operasional', 25, signY + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(managerName, pageWidth - 75, signY + 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('General Manager & Head Pastry', pageWidth - 75, signY + 30);

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini sah dicetak secara otomatis oleh Sistem POS Dapur Rasa Bakery. Hak Cipta Dilindungi.', pageWidth / 2, 290, { align: 'center' });

  doc.save(`Laporan_Penjualan_${monthName.replace(/\s+/g, '_')}_DapurRasa.pdf`);
}

export function exportMonthlyStockReportPDF(
  rawMaterials: RawMaterial[],
  products: Product[],
  monthName: string,
  managerName = 'Siti Rahma'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header / Kop
  doc.setFillColor(180, 83, 9); // Warm bakery amber
  doc.rect(0, 0, pageWidth, 5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(180, 83, 9);
  doc.text('DAPUR RASA BAKERY & PATISSERIE', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Divisi Gudang & Manajemen Bahan Baku | Telp: (021) 7280-9988', 14, y);
  y += 5;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 7;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`LAPORAN STOK & AUDIT BAHAN BAKU - ${monthName.toUpperCase()}`, 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tanggal Cetak: ${formatDateOnly(new Date().toISOString())} | Penanggung Jawab Inventaris: ${managerName}`, 14, y);
  y += 8;

  // Summary KPI
  const totalStockValueRaw = rawMaterials.reduce((acc, rm) => acc + (rm.currentStock * rm.costPerUnit), 0);
  const totalProductStockValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const lowStockCount = rawMaterials.filter(rm => rm.currentStock <= rm.minStock).length;

  const boxWidth = (pageWidth - 28 - 8) / 3;
  const boxHeight = 18;

  // Box 1: Nilai Bahan Baku
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NILAI ASET BAHAN BAKU', 18, y + 5.5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(totalStockValueRaw), 18, y + 13);

  // Box 2: Nilai Produk Jadi
  doc.roundedRect(14 + boxWidth + 4, y, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NILAI ASET KUE JADI (HPP)', 18 + boxWidth + 4, y + 5.5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(totalProductStockValue), 18 + boxWidth + 4, y + 13);

  // Box 3: Status Peringatan
  doc.roundedRect(14 + (boxWidth + 4) * 2, y, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BAHAN BAKU MENIPIS / RESTOCK', 18 + (boxWidth + 4) * 2, y + 5.5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lowStockCount > 0 ? 220 : 22, lowStockCount > 0 ? 38 : 101, lowStockCount > 0 ? 38 : 52);
  doc.text(`${lowStockCount} Item Kritis`, 18 + (boxWidth + 4) * 2, y + 13);

  y += boxHeight + 7;

  // Section 1: Bahan Baku
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Inventaris Bahan Baku Dapur & Reorder Point', 14, y);
  y += 5;

  // Table Raw Materials
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, pageWidth - 28, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NAMA BAHAN BAKU', 17, y + 4.5);
  doc.text('KATEGORI', 80, y + 4.5);
  doc.text('STOK MIN', 115, y + 4.5);
  doc.text('SISA STOK', 140, y + 4.5);
  doc.text('EST. NILAI', pageWidth - 17, y + 4.5, { align: 'right' });
  y += 6.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  rawMaterials.forEach((rm, idx) => {
    const isCritical = rm.currentStock <= rm.minStock;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 5.5, 'F');
    }
    if (isCritical) {
      doc.setTextColor(185, 28, 28);
    } else {
      doc.setTextColor(30, 41, 59);
    }

    doc.text(rm.name.length > 36 ? rm.name.substring(0, 34) + '...' : rm.name, 17, y + 3.8);
    doc.text(rm.category, 80, y + 3.8);
    doc.text(`${rm.minStock} ${rm.unit}`, 115, y + 3.8);
    doc.text(`${rm.currentStock} ${rm.unit}${isCritical ? ' (Kritis!)' : ''}`, 140, y + 3.8);
    doc.text(formatRupiah(rm.currentStock * rm.costPerUnit), pageWidth - 17, y + 3.8, { align: 'right' });
    y += 5.5;
  });

  y += 5;

  // Section 2: Stok Produk Jadi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Stok Kue & Roti Display Siap Jual', 14, y);
  y += 5;

  // Table Products
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, pageWidth - 28, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NAMA PRODUK KUE', 17, y + 4.5);
  doc.text('KATEGORI', 80, y + 4.5);
  doc.text('HARGA JUAL', 115, y + 4.5);
  doc.text('SISA STOK', 145, y + 4.5);
  doc.text('TOTAL HPP', pageWidth - 17, y + 4.5, { align: 'right' });
  y += 6.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  products.slice(0, 8).forEach((p, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 5.5, 'F');
    }
    const isLow = p.stock <= p.minStock;
    if (isLow) {
      doc.setTextColor(185, 28, 28);
    } else {
      doc.setTextColor(30, 41, 59);
    }
    doc.text(p.name, 17, y + 3.8);
    doc.text(p.category, 80, y + 3.8);
    doc.text(formatRupiah(p.price), 115, y + 3.8);
    doc.text(`${p.stock} pcs${isLow ? ' (Menipis)' : ''}`, 145, y + 3.8);
    doc.text(formatRupiah(p.stock * p.costPrice), pageWidth - 17, y + 3.8, { align: 'right' });
    y += 5.5;
  });

  // Footer Signatures
  const signY = 252;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Petugas Gudang & Dapur,', 25, signY);
  doc.text('Disetujui Pemilik / Head Chef,', pageWidth - 75, signY);

  doc.line(25, signY + 20, 75, signY + 20);
  doc.line(pageWidth - 75, signY + 20, pageWidth - 25, signY + 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Ahmad Fauzi', 25, signY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Staf Logistik & Inventori', 25, signY + 29);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(managerName, pageWidth - 75, signY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Head Pastry & Owner', pageWidth - 75, signY + 29);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen Sistem Otomatis Dapur Rasa Bakery - Verifikasi Stok Fisik Mingguan', pageWidth / 2, 290, { align: 'center' });

  doc.save(`Laporan_Stok_${monthName.replace(/\s+/g, '_')}_DapurRasa.pdf`);
}
