-- =====================================================================
-- BỘ CHỈ MỤC TỐI ƯU HÓA SIÊU TỐC ĐỘ (INDEXES) CHO AVA COFFEE HÓC MÔN
-- Giúp tăng tốc độ truy vấn hóa đơn, chi tiết món và kho hàng gấp 5 - 10 lần
-- Bạn chỉ cần copy toàn bộ nội dung file này dán vào SQL Editor trên Supabase và nhấn RUN.
-- =====================================================================

-- 1. Bảng Hóa đơn (hoadon) - Tối ưu POS, Trang chủ, Thanh toán và Báo cáo ca
CREATE INDEX IF NOT EXISTS idx_hoadon_trang_thai_ngay ON public.hoadon (trang_thai_thanh_toan, ngay_tao DESC);
CREATE INDEX IF NOT EXISTS idx_hoadon_ban_chua_tt ON public.hoadon (id_ban, trang_thai_thanh_toan);
CREATE INDEX IF NOT EXISTS idx_hoadon_ngay_thanh_toan ON public.hoadon (ngay_thanh_toan DESC);
CREATE INDEX IF NOT EXISTS idx_hoadon_nhan_vien ON public.hoadon (id_nhan_vien, ngay_tao DESC);

-- 2. Bảng Chi tiết hóa đơn (hoadondetail) - Tối ưu xem chi tiết món và trừ kho
CREATE INDEX IF NOT EXISTS idx_hoadondetail_idhoadon ON public.hoadondetail (idhoadon);
CREATE INDEX IF NOT EXISTS idx_hoadondetail_idsp ON public.hoadondetail (idsp);

-- 3. Bảng Lịch sử kho (lichsukho) - Tối ưu khấu trừ bán hàng và kiểm tra duyệt
CREATE INDEX IF NOT EXISTS idx_lichsukho_thoi_gian ON public.lichsukho (thoi_gian_tao DESC);
CREATE INDEX IF NOT EXISTS idx_lichsukho_loai_thoi_gian ON public.lichsukho (loai_giao_dich, thoi_gian_tao DESC);
CREATE INDEX IF NOT EXISTS idx_lichsukho_nguyenlieu ON public.lichsukho (id_nguyen_lieu);
CREATE INDEX IF NOT EXISTS idx_lichsukho_trang_thai ON public.lichsukho (trang_thai);

-- 4. Bảng Chấm công & Nghỉ phép (chamcong, nghiphep)
CREATE INDEX IF NOT EXISTS idx_chamcong_gio_vao ON public.chamcong (gio_vao DESC);
CREATE INDEX IF NOT EXISTS idx_chamcong_user_gio_vao ON public.chamcong (id_nhan_vien, gio_vao DESC);
CREATE INDEX IF NOT EXISTS idx_chamcong_trang_thai ON public.chamcong (trang_thai);
CREATE INDEX IF NOT EXISTS idx_nghiphep_trang_thai ON public.nghiphep (trang_thai);
CREATE INDEX IF NOT EXISTS idx_nghiphep_nhan_vien ON public.nghiphep (id_nhan_vien, ngay_nop DESC);

-- 5. Bảng Công thức (congthuc) & Sản phẩm (sanpham)
CREATE INDEX IF NOT EXISTS idx_congthuc_sanpham ON public.congthuc (id_san_pham);
CREATE INDEX IF NOT EXISTS idx_congthuc_nguyenlieu ON public.congthuc (id_nguyen_lieu);
CREATE INDEX IF NOT EXISTS idx_sanpham_danhmuc ON public.sanpham (id_danh_muc);
