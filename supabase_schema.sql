-- SCRIPT TẠO CƠ SỞ DỮ LIỆU MỚI CHO AVA COFFEE
-- Hỗ trợ tên bảng và tên cột bằng tiếng Việt không dấu giúp người dùng Việt dễ hiểu.
-- Hãy chạy script này trong SQL Editor của Supabase.

-- Hủy bỏ các bảng cũ (cả tên tiếng Anh và tiếng Việt) nếu đã tồn tại
DROP TABLE IF EXISTS public.lichsukho CASCADE;
DROP TABLE IF EXISTS public.congthuc CASCADE;
DROP TABLE IF EXISTS public.nguyenlieu CASCADE;
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
    giam_gia NUMERIC DEFAULT 0 CHECK (giam_gia >= 0),
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
    ca_lam TEXT NOT NULL DEFAULT 'Ca sáng (06:00 - 14:00)',
    gio_vao TIMESTAMP WITH TIME ZONE NOT NULL,
    gio_ra TIMESTAMP WITH TIME ZONE,
    thoi_gian_thuc_vao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    thoi_gian_thuc_ra TIMESTAMP WITH TIME ZONE,
    vi_do NUMERIC NOT NULL,
    kinh_do NUMERIC NOT NULL,
    dia_chi TEXT,
    ghi_chu_vao TEXT,
    ghi_chu_ra TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('Đang trong ca', 'Chờ duyệt', 'Đã duyệt', 'Từ chối')) DEFAULT 'Đang trong ca',
    sua_lai BOOLEAN DEFAULT FALSE
);

-- 8. BẢNG XIN NGHỈ PHÉP (nghiphep)
CREATE TABLE public.nghiphep (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('lv_'),
    id_nhan_vien TEXT REFERENCES public.nguoidung(id) ON DELETE CASCADE NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    ly_do TEXT NOT NULL,
    ngay_nop TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối')) DEFAULT 'Chờ duyệt',
    CONSTRAINT check_dates CHECK (ngay_ket_thuc >= ngay_bat_dau)
);

-- 9. BẢNG NGUYÊN LIỆU (nguyenlieu)
CREATE TABLE public.nguyenlieu (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('ing_'),
    ten_nguyen_lieu TEXT NOT NULL UNIQUE,
    don_vi_tinh TEXT NOT NULL,
    so_luong_ton NUMERIC NOT NULL DEFAULT 0,
    ton_dau_ngay NUMERIC NOT NULL DEFAULT 0,
    muc_canh_bao NUMERIC,
    quy_cach TEXT,
    don_gia_nhap NUMERIC DEFAULT 0
);

-- 10. BẢNG CÔNG THỨC PHA CHẾ (congthuc)
CREATE TABLE public.congthuc (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('rec_'),
    id_san_pham TEXT REFERENCES public.sanpham(id) ON DELETE CASCADE NOT NULL,
    id_nguyen_lieu TEXT REFERENCES public.nguyenlieu(id) ON DELETE CASCADE NOT NULL,
    so_luong_can NUMERIC NOT NULL CHECK (so_luong_can > 0),
    don_vi_tinh TEXT NOT NULL
);

