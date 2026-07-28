import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { timesBase64 } from './timesBase64';

// === XUẤT BÁO CÁO KHO ===

interface InventoryRow {
  name: string;
  unit: string;
  quy_cach: string | null;
  openingStock: string;
  refilled: string;
  sold: string;
  endingStock: string;
}

export function exportInventoryToExcel(
  rows: InventoryRow[],
  startDate: string,
  endDate: string
) {
  const fromStr = new Date(startDate).toLocaleDateString('vi-VN');
  const toStr = new Date(endDate).toLocaleDateString('vi-VN');

  const wsData: any[][] = [
    ['BÁO CÁO KHO TỔNG HỢP - AVA COFFEE'],
    [`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`],
    [],
    ['Tên nguyên liệu', 'Đơn vị', 'Tồn đầu kỳ', 'SL nhập (+)', 'SL bán (-)', 'Tồn cuối kỳ']
  ];

  rows.forEach(row => {
    wsData.push([
      row.name,
      row.unit + (row.quy_cach ? ` (${row.quy_cach})` : ''),
      row.openingStock,
      row.refilled,
      row.sold,
      row.endingStock
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo kho');
  XLSX.writeFile(wb, `BaoCaoKho_${startDate}_${endDate}.xlsx`);
}

export function exportInventoryToPDF(
  rows: InventoryRow[],
  startDate: string,
  endDate: string
) {
  const fromStr = new Date(startDate).toLocaleDateString('vi-VN');
  const toStr = new Date(endDate).toLocaleDateString('vi-VN');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Đăng ký font Times New Roman để hiển thị tiếng Việt có dấu
  doc.addFileToVFS('times.ttf', timesBase64);
  doc.addFont('times.ttf', 'TimesNewRoman', 'normal');
  doc.addFont('times.ttf', 'TimesNewRoman', 'bold');
  doc.setFont('TimesNewRoman');

  doc.setFontSize(16);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('BÁO CÁO KHO TỔNG HỢP - AVA COFFEE', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('TimesNewRoman', 'normal');
  doc.text(`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`, 105, 28, { align: 'center' });

  const tableData = rows.map(row => [
    row.name,
    row.unit + (row.quy_cach ? ` (${row.quy_cach})` : ''),
    row.openingStock,
    row.refilled,
    row.sold,
    row.endingStock
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Tên nguyên liệu', 'Đơn vị', 'Tồn đầu kỳ', 'SL nhập (+)', 'SL bán (-)', 'Tồn cuối kỳ']],
    body: tableData,
    styles: {
      font: 'TimesNewRoman',
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [74, 53, 37],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      3: { textColor: [0, 128, 0], fontStyle: 'bold' },
      4: { textColor: [200, 0, 0], fontStyle: 'bold' },
      5: { fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [250, 246, 240],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`BaoCaoKho_${startDate}_${endDate}.pdf`);
}

// === XUẤT BÁO CÁO DOANH THU ===

interface RevenueData {
  grossRevenue: number;
  totalDiscount: number;
  totalRestockCosts: number;
  totalRestockExpenses: number;
  netRevenue: number;
  totalCash: number;
  totalTransfer: number;
  paidOrders: Array<{
    id: string;
    created_at: string;
    tables?: { table_name?: string };
    payment_method: string;
    total_amount: number;
    discount?: number;
  }>;
}

function fmtVND(n: number): string {
  return n.toLocaleString('vi-VN') + 'đ';
}

export function exportRevenueToExcel(
  data: RevenueData,
  startDate: string,
  endDate: string
) {
  const fromStr = new Date(startDate).toLocaleDateString('vi-VN');
  const toStr = new Date(endDate).toLocaleDateString('vi-VN');

  const wsData: any[][] = [
    ['BÁO CÁO DOANH THU - AVA COFFEE'],
    [`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`],
    [],
    ['TỔNG QUAN'],
    ['Tổng doanh thu (trước giảm giá)', fmtVND(data.grossRevenue)],
    ['Giảm giá', `-${fmtVND(data.totalDiscount)}`],
    ['Chi phí nhập kho', `-${fmtVND(data.totalRestockCosts)}`],
    ['Tổng chi phí nhập / giảm giá', `-${fmtVND(data.totalRestockExpenses)}`],
    ['Doanh thu thực tế', fmtVND(data.netRevenue)],
    [],
    ['Tổng số hóa đơn', `${data.paidOrders.length} đơn`],
    ['Thanh toán tiền mặt', fmtVND(data.totalCash)],
    ['Thanh toán chuyển khoản', fmtVND(data.totalTransfer)],
    [],
    ['CHI TIẾT GIAO DỊCH'],
    ['STT', 'Mã đơn', 'Ngày', 'Bàn', 'Hình thức', 'Tổng tiền', 'Giảm giá', 'Thực nhận']
  ];

  data.paidOrders.forEach((order, idx) => {
    const disc = Number(order.discount || 0);
    wsData.push([
      idx + 1,
      order.id.substring(0, 8).toUpperCase(),
      new Date(order.created_at).toLocaleDateString('vi-VN'),
      order.tables?.table_name || 'Mang về',
      order.payment_method,
      Number(order.total_amount) + disc,
      disc > 0 ? `-${fmtVND(disc)}` : '-',
      fmtVND(Number(order.total_amount))
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 35 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
    { s: { r: 14, c: 0 }, e: { r: 14, c: 7 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo doanh thu');
  XLSX.writeFile(wb, `BaoCaoDoanhThu_${startDate}_${endDate}.xlsx`);
}

export function exportRevenueToPDF(
  data: RevenueData,
  startDate: string,
  endDate: string
) {
  const fromStr = new Date(startDate).toLocaleDateString('vi-VN');
  const toStr = new Date(endDate).toLocaleDateString('vi-VN');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Đăng ký font Times New Roman để hiển thị tiếng Việt có dấu
  doc.addFileToVFS('times.ttf', timesBase64);
  doc.addFont('times.ttf', 'TimesNewRoman', 'normal');
  doc.addFont('times.ttf', 'TimesNewRoman', 'bold');
  doc.setFont('TimesNewRoman');

  doc.setFontSize(16);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('BÁO CÁO DOANH THU - AVA COFFEE', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('TimesNewRoman', 'normal');
  doc.text(`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`, 105, 28, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('TỔNG QUAN', 14, 38);

  autoTable(doc, {
    startY: 42,
    head: [['Chỉ tiêu', 'Giá trị']],
    body: [
      ['Tổng doanh thu (trước giảm giá)', fmtVND(data.grossRevenue)],
      ['Giảm giá', `-${fmtVND(data.totalDiscount)}`],
      ['Chi phí nhập kho', `-${fmtVND(data.totalRestockCosts)}`],
      ['Tổng chi phí nhập / giảm giá', `-${fmtVND(data.totalRestockExpenses)}`],
      ['DOANH THU THỰC TẾ', fmtVND(data.netRevenue)],
      ['', ''],
      ['Tổng số hóa đơn', `${data.paidOrders.length} đơn`],
      ['Tiền mặt', fmtVND(data.totalCash)],
      ['Chuyển khoản', fmtVND(data.totalTransfer)],
    ],
    styles: { font: 'TimesNewRoman', fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 110;

  doc.setFontSize(11);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('CHI TIẾT GIAO DỊCH', 14, finalY + 10);

  const txData = data.paidOrders.map((order, idx) => {
    const disc = Number(order.discount || 0);
    return [
      idx + 1,
      order.id.substring(0, 8).toUpperCase(),
      new Date(order.created_at).toLocaleDateString('vi-VN'),
      order.tables?.table_name || 'Mang về',
      order.payment_method,
      fmtVND(Number(order.total_amount) + disc),
      disc > 0 ? `-${fmtVND(disc)}` : '-',
      fmtVND(Number(order.total_amount))
    ];
  });

  autoTable(doc, {
    startY: finalY + 14,
    head: [['STT', 'Mã đơn', 'Ngày', 'Bàn', 'Hình thức', 'Tổng tiền', 'Giảm giá', 'Thực nhận']],
    body: txData,
    styles: { font: 'TimesNewRoman', fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10 },
      5: { halign: 'right' },
      6: { halign: 'right', textColor: [200, 0, 0] },
      7: { halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [250, 246, 240] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`BaoCaoDoanhThu_${startDate}_${endDate}.pdf`);
}
