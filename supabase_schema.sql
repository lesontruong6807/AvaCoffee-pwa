-- SCRIPT TẠO CƠ SỞ DỮ LIỆU MỚI CHO AVA COFFEE
-- Hỗ trợ tên bảng và tên cột bằng tiếng Việt không dấu giúp người dùng Việt dễ hiểu.
-- Hãy chạy script này trong SQL Editor của Supabase.

-- Hủy bỏ các bảng cũ (cả tên tiếng Anh và tiếng Việt) nếu đã tồn tại
DROP TABLE IF EXISTS public.nghiphep CASCADE;
DROP TABLE IF EXISTS public.chamcong CASCADE;
DROP TABLE IF EXISTS public.hoadondetail CASCADE;
DROP TABLE IF EXISTS public.hoadon CASCADE;
DROP TABLE IF EXISTS public.sanpham CASCADE;
DROP TABLE IF EXISTS public.danhmuc CASCADE;
DROP TABLE IF EXISTS public.danhsachban CASCADE;
DROP TABLE IF EXISTS public.nguoidung CASCADE;

DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.time_logs CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.tables CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 0. HÀM TỰ ĐỘNG TẠO ID NGẮN (Ví dụ: p_a2b3c4d5)
CREATE OR REPLACE FUNCTION public.generate_short_id(prefix text) 
RETURNS text AS $$
DECLARE
    chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
    result text := prefix;
    i integer;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 1. BẢNG NGƯỜI DÙNG (nguoidung)
CREATE TABLE public.nguoidung (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('u_'),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT '123456',
    email TEXT UNIQUE NOT NULL,
    ho_ten TEXT NOT NULL,
    vai_tro TEXT NOT NULL CHECK (vai_tro IN ('Admin', 'User')) DEFAULT 'User',
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. BẢNG DANH SÁCH BÀN (danhsachban)
CREATE TABLE public.danhsachban (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('tb_'),
    ten_ban TEXT NOT NULL UNIQUE,
    suc_chua INTEGER NOT NULL DEFAULT 4,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('Trống', 'Đang phục vụ')) DEFAULT 'Trống'
);

-- 3. BẢNG LOẠI SẢN PHẨM (danhmuc)
CREATE TABLE public.danhmuc (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('c_'),
    ten_danh_muc TEXT NOT NULL UNIQUE
);

-- 4. BẢNG SẢN PHẨM (sanpham)
CREATE TABLE public.sanpham (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('p_'),
    id_danh_muc TEXT REFERENCES public.danhmuc(id) ON DELETE CASCADE NOT NULL,
    ten_san_pham TEXT NOT NULL,
    don_vi_tinh TEXT NOT NULL DEFAULT 'Ly',
    don_gia NUMERIC NOT NULL CHECK (don_gia >= 0),
    gia_von NUMERIC NOT NULL CHECK (gia_von >= 0) DEFAULT 0,
    hinh_anh TEXT,
    mo_ta TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('Còn hàng', 'Hết hàng')) DEFAULT 'Còn hàng'
);

-- 5. BẢNG HÓA ĐƠN (hoadon)
CREATE TABLE public.hoadon (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('ord_'),
    id_ban TEXT REFERENCES public.danhsachban(id) ON DELETE SET NULL,
    id_nhan_vien TEXT REFERENCES public.nguoidung(id) ON DELETE SET NULL,
    tong_tien NUMERIC NOT NULL CHECK (tong_tien >= 0) DEFAULT 0,
    trang_thai_thanh_toan TEXT NOT NULL CHECK (trang_thai_thanh_toan IN ('Chưa thanh toán', 'Đã thanh toán', 'Đã hủy')) DEFAULT 'Chưa thanh toán',
    phuong_thuc_thanh_toan TEXT CHECK (phuong_thuc_thanh_toan IN ('Tiền mặt', 'Chuyển khoản')),
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    ngay_thanh_toan TIMESTAMP WITH TIME ZONE
);

