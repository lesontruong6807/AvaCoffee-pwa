'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Loader2,
  ArrowLeft
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
      {/* Nút Quay về Trang chủ */}
      <Link 
        href="/"
        className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-coffee-light text-coffee-primary rounded-xl text-xs font-bold hover:bg-coffee-light transition shadow-sm w-fit animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về Trang chủ</span>
      </Link>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-light space-y-4">
          <h3 className="font-bold text-lg text-coffee-primary flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-coffee-medium" />
            <span>Danh sách hóa đơn chưa thanh toán ({orders.length})</span>
          </h3>
          <p className="text-xs text-coffee-medium">
            Chọn hóa đơn bên dưới để xem chi tiết món ăn, thực hiện thanh toán hoặc hủy đơn nhanh chóng.
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center bg-white rounded-3xl border border-coffee-light">
              <Loader2 className="w-8 h-8 text-coffee-primary animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-coffee-medium border border-coffee-light space-y-4">
              <Coffee className="w-16 h-16 mx-auto opacity-30 text-coffee-primary" />
              <p className="font-bold text-sm">Không có hóa đơn chờ thanh toán</p>
              <p className="text-xs">Các bàn hiện tại đều trống hoặc đã hoàn tất thanh toán.</p>
            </div>
          ) : (
            orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm ${
                    isSelected 
                      ? 'border-coffee-accent ring-1 ring-coffee-accent shadow-md' 
                      : 'border-coffee-light hover:border-coffee-medium/55'
                  }`}
                >
                  {/* CARD HEADER (Always visible) */}
                  <button
                    onClick={() => {
                      if (isSelected) {
                        setSelectedOrder(null);
                        setOrderItems([]);
                      } else {
                        setSelectedOrder(order);
                      }
                    }}
                    className="w-full flex items-center justify-between p-5 text-left transition hover:bg-[#FAF6F0]/30"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-base text-coffee-dark">
                          {order.tables?.table_name || 'Bàn không xác định'}
                        </h4>
                        <span className="text-[9px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold uppercase tracking-wider">
                          Chờ thanh toán
                        </span>
                      </div>
                      <p className="text-xs text-coffee-medium flex items-center">
                        <User className="w-3.5 h-3.5 mr-1" />
                        <span>Mã HĐ: {order.id.substring(0, 8).toUpperCase()}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <p className="font-black text-lg text-coffee-primary">
                        {order.total_amount.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-[10px] text-coffee-medium">
                        {isSelected ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
                      </p>
                    </div>
                  </button>

                  {/* EXPANDED CONTENT */}
                  {isSelected && (
                    <div className="border-t border-coffee-light/60 p-5 bg-[#FAF6F0]/20 space-y-5">
                      {/* Meta Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-coffee-medium border-b border-coffee-light/60 pb-4">
                        <div>
                          Thời gian đặt: <strong>{new Date(order.created_at).toLocaleString('vi-VN')}</strong>
                        </div>
                        <div>
                          Nhân viên lập đơn: <strong>{order.users?.full_name || 'Không xác định'}</strong>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        <h5 className="font-bold text-xs text-coffee-dark uppercase tracking-wider">Danh sách món ăn</h5>
                        {loadingItems ? (
                          <div className="py-4 flex justify-center">
                            <Loader2 className="w-5 h-5 text-coffee-primary animate-spin" />
                          </div>
                        ) : (
                          <div className="border border-coffee-light bg-white rounded-2xl overflow-hidden divide-y divide-coffee-light/50">
                            {orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-3.5 text-xs">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-coffee-dark">{item.products?.name || 'Món ăn đã xoá'}</p>
                                  <p className="text-[10px] text-coffee-medium">Đơn giá: {item.unit_price?.toLocaleString('vi-VN') || item.products?.price?.toLocaleString('vi-VN')}đ</p>
                                </div>
                                <div className="flex items-center space-x-6">
                                  <span className="font-bold text-coffee-medium">x {item.quantity}</span>
                                  <span className="font-extrabold text-coffee-dark w-16 text-right">
                                    {item.subtotal.toLocaleString('vi-VN')}đ
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Phân rã giá tiền (Tạm tính, Giảm giá, Tổng cộng) */}
                      <div className="bg-[#FAF6F0]/40 p-4 rounded-2xl border border-coffee-light/60 space-y-2">
                        {order.discount > 0 && (
                          <>
                            <div className="flex justify-between text-xs text-coffee-medium">
                              <span>Tiền món ăn:</span>
                              <span className="font-semibold">{(order.total_amount + order.discount).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-xs text-red-600">
                              <span>Giảm giá:</span>
                              <span className="font-bold">-{order.discount.toLocaleString('vi-VN')}đ</span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center justify-between border-t border-coffee-light/40 pt-2">
                          <span className="font-extrabold text-xs text-coffee-dark">Tổng tiền thanh toán:</span>
                          <span className="text-sm font-black text-coffee-primary font-mono">
                            {order.total_amount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons inside Card */}
                      <div className="flex items-center justify-end space-x-3 pt-1 border-t border-coffee-light/40">
                        <button
                          onClick={handleCancel}
                          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition flex items-center space-x-2 text-xs font-bold shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hủy đơn</span>
                        </button>
                        <button
                          onClick={() => setIsPayModalOpen(true)}
                          className="px-5 py-2.5 bg-coffee-primary hover:bg-coffee-dark text-white rounded-xl transition flex items-center space-x-2 text-xs font-bold shadow shadow-coffee-primary/20"
                        >
                          <DollarSign className="w-4 h-4 text-coffee-accent" />
                          <span>Thanh toán</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
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
