'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, getCurrentUser } from '@/lib/database';
import { BarChart3, Clock, DollarSign, ShoppingBag, TrendingUp, ShieldCheck, Calendar, ArrowRightLeft, ArrowLeft } from 'lucide-react';

export default function DailyReportPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeShiftFilter, setActiveShiftFilter] = useState<'morning' | 'afternoon' | 'both'>('both');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allOrders, allLogs, allItems, allRecipes] = await Promise.all([
        db.getOrders(),
        db.getInventoryLogs(),
        db.getAllOrderItems(),
        db.getRecipes()
      ]);
      setOrders(allOrders);
      setInventoryLogs(allLogs);
      setOrderItems(allItems);
      setRecipes(allRecipes);
    } catch (e) {
      console.error('Lỗi khi tải hóa đơn báo cáo:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadData();
  }, []);

  // 1. Chỉ lấy hóa đơn đã thanh toán trong ngày hôm nay (dựa trên toDateString)
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(o => {
    if (o.payment_status !== 'Đã thanh toán') return false;
    const orderDate = new Date(o.created_at);
    return orderDate.toDateString() === todayStr;
  });

  const todayLogs = inventoryLogs.filter(l => {
    const logDate = new Date(l.created_at);
    return logDate.toDateString() === todayStr && l.type === 'Nhập kho';
  });

  // 2. Phân loại theo Ca làm việc
  // Ca sáng: 6h - 14h (6:00:00 - 13:59:59)
  const morningOrders = todayOrders.filter(o => {
    const hour = new Date(o.created_at).getHours();
    return hour >= 6 && hour < 14;
  });
  const morningLogs = todayLogs.filter(l => {
    const hour = new Date(l.created_at).getHours();
    return hour >= 6 && hour < 14;
  });

  // Ca chiều: 14h - 22h (và các giờ muộn/sớm khác ngoài ca sáng)
  const afternoonOrders = todayOrders.filter(o => {
    const hour = new Date(o.created_at).getHours();
    return hour >= 14 || hour < 6;
  });
  const afternoonLogs = todayLogs.filter(l => {
    const hour = new Date(l.created_at).getHours();
    return hour >= 14 || hour < 6;
  });

  // 3. Hàm tính toán các chỉ số cho từng ca
  const calculateMetrics = (shiftOrders: any[], shiftLogs: any[]) => {
    const totalDiscount = shiftOrders.reduce((sum, o) => sum + Number(o.discount || 0), 0);
    const grossRevenue = shiftOrders.reduce((sum, o) => sum + Number(o.total_amount), 0) + totalDiscount;
    const totalCash = shiftOrders.filter(o => o.payment_method === 'Tiền mặt').reduce((sum, o) => sum + Number(o.total_amount) + Number(o.discount || 0), 0);
    const totalTransfer = shiftOrders.filter(o => o.payment_method === 'Chuyển khoản').reduce((sum, o) => sum + Number(o.total_amount) + Number(o.discount || 0), 0);
    
    // Tổng chi phí nhập kho + Giảm giá
    const restockCosts = shiftLogs.reduce((sum, l) => sum + Number(l.cost || 0), 0);
    const restockExpenses = restockCosts + totalDiscount; 
    const restockItems = shiftLogs;

    // Tiền mặt hiện tại sau khi trừ chi phí thực tế
    const currentCash = Math.max(0, totalCash - restockCosts);
    // Doanh thu thực tế sau khi trừ chi phí nhập & giảm giá
    const netRevenue = grossRevenue - restockExpenses;

    // --- Tính toán thống kê bán hàng ---
    const shiftItems = orderItems.filter(item => shiftOrders.some(o => o.id === item.order_id));
    const salesMap: { [key: string]: { name: string; quantity: number; price: number; subtotal: number } } = {};
    
    shiftItems.forEach(item => {
      const prodId = item.product_id;
      const qty = Number(item.quantity || 0);
      const price = Number(item.unit_price || item.products?.price || 0);
      if (!salesMap[prodId]) {
        salesMap[prodId] = {
          name: item.products?.name || item.ten_san_pham || 'Sản phẩm',
          quantity: 0,
          price: price,
          subtotal: 0
        };
      }
      salesMap[prodId].quantity += qty;
      salesMap[prodId].subtotal += (qty * price);
    });

    const sortedSales = Object.values(salesMap).sort((a, b) => b.quantity - a.quantity);

    let lyDen = 0;
    let lyTrang = 0;
    let lyHoaVan = 0;
    let lyTraTac = 0;

    shiftItems.forEach(item => {
      const prodId = item.product_id;
      const qty = Number(item.quantity || 0);
      const prodRecipes = recipes.filter(r => r.product_id === prodId);
      
      prodRecipes.forEach(r => {
        if (r.ingredient_id === 'ing_lyden') {
          lyDen += Number(r.quantity_needed || 0) * qty;
        } else if (r.ingredient_id === 'ing_lytrang') {
          lyTrang += Number(r.quantity_needed || 0) * qty;
        } else if (r.ingredient_id === 'ing_lyhoavan') {
          lyHoaVan += Number(r.quantity_needed || 0) * qty;
        } else if (r.ingredient_id === 'ing_lytratac') {
          lyTraTac += Number(r.quantity_needed || 0) * qty;
        }
      });
    });

    const totalLy = lyDen + lyTrang + lyHoaVan + lyTraTac;

    return {
      orders: shiftOrders,
      grossRevenue,
      totalCash,
      totalTransfer,
      restockExpenses,
      restockItems,
      currentCash,
      netRevenue,
      sales: {
        sortedSales,
        lyDen,
        lyTrang,
        lyHoaVan,
        lyTraTac,
        totalLy
      }
    };
  };

  const morning = calculateMetrics(morningOrders, morningLogs);
  const afternoon = calculateMetrics(afternoonOrders, afternoonLogs);
  const bothShifts = calculateMetrics(todayOrders, todayLogs);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-coffee-primary animate-spin" />
        <p className="text-coffee-medium font-medium">Đang tính toán báo cáo doanh thu ca...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      <Link 
        href="/"
        className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-coffee-light text-coffee-primary rounded-xl text-xs font-bold hover:bg-coffee-light transition shadow-sm w-fit animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về Trang chủ</span>
      </Link>

      {/* Tiêu đề & Ngày */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-coffee-light">
        <div>
          <span className="text-xs font-bold text-coffee-medium uppercase tracking-wider">Doanh thu ngày hôm nay</span>
          <h2 className="font-black text-2xl text-coffee-dark flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-coffee-primary" />
            <span>Báo cáo doanh thu ca trực</span>
          </h2>
        </div>
        <div className="px-4 py-2 bg-white border border-coffee-light text-coffee-primary rounded-xl text-xs font-bold flex items-center space-x-2 w-fit shadow-sm">
          <Calendar className="w-4 h-4" />
          <span>Ngày: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Bộ lọc chọn Ca */}
      <div className="flex bg-white p-1 rounded-2xl border border-coffee-light w-fit shadow-sm gap-1 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveShiftFilter('both')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
            activeShiftFilter === 'both'
              ? 'bg-coffee-primary text-white shadow-sm'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          Cả hai ca
        </button>
        <button
          onClick={() => setActiveShiftFilter('morning')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
            activeShiftFilter === 'morning'
              ? 'bg-coffee-primary text-white shadow-sm'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          Ca Sáng (6h - 14h)
        </button>
        <button
          onClick={() => setActiveShiftFilter('afternoon')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
            activeShiftFilter === 'afternoon'
              ? 'bg-coffee-primary text-white shadow-sm'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          Ca Chiều (14h - 22h)
        </button>
      </div>

      {activeShiftFilter === 'both' ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-coffee-primary text-white p-5 rounded-3xl shadow flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg">Cả Hai Ca</h3>
              <p className="text-xs text-coffee-accent/80 font-medium">Tổng hợp ca làm việc: 06:00 - 22:00</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-white/20 rounded-full">
              {bothShifts.orders.length} Đơn hàng
            </span>
          </div>
          <ShiftMetricsSection metrics={bothShifts} onRefresh={loadData} />
        </div>
      ) : activeShiftFilter === 'morning' ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-coffee-primary text-white p-5 rounded-3xl shadow flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg">Ca Sáng</h3>
              <p className="text-xs text-coffee-accent/80 font-medium">Khung giờ hoạt động: 06:00 - 14:00</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-white/20 rounded-full">
              {morning.orders.length} Đơn hàng
            </span>
          </div>
          <ShiftMetricsSection metrics={morning} onRefresh={loadData} />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-coffee-dark text-white p-5 rounded-3xl shadow flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg">Ca Chiều</h3>
              <p className="text-xs text-coffee-accent/80 font-medium">Khung giờ hoạt động: 14:00 - 22:00</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-white/20 rounded-full">
              {afternoon.orders.length} Đơn hàng
            </span>
          </div>
          <ShiftMetricsSection metrics={afternoon} onRefresh={loadData} />
        </div>
      )}
    </div>
  );
}

