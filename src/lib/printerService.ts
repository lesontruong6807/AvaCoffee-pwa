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

// Helper to format a single line row with left-aligned and right-aligned text
export function formatRow(left: string, right: string, totalWidth: number = 48): string {
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

// Build standard K80 format ESC/POS receipt data
export function buildReceiptBytes(orderData: OrderData, settings?: Partial<StoreSettings>): Uint8Array {
  const builder = new EscPosBuilder();
  const now = new Date().toLocaleString('vi-VN');
  const storeName = settings?.store_name || 'AVA COFFEE';

  // Header
  builder.alignCenter()
    .fontSizeDouble()
    .bold(true)
    .line(storeName)
    .fontSizeNormal()
    .bold(false);

  if (settings?.store_address) {
    builder.line(removeDiacritics(settings.store_address));
  }
  if (settings?.store_phone) {
    builder.line(`Hotline: ${settings.store_phone}`);
  }

  builder.line('------------------------------------------------') // 48 chars
    .feed(1);

  // Table & Order Info
  builder.alignLeft()
    .fontSizeDouble()
    .bold(true)
    .line(`BAN: ${orderData.tableName.toUpperCase()}`)
    .fontSizeNormal()
    .bold(false)
    .line(`Thoi gian: ${now}`);

  if (orderData.notes) {
    builder.line(`Ghi chu: ${removeDiacritics(orderData.notes)}`);
  }

  builder.line('------------------------------------------------');

  // Items Header
  builder.bold(true)
    .line(formatRow('Ten mon / Don gia', 'SL / T.Tien'))
    .bold(false)
    .line('------------------------------------------------');

  // Items List
  orderData.items.forEach((item, index) => {
    // Row 1: Name of the item
    builder.bold(true)
      .line(`${index + 1}. ${item.name}`)
      .bold(false);
    
    // Row 2: Details (e.g. "   2 x 25.000                     50.000đ")
    const priceStr = `${item.price.toLocaleString('vi-VN')}d`;
    const detailsLeft = `   ${item.quantity} x ${priceStr}`;
    const subtotalStr = `${item.subtotal.toLocaleString('vi-VN')}d`;
    builder.line(formatRow(detailsLeft, subtotalStr));
  });

  builder.line('------------------------------------------------');

  // Totals
  const totalItemsAmount = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
  builder.line(formatRow('Tong tien mon:', `${totalItemsAmount.toLocaleString('vi-VN')}d`));
  
  if (orderData.discount > 0) {
    builder.line(formatRow('Giam gia:', `-${orderData.discount.toLocaleString('vi-VN')}d`));
  }

  builder.bold(true)
    .line(formatRow('TONG THANH TOAN:', `${orderData.totalAmount.toLocaleString('vi-VN')}d`))
    .bold(false)
    .line('------------------------------------------------')
    .feed(1);

  // Footer
  builder.alignCenter().bold(true);
  if (settings?.bill_footer) {
    const lines = settings.bill_footer.split('\n');
    lines.forEach(l => {
      if (l.trim()) builder.line(removeDiacritics(l.trim()));
    });
  } else {
    builder.line('AVA COFFEE XIN CAM ON !')
      .line('CHUC QUY KHACH NGON MIENG');
  }
  builder.bold(false)
    .feed(4) // Feed 4 lines before cutting to clear the print head
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
  builder.alignCenter()
    .fontSizeDouble()
    .bold(true)
    .line(removeDiacritics(currentSettings.store_name || 'AVA COFFEE'))
    .fontSizeNormal()
    .bold(false)
    .line('------------------------------------------------')
    .feed(1)
    .bold(true)
    .line('*** KIEM TRA KET NOI MAY IN ***')
    .bold(false)
    .line(`Dia chi IP : ${targetIP}`)
    .line(`Cong Port  : ${targetPort}`)
    .line(`Thoi gian  : ${new Date().toLocaleString('vi-VN')}`)
    .feed(1)
    .line('------------------------------------------------')
    .bold(true)
    .line('KET NOI MAY IN THANH CONG 100% !')
    .line('SAN SANG IN BILL CHO KHACH HANG')
    .bold(false)
    .line('------------------------------------------------')
    .feed(4)
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
