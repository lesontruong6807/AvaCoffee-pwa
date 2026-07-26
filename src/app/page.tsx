'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  CreditCard, 
  Clock, 
  CalendarDays, 
  ShieldCheck, 
  Users, 
  HelpCircle,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Lock
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

  useEffect(() => {
    // Tải thông tin user hiện tại
    const user = getCurrentUser();
    setCurrentUser(user);

    // Xác định lời chào theo thời gian trong ngày
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    async function loadStats() {
      try {
        const [tables, orders, logs, leaves] = await Promise.all([
          db.getTables(),
          db.getOrders(),
          db.getTimeLogs(),
          db.getLeaveRequests()
        ]);

        const serving = tables.filter(t => t.status === 'Đang phục vụ').length;
        const unpaid = orders.filter(o => o.payment_status === 'Chưa thanh toán').length;
        const pendingTime = logs.filter(l => l.status === 'Chờ duyệt').length;
        const pendingLeave = leaves.filter(r => r.status === 'Chờ duyệt').length;

        setStats({
          totalTables: tables.length,
          servingTables: serving,
          unpaidBills: unpaid,
          pendingApprovals: pendingTime + pendingLeave
        });
      } catch (e) {
        console.error('Lỗi khi tải thống kê trang chủ:', e);
      }
    }
    loadStats();
  }, []);

  const actionCards = [
    {
      name: 'Bán hàng (POS)',
      description: 'Mở sơ đồ bàn, lên đơn gọi món, cập nhật giỏ hàng trực quan.',
      path: '/pos',
      icon: Coffee,
      color: 'bg-amber-100/60 border-amber-300 text-amber-900',
      badge: stats.servingTables > 0 ? `${stats.servingTables} bàn đang dùng` : 'Sẵn sàng'
    },
    {
      name: 'Hóa đơn chưa thanh toán',
      description: 'Xem các bàn đang có hóa đơn, thanh toán, in hóa đơn nhiệt 80mm.',
      path: '/payment',
      icon: CreditCard,
      color: 'bg-blue-50 border-blue-200 text-blue-950',
      badge: stats.unpaidBills > 0 ? `${stats.unpaidBills} hóa đơn chờ` : 'Không có'
    },
    {
      name: 'Chấm công nhân viên',
      description: 'Ghi nhận thời gian vào ca làm việc bằng định vị vị trí GPS.',
      path: '/time-log',
      icon: Clock,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      badge: 'Chấm nhanh'
    },
    {
      name: 'Xin nghỉ phép',
      description: 'Gửi đơn xin nghỉ phép bận việc cá nhân kèm định vị xác thực.',
      path: '/leave',
      icon: CalendarDays,
      color: 'bg-purple-50 border-purple-200 text-purple-950',
      badge: 'Đăng ký'
    },
    {
      name: 'Quản lý (Admin)',
      description: 'Phê duyệt chấm công, xem báo cáo doanh thu, CRUD thực đơn.',
      path: '/admin',
      icon: ShieldCheck,
      color: 'bg-rose-50 border-rose-200 text-rose-950',
      badge: stats.pendingApprovals > 0 ? `${stats.pendingApprovals} yêu cầu chờ` : 'Hệ thống',
      requiresAdmin: true
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* BANNER CHÀO MỪNG */}
      <div className="bg-gradient-to-r from-coffee-primary to-coffee-dark rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Hình tròn trang trí nền */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-coffee-medium/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 -translate-y-16 w-32 h-32 bg-coffee-accent/10 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-coffee-accent uppercase tracking-widest">{greeting}</span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              {currentUser?.full_name || 'Nhân viên AVA Coffee'}
            </h2>
            <p className="text-xs text-coffee-light/90 max-w-lg">
              Chào mừng bạn đến với Hệ thống Quản trị & Bán hàng AVA Coffee. Hãy chọn các tính năng bên dưới để bắt đầu công việc.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center space-x-3 self-start md:self-auto">
            <div className="p-2 bg-coffee-accent text-coffee-dark rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="text-coffee-accent font-bold">Quyền hạn tài khoản</p>
              <p className="font-semibold text-white">{currentUser?.role === 'Admin' ? 'Quản trị viên (Admin)' : 'Nhân viên (User)'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS SUMMARY CARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-coffee-light shadow-sm flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">Bàn phục vụ</span>
          <div className="flex items-end justify-between">
            <h4 className="font-black text-2xl text-coffee-dark">{stats.servingTables} / {stats.totalTables}</h4>
            <span className="text-[9px] font-semibold text-coffee-medium bg-coffee-light px-2 py-0.5 rounded-full">Đang mở</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-coffee-light shadow-sm flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">Hóa đơn chờ</span>
          <div className="flex items-end justify-between">
            <h4 className="font-black text-2xl text-amber-700">{stats.unpaidBills} HĐ</h4>
            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Chưa trả</span>
          </div>
        </div>

        <div className="bg-[#FAF6F0] p-5 rounded-3xl border border-coffee-accent/40 shadow-inner flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">Yêu cầu chờ duyệt</span>
          <div className="flex items-end justify-between">
            <h4 className="font-black text-2xl text-coffee-primary">{stats.pendingApprovals} đơn</h4>
            <span className="text-[9px] font-semibold text-coffee-medium bg-coffee-light px-2 py-0.5 rounded-full">Nhân sự</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-coffee-light shadow-sm flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">Múi giờ làm việc</span>
          <div className="flex items-end justify-between">
            <h4 className="font-bold text-sm text-coffee-dark">{new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} ICT</h4>
            <span className="text-[9px] font-semibold text-coffee-medium bg-coffee-light px-2 py-0.5 rounded-full">{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="space-y-4">
        <h3 className="font-black text-lg text-coffee-dark">Tính Năng Hệ Thống</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card) => {
            const Icon = card.icon;
            const isAdminLocked = card.requiresAdmin && currentUser?.role !== 'Admin';

            return (
              <Link
                key={card.path}
                href={card.path}
                className={`group relative bg-white p-6 rounded-3xl border border-coffee-light flex flex-col justify-between h-52 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md ${
                  isAdminLocked ? 'opacity-85 border-dashed bg-gray-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`p-3.5 rounded-2xl border ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {isAdminLocked ? (
                    <span className="flex items-center space-x-1 text-[9px] font-bold px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-200">
                      <Lock className="w-3 h-3" />
                      <span>ADMIN ONLY</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-coffee-light text-coffee-primary rounded-xl uppercase tracking-wider">
                      {card.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-lg text-coffee-dark tracking-tight flex items-center space-x-1.5">
                    <span>{card.name}</span>
                    <ChevronRight className="w-4 h-4 text-coffee-medium/40 group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-coffee-medium leading-relaxed">
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

