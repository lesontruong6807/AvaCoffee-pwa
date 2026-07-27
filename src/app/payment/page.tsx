'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { toast } from '@/lib/toast';
import { 
  CreditCard, 
  Trash2, 
  DollarSign, 
  ArrowRightLeft, 
  Calendar, 
  User, 
  Coffee, 
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadOrders = async () => {
    try {
      const allOrders = await db.getOrders();
      // Chỉ lấy hóa đơn "Chưa thanh toán"
      const unpaid = allOrders.filter(o => o.payment_status === 'Chưa thanh toán');
      setOrders(unpaid);
      
      // Nếu có hóa đơn được chọn trước đó, cập nhật lại thông tin
      if (selectedOrder) {
        const updatedSelected = unpaid.find(o => o.id === selectedOrder.id);
        if (updatedSelected) {
          setSelectedOrder(updatedSelected);
        } else {
          setSelectedOrder(null);
          setOrderItems([]);
        }
      }
    } catch (e) {
      console.error('Lỗi khi tải hóa đơn:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Tải chi tiết các món trong hóa đơn
  useEffect(() => {
    async function loadItems() {
      if (!selectedOrder) return;
      setLoadingItems(true);
      try {
        const items = await db.getOrderItems(selectedOrder.id);
        setOrderItems(items);
      } catch (e) {
        console.error('Lỗi tải chi tiết hóa đơn:', e);
      } finally {
        setLoadingItems(false);
      }
    }
    loadItems();
  }, [selectedOrder]);

  const handlePay = async (method: 'Tiền mặt' | 'Chuyển khoản') => {
    if (!selectedOrder) return;
    setSubmittingPayment(true);
    try {
      await db.payOrder(selectedOrder.id, method);
      
      // Hiển thị Confetti
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#4A3525', '#FFE4C4', '#FFFDD0', '#8C6A5C']
      });

      setIsPayModalOpen(false);
      
      // Reload danh sách
      await loadOrders();
      
      toast.success(`Thanh toán thành công qua phương thức: ${method}`);
    } catch (e) {
      console.error('Lỗi thanh toán:', e);
      toast.error('Gặp lỗi khi xử lý thanh toán.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Hủy hóa đơn hoàn toàn
  const handleCancel = async () => {
    if (!selectedOrder) return;
    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy và xóa hoàn toàn hóa đơn này không?");
    if (!confirmCancel) return;

    try {
      const success = await db.cancelOrder(selectedOrder.id);
      if (success) {
        toast.success("Đã hủy và xóa hóa đơn thành công!");
        setSelectedOrder(null);
        setOrderItems([]);
        await loadOrders();
      } else {
        toast.error("Không thể hủy hóa đơn này.");
      }
    } catch (e) {
      console.error("Lỗi khi hủy hóa đơn:", e);
      toast.error("Gặp lỗi khi hủy hóa đơn.");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Danh sách hóa đơn chưa thanh toán (Bên trái, 1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-light space-y-4">
            <h3 className="font-bold text-lg text-coffee-primary flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-coffee-medium" />
              <span>Hóa đơn mở ({orders.length})</span>
            </h3>
            <p className="text-xs text-coffee-medium">
              Danh sách các bàn đang có khách và chưa thực hiện thanh toán hóa đơn.
            </p>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-coffee-primary animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-coffee-light text-center space-y-3">
                <Coffee className="w-12 h-12 text-coffee-medium/40 mx-auto" />
                <p className="font-bold text-sm text-coffee-medium">Không có hóa đơn chờ</p>
                <p className="text-xs text-coffee-medium/80">Tất cả các bàn đang trống hoặc đã được thanh toán.</p>
              </div>
            ) : (
              orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full p-5 rounded-3xl text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-coffee-accent/30 border-coffee-primary shadow-sm'
                        : 'bg-white border-coffee-light hover:border-coffee-accent hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-coffee-dark">
                        {order.tables?.table_name || 'Bàn không xác định'}
                      </h4>
                      <p className="text-xs text-coffee-medium flex items-center">
                        <User className="w-3.5 h-3.5 mr-1" />
                        <span>Mã HĐ: {order.id.substring(0, 8).toUpperCase()}</span>
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-extrabold text-base text-coffee-primary">
                        {order.total_amount.toLocaleString('vi-VN')}đ
                      </p>
                      <span className="text-[9px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold uppercase tracking-wider">
                        Chờ thanh toán
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Xem chi tiết & Xử lý (Bên phải, 2/3) */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-coffee-light space-y-6">
              {/* Tiêu đề & Hành động chính */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-coffee-light gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-coffee-medium uppercase tracking-wider">Xem chi tiết hóa đơn</span>
                  <h3 className="font-black text-2xl text-coffee-dark">{selectedOrder.tables?.table_name}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition flex items-center space-x-2 text-xs font-bold shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hủy đơn</span>
                  </button>
                  <button
                    onClick={() => setIsPayModalOpen(true)}
                    className="p-3 bg-coffee-primary hover:bg-coffee-dark text-white rounded-2xl transition flex items-center space-x-2 text-xs font-bold shadow shadow-coffee-primary/25"
                  >
                    <DollarSign className="w-4 h-4 text-coffee-accent" />
                    <span>Thanh toán</span>
                  </button>
                </div>
              </div>

              {/* Thông tin hóa đơn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF6F0] p-4 rounded-2xl border border-coffee-light">
                <div className="space-y-2">
                  <p className="text-coffee-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-coffee-primary" />
                    <span>Thời gian đặt: <strong>{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</strong></span>
                  </p>
                  <p className="text-coffee-medium flex items-center">
                    <User className="w-4 h-4 mr-2 text-coffee-primary" />
                    <span>Nhân viên: <strong>{selectedOrder.users?.full_name || 'Không xác định'}</strong></span>
                  </p>
                </div>
                <div className="space-y-2 sm:text-right sm:self-center">
                  <p className="text-coffee-medium">
                    Mã hóa đơn: <strong className="font-mono text-coffee-dark">{selectedOrder.id}</strong>
                  </p>
                </div>
              </div>

              {/* Danh sách các món ăn */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-coffee-dark uppercase tracking-wider">Danh sách món đã đặt</h4>
                {loadingItems ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="w-6 h-6 text-coffee-primary animate-spin" />
                  </div>
                ) : (
                  <div className="border border-coffee-light rounded-2xl overflow-hidden divide-y divide-coffee-light/65">
                    {orderItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center space-x-3">
                          {item.products?.image_url && (
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="w-12 h-12 rounded-xl object-cover border border-coffee-light"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.jpg';
                              }}
                            />
                          )}
                          <div>
                            <p className="font-bold text-coffee-dark">{item.products?.name || 'Món ăn đã xoá'}</p>
                            <p className="text-xs text-coffee-medium">{item.unit_price.toLocaleString('vi-VN')}đ / món</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-8 text-right">
                          <div>
                            <p className="text-xs text-coffee-medium">Số lượng</p>
                            <p className="font-bold text-coffee-dark">x {item.quantity}</p>
                          </div>
                          <div className="w-20 sm:w-24">
                            <p className="text-xs text-coffee-medium">Thành tiền</p>
                            <p className="font-extrabold text-coffee-primary">{item.subtotal.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tổng cộng */}
              <div className="flex items-center justify-between border-t border-coffee-light pt-6">
                <span className="font-extrabold text-base text-coffee-dark">Tổng tiền thanh toán:</span>
                <span className="text-2xl font-black text-coffee-primary">
                  {selectedOrder.total_amount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-white rounded-3xl border border-coffee-light flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="p-4 bg-coffee-light rounded-full text-coffee-primary">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-coffee-dark">Chưa chọn hóa đơn</h3>
              <p className="text-xs text-coffee-medium max-w-sm">
                Vui lòng chọn một hóa đơn chưa thanh toán từ danh sách bên trái để kiểm tra chi tiết, in hóa đơn tạm tính và xử lý trả tiền.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* POPUP CHỌN PHƯƠNG THỨC THANH TOÁN */}
      {isPayModalOpen && selectedOrder && (
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
                Bạn đang thực hiện thanh toán cho bàn: <strong>{selectedOrder.tables?.table_name}</strong>
              </p>
              <div className="flex justify-between items-center bg-[#FAF6F0] p-4 rounded-2xl border border-coffee-light">
                <span className="text-sm font-semibold text-coffee-dark">Tổng tiền cần thu:</span>
                <span className="text-xl font-black text-coffee-primary">
                  {selectedOrder.total_amount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-coffee-medium uppercase tracking-wider">Chọn phương thức thanh toán</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePay('Tiền mặt')}
                  disabled={submittingPayment}
                  className="p-5 bg-coffee-cream/40 border border-coffee-accent hover:bg-coffee-accent/50 rounded-2xl flex flex-col items-center justify-center space-y-2 transition font-bold text-coffee-dark shadow-sm text-sm"
                >
                  <DollarSign className="w-8 h-8 text-coffee-primary" />
                  <span>Tiền mặt</span>
                </button>
                <button
                  onClick={() => handlePay('Chuyển khoản')}
                  disabled={submittingPayment}
                  className="p-5 bg-coffee-cream/40 border border-coffee-accent hover:bg-coffee-accent/50 rounded-2xl flex flex-col items-center justify-center space-y-2 transition font-bold text-coffee-dark shadow-sm text-sm"
                >
                  <ArrowRightLeft className="w-8 h-8 text-coffee-primary" />
                  <span>Chuyển khoản</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-coffee-medium/70">
              Nhân viên thực hiện: {selectedOrder.users?.full_name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
