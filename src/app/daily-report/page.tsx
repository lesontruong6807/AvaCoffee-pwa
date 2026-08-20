'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, getCurrentUser } from '@/lib/database';
import { toast } from '@/lib/toast';
import { BarChart3, Clock, DollarSign, ShoppingBag, TrendingUp, ShieldCheck, Calendar, ArrowRightLeft, ArrowLeft } from 'lucide-react';

export default function DailyReportPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeShiftFilter, setActiveShiftFilter] = useState<'morning' | 'afternoon' | 'both'>('both');

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
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
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadData();

    // 1. Realtime listener cho báo cáo ca trực (Đơn hàng, Chi phí, Nhập kho)
    const unsubscribe = db.subscribeToReportChanges(() => {
      loadData(true);
    });

    // 2. Tự động kiểm tra & đồng bộ khi mở sáng màn hình / kết nối mạng lại
    const handleWakeup = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadData(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', handleWakeup);
      window.addEventListener('focus', handleWakeup);
      window.addEventListener('online', handleWakeup);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', handleWakeup);
        window.removeEventListener('focus', handleWakeup);
        window.removeEventListener('online', handleWakeup);
      }
    };
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
    return logDate.toDateString() === todayStr && l.type === 'Nhập kho' && l.status !== 'Từ chối';
  });

  // 2. Phân loại theo Ca làm việc
  // Ca sáng: 0h00 - 15h30 (tất cả order/chi phí từ 00:00 đến 15:29:59)
  const morningOrders = todayOrders.filter(o => {
    const d = new Date(o.created_at);
    const mins = d.getHours() * 60 + d.getMinutes();
    return mins < (15 * 60 + 30);
  });
  const morningLogs = todayLogs.filter(l => {
    const d = new Date(l.created_at);
    const mins = d.getHours() * 60 + d.getMinutes();
    return mins < (15 * 60 + 30);
  });

  // Ca chiều: 15h30 - 23h59 (tất cả order/chi phí từ 15:30 trở đi)
  const afternoonOrders = todayOrders.filter(o => {
    const d = new Date(o.created_at);
    const mins = d.getHours() * 60 + d.getMinutes();
    return mins >= (15 * 60 + 30);
  });
  const afternoonLogs = todayLogs.filter(l => {
    const d = new Date(l.created_at);
    const mins = d.getHours() * 60 + d.getMinutes();
    return mins >= (15 * 60 + 30);
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

    // Doanh thu thực tế sau khi trừ chi phí nhập & giảm giá
    const netRevenue = grossRevenue - restockExpenses;

    // Tiền mặt hiện tại sau khi trừ chi phí thực tế (Tiền mặt thực tế = Doanh thu thực tế ca - Chuyển khoản)
    const currentCash = Math.max(0, netRevenue - totalTransfer);

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
      totalDiscount,
      restockCosts,
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
          Ca Sáng (5h30 - 12h)
        </button>
        <button
          onClick={() => setActiveShiftFilter('afternoon')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
            activeShiftFilter === 'afternoon'
              ? 'bg-coffee-primary text-white shadow-sm'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          Ca Chiều (16h - 21h30)
        </button>
      </div>

      {activeShiftFilter === 'both' ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-coffee-primary text-white p-5 rounded-3xl shadow flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg">Cả Hai Ca</h3>
              <p className="text-xs text-coffee-accent/80 font-medium">Tổng hợp toàn bộ ngày làm việc (00:00 - 23:59)</p>
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
              <p className="text-xs text-coffee-accent/80 font-medium">Ca làm: 05:30 - 12:00 (Ghi nhận đơn: 00:00 - 15:30)</p>
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
              <p className="text-xs text-coffee-accent/80 font-medium">Ca làm: 16:00 - 21:00 (Ghi nhận đơn: 15:30 - 23:59)</p>
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedOrderItems, setExpandedOrderItems] = useState<any[]>([]);
  const [loadingExpandedItems, setLoadingExpandedItems] = useState<boolean>(false);

  useEffect(() => {
    if (!expandedOrderId) {
      setExpandedOrderItems([]);
      return;
    }
    async function fetchExpandedItems() {
      const orderId = expandedOrderId;
      if (!orderId) return;
      setLoadingExpandedItems(true);
      try {
        const items = await db.getOrderItems(orderId);
        setExpandedOrderItems(items || []);
      } catch (e) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', e);
        toast.error('Không thể tải chi tiết sản phẩm.');
      } finally {
        setLoadingExpandedItems(false);
      }
    }
    fetchExpandedItems();
  }, [expandedOrderId]);

  // Reset page when metrics change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedOrderId(null);
  }, [metrics]);

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
          {/* Doanh thu Tiền mặt */}
          <div className="flex justify-between items-center bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 font-bold">
            <span className="text-amber-900">Doanh thu Tiền mặt:</span>
            <span className="font-extrabold text-amber-900 text-sm">+{metrics.totalCash.toLocaleString('vi-VN')}đ</span>
          </div>

          {/* Doanh thu Chuyển khoản */}
          <div className="flex justify-between items-center bg-blue-50/70 p-3 rounded-xl border border-blue-200/60 font-bold">
            <span className="text-blue-900">Doanh thu Chuyển khoản:</span>
            <span className="font-extrabold text-blue-900 text-sm">+{metrics.totalTransfer.toLocaleString('vi-VN')}đ</span>
          </div>

          {/* Giảm giá */}
          <div className="flex justify-between items-center bg-red-50/60 p-3 rounded-xl border border-red-200/50 font-bold">
            <span className="text-red-950">Giảm giá:</span>
            <span className="font-extrabold text-red-950 text-sm">-{metrics.totalDiscount.toLocaleString('vi-VN')}đ</span>
          </div>

          {/* Chi tiết chi phí nhập trong ca */}
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
            <div className="flex justify-between items-center text-coffee-medium/70 text-[11px] px-1 bg-[#FAF6F0] p-3 rounded-xl border border-coffee-light/45">
              <span className="text-[10px] text-coffee-medium uppercase font-bold block">Chi tiết chi phí nhập trong ca:</span>
              <span className="text-[11px] text-coffee-medium font-semibold">0đ</span>
            </div>
          )}

          {/* Doanh thu thực tế ca */}
          <div className="flex justify-between items-center p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 font-black text-base text-emerald-900">
            <span>= Doanh thu thực tế ca:</span>
            <span className="text-lg">{metrics.netRevenue.toLocaleString('vi-VN')}đ</span>
          </div>

          {/* Tiền mặt thực tế trong két */}
          <div className="flex justify-between items-center p-3 bg-amber-100/40 rounded-xl border border-amber-200 font-extrabold text-coffee-dark text-sm">
            <span>👉 Tiền mặt thực tế trong két:</span>
            <span className="text-amber-900 text-base">{metrics.currentCash.toLocaleString('vi-VN')}đ</span>
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
              {(() => {
                const itemsPerPage = 10;
                const totalOrders = metrics.orders.length;
                const totalPages = Math.ceil(totalOrders / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const displayedOrders = metrics.orders.slice(startIndex, endIndex);

                return (
                  <>
                    {displayedOrders.map((order: any) => {
                      const date = new Date(order.created_at);
                      const hh = String(date.getHours()).padStart(2, '0');
                      const mm = String(date.getMinutes()).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      const mMonth = String(date.getMonth() + 1).padStart(2, '0');
                      const timeFormatted = `${hh}:${mm} - ${dd}/${mMonth}`;
                      return (
                        <div
                          key={order.id}
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          className="py-3.5 space-y-2 text-xs cursor-pointer hover:bg-[#FAF6F0]/50 -mx-3 px-3 rounded-2xl transition"
                        >
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder(order.id);
                                }}
                                disabled={cancelingId !== null}
                                className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-[10px] font-bold transition disabled:opacity-50 flex items-center space-x-1"
                              >
                                <span>Hủy</span>
                              </button>
                            </div>
                          </div>

                          {/* Mở rộng chi tiết món hàng */}
                          {expandedOrderId === order.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-3 p-3.5 bg-coffee-cream/20 rounded-2xl border border-coffee-light/40 space-y-2 text-[11px]"
                            >
                              <p className="font-bold text-[9px] text-coffee-medium uppercase tracking-wider">Chi tiết món ăn:</p>
                              {loadingExpandedItems ? (
                                <div className="py-3 flex justify-center">
                                  <Loader2 className="w-4 h-4 text-coffee-primary animate-spin" />
                                </div>
                              ) : expandedOrderItems.length === 0 ? (
                                <p className="italic text-coffee-medium/70">Không có chi tiết sản phẩm.</p>
                              ) : (
                                <div className="space-y-2 divide-y divide-coffee-light/25">
                                  {expandedOrderItems.map((item, idx) => (
                                    <div key={item.id || idx} className="flex justify-between items-center pt-2 first:pt-0">
                                      <span className="text-coffee-dark font-medium">
                                        {item.products?.name || 'Sản phẩm'} <span className="text-coffee-medium font-black">x{item.quantity}</span>
                                      </span>
                                      <span className="font-bold text-coffee-dark">
                                        {(item.subtotal || 0).toLocaleString('vi-VN')}đ
                                      </span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between items-center font-extrabold text-coffee-primary pt-2.5">
                                    <span>Tạm tính tiền món:</span>
                                    <span>
                                      {expandedOrderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0).toLocaleString('vi-VN')}đ
                                    </span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between items-center text-red-600 font-extrabold pt-1">
                                      <span>Giảm giá hóa đơn:</span>
                                      <span>
                                        -{order.discount.toLocaleString('vi-VN')}đ
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Điều khiển phân trang */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-1.5 pt-4 border-t border-coffee-light/40">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1.5 rounded-lg border border-coffee-light text-coffee-medium hover:bg-[#FAF6F0] disabled:opacity-50 text-[10px] font-bold transition"
                        >
                          Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-7 h-7 rounded-lg text-[10px] font-bold transition ${
                              currentPage === page
                                ? 'bg-coffee-primary text-white shadow-sm font-black'
                                : 'border border-coffee-light text-coffee-medium hover:bg-[#FAF6F0]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1.5 rounded-lg border border-coffee-light text-coffee-medium hover:bg-[#FAF6F0] disabled:opacity-50 text-[10px] font-bold transition"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
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
