'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, getCurrentUser } from '@/lib/database';
import { BarChart3, Clock, DollarSign, ShoppingBag, TrendingUp, ShieldCheck, Calendar, ArrowRightLeft, ArrowLeft } from 'lucide-react';

export default function DailyReportPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeShiftFilter, setActiveShiftFilter] = useState<'morning' | 'afternoon' | 'both'>('both');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    async function loadData() {
      try {
        const [allOrders, allLogs] = await Promise.all([
          db.getOrders(),
          db.getInventoryLogs()
        ]);
        setOrders(allOrders);
        setInventoryLogs(allLogs);
      } catch (e) {
        console.error('Lỗi khi tải hóa đơn báo cáo:', e);
      } finally {
        setLoading(false);
      }
    }
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
    const grossRevenue = shiftOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalCash = shiftOrders.filter(o => o.payment_method === 'Tiền mặt').reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalTransfer = shiftOrders.filter(o => o.payment_method === 'Chuyển khoản').reduce((sum, o) => sum + Number(o.total_amount), 0);
    
    // Tổng chi phí nhập kho / phát sinh trong ca
    const restockExpenses = shiftLogs.reduce((sum, l) => sum + Number(l.cost || 0), 0);
    const restockItems = shiftLogs;

    // Tiền mặt hiện tại sau khi trừ chi phí
    const currentCash = Math.max(0, totalCash - restockExpenses);
    // Doanh thu thực tế sau khi trừ chi phí nhập
    const netRevenue = grossRevenue - restockExpenses;

    return {
      orders: shiftOrders,
      grossRevenue,
      totalCash,
      totalTransfer,
      restockExpenses,
      restockItems,
      currentCash,
      netRevenue
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
          <ShiftMetricsSection metrics={bothShifts} />
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
          <ShiftMetricsSection metrics={morning} />
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
          <ShiftMetricsSection metrics={afternoon} />
        </div>
      )}
    </div>
  );
}

// Component phụ hiển thị các chỉ số chi tiết cho từng ca
function ShiftMetricsSection({ metrics }: { metrics: any }) {
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

        {/* THAY THẾ 'Bình quân/đơn' THÀNH 'Chi phí nhập / phát sinh' */}
        <div className="bg-white p-4.5 rounded-2xl border border-coffee-light flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider block">Chi phí nhập / phát sinh</span>
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

      {/* Phân bổ thanh toán */}
      <div className="bg-white p-5 rounded-2xl border border-coffee-light shadow-sm space-y-3.5">
        <h4 className="font-bold text-xs text-coffee-dark uppercase tracking-wider">Hình thức thanh toán</h4>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-coffee-dark">Tiền mặt bán hàng</span>
              <span className="text-coffee-primary">{metrics.totalCash.toLocaleString('vi-VN')}đ ({metrics.grossRevenue > 0 ? Math.round((metrics.totalCash/metrics.grossRevenue)*100) : 0}%)</span>
            </div>
            <div className="w-full bg-[#FAF6F0] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-coffee-primary h-full rounded-full" 
                style={{ width: `${metrics.grossRevenue > 0 ? (metrics.totalCash / metrics.grossRevenue) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-coffee-dark">Chuyển khoản</span>
              <span className="text-coffee-primary">{metrics.totalTransfer.toLocaleString('vi-VN')}đ ({metrics.grossRevenue > 0 ? Math.round((metrics.totalTransfer/metrics.grossRevenue)*100) : 0}%)</span>
            </div>
            <div className="w-full bg-[#FAF6F0] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-coffee-dark h-full rounded-full" 
                style={{ width: `${metrics.grossRevenue > 0 ? (metrics.totalTransfer / metrics.grossRevenue) * 100 : 0}%` }}
              />
            </div>
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
                  <div key={order.id} className="py-3.5 space-y-2 text-xs">
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
                      <span className="font-extrabold text-coffee-primary">{order.total_amount.toLocaleString('vi-VN')}đ</span>
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

      {/* BẢNG DÒNG TIỀN NGAY DƯỚI HÓA ĐƠN TRONG CA */}
      <div className="bg-[#FAF6F0] p-5 rounded-3xl border border-coffee-light space-y-3 text-xs shadow-sm">
        <h4 className="font-extrabold text-sm text-coffee-dark flex items-center justify-between border-b border-coffee-light/80 pb-2.5">
          <span>💵 Bảng Tính Dòng Tiền Thực Tế Ca</span>
          <span className="text-[10px] text-coffee-medium font-bold uppercase">Cân bằng két tiền</span>
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-coffee-medium">Tiền mặt bán hàng:</span>
            <strong className="font-extrabold text-coffee-dark">{metrics.totalCash.toLocaleString('vi-VN')}đ</strong>
          </div>

          {/* Chi tiết từng khoản chi phí phát sinh */}
          {metrics.restockItems.length > 0 ? (
            metrics.restockItems.map((log: any) => (
              <div key={log.id} className="flex justify-between items-center text-red-600 pl-3 text-[11px]">
                <span>- {log.ingredient_name} ({log.note || 'Nhập kho'}):</span>
                <strong>-{log.cost.toLocaleString('vi-VN')}đ</strong>
              </div>
            ))
          ) : (
            <div className="flex justify-between items-center text-coffee-medium/70 pl-3 text-[11px] italic">
              <span>- Chi phí nhập/phát sinh:</span>
              <span>0đ</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-dashed border-coffee-light font-extrabold text-coffee-dark text-sm">
            <span>👉 Tiền mặt hiện tại trong két:</span>
            <span className="text-amber-800">{metrics.currentCash.toLocaleString('vi-VN')}đ</span>
          </div>

          <div className="flex justify-between items-center text-coffee-medium pt-1">
            <span>+ Chuyển khoản (Ngân hàng):</span>
            <strong className="font-bold text-blue-700">+{metrics.totalTransfer.toLocaleString('vi-VN')}đ</strong>
          </div>

          <div className="flex justify-between items-center pt-2.5 border-t border-coffee-light font-black text-base text-emerald-800">
            <span>= Doanh thu thực tế ca:</span>
            <span>{metrics.netRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
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
