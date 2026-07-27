'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db, getCurrentUser } from '@/lib/database';
import { toast } from '@/lib/toast';
import { 
  ShieldCheck, 
  Clock, 
  CalendarDays, 
  BarChart3, 
  Utensils, 
  Users, 
  Check, 
  X, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Map,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [adminTab, setAdminTab] = useState<'approvals' | 'reports' | 'products' | 'staff'>('approvals');
  const [loading, setLoading] = useState(true);

  // Dữ liệu quản trị
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);

  // Trạng thái phê duyệt (Duyệt chấm công / Duyệt nghỉ phép / Duyệt đơn kho)
  const [approvalSubTab, setApprovalSubTab] = useState<'time' | 'leave' | 'inventory'>('time');

  // Trạng thái Form CRUD Sản phẩm
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCostPrice, setProdCostPrice] = useState(0);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodStatus, setProdStatus] = useState<'Còn hàng' | 'Hết hàng'>('Còn hàng');

  // Trạng thái Form CRUD Nhân viên
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'Admin' | 'User'>('User');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [logs, leaves, ords, prods, cats, usrs, invLogs] = await Promise.all([
        db.getTimeLogs(),
        db.getLeaveRequests(),
        db.getOrders(),
        db.getProducts(),
        db.getCategories(),
        db.getUsers(),
        db.getInventoryLogs()
      ]);
      setTimeLogs(logs);
      setLeaveRequests(leaves);
      setOrders(ords);
      setProducts(prods);
      setCategories(cats);
      setUsers(usrs);
      setInventoryLogs(invLogs);
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu admin:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user && user.role === 'Admin') {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, []);

  // Kiểm tra quyền Admin
  if (!loading && currentUser?.role !== 'Admin') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-md border border-red-200 text-center space-y-5 my-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
          <X className="w-10 h-10" />
        </div>
        <h3 className="font-extrabold text-xl text-red-800">Quyền truy cập bị từ chối</h3>
        <p className="text-sm text-coffee-medium">
          Trang này chỉ dành cho tài khoản có quyền **Admin**. Tài khoản hiện tại của bạn là **{currentUser?.full_name}** với vai trò **{currentUser?.role || 'Nhân viên'}**.
        </p>
        <div className="bg-[#FAF6F0] p-4 rounded-2xl text-xs text-coffee-medium text-left space-y-1">
          <p className="font-bold text-coffee-dark mb-1">Cách chạy thử tính năng Admin:</p>
          <p>1. Di chuột lên góc trên bên phải màn hình (trên Desktop) hoặc góc phải header (trên Mobile).</p>
          <p>2. Click vào tên tài khoản hiện tại.</p>
          <p>3. Chọn tài khoản **Lê Sơn (Admin)** để đăng nhập làm Quản trị viên.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-coffee-primary animate-spin" />
        <p className="text-coffee-medium font-medium">Đang tải bảng điều khiển quản trị...</p>
      </div>
    );
  }

  // --- LÓGIC PHÊ DUYỆT ---
  const handleApproveTime = async (id: string, status: 'Đã duyệt' | 'Từ chối') => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn ${status === 'Đã duyệt' ? 'CHẤP NHẬN' : 'TỪ CHỐI'} lượt chấm công này không?`);
    if (!isConfirmed) return;
    
    try {
      await db.approveTimeLog(id, status);
      confetti({ particleCount: 50, spread: 40 });
      loadAllData();
      toast.success(`Đã cập nhật trạng thái chấm công thành: ${status}`);
    } catch (e) {
      toast.error('Không thể phê duyệt chấm công.');
    }
  };

  const handleApproveLeave = async (id: string, status: 'Đã duyệt' | 'Từ chối') => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn ${status === 'Đã duyệt' ? 'CHẤP NHẬN' : 'TỪ CHỐI'} đơn nghỉ phép này không?`);
    if (!isConfirmed) return;

    try {
      await db.approveLeaveRequest(id, status);
      confetti({ particleCount: 50, spread: 40 });
      loadAllData();
      toast.success(`Đã cập nhật trạng thái nghỉ phép thành: ${status}`);
    } catch (e) {
      toast.error('Không thể phê duyệt đơn nghỉ phép.');
    }
  };

  const handleApproveInventory = async (id: string, status: 'Đã duyệt' | 'Từ chối') => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn ${status === 'Đã duyệt' ? 'CHẤP NHẬN' : 'TỪ CHỐI'} đơn kho này không?`);
    if (!isConfirmed) return;

    try {
      await db.approveInventoryLog(id, status);
      confetti({ particleCount: 50, spread: 40 });
      loadAllData();
      toast.success(`Đã cập nhật đơn kho thành: ${status}`);
    } catch (e) {
      toast.error('Không thể phê duyệt đơn kho.');
    }
  };

  // --- LÓGIC CRUD SẢN PHẨM ---
  const openAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice(0);
    setProdCostPrice(0);
    setProdCategoryId(categories[0]?.id || '');
    setProdImageUrl('');
    setProdStatus('Còn hàng');
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdPrice(prod.price);
    setProdCostPrice(prod.cost_price || 0);
    setProdCategoryId(prod.category_id);
    setProdImageUrl(prod.image_url || '');
    setProdStatus(prod.status);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
      name: prodName,
      price: Number(prodPrice),
      cost_price: Number(prodCostPrice),
      category_id: prodCategoryId,
      image_url: prodImageUrl || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      status: prodStatus
    };

    try {
      if (editingProduct) {
        await db.updateProduct(editingProduct.id, productPayload);
        toast.success('Cập nhật món ăn thành công!');
      } else {
        await db.createProduct(productPayload);
        toast.success('Thêm món ăn mới thành công!');
      }
      setIsProductModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error('Lỗi lưu món ăn.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xoá món ăn này không?')) {
      try {
        await db.deleteProduct(id);
        toast.success('Đã xoá món ăn.');
        loadAllData();
      } catch (err) {
        toast.error('Không thể xoá món ăn.');
      }
    }
  };

  // --- LÓGIC CRUD NHÂN VIÊN ---
  const openAddStaff = () => {
    setEditingStaff(null);
    setStaffName('');
    setStaffEmail('');
    setStaffRole('User');
    setIsStaffModalOpen(true);
  };

  const openEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setStaffName(staff.full_name);
    setStaffEmail(staff.email);
    setStaffRole(staff.role);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const staffPayload = {
      full_name: staffName,
      email: staffEmail,
      role: staffRole
    };

    try {
      if (editingStaff) {
        await db.updateUser(editingStaff.id, staffPayload);
        toast.success('Cập nhật nhân viên thành công!');
      } else {
        // Mock ID nhân viên mới
        const newId = `u_${Date.now()}`;
        await db.createUser({ id: newId, ...staffPayload });
        toast.success('Thêm nhân viên mới thành công!');
      }
      setIsStaffModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error('Lỗi lưu nhân viên.');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (id === currentUser.id) {
      toast.error('Bạn không thể xoá tài khoản Admin của chính mình!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xoá nhân viên này không?')) {
      try {
        await db.deleteUser(id);
        toast.success('Đã xoá nhân viên.');
        loadAllData();
      } catch (err) {
        toast.error('Không thể xoá nhân viên.');
      }
    }
  };

  // --- LÓGIC BÁO CÁO DOANH THU ---
  // Lọc theo tháng hiện tại của năm hiện tại (Tự động reset sang tháng mới dựa vào Now())
  const currentMonthDate = new Date();
  const currentYear = currentMonthDate.getFullYear();
  const currentMonthNum = currentMonthDate.getMonth(); // 0-indexed

  const paidOrders = orders.filter(o => {
    if (o.payment_status !== 'Đã thanh toán') return false;
    const orderDate = new Date(o.created_at);
    return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonthNum;
  });
  const monthLogs = inventoryLogs.filter(l => {
    const logDate = new Date(l.created_at);
    return logDate.getFullYear() === currentYear && logDate.getMonth() === currentMonthNum && l.type === 'Nhập kho';
  });

  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalCash = paidOrders.filter(o => o.payment_method === 'Tiền mặt').reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalTransfer = paidOrders.filter(o => o.payment_method === 'Chuyển khoản').reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalRestockExpenses = monthLogs.reduce((sum, l) => sum + Number(l.cost || 0), 0);
  const netMonthRevenue = totalRevenue - totalRestockExpenses;

  return (
    <div className="space-y-6">
      <Link 
        href="/"
        className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-coffee-light text-coffee-primary rounded-xl text-xs font-bold hover:bg-coffee-light transition shadow-sm w-fit animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về Trang chủ</span>
      </Link>
      {/* TABS HEADER ADMIN */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-coffee-light flex flex-wrap gap-2">
        <button
          onClick={() => setAdminTab('approvals')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold transition ${
            adminTab === 'approvals'
              ? 'bg-coffee-primary text-white shadow'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          <Clock className="w-4.5 h-4.5" />
          <span>Duyệt yêu cầu</span>
        </button>
        <button
          onClick={() => setAdminTab('reports')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold transition ${
            adminTab === 'reports'
              ? 'bg-coffee-primary text-white shadow'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span>Báo cáo doanh thu</span>
        </button>
        <button
          onClick={() => setAdminTab('products')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold transition ${
            adminTab === 'products'
              ? 'bg-coffee-primary text-white shadow'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          <Utensils className="w-4.5 h-4.5" />
          <span>Quản lý đồ uống</span>
        </button>
        <button
          onClick={() => setAdminTab('staff')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold transition ${
            adminTab === 'staff'
              ? 'bg-coffee-primary text-white shadow'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>Quản lý nhân viên</span>
        </button>
      </div>

      {/* 1. TAB PHÊ DUYỆT YÊU CẦU */}
      {adminTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-coffee-dark">Danh Sách Yêu Cầu Chờ Duyệt</h3>
              <p className="text-xs text-coffee-medium">Xem lại vị trí chấm công, nghỉ phép và đơn nhập/kiểm kho để duyệt.</p>
            </div>
            {/* Sub-tabs */}
            <div className="flex bg-[#FAF6F0] p-1.5 rounded-2xl border border-coffee-light overflow-x-auto max-w-full gap-1">
              <button
                onClick={() => setApprovalSubTab('time')}
                className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition shrink-0 ${
                  approvalSubTab === 'time' ? 'bg-white text-coffee-dark shadow-sm' : 'text-coffee-medium hover:bg-coffee-light/45'
                }`}
              >
                Chấm công
              </button>
              <button
                onClick={() => setApprovalSubTab('leave')}
                className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition shrink-0 ${
                  approvalSubTab === 'leave' ? 'bg-white text-coffee-dark shadow-sm' : 'text-coffee-medium hover:bg-coffee-light/45'
                }`}
              >
                Nghỉ phép
              </button>
              <button
                onClick={() => setApprovalSubTab('inventory')}
                className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition shrink-0 ${
                  approvalSubTab === 'inventory' ? 'bg-white text-coffee-dark shadow-sm' : 'text-coffee-medium hover:bg-coffee-light/45'
                }`}
              >
                Duyệt Kho & Kiểm Kho
              </button>
            </div>
          </div>

          {/* DUYỆT CHẤM CÔNG */}
          {approvalSubTab === 'time' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {timeLogs.filter(l => l.status === 'Chờ duyệt' || l.status === 'Đang trong ca').map((log) => {
                const formatTime = (dStr: any) => {
                  if (!dStr) return 'Chưa ra ca';
                  return new Date(dStr).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                };
                const formatDate = (dStr: any) => {
                  if (!dStr) return '';
                  return new Date(dStr).toLocaleDateString('vi-VN');
                };

                const isWorking = log.status === 'Đang trong ca';

                return (
                  <div key={log.id} className="bg-white rounded-3xl p-6 border border-coffee-light shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-coffee-light pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-9 h-9 bg-coffee-light rounded-xl flex items-center justify-center text-coffee-primary font-bold text-xs">
                          {log.users?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-coffee-dark">{log.users?.full_name}</h4>
                          <p className="text-[10px] text-coffee-medium">{log.users?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isWorking ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status}
                        </span>
                        {log.is_edited && (
                          <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Sửa lại
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs space-y-3">
                      <p className="font-extrabold text-coffee-dark text-xs bg-coffee-light/30 px-2 py-1 rounded w-fit">
                        Ca trực: {log.shift}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 bg-[#FAF6F0] p-3 rounded-2xl border border-coffee-light/60">
                        {/* Chi tiết Vào ca */}
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-extrabold text-coffee-primary uppercase">Vào ca</p>
                          <p className="text-coffee-dark">Khai báo: <strong>{formatTime(log.check_in_time)}</strong></p>
                          <p className="text-[10px] text-coffee-medium">Thực tế: {formatTime(log.submitted_at)}</p>
                        </div>

                        {/* Chi tiết Ra ca */}
                        <div className="space-y-0.5 border-l border-coffee-light pl-3">
                          <p className="text-[9px] font-extrabold text-teal-700 uppercase">Ra ca</p>
                          {log.check_out_time ? (
                            <>
                              <p className="text-coffee-dark">Khai báo: <strong>{formatTime(log.check_out_time)}</strong></p>
                              <p className="text-[10px] text-coffee-medium">Thực tế: {formatTime(log.real_check_out_time)}</p>
                            </>
                          ) : (
                            <p className="text-[10px] text-blue-600 font-bold italic animate-pulse">Đang làm...</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-coffee-medium">Ngày chấm công: <strong>{formatDate(log.check_in_time)}</strong></p>
                        {log.ghi_chu_vao && (
                          <p className="text-[10px] text-coffee-medium">Ghi chú vào: <span className="italic">"{log.ghi_chu_vao}"</span></p>
                        )}
                        {log.ghi_chu_ra && (
                          <p className="text-[10px] text-coffee-medium">Ghi chú ra: <span className="italic">"{log.ghi_chu_ra}"</span></p>
                        )}
                        <p className="text-coffee-medium flex items-start text-[10px] pt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-coffee-primary shrink-0 mt-0.5" />
                          <span>Vị trí cuối: {log.location_address || `Tọa độ: ${log.latitude}, ${log.longitude}`}</span>
                        </p>
                      </div>
                    </div>

                    {/* Định vị bằng tọa độ số & Nút mở Google Maps */}
                    <div className="bg-coffee-cream/35 border border-coffee-accent/60 rounded-2xl p-4 space-y-3 shadow-sm text-xs">
                      <div className="flex justify-between font-mono text-[10px] text-coffee-medium">
                        <span>Vĩ độ: {log.latitude.toFixed(6)}</span>
                        <span>Kinh độ: {log.longitude.toFixed(6)}</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold text-[10px] rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>Mở vị trí chấm công trên Google Maps 🗺️</span>
                      </a>
                    </div>

                    <div className="pt-2">
                      {isWorking ? (
                        <div className="p-2.5 bg-blue-55 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-center font-bold text-[10px] animate-pulse">
                          ⚠️ Nhân viên đang trong ca làm. Chỉ phê duyệt sau khi chấm công ra ca.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleApproveTime(log.id, 'Từ chối')}
                            className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                          >
                            <X className="w-4 h-4" />
                            <span>Từ chối</span>
                          </button>
                          <button
                            onClick={() => handleApproveTime(log.id, 'Đã duyệt')}
                            className="py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Phê duyệt</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {timeLogs.filter(l => l.status === 'Chờ duyệt' || l.status === 'Đang trong ca').length === 0 && (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-coffee-light text-coffee-medium text-xs space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                  <p className="font-bold">Tuyệt vời! Không còn yêu cầu chấm công nào chờ duyệt</p>
                </div>
              )}
            </div>
          )}

          {/* DUYỆT NGHỈ PHÉP */}
          {approvalSubTab === 'leave' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leaveRequests.filter(r => r.status === 'Chờ duyệt').map((req) => (
                <div key={req.id} className="bg-white rounded-3xl p-6 border border-coffee-light shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-coffee-light pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 bg-coffee-light rounded-xl flex items-center justify-center text-coffee-primary font-bold text-xs">
                        {req.users?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-coffee-dark">{req.users?.full_name}</h4>
                        <p className="text-[10px] text-coffee-medium">{req.users?.email}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full uppercase">
                      Chờ duyệt
                    </span>
                  </div>

                  <div className="text-xs space-y-2">
                    <p className="flex items-center">
                      <CalendarDays className="w-4 h-4 mr-1.5 text-coffee-primary" />
                      <span>Nghỉ từ ngày: <strong>{new Date(req.start_date).toLocaleDateString('vi-VN')}</strong> đến <strong>{new Date(req.end_date).toLocaleDateString('vi-VN')}</strong></span>
                    </p>
                    <p className="bg-[#FAF6F0] p-3 rounded-xl border border-coffee-light text-coffee-medium italic text-[11px]">
                      Lý do: "{req.reason}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleApproveLeave(req.id, 'Từ chối')}
                      className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Từ chối</span>
                    </button>
                    <button
                      onClick={() => handleApproveLeave(req.id, 'Đã duyệt')}
                      className="py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Phê duyệt</span>
                    </button>
                  </div>
                </div>
              ))}

              {leaveRequests.filter(r => r.status === 'Chờ duyệt').length === 0 && (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-coffee-light text-coffee-medium text-xs space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                  <p className="font-bold">Tuyệt vời! Không còn yêu cầu xin nghỉ phép nào chờ duyệt</p>
                </div>
              )}
            </div>
          )}

          {/* DUYỆT NHẬP & KIỂM KHO */}
          {approvalSubTab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inventoryLogs.filter(l => l.status === 'Chờ duyệt').map((log) => (
                <div key={log.id} className="bg-white rounded-3xl p-6 border border-coffee-light shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-coffee-light pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 bg-coffee-light rounded-xl flex items-center justify-center text-coffee-primary font-bold text-xs">
                        {log.staff_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-coffee-dark">{log.staff_name}</h4>
                        <p className="text-[10px] text-coffee-medium">{new Date(log.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full uppercase">
                      {log.type} - Chờ duyệt
                    </span>
                  </div>

                  <div className="text-xs space-y-2">
                    <p className="font-extrabold text-coffee-dark text-sm">
                      Món: {log.ingredient_name}
                    </p>
                    <p className="text-coffee-medium">
                      Số lượng thay đổi: <strong className="text-coffee-dark">{log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount} {log.ingredient_unit}</strong>
                    </p>
                    {log.cost > 0 && (
                      <p className="text-coffee-medium">
                        Chi phí phát sinh: <strong className="text-emerald-700">{log.cost.toLocaleString('vi-VN')}đ</strong>
                      </p>
                    )}
                    {log.note && (
                      <p className="bg-[#FAF6F0] p-3 rounded-xl border border-coffee-light text-coffee-medium italic text-[11px]">
                        Ghi chú: "{log.note}"
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleApproveInventory(log.id, 'Từ chối')}
                      className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Từ chối</span>
                    </button>
                    <button
                      onClick={() => handleApproveInventory(log.id, 'Đã duyệt')}
                      className="py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Phê duyệt</span>
                    </button>
                  </div>
                </div>
              ))}

              {inventoryLogs.filter(l => l.status === 'Chờ duyệt').length === 0 && (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-coffee-light text-coffee-medium text-xs space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                  <p className="font-bold">Tuyệt vời! Không còn đơn kho hoặc kiểm kho nào chờ duyệt</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. TAB BÁO CÁO DOANH THU */}
      {adminTab === 'reports' && (
        <div className="space-y-6">
          {/* Header Báo Cáo Doanh Thu Tháng */}
          <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-coffee-dark uppercase tracking-wider">Doanh thu tháng này</h3>
              <p className="text-xs text-coffee-medium mt-1">Tổng hợp và so sánh kết quả kinh doanh của **Tháng {(new Date().getMonth() + 1)}/{new Date().getFullYear()}**.</p>
            </div>
            <span className="text-[10px] font-extrabold px-3 py-1.5 bg-coffee-light text-coffee-primary rounded-xl uppercase tracking-wider">
              Lũy kế tháng
            </span>
          </div>

          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">TỔNG DOANH THU</span>
                <h4 className="font-black text-2xl text-coffee-primary">{totalRevenue.toLocaleString('vi-VN')}đ</h4>
              </div>
              <div className="p-3 bg-green-50 rounded-2xl text-green-700">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">HÓA ĐƠN THÀNH CÔNG</span>
                <h4 className="font-black text-2xl text-coffee-primary">{paidOrders.length} đơn</h4>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-700">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">CHI PHÍ NHẬP / PHÁT SINH</span>
                <h4 className="font-black text-2xl text-red-600">-{totalRestockExpenses.toLocaleString('vi-VN')}đ</h4>
              </div>
              <div className="p-3 bg-red-50 rounded-2xl text-red-700">
                <TrendingUp className="w-6 h-6 rotate-180" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">DOANH THU THỰC TẾ THÁNG</span>
                <h4 className="font-black text-2xl text-emerald-700">{netMonthRevenue.toLocaleString('vi-VN')}đ</h4>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Biểu đồ phân bổ hình thức thanh toán vẽ bằng CSS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-coffee-light shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-coffee-dark uppercase tracking-wider">Phân bổ Hình Thức Thanh Toán</h4>
              
              <div className="space-y-4 pt-2">
                {/* Tiền mặt */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-coffee-dark">Tiền mặt</span>
                    <span className="text-coffee-primary">{totalCash.toLocaleString('vi-VN')}đ ({totalRevenue > 0 ? Math.round((totalCash/totalRevenue)*100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-[#FAF6F0] h-3.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-coffee-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${totalRevenue > 0 ? (totalCash / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Chuyển khoản */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-coffee-dark">Chuyển khoản (Ngân hàng/Ví điện tử)</span>
                    <span className="text-coffee-primary">{totalTransfer.toLocaleString('vi-VN')}đ ({totalRevenue > 0 ? Math.round((totalTransfer/totalRevenue)*100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-[#FAF6F0] h-3.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-coffee-accent h-full rounded-full border border-coffee-primary/20 transition-all duration-500" 
                      style={{ width: `${totalRevenue > 0 ? (totalTransfer / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách giao dịch bán hàng đã thanh toán */}
            <div className="bg-white p-6 rounded-3xl border border-coffee-light shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-coffee-dark uppercase tracking-wider">Lịch sử giao dịch gần đây</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-coffee-light text-coffee-medium font-bold">
                      <th className="py-2">Mã đơn</th>
                      <th className="py-2">Ngày</th>
                      <th className="py-2">Bàn</th>
                      <th className="py-2">Thanh toán</th>
                      <th className="py-2 text-right">Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-coffee-light/50">
                    {paidOrders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="py-2.5 font-mono text-[10px] text-coffee-medium">{order.id.substring(0, 8).toUpperCase()}</td>
                        <td className="py-2.5 text-coffee-medium font-medium">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                        <td className="py-2.5 font-semibold text-coffee-dark">{order.tables?.table_name || 'Mang về'}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                            order.payment_method === 'Tiền mặt' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.payment_method}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-coffee-primary">{order.total_amount.toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                    {paidOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-coffee-medium/60">Chưa có giao dịch thanh toán nào hôm nay.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB QUẢN LÝ THỰC ĐƠN */}
      {adminTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-light flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-coffee-dark">Danh Sách Đồ Uống</h3>
              <p className="text-xs text-coffee-medium">Cập nhật giá bán, giá vốn, trạng thái còn hàng/hết hàng và thêm đồ uống mới.</p>
            </div>
            <button
              onClick={openAddProduct}
              className="px-4 py-2.5 bg-coffee-primary hover:bg-coffee-dark text-white font-bold text-xs rounded-2xl transition flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4 text-coffee-accent" />
              <span>Thêm đồ uống</span>
            </button>
          </div>

          {/* Grid hiển thị sản phẩm */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="bg-white rounded-3xl overflow-hidden border border-coffee-light flex flex-col shadow-sm">
                <div className="relative h-28 sm:h-40 bg-coffee-light">
                  {prod.image_url ? (
                    <img 
                      src={prod.image_url} 
                      alt={prod.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-coffee-medium">
                      <Clock className="w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                    prod.status === 'Còn hàng' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {prod.status}
                  </span>
                </div>

                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h4 className="font-extrabold text-coffee-dark text-xs sm:text-sm line-clamp-2 leading-tight">{prod.name}</h4>
                    <p className="text-[10px] text-coffee-medium mt-0.5">
                      Danh mục: <strong>{categories.find(c => c.id === prod.category_id)?.name || 'Khác'}</strong>
                    </p>
                  </div>

                  <div className="text-[10px] sm:text-xs space-y-1">
                    <p className="flex justify-between">
                      <span className="text-coffee-medium">Giá bán:</span>
                      <strong className="text-coffee-primary">{prod.price.toLocaleString('vi-VN')}đ</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-coffee-medium">Giá vốn:</span>
                      <strong className="text-coffee-dark">{(prod.cost_price || 0).toLocaleString('vi-VN')}đ</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-coffee-light/50">
                    <button
                      onClick={() => openEditProduct(prod)}
                      className="py-1.5 bg-[#FAF6F0] hover:bg-coffee-accent text-coffee-primary text-[10px] sm:text-xs font-bold rounded-xl transition flex items-center justify-center space-x-0.5 sm:space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold rounded-xl transition flex items-center justify-center space-x-0.5 sm:space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xoá</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB QUẢN LÝ NHÂN VIÊN */}
      {adminTab === 'staff' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-light flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-coffee-dark">Danh Sách Nhân Viên</h3>
              <p className="text-xs text-coffee-medium">Quản lý hồ sơ nhân sự, email tài khoản và phân quyền đăng nhập.</p>
            </div>
            <button
              onClick={openAddStaff}
              className="px-4 py-2.5 bg-coffee-primary hover:bg-coffee-dark text-white font-bold text-xs rounded-2xl transition flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4 text-coffee-accent" />
              <span>Thêm nhân viên</span>
            </button>
          </div>

          {/* Phiên bản di động (Mobile Card List) */}
          <div className="md:hidden space-y-4">
            {users.map((staff) => (
              <div key={staff.id} className="bg-white p-4 rounded-2xl border border-coffee-light shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 bg-coffee-accent rounded-xl text-coffee-dark font-black flex items-center justify-center text-xs shrink-0">
                    {staff.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-coffee-dark truncate">{staff.full_name}</h4>
                    <p className="text-[10px] text-coffee-medium truncate">{staff.email}</p>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      staff.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {staff.role}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => openEditStaff(staff)}
                    className="p-2 bg-[#FAF6F0] hover:bg-coffee-accent rounded-xl text-coffee-primary transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Phiên bản máy tính (Desktop Table) */}
          <div className="hidden md:block bg-white rounded-3xl border border-coffee-light overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF6F0] border-b border-coffee-light text-coffee-medium font-bold text-xs uppercase">
                    <th className="p-4">Nhân viên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Vai trò</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-light/50">
                  {users.map((staff) => (
                    <tr key={staff.id} className="hover:bg-coffee-light/20 transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-coffee-accent rounded-lg text-coffee-dark font-extrabold flex items-center justify-center text-xs">
                          {staff.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-coffee-dark">{staff.full_name}</span>
                      </td>
                      <td className="p-4 text-coffee-medium">{staff.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditStaff(staff)}
                          className="p-2 bg-coffee-light hover:bg-coffee-accent rounded-lg text-coffee-primary transition inline-flex items-center"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP FORM CRUD SẢN PHẨM */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-6 border border-coffee-accent/40">
            <div className="flex items-center justify-between border-b border-coffee-light pb-4">
              <h3 className="font-extrabold text-lg text-coffee-dark">
                {editingProduct ? 'Cập nhật đồ uống' : 'Thêm đồ uống mới'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 hover:bg-coffee-light rounded-lg text-coffee-medium">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Tên món */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Tên đồ uống</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Giá bán */}
                <div className="space-y-1.5">
                  <label className="font-bold text-coffee-medium uppercase">Giá bán (đ)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                    min={0}
                    required
                  />
                </div>

                {/* Giá vốn */}
                <div className="space-y-1.5">
                  <label className="font-bold text-coffee-medium uppercase">Giá vốn (đ)</label>
                  <input
                    type="number"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(Number(e.target.value))}
                    className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                    min={0}
                    required
                  />
                </div>
              </div>

              {/* Loại món và trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-coffee-medium uppercase">Phân loại</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-coffee-medium uppercase">Trạng thái kho</label>
                  <select
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value as any)}
                    className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  >
                    <option value="Còn hàng">Còn hàng</option>
                    <option value="Hết hàng">Hết hàng</option>
                  </select>
                </div>
              </div>

              {/* URL Hình ảnh */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Hình ảnh (URL)</label>
                <input
                  type="text"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="Nhập link ảnh hoặc để trống"
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark placeholder-coffee-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-coffee-primary hover:bg-coffee-dark text-white font-bold rounded-2xl shadow transition"
              >
                Lưu đồ uống
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP FORM CRUD NHÂN VIÊN */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-6 border border-coffee-accent/40">
            <div className="flex items-center justify-between border-b border-coffee-light pb-4">
              <h3 className="font-extrabold text-lg text-coffee-dark">
                {editingStaff ? 'Cập nhật hồ sơ nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="p-1 hover:bg-coffee-light rounded-lg text-coffee-medium">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              {/* Họ tên */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Họ và Tên</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Email tài khoản</label>
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                  disabled={!!editingStaff} // Email thường không đổi khi sửa để tránh lệch khớp Auth
                />
              </div>

              {/* Vai trò */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Phân quyền</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                >
                  <option value="User">Nhân viên (User)</option>
                  <option value="Admin">Quản trị (Admin)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-coffee-primary hover:bg-coffee-dark text-white font-bold rounded-2xl shadow transition"
              >
                Lưu nhân viên
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
