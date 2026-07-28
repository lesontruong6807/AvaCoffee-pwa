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

// === XUẤT BÁO CÁO CHẤM CÔNG ===

export interface AttendanceSummary {
  staffName: string;
  username: string;
  role: string;
  totalShifts: number;
  totalHours: number;
  totalLeaveDays: number;
  totalLeaveHours: number;
}

export interface AttendanceShiftDetail {
  staffName: string;
  date: string;
  shiftName: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: string;
}

export interface AttendanceLeaveDetail {
  staffName: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
}

export function exportAttendanceToExcel(
  summary: AttendanceSummary[],
  shifts: AttendanceShiftDetail[],
  leaves: AttendanceLeaveDetail[],
  startDate: string,
  endDate: string
) {
  const fromStr = new Date(startDate).toLocaleDateString('vi-VN');
  const toStr = new Date(endDate).toLocaleDateString('vi-VN');

  // Sheet 1: Tổng hợp công
  const wsSummaryData: any[][] = [
    ['BÁO CÁO CÔNG TỔNG HỢP - AVA COFFEE'],
    [`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`],
    [],
    ['Họ và tên', 'Tên đăng nhập', 'Vai trò', 'Số ca làm (Đã duyệt)', 'Tổng số giờ làm (giờ)', 'Số ngày xin nghỉ (ngày)', 'Tổng số giờ nghỉ (giờ)']
  ];
  summary.forEach(row => {
    wsSummaryData.push([
      row.staffName,
      '@' + row.username,
      row.role,
      row.totalShifts,
      Number(row.totalHours.toFixed(1)),
      row.totalLeaveDays,
      Number(row.totalLeaveHours.toFixed(1))
    ]);
  });
  const wsSummary = XLSX.utils.aoa_to_sheet(wsSummaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  wsSummary['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
  ];

  // Sheet 2: Chi tiết ca làm
  const wsShiftsData: any[][] = [
    ['CHI TIẾT CA LÀM NHÂN VIÊN - AVA COFFEE'],
    [`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`],
    [],
    ['STT', 'Nhân viên', 'Ngày làm', 'Ca làm', 'Giờ vào thực tế', 'Giờ ra thực tế', 'Số giờ làm', 'Trạng thái']
  ];
  shifts.forEach((row, idx) => {
    wsShiftsData.push([
      idx + 1,
      row.staffName,
      row.date,
      row.shiftName,
      row.checkIn,
      row.checkOut || '-',
      Number(row.hours.toFixed(1)),
      row.status
    ]);
  });
  const wsShifts = XLSX.utils.aoa_to_sheet(wsShiftsData);
  wsShifts['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];
  wsShifts['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
  ];

  // Sheet 3: Chi tiết nghỉ phép
  const wsLeavesData: any[][] = [
    ['CHI TIẾT YÊU CẦU NGHỈ PHÉP - AVA COFFEE'],
    [`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`],
    [],
    ['STT', 'Nhân viên', 'Từ ngày', 'Đến ngày', 'Số ngày', 'Lý do nghỉ', 'Trạng thái']
  ];
  leaves.forEach((row, idx) => {
    wsLeavesData.push([
      idx + 1,
      row.staffName,
      row.startDate,
      row.endDate,
      row.days,
      row.reason,
      row.status
    ]);
  });
  const wsLeaves = XLSX.utils.aoa_to_sheet(wsLeavesData);
  wsLeaves['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 35 }, { wch: 15 }];
  wsLeaves['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp công');
  XLSX.utils.book_append_sheet(wb, wsShifts, 'Chi tiết ca làm');
  XLSX.utils.book_append_sheet(wb, wsLeaves, 'Chi tiết nghỉ phép');
  XLSX.writeFile(wb, `BaoCaoChamCong_${startDate}_${endDate}.xlsx`);
}

export function exportAttendanceToPDF(
  summary: AttendanceSummary[],
  shifts: AttendanceShiftDetail[],
  leaves: AttendanceLeaveDetail[],
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

  // Title
  doc.setFontSize(16);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('BÁO CÁO CHẤM CÔNG VÀ NGHỈ PHÉP - AVA COFFEE', 105, 20, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('TimesNewRoman', 'normal');
  doc.text(`Thời gian: ${fromStr}  —  Đến ngày: ${toStr}`, 105, 28, { align: 'center' });

  // Section 1: Tổng hợp công
  doc.setFontSize(11);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('I. BẢNG TỔNG HỢP CÔNG NHÂN VIÊN', 14, 37);

  const summaryData = summary.map(row => [
    row.staffName,
    '@' + row.username,
    row.role,
    row.totalShifts,
    row.totalHours.toFixed(1) + ' giờ',
    row.totalLeaveDays + ' ngày',
    row.totalLeaveHours.toFixed(1) + ' giờ'
  ]);

  autoTable(doc, {
    startY: 41,
    head: [['Họ và tên', 'Username', 'Vai trò', 'Số ca làm', 'Tổng giờ làm', 'Số ngày nghỉ', 'Tổng giờ nghỉ']],
    body: summaryData,
    styles: { font: 'TimesNewRoman', fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [250, 246, 240] },
    margin: { left: 14, right: 14 },
  });

  // Trang 2: Chi tiết ca làm
  doc.addPage();
  
  doc.setFontSize(11);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('II. CHI TIẾT CA LÀM NHÂN VIÊN', 14, 20);

  const shiftsData = shifts.map((row, idx) => [
    idx + 1,
    row.staffName,
    row.date,
    row.shiftName,
    row.checkIn,
    row.checkOut || '-',
    row.hours.toFixed(1) + ' h',
    row.status
  ]);

  autoTable(doc, {
    startY: 24,
    head: [['STT', 'Nhân viên', 'Ngày', 'Ca làm', 'Giờ vào', 'Giờ ra', 'Số giờ', 'Trạng thái']],
    body: shiftsData,
    styles: { font: 'TimesNewRoman', fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 246, 240] },
    columnStyles: {
      0: { cellWidth: 10 },
      7: { fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 },
  });

  // Trang 3: Chi tiết nghỉ phép nếu có
  if (leaves.length > 0) {
    doc.addPage();
    doc.setFontSize(11);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('III. CHI TIẾT ĐƠN XIN NGHỈ PHÉP', 14, 20);

    const leavesData = leaves.map((row, idx) => [
      idx + 1,
      row.staffName,
      row.startDate,
      row.endDate,
      row.days + ' ngày',
      row.reason,
      row.status
    ]);

    autoTable(doc, {
      startY: 24,
      head: [['STT', 'Nhân viên', 'Từ ngày', 'Đến ngày', 'Số ngày', 'Lý do', 'Trạng thái']],
      body: leavesData,
      styles: { font: 'TimesNewRoman', fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 246, 240] },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { cellWidth: 20 },
        6: { fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save(`BaoCaoChamCong_${startDate}_${endDate}.pdf`);
}

