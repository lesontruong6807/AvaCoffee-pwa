'use client';

import React, { useState, useEffect } from 'react';
import { db, getCurrentUser } from '@/lib/database';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Map,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TimeLogPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái Form chấm công
  const [shift, setShift] = useState('Ca sáng (07:00 - 12:00)');
  const [checkInTimeInput, setCheckInTimeInput] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Mặc định giờ chấm công là giờ hiện tại (định dạng HH:mm)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setCheckInTimeInput(`${hours}:${minutes}`);

    setCurrentUser(getCurrentUser());
  }, []);

  const loadLogs = async (userId: string) => {
    try {
      const allLogs = await db.getTimeLogs();
      // Lọc các bản chấm công của riêng user hiện tại
      const userLogs = allLogs.filter(log => log.user_id === userId);
      setLogs(userLogs);
    } catch (e) {
      console.error('Lỗi khi tải lịch sử chấm công:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadLogs(currentUser.id);
    }
  }, [currentUser]);

  // Hàm lấy vị trí GPS & dịch tọa độ ra địa chỉ
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
          // Gọi API OpenStreetMap Nominatim để dịch tọa độ sang địa chỉ
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'vi' } }
          );
          if (response.ok) {
            const data = await response.json();
            setAddress(data.display_name || `Tọa độ: ${latitude}, ${longitude}`);
          } else {
            setAddress(`Toạ độ: ${latitude}, ${longitude} (Không thể lấy địa chỉ chi tiết)`);
          }
        } catch (e) {
          // Fallback khi offline hoặc lỗi API
          setAddress(`Toạ độ: ${latitude}, ${longitude} (Chế độ ngoại tuyến)`);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Lỗi định vị:', error);
        // Định vị mock để demo nếu người dùng từ chối cấp quyền hoặc ở môi trường không GPS
        const mockLat = 10.7769; // Tọa độ trung tâm TP.HCM
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
      alert('Vui lòng lấy tọa độ vị trí của bạn trước khi chấm công!');
      return;
    }

    setSubmitting(true);
    try {
      // Thiết lập ngày và giờ chấm công
      const checkInDate = new Date();
      const [h, m] = checkInTimeInput.split(':');
      checkInDate.setHours(parseInt(h), parseInt(m), 0, 0);

      await db.createTimeLog({
        user_id: currentUser.id,
        check_in_time: checkInDate.toISOString(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        location_address: address
      });

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.8 }
      });

      // Reset form
      setCoords(null);
      setAddress('');
      
      // Load lại lịch sử
      await loadLogs(currentUser.id);
      alert('Gửi chấm công thành công! Vui lòng chờ Admin phê duyệt.');
    } catch (err) {
      console.error(err);
      alert('Chấm công thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* FORM CHẤM CÔNG (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-coffee-light space-y-4">
          <h3 className="font-extrabold text-xl text-coffee-dark flex items-center space-x-2">
            <Clock className="w-6 h-6 text-coffee-primary" />
            <span>Khai báo Chấm Công Ca Làm Việc</span>
          </h3>
          <p className="text-xs text-coffee-medium">
            Hãy điền giờ vào ca thực tế và bấm nút định vị để ghi nhận vị trí GPS trước khi gửi phê duyệt.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ca làm việc */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Ca làm việc</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                >
                  <option>Ca sáng (07:00 - 12:00)</option>
                  <option>Ca chiều (12:00 - 17:00)</option>
                  <option>Ca tối (17:00 - 22:00)</option>
                </select>
              </div>

              {/* Giờ vào ca */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Giờ chấm công (Khai báo)</label>
                <input
                  type="time"
                  value={checkInTimeInput}
                  onChange={(e) => setCheckInTimeInput(e.target.value)}
                  className="w-full bg-[#FAF6F0] px-4 py-3 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark"
                  required
                />
              </div>
            </div>

            {/* Vị trí GPS */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-coffee-medium uppercase block">Xác thực GPS & Bản đồ</label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="px-5 py-3 bg-coffee-accent hover:bg-coffee-accent/80 text-coffee-dark font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{gettingLocation ? 'Đang định vị GPS...' : 'Lấy vị trí hiện tại'}</span>
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
                    <span>Mở trên ứng dụng Google Maps 🗺️</span>
                  </a>
                </div>
              )}
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={submitting || !coords}
              className={`w-full py-4 text-white font-bold text-xs rounded-2xl transition shadow-md ${
                coords 
                  ? 'bg-coffee-primary hover:bg-coffee-dark shadow-coffee-primary/20' 
                  : 'bg-gray-300 cursor-not-allowed shadow-none'
              }`}
            >
              {submitting ? 'Đang gửi phê duyệt...' : 'Gửi Yêu Cầu Chấm Công'}
            </button>
          </form>
        </div>
      </div>

      {/* LỊCH SỬ CHẤM CÔNG (1/3) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-coffee-light space-y-4">
          <h3 className="font-extrabold text-lg text-coffee-dark flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-coffee-primary" />
            <span>Lịch sử chấm công</span>
          </h3>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-coffee-primary animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-coffee-medium/60 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-40" />
                <p>Chưa có dữ liệu chấm công</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 bg-[#FAF6F0] rounded-2xl border border-coffee-light space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-coffee-medium flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      <span>{currentUser?.full_name}</span>
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      log.status === 'Đã duyệt' 
                        ? 'bg-green-100 text-green-800' 
                        : log.status === 'Từ chối'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <div className="text-xs text-coffee-dark space-y-1">
                    <p>Giờ khai báo: <strong>{new Date(log.check_in_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</strong></p>
                    <p className="text-[10px] text-coffee-medium">Ngày: {new Date(log.check_in_time).toLocaleDateString('vi-VN')}</p>
                    <p className="text-[10px] text-coffee-medium">Gửi lúc: {new Date(log.submitted_at).toLocaleTimeString('vi-VN')} {new Date(log.submitted_at).toLocaleDateString('vi-VN')}</p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-700 hover:text-blue-900 hover:underline flex items-start mt-1"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1 text-coffee-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{log.location_address || `Xem tọa độ: ${log.latitude}, ${log.longitude}`}</span>
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
