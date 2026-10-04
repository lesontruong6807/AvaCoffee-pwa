import { Capacitor } from '@capacitor/core';
import { db, StoreSettings } from '@/lib/database';

// Helper to remove Vietnamese diacritics (accents) to ensure correct printing on any device
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đđ]/g, 'd')
    .replace(/[ĐĐ]/g, 'D')
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[^ -~]/g, ''); // Keep only basic printable ASCII characters (space to tilde)
}

// Cấu hình chiều rộng chuẩn cho máy in nhiệt K80/K58 (40 ký tự giúp không bị tràn lề)
export const RECEIPT_WIDTH = 40;

// Helper to format receipt time in short format (e.g. "19:30 19/09")
export function formatShortReceiptTime(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${h}:${min} ${d}/${m}`;
}

// Helper to format a single line row with left-aligned and right-aligned text
export function formatRow(left: string, right: string, totalWidth: number = RECEIPT_WIDTH): string {
  const leftClean = removeDiacritics(left);
  const rightClean = removeDiacritics(right);
  const leftLen = leftClean.length;
  const rightLen = rightClean.length;
  const spacesNeeded = totalWidth - leftLen - rightLen;
  if (spacesNeeded <= 0) {
    // If the content is too long, truncate left part to fit
    const truncatedLeft = leftClean.slice(0, Math.max(5, totalWidth - rightLen - 1));
    const newSpaces = totalWidth - truncatedLeft.length - rightLen;
    return truncatedLeft + ' '.repeat(Math.max(1, newSpaces)) + rightClean;
  }
  return leftClean + ' '.repeat(spacesNeeded) + rightClean;
}

// Helper to format item row in 3 columns: Ten mon (22 chars) | SL (5 chars) | Gia (13 chars)
export function formatThreeColumns(
  name: string,
  qty: number,
  subtotal: number,
  index: number,
  totalWidth: number = RECEIPT_WIDTH
): string[] {
  const nameWidth = totalWidth - 5 - 13; // 40 - 5 - 13 = 22 chars
  const cleanName = removeDiacritics(`${index}. ${name}`);
  const qtyStr = String(qty);
  const priceStr = `${subtotal.toLocaleString('vi-VN')}d`;

  if (cleanName.length <= nameWidth) {
    const line = cleanName.padEnd(nameWidth) + qtyStr.padStart(5) + priceStr.padStart(13);
    return [line];
  } else {
    // Tên món dài: Dòng 1 in trọn vẹn tên món, dòng 2 in số lượng & giá căn chuẩn theo cột
    const line1 = cleanName;
    const line2 = ''.padEnd(nameWidth) + qtyStr.padStart(5) + priceStr.padStart(13);
    return [line1, line2];
  }
}

// ESC/POS Command Builder Class
class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init() {
    this.buffer.push(0x1B, 0x40); // Initialize printer (ESC @)
    return this;
  }

  alignCenter() {
    this.buffer.push(0x1B, 0x61, 0x01); // Align center (ESC a 1)
    return this;
  }

  alignLeft() {
    this.buffer.push(0x1B, 0x61, 0x00); // Align left (ESC a 0)
    return this;
  }

  alignRight() {
    this.buffer.push(0x1B, 0x61, 0x02); // Align right (ESC a 2)
    return this;
  }

  bold(on: boolean) {
    this.buffer.push(0x1B, 0x45, on ? 0x01 : 0x00); // Bold on/off (ESC E n)
    return this;
  }

  fontSizeDouble() {
    this.buffer.push(0x1D, 0x21, 0x11); // Double width + Double height (GS ! 17)
    return this;
  }

  fontSizeNormal() {
    this.buffer.push(0x1D, 0x21, 0x00); // Normal font size (GS ! 0)
    return this;
  }

  text(str: string) {
    const cleanStr = removeDiacritics(str);
    for (let i = 0; i < cleanStr.length; i++) {
      this.buffer.push(cleanStr.charCodeAt(i));
    }
    return this;
  }

  line(str: string = '') {
    this.text(str);
    this.buffer.push(0x0A); // Line feed (LF)
    return this;
  }

  feed(lines: number = 1) {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  cut() {
    this.buffer.push(0x1D, 0x56, 0x00); // Cut paper (GS V 0)
    return this;
  }

  getBuffer(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface OrderData {
  tableName: string;
  staffName: string;
  items: OrderItem[];
  discount: number;
  totalAmount: number;
  orderId: string;
  notes?: string;
}

// Build compact, paper-saving ESC/POS receipt data
export function buildReceiptBytes(orderData: OrderData, settings?: Partial<StoreSettings>): Uint8Array {
  const builder = new EscPosBuilder();
  const timeFormatted = formatShortReceiptTime(new Date());
  const storeName = settings?.store_name || 'AVA COFFEE';
  const divider = '-'.repeat(RECEIPT_WIDTH);

  // 1. Header quán (Bỏ SĐT, dùng địa chỉ mới)
  builder.alignCenter()
    .fontSizeDouble()
    .bold(true)
    .line(storeName)
    .fontSizeNormal()
    .bold(false);

  const address = settings?.store_address || 'Le Thi Mai, Xuan Thoi Thuong, Tp. Ho Chi Minh';
  if (address) {
    builder.line(removeDiacritics(address));
  }

  builder.line(divider);

  // 2. Thông tin Bàn & Giờ
  builder.alignLeft()
    .bold(true)
    .line(formatRow(`BAN: ${orderData.tableName.toUpperCase()}`, timeFormatted, RECEIPT_WIDTH))
    .bold(false);

  if (orderData.notes && orderData.notes.trim()) {
    builder.line(`Ghi chu: ${removeDiacritics(orderData.notes.trim())}`);
  }

  builder.line(divider);

  // 3. Header 3 cột chuẩn: Ten mon | SL | Gia
  const colHeader = 'Ten mon'.padEnd(22) + 'SL'.padStart(5) + 'Gia'.padStart(13);
  builder.line(colHeader);
  builder.line(divider);

  // 4. Danh sách món (in 3 cột đầy đủ)
  orderData.items.forEach((item, index) => {
    const lines = formatThreeColumns(item.name, item.quantity, item.subtotal, index + 1, RECEIPT_WIDTH);
    lines.forEach(l => builder.line(l));
  });

  builder.line(divider);

  // 5. Tổng tiền (Chi tiết giảm giá nếu có)
  if (orderData.discount > 0) {
    const totalItemsAmount = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
    builder.line(formatRow('Tien mon:', `${totalItemsAmount.toLocaleString('vi-VN')}d`, RECEIPT_WIDTH));
    builder.line(formatRow('Giam gia:', `-${orderData.discount.toLocaleString('vi-VN')}d`, RECEIPT_WIDTH));
  }

  // Dòng Tổng cộng in đậm nổi bật
  builder.bold(true)
    .line(formatRow('TONG CONG:', `${orderData.totalAmount.toLocaleString('vi-VN')}d`, RECEIPT_WIDTH))
    .bold(false)
    .line(divider);

  // 6. Chân trang & Feed đủ khoảng cách tới lưỡi dao cắt (~20mm = feed 5 dòng)
  builder.alignCenter();
  if (settings?.bill_footer && settings.bill_footer.trim()) {
    const lines = settings.bill_footer.split('\n');
    lines.forEach(l => {
      if (l.trim()) builder.line(removeDiacritics(l.trim()));
    });
  } else {
    builder.line('AVA COFFEE XIN CAM ON QUY KHACH !');
    builder.line('CHUC QUY KHACH NGON MIENG');
  }

  // Feed 5 dòng để đẩy trọn vẹn dòng cảm ơn qua khỏi lưỡi dao trước khi cắt
  builder.feed(5)
    .cut();

  return builder.getBuffer();
}

// Print order directly via TCP Socket
export async function printOrderDirect(
  orderData: OrderData,
  printerIP?: string,
  port?: number
): Promise<void> {
  const storeSettings = db.getStoreSettingsSync();
  const targetIP = printerIP || storeSettings.printer_ip || '192.168.1.232';
  const targetPort = port || storeSettings.printer_port || 9100;

  // If not running in native Capacitor platform, do not try to open TCP connection
  if (!Capacitor.isNativePlatform()) {
    console.log('[Web/Browser Dev Mode] Skipping TCP socket print. Order data:', orderData);
    return;
  }

  console.log(`[Native Mode] Initiating TCP printing to ${targetIP}:${targetPort}`);
  
  let connection: any = null;
  try {
    // Dynamic import of the plugin to ensure it's not resolved during web SSR builds
    const { TCPClient } = await import('@devioarts/capacitor-tcpclient');

    const receiptBytes = buildReceiptBytes(orderData, storeSettings);
    
    // Create socket connection
    const connectionId = `printer-${Date.now()}`;
    connection = TCPClient.createConnection({
      connectionId,
      host: targetIP,
      port: targetPort
    });

    console.log('[TCP] Connecting to printer...');
    await connection.connect();
    
    console.log('[TCP] Connected. Sending ESC/POS payload...');
    await connection.write({ data: receiptBytes });
    
    console.log('[TCP] Print payload sent successfully.');
  } catch (error) {
    console.error('[TCP Print Error] Failed to print order:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        console.log('[TCP] Closing connection...');
        await connection.destroy();
      } catch (err) {
        console.error('[TCP Close Error] Failed to destroy connection:', err);
      }
    }
  }
}

// In thử kết nối máy in (Test Ticket)
export async function printTestTicket(settings?: Partial<StoreSettings>): Promise<{ success: boolean; isWeb?: boolean; message: string }> {
  // Kiểm tra môi trường Web: Trình duyệt web không thể mở TCP socket trực tiếp
  if (!Capacitor.isNativePlatform()) {
    return {
      success: false,
      isWeb: true,
      message: 'Tính năng in trực tiếp qua mạng LAN chỉ hoạt động trên App Android (APK/máy POS). Cấu hình này đã được lưu để máy POS sử dụng!'
    };
  }

  const currentSettings = { ...db.getStoreSettingsSync(), ...settings };
  const targetIP = currentSettings.printer_ip || '192.168.1.232';
  const targetPort = Number(currentSettings.printer_port || 9100);

  const builder = new EscPosBuilder();
  const divider = '-'.repeat(RECEIPT_WIDTH);
  builder.alignCenter()
    .fontSizeDouble()
    .bold(true)
    .line(removeDiacritics(currentSettings.store_name || 'AVA COFFEE'))
    .fontSizeNormal()
    .bold(false)
    .line(divider)
    .bold(true)
    .line('*** TEST KET NOI MAY IN ***')
    .bold(false)
    .line(`IP: ${targetIP}  Port: ${targetPort}`)
    .line(`Gio: ${formatShortReceiptTime(new Date())}`)
    .line(divider)
    .bold(true)
    .line('KET NOI THANH CONG 100%!')
    .bold(false)
    .line(divider)
    .feed(5)
    .cut();

  const payload = builder.getBuffer();
  let connection: any = null;

  try {
    const { TCPClient } = await import('@devioarts/capacitor-tcpclient');
    const connectionId = `printer-test-${Date.now()}`;
    connection = TCPClient.createConnection({
      connectionId,
      host: targetIP,
      port: targetPort
    });

    await connection.connect();
    await connection.write({ data: payload });
    return {
      success: true,
      message: `In test thành công tới máy in ${targetIP}:${targetPort}!`
    };
  } catch (err: any) {
    console.error('[TCP Test Print Error]:', err);
    return {
      success: false,
      message: `Không thể kết nối máy in ${targetIP}:${targetPort}: ${err?.message || 'Vui lòng kiểm tra IP máy in và kết nối Wi-Fi/LAN!'}`
    };
  } finally {
    if (connection) {
      try {
        await connection.destroy();
      } catch (e) {
        console.error('[TCP Test Close Error]:', e);
      }
    }
  }
}
