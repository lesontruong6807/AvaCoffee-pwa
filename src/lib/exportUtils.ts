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
  totalCOGS?: number;
  netProfit?: number;
  totalExpenses?: number;
  paidOrders: Array<{
    id: string;
    created_at: string;
    tables?: { table_name?: string };
    payment_method: string;
    total_amount: number;
    discount?: number;
  }>;
  restockLogs?: any[];
  sales?: {
    sortedSales: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
    lyDen: number;
    lyTrang: number;
    lyHoaVan: number;
    lyTraTac: number;
    totalLy: number;
  };
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
    ['Doanh thu thuần (Thực nhận)', fmtVND(data.grossRevenue - data.totalDiscount)],
    ['Tổng giá vốn (COGS)', data.totalCOGS !== undefined ? fmtVND(data.totalCOGS) : '-'],
    ['Lợi nhuận gộp', data.totalCOGS !== undefined ? fmtVND((data.grossRevenue - data.totalDiscount) - data.totalCOGS) : '-'],
    ['Chi phí vận hành', data.totalExpenses !== undefined ? `-${fmtVND(data.totalExpenses)}` : '-'],
    ['Lợi nhuận ròng', data.netProfit !== undefined ? fmtVND(data.netProfit) : '-'],
    ['Chi phí nhập kho', `-${fmtVND(data.totalRestockCosts)}`],
    ['Tổng chi phí nhập / giảm giá', `-${fmtVND(data.totalRestockExpenses)}`],
    ['Hiệu số Doanh thu - Chi phí', fmtVND(data.netRevenue)],
    [],
    ['Tổng số hóa đơn', `${data.paidOrders.length} đơn`],
    ['Thanh toán tiền mặt', fmtVND(data.totalCash)],
    ['Thanh toán chuyển khoản', fmtVND(data.totalTransfer)]
  ];

  if (data.restockLogs && data.restockLogs.length > 0) {
    wsData.push([]);
    wsData.push(['CHI TIẾT TIỀN NHẬP KHO']);
    wsData.push(['STT', 'Ngày', 'Nguyên liệu/Chi phí', 'Ghi chú/Lý do', 'Thành tiền']);
    data.restockLogs.forEach((log, idx) => {
      wsData.push([
        idx + 1,
        new Date(log.created_at).toLocaleDateString('vi-VN'),
        log.ingredient_name,
        log.note || 'Nhập kho',
        `-${fmtVND(log.cost)}`
      ]);
    });
  }

  if (data.sales) {
    wsData.push([]);
    wsData.push(['BÁO CÁO BÁN HÀNG & SỬ DỤNG LY']);
    wsData.push(['Tổng Ly đã bán', data.sales.totalLy]);
    wsData.push(['Ly Đen AVA', data.sales.lyDen]);
    wsData.push(['Ly Trắng AVA', data.sales.lyTrang]);
    wsData.push(['Ly Hoa Văn', data.sales.lyHoaVan]);
    wsData.push(['Ly Trà Tắc', data.sales.lyTraTac]);
    wsData.push([]);
    wsData.push(['CHI TIẾT MÓN ĂN ĐÃ BÁN (SẮP XẾP GIẢM DẦN)']);
    wsData.push(['STT', 'Tên sản phẩm', 'Số lượng bán', 'Đơn giá', 'Thành tiền']);
    data.sales.sortedSales.forEach((item, idx) => {
      wsData.push([
        idx + 1,
        item.name,
        `${item.quantity} ly`,
        fmtVND(item.price),
        fmtVND(item.subtotal)
      ]);
    });
  }

  wsData.push([]);
  wsData.push(['CHI TIẾT GIAO DỊCH']);
  wsData.push(['STT', 'Mã đơn', 'Ngày', 'Bàn', 'Hình thức', 'Tổng tiền', 'Giảm giá', 'Thực nhận']);
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

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
    { s: { r: 14, c: 0 }, e: { r: 14, c: 7 } },
  ];

  if (data.restockLogs && data.restockLogs.length > 0) {
    const restockHeaderIdx = 15 + data.paidOrders.length + 1;
    merges.push({ s: { r: restockHeaderIdx, c: 0 }, e: { r: restockHeaderIdx, c: 7 } });
  }

  ws['!merges'] = merges;

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
      ['Doanh thu thuần (Thực nhận)', fmtVND(data.grossRevenue - data.totalDiscount)],
      ['Tổng giá vốn (COGS)', data.totalCOGS !== undefined ? fmtVND(data.totalCOGS) : '-'],
      ['LỢI NHUẬN GỘP', data.totalCOGS !== undefined ? fmtVND((data.grossRevenue - data.totalDiscount) - data.totalCOGS) : '-'],
      ['Chi phí vận hành', data.totalExpenses !== undefined ? `-${fmtVND(data.totalExpenses)}` : '-'],
      ['LỢI NHUẬN RÒNG', data.netProfit !== undefined ? fmtVND(data.netProfit) : '-'],
      ['Chi phí nhập kho', `-${fmtVND(data.totalRestockCosts)}`],
      ['Tổng chi phí nhập / giảm giá', `-${fmtVND(data.totalRestockExpenses)}`],
      ['Hiệu số Doanh thu - Chi phí', fmtVND(data.netRevenue)],
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

  if (data.restockLogs && data.restockLogs.length > 0) {
    doc.addPage();
    doc.setFontSize(11);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('CHI TIẾT CHI PHÍ NHẬP KHO', 14, 20);

    const restockTableData = data.restockLogs.map((log, idx) => [
      idx + 1,
      new Date(log.created_at).toLocaleDateString('vi-VN'),
      log.ingredient_name,
      log.note || 'Nhập kho',
      `-${fmtVND(log.cost)}`
    ]);

    autoTable(doc, {
      startY: 24,
      head: [['STT', 'Ngày', 'Nguyên liệu/Chi phí', 'Ghi chú/Lý do', 'Thành tiền']],
      body: restockTableData,
      styles: { font: 'TimesNewRoman', fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 45 },
        4: { cellWidth: 35, halign: 'right', textColor: [200, 0, 0], fontStyle: 'bold' }
      },
      alternateRowStyles: { fillColor: [250, 246, 240] },
      margin: { left: 14, right: 14 },
    });
  }

  if (data.sales) {
    doc.addPage();
    doc.setFontSize(11);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('BÁO CÁO BÁN HÀNG & THỐNG KÊ LY', 14, 20);

    // Bảng thống kê các loại ly
    autoTable(doc, {
      startY: 24,
      head: [['Loại ly', 'Số lượng dùng']],
      body: [
        ['Tổng Ly đã bán', String(data.sales.totalLy)],
        ['Ly Đen AVA', String(data.sales.lyDen)],
        ['Ly Trắng AVA', String(data.sales.lyTrang)],
        ['Ly Hoa Văn', String(data.sales.lyHoaVan)],
        ['Ly Trà Tắc', String(data.sales.lyTraTac)],
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

    const salesY = (doc as any).lastAutoTable?.finalY || 60;

    doc.setFontSize(11);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text('CHI TIẾT MÓN ĂN ĐÃ BÁN (XẾP HẠNG GIẢM DẦN)', 14, salesY + 10);

    const salesBody = data.sales.sortedSales.map((item, idx) => [
      idx + 1,
      item.name,
      `${item.quantity} ly`,
      fmtVND(item.price),
      fmtVND(item.subtotal)
    ]);

    autoTable(doc, {
      startY: salesY + 14,
      head: [['STT', 'Tên sản phẩm', 'Số lượng bán', 'Đơn giá', 'Thành tiền']],
      body: salesBody,
      styles: { font: 'TimesNewRoman', fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 75 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: { fillColor: [250, 246, 240] },
      margin: { left: 14, right: 14 },
    });
  }

  // ĐƯA CHI TIẾT GIAO DỊCH XUỐNG DƯỚI CÙNG (Trên một trang mới)
  doc.addPage();
  doc.setFontSize(11);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('CHI TIẾT GIAO DỊCH', 14, 20);

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
    startY: 24,
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

export function exportProductSalesToExcel(
  salesData: {
    totalLy: number;
    lyDen: number;
    lyTrang: number;
    lyHoaVan: number;
    lyTraTac: number;
    sortedSales: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
  },
  startDate: string,
  endDate: string
) {
  const fromStr = new Date(startDate).toLocaleDateString('vi-VN');
  const toStr = new Date(endDate).toLocaleDateString('vi-VN');

  const wsData: any[][] = [
    ['BÁO CÁO BÁN HÀNG & MÓN ĂN - AVA COFFEE'],
    [`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`],
    [],
    ['THỐNG KÊ SỬ DỤNG LY'],
    ['Tổng ly đã bán', salesData.totalLy],
    ['Ly Đen AVA', salesData.lyDen],
    ['Ly Trắng AVA', salesData.lyTrang],
    ['Ly Trắng Hoa Văn', salesData.lyHoaVan],
    ['Ly Trà Tắc', salesData.lyTraTac],
    [],
    ['DANH SÁCH MÓN ĂN BÁN RA (SẮP XẾP SỐ LƯỢNG GIẢM DẦN)'],
    ['STT', 'Tên sản phẩm', 'Số lượng bán', 'Đơn giá', 'Thành tiền']
  ];

  let totalQty = 0;
  let totalRevenue = 0;

  salesData.sortedSales.forEach((item, idx) => {
    totalQty += item.quantity;
    totalRevenue += item.subtotal;
    wsData.push([
      idx + 1,
      item.name,
      `${item.quantity} ly`,
      fmtVND(item.price),
      fmtVND(item.subtotal)
    ]);
  });

  wsData.push([]);
  wsData.push(['TỔNG CỘNG', '', `${totalQty} ly`, '', fmtVND(totalRevenue)]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 35 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo bán hàng');
  XLSX.writeFile(wb, `BaoCaoBanHang_${startDate}_${endDate}.xlsx`);
}

export function exportProductSalesToPDF(
  salesData: {
    totalLy: number;
    lyDen: number;
    lyTrang: number;
    lyHoaVan: number;
    lyTraTac: number;
    sortedSales: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
  },
  startDate: string,
  endDate: string
) {
  const fromStr = new Date(startDate).toLocaleDateString('vi-VN');
  const toStr = new Date(endDate).toLocaleDateString('vi-VN');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.addFileToVFS('times.ttf', timesBase64);
  doc.addFont('times.ttf', 'TimesNewRoman', 'normal');
  doc.addFont('times.ttf', 'TimesNewRoman', 'bold');
  doc.setFont('TimesNewRoman');

  doc.setFontSize(16);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('BÁO CÁO BÁN HÀNG & MÓN ĂN - AVA COFFEE', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('TimesNewRoman', 'normal');
  doc.text(`Từ ngày: ${fromStr}  —  Đến ngày: ${toStr}`, 105, 28, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('I. THỐNG KÊ SỬ DỤNG LY', 14, 38);

  autoTable(doc, {
    startY: 42,
    head: [['Tổng số ly', 'Ly Đen AVA', 'Ly Trắng AVA', 'Ly Hoa Văn', 'Ly Trà Tắc']],
    body: [
      [`${salesData.totalLy} ly`, `${salesData.lyDen} ly`, `${salesData.lyTrang} ly`, `${salesData.lyHoaVan} ly`, `${salesData.lyTraTac} ly`]
    ],
    styles: { font: 'TimesNewRoman', fontSize: 9, cellPadding: 3, halign: 'center' },
    headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    theme: 'grid'
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 60;

  doc.setFontSize(11);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text('II. DANH SÁCH MÓN ĂN BÁN RA (XẾP THEO SỐ LƯỢNG GIẢM DẦN)', 14, finalY + 10);

  let totalQty = 0;
  let totalRevenue = 0;

  const salesTableData = salesData.sortedSales.map((item, idx) => {
    totalQty += item.quantity;
    totalRevenue += item.subtotal;
    return [
      idx + 1,
      item.name,
      `${item.quantity} ly`,
      fmtVND(item.price),
      fmtVND(item.subtotal)
    ];
  });

  salesTableData.push([
    '',
    'TỔNG CỘNG',
    `${totalQty} ly`,
    '',
    fmtVND(totalRevenue)
  ]);

  autoTable(doc, {
    startY: finalY + 14,
    head: [['STT', 'Tên sản phẩm', 'Số lượng bán', 'Đơn giá', 'Thành tiền']],
    body: salesTableData,
    styles: { font: 'TimesNewRoman', fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [74, 53, 37], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [250, 246, 240] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`BaoCaoBanHang_${startDate}_${endDate}.pdf`);
}