// Component phụ hiển thị các chỉ số chi tiết cho từng ca
function ShiftMetricsSection({ metrics, onRefresh }: { metrics: any; onRefresh: () => void }) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    const isConfirm = window.confirm(
      `⚠️ CẢNH BÁO: Bạn có chắc chắn muốn HỦY HÓA ĐƠN #${orderId.substring(0, 6)} không?\n\n` +
      `- Thao tác này sẽ XÓA VĨNH VIỄN hóa đơn khỏi hệ thống.\n` +
      `- Nguyên liệu đã trừ của các món trong hóa đơn này sẽ được HOÀN LẠI KHO.\n` +
      `- Số tiền của hóa đơn sẽ bị trừ ra khỏi doanh thu ca.\n\n` +
      `Bạn có muốn tiếp tục?`
    );
    if (!isConfirm) return;

    setCancelingId(orderId);
    try {
      const success = await db.cancelPaidOrder(orderId);
      if (success) {
        alert('Đã hủy hóa đơn và hoàn kho nguyên liệu thành công!');
        onRefresh();
      } else {
        alert('Lỗi: Không thể hủy hóa đơn. Vui lòng kiểm tra kết nối.');
      }
    } catch (e) {
      console.error(e);
      alert('Đã xảy ra lỗi khi hủy hóa đơn.');
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chỉ số chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-coffee-light flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider block">Doanh thu ca</span>
            <span className="font-black text-xl text-coffee-primary">{metrics.grossRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="p-2.5 bg-green-50 rounded-xl text-green-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-coffee-light flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider block">Chi phí nhập / giảm giá</span>
            <span className="font-black text-xl text-red-600">-{metrics.restockExpenses.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="p-2.5 bg-red-50 rounded-xl text-red-700">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-coffee-light flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider block">Hóa đơn thành công</span>
            <span className="font-black text-xl text-coffee-primary">{metrics.orders.length} đơn</span>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-700">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-coffee-light flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider block">Doanh thu thực tế ca</span>
            <span className="font-black text-xl text-emerald-700">{metrics.netRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Báo cáo bán hàng (Món ăn & Ly) */}
      <div className="bg-white p-5 rounded-2xl border border-coffee-light shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-coffee-dark uppercase tracking-wider flex items-center justify-between border-b border-coffee-light pb-2.5">
          <span>📊 Báo cáo bán hàng (Món ăn & Ly)</span>
          <span className="text-[10px] text-coffee-medium font-bold uppercase">Tổng cộng: {metrics.sales.totalLy} ly</span>
        </h4>

        {/* Thống kê chi tiết các loại ly */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#FAF6F0] p-4 rounded-2xl border border-coffee-light/60">
          <div className="text-center space-y-0.5">
            <span className="text-[10px] text-coffee-medium uppercase font-bold block">Tổng Ly</span>
            <span className="font-black text-base text-coffee-primary">{metrics.sales.totalLy}</span>
          </div>
          <div className="text-center space-y-0.5 border-l border-coffee-light/60">
            <span className="text-[10px] text-coffee-medium uppercase font-bold block">Ly Đen AVA</span>
            <span className="font-black text-base text-coffee-dark">{metrics.sales.lyDen}</span>
          </div>
          <div className="text-center space-y-0.5 border-l border-coffee-light/60">
            <span className="text-[10px] text-coffee-medium uppercase font-bold block">Ly Trắng AVA</span>
            <span className="font-black text-base text-coffee-dark">{metrics.sales.lyTrang}</span>
          </div>
          <div className="text-center space-y-0.5 border-l border-coffee-light/60">
            <span className="text-[10px] text-coffee-medium uppercase font-bold block">Ly Trắng H.Văn AVA</span>
            <span className="font-black text-base text-coffee-dark">{metrics.sales.lyHoaVan}</span>
          </div>
          <div className="text-center space-y-0.5 border-l border-coffee-light/60">
            <span className="text-[10px] text-coffee-medium uppercase font-bold block">Ly Trà Tắc AVA</span>
            <span className="font-black text-base text-coffee-dark">{metrics.sales.lyTraTac}</span>
          </div>
        </div>

        {/* Bảng danh sách món ăn đã bán */}
        <div className="overflow-x-auto rounded-xl border border-coffee-light/80">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-coffee-light/40 border-b border-coffee-light text-coffee-medium text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3">Tên món</th>
                <th className="py-2.5 px-3 text-center">Số lượng</th>
                <th className="py-2.5 px-3 text-right">Đơn giá</th>
                <th className="py-2.5 px-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-light/35">
              {metrics.sales.sortedSales.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-coffee-light/10 text-xs font-medium text-coffee-dark transition whitespace-nowrap">
                  <td className="py-2.5 px-3 text-center text-coffee-medium font-mono">{index + 1}</td>
                  <td className="py-2.5 px-3 font-extrabold text-coffee-dark">{item.name || item.product_name || 'Món ăn'}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-coffee-medium">{item.quantity} ly</td>
                  <td className="py-2.5 px-3 text-right text-coffee-medium">{Number(item.price || 0).toLocaleString('vi-VN')}đ</td>
                  <td className="py-2.5 px-3 text-right font-bold text-coffee-primary">{Number(item.subtotal || 0).toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng tính dòng tiền thực tế */}
      <div className="bg-white p-5 rounded-2xl border border-coffee-light shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-coffee-dark uppercase tracking-wider border-b border-coffee-light pb-2.5">
          💵 Bảng tính dòng tiền thực tế ca
        </h4>
        <div className="space-y-3 text-xs text-coffee-dark font-medium">
          {/* Thanh Tiền mặt */}
          <div className="flex justify-between items-center bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 font-bold">
            <span className="text-amber-900">+ Doanh thu Tiền mặt (cả giảm giá):</span>
            <span className="font-extrabold text-amber-900 text-sm">+{metrics.totalCash.toLocaleString('vi-VN')}đ</span>
          </div>

          {/* Thanh Chuyển khoản */}
          <div className="flex justify-between items-center bg-blue-50/70 p-3 rounded-xl border border-blue-200/60 font-bold">
            <span className="text-blue-900">+ Doanh thu Chuyển khoản (Ngân hàng):</span>
            <span className="font-extrabold text-blue-900 text-sm">+{metrics.totalTransfer.toLocaleString('vi-VN')}đ</span>
          </div>

          {metrics.restockItems.length > 0 ? (
            <div className="space-y-1.5 bg-[#FAF6F0] p-3 rounded-xl border border-coffee-light/45">
              <span className="text-[10px] text-coffee-medium uppercase font-bold block">Chi tiết chi phí nhập trong ca:</span>
              {metrics.restockItems.map((log: any) => (
                <div key={log.id} className="flex justify-between text-[11px] text-red-700 font-semibold">
                  <span>• {log.note || `Nhập ${log.custom_ingredient_name || 'Nguyên liệu'}`}</span>
                  <span>-{Number(log.cost || 0).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-between items-center text-coffee-medium/70 text-[11px] px-1">
              <span>- Chi phí nhập/phát sinh:</span>
              <span>0đ</span>
            </div>
          )}

          <div className="flex justify-between items-center p-3 bg-amber-100/40 rounded-xl border border-amber-200 font-extrabold text-coffee-dark text-sm">
            <span>👉 Tiền mặt thực tế trong két:</span>
            <span className="text-amber-900 text-base">{metrics.currentCash.toLocaleString('vi-VN')}đ</span>
          </div>

          <div className="flex justify-between items-center p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 font-black text-base text-emerald-900">
            <span>= Doanh thu thực tế ca:</span>
            <span className="text-lg">{metrics.netRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      {/* Lịch sử đơn hàng trong ca */}
      <div className="bg-white p-5 rounded-2xl border border-coffee-light shadow-sm space-y-3">
        <h4 className="font-bold text-xs text-coffee-dark uppercase tracking-wider">Hóa đơn trong ca</h4>
        {metrics.orders.length === 0 ? (
          <p className="text-xs text-coffee-medium/70 italic text-center py-4">Chưa có giao dịch phát sinh trong ca này.</p>
        ) : (
          <div className="space-y-3">
            <div className="divide-y divide-coffee-light/60">
              {metrics.orders.slice(0, 10).map((order: any) => {
                const date = new Date(order.created_at);
                const hh = String(date.getHours()).padStart(2, '0');
                const mm = String(date.getMinutes()).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const mMonth = String(date.getMonth() + 1).padStart(2, '0');
                const timeFormatted = `${hh}:${mm} - ${dd}/${mMonth}`;
                return (
                  <div key={order.id} className="py-3.5 space-y-2 text-xs animate-fade-in">
                    {/* Hàng 1: Mã HĐ và Giờ */}
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-coffee-dark uppercase">#{order.id.substring(0, 6)}</span>
                      <span className="text-[10px] text-coffee-medium font-medium">{timeFormatted}</span>
                    </div>
                    {/* Hàng 2: Bàn, hình thức thanh toán, tổng tiền */}
                    <div className="flex justify-between items-center text-[11px]">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-semibold text-coffee-dark bg-coffee-light px-2 py-0.5 rounded">{order.tables?.table_name || 'Khách mang về'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                          order.payment_method === 'Tiền mặt' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.payment_method}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-coffee-primary mr-1">{order.total_amount.toLocaleString('vi-VN')}đ</span>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelingId !== null}
                          className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-[10px] font-bold transition disabled:opacity-50 flex items-center space-x-1"
                        >
                          <span>Hủy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {metrics.orders.length > 10 && (
              <p className="text-[10px] text-coffee-medium text-center pt-2 italic border-t border-coffee-light/40">Hiển thị 10 hóa đơn gần nhất...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Loader icon component locally declared just in case
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
