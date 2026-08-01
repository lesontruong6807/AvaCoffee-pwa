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
import { exportInventoryToExcel, exportInventoryToPDF, exportRevenueToExcel, exportRevenueToPDF, exportAttendanceToExcel, exportAttendanceToPDF } from '@/lib/exportUtils';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [adminTab, setAdminTab] = useState<'approvals' | 'reports' | 'inventory' | 'products' | 'staff' | 'attendance' | 'expenses'>('approvals');
  const [loading, setLoading] = useState(true);

  // Dữ liệu quản trị
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

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
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'Admin' | 'User'>('User');

  // Trạng thái Quản lý Chi phí vận hành
  const [expStartDate, setExpStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [expEndDate, setExpEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expName, setExpName] = useState('');
  const [expType, setExpType] = useState<'co_dinh' | 'bien_dong'>('bien_dong');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');

  // Bộ lọc Báo cáo Chấm công
  const [attStartDate, setAttStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [attEndDate, setAttEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [attUserId, setAttUserId] = useState('all');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'summary' | 'shifts' | 'leaves'>('summary');

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!expName.trim() || !expAmount || Number(expAmount) <= 0) {
      toast.error('Vui lòng nhập tên chi phí và số tiền hợp lệ!');
      return;
    }
    try {
      await db.createExpense({
        name: expName.trim(),
        type: expType,
        amount: Number(expAmount),
        date: expDate,
        staff_id: currentUser.id,
        notes: expNotes.trim()
      });
      toast.success('Đã lưu chi phí vận hành thành công!');
      setIsExpModalOpen(false);
      setExpName('');
      setExpType('bien_dong');
      setExpAmount('');
      setExpDate(new Date().toISOString().split('T')[0]);
      setExpNotes('');
      loadAllData();
    } catch (err) {
      toast.error('Không thể lưu chi phí.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xoá khoản chi phí này không?')) {
      try {
        await db.deleteExpense(id);
        toast.success('Đã xoá khoản chi phí.');
        loadAllData();
      } catch (err) {
        toast.error('Không thể xoá chi phí.');
      }
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [logs, leaves, ords, prods, cats, usrs, invLogs, ings, ordItems, exps] = await Promise.all([
        db.getTimeLogs(),
        db.getLeaveRequests(),
        db.getOrders(),
        db.getProducts(),
        db.getCategories(),
        db.getUsers(),
        db.getInventoryLogs(),
        db.getIngredients(),
        db.getAllOrderItems(),
        db.getExpenses()
      ]);
      setTimeLogs(logs);
      setLeaveRequests(leaves);
      setOrders(ords);
      setProducts(prods);
      setCategories(cats);
      setUsers(usrs);
      setInventoryLogs(invLogs);
      setIngredients(ings);
      setAllOrderItems(ordItems);
      setExpenses(exps);
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

  // Bộ lọc ngày cho Báo cáo doanh thu (Tab 'reports')
  const [repStartDate, setRepStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA');
  });
  const [repEndDate, setRepEndDate] = useState(() => new Date().toLocaleDateString('en-CA'));

  // Bộ lọc ngày & tìm kiếm cho Báo cáo kho (Tab 'inventory')
  const [invStartDate, setInvStartDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [invEndDate, setInvEndDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [invSearchQuery, setInvSearchQuery] = useState('');

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

  // Duyệt hàng loạt tất cả đơn chờ duyệt trong sub-tab hiện tại
  const handleApproveAll = async () => {
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn PHÊ DUYỆT TẤT CẢ các đơn đang chờ duyệt trong mục này không?');
    if (!isConfirmed) return;

    try {
      if (approvalSubTab === 'time') {
        const pendingIds = timeLogs.filter(l => l.status === 'Chờ duyệt').map(l => l.id);
        if (pendingIds.length === 0) { toast.info('Không có đơn chấm công nào chờ duyệt.'); return; }
        await db.approveAllTimeLogs(pendingIds, 'Đã duyệt');
      } else if (approvalSubTab === 'leave') {
        const pendingIds = leaveRequests.filter(r => r.status === 'Chờ duyệt').map(r => r.id);
        if (pendingIds.length === 0) { toast.info('Không có đơn nghỉ phép nào chờ duyệt.'); return; }
        await db.approveAllLeaveRequests(pendingIds, 'Đã duyệt');
      } else if (approvalSubTab === 'inventory') {
        const pendingIds = inventoryLogs.filter(l => l.status === 'Chờ duyệt').map(l => l.id);
        if (pendingIds.length === 0) { toast.info('Không có đơn kho nào chờ duyệt.'); return; }
        await db.approveAllInventoryLogs(pendingIds, 'Đã duyệt');
      }

      confetti({ particleCount: 100, spread: 80 });
      toast.success('Đã phê duyệt hàng loạt thành công!');
      await loadAllData();
    } catch (e) {
      toast.error('Gặp lỗi khi phê duyệt hàng loạt.');
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
    setStaffUsername('');
    setStaffPassword('');
    setStaffRole('User');
    setIsStaffModalOpen(true);
  };

  const openEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setStaffName(staff.full_name);
    setStaffEmail(staff.email);
    setStaffUsername(staff.username || '');
    setStaffPassword(''); // Bỏ trống mật khẩu khi sửa, chỉ đổi nếu admin nhập mới
    setStaffRole(staff.role);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const staffPayload: any = {
      full_name: staffName,
      email: staffEmail,
      role: staffRole,
    };

    if (editingStaff) {
      // Khi sửa đổi hồ sơ nhân viên
      if (staffPassword) {
        staffPayload.password = staffPassword;
      }
      // Cho phép sửa cả username nếu cần, nhưng thường thì không đổi
      staffPayload.username = staffUsername;
    } else {
      // Khi thêm nhân viên mới
      staffPayload.username = staffUsername;
      staffPayload.password = staffPassword || '123456';
    }

    try {
      if (editingStaff) {
        await db.updateUser(editingStaff.id, staffPayload);
        toast.success('Cập nhật nhân viên thành công!');
      } else {
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
  const repStartT = new Date(repStartDate + 'T00:00:00').getTime();
  const repEndT = new Date(repEndDate + 'T23:59:59').getTime();

  const paidOrders = orders.filter(o => {
    if (o.payment_status !== 'Đã thanh toán') return false;
    const t = new Date(o.created_at).getTime();
    return t >= repStartT && t <= repEndT;
  });

  const rangeRestockLogs = inventoryLogs.filter(l => {
    if (l.type !== 'Nhập kho' || l.status === 'Từ chối') return false;
    const t = new Date(l.created_at).getTime();
    return t >= repStartT && t <= repEndT;
  });

  const totalDiscount = paidOrders.reduce((sum, o) => sum + Number(o.discount || 0), 0);
  const grossRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0) + totalDiscount;
  const actualRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalCash = paidOrders.filter(o => o.payment_method === 'Tiền mặt').reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalTransfer = paidOrders.filter(o => o.payment_method === 'Chuyển khoản').reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Tính tổng giá vốn các món đã bán trong giai đoạn (sử dụng snapshot gia_von từ hoadondetail)
  const totalCOGS = paidOrders.reduce((sum, order) => {
    const items = allOrderItems.filter(item => item.order_id === order.id);
    const orderCost = items.reduce((itemSum, item) => {
      const costPrice = Number(item.cost_price || 0);
      return itemSum + (item.quantity * costPrice);
    }, 0);
    return sum + orderCost;
  }, 0);

  // Chi phí vận hành trong khoảng thời gian được chọn
  const rangeExpenses = expenses.filter(e => {
    const t = new Date(e.date + 'T00:00:00').getTime();
    return t >= repStartT && t <= repEndT;
  });
  const totalExpenses = rangeExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const netProfit = actualRevenue - totalCOGS - totalExpenses;
  
  const totalRestockCosts = rangeRestockLogs.reduce((sum, l) => sum + Number(l.cost || 0), 0);
  const totalRestockExpenses = totalRestockCosts + totalDiscount; // Chi phí nhập / giảm giá
  const netMonthRevenue = grossRevenue - totalRestockExpenses;
  const totalRevenue = grossRevenue;


  // --- LÓGIC BÁO CÁO KHO THEO KHOẢNG NGÀY ---
  const getLogAppliedAmount = (log: any) => {
    if (log.type === 'Bán hàng' || log.type === 'Pha chế') {
      return Number(log.change_amount || 0);
    }
    if (log.type === 'Nhập kho') {
      if (log.status === 'Từ chối') return 0;
      return Number(log.change_amount || 0);
    }
    if (log.type === 'Hao hụt/Cân lại') {
      if (log.status === 'Đã duyệt') return Number(log.change_amount || 0);
      return 0;
    }
    return Number(log.change_amount || 0);
  };

  const getHistoricalIngStats = (ing: any) => {
    const startT = new Date(invStartDate + 'T00:00:00').getTime();
    const endT = new Date(invEndDate + 'T23:59:59').getTime();

    const ingLogs = inventoryLogs
      .filter(l => l.ingredient_id === ing.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const logsAfterStart = ingLogs.filter(l => new Date(l.created_at).getTime() >= startT);
    const totalAppliedAfterStart = logsAfterStart.reduce((sum, l) => sum + getLogAppliedAmount(l), 0);
    const openingStock = Number(ing.stock_quantity) - totalAppliedAfterStart;

    const logsAfterEnd = ingLogs.filter(l => new Date(l.created_at).getTime() > endT);
    const totalAppliedAfterEnd = logsAfterEnd.reduce((sum, l) => sum + getLogAppliedAmount(l), 0);
    const endingStock = Number(ing.stock_quantity) - totalAppliedAfterEnd;

    const logsInRange = ingLogs.filter(l => {
      const t = new Date(l.created_at).getTime();
      return t >= startT && t <= endT;
    });

    const refilled = logsInRange
      .filter(l => l.type === 'Nhập kho' && l.status !== 'Từ chối')
      .reduce((sum, l) => sum + Number(l.change_amount || 0), 0);

    const sold = logsInRange
      .filter(l => l.type === 'Bán hàng')
      .reduce((sum, l) => sum + Math.abs(Number(l.change_amount || 0)), 0);

    return {
      openingStock,
      endingStock,
      refilled,
      sold
    };
  };

  const formatIngredientStock = (qty: number, unit: string, quyCach: string | null) => {
    if (quyCach && quyCach.toLowerCase().includes('lít') && unit.toLowerCase() === 'ml') {
      return `${qty / 1000}L`;
    }
    return `${qty} ${unit}`;
  };

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
          onClick={() => setAdminTab('inventory')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold transition ${
            adminTab === 'inventory'
              ? 'bg-coffee-primary text-white shadow'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          <CalendarDays className="w-4.5 h-4.5" />
          <span>Báo cáo kho</span>
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
        <button
          onClick={() => setAdminTab('attendance')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold transition ${
            adminTab === 'attendance'
              ? 'bg-coffee-primary text-white shadow'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          <Clock className="w-4.5 h-4.5" />
          <span>Báo cáo chấm công</span>
        </button>
        <button
          onClick={() => setAdminTab('expenses')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold transition ${
            adminTab === 'expenses'
              ? 'bg-coffee-primary text-white shadow'
              : 'text-coffee-medium hover:bg-coffee-light'
          }`}
        >
          <DollarSign className="w-4.5 h-4.5" />
          <span>Chi phí vận hành</span>
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

            {/* Nút Duyệt tất cả */}
            <button
              onClick={handleApproveAll}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-2xl transition shadow-md shadow-green-600/10 flex items-center space-x-1.5 shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Duyệt tất cả</span>
            </button>
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
          {/* Bộ lọc khoảng ngày */}
          <div className="bg-white p-5 rounded-3xl border border-coffee-light flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3.5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-coffee-medium">Từ ngày:</span>
                <input
                  type="date"
                  value={repStartDate}
                  onChange={(e) => setRepStartDate(e.target.value)}
                  className="h-10 px-3 bg-[#FAF6F0] rounded-xl border-none focus:ring-1 focus:ring-coffee-primary font-bold text-coffee-dark"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-coffee-medium">Đến ngày:</span>
                <input
                  type="date"
                  value={repEndDate}
                  onChange={(e) => setRepEndDate(e.target.value)}
                  className="h-10 px-3 bg-[#FAF6F0] rounded-xl border-none focus:ring-1 focus:ring-coffee-primary font-bold text-coffee-dark"
                />
              </div>
            </div>
            <div className="text-xs text-coffee-medium">
              Tìm thấy <strong>{paidOrders.length}</strong> hóa đơn trong khoảng chọn.
            </div>
          </div>

          {/* Header Báo Cáo Doanh Thu */}
          <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-coffee-dark uppercase tracking-wider">Doanh thu theo giai đoạn</h3>
              <p className="text-xs text-coffee-medium mt-1">Tổng hợp và báo cáo kết quả kinh doanh từ ngày <strong>{new Date(repStartDate).toLocaleDateString('vi-VN')}</strong> đến ngày <strong>{new Date(repEndDate).toLocaleDateString('vi-VN')}</strong>.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => exportRevenueToExcel({
                  grossRevenue, totalDiscount, totalRestockCosts, totalRestockExpenses,
                  netRevenue: netMonthRevenue, totalCash, totalTransfer, paidOrders,
                  restockLogs: rangeRestockLogs, totalCOGS, netProfit, totalExpenses
                }, repStartDate, repEndDate)}
                className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-[10px] font-bold rounded-xl transition border border-green-200"
              >
                📊 Xuất Excel
              </button>
              <button
                onClick={() => exportRevenueToPDF({
                  grossRevenue, totalDiscount, totalRestockCosts, totalRestockExpenses,
                  netRevenue: netMonthRevenue, totalCash, totalTransfer, paidOrders,
                  restockLogs: rangeRestockLogs, totalCOGS, netProfit, totalExpenses
                }, repStartDate, repEndDate)}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-xl transition border border-red-200"
              >
                📄 Xuất PDF
              </button>

            </div>
          </div>

          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">DOANH THU THUẦN</span>
                <h4 className="font-black text-xl text-coffee-primary">{actualRevenue.toLocaleString('vi-VN')}đ</h4>
              </div>
              <div className="p-3 bg-green-50 rounded-2xl text-green-700">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">TỔNG GIÁ VỐN (COGS)</span>
                <h4 className="font-black text-xl text-amber-700">{totalCOGS.toLocaleString('vi-VN')}đ</h4>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-700">
                <TrendingUp className="w-6 h-6 rotate-180" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">LỢI NHUẬN GỘP</span>
                <h4 className="font-black text-xl text-emerald-700">{(actualRevenue - totalCOGS).toLocaleString('vi-VN')}đ</h4>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">CHI PHÍ VẬN HÀNH</span>
                <h4 className="font-black text-xl text-red-600">-{totalExpenses.toLocaleString('vi-VN')}đ</h4>
              </div>
              <div className="p-3 bg-red-50 rounded-2xl text-red-700">
                <TrendingUp className="w-6 h-6 rotate-180" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-coffee-light flex items-center justify-between shadow-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">LỢI NHUẬN RÒNG</span>
                <h4 className={`font-black text-xl ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {netProfit.toLocaleString('vi-VN')}đ
                </h4>
              </div>
              <div className={`p-3 rounded-2xl ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
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
          
          {/* Chi tiết chi phí nhập kho */}
          <div className="bg-white p-6 rounded-3xl border border-coffee-light shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-coffee-dark uppercase tracking-wider">Chi Tiết Chi Phí Nhập Kho</h4>
              <span className="text-xs text-coffee-medium">Tổng tiền nhập: <strong className="text-red-600">-{totalRestockCosts.toLocaleString('vi-VN')}đ</strong></span>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-coffee-light text-coffee-medium font-bold uppercase">
                    <th className="py-2">Ngày</th>
                    <th className="py-2">Nguyên liệu</th>
                    <th className="py-2">Ghi chú/Lý do</th>
                    <th className="py-2 text-right">Chi phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-light/50">
                  {rangeRestockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-coffee-light/10 transition-colors">
                      <td className="py-2.5 text-coffee-medium font-medium">
                        {new Date(log.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-2.5 font-bold text-coffee-dark">
                        {log.ingredient_name}
                      </td>
                      <td className="py-2.5 text-coffee-medium italic">
                        {log.note || 'Nhập kho'}
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-red-600">
                        -{log.cost.toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                  {rangeRestockLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-coffee-medium/60 italic">
                        Không phát sinh chi phí nhập kho nào trong khoảng thời gian này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 TAB BÁO CÁO KHO THEO KHOẢNG NGÀY */}
      {adminTab === 'inventory' && (
        <div className="space-y-6">
          {/* Bộ lọc khoảng ngày & tìm kiếm */}
          <div className="bg-white p-5 rounded-3xl border border-coffee-light shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-coffee-medium">Từ ngày:</span>
                <input
                  type="date"
                  value={invStartDate}
                  onChange={(e) => setInvStartDate(e.target.value)}
                  className="h-10 px-3 bg-[#FAF6F0] rounded-xl border-none focus:ring-1 focus:ring-coffee-primary font-bold text-coffee-dark"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-coffee-medium">Đến ngày:</span>
                <input
                  type="date"
                  value={invEndDate}
                  onChange={(e) => setInvEndDate(e.target.value)}
                  className="h-10 px-3 bg-[#FAF6F0] rounded-xl border-none focus:ring-1 focus:ring-coffee-primary font-bold text-coffee-dark"
                />
              </div>
            </div>
            
            <input
              type="text"
              placeholder="🔍 Tìm kiếm nguyên liệu..."
              value={invSearchQuery}
              onChange={(e) => setInvSearchQuery(e.target.value)}
              className="w-full md:w-64 h-10 px-4 bg-[#FAF6F0] rounded-xl text-xs border-none focus:ring-1 focus:ring-coffee-primary text-coffee-dark"
            />
          </div>

          {/* Tiêu đề báo cáo */}
          <div className="bg-white p-5 rounded-3xl border border-coffee-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-coffee-dark uppercase tracking-wider">Thống kê nguyên liệu kho</h3>
              <p className="text-xs text-coffee-medium mt-1">
                Xem lượng tồn đầu kỳ ngày <strong>{new Date(invStartDate).toLocaleDateString('vi-VN')}</strong> đến lượng tồn thực tế cuối ngày <strong>{new Date(invEndDate).toLocaleDateString('vi-VN')}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const rows = ingredients
                    .filter(ing => ing.name.toLowerCase().includes(invSearchQuery.toLowerCase()))
                    .map(ing => {
                      const { openingStock, endingStock, refilled, sold } = getHistoricalIngStats(ing);
                      return {
                        name: ing.name,
                        unit: ing.unit,
                        quy_cach: ing.quy_cach,
                        openingStock: formatIngredientStock(openingStock, ing.unit, ing.quy_cach),
                        refilled: refilled > 0 ? `+${formatIngredientStock(refilled, ing.unit, ing.quy_cach)}` : '-',
                        sold: sold > 0 ? `-${formatIngredientStock(sold, ing.unit, ing.quy_cach)}` : '-',
                        endingStock: formatIngredientStock(endingStock, ing.unit, ing.quy_cach)
                      };
                    });
                  exportInventoryToExcel(rows, invStartDate, invEndDate);
                }}
                className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-[10px] font-bold rounded-xl transition border border-green-200"
              >
                📊 Xuất Excel
              </button>
              <button
                onClick={() => {
                  const rows = ingredients
                    .filter(ing => ing.name.toLowerCase().includes(invSearchQuery.toLowerCase()))
                    .map(ing => {
                      const { openingStock, endingStock, refilled, sold } = getHistoricalIngStats(ing);
                      return {
                        name: ing.name,
                        unit: ing.unit,
                        quy_cach: ing.quy_cach,
                        openingStock: formatIngredientStock(openingStock, ing.unit, ing.quy_cach),
                        refilled: refilled > 0 ? `+${formatIngredientStock(refilled, ing.unit, ing.quy_cach)}` : '-',
                        sold: sold > 0 ? `-${formatIngredientStock(sold, ing.unit, ing.quy_cach)}` : '-',
                        endingStock: formatIngredientStock(endingStock, ing.unit, ing.quy_cach)
                      };
                    });
                  exportInventoryToPDF(rows, invStartDate, invEndDate);
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-xl transition border border-red-200"
              >
                📄 Xuất PDF
              </button>
            </div>
          </div>

          {/* Bảng Excel-style */}
          <div className="bg-white rounded-3xl border border-coffee-light shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse text-left text-xs font-sans table-fixed min-w-[700px]">
                <thead>
                  <tr className="bg-[#FAF6F0] sticky top-0 z-20 border-b border-coffee-light">
                    <th className="p-3.5 w-52 font-black text-coffee-dark bg-[#FAF6F0] sticky left-0 z-30 border-r border-coffee-light/60">
                      Tên nguyên liệu
                    </th>
                    <th className="p-3.5 w-32 font-bold text-coffee-medium border-r border-coffee-light/60">
                      Tồn đầu kỳ
                    </th>
                    <th className="p-3.5 w-32 font-bold text-green-700 border-r border-coffee-light/60">
                      SL nhập (+)
                    </th>
                    <th className="p-3.5 w-32 font-bold text-red-600 border-r border-coffee-light/60">
                      SL bán (-)
                    </th>
                    <th className="p-3.5 w-40 font-black text-coffee-primary">
                      Tồn thực tế cuối kỳ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-light/50">
                  {ingredients
                    .filter(ing => ing.name.toLowerCase().includes(invSearchQuery.toLowerCase()))
                    .map((ing) => {
                      const { openingStock, endingStock, refilled, sold } = getHistoricalIngStats(ing);
                      const formattedOpening = formatIngredientStock(openingStock, ing.unit, ing.quy_cach);
                      const formattedEnding = formatIngredientStock(endingStock, ing.unit, ing.quy_cach);
                      const formatRefill = refilled > 0 ? `+${formatIngredientStock(refilled, ing.unit, ing.quy_cach)}` : '-';
                      const formatSold = sold > 0 ? `-${formatIngredientStock(sold, ing.unit, ing.quy_cach)}` : '-';

                      return (
                        <tr key={ing.id} className="hover:bg-coffee-light/20 transition-all">
                          {/* Sticky First Column */}
                          <td className="p-3 font-bold text-coffee-dark sticky left-0 z-10 border-r border-coffee-light/60 border-b border-coffee-light/40 w-52 whitespace-normal break-words bg-white">
                            <div className="flex flex-col">
                              <span className="whitespace-normal break-words leading-tight">{ing.name}</span>
                              <span className="text-[10px] text-coffee-medium font-normal leading-tight mt-1">
                                ({ing.unit}{ing.quy_cach ? `, ${ing.quy_cach}` : ''})
                              </span>
                            </div>
                          </td>
                          <td className="p-3 border-r border-coffee-light/60 text-coffee-medium font-semibold">
                            {formattedOpening}
                          </td>
                          <td className="p-3 border-r border-coffee-light/60 text-green-700 font-extrabold">
                            {formatRefill}
                          </td>
                          <td className="p-3 border-r border-coffee-light/60 text-red-600 font-extrabold">
                            {formatSold}
                          </td>
                          <td className="p-3 text-coffee-primary font-black">
                            {formattedEnding}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
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
              <p className="text-xs text-coffee-medium">Cập nhật giá bán, trạng thái còn hàng/hết hàng và thêm đồ uống mới.</p>
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
                    <p className="text-[10px] text-coffee-medium truncate">@{staff.username || 'no-username'} • {staff.email}</p>
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
                        <div>
                          <span className="font-bold text-coffee-dark block">{staff.full_name}</span>
                          <span className="text-[10px] text-coffee-medium">@{staff.username || 'no-username'}</span>
                        </div>
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

      {/* 6. TAB BÁO CÁO CHẤM CÔNG */}
      {adminTab === 'attendance' && (() => {
        // Hàm tính số ngày giao nhau giữa đơn xin nghỉ và khoảng ngày lọc
        const getOverlapDays = (leaveStart: string, leaveEnd: string, rangeStart: string, rangeEnd: string) => {
          const sStr = leaveStart > rangeStart ? leaveStart : rangeStart;
          const eStr = leaveEnd < rangeEnd ? leaveEnd : rangeEnd;
          if (sStr > eStr) return 0;
          const sDate = new Date(sStr + 'T00:00:00');
          const eDate = new Date(eStr + 'T00:00:00');
          const diffTime = eDate.getTime() - sDate.getTime();
          return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        };

        const attStartT = new Date(attStartDate + 'T00:00:00').getTime();
        const attEndT = new Date(attEndDate + 'T23:59:59').getTime();

        const filteredLogs = timeLogs.filter(log => {
          if (attUserId !== 'all' && log.user_id !== attUserId) return false;
          const t = new Date(log.check_in_time).getTime();
          return t >= attStartT && t <= attEndT;
        });

        const filteredLeaves = leaveRequests.filter(leave => {
          if (attUserId !== 'all' && leave.user_id !== attUserId) return false;
          const startT = new Date(leave.start_date + 'T00:00:00').getTime();
          const endT = new Date(leave.end_date + 'T23:59:59').getTime();
          return (startT <= attEndT && endT >= attStartT);
        });

        const summaryRows = users.map(user => {
          const userLogs = filteredLogs.filter(log => log.user_id === user.id);
          const approvedLogs = userLogs.filter(log => log.status === 'Đã duyệt');
          
          let totalHours = 0;
          approvedLogs.forEach(log => {
            if (log.check_out_time) {
              const start = new Date(log.check_in_time).getTime();
              const end = new Date(log.check_out_time).getTime();
              const diff = end - start;
              if (diff > 0) {
                totalHours += diff / (1000 * 60 * 60);
              }
            }
          });

          const userLeaves = filteredLeaves.filter(leave => leave.user_id === user.id && leave.status === 'Đã duyệt');
          let totalLeaveDays = 0;
          userLeaves.forEach(leave => {
            totalLeaveDays += getOverlapDays(leave.start_date, leave.end_date, attStartDate, attEndDate);
          });

          return {
            userId: user.id,
            staffName: user.full_name,
            username: user.username || '',
            role: user.role,
            totalShifts: approvedLogs.length,
            totalHours: totalHours,
            totalLeaveDays: totalLeaveDays,
            totalLeaveHours: totalLeaveDays * 8
          };
        });

        const totalApprovedShifts = summaryRows.reduce((acc, r) => acc + (attUserId === 'all' || r.userId === attUserId ? r.totalShifts : 0), 0);
        const totalApprovedHours = summaryRows.reduce((acc, r) => acc + (attUserId === 'all' || r.userId === attUserId ? r.totalHours : 0), 0);
        const totalLeaveDays = summaryRows.reduce((acc, r) => acc + (attUserId === 'all' || r.userId === attUserId ? r.totalLeaveDays : 0), 0);
        const totalLeaveHours = summaryRows.reduce((acc, r) => acc + (attUserId === 'all' || r.userId === attUserId ? r.totalLeaveHours : 0), 0);

        const shiftsDetails = filteredLogs.map(log => {
          let hours = 0;
          if (log.check_out_time) {
            const start = new Date(log.check_in_time).getTime();
            const end = new Date(log.check_out_time).getTime();
            const diff = end - start;
            if (diff > 0) hours = diff / (1000 * 60 * 60);
          }
          const staff = users.find(u => u.id === log.user_id);
          return {
            staffName: staff?.full_name || log.users?.full_name || 'Nhân viên',
            date: new Date(log.check_in_time).toLocaleDateString('vi-VN'),
            shiftName: log.shift,
            checkIn: new Date(log.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(log.check_in_time).toLocaleDateString('vi-VN'),
            checkOut: log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(log.check_out_time).toLocaleDateString('vi-VN') : '-',
            hours: hours,
            status: log.status
          };
        });

        const leavesDetails = filteredLeaves.map(leave => {
          const staff = users.find(u => u.id === leave.user_id);
          const startStr = new Date(leave.start_date).toLocaleDateString('vi-VN');
          const endStr = new Date(leave.end_date).toLocaleDateString('vi-VN');
          const daysInPeriod = getOverlapDays(leave.start_date, leave.end_date, attStartDate, attEndDate);

          return {
            staffName: staff?.full_name || leave.users?.full_name || 'Nhân viên',
            startDate: startStr,
            endDate: endStr,
            days: daysInPeriod,
            reason: leave.reason,
            status: leave.status
          };
        });

        return (
          <div className="space-y-6">
            {/* Header + Bộ lọc */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-light space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-coffee-dark">Báo Cáo Chấm Công & Nghỉ Phép</h3>
                  <p className="text-xs text-coffee-medium">Xem tổng số ca làm, số giờ công thực tế, và lịch sử xin nghỉ phép.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportAttendanceToExcel(summaryRows, shiftsDetails, leavesDetails, attStartDate, attEndDate)}
                    className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-[10px] font-bold rounded-xl transition border border-green-200 flex items-center gap-1"
                  >
                    📊 Xuất Excel
                  </button>
                  <button
                    onClick={() => exportAttendanceToPDF(summaryRows, shiftsDetails, leavesDetails, attStartDate, attEndDate)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-xl transition border border-red-200 flex items-center gap-1"
                  >
                    📄 Xuất PDF
                  </button>
                </div>
              </div>

              {/* Bộ lọc */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-coffee-light/50 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-coffee-medium uppercase">Từ ngày</label>
                  <input
                    type="date"
                    value={attStartDate}
                    onChange={(e) => setAttStartDate(e.target.value)}
                    className="w-full bg-[#FAF6F0] px-4 py-2.5 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-coffee-medium uppercase">Đến ngày</label>
                  <input
                    type="date"
                    value={attEndDate}
                    onChange={(e) => setAttEndDate(e.target.value)}
                    className="w-full bg-[#FAF6F0] px-4 py-2.5 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-coffee-medium uppercase">Nhân viên</label>
                  <select
                    value={attUserId}
                    onChange={(e) => setAttUserId(e.target.value)}
                    className="w-full bg-[#FAF6F0] px-4 py-2.5 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  >
                    <option value="all">Tất cả nhân viên</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Thống kê dạng Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-coffee-light shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-coffee-accent/40 rounded-2xl text-coffee-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-coffee-medium uppercase">Tổng ca làm</p>
                  <h4 className="text-lg font-black text-coffee-dark">{totalApprovedShifts} ca</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-coffee-light shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-coffee-medium uppercase">Tổng giờ công</p>
                  <h4 className="text-lg font-black text-coffee-dark">{totalApprovedHours.toFixed(1)} h</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-coffee-light shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-coffee-medium uppercase">Số ngày xin nghỉ</p>
                  <h4 className="text-lg font-black text-coffee-dark">{totalLeaveDays} ngày</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-coffee-light shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-coffee-medium uppercase">Tổng giờ nghỉ</p>
                  <h4 className="text-lg font-black text-coffee-dark">{totalLeaveHours.toFixed(1)} h</h4>
                </div>
              </div>
            </div>

            {/* Sub-tabs điều hướng bảng */}
            <div className="bg-white p-2 rounded-2xl border border-coffee-light flex space-x-1 shadow-sm w-fit text-xs">
              <button
                onClick={() => setAttendanceSubTab('summary')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  attendanceSubTab === 'summary' ? 'bg-coffee-primary text-white shadow-sm' : 'text-coffee-medium hover:bg-coffee-light'
                }`}
              >
                Tổng hợp công
              </button>
              <button
                onClick={() => setAttendanceSubTab('shifts')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  attendanceSubTab === 'shifts' ? 'bg-coffee-primary text-white shadow-sm' : 'text-coffee-medium hover:bg-coffee-light'
                }`}
              >
                Lịch sử ca làm ({shiftsDetails.length})
              </button>
              <button
                onClick={() => setAttendanceSubTab('leaves')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  attendanceSubTab === 'leaves' ? 'bg-coffee-primary text-white shadow-sm' : 'text-coffee-medium hover:bg-coffee-light'
                }`}
              >
                Lịch sử nghỉ phép ({leavesDetails.length})
              </button>
            </div>

            {/* Render các bảng dữ liệu */}
            {attendanceSubTab === 'summary' && (
              <div className="bg-white rounded-3xl border border-coffee-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#FAF6F0] border-b border-coffee-light text-coffee-medium font-bold text-xs uppercase">
                        <th className="p-4">Nhân viên</th>
                        <th className="p-4">Vai trò</th>
                        <th className="p-4 text-center">Số ca làm (Đã duyệt)</th>
                        <th className="p-4 text-right">Tổng giờ làm</th>
                        <th className="p-4 text-center">Số ngày nghỉ (Đã duyệt)</th>
                        <th className="p-4 text-right">Tổng giờ nghỉ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-light/50">
                      {summaryRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-coffee-light/20 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-coffee-dark">{row.staffName}</div>
                            <div className="text-[10px] text-coffee-medium">@{row.username}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {row.role}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-coffee-dark">{row.totalShifts}</td>
                          <td className="p-4 text-right font-extrabold text-green-700">{row.totalHours.toFixed(1)} giờ</td>
                          <td className="p-4 text-center font-bold text-coffee-dark">{row.totalLeaveDays} ngày</td>
                          <td className="p-4 text-right font-extrabold text-red-700">{row.totalLeaveHours.toFixed(1)} giờ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {attendanceSubTab === 'shifts' && (
              <div className="bg-white rounded-3xl border border-coffee-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#FAF6F0] border-b border-coffee-light text-coffee-medium font-bold text-xs uppercase">
                        <th className="p-4">STT</th>
                        <th className="p-4">Nhân viên</th>
                        <th className="p-4">Ngày</th>
                        <th className="p-4">Ca làm</th>
                        <th className="p-4">Giờ vào thực tế</th>
                        <th className="p-4">Giờ ra thực tế</th>
                        <th className="p-4 text-right">Số giờ làm</th>
                        <th className="p-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-light/50">
                      {shiftsDetails.map((row, idx) => (
                        <tr key={idx} className="hover:bg-coffee-light/20 transition-colors">
                          <td className="p-4 text-coffee-medium font-mono">{idx + 1}</td>
                          <td className="p-4 font-bold text-coffee-dark">{row.staffName}</td>
                          <td className="p-4 text-coffee-medium">{row.date}</td>
                          <td className="p-4 text-coffee-dark font-medium">{row.shiftName}</td>
                          <td className="p-4 text-coffee-medium font-mono">{row.checkIn}</td>
                          <td className="p-4 text-coffee-medium font-mono">{row.checkOut}</td>
                          <td className="p-4 text-right font-bold text-coffee-dark">{row.hours.toFixed(1)} h</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                              row.status === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                              row.status === 'Từ chối' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {attendanceSubTab === 'leaves' && (
              <div className="bg-white rounded-3xl border border-coffee-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#FAF6F0] border-b border-coffee-light text-coffee-medium font-bold text-xs uppercase">
                        <th className="p-4">STT</th>
                        <th className="p-4">Nhân viên</th>
                        <th className="p-4">Từ ngày</th>
                        <th className="p-4">Đến ngày</th>
                        <th className="p-4 text-center">Số ngày nghỉ</th>
                        <th className="p-4">Lý do xin nghỉ</th>
                        <th className="p-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-light/50">
                      {leavesDetails.map((row, idx) => (
                        <tr key={idx} className="hover:bg-coffee-light/20 transition-colors">
                          <td className="p-4 text-coffee-medium font-mono">{idx + 1}</td>
                          <td className="p-4 font-bold text-coffee-dark">{row.staffName}</td>
                          <td className="p-4 text-coffee-dark">{row.startDate}</td>
                          <td className="p-4 text-coffee-dark">{row.endDate}</td>
                          <td className="p-4 text-center font-bold text-coffee-dark">{row.days} ngày</td>
                          <td className="p-4 text-coffee-medium italic max-w-xs truncate" title={row.reason}>{row.reason}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                              row.status === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {adminTab === 'expenses' && (
        <div className="space-y-6">
          {/* Bộ lọc khoảng ngày */}
          <div className="bg-white p-5 rounded-3xl border border-coffee-light flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3.5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-coffee-medium">Từ ngày:</span>
                <input
                  type="date"
                  value={expStartDate}
                  onChange={(e) => setExpStartDate(e.target.value)}
                  className="h-10 px-3 bg-[#FAF6F0] rounded-xl border-none focus:ring-1 focus:ring-coffee-primary font-bold text-coffee-dark"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-coffee-medium">Đến ngày:</span>
                <input
                  type="date"
                  value={expEndDate}
                  onChange={(e) => setExpEndDate(e.target.value)}
                  className="h-10 px-3 bg-[#FAF6F0] rounded-xl border-none focus:ring-1 focus:ring-coffee-primary font-bold text-coffee-dark"
                />
              </div>
            </div>
            <button
              onClick={() => setIsExpModalOpen(true)}
              className="px-4 py-2.5 bg-coffee-primary hover:bg-coffee-dark text-white text-xs font-bold rounded-xl transition flex items-center space-x-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm chi phí vận hành</span>
            </button>
          </div>

          {/* Bảng chi phí */}
          <div className="bg-white rounded-3xl border border-coffee-light shadow-sm overflow-hidden">
            <div className="p-5 border-b border-coffee-light">
              <h3 className="font-extrabold text-sm text-coffee-dark uppercase tracking-wider">Chi tiết chi phí vận hành</h3>
              <p className="text-xs text-coffee-medium mt-1">Tổng cộng chi phí trong khoảng thời gian này: <strong className="text-red-600">{expenses.filter(e => e.date >= expStartDate && e.date <= expEndDate).reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString('vi-VN')}đ</strong></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF6F0] border-b border-coffee-light text-coffee-medium font-bold text-xs uppercase">
                    <th className="p-4">STT</th>
                    <th className="p-4">Ngày chi</th>
                    <th className="p-4">Tên chi phí</th>
                    <th className="p-4">Phân loại</th>
                    <th className="p-4">Người ghi nhận</th>
                    <th className="p-4 text-right">Số tiền</th>
                    <th className="p-4">Ghi chú</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-light/50">
                  {expenses
                    .filter(e => e.date >= expStartDate && e.date <= expEndDate)
                    .map((item, idx) => (
                      <tr key={item.id} className="hover:bg-coffee-light/20 transition-colors">
                        <td className="p-4 text-coffee-medium font-mono">{idx + 1}</td>
                        <td className="p-4 text-coffee-dark font-medium">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4 font-bold text-coffee-dark">{item.name}</td>
                        <td className="p-4 text-coffee-dark">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'co_dinh' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            {item.type === 'co_dinh' ? 'Cố định' : 'Biến động'}
                          </span>
                        </td>
                        <td className="p-4 text-coffee-medium">{item.staff_name}</td>
                        <td className="p-4 text-right font-black text-coffee-dark">{item.amount.toLocaleString('vi-VN')}đ</td>
                        <td className="p-4 text-coffee-medium max-w-xs truncate" title={item.notes}>{item.notes || '-'}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteExpense(item.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                            title="Xóa khoản chi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {expenses.filter(e => e.date >= expStartDate && e.date <= expEndDate).length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-coffee-medium text-xs">
                        Không tìm thấy khoản chi phí vận hành nào trong khoảng thời gian đã chọn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP FORM THÊM CHI PHÍ VẬN HÀNH */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-6 border border-coffee-accent/40">
            <div className="flex items-center justify-between border-b border-coffee-light pb-4">
              <h3 className="font-extrabold text-lg text-coffee-dark">
                Ghi nhận Chi phí vận hành mới
              </h3>
              <button onClick={() => setIsExpModalOpen(false)} className="p-1 hover:bg-coffee-light rounded-lg text-coffee-medium">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              {/* Tên chi phí */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Tên chi phí</label>
                <input
                  type="text"
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  placeholder="Ví dụ: Tiền điện tháng 8, Tiền mặt bằng..."
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                />
              </div>

              {/* Loại chi phí & Ngày chi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-coffee-medium uppercase">Phân loại</label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as any)}
                    className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  >
                    <option value="bien_dong">Biến động (Biến phí)</option>
                    <option value="co_dinh">Cố định (Định phí)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-coffee-medium uppercase">Ngày chi</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                    required
                  />
                </div>
              </div>

              {/* Số tiền */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Số tiền chi (VND)</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                />
              </div>

              {/* Ghi chú */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Ghi chú</label>
                <textarea
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="Ghi chú chi tiết thêm..."
                  rows={3}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-coffee-primary hover:bg-coffee-dark text-white font-bold rounded-2xl shadow transition"
              >
                Lưu khoản chi
              </button>
            </form>
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

              {/* Username */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Tên đăng nhập (Username)</label>
                <input
                  type="text"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                  disabled={!!editingStaff}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="font-bold text-coffee-medium uppercase">Mật khẩu (Password)</label>
                <input
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder={editingStaff ? "Để trống nếu không muốn đổi mật khẩu" : "Mật khẩu cho tài khoản mới"}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required={!editingStaff}
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
