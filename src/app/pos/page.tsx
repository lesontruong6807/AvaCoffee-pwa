'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2
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

  useEffect(() => {
    async function loadData() {
      try {
        const [tablesData, categoriesData, productsData] = await Promise.all([
          db.getTables(),
          db.getCategories(),
          db.getProducts()
        ]);
        setTables(tablesData);
        setCategories(categoriesData);
        setProducts(productsData);
        setCurrentUser(getCurrentUser());
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu POS:', error);
      } finally {
        setLoading(false);
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

  const clearCart = () => setCart([]);

  const totalCartAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // --- LÓGIC CONFIRM & SUBMIT ORDER ---
  const handleConfirmOrder = async () => {
    if (!selectedTable || cart.length === 0) return;
    setSavingOrder(true);

    try {
      await db.createOrder({
        table_id: selectedTable.id,
        staff_id: currentUser?.id || 'u1',
        total_amount: totalCartAmount,
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
      
      // Reload bàn
      const updatedTables = await db.getTables();
      setTables(updatedTables);

      setSelectedTable(null);
      setPosStep('table');
    } catch (e) {
      console.error('Lỗi lưu đơn hàng:', e);
      toast.error('Không thể lưu đơn hàng. Vui lòng thử lại!');
    } finally {
      setSavingOrder(false);
    }
  };

  // --- RENDERS ---

  // Lọc sản phẩm
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryId === 'all' || product.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full space-y-6">

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
            {tables.map((table) => {
              const isOccupied = table.status === 'Đang phục vụ';
              return (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table);
                    setPosStep('menu');
                    setCart([]); // Xóa giỏ tạm khi chọn bàn mới
                  }}
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
          <div className="lg:col-span-2 space-y-6">
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
                        <h4 className="font-bold text-coffee-dark text-xs sm:text-sm leading-tight line-clamp-2">{prod.name}</h4>
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
            <h3 className="font-bold text-lg text-coffee-dark border-b border-coffee-light pb-4 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-coffee-medium" />
              <span>Đơn món - {selectedTable.table_name}</span>
            </h3>

            {/* Danh sách giỏ hàng */}
            <div className="flex-1 overflow-y-auto max-h-[350px] py-4 space-y-4">
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

              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center text-coffee-medium/60 space-y-3">
                  <ShoppingCart className="w-12 h-12 opacity-35" />
                  <p className="font-semibold text-sm">Chưa chọn món nào</p>
                  <p className="text-xs">Bấm 'Thêm' sản phẩm bên trái để bắt đầu lập đơn hàng</p>
                </div>
              )}
            </div>

            {/* Phần dưới hóa đơn nháp */}
            {cart.length > 0 && (
              <div className="border-t border-coffee-light pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-coffee-medium font-semibold">Tổng cộng:</span>
                  <span className="text-xl font-extrabold text-coffee-primary">
                    {totalCartAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={clearCart}
                    className="py-3 bg-[#FAF6F0] hover:bg-coffee-accent/30 text-coffee-medium font-bold text-xs rounded-2xl transition shadow-sm"
                  >
                    Hủy tất cả
                  </button>
                  <button
                    onClick={() => setPosStep('summary')}
                    className="py-3 bg-coffee-primary hover:bg-coffee-dark text-white font-bold text-xs rounded-2xl transition shadow shadow-coffee-primary/20"
                  >
                    Xem Hóa Đơn
                  </button>
                </div>
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
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
            <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileCartOpen(false)} />
            <div className="relative bg-white w-full rounded-t-[32px] max-h-[80vh] flex flex-col shadow-2xl p-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] z-50 transition-all duration-300">
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
                <div className="flex justify-between items-center">
                  <span className="text-xs text-coffee-medium font-semibold">Tổng thanh toán:</span>
                  <span className="text-lg font-extrabold text-coffee-primary">
                    {totalCartAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>

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
                    onClick={() => {
                      setPosStep('summary');
                      setIsMobileCartOpen(false);
                    }}
                    className="py-2.5 bg-coffee-primary hover:bg-coffee-dark text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Xác nhận đơn
                  </button>
                </div>
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
    </div>
  );
}
