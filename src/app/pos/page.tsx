'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import { 
  db, 
  getCurrentUser, 
  isSupabaseConfigured 
} from '@/lib/database';
import { toast } from '@/lib/toast';
import { 
  Coffee, 
  Users, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Search, 
  Tag, 
  CheckCircle, 
  ArrowLeft,
  Loader2,
  DollarSign,
  Printer,
  X,
  ArrowRightLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function PosPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [yesterdaySales, setYesterdaySales] = useState<{ [productId: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // Trạng thái giỏ hàng & Quy trình POS
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [posStep, setPosStep] = useState<'table' | 'menu' | 'summary'>('table');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Trạng thái đơn hàng đang hoạt động của bàn
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [loadingActiveOrder, setLoadingActiveOrder] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [isNative, setIsNative] = useState(false);

  // Trạng thái giảm giá
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    async function loadData() {
      // 1. Đọc dữ liệu từ cache trước để hiển thị ngay lập tức (Offline-first / Fast Load)
      let cachedTables = null;
      let cachedCategories = null;
      let cachedProducts = null;
      
      try {
        const storedTables = localStorage.getItem('ava_pos_cache_tables');
        const storedCategories = localStorage.getItem('ava_pos_cache_categories');
        const storedProducts = localStorage.getItem('ava_pos_cache_products');
        
        if (storedTables) cachedTables = JSON.parse(storedTables);
        if (storedCategories) cachedCategories = JSON.parse(storedCategories);
        if (storedProducts) cachedProducts = JSON.parse(storedProducts);
        
        if (cachedTables && cachedCategories && cachedProducts) {
          setTables(cachedTables);
          setCategories(cachedCategories);
          setProducts(cachedProducts);
          setLoading(false); // Hiển thị UI ngay lập tức
        }
      } catch (cacheErr) {
        console.warn('Lỗi đọc cache POS:', cacheErr);
      }

      try {
        const [tablesData, categoriesData, productsData, yestSalesData] = await Promise.all([
          db.getTables(),
          db.getCategories(),
          db.getProducts(),
          db.getYesterdayProductSales()
        ]);
        
        setTables(tablesData);
        setCategories(categoriesData);
        setProducts(productsData);
        setYesterdaySales(yestSalesData);
        
        // Lưu lại cache mới nhất
        try {
          localStorage.setItem('ava_pos_cache_tables', JSON.stringify(tablesData));
          localStorage.setItem('ava_pos_cache_categories', JSON.stringify(categoriesData));
          localStorage.setItem('ava_pos_cache_products', JSON.stringify(productsData));
        } catch (saveErr) {
          console.warn('Lỗi lưu cache POS:', saveErr);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu POS từ server:', error);
      } finally {
        setLoading(false);
        setCurrentUser(getCurrentUser());
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-coffee-primary animate-spin" />
        <p className="text-coffee-medium font-medium">Đang tải thông tin bàn & thực đơn...</p>
      </div>
    );
  }

  // --- LÓGIC CART ---
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      }];
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prev) => {
      return prev.map(item => {
        if (item.product_id === productId) {
          const newQty = Math.max(0, item.quantity + amount);
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.price
          };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setDiscountType('amount');
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalExistingAmount = existingItems.reduce((sum, item) => sum + item.subtotal, 0);
  const overallTotalAmount = totalCartAmount + totalExistingAmount;

  const discountAmount = discountType === 'amount'
    ? Math.min(overallTotalAmount, discountValue)
    : Math.min(overallTotalAmount, Math.round((overallTotalAmount * discountValue) / 100));

  const finalTotalAmount = Math.max(0, overallTotalAmount - discountAmount);

  // --- LÓGIC CONFIRM & SUBMIT ORDER ---
  const handleConfirmOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
    setSavingOrder(true);

    const oldTables = [...tables];
    
    // Optimistic Update: Cập nhật trạng thái bàn sang Đang phục vụ ngay lập tức trên UI
    if (selectedTable.id !== 'tb7') { // Khách mang về không đổi trạng thái
      setTables(prev => prev.map(tb => 
        tb.id === selectedTable.id ? { ...tb, status: 'Đang phục vụ' } : tb
      ));
    }

    try {
      const newOrder = await db.createOrder({
        table_id: selectedTable.id,
        staff_id: currentUser?.id || 'u1',
        total_amount: finalTotalAmount,
        discount: discountAmount,
        items: cart
      });

      // Tạo hiệu ứng confetti ăn mừng
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(`Đặt món thành công cho ${selectedTable.table_name}!`);
      clearCart();
      
      // Reload bàn chính thức
      const updatedTables = await db.getTables();
      setTables(updatedTables);

      setSelectedTable(null);
      setPosStep('table');
    } catch (e) {
      console.error('Lỗi lưu đơn hàng:', e);
      // Rollback trạng thái bàn nếu lỗi
      setTables(oldTables);
      toast.error('Không thể lưu đơn hàng. Vui lòng thử lại!');
    } finally {
      setSavingOrder(false);
    }
  };

  // --- LÓGIC CHỌN BÀN & TẢI ĐƠN HÀNG ĐANG HOẠT ĐỘNG ---
  const handleSelectTable = async (table: any) => {
    setSelectedTable(table);
    setPosStep('menu');
    setCart([]);
    setActiveOrder(null);
    setExistingItems([]);
    setDiscountValue(0);
    setDiscountType('amount');

    if (table.status === 'Đang phục vụ') {
      setLoadingActiveOrder(true);
      try {
        const allOrders = await db.getOrders();
        const unpaidOrder = allOrders.find(o => o.table_id === table.id && o.payment_status === 'Chưa thanh toán');
        if (unpaidOrder) {
          setActiveOrder(unpaidOrder);
          const items = await db.getOrderItems(unpaidOrder.id);
          setExistingItems(items.map(item => ({
            id: item.id,
            product_id: item.idsp,
            name: item.ten_san_pham || item.products?.name || 'Sản phẩm',
            price: item.unit_price || item.don_gia || item.products?.price || 0,
            quantity: item.so_luong,
            subtotal: item.thanh_tien
          })));
          setDiscountValue(Number(unpaidOrder.discount || 0));
          setDiscountType('amount');
        }
      } catch (err) {
        console.error('Lỗi tải hóa đơn hiện tại của bàn:', err);
        toast.error('Không thể tải hóa đơn hiện tại.');
      } finally {
        setLoadingActiveOrder(false);
      }
    }
  };

  // --- LÓGIC THANH TOÁN TRỰC TIẾP TỪ POS ---
  const handlePayDirect = async (method: 'Tiền mặt' | 'Chuyển khoản') => {
    if (!activeOrder) return;
    setSubmittingPayment(true);
    try {
      await db.payOrder(activeOrder.id, method);
      
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#4A3525', '#FFE4C4', '#FFFDD0', '#8C6A5C']
      });

      setIsPayModalOpen(false);
      toast.success(`Thanh toán thành công qua phương thức: ${method}`);
      
      clearCart();
      setActiveOrder(null);
      setExistingItems([]);
      
      const updatedTables = await db.getTables();
      setTables(updatedTables);
      
      setSelectedTable(null);
      setPosStep('table');
    } catch (e) {
      console.error('Lỗi thanh toán:', e);
      toast.error('Gặp lỗi khi xử lý thanh toán.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // --- LÓGIC HỦY ĐƠN TRỰC TIẾP TỪ POS ---
  const handleCancelDirect = async () => {
    if (!activeOrder) return;
    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy và xóa hoàn toàn hóa đơn này không?");
    if (!confirmCancel) return;

    setSavingOrder(true);
    try {
      const success = await db.cancelOrder(activeOrder.id);
      if (success) {
        toast.success("Đã hủy và xóa hóa đơn thành công!");
        clearCart();
        setActiveOrder(null);
        setExistingItems([]);
        
        const updatedTables = await db.getTables();
        setTables(updatedTables);
        
        setSelectedTable(null);
        setPosStep('table');
      } else {
        toast.error("Không thể hủy hóa đơn này.");
      }
    } catch (e) {
      console.error("Lỗi khi hủy hóa đơn:", e);
      toast.error("Gặp lỗi khi hủy hóa đơn.");
    } finally {
      setSavingOrder(false);
    }
  };

  // --- LÓGIC IN HÓA ĐƠN TRỰC TIẾP TỪ POS ---
  const handlePrintDirect = async () => {
    if (!activeOrder) return;
    try {
      const { printOrderDirect } = await import('@/lib/printerService');
      
      const itemsForPrint = existingItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));

      await printOrderDirect({
        tableName: selectedTable?.table_name || 'Bàn không xác định',
        staffName: activeOrder.users?.full_name || currentUser?.full_name || 'Nhân viên',
        items: itemsForPrint,
        discount: activeOrder.discount || 0,
        totalAmount: activeOrder.total_amount,
        orderId: activeOrder.id
      });
      toast.success('Đã gửi lệnh in tới máy in!');
    } catch (e) {
      console.error('Lỗi khi in hóa đơn:', e);
      toast.error('Lỗi in bill: Không thể kết nối tới máy in (192.168.1.232:9100)');
    }
  };

  // --- LÓGIC XÁC NHẬN VÀ MỞ modal THANH TOÁN ---
  const handleConfirmAndPay = async () => {
    if (!selectedTable) return;
    
    // Nếu có món mới trong giỏ hàng, lưu vào đơn hàng trước
    if (cart.length > 0) {
      setSavingOrder(true);
      try {
        const diffAmount = finalTotalAmount - totalExistingAmount;
        const diffDiscount = discountAmount - (activeOrder?.discount || 0);

        await db.createOrder({
          table_id: selectedTable.id,
          staff_id: currentUser?.id || 'u1',
          total_amount: diffAmount,
          discount: diffDiscount,
          items: cart
        });
        
        // Tải lại thông tin đơn hàng mới cập nhật
        const allOrders = await db.getOrders();
        const unpaidOrder = allOrders.find(o => o.table_id === selectedTable.id && o.payment_status === 'Chưa thanh toán');
        if (unpaidOrder) {
          setActiveOrder(unpaidOrder);
          const items = await db.getOrderItems(unpaidOrder.id);
          setExistingItems(items.map(item => ({
            id: item.id,
            product_id: item.idsp,
            name: item.ten_san_pham || item.products?.name || 'Sản phẩm',
            price: item.unit_price || item.don_gia || item.products?.price || 0,
            quantity: item.so_luong,
            subtotal: item.thanh_tien
          })));
          setDiscountValue(Number(unpaidOrder.discount || 0));
          setDiscountType('amount');
        }
        
        clearCart();
        toast.success("Đã cập nhật món vào đơn hàng thành công!");
      } catch (err) {
        console.error("Lỗi cập nhật trước khi thanh toán:", err);
        toast.error("Không thể cập nhật đơn hàng.");
        setSavingOrder(false);
        return;
      } finally {
        setSavingOrder(false);
      }
    }
    
    // Mở modal thanh toán nhanh
    setIsPayModalOpen(true);
  };

  // --- RENDERS ---

  // Lọc và sắp xếp sản phẩm (Ưu tiên bán chạy hôm qua -> Thứ tự nhóm món -> Tên món)
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategoryId === 'all' || product.category_id === selectedCategoryId;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // 1. Ưu tiên 1: Số lượng bán ra ngày hôm qua (giảm dần)
      const salesA = yesterdaySales[a.id] || 0;
      const salesB = yesterdaySales[b.id] || 0;
      if (salesB !== salesA) {
        return salesB - salesA;
      }

      // 2. Ưu tiên 2: Thứ tự nhóm món (Cà phê -> Trà -> Yaourt -> Khác -> Soda -> Nước ngọt -> Món ăn)
      const categorySortOrder: { [key: string]: number } = {
        'c_caphe': 1,
        'c_tra': 2,
        'c_yaourt': 3,
        'c_douongkhac': 4,
        'c_soda': 5,
        'c_nuocngot': 6,
        'c_monan': 7
      };
      const orderA = categorySortOrder[a.category_id] || 99;
      const orderB = categorySortOrder[b.category_id] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 3. Ưu tiên 3: Tên món theo bảng chữ cái tiếng Việt
      return a.name.localeCompare(b.name, 'vi');
    });

  return (
    <div className="w-full space-y-6">
      {/* Nút Quay về Trang chủ */}
      {!selectedTable && (
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-coffee-light text-coffee-primary rounded-xl text-xs font-bold hover:bg-coffee-light transition shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Trang chủ</span>
        </Link>
      )}

      {/* TÊN BÀN ĐANG ĐƯỢC CHỌN (BREADCRUMB) */}
      {selectedTable && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-coffee-light">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                if (posStep === 'menu') {
                  setSelectedTable(null);
                  setPosStep('table');
                } else if (posStep === 'summary') {
                  setPosStep('menu');
                }
              }}
              className="p-2 hover:bg-coffee-light rounded-xl text-coffee-medium transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-semibold text-coffee-medium uppercase tracking-wider">Đang phục vụ</span>
              <h2 className="font-extrabold text-xl text-coffee-primary leading-tight">{selectedTable.table_name}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-coffee-medium">Giỏ hàng</p>
              <p className="font-bold text-coffee-dark">{cart.length} món - {totalCartAmount.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="p-3 bg-coffee-accent rounded-xl text-coffee-dark relative">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: CHỌN BÀN */}
      {posStep === 'table' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-light space-y-4">
            <h3 className="font-bold text-lg text-coffee-primary flex items-center space-x-2">
              <Users className="w-5 h-5 text-coffee-medium" />
              <span>Bước 1: Chọn Bàn / Hình thức bán hàng</span>
            </h3>
            <p className="text-xs text-coffee-medium">
              Vui lòng chọn bàn trống để mở thực đơn, hoặc chọn bàn có trạng thái <strong>Đang phục vụ</strong> để chỉnh sửa/thêm món mới.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...tables]
              .sort((a, b) => {
                if (a.table_name === 'Khách mang về') return -1;
                if (b.table_name === 'Khách mang về') return 1;
                return 0;
              })
              .map((table) => {
              const isOccupied = table.status === 'Đang phục vụ';
              return (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={`relative p-5 rounded-3xl border text-left flex flex-col justify-between h-40 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                    isOccupied
                      ? 'bg-amber-50/50 border-amber-300 shadow-inner'
                      : 'bg-white border-coffee-light hover:border-coffee-accent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isOccupied 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {table.status}
                    </span>
                    <span className="text-[10px] text-coffee-medium flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity}</span>
                    </span>
                  </div>

                  <div className="space-y-1 mt-4">
                    <h4 className="font-extrabold text-lg text-coffee-dark tracking-tight">{table.table_name}</h4>
                    <p className="text-xs text-coffee-medium">
                      {isOccupied ? 'Bấm để thêm món/chỉnh sửa' : 'Bàn trống - Bán mới'}
                    </p>
                  </div>

                  <div className="absolute bottom-4 right-4 text-coffee-medium/40">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: CHỌN MÓN (MENU & CART PREVIEW) */}
      {posStep === 'menu' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Menu bên trái (2/3 chiều rộng) */}
          <div className="lg:col-span-2 space-y-6 pb-28 lg:pb-0">
            {/* Thanh Tìm Kiếm & Danh Mục */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-light space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-coffee-medium absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm trong thực đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAF6F0] pl-12 pr-4 py-3 rounded-2xl text-sm border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark placeholder-coffee-medium"
                />
              </div>

              {/* Lọc danh mục */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedCategoryId === 'all'
                      ? 'bg-coffee-primary text-white shadow'
                      : 'bg-[#FAF6F0] text-coffee-medium hover:bg-coffee-light'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      selectedCategoryId === cat.id
                        ? 'bg-coffee-primary text-white shadow'
                        : 'bg-[#FAF6F0] text-coffee-medium hover:bg-coffee-light'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách món ăn */}
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.status === 'Hết hàng';
                const cartQty = cart.find(item => item.product_id === prod.id)?.quantity || 0;
                
                return (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-3xl overflow-hidden border border-coffee-light flex flex-col shadow-sm transition-all duration-300 relative ${
                      isOutOfStock ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-md'
                    }`}
                  >
                    {/* Hình ảnh */}
                    <div className="relative h-28 sm:h-44 bg-coffee-light overflow-hidden">
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
                          <Coffee className="w-8 h-8 sm:w-12 sm:h-12" />
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                          Tạm hết hàng
                        </div>
                      )}
                      
                      {/* Thẻ hiển thị số lượng đã chọn trong giỏ */}
                      {cartQty > 0 && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-coffee-accent text-coffee-dark font-extrabold text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg border border-white">
                          {cartQty}
                        </div>
                      )}
                    </div>

                    {/* Chi tiết sản phẩm */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-black text-coffee-dark text-sm sm:text-base md:text-lg leading-tight line-clamp-2">{prod.name}</h4>
                        <p className="text-[10px] sm:text-xs text-coffee-medium mt-1 flex items-center">
                          <Tag className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{categories.find(c => c.id === prod.category_id)?.name}</span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-0 pt-1 sm:pt-2">
                        <span className="font-extrabold text-xs sm:text-base text-coffee-primary">
                          {prod.price.toLocaleString('vi-VN')}đ
                        </span>

                        {isOutOfStock ? (
                          <span className="text-[9px] text-red-500 font-semibold uppercase">Hết hàng</span>
                        ) : cartQty > 0 ? (
                          <div className="flex items-center justify-between sm:justify-start bg-[#FAF6F0] rounded-xl border border-coffee-accent/40 overflow-hidden shadow-inner w-full sm:w-auto">
                            <button
                              onClick={() => updateQuantity(prod.id, -1)}
                              className="p-1.5 sm:p-2 hover:bg-coffee-accent/20 text-coffee-primary transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1.5 sm:px-2.5 font-bold text-[10px] sm:text-xs text-coffee-dark min-w-[16px] text-center">
                              {cartQty}
                            </span>
                            <button
                              onClick={() => addToCart(prod)}
                              className="p-1.5 sm:p-2 hover:bg-coffee-accent/20 text-coffee-primary transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(prod)}
                            className="w-full sm:w-auto text-center px-2 py-1.5 sm:px-3.5 bg-coffee-accent hover:bg-coffee-accent/80 text-coffee-dark font-bold text-[10px] sm:text-xs rounded-xl shadow-sm transition"
                          >
                            Thêm
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-coffee-medium space-y-2">
                  <Coffee className="w-12 h-12 mx-auto opacity-40 animate-pulse" />
                  <p className="font-semibold">Không tìm thấy món ăn nào phù hợp</p>
                  <p className="text-xs">Thử tìm kiếm với từ khóa khác hoặc lọc danh mục khác</p>
                </div>
              )}
            </div>
          </div>

          {/* Hóa đơn nháp / Cart xem trước bên phải (1/3 chiều rộng) */}
          <div className="hidden lg:flex bg-white rounded-3xl p-6 shadow-sm border border-coffee-light flex flex-col min-h-[500px]">
            <h3 className="font-bold text-lg text-coffee-dark border-b border-coffee-light pb-4 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-coffee-medium" />
                <span>Đơn món - {selectedTable.table_name}</span>
              </span>
              {activeOrder && (
                <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold uppercase tracking-wider">
                  Đang phục vụ
                </span>
              )}
            </h3>

            {/* Danh sách giỏ hàng */}
            <div className="flex-1 overflow-y-auto max-h-[350px] py-4 space-y-4">
              {/* PHẦN 1: MÓN ĐÃ GỌI (Đang phục vụ) */}
              {existingItems.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 uppercase tracking-wider">
                    <span>Món đã phục vụ</span>
                    <span>{existingItems.reduce((sum, item) => sum + item.quantity, 0)} ly</span>
                  </div>
                  <div className="space-y-2 border-l-2 border-amber-200 pl-3">
                    {existingItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs pb-1">
                        <div className="space-y-0.5 flex-1 pr-3">
                          <p className="font-bold text-coffee-dark/80">{item.name}</p>
                          <p className="text-[10px] text-coffee-medium">{item.price.toLocaleString('vi-VN')}đ x {item.quantity}</p>
                        </div>
                        <span className="font-extrabold text-coffee-dark">
                          {item.subtotal.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PHẦN 2: MÓN MỚI CHỌN */}
              {cart.length > 0 && (
                <div className="space-y-2.5">
                  {existingItems.length > 0 && (
                    <div className="text-[10px] font-black text-coffee-primary bg-coffee-accent/20 px-2.5 py-1 rounded-lg border border-coffee-primary/10 uppercase tracking-wider">
                      Món mới chọn thêm
                    </div>
                  )}
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between text-xs pb-3 border-b border-dashed border-coffee-light/60">
                      <div className="space-y-1 flex-1 pr-3">
                        <p className="font-bold text-coffee-dark">{item.name}</p>
                        <p className="text-coffee-medium">{item.price.toLocaleString('vi-VN')}đ / món</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Bộ đếm nhanh */}
                        <div className="flex items-center bg-[#FAF6F0] rounded-lg border border-coffee-light overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="p-1 hover:bg-coffee-accent/20 text-coffee-primary transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold text-coffee-dark min-w-[15px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="p-1 hover:bg-coffee-accent/20 text-coffee-primary transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-extrabold text-coffee-dark w-16 text-right">
                          {item.subtotal.toLocaleString('vi-VN')}đ
                        </span>
                        
                        <button 
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:text-red-700 p-1 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length === 0 && existingItems.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center text-coffee-medium/60 space-y-3">
                  <ShoppingCart className="w-12 h-12 opacity-35" />
                  <p className="font-semibold text-sm">Chưa chọn món nào</p>
                  <p className="text-xs">Bấm 'Thêm' sản phẩm bên trái để bắt đầu lập đơn hàng</p>
                </div>
              )}
            </div>

            {/* Phần dưới hóa đơn nháp */}
            {(cart.length > 0 || existingItems.length > 0) && (
              <div className="border-t border-coffee-light pt-4 space-y-4">
                {/* Phần giảm giá */}
                <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-coffee-light space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-coffee-medium uppercase tracking-wider">Giảm giá</span>
                    <div className="flex bg-white rounded-lg p-0.5 border border-coffee-light">
                      <button
                        type="button"
                        onClick={() => { setDiscountType('amount'); setDiscountValue(0); }}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all ${
                          discountType === 'amount' ? 'bg-coffee-primary text-white shadow-sm' : 'text-coffee-medium hover:text-coffee-dark'
                        }`}
                      >
                        Số tiền (đ)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDiscountType('percent'); setDiscountValue(0); }}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all ${
                          discountType === 'percent' ? 'bg-coffee-primary text-white shadow-sm' : 'text-coffee-medium hover:text-coffee-dark'
                        }`}
                      >
                        Phần trăm (%)
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percent' ? 100 : undefined}
                      placeholder={discountType === 'amount' ? "Số tiền giảm..." : "Phần trăm giảm..."}
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                      className="flex-1 h-9 px-3 bg-white border border-coffee-light rounded-xl text-xs focus:ring-1 focus:ring-coffee-primary text-coffee-dark outline-none transition"
                    />
                    {discountValue > 0 && (
                      <button
                        type="button"
                        onClick={() => setDiscountValue(0)}
                        className="h-9 px-3 bg-white border border-red-200 text-red-500 rounded-xl text-xs hover:bg-red-50 transition font-bold"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-coffee-medium">
                  <span>Tổng tiền món:</span>
                  <span>{overallTotalAmount.toLocaleString('vi-VN')}đ</span>
                </div>

                {discountAmount > 0 && (
                   <div className="flex justify-between items-center text-xs text-red-600">
                     <span>Giảm giá:</span>
                     <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                   </div>
                )}

                <div className="flex justify-between items-center border-t border-coffee-light/50 pt-3">
                  <span className="text-sm text-coffee-dark font-extrabold">Tổng thanh toán:</span>
                  <span className="text-xl font-black text-coffee-primary">
                    {finalTotalAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {activeOrder ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-3.5">
                      <button
                        onClick={handleCancelDirect}
                        className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-1 border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hủy đơn</span>
                      </button>
                      
                      {isNative ? (
                        <button
                          onClick={handlePrintDirect}
                          className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>In hóa đơn</span>
                        </button>
                      ) : (
                        <button
                          onClick={clearCart}
                          disabled={cart.length === 0}
                          className={`py-2.5 font-extrabold text-xs rounded-xl transition border ${
                            cart.length === 0 
                              ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-coffee-light/50 text-coffee-primary border-coffee-light hover:bg-coffee-light'
                          }`}
                        >
                          Hủy món mới
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      <button
                        onClick={handleConfirmOrder}
                        disabled={cart.length === 0 || savingOrder}
                        className={`py-3 font-extrabold text-xs rounded-xl transition shadow-sm ${
                          cart.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-amber-700 hover:bg-amber-800 text-white shadow shadow-amber-800/10'
                        }`}
                      >
                        {savingOrder ? 'Đang lưu...' : 'Cập nhật đơn'}
                      </button>
                      
                      <button
                        onClick={handleConfirmAndPay}
                        className="py-3 bg-coffee-primary hover:bg-coffee-dark text-white font-extrabold text-xs rounded-xl transition shadow shadow-coffee-primary/20 flex items-center justify-center space-x-1.5"
                      >
                        <DollarSign className="w-4 h-4 text-coffee-accent animate-pulse" />
                        <span>{cart.length > 0 ? 'Lưu & Thanh toán' : 'Thanh toán'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={clearCart}
                      className="py-3 bg-[#FAF6F0] hover:bg-coffee-accent/30 text-coffee-medium font-bold text-xs rounded-2xl transition shadow-sm"
                    >
                      Hủy tất cả
                    </button>
                    <button
                      onClick={handleConfirmOrder}
                      disabled={cart.length === 0 || savingOrder}
                      className={`py-3 font-bold text-xs rounded-2xl transition shadow ${
                        cart.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-coffee-primary hover:bg-coffee-dark text-white shadow-coffee-primary/20'
                      }`}
                    >
                      {savingOrder ? 'Đang lưu...' : 'Xác nhận đơn'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-light px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
            <div>
              <span className="text-[10px] text-coffee-medium block">Đơn hàng - {selectedTable.table_name}</span>
              <span className="font-extrabold text-sm text-coffee-primary">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} món | {totalCartAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <button 
              onClick={() => setIsMobileCartOpen(true)}
              className="px-5 py-2.5 bg-coffee-primary hover:bg-coffee-dark text-white font-extrabold text-xs rounded-xl shadow transition animate-pulse"
            >
              Xem giỏ hàng
            </button>
          </div>
        )}

        {/* MOBILE BOTTOM CART DRAWER OVERLAY */}
        {isMobileCartOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileCartOpen(false)} />
            <div 
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] max-h-[85vh] flex flex-col shadow-2xl p-6 pt-5 z-50 transition-all duration-300"
              style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="w-12 h-1.5 bg-coffee-light rounded-full mx-auto mb-5 shrink-0" onClick={() => setIsMobileCartOpen(false)} />
              
              <h3 className="font-bold text-base text-coffee-dark border-b border-coffee-light pb-3 flex items-center justify-between shrink-0">
                <span className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-coffee-medium" />
                  <span>Đơn món - {selectedTable.table_name}</span>
                </span>
                <button 
                  onClick={() => setIsMobileCartOpen(false)} 
                  className="text-xs text-coffee-medium font-bold hover:text-coffee-primary px-2 py-1"
                >
                  Đóng
                </button>
              </h3>

              <div className="flex-1 overflow-y-auto py-3 space-y-3 my-2">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between text-xs pb-2.5 border-b border-dashed border-coffee-light/60">
                    <div className="space-y-0.5 flex-1 pr-3">
                      <p className="font-bold text-coffee-dark">{item.name}</p>
                      <p className="text-[10px] text-coffee-medium">{item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center bg-[#FAF6F0] rounded-lg border border-coffee-light overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product_id, -1)}
                          className="p-1 hover:bg-coffee-accent/20 text-coffee-primary transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-coffee-dark min-w-[15px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, 1)}
                          className="p-1 hover:bg-coffee-accent/20 text-coffee-primary transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-extrabold text-coffee-dark w-16 text-right">
                        {(item.quantity * item.price).toLocaleString('vi-VN')}đ
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-coffee-light pt-3 space-y-3 bg-white shrink-0">
                {/* Phần giảm giá di động */}
                <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-coffee-light space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-coffee-medium uppercase tracking-wider">Giảm giá</span>
                    <div className="flex bg-white rounded-lg p-0.5 border border-coffee-light">
                      <button
                        type="button"
                        onClick={() => { setDiscountType('amount'); setDiscountValue(0); }}
                        className={`px-2 py-0.5 rounded-md text-[8px] font-bold transition-all ${
                          discountType === 'amount' ? 'bg-coffee-primary text-white shadow-sm' : 'text-coffee-medium hover:text-coffee-dark'
                        }`}
                      >
                        Tiền (đ)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDiscountType('percent'); setDiscountValue(0); }}
                        className={`px-2 py-0.5 rounded-md text-[8px] font-bold transition-all ${
                          discountType === 'percent' ? 'bg-coffee-primary text-white shadow-sm' : 'text-coffee-medium hover:text-coffee-dark'
                        }`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percent' ? 100 : undefined}
                      placeholder={discountType === 'amount' ? "Số tiền giảm..." : "Phần trăm giảm..."}
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                      className="flex-1 h-8 px-2.5 bg-white border border-coffee-light rounded-lg text-xs focus:ring-1 focus:ring-coffee-primary text-coffee-dark outline-none transition"
                    />
                    {discountValue > 0 && (
                      <button
                        type="button"
                        onClick={() => setDiscountValue(0)}
                        className="h-8 px-2 bg-white border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition font-bold"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-coffee-medium">
                  <span>Tiền món:</span>
                  <span>{overallTotalAmount.toLocaleString('vi-VN')}đ</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-xs text-red-600">
                    <span>Giảm giá:</span>
                    <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-coffee-light/50 pt-2">
                  <span className="text-xs text-coffee-medium font-semibold">Tổng thanh toán:</span>
                  <span className="text-lg font-extrabold text-coffee-primary">
                    {finalTotalAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {activeOrder ? (
                  <div className="space-y-2 pb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={async () => {
                          setIsMobileCartOpen(false);
                          await handleCancelDirect();
                        }}
                        className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition border border-red-200"
                      >
                        Hủy đơn
                      </button>
                      <button
                        onClick={async () => {
                          setIsMobileCartOpen(false);
                          await handleConfirmAndPay();
                        }}
                        className="py-2.5 bg-coffee-primary hover:bg-coffee-dark text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center space-x-1"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-coffee-accent animate-pulse" />
                        <span>Thanh toán</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={async () => {
                        setIsMobileCartOpen(false);
                        await handleConfirmOrder();
                      }}
                      disabled={cart.length === 0 || savingOrder}
                      className={`w-full py-2.5 font-bold text-xs rounded-xl transition ${
                        cart.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-amber-700 hover:bg-amber-800 text-white'
                      }`}
                    >
                      {savingOrder ? 'Đang lưu...' : 'Cập nhật đơn'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <button
                      onClick={() => {
                        clearCart();
                        setIsMobileCartOpen(false);
                      }}
                      className="py-2.5 bg-[#FAF6F0] hover:bg-coffee-accent/30 text-coffee-medium font-bold text-xs rounded-xl transition"
                    >
                      Hủy tất cả
                    </button>
                    <button
                      onClick={async () => {
                        setIsMobileCartOpen(false);
                        await handleConfirmOrder();
                      }}
                      disabled={cart.length === 0 || savingOrder}
                      className={`py-2.5 font-bold text-xs rounded-xl transition shadow ${
                        cart.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-coffee-primary hover:bg-coffee-dark text-white'
                      }`}
                    >
                      Xác nhận đơn
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* STEP 3: XÁC NHẬN HÓA ĐƠN (ORDER SUMMARY) */}
      {posStep === 'summary' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-md border border-coffee-light space-y-6">
          <div className="text-center space-y-2 border-b border-coffee-light pb-6">
            <h3 className="font-black text-2xl text-coffee-dark">Xác nhận Đơn Món</h3>
            <p className="text-sm text-coffee-medium">Vui lòng kiểm tra lại thực đơn trước khi xác nhận đặt món</p>
          </div>

          {/* Chi tiết đơn */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-coffee-medium font-medium">Bàn phục vụ:</span>
              <strong className="text-coffee-dark font-extrabold">{selectedTable.table_name}</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-coffee-medium font-medium">Nhân viên ghi đơn:</span>
              <strong className="text-coffee-dark font-semibold">{currentUser?.full_name} ({currentUser?.role})</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-coffee-medium font-medium">Trạng thái lưu:</span>
              <strong className="text-coffee-dark font-semibold">Chưa thanh toán (Bàn sẽ chuyển sang Đang phục vụ)</strong>
            </div>
          </div>

          {/* Chi tiết món */}
          <div className="border-t border-b border-dashed border-coffee-light py-4 space-y-3">
            {cart.map((item) => (
              <div key={item.product_id} className="flex justify-between text-xs">
                <span className="text-coffee-dark font-medium">
                  {item.name} <span className="text-coffee-medium font-bold">x {item.quantity}</span>
                </span>
                <strong className="text-coffee-dark">{item.subtotal.toLocaleString('vi-VN')}đ</strong>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-bold text-coffee-dark">Tổng thanh toán:</span>
            <span className="text-2xl font-black text-coffee-primary">
              {totalCartAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Nút hành động */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => setPosStep('menu')}
              disabled={savingOrder}
              className="py-3.5 bg-coffee-light hover:bg-coffee-accent text-coffee-primary font-bold text-sm rounded-2xl transition"
            >
              Quay lại chỉnh sửa
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={savingOrder}
              className="py-3.5 bg-coffee-primary hover:bg-coffee-dark text-white font-bold text-sm rounded-2xl transition shadow shadow-coffee-primary/20 flex items-center justify-center space-x-2"
            >
              {savingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Gửi Nhà Bếp / Xác Nhận</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* POPUP CHỌN PHƯƠNG THỨC THANH TOÁN TRỰC TIẾP */}
      {isPayModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-6 border border-coffee-accent/40">
            <div className="flex items-center justify-between border-b border-coffee-light pb-4">
              <h3 className="font-extrabold text-lg text-coffee-dark">Xác nhận thanh toán</h3>
              <button 
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 hover:bg-coffee-light rounded-lg text-coffee-medium"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-coffee-medium">
                Bạn đang thực hiện thanh toán cho bàn: <strong>{selectedTable?.table_name}</strong>
              </p>
              <div className="flex justify-between items-center bg-[#FAF6F0] p-4 rounded-2xl border border-coffee-light">
                <span className="text-sm font-semibold text-coffee-dark">Tổng tiền cần thu:</span>
                <span className="text-xl font-black text-coffee-primary">
                  {activeOrder.total_amount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-coffee-medium uppercase tracking-wider">Chọn phương thức thanh toán</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePayDirect('Tiền mặt')}
                  disabled={submittingPayment}
                  className="p-5 bg-coffee-cream/40 border border-coffee-accent hover:bg-coffee-accent/50 rounded-2xl flex flex-col items-center justify-center space-y-2 transition font-bold text-coffee-dark shadow-sm text-sm"
                >
                  <DollarSign className="w-8 h-8 text-coffee-primary" />
                  <span>Tiền mặt</span>
                </button>
                <button
                  onClick={() => handlePayDirect('Chuyển khoản')}
                  disabled={submittingPayment}
                  className="p-5 bg-coffee-cream/40 border border-coffee-accent hover:bg-coffee-accent/50 rounded-2xl flex flex-col items-center justify-center space-y-2 transition font-bold text-coffee-dark shadow-sm text-sm"
                >
                  <ArrowRightLeft className="w-8 h-8 text-coffee-primary" />
                  <span>Chuyển khoản</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-coffee-medium/70">
              Nhân viên thực hiện: {currentUser?.full_name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
