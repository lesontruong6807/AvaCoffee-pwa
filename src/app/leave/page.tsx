'use client';

import React, { useState, useEffect } from 'react';
import { db, getCurrentUser } from '@/lib/database';
import { 
  CalendarDays, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  User,
  Calendar,
  Loader2,
  FileText,
  Map
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LeaveRequestPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái Form xin nghỉ
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Mặc định chọn ngày bắt đầu từ ngày mai
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setStartDate(dateStr);
    setEndDate(dateStr);

    setCurrentUser(getCurrentUser());
  }, []);

  const loadRequests = async (userId: string) => {
    try {
      const allReqs = await db.getLeaveRequests();
      // Lọc các yêu cầu nghỉ phép của riêng user hiện tại
      const userReqs = allReqs.filter(r => r.user_id === userId);
      setRequests(userReqs);
    } catch (e) {
      console.error('Lỗi khi tải lịch sử xin nghỉ:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadRequests(currentUser.id);
    }
  }, [currentUser]);

  // Lấy vị trí GPS & dịch tọa độ ra địa chỉ
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'vi' } }
          );
          if (response.ok) {
            const data = await response.json();
            setAddress(data.display_name || `Tọa độ: ${latitude}, ${longitude}`);
          } else {
            setAddress(`Toạ độ: ${latitude}, ${longitude} (Không thể dịch địa chỉ)`);
          }
        } catch (e) {
          setAddress(`Toạ độ: ${latitude}, ${longitude} (Ngoại tuyến)`);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Lỗi định vị:', error);
        // Định vị mock để demo
        const mockLat = 10.7769;
        const mockLon = 106.7009;
        setCoords({ latitude: mockLat, longitude: mockLon });
        setAddress('Nhà thờ Đức Bà, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh (Mock GPS)');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      alert('Vui lòng định vị vị trí GPS của bạn để xác thực yêu cầu xin nghỉ phép!');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Ngày bắt đầu không được lớn hơn ngày kết thúc!');
      return;
    }

    setSubmitting(true);
    try {
      await db.createLeaveRequest({
        user_id: currentUser.id,
        start_date: startDate,
        end_date: endDate,
        reason,
        latitude: coords.latitude,
        longitude: coords.longitude,
        location_address: address
      });

      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 }
      });

      // Reset form
      setReason('');
      setCoords(null);
      setAddress('');
      
      // Load lại lịch sử
      await loadRequests(currentUser.id);
      alert('Gửi đơn xin nghỉ phép thành công! Vui lòng đợi Admin duyệt.');
    } catch (err) {
      console.error(err);
      alert('Gửi đơn thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* FORM ĐĂNG KÝ (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-coffee-light space-y-4">
          <h3 className="font-extrabold text-xl text-coffee-dark flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-coffee-primary" />
            <span>Đăng ký Xin Nghỉ Phép</span>
          </h3>
          <p className="text-xs text-coffee-medium">
            Điền đầy đủ khoảng thời gian và lý do nghỉ phép. Vui lòng định vị GPS để xác thực địa điểm gửi đơn.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ngày bắt đầu */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                />
              </div>

              {/* Ngày kết thúc */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                />
              </div>
            </div>

            {/* Lý do */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-coffee-medium uppercase">Lý do xin nghỉ</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Bận việc gia đình, Đi khám sức khỏe,..."
                rows={3}
                className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark placeholder-coffee-medium"
                required
              />
            </div>

            {/* Định vị GPS */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-coffee-medium uppercase block">Xác thực GPS khi gửi đơn</label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="px-5 py-3 bg-coffee-accent hover:bg-coffee-accent/80 text-coffee-dark font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{gettingLocation ? 'Đang định vị GPS...' : 'Lấy vị trí gửi đơn'}</span>
                </button>
                
                {address && (
                  <div className="flex-1 bg-green-50 text-green-800 text-xs px-4 py-3 rounded-2xl border border-green-200 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                    <span className="line-clamp-2">{address}</span>
                  </div>
                )}
              </div>

              {/* Định vị bằng tọa độ số & Nút mở Google Maps */}
              {coords && (
                <div className="bg-coffee-cream/35 border border-coffee-accent/60 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-coffee-light">
                      <p className="text-[10px] text-coffee-medium font-bold uppercase">Vĩ độ (Latitude)</p>
                      <p className="font-mono font-bold text-sm text-coffee-dark mt-0.5">{coords.latitude.toFixed(6)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-coffee-light">
                      <p className="text-[10px] text-coffee-medium font-bold uppercase">Kinh độ (Longitude)</p>
                      <p className="font-mono font-bold text-sm text-coffee-dark mt-0.5">{coords.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                  
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    <Map className="w-4.5 h-4.5" />
                    <span>Mở vị trí gửi đơn trên Google Maps 🗺️</span>
                  </a>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !coords}
              className={`w-full py-4 text-white font-bold text-xs rounded-2xl transition shadow-md ${
                coords 
                  ? 'bg-coffee-primary hover:bg-coffee-dark shadow-coffee-primary/20' 
                  : 'bg-gray-300 cursor-not-allowed shadow-none'
              }`}
            >
              {submitting ? 'Đang gửi đơn...' : 'Gửi Đơn Xin Nghỉ Phép'}
            </button>
          </form>
        </div>
      </div>

      {/* LỊCH SỬ XIN NGHỈ PHÉP (1/3) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-coffee-light space-y-4">
          <h3 className="font-extrabold text-lg text-coffee-dark flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-coffee-primary" />
            <span>Lịch sử nghỉ phép</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-coffee-primary animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-coffee-medium/60 text-xs space-y-2">
                <CalendarDays className="w-8 h-8 mx-auto opacity-40" />
                <p>Chưa gửi yêu cầu nghỉ phép nào</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="p-4 bg-[#FAF6F0] rounded-2xl border border-coffee-light space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-coffee-medium flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      <span>{currentUser?.full_name}</span>
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      req.status === 'Đã duyệt' 
                        ? 'bg-green-100 text-green-800' 
                        : req.status === 'Từ chối'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-coffee-dark space-y-1.5">
                    <p className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-coffee-medium" />
                      <span>Nghỉ: <strong>{new Date(req.start_date).toLocaleDateString('vi-VN')}</strong> đến <strong>{new Date(req.end_date).toLocaleDateString('vi-VN')}</strong></span>
                    </p>
                    <p className="flex items-start">
                      <FileText className="w-3.5 h-3.5 mr-1.5 text-coffee-medium shrink-0 mt-0.5" />
                      <span>Lý do: <span className="font-medium text-coffee-medium">{req.reason}</span></span>
                    </p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-t border-coffee-light/50 pt-2 flex items-center text-[9px] text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1 text-coffee-primary shrink-0" />
                    <span className="line-clamp-1">{req.location_address || `Xem tọa độ: ${req.latitude}, ${req.longitude}`}</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
