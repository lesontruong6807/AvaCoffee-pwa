-- MIGRATION V4: CẬP NHẬT CÔNG THỨC TRÀ TẮC & CÀ PHÊ SỮA TƯƠI & CACAO/MATCHA KEM MUỐI & YAOURT & QUY CÁCH KHO & DỌN DẸP NGUYÊN LIỆU

-- 1. Cập nhật công thức Trà tắc (T001) thêm Ly trà tắc (ing_lytratac)
INSERT INTO public.congthuc (id, id_san_pham, id_nguyen_lieu, so_luong_can, don_vi_tinh)
VALUES (public.generate_short_id('rec_'), 'T001', 'ing_lytratac', 1, 'cái')
ON CONFLICT DO NOTHING;

-- 2. Cập nhật công thức Cà phê sữa tươi (CP003) đổi Ly trắng (ing_lytrang) thành Ly trắng hoa văn (ing_lyhoavan)
UPDATE public.congthuc 
SET id_nguyen_lieu = 'ing_lyhoavan' 
WHERE id_san_pham = 'CP003' AND id_nguyen_lieu = 'ing_lytrang';

-- 3. Cập nhật công thức Cacao kem muối (TUK002) đổi Ly hoa văn (ing_lyhoavan) thành Ly trắng (ing_lytrang)
UPDATE public.congthuc 
SET id_nguyen_lieu = 'ing_lytrang' 
WHERE id_san_pham = 'TUK002' AND id_nguyen_lieu = 'ing_lyhoavan';

-- 4. Cập nhật công thức Matcha Latte kem muối (TUK004) đổi Ly hoa văn (ing_lyhoavan) thành Ly trắng (ing_lytrang)
UPDATE public.congthuc 
SET id_nguyen_lieu = 'ing_lytrang' 
WHERE id_san_pham = 'TUK004' AND id_nguyen_lieu = 'ing_lyhoavan';

-- 5. Cập nhật công thức Yaourt đá (Y001) đổi Ly hoa văn (ing_lyhoavan) thành Ly trắng (ing_lytrang)
UPDATE public.congthuc 
SET id_nguyen_lieu = 'ing_lytrang' 
WHERE id_san_pham = 'Y001' AND id_nguyen_lieu = 'ing_lyhoavan';

-- 6. Cập nhật công thức Yaourt dâu (Y002) đổi Ly hoa văn (ing_lyhoavan) thành Ly trắng (ing_lytrang)
UPDATE public.congthuc 
SET id_nguyen_lieu = 'ing_lytrang' 
WHERE id_san_pham = 'Y002' AND id_nguyen_lieu = 'ing_lyhoavan';

-- 7. Cập nhật công thức Yaourt việt quất (Y003) đổi Ly hoa văn (ing_lyhoavan) thành Ly trắng (ing_lytrang)
UPDATE public.congthuc 
SET id_nguyen_lieu = 'ing_lytrang' 
WHERE id_san_pham = 'Y003' AND id_nguyen_lieu = 'ing_lyhoavan';

-- 8. Cập nhật quy cách Bột Matcha (ing_matcha) thành bịch 200g
UPDATE public.nguyenlieu 
SET quy_cach = '200g' 
WHERE id = 'ing_matcha';

-- 9. Cập nhật đơn vị và quy cách Hồng trà (ing_hongtra) thành đơn vị bịch và quy cách 30g
UPDATE public.nguyenlieu 
SET don_vi_tinh = 'bịch', quy_cach = '30g' 
WHERE id = 'id' OR id = 'ing_hongtra';

-- 10. Cập nhật đơn vị 7-Up chai (ing_7up) thành đơn vị ml và quy cách chai 390ml
UPDATE public.nguyenlieu 
SET don_vi_tinh = 'ml', quy_cach = '390ml' 
WHERE id = 'ing_7up';

UPDATE public.congthuc 
SET so_luong_can = 195, don_vi_tinh = 'ml' 
WHERE id_nguyen_lieu = 'ing_7up';

-- 11. Xóa các công thức & nguyên liệu không dùng khỏi kho (Ống hút đen, Ống hút trắng nhỏ/to, Muối Iot, Trà săn mây)
DELETE FROM public.congthuc 
WHERE id_nguyen_lieu IN ('ing_muoihong', 'ing_onghutthuong', 'ing_onghuttraicay', 'ing_onghuttrangto', 'ing_trasanmay');

DELETE FROM public.nguyenlieu 
WHERE id IN ('ing_onghutthuong', 'ing_onghuttraicay', 'ing_onghuttrangto', 'ing_muoihong', 'ing_trasanmay');

-- 12. Dọn dẹp cột dư thừa ton_dau_ngay khỏi bảng nguyenlieu
ALTER TABLE public.nguyenlieu DROP COLUMN IF EXISTS ton_dau_ngay;
