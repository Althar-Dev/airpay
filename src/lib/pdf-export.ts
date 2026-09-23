import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportPDFTransaction {
  id: string;
  externalId?: string;
  transactionDate?: string;
  amount?: number;
  feeAmount?: number;
  netAmount?: number;
  status: string;
  paymentMethod?: string;
}

export function exportTransactionsToPDF(transactions: ExportPDFTransaction[], merchantName?: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // 1. Header Banner
  doc.setFillColor(255, 222, 89); // Neo Yellow #FFDE59
  doc.rect(0, 0, 297, 28, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AirPay - LAPORAN AUDIT TRANSAKSI MERCHANT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Merchant: ${merchantName || 'Toko Merchant'}  |  Dicetak Pada: ${dateFormatted}`, 14, 20);

  // 2. Summary Statistics Box
  const totalCount = transactions.length;
  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalNet = transactions.reduce((sum, tx) => sum + (tx.netAmount || (tx.amount ? tx.amount * 0.993 : 0)), 0);

  doc.setFillColor(245, 245, 245);
  doc.rect(14, 32, 269, 14, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(14, 32, 269, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Total Transaksi: ${totalCount} Tx`, 20, 41);
  doc.text(`Total Gross Volume: ${formatIDR(totalVolume)}`, 100, 41);
  doc.text(`Total Bersih Diterima: ${formatIDR(totalNet)}`, 200, 41);

  // 3. Table Rows Construction
  const tableRows = transactions.map((tx, idx) => [
    idx + 1,
    tx.id || '-',
    tx.externalId || '-',
    tx.transactionDate ? new Date(tx.transactionDate).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-',
    formatIDR(tx.amount || 0),
    formatIDR(tx.feeAmount || Math.round((tx.amount || 0) * 0.007)),
    formatIDR(tx.netAmount || Math.max(0, (tx.amount || 0) - Math.round((tx.amount || 0) * 0.007))),
    tx.status || 'Pending'
  ]);

  // 4. AutoTable
  autoTable(doc, {
    startY: 50,
    head: [['No', 'ID Transaksi', 'External ID', 'Waktu Transaksi', 'Nominal', 'Fee MDR', 'Net Diterima', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 },
      5: { halign: 'right', cellWidth: 30 },
      6: { halign: 'right', cellWidth: 35 },
      7: { halign: 'center', cellWidth: 25 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        const val = String(data.cell.raw).toLowerCase();
        if (val.includes('success') || val.includes('berhasil') || val.includes('paid')) {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald Green
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('pending')) {
          data.cell.styles.textColor = [234, 179, 8]; // Yellow
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [225, 29, 72]; // Rose Red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // 5. Direct Download PDF File
  const filename = `Laporan_Transaksi_AirPay_${Date.now()}.pdf`;
  doc.save(filename);
}
