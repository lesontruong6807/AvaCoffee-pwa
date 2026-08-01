-- 1. BẢNG PHIẾU NHẬP KHO (Quản lý các đợt nhập nguyên liệu)
CREATE TABLE IF NOT EXISTS public.phieunhapkho (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ma_phieu TEXT NOT NULL UNIQUE,
    id_nhan_vien TEXT REFERENCES public.nguoidung(id),
    nha_cung_cap TEXT,
    tong_tien NUMERIC NOT NULL DEFAULT 0,
    ghi_chu TEXT,
    ngay_nhap TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BẢNG CHI TIẾT PHIẾU NHẬP KHO
CREATE TABLE IF NOT EXISTS public.chitietnhapkho (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    id_phieu_nhap TEXT NOT NULL REFERENCES public.phieunhapkho(id) ON DELETE CASCADE,
    id_nguyen_lieu TEXT NOT NULL REFERENCES public.nguyenlieu(id),
    so_luong NUMERIC NOT NULL,
    don_gia_nhap NUMERIC NOT NULL,
    thanh_tien NUMERIC NOT NULL
);

-- 3. BẢNG CHI PHÍ VẬN HÀNH (Mặt bằng, điện, nước, chi phí khác)
CREATE TABLE IF NOT EXISTS public.chiphivanhang (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ten_chi_phi TEXT NOT NULL,
    loai_chi_phi TEXT DEFAULT 'bien_dong', -- 'co_dinh' hoặc 'bien_dong'
    so_tien NUMERIC NOT NULL,
    ngay_chi DATE NOT NULL DEFAULT CURRENT_DATE,
    id_nhan_vien TEXT REFERENCES public.nguoidung(id),
    ghi_chu TEXT
);

-- 4. BỔ SUNG CỘT BẮT BUỘC VÀO CÁC BẢNG CŨ
ALTER TABLE public.nguyenlieu 
ADD COLUMN IF NOT EXISTS gia_von_trung_binh NUMERIC DEFAULT 0;

ALTER TABLE public.hoadondetail 
ADD COLUMN IF NOT EXISTS gia_von NUMERIC DEFAULT 0;

-- 5. INITIALIZE GIA_VON_TRUNG_BINH CHO CÁC NGUYÊN LIỆU HIỆN CÓ
UPDATE public.nguyenlieu 
SET gia_von_trung_binh = COALESCE(don_gia_nhap, 0) 
WHERE gia_von_trung_binh IS NULL OR gia_von_trung_binh = 0;

-- 6. TRIGGER FUNCTION TỰ ĐỘNG CẬP NHẬT GIÁ VỐN BÌNH QUÂN NGUYÊN LIỆU (MOVING AVERAGE)
CREATE OR REPLACE FUNCTION public.cap_nhat_gia_von_nguyen_lieu()
RETURNS TRIGGER AS $$
DECLARE
    v_ton_hien_tai NUMERIC;
    v_gia_von_cu NUMERIC;
    v_gia_von_moi NUMERIC;
BEGIN
    -- Lấy tồn kho và giá vốn cũ trước khi cộng lượng nhập mới
    SELECT COALESCE(so_luong_ton, 0), COALESCE(gia_von_trung_binh, don_gia_nhap, 0)
    INTO v_ton_hien_tai, v_gia_von_cu
    FROM public.nguyenlieu WHERE id = NEW.id_nguyen_lieu;

    -- Tính giá vốn bình quân di động mới
    IF (v_ton_hien_tai + NEW.so_luong) > 0 THEN
        v_gia_von_moi := ((v_ton_hien_tai * v_gia_von_cu) + (NEW.so_luong * NEW.don_gia_nhap)) / (v_ton_hien_tai + NEW.so_luong);
    ELSE
        v_gia_von_moi := NEW.don_gia_nhap;
    END IF;

    -- Cập nhật lại kho và giá vốn trong bảng nguyenlieu
    UPDATE public.nguyenlieu
    SET so_luong_ton = so_luong_ton + NEW.so_luong,
        gia_von_trung_binh = v_gia_von_moi,
        don_gia_nhap = NEW.don_gia_nhap
    WHERE id = NEW.id_nguyen_lieu;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tự động chạy khi insert vào chitietnhapkho
DROP TRIGGER IF EXISTS trg_cap_nhat_gia_von ON public.chitietnhapkho;
CREATE TRIGGER trg_cap_nhat_gia_von
AFTER INSERT ON public.chitietnhapkho
FOR EACH ROW EXECUTE FUNCTION public.cap_nhat_gia_von_nguyen_lieu();

-- 7. FUNCTION TÍNH TOÁN LẠI GIÁ VỐN SẢN PHẨM DỰA TRÊN GIA_VON_TRUNG_BINH
CREATE OR REPLACE FUNCTION public.fn_recalculate_product_cost(p_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
    r RECORD;
    v_total_cost NUMERIC := 0;
BEGIN
    FOR r IN 
        SELECT c.so_luong_can, COALESCE(n.gia_von_trung_binh, n.don_gia_nhap, 0) as gia_von_nguyen_lieu
        FROM public.congthuc c
        JOIN public.nguyenlieu n ON c.id_nguyen_lieu = n.id
        WHERE c.id_san_pham = p_id
    LOOP
        v_total_cost := v_total_cost + (r.so_luong_can * r.gia_von_nguyen_lieu);
    END LOOP;

    -- Cập nhật vào bảng sanpham
    UPDATE public.sanpham 
    SET gia_von = v_total_cost 
    WHERE id = p_id;

    RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER FUNCTION KHI THAY ĐỔI ĐƠN GIÁ HOẶC GIÁ VỐN TRUNG BÌNH CỦA NGUYÊN LIỆU
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
AFTER UPDATE OF gia_von_trung_binh, don_gia_nhap ON public.nguyenlieu
FOR EACH ROW
EXECUTE FUNCTION public.tg_recalculate_cost_on_ingredient_change();

-- 9. CHẠY CẬP NHẬT GIÁ VỐN LẦN ĐẦU TIÊN CHO TẤT CẢ SẢN PHẨM ĐANG CÓ
DO $$
DECLARE
    prod RECORD;
BEGIN
    FOR prod IN SELECT id FROM public.sanpham LOOP
        PERFORM public.fn_recalculate_product_cost(prod.id);
    END LOOP;
END;
$$;
