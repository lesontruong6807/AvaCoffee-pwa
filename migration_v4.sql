-- MIGRATION V4: CẬP NHẬT CÔNG THỨC TRÀ TẮC & CÀ PHÊ SỮA TƯƠI & CACAO/MATCHA KEM MUỐI

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
