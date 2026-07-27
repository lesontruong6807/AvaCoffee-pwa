import React from 'react';

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface ReceiptComponentProps {
  tableName?: string;
  staffName?: string;
  staffRole?: string;
  cart: CartItem[];
  totalAmount: number;
  orderTime?: string;
}

export default function ReceiptComponent({
  tableName,
  staffName,
  staffRole,
  cart,
  totalAmount,
  orderTime
}: ReceiptComponentProps) {
  if (!cart || cart.length === 0) return null;

  const formattedTime = orderTime || new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div id="receipt-print-area">
      {/* HEADER TÊN QUÁN */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase', marginBottom: '2px' }}>
        AVA COFFEE
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '2px' }}>
        Đ/C: 123 Nguyễn Văn Cừ, Q.5, TP.HCM
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '6px' }}>
        Hotline: 0901 234 567
      </div>

      {/* TIÊU ĐỀ PHIẾU */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', margin: '6px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0' }}>
        PHIẾU ĐẶT MÓN
      </div>

      {/* THÔNG TIN CHUNG */}
      <div style={{ fontSize: '11px', margin: '6px 0', lineHeight: '1.4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Bàn / Khách:</span>
          <strong style={{ textTransform: 'uppercase' }}>{tableName || 'Khách mang về'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Nhân viên:</span>
          <span>{staffName || 'Lê Sơn'} {staffRole ? `(${staffRole})` : ''}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Thời gian:</span>
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* DẤU GẠCH NGANG */}
      <div style={{ textAlign: 'center', margin: '4px 0', overflow: 'hidden' }}>
        --------------------------------
      </div>

      {/* DANH SÁCH MÓN */}
      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', margin: '4px 0' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
            <th style={{ padding: '3px 0', textAlign: 'left' }}>Tên món</th>
            <th style={{ padding: '3px 0', textAlign: 'center', width: '30px' }}>SL</th>
            <th style={{ padding: '3px 0', textAlign: 'right', width: '70px' }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.product_id} style={{ borderBottom: '1px dashed #ccc' }}>
              <td style={{ padding: '4px 0', paddingRight: '4px' }}>{item.name}</td>
              <td style={{ padding: '4px 0', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>
                {item.subtotal.toLocaleString('vi-VN')}đ
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DẤU GẠCH NGANG */}
      <div style={{ textAlign: 'center', margin: '4px 0', overflow: 'hidden' }}>
        --------------------------------
      </div>

      {/* TỔNG THANH TOÁN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0', fontWeight: 'bold', fontSize: '13px' }}>
        <span>TỔNG CỘNG:</span>
        <span style={{ fontSize: '15px' }}>{totalAmount.toLocaleString('vi-VN')}đ</span>
      </div>

      {/* DẤU GẠCH NGANG */}
      <div style={{ textAlign: 'center', margin: '4px 0', overflow: 'hidden' }}>
        --------------------------------
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', fontSize: '11px', fontStyle: 'italic', marginTop: '8px' }}>
        Cảm ơn quý khách & Hẹn gặp lại!
      </div>
    </div>
  );
}
