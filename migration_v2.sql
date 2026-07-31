-- ====================================================================
-- SCRIPT MIGRATION/UPDATE CHO SUPABASE (KHÔNG LÀM MẤT DỮ LIỆU ĐANG CÓ)
-- Hãy copy và chạy script này trong SQL Editor của Supabase.
-- ====================================================================

-- 1. Thêm cột đơn giá nhập vào bảng nguyenlieu nếu chưa tồn tại
ALTER TABLE public.nguyenlieu ADD COLUMN IF NOT EXISTS don_gia_nhap NUMERIC DEFAULT 0;

-- 2. Cập nhật lại Check Constraint cho cột loai_giao_dich trong bảng lichsukho
-- Bỏ constraint cũ (nếu có) và thiết lập danh sách hợp lệ mới bao gồm 'Khác'
ALTER TABLE public.lichsukho DROP CONSTRAINT IF EXISTS lichsukho_loai_giao_dich_check;
ALTER TABLE public.lichsukho ADD CONSTRAINT lichsukho_loai_giao_dich_check CHECK (loai_giao_dich IN ('Nhập kho', 'Bán hàng', 'Hao hụt/Cân lại', 'Khác'));

-- 3. Xóa các dòng công thức, lịch sử kho và bản ghi nguyên liệu của 3 nguyên liệu trung gian
DELETE FROM public.congthuc WHERE id_nguyen_lieu IN ('ing_nuocduong', 'ing_nuoccothongtra', 'ing_kemmuoi');
DELETE FROM public.lichsukho WHERE id_nguyen_lieu IN ('ing_nuocduong', 'ing_nuoccothongtra', 'ing_kemmuoi');
DELETE FROM public.nguyenlieu WHERE id IN ('ing_nuocduong', 'ing_nuoccothongtra', 'ing_kemmuoi');

-- 4. Cập nhật tên, đơn vị và quy cách của các nguyên liệu hiện có
-- Hồng trà
UPDATE public.nguyenlieu 
SET don_vi_tinh = 'bịch', quy_cach = '150g', muc_canh_bao = 2 
WHERE id = 'ing_hongtra';

-- Sữa đặc
UPDATE public.nguyenlieu 
SET don_vi_tinh = 'hộp', quy_cach = '1284g', muc_canh_bao = 1 
WHERE id = 'ing_suadac';

-- Muối hồng đổi thành Muối Iot
UPDATE public.nguyenlieu 
SET ten_nguyen_lieu = 'Muối Iot', don_vi_tinh = 'g', quy_cach = '500g', muc_canh_bao = 10 
WHERE id = 'ing_muoihong';

-- Ống hút thường đổi thành Ống hút đen
UPDATE public.nguyenlieu 
SET ten_nguyen_lieu = 'Ống hút đen' 
WHERE id = 'ing_onghutthuong';

-- Ống hút trái cây đổi thành Ống hút trắng (nhỏ)
UPDATE public.nguyenlieu 
SET ten_nguyen_lieu = 'Ống hút trắng (nhỏ)' 
WHERE id = 'ing_onghuttraicay';

-- 7-Up chai đổi quy cách
UPDATE public.nguyenlieu 
SET quy_cach = '390ml' 
WHERE id = 'ing_7up';

-- 5. Thêm các nguyên liệu mới vào bảng nguyenlieu
INSERT INTO public.nguyenlieu (id, ten_nguyen_lieu, don_vi_tinh, so_luong_ton, ton_dau_ngay, muc_canh_bao, quy_cach) VALUES
('ing_lytratac', 'Ly trà tắc', 'cái', 200, 200, 2, 'cái'),
('ing_muoibien', 'Topping Muối biển', 'bịch', 5, 5, 2, '500g'),
('ing_onghuttrangto', 'Ống hút trắng (to)', 'bịch', 5, 5, 2, 'bịch')
ON CONFLICT (id) DO NOTHING;

-- 6. Thêm các công thức quy đổi trực tiếp nguyên liệu thô cho các sản phẩm uống
-- (Các dòng mới thay thế cho 3 nguyên liệu trung gian đã xóa ở bước 3)