-- 11. BẢNG LỊCH SỬ KHO & NHẬP XUẤT (lichsukho)
CREATE TABLE public.lichsukho (
    id TEXT PRIMARY KEY DEFAULT public.generate_short_id('inv_'),
    id_nguyen_lieu TEXT REFERENCES public.nguyenlieu(id) ON DELETE CASCADE,
    ten_nguyen_lieu_khac TEXT,
    so_luong_thay_doi NUMERIC NOT NULL,
    loai_giao_dich TEXT NOT NULL CHECK (loai_giao_dich IN ('Nhập kho', 'Bán hàng', 'Hao hụt/Cân lại', 'Khác')),
    chi_phi NUMERIC DEFAULT 0,
    ghi_chu TEXT,
    id_nhan_vien TEXT REFERENCES public.nguoidung(id) ON DELETE SET NULL,
    thoi_gian_tao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối')) DEFAULT 'Đã duyệt'
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
ALTER TABLE public.nguyenlieu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congthuc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lichsukho ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Cho phép đọc bảng nguyenlieu công khai" ON public.nguyenlieu FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng nguyenlieu công khai" ON public.nguyenlieu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng congthuc công khai" ON public.congthuc FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng congthuc công khai" ON public.congthuc FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép đọc bảng lichsukho công khai" ON public.lichsukho FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng lichsukho công khai" ON public.lichsukho FOR ALL USING (true) WITH CHECK (true);

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
('c_soda', 'Soda'),
('c_nuocngot', 'Nước ngọt/suối')
ON CONFLICT (ten_danh_muc) DO NOTHING;

-- 4. Thêm sản phẩm mẫu (SanPham - Đã đổi Cà phê đen -> Cà phê đá, Cacao -> Cacao sữa)
INSERT INTO public.sanpham (id, id_danh_muc, ten_san_pham, don_vi_tinh, don_gia, gia_von, hinh_anh, trang_thai) VALUES
-- Cà phê (CP)
('CP001', 'c_caphe', 'Cà phê đá', 'Ly', 15000, 5000, '/products/CP001.png', 'Còn hàng'),
('CP002', 'c_caphe', 'Cà phê sữa', 'Ly', 17000, 6000, '/products/CP002.png', 'Còn hàng'),
('CP003', 'c_caphe', 'Cà phê sữa tươi', 'Ly', 22000, 8000, '/products/CP003.png', 'Còn hàng'),
('CP004', 'c_caphe', 'Cà phê muối', 'Ly', 22000, 8000, '/products/CP004.png', 'Còn hàng'),
('CP005', 'c_caphe', 'Bạc xìu', 'Ly', 22000, 8000, '/products/CP005.png', 'Còn hàng'),

-- Thức uống khác (TUK)
('TUK001', 'c_douongkhac', 'Cacao sữa', 'Ly', 20000, 7000, '/products/TUK001.png', 'Còn hàng'),
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
('S003', 'c_soda', 'Soda việt quất', 'Ly', 25000, 9000, '/products/S003.png', 'Còn hàng'),

-- Nước ngọt/suối (N)
('N001', 'c_nuocngot', '7-Up', 'lon', 15000, 5000, '/products/N001.jpg', 'Còn hàng'),
('N002', 'c_nuocngot', 'Bò Húc', 'lon', 20000, 8000, '/products/N002.jpg', 'Còn hàng'),
('N003', 'c_nuocngot', 'Coca', 'lon', 15000, 5000, '/products/N003.jpg', 'Còn hàng'),
('N004', 'c_nuocngot', 'Number 1', 'chai', 15000, 5000, '/products/N004.jpg', 'Còn hàng'),
('N005', 'c_nuocngot', 'Nước suối', 'chai', 10000, 3000, '/products/N005.jpg', 'Còn hàng'),
('N006', 'c_nuocngot', 'Pepsi', 'lon', 15000, 5000, '/products/N006.jpg', 'Còn hàng'),
('N007', 'c_nuocngot', 'Revive', 'chai', 15000, 5000, '/products/N007.jpg', 'Còn hàng'),
('N008', 'c_nuocngot', 'Sting', 'lon', 15000, 5000, '/products/N008.jpg', 'Còn hàng')
ON CONFLICT (id) DO UPDATE 
SET ten_san_pham = EXCLUDED.ten_san_pham, 
    don_gia = EXCLUDED.don_gia, 
    gia_von = EXCLUDED.gia_von, 
    hinh_anh = EXCLUDED.hinh_anh, 
    trang_thai = EXCLUDED.trang_thai;

-- 5. Thêm Nguyên Liệu (NguyenLieu - Khớp 100% file nguyên liệu AVA)
INSERT INTO public.nguyenlieu (id, ten_nguyen_lieu, don_vi_tinh, so_luong_ton, ton_dau_ngay, muc_canh_bao, quy_cach) VALUES
('ing_caphe', 'Cà phê hạt AVA', 'g', 5000, 5000, 1000, '1kg'),
('ing_cacao', 'Cacao AVA', 'g', 1000, 1000, 200, '1kg'),
('ing_matcha', 'Bột Matcha', 'g', 500, 500, 50, '200g'),
('ing_hongtra', 'Hồng trà', 'g', 1500, 1500, 300, '30g'),
('ing_suadac', 'Sữa đặc', 'g', 6420, 6420, 1284, '1284g'),
('ing_suatuoi', 'Sữa tươi', 'ml', 5000, 5000, 2000, '1000ml'),
('ing_lyden', 'Ly đen AVA', 'cái', 200, 200, 50, 'cái'),
('ing_lytrang', 'Ly trắng AVA', 'cái', 200, 200, 50, 'cái'),
('ing_lyhoavan', 'Ly trắng hoa văn AVA', 'cái', 200, 200, 50, 'cái'),
('ing_muong', 'Muỗng', 'bịch', 5, 5, NULL, 'bịch'),
('ing_tuimangdi', 'Túi mang đi', 'kg', 5, 5, NULL, '1kg'),
('ing_duong', 'Đường', 'g', 5000, 5000, 1000, '1000g'),
('ing_kembeo', 'Kem béo', 'hộp', 5, 5, 1, 'hộp'),
('ing_suachua', 'Sữa chua', 'hộp', 20, 20, 4, 'hộp'),
('ing_mutdau', 'Mứt dâu', 'ml', 1000, 1000, 200, 'ml'),
('ing_mutvietquat', 'Mứt việt quất', 'ml', 1000, 1000, 200, 'ml'),
('ing_mutdao', 'Mứt đào', 'ml', 1000, 1000, 200, 'ml'),
('ing_sirodau', 'Siro dâu', 'ml', 1000, 1000, 200, 'ml'),
('ing_sirodao', 'Siro đào', 'ml', 1000, 1000, 200, 'ml'),
('ing_sirovai', 'Siro vải', 'ml', 1000, 1000, 200, 'ml'),
('ing_7up', '7-Up', 'chai', 24, 24, 10, '390ml'),
('ing_n001', '7-Up (lon)', 'lon', 24, 24, 2, 'lon'),
('ing_n002', 'Bò Húc (lon)', 'lon', 24, 24, 2, 'lon'),
('ing_n003', 'Coca (lon)', 'lon', 24, 24, 2, 'lon'),
('ing_n004', 'Number 1 (chai)', 'chai', 24, 24, 2, 'chai'),
('ing_n005', 'Nước suối (chai)', 'chai', 24, 24, 2, 'chai'),
('ing_n006', 'Pepsi (lon)', 'lon', 24, 24, 2, 'lon'),
('ing_n007', 'Revive (chai)', 'chai', 24, 24, 2, 'chai'),
('ing_n008', 'Sting (lon)', 'lon', 24, 24, 2, 'lon'),
('ing_lytratac', 'Ly trà tắc', 'cái', 200, 200, 2, 'cái'),
('ing_muoibien', 'Topping Muối biển', 'bịch', 5, 5, 2, '500g')
ON CONFLICT (id) DO UPDATE
SET ten_nguyen_lieu = EXCLUDED.ten_nguyen_lieu,
    don_vi_tinh = EXCLUDED.don_vi_tinh,
    muc_canh_bao = EXCLUDED.muc_canh_bao,
    quy_cach = EXCLUDED.quy_cach;

-- 6. Thêm Công Thức Pha Chế (CongThuc - Công thức quy đổi trực tiếp nguyên liệu thô)
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
-- 1. Cà phê đá
('rec_cp1_1', 'CP001', 'ing_caphe', 18, 'g'),
('rec_cp1_duong', 'CP001', 'ing_duong', 8.33, 'g'),
('rec_cp1_3', 'CP001', 'ing_lyden', 1, 'cái'),

-- 2. Cà phê sữa
('rec_cp2_1', 'CP002', 'ing_caphe', 18, 'g'),
('rec_cp2_2', 'CP002', 'ing_suadac', 30, 'g'),
('rec_cp2_3', 'CP002', 'ing_lytrang', 1, 'cái'),

-- 3. Cà phê sữa tươi
('rec_cp3_1', 'CP003', 'ing_caphe', 11, 'g'),
('rec_cp3_2', 'CP003', 'ing_suadac', 25, 'g'),
('rec_cp3_3', 'CP003', 'ing_suatuoi', 100, 'ml'),
('rec_cp3_4', 'CP003', 'ing_lytrang', 1, 'cái'),

-- 4. Cà phê muối (60ml kem muối → NL thô)
('rec_cp4_1', 'CP004', 'ing_caphe', 18, 'g'),
('rec_cp4_2', 'CP004', 'ing_suadac', 30, 'g'),
('rec_cp4_kembeo', 'CP004', 'ing_kembeo', 0.0667, 'hộp'),
('rec_cp4_suadac_km', 'CP004', 'ing_suadac', 1.33, 'g'),
('rec_cp4_suatuoi_km', 'CP004', 'ing_suatuoi', 2, 'ml'),
('rec_cp4_4', 'CP004', 'ing_lytrang', 1, 'cái'),

-- 5. Bạc xỉu
('rec_cp5_1', 'CP005', 'ing_caphe', 11, 'g'),
('rec_cp5_2', 'CP005', 'ing_suadac', 40, 'g'),
('rec_cp5_3', 'CP005', 'ing_suatuoi', 50, 'ml'),
('rec_cp5_4', 'CP005', 'ing_lytrang', 1, 'cái'),

-- 6. Cacao sữa
('rec_tuk1_1', 'TUK001', 'ing_cacao', 10, 'g'),
('rec_tuk1_2', 'TUK001', 'ing_suadac', 40, 'g'),
('rec_tuk1_3', 'TUK001', 'ing_suatuoi', 30, 'ml'),
('rec_tuk1_4', 'TUK001', 'ing_lytrang', 1, 'cái'),

-- 7. Cacao kem muối (60ml kem muối → NL thô)
('rec_tuk2_1', 'TUK002', 'ing_cacao', 10, 'g'),
('rec_tuk2_2', 'TUK002', 'ing_suadac', 40, 'g'),
('rec_tuk2_3', 'TUK002', 'ing_suatuoi', 30, 'ml'),
('rec_tuk2_kembeo', 'TUK002', 'ing_kembeo', 0.0667, 'hộp'),
('rec_tuk2_suadac_km', 'TUK002', 'ing_suadac', 1.33, 'g'),
('rec_tuk2_suatuoi_km', 'TUK002', 'ing_suatuoi', 2, 'ml'),
('rec_tuk2_5', 'TUK002', 'ing_lytrang', 1, 'cái'),

-- 8. Matcha Latte
('rec_tuk3_1', 'TUK003', 'ing_matcha', 3.5, 'g'),
('rec_tuk3_2', 'TUK003', 'ing_suadac', 30, 'g'),
('rec_tuk3_3', 'TUK003', 'ing_suatuoi', 100, 'ml'),
('rec_tuk3_4', 'TUK003', 'ing_lytrang', 1, 'cái'),

-- 9. Matcha Latte kem muối (60ml kem muối → NL thô)
('rec_tuk4_1', 'TUK004', 'ing_matcha', 3.5, 'g'),
('rec_tuk4_2', 'TUK004', 'ing_suadac', 30, 'g'),
('rec_tuk4_3', 'TUK004', 'ing_suatuoi', 100, 'ml'),
('rec_tuk4_kembeo', 'TUK004', 'ing_kembeo', 0.0667, 'hộp'),
('rec_tuk4_suadac_km', 'TUK004', 'ing_suadac', 1.33, 'g'),
('rec_tuk4_suatuoi_km', 'TUK004', 'ing_suatuoi', 2, 'ml'),
('rec_tuk4_5', 'TUK004', 'ing_lytrang', 1, 'cái'),

-- 10. Trà tắc (300ml cốt trà → 1.875 bịch hồng trà)
('rec_t1_hongtra', 'T001', 'ing_hongtra', 1.875, 'bịch'),

-- 11. Trà dâu
('rec_t2_hongtra', 'T002', 'ing_hongtra', 0.9375, 'bịch'),
('rec_t2_2', 'T002', 'ing_sirodau', 30, 'ml'),
('rec_t2_duong', 'T002', 'ing_duong', 16.67, 'g'),
('rec_t2_4', 'T002', 'ing_lyhoavan', 1, 'cái'),

-- 12. Trà đào
('rec_t3_hongtra', 'T003', 'ing_hongtra', 0.9375, 'bịch'),
('rec_t3_2', 'T003', 'ing_sirodao', 30, 'ml'),
('rec_t3_duong', 'T003', 'ing_duong', 16.67, 'g'),
('rec_t3_4', 'T003', 'ing_lyhoavan', 1, 'cái'),

-- 13. Trà vải
('rec_t4_hongtra', 'T004', 'ing_hongtra', 0.9375, 'bịch'),
('rec_t4_2', 'T004', 'ing_sirovai', 30, 'ml'),
('rec_t4_duong', 'T004', 'ing_duong', 16.67, 'g'),
('rec_t4_4', 'T004', 'ing_lyhoavan', 1, 'cái'),

-- 14. Yaourt đá
('rec_y1_1', 'Y001', 'ing_suachua', 1, 'hộp'),
('rec_y1_2', 'Y001', 'ing_suadac', 50, 'g'),
('rec_y1_3', 'Y001', 'ing_lytrang', 1, 'cái'),

-- 15. Yaourt dâu
('rec_y2_1', 'Y002', 'ing_suachua', 1, 'hộp'),
('rec_y2_2', 'Y002', 'ing_suadac', 30, 'g'),
('rec_y2_3', 'Y002', 'ing_mutdau', 50, 'ml'),
('rec_y2_4', 'Y002', 'ing_lytrang', 1, 'cái'),

-- 16. Yaourt việt quất
('rec_y3_1', 'Y003', 'ing_suachua', 1, 'hộp'),
('rec_y3_2', 'Y003', 'ing_suadac', 30, 'g'),
('rec_y3_3', 'Y003', 'ing_mutvietquat', 50, 'ml'),
('rec_y3_4', 'Y003', 'ing_lytrang', 1, 'cái'),

-- 17. Soda dâu (0.5 chai 7-Up = 195ml)
('rec_s1_1', 'S001', 'ing_7up', 0.5, 'chai'),
('rec_s1_2', 'S001', 'ing_mutdau', 40, 'ml'),
('rec_s1_3', 'S001', 'ing_sirodau', 10, 'ml'),
('rec_s1_duong', 'S001', 'ing_duong', 8.33, 'g'),
('rec_s1_5', 'S001', 'ing_lyhoavan', 1, 'cái'),

-- 18. Soda đào
('rec_s2_1', 'S002', 'ing_7up', 0.5, 'chai'),
('rec_s2_2', 'S002', 'ing_mutdao', 30, 'ml'),
('rec_s2_3', 'S002', 'ing_sirodao', 20, 'ml'),
('rec_s2_duong', 'S002', 'ing_duong', 8.33, 'g'),
('rec_s2_5', 'S002', 'ing_lyhoavan', 1, 'cái'),

-- 19. Soda việt quất
('rec_s3_1', 'S003', 'ing_7up', 0.5, 'chai'),
('rec_s3_2', 'S003', 'ing_mutvietquat', 50, 'ml'),
('rec_s3_duong', 'S003', 'ing_duong', 8.33, 'g'),
('rec_s3_4', 'S003', 'ing_lyhoavan', 1, 'cái'),

--20. Nước ngọt/suối
('rec_n1', 'N001', 'ing_n001', 1, 'lon'),
('rec_n2', 'N002', 'ing_n002', 1, 'lon'),
('rec_n3', 'N003', 'ing_n003', 1, 'lon'),
('rec_n4', 'N004', 'ing_n004', 1, 'chai'),
('rec_n5', 'N005', 'ing_n005', 1, 'chai'),
('rec_n6', 'N006', 'ing_n006', 1, 'lon'),
('rec_n7', 'N007', 'ing_n007', 1, 'chai'),
('rec_n8', 'N008', 'ing_n008', 1, 'lon')
ON CONFLICT (id) DO NOTHING;

-- DATABASE INDEXES (Tối ưu tốc độ truy vấn báo cáo)
CREATE INDEX IF NOT EXISTS idx_hoadon_ngay_tao ON public.hoadon (ngay_tao);
CREATE INDEX IF NOT EXISTS idx_lichsukho_nguyen_lieu_thoi_gian ON public.lichsukho (id_nguyen_lieu, thoi_gian_tao);
CREATE INDEX IF NOT EXISTS idx_chamcong_nhan_vien_gio_vao ON public.chamcong (id_nhan_vien, gio_vao);
