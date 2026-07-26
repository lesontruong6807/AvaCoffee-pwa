'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Coffee, 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  CalendarDays, 
  ShieldCheck, 
  Menu, 
  X, 
  UserCheck, 
  Globe, 
  WifiOff 
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, isSupabaseConfigured, mockDb } from '@/lib/database';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setUser] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());
    setAvailableUsers(mockDb.getUsers());
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-coffee-light flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Coffee className="w-12 h-12 text-coffee-primary animate-bounce" />
          <span className="text-coffee-dark font-medium">Đang tải AVA Coffee...</span>
        </div>
      </div>
    );
  }

  const handleUserChange = (user: any) => {
    setCurrentUser(user);
    setUser(user);
    setIsUserDropdownOpen(false);
    // Reload trang để cập nhật quyền truy cập ở các component khác
    window.location.reload();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Bán hàng (POS)', path: '/pos', icon: ShoppingBag },
    { name: 'Hóa đơn chưa thanh toán', path: '/payment', icon: CreditCard },
    { name: 'Chấm công', path: '/time-log', icon: Clock },
    { name: 'Xin nghỉ phép', path: '/leave', icon: CalendarDays },
  ];

  // Chỉ hiển thị link Admin nếu user là Admin
  if (currentUser?.role === 'Admin') {
    navItems.push({ name: 'Quản lý (Admin)', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="flex min-h-screen bg-[#FAF6F0] text-coffee-dark font-sans">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-coffee-primary text-white shadow-xl">
        <div className="p-6 border-b border-coffee-medium flex items-center space-x-3">
          <div className="w-11 h-11 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-coffee-accent/40 shadow-inner shrink-0">
            <img src="/logo.jpg" alt="AVA Coffee Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wide leading-tight">AVA Coffee</h1>
            <p className="text-xs text-coffee-accent font-medium">POS & Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-coffee-accent text-coffee-dark font-semibold shadow-md'
                    : 'text-coffee-light hover:bg-coffee-medium/40 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-coffee-medium bg-coffee-dark/30 text-xs text-coffee-light">
          <div className="flex items-center justify-between mb-2">
            <span>Kết nối:</span>
            {isSupabaseConfigured ? (
              <span className="flex items-center space-x-1 text-green-400 font-semibold">
                <Globe className="w-3.5 h-3.5" />
                <span>Supabase</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Mock DB (Offline)</span>
              </span>
            )}
          </div>
          <div className="text-[10px] text-coffee-accent/70">
            Giờ hệ thống: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-coffee-primary text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-coffee-accent/40 shadow-inner shrink-0">
            <img src="/logo.jpg" alt="AVA Coffee Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-lg">AVA Coffee</span>
        </div>
        <div className="flex items-center space-x-3">
          {/* User Display Mobile */}
          <div className="text-xs text-right hidden sm:block">
            <p className="font-medium text-coffee-accent">{currentUser?.full_name}</p>
            <p className="text-[10px] opacity-75">{currentUser?.role}</p>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 hover:bg-coffee-medium/40 rounded-lg text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-xs bg-coffee-primary text-white p-6 pt-20 z-40 shadow-xl">
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-coffee-accent text-coffee-dark font-semibold shadow-md'
                        : 'text-coffee-light hover:bg-coffee-medium/40 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-coffee-medium pt-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-coffee-light">
                <span>Database:</span>
                {isSupabaseConfigured ? (
                  <span className="text-green-400 font-semibold">Supabase</span>
                ) : (
                  <span className="text-amber-400 font-semibold">Mock DB (Offline)</span>
                )}
              </div>
              <div className="text-[10px] text-coffee-accent/70">
                Nhân viên: {currentUser?.full_name} ({currentUser?.role})
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0 pt-16 md:pt-0">
        {/* TOP BAR / HEADER (DESKTOP) */}
        <header className="hidden md:flex h-16 bg-white border-b border-coffee-light items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-lg text-coffee-dark">
              {pathname === '/' && 'Trang Tổng Quan'}
              {pathname.startsWith('/pos') && 'Màn Hình Bán Hàng (POS)'}
              {pathname.startsWith('/payment') && 'Xử Lý Thanh Toán'}
              {pathname.startsWith('/time-log') && 'Ghi Nhận Chấm Công'}
              {pathname.startsWith('/leave') && 'Đăng Ký Nghỉ Phép'}
              {pathname.startsWith('/admin') && 'Trang Quản Trị (Admin)'}
            </h2>
            {!isSupabaseConfigured && (
              <span className="ml-4 text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                Chế độ chạy thử Local Storage
              </span>
            )}
          </div>

          {/* User selector dropdown in Desktop Header */}
          <div className="relative">
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-3 px-4 py-2 hover:bg-coffee-light rounded-xl transition-all duration-200 border border-coffee-accent/30 bg-coffee-cream/20"
            >
              <div className="p-1.5 bg-coffee-primary rounded-lg text-white">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-coffee-dark leading-tight">{currentUser?.full_name}</p>
                <p className="text-[10px] text-coffee-medium font-medium">{currentUser?.role}</p>
              </div>
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-coffee-accent/40 py-2 z-50">
                <div className="px-4 py-1.5 border-b border-coffee-light text-[10px] font-semibold text-coffee-medium uppercase tracking-wider">
                  Chuyển tài khoản (Test)
                </div>
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserChange(user)}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-coffee-light transition-all ${
                      currentUser?.id === user.id ? 'bg-coffee-accent/20 font-bold' : ''
                    }`}
                  >
                    <div>
                      <p className="text-coffee-dark font-medium">{user.full_name}</p>
                      <p className="text-[10px] text-coffee-medium">{user.email}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      user.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* USER SWITCHER FOR MOBILE */}
        <div className="md:hidden bg-white border-b border-coffee-light px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-coffee-medium">Chế độ: <strong>{!isSupabaseConfigured ? 'Mock DB Offline' : 'Supabase Online'}</strong></span>
          
          <div className="relative">
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="text-xs text-coffee-primary font-bold underline flex items-center space-x-1"
            >
              <span>{currentUser?.full_name}</span>
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-coffee-accent/40 py-2 z-50">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserChange(user)}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-coffee-light transition-all"
                  >
                    <p className="text-coffee-dark font-medium">{user.full_name}</p>
                    <p className="text-[10px] text-coffee-medium">{user.role}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Page Wrapper */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
