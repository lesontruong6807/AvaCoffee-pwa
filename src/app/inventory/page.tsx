'use client';

import React, { useState, useEffect } from 'react';
import { db, getCurrentUser, formatIngredientStock, formatIngredientRefill, getIngredientPackageInfo } from '@/lib/database';
import { toast } from '@/lib/toast';
import { 
  Package, 
  PlusCircle, 
  ClipboardCheck, 
  AlertTriangle, 
  History, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  DollarSign,
  Boxes
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function InventoryPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'stock' | 'logs'>('stock');
  const [searchQuery, setSearchQuery] = useState('');

  // Bộ lọc lịch sử kho
  const [logStartDate, setLogStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [logEndDate, setLogEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Restock Modal
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedIngId, setSelectedIngId] = useState<string>('');
  const [customIngName, setCustomIngName] = useState<string>('');
  const [restockQty, setRestockQty] = useState<number | ''>('');
  const [restockCost, setRestockCost] = useState<number | ''>('');
  const [restockNote, setRestockNote] = useState<string>('');
  const [submittingRestock, setSubmittingRestock] = useState(false);

  // Stocktake Modal
  const [isStocktakeOpen, setIsStocktakeOpen] = useState(false);
  const [stocktakeIngId, setStocktakeIngId] = useState<string>('');
  const [actualStock, setActualStock] = useState<number | ''>('');
  const [stocktakeNote, setStocktakeNote] = useState<string>('');
  const [submittingStocktake, setSubmittingStocktake] = useState(false);

  const loadData = async () => {
    try {
      const [ingList, logList] = await Promise.all([
        db.getIngredients(),
        db.getInventoryLogs()
      ]);
      setIngredients(ingList);
      setLogs(logList);
    } catch (e) {
      console.error('Lỗi tải dữ liệu kho:', e);
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineStocktakes = async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const queue = JSON.parse(localStorage.getItem('ava_offline_stocktakes') || '[]');
    if (queue.length === 0) return;
    
    let successCount = 0;
    const remainingQueue = [];
    
    for (const payload of queue) {
      try {
        await db.submitStocktake(payload);
        successCount++;
      } catch (err) {
        console.error('Lỗi đồng bộ offline stocktake:', err);
        remainingQueue.push(payload);
      }
    }
    
    localStorage.setItem('ava_offline_stocktakes', JSON.stringify(remainingQueue));
    if (successCount > 0) {
      toast.success(`Đã tự động đồng bộ ${successCount} đơn kiểm kho ngoại tuyến!`);
      loadData();
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadData();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', syncOfflineStocktakes);
      syncOfflineStocktakes();
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', syncOfflineStocktakes);
      }
    };
  }, []);

  // Tính tổng chi phí nhập kho trong ngày
  const todayStr = new Date().toLocaleDateString('en-CA');

  const todayRestockCost = logs
    .filter(l => l.type === 'Nhập kho' && new Date(l.created_at).toLocaleDateString('en-CA') === todayStr)
    .reduce((sum, l) => sum + Number(l.cost || 0), 0);

  // --- XỬ LÝ NHẬP THÊM (RESTOCK) ---
  const handleOpenRestock = (ingId?: string) => {
    const firstIngId = ingId || ingredients[0]?.id || '';
    setSelectedIngId(firstIngId);
    setCustomIngName('');
    setRestockQty('');
    setRestockCost('');
    setRestockNote('');
    setIsRestockOpen(true);
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thực hiện.');
      return;
    }

    const isCustom = selectedIngId === 'other';
    if (isCustom && !customIngName.trim()) {
      toast.error('Vui lòng nhập tên nguyên liệu khác (ví dụ: Nước đá)!');
      return;
    }

    if (!isCustom && (restockQty === '' || Number(restockQty) <= 0)) {
      toast.error('Vui lòng nhập số lượng hợp lệ!');
      return;
    }

    if (isCustom && !restockNote.trim()) {
      toast.error('Vui lòng nhập ghi chú chi tiết cho nguyên liệu khác (VD: 2 bao nước đá)!');
      return;
    }

    setSubmittingRestock(true);
    try {
      const selectedIng = ingredients.find(i => i.id === selectedIngId);
      const pkgInfo = selectedIng ? getIngredientPackageInfo(selectedIng.unit, selectedIng.quy_cach) : { multiplier: 1 };
      const finalChangeAmount = isCustom ? 1 : (Number(restockQty) * pkgInfo.multiplier);

      await db.restockIngredient({
        ingredient_id: selectedIngId,
        custom_ingredient_name: isCustom ? customIngName.trim() : undefined,
        change_amount: finalChangeAmount,
        cost: Number(restockCost || 0),
        note: restockNote.trim(),
        staff_id: currentUser.id
      });

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
      toast.success('Đã gửi yêu cầu nhập kho thành công!');
      setIsRestockOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Không thể gửi yêu cầu nhập kho.');
    } finally {
      setSubmittingRestock(false);
    }
  };

  // --- XỬ LÝ KIỂM KHO (STOCKTAKE) ---
  const handleOpenStocktake = (ingId?: string) => {
    const firstIngId = ingId || ingredients[0]?.id || '';
    setStocktakeIngId(firstIngId);
    const selectedIng = ingredients.find(i => i.id === firstIngId);
    setActualStock(selectedIng ? selectedIng.stock_quantity : '');
    setStocktakeNote('');
    setIsStocktakeOpen(true);
  };

  const handleStocktakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!stocktakeIngId) {
      toast.error('Vui lòng chọn nguyên liệu cần kiểm kho!');
      return;
    }

    if (actualStock === '' || Number(actualStock) < 0) {
      toast.error('Vui lòng nhập số lượng đếm thực tế hợp lệ!');
      return;
    }

    if (!stocktakeNote.trim()) {
      toast.error('Vui lòng điền ghi chú giải trình kiểm kho!');
      return;
    }

    const selectedIng = ingredients.find(i => i.id === stocktakeIngId);
    if (!selectedIng) return;

    setSubmittingStocktake(true);
    const payload = {
      ingredient_id: stocktakeIngId,
      actual_stock: Number(actualStock),
      system_stock: Number(selectedIng.stock_quantity),
      note: stocktakeNote.trim(),
      staff_id: currentUser.id
    };

    try {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        const offlineQueue = JSON.parse(localStorage.getItem('ava_offline_stocktakes') || '[]');
        offlineQueue.push(payload);
        localStorage.setItem('ava_offline_stocktakes', JSON.stringify(offlineQueue));
        
        toast.success('Ngoại tuyến: Đã lưu tạm đơn kiểm kho trên thiết bị để đồng bộ sau!');
        setIsStocktakeOpen(false);
        return;
      }

      await db.submitStocktake(payload);

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
      toast.success('Đã gửi yêu cầu kiểm kho để Admin phê duyệt!');
      setIsStocktakeOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      if (typeof window !== 'undefined') {
        const offlineQueue = JSON.parse(localStorage.getItem('ava_offline_stocktakes') || '[]');
        offlineQueue.push(payload);
        localStorage.setItem('ava_offline_stocktakes', JSON.stringify(offlineQueue));
        toast.success('Lỗi kết nối. Đã lưu tạm đơn kiểm kho trên thiết bị để tự động đồng bộ!');
        setIsStocktakeOpen(false);
      } else {
        toast.error('Lỗi gửi kiểm kho.');
      }
    } finally {
      setSubmittingStocktake(false);
    }
  };

  const selectedRestockIngredient = ingredients.find(i => i.id === selectedIngId);
  const selectedStocktakeIngredient = ingredients.find(i => i.id === stocktakeIngId);

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startT = new Date(logStartDate + 'T00:00:00').getTime();
  const endT = new Date(logEndDate + 'T23:59:59').getTime();

  const getIngStats = (ingId: string, currentStockQty: number) => {
    const ingLogs = logs.filter(l => l.ingredient_id === ingId);

    // 1. Nhật ký TRƯỚC thời điểm bắt đầu đã chọn (t < startT)
    const logsBeforeStart = ingLogs.filter(l => new Date(l.created_at).getTime() < startT);
    const refilledBefore = logsBeforeStart
      .filter(l => l.type === 'Nhập kho' && l.status !== 'Từ chối')
      .reduce((sum, l) => sum + Number(l.change_amount || 0), 0);
    const soldBefore = logsBeforeStart
      .filter(l => l.type === 'Bán hàng')
      .reduce((sum, l) => sum + Math.abs(Number(l.change_amount || 0)), 0);
    const otherBefore = logsBeforeStart
      .filter(l => l.type !== 'Nhập kho' && l.type !== 'Bán hàng')
      .reduce((sum, l) => sum + Number(l.change_amount || 0), 0);

    // Tồn đầu kỳ tại thời điểm startT (Bắt đầu từ 0 vào ngày 03/08)
    const openingStock = Math.max(0, refilledBefore - soldBefore + otherBefore);

    // 2. Nhật ký TRONG khoảng thời gian được chọn [startT, endT]
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
    const otherInRange = logsInRange
      .filter(l => l.type !== 'Nhập kho' && l.type !== 'Bán hàng')
      .reduce((sum, l) => sum + Number(l.change_amount || 0), 0);

    // Tồn thực tế cuối kỳ tại thời điểm endT (Đảm bảo toán học: Tồn cuối = Tồn đầu + Nhập - Bán + Khác)
    const closingStock = openingStock + refilled - sold + otherInRange;

    return {
      openingStock: Math.max(0, openingStock),
      refilled,
      sold,
      closingStock: Math.max(0, closingStock)
    };
  };

  const lowStockCount = ingredients.filter(i => {
    if (i.min_stock === null) return false;
    const { closingStock } = getIngStats(i.id, i.stock_quantity);
    return closingStock <= Number(i.min_stock);
  }).length;

  const filteredLogs = logs.filter(log => {
    const t = new Date(log.created_at).getTime();
    return t >= startT && t <= endT;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-coffee-primary animate-spin" />
        <p className="text-coffee-medium font-medium text-sm">Đang tải dữ liệu kho nguyên liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-coffee-light shadow-sm">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-2.5 hover:bg-[#FAF6F0] rounded-2xl text-coffee-medium transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-coffee-dark flex items-center space-x-2">
              <Boxes className="w-6 h-6 text-coffee-primary" />
              <span>Quản Lý Kho Nguyên Liệu</span>
            </h1>
            <p className="text-xs text-coffee-medium mt-0.5">
              Theo dõi tồn kho thực tế, nhập kho phát sinh và kiểm kê định kỳ
            </p>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC KHO NỔI BẬT */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => handleOpenStocktake()}
            className="px-4 py-2.5 bg-[#FAF6F0] hover:bg-coffee-accent/30 text-coffee-dark font-extrabold text-xs rounded-2xl transition border border-coffee-light flex items-center space-x-1.5 shadow-sm"
          >
            <ClipboardCheck className="w-4 h-4 text-coffee-primary" />
            <span>Kiểm kho Cuối tuần</span>
          </button>

          <button
            onClick={() => handleOpenRestock()}
            className="px-5 py-2.5 bg-coffee-primary hover:bg-coffee-dark text-white font-extrabold text-xs rounded-2xl transition shadow-md shadow-coffee-primary/20 flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nhập Thêm</span>
          </button>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-coffee-light shadow-sm flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">Tổng danh mục NL</span>
          <div className="flex items-end justify-between">
            <h3 className="font-black text-xl text-coffee-dark">{ingredients.length} món</h3>
            <Package className="w-5 h-5 text-coffee-medium/40" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between h-20 transition ${
          lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-coffee-light'
        }`}>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
            lowStockCount > 0 ? 'text-red-700' : 'text-coffee-medium'
          }`}>Sắp hết nguyên liệu</span>
          <div className="flex items-end justify-between">
            <h3 className={`font-black text-xl ${lowStockCount > 0 ? 'text-red-700' : 'text-coffee-dark'}`}>
              {lowStockCount} món
            </h3>
            {lowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-coffee-light shadow-sm flex flex-col justify-between h-20 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">Chi phí nhập kho hôm nay</span>
          <div className="flex items-end justify-between">
            <h3 className="font-black text-lg text-emerald-700">{todayRestockCost.toLocaleString('vi-VN')}đ</h3>
            <DollarSign className="w-5 h-5 text-emerald-500/50" />
          </div>
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div className="flex border-b border-coffee-light space-x-6">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 text-xs md:text-sm font-extrabold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'stock'
              ? 'border-coffee-primary text-coffee-primary'
              : 'border-transparent text-coffee-medium hover:text-coffee-dark'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Danh sách Tồn Kho ({ingredients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-xs md:text-sm font-extrabold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'logs'
              ? 'border-coffee-primary text-coffee-primary'
              : 'border-transparent text-coffee-medium hover:text-coffee-dark'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch sử Nhập / Kiểm Kho ({filteredLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: DANH SÁCH TỒN KHO */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Ô Tìm Kiếm Nhanh */}
          <div className="bg-white p-4 rounded-3xl border border-coffee-light shadow-sm flex items-center space-x-2">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm nhanh nguyên liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-11 px-4 bg-[#FAF6F0] rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-coffee-light hover:bg-coffee-accent/40 text-coffee-dark text-xs font-bold rounded-xl transition"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Bảng Excel-style */}
          <div className="bg-white rounded-3xl border border-coffee-light shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse text-left text-xs font-sans table-fixed min-w-[700px]">
                <thead>
                  <tr className="bg-[#FAF6F0] sticky top-0 z-20 border-b border-coffee-light">
                    <th className="p-3.5 w-24 sm:w-52 font-black text-coffee-dark bg-[#FAF6F0] sticky left-0 z-30 border-r border-coffee-light/60">
                      Tên nguyên liệu
                    </th>
                    <th className="p-3.5 w-32 font-bold text-coffee-medium border-r border-coffee-light/60">
                      Tồn đầu ngày
                    </th>
                    <th className="p-3.5 w-32 font-bold text-green-700 border-r border-coffee-light/60">
                      SL nhập (+)
                    </th>
                    <th className="p-3.5 w-32 font-bold text-red-600 border-r border-coffee-light/60">
                      SL xuất (-)
                    </th>
                    <th className="p-3.5 w-40 font-black text-coffee-primary border-r border-coffee-light/60">
                      Tồn thực tế
                    </th>
                    <th className="p-3.5 w-32 font-bold text-coffee-dark text-center">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-light/50">
                  {filteredIngredients.map((ing) => {
                    const { openingStock, refilled, sold, closingStock } = getIngStats(ing.id, ing.stock_quantity);
                    const isLowStock = ing.min_stock !== null && closingStock <= Number(ing.min_stock);
                    const formattedStock = formatIngredientStock(closingStock, ing.unit, ing.quy_cach);
                    const formattedOpening = formatIngredientStock(openingStock, ing.unit, ing.quy_cach);

                    // Formatter for Refill and Sales values
                    const formatRefill = refilled > 0 ? formatIngredientRefill(refilled, ing.unit, ing.quy_cach) : '-';
                    const formatSold = sold > 0 ? `-${formatIngredientStock(sold, ing.unit, ing.quy_cach)}` : '-';

                    return (
                      <tr 
                        key={ing.id} 
                        className={`hover:bg-coffee-light/20 transition-all ${
                          isLowStock ? 'bg-red-50/20' : ''
                        }`}
                      >
                        {/* Sticky First Column */}
                        <td className={`p-3 font-bold text-coffee-dark sticky left-0 z-10 border-r border-coffee-light/60 border-b border-coffee-light/40 w-24 sm:w-52 whitespace-normal break-words ${
                          isLowStock ? 'bg-red-50/90' : 'bg-white'
                        }`}>
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
                        <td className="p-3 border-r border-coffee-light/60 font-black">
                          <div className="flex items-center space-x-1.5">
                            <span className={isLowStock ? 'text-red-600' : 'text-coffee-primary'}>
                              {formattedStock}
                            </span>
                            {isLowStock && (
                              <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.2 rounded uppercase scale-90 tracking-wider">
                                Sắp hết
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenStocktake(ing.id)}
                              className="px-2.5 py-1.5 bg-white hover:bg-[#FAF6F0] text-coffee-dark font-bold text-[10px] rounded-lg border border-coffee-light transition"
                              title="Kiểm kho"
                            >
                              Kiểm
                            </button>
                            <button
                              onClick={() => handleOpenRestock(ing.id)}
                              className="px-2.5 py-1.5 bg-coffee-primary/10 hover:bg-coffee-primary hover:text-white text-coffee-primary font-bold text-[10px] rounded-lg transition"
                              title="Nhập thêm"
                            >
                              Nhập
                            </button>
                          </div>
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

      {/* TAB 2: LỊCH SỬ NHẬP / KIỂM KHO */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-coffee-light p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-coffee-dark flex items-center space-x-2">
            <History className="w-5 h-5 text-coffee-primary" />
            <span>Lịch sử Nhập xuất & Kiểm kho</span>
          </h3>

          {/* Bộ lọc ngày */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#FAF6F0] rounded-2xl border border-coffee-light/60 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-coffee-medium uppercase">Từ ngày</label>
              <input
                type="date"
                value={logStartDate}
                onChange={(e) => setLogStartDate(e.target.value)}
                className="w-full bg-white px-3 py-2 rounded-xl border border-coffee-light focus:ring-1 focus:ring-coffee-primary font-bold text-coffee-dark"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-coffee-medium uppercase">Đến ngày</label>
              <input
                type="date"
                value={logEndDate}
                onChange={(e) => setLogEndDate(e.target.value)}
                className="w-full bg-white px-3 py-2 rounded-xl border border-coffee-light focus:ring-1 focus:ring-coffee-primary font-bold text-coffee-dark"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-coffee-medium/60 text-xs">
                Chưa có dữ liệu nhật ký kho trong khoảng thời gian đã chọn.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isApproved = log.status === 'Đã duyệt';
                const isRejected = log.status === 'Từ chối';

                return (
                  <div key={log.id} className="p-4 bg-[#FAF6F0] rounded-2xl border border-coffee-light space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          log.type === 'Nhập kho'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : log.type === 'Hao hụt/Cân lại'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.type}
                        </span>
                        <strong className="text-coffee-dark font-extrabold text-sm">{log.ingredient_name}</strong>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        isApproved
                          ? 'bg-green-100 text-green-800'
                          : isRejected
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-coffee-medium border-l-2 border-coffee-primary/30 pl-2">
                      <p>Số lượng thay đổi: <strong className="text-coffee-dark">{log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount} {log.ingredient_unit}</strong></p>
                      {log.cost > 0 && <p>Chi phí: <strong className="text-emerald-700">{log.cost.toLocaleString('vi-VN')}đ</strong></p>}
                      <p>Người thực hiện: <strong>{log.staff_name}</strong></p>
                      <p>Thời gian: <strong>{new Date(log.created_at).toLocaleString('vi-VN')}</strong></p>
                    </div>

                    {log.note && (
                      <p className="text-[10px] italic text-coffee-medium bg-white p-2 rounded-xl border border-coffee-light/60">
                        Ghi chú: "{log.note}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL NHẬP THÊM (RESTOCK) */}
      {isRestockOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-coffee-light space-y-5 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-coffee-light pb-4">
              <h3 className="font-extrabold text-lg text-coffee-dark flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-coffee-primary" />
                <span>Nhập Thêm Nguyên Liệu</span>
              </h3>
              <button
                onClick={() => setIsRestockOpen(false)}
                className="text-coffee-medium font-bold text-xs hover:text-coffee-dark p-1"
              >
                Đóng ✖
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              {/* Chọn nguyên liệu */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Chọn món cần nhập</label>
                <select
                  value={selectedIngId}
                  onChange={(e) => setSelectedIngId(e.target.value)}
                  className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Tồn hiện tại: {formatIngredientStock(ing.stock_quantity, ing.unit, ing.quy_cach)})
                    </option>
                  ))}
                  <option value="other">Khác... (Nước đá, v.v...)</option>
                </select>
              </div>

              {/* Nếu chọn Khác */}
              {selectedIngId === 'other' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-medium uppercase">Tên nguyên liệu khác</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nước đá, ly nắp cầu..."
                    value={customIngName}
                    onChange={(e) => setCustomIngName(e.target.value)}
                    className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block"
                    required
                  />
                  <p className="text-[10px] text-amber-700 italic">
                    * Các món "Khác" sẽ không cộng vào tồn kho mà chỉ ghi nhận chi phí vào báo cáo ca trực.
                  </p>
                </div>
              )}

              {/* Số lượng nhập (nếu món trong danh mục) */}
              {selectedIngId !== 'other' && (() => {
                const pkg = getIngredientPackageInfo(selectedRestockIngredient?.unit || '', selectedRestockIngredient?.quy_cach);
                return (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-coffee-medium uppercase flex justify-between items-center">
                      <span>Số lượng nhập thêm</span>
                      <span className="text-coffee-primary font-black bg-coffee-accent/25 px-2 py-0.5 rounded-lg text-[11px]">
                        Đơn vị nhập: {pkg.inputUnit}
                      </span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder={`Ví dụ: 5 (${pkg.inputUnit})`}
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block"
                      required
                    />
                    {pkg.multiplier > 1 && (
                      <p className="text-[11px] text-amber-900 font-extrabold bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                        💡 Bạn nhập {restockQty || 1} {pkg.inputUnit} → Hệ thống tự động quy đổi +{((Number(restockQty) || 1) * pkg.multiplier)}g vào kho.
                      </p>
                    )}
                  </div>
                );
              })()}



              {/* Ghi chú */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">
                  Ghi chú {selectedIngId === 'other' ? '(Bắt buộc)' : '(Không bắt buộc)'}
                </label>
                <input
                  type="text"
                  placeholder={selectedIngId === 'other' ? "Ví dụ: 2 bao nước đá..." : "Ví dụ: Mua lẻ siêu thị, vừa giao hàng..."}
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block"
                />
              </div>

              {/* Chi phí nhập kho */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Giá tiền nhập thêm (VNĐ)</label>
                <input
                  type="number"
                  placeholder="0 (Nếu không mất phí)"
                  value={restockCost}
                  onChange={(e) => setRestockCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-coffee-accent text-emerald-700 block"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRestock}
                className="w-full py-3.5 bg-coffee-primary hover:bg-coffee-dark text-white font-extrabold text-xs rounded-2xl transition shadow-md shadow-coffee-primary/20 flex items-center justify-center space-x-2"
              >
                {submittingRestock ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Xác Nhận Nhập Kho</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KIỂM KHO (STOCKTAKE) */}
      {isStocktakeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-coffee-light space-y-5 animate-scaleIn">
            <div className="flex justify-between items-center border-b border-coffee-light pb-4">
              <h3 className="font-extrabold text-lg text-coffee-dark flex items-center space-x-2">
                <ClipboardCheck className="w-5 h-5 text-coffee-primary" />
                <span>Kiểm Kho Thực Tế (Stocktake)</span>
              </h3>
              <button
                onClick={() => setIsStocktakeOpen(false)}
                className="text-coffee-medium font-bold text-xs hover:text-coffee-dark p-1"
              >
                Đóng ✖
              </button>
            </div>

            <form onSubmit={handleStocktakeSubmit} className="space-y-4">
              {/* Chọn món kiểm */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Chọn nguyên liệu kiểm kho</label>
                <select
                  value={stocktakeIngId}
                  onChange={(e) => {
                    setStocktakeIngId(e.target.value);
                    const selected = ingredients.find(i => i.id === e.target.value);
                    setActualStock(selected ? selected.stock_quantity : '');
                  }}
                  className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Tồn trên App: {formatIngredientStock(ing.stock_quantity, ing.unit, ing.quy_cach)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tồn hệ thống */}
              {selectedStocktakeIngredient && (
                <div className="p-3 bg-[#FAF6F0] rounded-2xl border border-coffee-light space-y-1 text-xs">
                  <p className="text-coffee-medium">Tồn trên ứng dụng hiện tại:</p>
                  <p className="font-extrabold text-sm text-coffee-primary">
                    {formatIngredientStock(selectedStocktakeIngredient.stock_quantity, selectedStocktakeIngredient.unit, selectedStocktakeIngredient.quy_cach)}
                  </p>
                </div>
              )}

              {/* Số lượng thực tế đếm được */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">
                  Số lượng đếm thực tế trong tủ ({selectedStocktakeIngredient?.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Nhập con số đếm thực tế..."
                  value={actualStock}
                  onChange={(e) => setActualStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block"
                  required
                />
              </div>

              {/* Hiển thị chênh lệch */}
              {selectedStocktakeIngredient && actualStock !== '' && (
                <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                  Number(actualStock) - selectedStocktakeIngredient.stock_quantity < 0
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : Number(actualStock) - selectedStocktakeIngredient.stock_quantity > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  <span>Chênh lệch:</span>
                  <span>
                    {Number(actualStock) - selectedStocktakeIngredient.stock_quantity > 0 ? '+' : ''}
                    {Number(actualStock) - selectedStocktakeIngredient.stock_quantity} {selectedStocktakeIngredient.unit}
                    {Number(actualStock) - selectedStocktakeIngredient.stock_quantity < 0 ? ' (Hao hụt / Báo hủy)' : ''}
                  </span>
                </div>
              )}

              {/* Ghi chú lý do */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Lý do chênh lệch (Bắt buộc)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kiểm kho cuối tuần, đổ vỡ nguyên liệu, hư hỏng..."
                  value={stocktakeNote}
                  onChange={(e) => setStocktakeNote(e.target.value)}
                  className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingStocktake}
                className="w-full py-3.5 bg-coffee-primary hover:bg-coffee-dark text-white font-extrabold text-xs rounded-2xl transition shadow-md shadow-coffee-primary/20 flex items-center justify-center space-x-2"
              >
                {submittingStocktake ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi Phê Duyệt Kiểm Kho</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
