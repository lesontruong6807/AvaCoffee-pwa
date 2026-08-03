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

-- 9. Cập nhật đơn vị và quy cách Hồng trà (ing_hongtra) thành đơn vị gram (g) và bịch 30g
UPDATE public.nguyenlieu 
SET don_vi_tinh = 'g', quy_cach = '30g' 
WHERE id = 'ing_hongtra';

-- 10. Xóa công thức liên quan đến Muối Iot (ing_muoihong) để dọn dẹp khỏi kho
DELETE FROM public.congthuc 
WHERE id_nguyen_lieu = 'ing_muoihong';

-- 11. Xóa các nguyên liệu không dùng khỏi kho (Ống hút đen, Ống hút trắng nhỏ/to, Muối Iot, Trà săn mây)
DELETE FROM public.nguyenlieu 
WHERE id IN ('ing_onghutthuong', 'ing_onghuttraicay', 'ing_onghuttrangto', 'ing_muoihong', 'ing_trasanmay');
