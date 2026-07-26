'use client';

import React, { useState, useEffect } from 'react';
import { db, getCurrentUser } from '@/lib/database';
import { BarChart3, Clock, DollarSign, ShoppingBag, TrendingUp, ShieldCheck, Calendar, ArrowRightLeft } from 'lucide-react';

export default function DailyReportPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    async function loadOrders() {
      try {
        const allOrders = await db.getOrders();
        setOrders(allOrders);
      } catch (e) {
        console.error('Lỗi khi tải hóa đơn báo cáo:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  // 1. Chỉ lấy hóa đơn đã thanh toán trong ngày hôm nay (dựa trên toDateString)
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(o => {
    if (o.payment_status !== 'Đã thanh toán') return false;
    const orderDate = new Date(o.created_at);
    return orderDate.toDateString() === todayStr;
  });

  // 2. Phân loại theo Ca làm việc
  // Ca sáng: 6h - 14h (6:00:00 - 13:59:59)
  const morningOrders = todayOrders.filter(o => {
    const hour = new Date(o.created_at).getHours();
    return hour >= 6 && hour < 14;
  });

  // Ca chiều: 14h - 22h (và các giờ muộn/sớm khác ngoài ca sáng để tránh sót đơn)
  const afternoonOrders = todayOrders.filter(o => {
    const hour = new Date(o.created_at).getHours();
    return hour >= 14 || hour < 6;
  });

  // 3. Hàm tính toán các chỉ số cho từng ca
  const calculateMetrics = (shiftOrders: any[]) => {
    const totalRevenue = shiftOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalCash = shiftOrders.filter(o => o.payment_method === 'Tiền mặt').reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalTransfer = shiftOrders.filter(o => o.payment_method === 'Chuyển khoản').reduce((sum, o) => sum + Number(o.total_amount), 0);
    const averageBill = shiftOrders.length > 0 ? totalRevenue / shiftOrders.length : 0;
    const estimatedProfit = totalRevenue * 0.62;

    return {
      orders: shiftOrders,
      totalRevenue,
      totalCash,
      totalTransfer,
      averageBill,
      estimatedProfit
    };
  };

  const morning = calculateMetrics(morningOrders);
  const afternoon = calculateMetrics(afternoonOrders);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-coffee-primary animate-spin" />
        <p className="text-coffee-medium font-medium">Đang tính toán báo cáo doanh thu ca...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 font-sans">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* --- CA SÁNG --- */}
        <div className="space-y-6">
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

        {/* --- CA CHIỀU --- */}
        <div className="space-y-6">
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
      </div>
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
            <span className="font-black text-xl text-coffee-primary">{metrics.totalRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="p-2.5 bg-green-50 rounded-xl text-green-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-coffee-light flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider block">Bình quân / Đơn</span>
            <span className="font-black text-xl text-coffee-primary">{Math.round(metrics.averageBill).toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="p-2.5 bg-purple-50 rounded-xl text-purple-700">
            <TrendingUp className="w-5 h-5" />
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
            <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider block">Lợi nhuận gộp ước tính</span>
            <span className="font-black text-xl text-coffee-primary">{Math.round(metrics.estimatedProfit).toLocaleString('vi-VN')}đ</span>
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
              <span className="text-coffee-dark">Tiền mặt</span>
              <span className="text-coffee-primary">{metrics.totalCash.toLocaleString('vi-VN')}đ ({metrics.totalRevenue > 0 ? Math.round((metrics.totalCash/metrics.totalRevenue)*100) : 0}%)</span>
            </div>
            <div className="w-full bg-[#FAF6F0] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-coffee-primary h-full rounded-full" 
                style={{ width: `${metrics.totalRevenue > 0 ? (metrics.totalCash / metrics.totalRevenue) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-coffee-dark">Chuyển khoản</span>
              <span className="text-coffee-primary">{metrics.totalTransfer.toLocaleString('vi-VN')}đ ({metrics.totalRevenue > 0 ? Math.round((metrics.totalTransfer/metrics.totalRevenue)*100) : 0}%)</span>
            </div>
            <div className="w-full bg-[#FAF6F0] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-coffee-dark h-full rounded-full" 
                style={{ width: `${metrics.totalRevenue > 0 ? (metrics.totalTransfer / metrics.totalRevenue) * 100 : 0}%` }}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-coffee-light text-coffee-medium font-bold">
                  <th className="py-2">Mã HĐ</th>
                  <th className="py-2">Bàn</th>
                  <th className="py-2">Thanh toán</th>
                  <th className="py-2 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-light/40">
                {metrics.orders.slice(0, 5).map((order: any) => (
                  <tr key={order.id}>
                    <td className="py-2 font-mono text-[10px] text-coffee-dark">{order.id.substring(0, 8).toUpperCase()}</td>
                    <td className="py-2 font-semibold text-coffee-dark">{order.tables?.table_name || 'Khách mang về'}</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        order.payment_method === 'Tiền mặt' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="py-2 text-right font-bold text-coffee-primary">{order.total_amount.toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {metrics.orders.length > 5 && (
              <p className="text-[10px] text-coffee-medium text-center pt-2 italic">Hiển thị 5 đơn hàng gần nhất...</p>
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