-- 6. BẢNG CHI TIẾT HÓA ĐƠN (hoadondetail)
CREATE TABLE public.hoadondetail (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('item_'),
    idhoadon TEXT REFERENCES public.hoadon(id) ON DELETE CASCADE NOT NULL,
    idsp TEXT REFERENCES public.sanpham(id) ON DELETE CASCADE NOT NULL,
    ten_san_pham TEXT NOT NULL,
    don_vi_tinh TEXT NOT NULL DEFAULT 'Ly',
    don_gia NUMERIC NOT NULL CHECK (don_gia >= 0),
    so_luong INTEGER NOT NULL CHECK (so_luong > 0),
    thanh_tien NUMERIC NOT NULL CHECK (thanh_tien >= 0),
    ghi_chu TEXT DEFAULT ''
);

-- 7. BẢNG CHẤM CÔNG (chamcong)
CREATE TABLE public.chamcong (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('log_'),
    id_nhan_vien TEXT REFERENCES public.nguoidung(id) ON DELETE CASCADE NOT NULL,
    ca_lam TEXT NOT NULL DEFAULT 'Ca sáng (07:00 - 12:00)',
    gio_vao TIMESTAMP WITH TIME ZONE NOT NULL,
    ngay_nop TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    vi_do NUMERIC NOT NULL,
    kinh_do NUMERIC NOT NULL,
    dia_chi TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối')) DEFAULT 'Chờ duyệt'
);

-- 8. BẢNG XIN NGHỈ PHÉP (nghiphep)
CREATE TABLE public.nghiphep (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('lv_'),
    id_nhan_vien TEXT REFERENCES public.nguoidung(id) ON DELETE CASCADE NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    ly_do TEXT NOT NULL,
    ngay_nop TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    vi_do NUMERIC NOT NULL,
    kinh_do NUMERIC NOT NULL,
    dia_chi TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối')) DEFAULT 'Chờ duyệt',
    CONSTRAINT check_dates CHECK (ngay_ket_thuc >= ngay_bat_dau)
);

-- BẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.nguoidung ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danhsachban ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danhmuc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanpham ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoadon ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoadondetail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamcong ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nghiphep ENABLE ROW LEVEL SECURITY;

-- TẠO CÁC CHÍNH SÁCH RLS (BẢN ĐƠN GIẢN CHO DEV)
CREATE POLICY "Cho phép đọc mọi bảng công khai" ON public.nguoidung FOR SELECT USING (true);
CREATE POLICY "Cho phép ghi đối với user đăng nhập" ON public.nguoidung FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng danhsachban công khai" ON public.danhsachban FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng danhsachban công khai" ON public.danhsachban FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng danhmuc công khai" ON public.danhmuc FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng danhmuc công khai" ON public.danhmuc FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng sanpham công khai" ON public.sanpham FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng sanpham công khai" ON public.sanpham FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng hoadon công khai" ON public.hoadon FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng hoadon công khai" ON public.hoadon FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng hoadondetail công khai" ON public.hoadondetail FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng hoadondetail công khai" ON public.hoadondetail FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng chamcong công khai" ON public.chamcong FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng chamcong công khai" ON public.chamcong FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng nghiphep công khai" ON public.nghiphep FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng nghiphep công khai" ON public.nghiphep FOR ALL USING (true) WITH CHECK (true);

-- CHÈN DỮ LIỆU MẪU (SEED DATA)

-- 1. Thêm nhân viên (NguoiDung)
INSERT INTO public.nguoidung (id, username, password, email, ho_ten, vai_tro) VALUES
('admin', 'admin', '123456', 'admin@avacoffee.com', 'Lê Sơn (Admin)', 'Admin'),
('nv001', 'nv001', '123456', 'nhanvien1@avacoffee.com', 'Nguyễn Văn Minh', 'User'),
('nv002', 'nv002', '123456', 'nhanvien2@avacoffee.com', 'Trần Thị Thuỷ', 'User')
ON CONFLICT (username) DO NOTHING;

-- 2. Thêm bàn (DanhSachBan)
INSERT INTO public.danhsachban (id, ten_ban, suc_chua, trang_thai) VALUES
('tb1', 'Bàn 1', 4, 'Trống'),
('tb2', 'Bàn 2', 4, 'Trống'),
('tb3', 'Bàn 3', 2, 'Trống'),
('tb4', 'Bàn 4', 2, 'Trống'),
('tb5', 'Bàn 5', 6, 'Trống'),
('tb6', 'Bàn 6', 6, 'Trống'),
('tb7', 'Khách mang về', 99, 'Trống')
ON CONFLICT (ten_ban) DO NOTHING;

