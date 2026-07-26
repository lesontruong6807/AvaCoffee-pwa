'use client';

import React, { useState, useEffect } from 'react';
import { db, getCurrentUser } from '@/lib/database';
import { toast } from '@/lib/toast';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Map,
  Calendar,
  User,
  Loader2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TimeLogPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Loại chấm công: 'in' (Vào ca) hoặc 'out' (Ra ca)
  const [logType, setLogType] = useState<'in' | 'out'>('in');
  const [activeLog, setActiveLog] = useState<any>(null);

  // Trạng thái Form chấm công
  const [shift, setShift] = useState('Ca sáng (06:00 - 14:00)');
  const [timeInput, setTimeInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Đọc tham số ?type=in hoặc type=out từ URL client-side
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') === 'out' ? 'out' : 'in';
    setLogType(type);

    // Mặc định giờ chấm công là giờ hiện tại (định dạng HH:mm)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setTimeInput(`${hours}:${minutes}`);

    setCurrentUser(getCurrentUser());
  }, []);

  const loadLogs = async (userId: string) => {
    try {
      const allLogs = await db.getTimeLogs();
      // Lọc các bản chấm công của riêng user hiện tại
      const userLogs = allLogs.filter(log => log.user_id === userId);
      setLogs(userLogs);

      // Tìm xem nhân viên có ca làm việc nào đang "Đang trong ca" hay không
      const active = userLogs.find(log => log.status === 'Đang trong ca');
      setActiveLog(active || null);
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

  // Đồng bộ lại khi thay đổi loại chấm công trên URL
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type') === 'out' ? 'out' : 'in';
      setLogType(type);
      
      // Reset form
      setCoords(null);
      setAddress('');
      setNoteInput('');
    };

    window.addEventListener('popstate', handleUrlChange);
    // Nhận diện định kỳ hoặc khi click chuyển link Next.js (bình thường popstate không bắn khi Link chạy client-side, 
    // nên ta chạy phụ trợ trong interval nhỏ)
    const interval = setInterval(() => {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type') === 'out' ? 'out' : 'in';
      if (type !== logType) {
        setLogType(type);
        setCoords(null);
        setAddress('');
        setNoteInput('');
      }
    }, 500);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(interval);
    };
  }, [logType]);

  // Hàm lấy vị trí GPS & dịch tọa độ ra địa chỉ
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị GPS.');
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
          setAddress(`Toạ độ: ${latitude}, ${longitude} (Chế độ ngoại tuyến)`);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Lỗi định vị:', error);
        // Định vị mock để demo nếu người dùng từ chối cấp quyền hoặc lỗi phần cứng
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
      toast.error('Vui lòng lấy tọa độ vị trí của bạn trước khi chấm công!');
      return;
    }

    setSubmitting(true);
    try {
      const shiftDate = new Date();
      const [h, m] = timeInput.split(':');
      const checkHour = parseInt(h, 10);
      const checkMin = parseInt(m, 10);
      const totalMinutes = checkHour * 60 + checkMin;

      // 1. Kiểm tra tồn tại ca trực nếu là Ra ca
      if (logType === 'out' && !activeLog) {
        toast.error('Không tìm thấy ca trực đang hoạt động để chấm công ra.');
        setSubmitting(false);
        return;
      }

      // 2. Kiểm tra giới hạn giờ khai báo theo ca
      const currentShift = logType === 'in' ? shift : activeLog.shift;
      if (currentShift.startsWith('Ca sáng')) {
        if (totalMinutes < 6 * 60 || totalMinutes > 14 * 60) {
          toast.error('Giờ khai báo Ca sáng chỉ được trong khoảng từ 06:00 đến 14:00!');
          setSubmitting(false);
          return;
        }
      } else if (currentShift.startsWith('Ca chiều')) {
        if (totalMinutes < 14 * 60 || totalMinutes > 22 * 60) {
          toast.error('Giờ khai báo Ca chiều chỉ được trong khoảng từ 14:00 đến 22:00!');
          setSubmitting(false);
          return;
        }
      }

      shiftDate.setHours(checkHour, checkMin, 0, 0);

      if (logType === 'in') {
        // Chấm công VÀO ca
        await db.createTimeLog({
          user_id: currentUser.id,
          shift,
          check_in_time: shiftDate.toISOString(),
          latitude: coords.latitude,
          longitude: coords.longitude,
          location_address: address,
          ghi_chu_vao: noteInput
        });

        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.8 }
        });

        toast.success('Chấm công VÀO ca thành công! Ca trực của bạn đã bắt đầu.');
      } else {
        // Chấm công RA ca
        await db.checkOutTimeLog(activeLog.id, {
          check_out_time: shiftDate.toISOString(),
          latitude: coords.latitude,
          longitude: coords.longitude,
          location_address: address,
          ghi_chu_ra: noteInput
        });

        confetti({
          particleCount: 150,
          spread: 80,
          colors: ['#4A3525', '#FAF6F0', '#FFE4C4'],
          origin: { y: 0.8 }
        });

        toast.success('Chấm công RA ca thành công! Đơn chấm công đã được chuyển đến Admin phê duyệt.');
      }

      // Reset form
      setCoords(null);
      setAddress('');
      setNoteInput('');
      
      // Load lại lịch sử
      await loadLogs(currentUser.id);
    } catch (err) {
      console.error(err);
      toast.error('Giao dịch chấm công thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatClockTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* FORM CHẤM CÔNG (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-coffee-light space-y-4">
          <h3 className="font-extrabold text-xl text-coffee-dark flex items-center space-x-2">
            <Clock className="w-6 h-6 text-coffee-primary" />
            <span>Khai báo Chấm Công {logType === 'in' ? 'VÀO CA' : 'RA CA'}</span>
          </h3>
          <p className="text-xs text-coffee-medium">
            {logType === 'in' 
              ? 'Hãy khai báo ca trực và giờ thực tế bạn bắt đầu làm việc. Định vị GPS là bắt buộc để nộp.'
              : 'Hãy xác nhận giờ ra ca thực tế và ghi chú công việc trước khi kết thúc ca làm.'}
          </p>

          {logType === 'out' && !activeLog && !loading && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-700" />
                <span>Không tìm thấy ca trực đang chạy!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Hệ thống không tìm thấy bản ghi chấm công vào ca nào của bạn có trạng thái <strong>"Đang trong ca"</strong> hôm nay. Bạn cần chấm công vào ca trước khi thực hiện chấm công ra ca.
              </p>
              <button
                onClick={() => {
                  window.history.pushState(null, '', '/time-log?type=in');
                  setLogType('in');
                }}
                className="px-4 py-2 bg-coffee-primary hover:bg-coffee-dark text-white text-[11px] font-bold rounded-xl transition"
              >
                Đi tới Chấm công vào ca
              </button>
            </div>
          )}

          {(logType === 'in' || activeLog) && (
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {logType === 'out' && activeLog && (
                <div className="p-4 bg-coffee-light/40 border border-coffee-light rounded-2xl text-xs text-coffee-dark space-y-1">
                  <p>Ca trực đang hoạt động: <strong>{activeLog.shift}</strong></p>
                  <p>Giờ vào ca đã chọn: <strong>{formatClockTime(activeLog.check_in_time)}</strong> (Thực tế vào lúc: {formatClockTime(activeLog.submitted_at)} - {formatDateString(activeLog.submitted_at)})</p>
                  {activeLog.ghi_chu_vao && <p className="italic text-coffee-medium mt-1">Ghi chú vào ca: "{activeLog.ghi_chu_vao}"</p>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ca làm việc - Chỉ hiện ở Vào ca */}
                {logType === 'in' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-coffee-medium uppercase">Ca làm việc</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block"
                    >
                      <option>Ca sáng (06:00 - 14:00)</option>
                      <option>Ca chiều (14:00 - 22:00)</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-coffee-medium uppercase block">Ca trực đang kết thúc</label>
                    <div className="w-full h-11 bg-coffee-light/20 px-4 py-0 rounded-2xl text-xs font-bold text-coffee-dark border border-coffee-light flex items-center">
                      {activeLog?.shift}
                    </div>
                  </div>
                )}

                {/* Giờ vào ca / ra ca */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-medium uppercase">
                    Giờ {logType === 'in' ? 'vào ca' : 'ra ca'} (Khai báo - 24h)
                  </label>
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark block min-w-0"
                    required
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-coffee-medium uppercase">Ghi chú gửi Admin (Không bắt buộc)</label>
                <input
                  type="text"
                  placeholder={logType === 'in' ? "Ví dụ: Đi làm đúng giờ, xin vào ca trễ do kẹt xe..." : "Ví dụ: Đã bàn giao ca trực đầy đủ, tổng kết tiền mặt..."}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full h-11 bg-[#FAF6F0] px-4 py-0 rounded-2xl text-xs border-none focus:ring-2 focus:ring-coffee-accent text-coffee-dark placeholder-coffee-medium/70 block"
                />
              </div>

              {/* Vị trí GPS */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-coffee-medium uppercase block">Xác thực GPS {logType === 'in' ? 'Vào ca' : 'Ra ca'} (Bắt buộc)</label>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="px-5 py-3 bg-coffee-accent hover:bg-coffee-accent/80 text-coffee-dark font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{gettingLocation ? 'Đang xác định GPS...' : 'Lấy vị trí hiện tại'}</span>
                  </button>
                  
                  {address && (
                    <div className="flex-1 bg-green-50 text-green-800 text-xs px-4 py-3 rounded-2xl border border-green-200 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                      <span className="line-clamp-2">{address}</span>
                    </div>
                  )}
                </div>

                {/* Bản đồ định vị */}
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
                      <span>Xem định vị Google Maps 🗺️</span>
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
                {submitting 
                  ? 'Đang nộp yêu cầu...' 
                  : logType === 'in' 
                    ? 'Gửi yêu cầu BẮT ĐẦU CA' 
                    : 'Gửi yêu cầu KẾT THÚC CA (Ra ca)'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* LỊCH SỬ CHẤM CÔNG (1/3) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-coffee-light space-y-4">
          <h3 className="font-extrabold text-lg text-coffee-dark flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-coffee-primary" />
            <span>Lịch sử chấm công</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
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
                <div key={log.id} className="p-4 bg-[#FAF6F0] rounded-2xl border border-coffee-light space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-coffee-medium flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      <span>{currentUser?.full_name}</span>
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      log.status === 'Đã duyệt' 
                        ? 'bg-green-100 text-green-800' 
                        : log.status === 'Từ chối'
                        ? 'bg-red-100 text-red-800'
                        : log.status === 'Đang trong ca'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <div className="text-xs text-coffee-dark space-y-2 border-l-2 border-coffee-primary/20 pl-2">
                    <p className="font-extrabold text-[11px] text-coffee-dark">{log.shift}</p>
                    <p className="text-[10px] text-coffee-medium font-semibold">Ngày: {formatDateString(log.check_in_time)}</p>
                    
                    {/* CHI TIẾT VÀO CA */}
                    <div className="space-y-0.5 bg-white p-2 rounded-xl border border-coffee-light/60">
                      <p className="text-[10px] font-bold text-coffee-primary">VÀO CA</p>
                      <p>Khai báo: <strong>{formatClockTime(log.check_in_time)}</strong></p>
                      <p className="text-[10px] text-coffee-medium">Thực tế: {formatClockTime(log.submitted_at)}</p>
                      {log.ghi_chu_vao && (
                        <p className="text-[9px] italic text-coffee-medium mt-1">Ghi chú: "{log.ghi_chu_vao}"</p>
                      )}
                    </div>

                    {/* CHI TIẾT RA CA */}
                    <div className="space-y-0.5 bg-white p-2 rounded-xl border border-coffee-light/60">
                      <p className="text-[10px] font-bold text-teal-700">RA CA</p>
                      {log.check_out_time ? (
                        <>
                          <p>Khai báo: <strong>{formatClockTime(log.check_out_time)}</strong></p>
                          <p className="text-[10px] text-coffee-medium">Thực tế: {formatClockTime(log.real_check_out_time)}</p>
                          {log.ghi_chu_ra && (
                            <p className="text-[9px] italic text-coffee-medium mt-1">Ghi chú: "{log.ghi_chu_ra}"</p>
                          )}
                        </>
                      ) : (
                        <p className="text-[10px] italic text-blue-600 animate-pulse font-medium">Đang hoạt động trong ca...</p>
                      )}
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-700 hover:text-blue-900 hover:underline flex items-start mt-1"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1 text-coffee-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{log.location_address || `Tọa độ: ${log.latitude}, ${log.longitude}`}</span>
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
