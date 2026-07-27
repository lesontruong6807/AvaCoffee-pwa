const express = require('express');
const cors = require('cors');
const net = require('net');

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to remove Vietnamese accents for clean thermal printing
function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỹ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

// Align a left label and a right value perfectly to 32 characters
function padLine(label, value) {
  const cleanLabel = removeVietnameseTones(label);
  const cleanVal = removeVietnameseTones(value);
  const spaceCount = 32 - cleanLabel.length - cleanVal.length;
  if (spaceCount <= 0) return cleanLabel + " " + cleanVal;
  return cleanLabel + " ".repeat(spaceCount) + cleanVal;
}

// Format each menu item line for a 32-column K80 receipt
function formatItemLine(name, qty, price) {
  const cleanName = removeVietnameseTones(name);
  const qtyStr = qty.toString();
  const priceStr = price.toLocaleString('vi-VN') + "d";

  if (cleanName.length <= 18) {
    const namePart = cleanName.padEnd(18, ' ');
    const qtyPart = qtyStr.padStart(4, ' ');
    const pricePart = priceStr.padStart(10, ' ');
    return namePart + qtyPart + pricePart;
  } else {
    // Wrap long item names: name on line 1, qty/price on line 2
    const firstLine = cleanName;
    const secondLine = "".padEnd(18, ' ') + qtyStr.padStart(4, ' ') + priceStr.padStart(10, ' ');
    return firstLine + "\n" + secondLine;
  }
}

app.post('/print', (req, res) => {
  const orderData = req.body;
  
  if (!orderData || !orderData.cart || orderData.cart.length === 0) {
    return res.status(400).json({ success: false, error: 'Data receipt is empty.' });
  }

  const printerIp = orderData.printerIp || '192.168.1.232';
  const printerPort = 9100;

  console.log(`Connecting to Zywell printer at ${printerIp}:${printerPort}...`);

  const client = new net.Socket();

  client.setTimeout(3500); // 3.5 seconds timeout

  client.connect(printerPort, printerIp, () => {
    console.log('Connected successfully. Formatting ESC/POS receipt data...');

    const buffers = [];

    // 1. Initialize printer
    buffers.push(Buffer.from([0x1B, 0x40]));

    // 2. Centered high-impact header
    buffers.push(Buffer.from([0x1B, 0x61, 0x01])); // Align Center
    buffers.push(Buffer.from([0x1D, 0x21, 0x11])); // Double Size
    buffers.push(Buffer.from([0x1B, 0x45, 0x01])); // Bold On
    buffers.push(Buffer.from("AVA COFFEE\n"));
    buffers.push(Buffer.from([0x1D, 0x21, 0x00])); // Normal Size
    buffers.push(Buffer.from([0x1B, 0x45, 0x00])); // Bold Off

    buffers.push(Buffer.from("D/C: 123 Nguyen Van Cu, Q.5, TP.HCM\n"));
    buffers.push(Buffer.from("Hotline: 0901 234 567\n\n"));

    // 3. Receipt Title
    buffers.push(Buffer.from([0x1B, 0x45, 0x01])); // Bold On
    buffers.push(Buffer.from("PHIEU DAT MON\n"));
    buffers.push(Buffer.from([0x1B, 0x45, 0x00])); // Bold Off
    buffers.push(Buffer.from("--------------------------------\n"));

    // 4. Details
    buffers.push(Buffer.from([0x1B, 0x61, 0x00])); // Align Left
    buffers.push(Buffer.from(padLine("Ban / Khach:", orderData.tableName || "Mang ve") + "\n"));
    buffers.push(Buffer.from(padLine("Nhan vien:", orderData.staffName || "Le Son") + "\n"));
    buffers.push(Buffer.from(padLine("Thoi gian:", orderData.orderTime || new Date().toLocaleString()) + "\n"));
    buffers.push(Buffer.from("--------------------------------\n"));

    // 5. Product items list header
    buffers.push(Buffer.from("Ten mon             SL  Thanh tien\n"));
    buffers.push(Buffer.from("--------------------------------\n"));

    // 6. Loop cart items
    orderData.cart.forEach(item => {
      buffers.push(Buffer.from(formatItemLine(item.name, item.quantity, item.subtotal) + "\n"));
    });

    buffers.push(Buffer.from("--------------------------------\n"));

    // 7. Total Amount
    buffers.push(Buffer.from([0x1B, 0x45, 0x01])); // Bold On
    buffers.push(Buffer.from(padLine("TONG CONG:", (orderData.totalAmount || 0).toLocaleString('vi-VN') + "d") + "\n"));
    buffers.push(Buffer.from([0x1B, 0x45, 0x00])); // Bold Off
    buffers.push(Buffer.from("--------------------------------\n\n"));

    // 8. Footer note
    buffers.push(Buffer.from([0x1B, 0x61, 0x01])); // Align Center
    buffers.push(Buffer.from("Cam on quy khach & Hen gap lai!\n\n\n\n\n"));

    // 9. Full Cut paper command
    buffers.push(Buffer.from([0x1D, 0x56, 0x41, 0x03]));

    // Write all buffers
    client.write(Buffer.concat(buffers), () => {
      console.log('Receipt data sent successfully. Closing socket...');
      client.destroy();
      res.json({ success: true });
    });
  });

  client.on('error', (err) => {
    console.error('Printer connection error:', err.message);
    client.destroy();
    res.status(500).json({ success: false, error: err.message });
  });

  client.on('timeout', () => {
    console.error('Printer connection timeout.');
    client.destroy();
    res.status(504).json({ success: false, error: 'Printer connection timeout.' });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`AVA Coffee Local Print Server running on port ${PORT}`);
  console.log(`Printer IP Address is set to 192.168.1.232:9100`);
  console.log(`==================================================`);
});