-- Cà phê đá
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_cp1_duong', 'CP001', 'ing_duong', 8.33, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Cà phê muối
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_cp4_kembeo', 'CP004', 'ing_kembeo', 0.0667, 'hộp'),
('rec_cp4_suadac_km', 'CP004', 'ing_suadac', 1.33, 'g'),
('rec_cp4_suatuoi_km', 'CP004', 'ing_suatuoi', 2, 'ml'),
('rec_cp4_muoi', 'CP004', 'ing_muoihong', 0.33, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Cacao kem muối
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_tuk2_kembeo', 'TUK002', 'ing_kembeo', 0.0667, 'hộp'),
('rec_tuk2_suadac_km', 'TUK002', 'ing_suadac', 1.33, 'g'),
('rec_tuk2_suatuoi_km', 'TUK002', 'ing_suatuoi', 2, 'ml'),
('rec_tuk2_muoi', 'TUK002', 'ing_muoihong', 0.33, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Matcha Latte kem muối
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_tuk4_kembeo', 'TUK004', 'ing_kembeo', 0.0667, 'hộp'),
('rec_tuk4_suadac_km', 'TUK004', 'ing_suadac', 1.33, 'g'),
('rec_tuk4_suatuoi_km', 'TUK004', 'ing_suatuoi', 2, 'ml'),
('rec_tuk4_muoi', 'TUK004', 'ing_muoihong', 0.33, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Trà tắc
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_t1_hongtra', 'T001', 'ing_hongtra', 1.875, 'bịch')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Trà dâu
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_t2_hongtra', 'T002', 'ing_hongtra', 0.9375, 'bịch'),
('rec_t2_duong', 'T002', 'ing_duong', 16.67, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Trà đào
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_t3_hongtra', 'T003', 'ing_hongtra', 0.9375, 'bịch'),
('rec_t3_duong', 'T003', 'ing_duong', 16.67, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Trà vải
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_t4_hongtra', 'T004', 'ing_hongtra', 0.9375, 'bịch'),
('rec_t4_duong', 'T004', 'ing_duong', 16.67, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Soda dâu
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_s1_duong', 'S001', 'ing_duong', 8.33, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Soda đào
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_s2_duong', 'S002', 'ing_duong', 8.33, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- Soda việt quất
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh) VALUES
('rec_s3_duong', 'S003', 'ing_duong', 8.33, 'g')
ON CONFLICT (id) DO UPDATE SET so_luong_can = EXCLUDED.so_luong_can;

-- 7. Cập nhật lại số lượng lon 7-Up trong công thức Soda sang 0.5 lon (195ml)
UPDATE public.congthuc 
SET so_luong_can = 0.5 
WHERE id_nguyen_lieu = 'ing_7up' AND id_san_pham IN ('S001', 'S002', 'S003');

-- 8. Thiết lập các Database Indexes hỗ trợ tăng tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_hoadon_ngay_tao ON public.hoadon (ngay_tao);
CREATE INDEX IF NOT EXISTS idx_lichsukho_nguyen_lieu_thoi_gian ON public.lichsukho (id_nguyen_lieu, thoi_gian_tao);
CREATE INDEX IF NOT EXISTS idx_chamcong_nhan_vien_gio_vao ON public.chamcong (id_nhan_vien, gio_vao);

-- 9. THIẾT LẬP TỰ ĐỘNG TÍNH TOÁN GIÁ VỐN (AUTOMATIC COST RECALCULATION)

-- Cập nhật đơn giá nhập mẫu cho các nguyên liệu hiện tại (nếu chưa có giá)
UPDATE public.nguyenlieu SET don_gia_nhap = 200 WHERE id = 'ing_caphe' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 250 WHERE id = 'ing_cacao' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 600 WHERE id = 'ing_matcha' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 300 WHERE id = 'ing_trasanmay' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 30000 WHERE id = 'ing_hongtra' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 40000 WHERE id = 'ing_suadac' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 35 WHERE id = 'ing_suatuoi' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 1500 WHERE id = 'ing_lyden' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 1500 WHERE id = 'ing_lytrang' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 1500 WHERE id = 'ing_lyhoavan' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 20 WHERE id = 'ing_duong' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 30000 WHERE id = 'ing_kembeo' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 50 WHERE id = 'ing_muoihong' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);
UPDATE public.nguyenlieu SET don_gia_nhap = 10000 WHERE id = 'ing_7up' AND (don_gia_nhap IS NULL OR don_gia_nhap = 0);

-- Tạo hàm tính giá vốn của 1 sản phẩm
CREATE OR REPLACE FUNCTION public.fn_recalculate_product_cost(p_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
    v_total_cost NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(c.so_luong_can * n.don_gia_nhap), 0)
    INTO v_total_cost
    FROM public.congthuc c
    JOIN public.nguyenlieu n ON c.id_nguyen_lieu = n.id
    WHERE c.id_san_pham = p_id;

    -- Cập nhật trực tiếp vào trường gia_von của bảng sanpham
    UPDATE public.sanpham
    SET gia_von = ROUND(v_total_cost, 2)
    WHERE id = p_id;

    RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger function khi thay đổi đơn giá nhập của nguyên liệu
CREATE OR REPLACE FUNCTION public.tg_recalculate_cost_on_ingredient_change()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT DISTINCT id_san_pham 
        FROM public.congthuc 
        WHERE id_nguyen_lieu = NEW.id
    LOOP
        PERFORM public.fn_recalculate_product_cost(r.id_san_pham);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger trên bảng nguyenlieu
DROP TRIGGER IF EXISTS trg_recalculate_cost ON public.nguyenlieu;
CREATE TRIGGER trg_recalculate_cost
AFTER UPDATE OF don_gia_nhap ON public.nguyenlieu
FOR EACH ROW
EXECUTE FUNCTION public.tg_recalculate_cost_on_ingredient_change();

-- Chạy cập nhật giá vốn lần đầu tiên cho tất cả sản phẩm đang có
DO $$
DECLARE
    prod RECORD;
BEGIN
    FOR prod IN SELECT id FROM public.sanpham LOOP
        PERFORM public.fn_recalculate_product_cost(prod.id);
    END LOOP;
END;
$$;
