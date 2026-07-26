'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  CreditCard, 
  Clock, 
  CalendarDays, 
  ShieldCheck, 
  UserCheck,
  ChevronRight,
  BarChart3,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { db, getCurrentUser } from '@/lib/database';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTables: 0,
    servingTables: 0,
    unpaidBills: 0,
    pendingApprovals: 0
  });
  const [greeting, setGreeting] = useState('Chào bạn');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    async function loadStats() {
      try {
        const isAdmin = user && user.role === 'Admin';

        // 1. Chỉ fetch bàn và hóa đơn dùng chung
        const promises: Promise<any>[] = [
          db.getTables(),
          db.getOrders()
        ];

        // 2. Chỉ fetch logs & leaves nếu tài khoản là Admin
        if (isAdmin) {
          promises.push(db.getTimeLogs());
          promises.push(db.getLeaveRequests());
        }

        const results = await Promise.all(promises);
        const tables = results[0];
        const orders = results[1];
        const logs = isAdmin ? results[2] : [];
        const leaves = isAdmin ? results[3] : [];

        const serving = tables.filter((t: any) => t.status === 'Đang phục vụ').length;
        const unpaid = orders.filter((o: any) => o.payment_status === 'Chưa thanh toán').length;
        const pendingTime = isAdmin ? logs.filter((l: any) => l.status === 'Chờ duyệt').length : 0;
        const pendingLeave = isAdmin ? leaves.filter((r: any) => r.status === 'Chờ duyệt').length : 0;

        setStats({
          totalTables: tables.length,
          servingTables: serving,
          unpaidBills: unpaid,
          pendingApprovals: pendingTime + pendingLeave
        });
      } catch (e) {
        console.error('Lỗi khi tải thống kê trang chủ:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const actionCards = [
    {
      name: 'Bán hàng (POS)',
      description: 'Mở sơ đồ bàn, lên đơn gọi món, thanh toán.',
      path: '/pos',
      icon: ShoppingBag,
      color: 'bg-amber-100/60 border-amber-300 text-amber-900',
      badge: stats.servingTables > 0 ? `${stats.servingTables} bàn bận` : 'Vào ca'
    },
    {
      name: 'Thanh toán',
      description: 'Thanh toán hóa đơn bàn, in bill nhiệt 80mm.',
      path: '/payment',
      icon: CreditCard,
      color: 'bg-blue-50 border-blue-200 text-blue-950',
      badge: stats.unpaidBills > 0 ? `${stats.unpaidBills} hóa đơn` : 'Trống'
    },
    {
      name: 'Báo cáo ca trực',
      description: 'Xem doanh thu và số lượng đơn theo ca sáng/chiều.',
      path: '/daily-report',
      icon: BarChart3,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-950',
      badge: 'Doanh thu'
    },
    {
      name: 'Thực đơn (Menu)',
      description: 'Xem chi tiết các món uống, đơn giá, hình ảnh món.',
      path: '/menu',
      icon: Coffee,
      color: 'bg-orange-50 border-orange-200 text-orange-950',
      badge: 'Món nước'
    },
    {
      name: 'Chấm công',
      description: 'Ghi nhận thời gian bắt đầu vào ca/ra ca bằng GPS.',
      path: '/time-log',
      icon: Clock,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      badge: 'Giờ công'
    },
    {
      name: 'Xin nghỉ phép',
      description: 'Gửi đơn đăng ký nghỉ phép có định vị gửi đơn.',
      path: '/leave',
      icon: CalendarDays,
      color: 'bg-purple-50 border-purple-200 text-purple-950',
      badge: 'Đăng ký'
    },
    {
      name: 'Quản trị (Admin)',
      description: 'Duyệt yêu cầu chấm công, xem doanh số tháng.',
      path: '/admin',
      icon: ShieldCheck,
      color: 'bg-rose-50 border-rose-200 text-rose-950',
      badge: stats.pendingApprovals > 0 ? `${stats.pendingApprovals} duyệt` : 'Hệ thống',
      requiresAdmin: true
    }
  ];

  // Chỉ hiển thị các card mà user được phép truy cập (Ẩn nút Admin hoàn toàn đối với User)
  const visibleCards = actionCards.filter(card => {
    if (card.requiresAdmin && currentUser?.role !== 'Admin') {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-coffee-primary animate-spin" />
        <p className="text-coffee-medium font-medium">Đang tải trang tổng quan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* BANNER CHÀO MỪNG */}
      <div className="bg-gradient-to-r from-coffee-primary to-coffee-dark rounded-3xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-coffee-medium/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 -translate-y-16 w-32 h-32 bg-coffee-accent/10 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-coffee-accent uppercase tracking-widest">{greeting}</span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              {currentUser?.full_name || 'Nhân viên AVA Coffee'}
            </h2>
            <p className="text-[11px] text-coffee-light/90 max-w-md leading-normal">
              Chào mừng bạn đến với AVA Coffee. Chọn chức năng dưới đây để bắt đầu làm việc.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center space-x-2.5 self-start sm:self-auto shrink-0">
            <div className="p-1.5 bg-coffee-accent text-coffee-dark rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-[10px]">
              <p className="text-coffee-accent font-bold leading-none mb-0.5">Quyền hạn</p>
              <p className="font-semibold text-white leading-none">{currentUser?.role === 'Admin' ? 'Quản trị viên (Admin)' : 'Nhân viên (User)'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS SUMMARY CARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-coffee-light shadow-sm flex flex-col justify-between h-24">
          <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider">Bàn phục vụ</span>
          <div className="flex items-end justify-between">
            <h4 className="font-black text-xl text-coffee-dark">{stats.servingTables} / {stats.totalTables}</h4>
            <span className="text-[8px] font-semibold text-coffee-medium bg-coffee-light px-2 py-0.5 rounded-full">Đang mở</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-coffee-light shadow-sm flex flex-col justify-between h-24">
          <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider">Hóa đơn chờ</span>
          <div className="flex items-end justify-between">
            <h4 className="font-black text-xl text-amber-700">{stats.unpaidBills} HĐ</h4>
            <span className="text-[8px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Chưa trả</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-coffee-light shadow-sm flex flex-col justify-between h-24">
          <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider">Yêu cầu chờ duyệt</span>
          <div className="flex items-end justify-between">
            <h4 className="font-black text-xl text-coffee-primary">{stats.pendingApprovals} đơn</h4>
            <span className="text-[8px] font-semibold text-coffee-medium bg-coffee-light px-2 py-0.5 rounded-full">Nhân sự</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-coffee-light shadow-sm flex flex-col justify-between h-24">
          <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider">Múi giờ làm việc</span>
          <div className="flex items-end justify-between">
            <h4 className="font-bold text-xs text-coffee-dark">{new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} ICT</h4>
            <span className="text-[8px] font-semibold text-coffee-medium bg-coffee-light px-2 py-0.5 rounded-full">{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS GRID (APP LAUNCHER TILE FORMAT) */}
      <div className="space-y-3">
        <h3 className="font-black text-base text-coffee-dark">Tính năng hệ thống</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.path}
                href={card.path}
                className="group relative bg-white p-4 rounded-2xl border border-coffee-light flex flex-col justify-between h-36 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm"
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`p-2.5 rounded-xl border ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 bg-[#FAF6F0] text-coffee-primary rounded-md uppercase tracking-wider">
                    {card.badge}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs text-coffee-dark tracking-tight flex items-center space-x-1">
                    <span>{card.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-coffee-medium/40 group-hover:translate-x-0.5 transition-transform" />
                  </h4>
                  <p className="text-[10px] text-coffee-medium leading-snug line-clamp-2">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