-- 3. Thêm danh mục món (DanhMuc)
INSERT INTO public.danhmuc (id, ten_danh_muc) VALUES
('c_caphe', 'Cà phê'),
('c_douongkhac', 'Thức uống khác'),
('c_tra', 'Trà'),
('c_yaourt', 'Yaourt'),
('c_soda', 'Soda')
ON CONFLICT (ten_danh_muc) DO NOTHING;

-- 4. Thêm sản phẩm mẫu (SanPham - 19 món khớp 100% hình ảnh thực đơn)
INSERT INTO public.sanpham (id, id_danh_muc, ten_san_pham, don_vi_tinh, don_gia, gia_von, hinh_anh, trang_thai) VALUES
-- Cà phê (CP)
('CP001', 'c_caphe', 'Cà phê đen', 'Ly', 15000, 5000, '/products/CP001.png', 'Còn hàng'),
('CP002', 'c_caphe', 'Cà phê sữa', 'Ly', 17000, 6000, '/products/CP002.png', 'Còn hàng'),
('CP003', 'c_caphe', 'Cà phê sữa tươi', 'Ly', 22000, 8000, '/products/CP003.png', 'Còn hàng'),
('CP004', 'c_caphe', 'Cà phê muối', 'Ly', 22000, 8000, '/products/CP004.png', 'Còn hàng'),
('CP005', 'c_caphe', 'Bạc xìu', 'Ly', 22000, 8000, '/products/CP005.png', 'Còn hàng'),

-- Thức uống khác (TUK)
('TUK001', 'c_douongkhac', 'Cacao', 'Ly', 20000, 7000, '/products/TUK001.png', 'Còn hàng'),
('TUK002', 'c_douongkhac', 'Cacao kem muối', 'Ly', 25000, 9000, '/products/TUK002.png', 'Còn hàng'),
('TUK003', 'c_douongkhac', 'Matcha Latte', 'Ly', 25000, 9000, '/products/TUK003.png', 'Còn hàng'),
('TUK004', 'c_douongkhac', 'Matcha Latte kem muối', 'Ly', 30000, 11000, '/products/TUK004.png', 'Còn hàng'),

-- Trà (T)
('T001', 'c_tra', 'Trà tắc', 'Ly', 15000, 5000, '/products/T001.png', 'Còn hàng'),
('T002', 'c_tra', 'Trà dâu', 'Ly', 25000, 9000, '/products/T002.png', 'Còn hàng'),
('T003', 'c_tra', 'Trà đào', 'Ly', 25000, 9000, '/products/T003.png', 'Còn hàng'),
('T004', 'c_tra', 'Trà vải', 'Ly', 25000, 9000, '/products/T004.png', 'Còn hàng'),

-- Yaourt (Y)
('Y001', 'c_yaourt', 'Yaourt đá', 'Ly', 20000, 7000, '/products/Y001.png', 'Còn hàng'),
('Y002', 'c_yaourt', 'Yaourt dâu', 'Ly', 25000, 9000, '/products/Y002.png', 'Còn hàng'),
('Y003', 'c_yaourt', 'Yaourt việt quất', 'Ly', 25000, 9000, '/products/Y003.png', 'Còn hàng'),

-- Soda (S)
('S001', 'c_soda', 'Soda dâu', 'Ly', 25000, 9000, '/products/S001.png', 'Còn hàng'),
('S002', 'c_soda', 'Soda đào', 'Ly', 25000, 9000, '/products/S002.png', 'Còn hàng'),
('S003', 'c_soda', 'Soda việt quất', 'Ly', 25000, 9000, '/products/S003.png', 'Còn hàng')
ON CONFLICT (id) DO UPDATE 
SET ten_san_pham = EXCLUDED.ten_san_pham, 
    don_gia = EXCLUDED.don_gia, 
    gia_von = EXCLUDED.gia_von, 
    hinh_anh = EXCLUDED.hinh_anh, 
    trang_thai = EXCLUDED.trang_thai;
