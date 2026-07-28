-- SQL SCRIPT THÊM DỮ LIỆU THỬ NGHIỆM CHO AVA COFFEE
-- Dữ liệu giả lập trải dài từ ngày 20/07/2026 đến ngày 28/07/2026
-- Nhằm mục đích kiểm thử tính năng lọc khoảng ngày và xuất file Excel/PDF.

-- LƯU Ý: Chạy script này trong SQL Editor của Supabase.
-- Script này sẽ chèn thêm dữ liệu mà không làm ảnh hưởng đến dữ liệu cũ.

-- 1. Xóa các dữ liệu test cũ nếu có để tránh trùng khóa chính (ID)
DELETE FROM public.hoadondetail WHERE idhoadon LIKE 'ord_test%';
DELETE FROM public.hoadon WHERE id LIKE 'ord_test%';
DELETE FROM public.lichsukho WHERE id LIKE 'inv_test%';

-- 2. CHÈN HÓA ĐƠN VÀ CHI TIẾT HÓA ĐƠN (HÓA ĐƠN ĐÃ THANH TOÁN TRẢI DÀI)

-- ==========================================
-- NGÀY 20/07/2026
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test201', 'tb1', 'admin', 30000, 0, 'Đã thanh toán', 'Tiền mặt', '2026-07-20T08:30:00+07:00', '2026-07-20T08:45:00+07:00'),
('ord_test202', 'tb2', 'admin', 49000, 5000, 'Đã thanh toán', 'Chuyển khoản', '2026-07-20T14:10:00+07:00', '2026-07-20T14:35:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test201a', 'ord_test201', 'CP001', 'Cà phê đá', 'Ly', 15000, 2, 30000, ''),
('item_test202a', 'ord_test202', 'CP002', 'Cà phê sữa', 'Ly', 17000, 2, 34000, ''),
('item_test202b', 'ord_test202', 'TUK001', 'Cacao sữa', 'Ly', 20000, 1, 20000, 'Ít sữa');

-- ==========================================
-- NGÀY 21/07/2026
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test211', 'tb3', 'admin', 15000, 0, 'Đã thanh toán', 'Tiền mặt', '2026-07-21T09:15:00+07:00', '2026-07-21T09:20:00+07:00'),
('ord_test212', 'tb7', 'admin', 69000, 10000, 'Đã thanh toán', 'Chuyển khoản', '2026-07-21T19:30:00+07:00', '2026-07-21T19:50:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test211a', 'ord_test211', 'T001', 'Trà tắc', 'Ly', 15000, 1, 15000, ''),
('item_test212a', 'ord_test212', 'CP003', 'Cà phê sữa tươi', 'Ly', 22000, 2, 44000, ''),
('item_test212b', 'ord_test212', 'TUK002', 'Cacao kem muối', 'Ly', 25000, 1, 25000, 'Kem béo ngậy');

-- ==========================================
-- NGÀY 22/07/2026
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test221', 'tb4', 'admin', 35000, 0, 'Đã thanh toán', 'Tiền mặt', '2026-07-22T10:00:00+07:00', '2026-07-22T10:15:00+07:00'),
('ord_test222', 'tb5', 'admin', 75000, 0, 'Đã thanh toán', 'Chuyển khoản', '2026-07-22T15:45:00+07:00', '2026-07-22T16:00:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test221a', 'ord_test221', 'CP001', 'Cà phê đá', 'Ly', 15000, 1, 15000, ''),
('item_test221b', 'ord_test221', 'Y001', 'Yaourt đá', 'Ly', 20000, 1, 20000, ''),
('item_test222a', 'ord_test222', 'T002', 'Trà dâu', 'Ly', 25000, 3, 75000, '');

-- ==========================================
-- NGÀY 23/07/2026
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test231', 'tb1', 'admin', 44000, 0, 'Đã thanh toán', 'Tiền mặt', '2026-07-23T08:00:00+07:00', '2026-07-23T08:10:00+07:00'),
('ord_test232', 'tb6', 'admin', 92000, 8000, 'Đã thanh toán', 'Chuyển khoản', '2026-07-23T21:00:00+07:00', '2026-07-23T21:20:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test231a', 'ord_test231', 'CP004', 'Cà phê muối', 'Ly', 22000, 2, 44000, ''),
('item_test232a', 'ord_test232', 'S001', 'Soda dâu', 'Ly', 25000, 2, 50000, ''),
('item_test232b', 'ord_test232', 'TUK003', 'Matcha Latte', 'Ly', 25000, 2, 50000, '');

-- ==========================================
-- NGÀY 24/07/2026
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test241', 'tb2', 'admin', 42000, 5000, 'Đã thanh toán', 'Chuyển khoản', '2026-07-24T12:00:00+07:00', '2026-07-24T12:15:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test241a', 'ord_test241', 'CP002', 'Cà phê sữa', 'Ly', 17000, 1, 17000, ''),
('item_test241b', 'ord_test241', 'T003', 'Trà đào', 'Ly', 25000, 1, 25000, '');

-- ==========================================
-- NGÀY 25/07/2026
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test251', 'tb3', 'admin', 60000, 0, 'Đã thanh toán', 'Tiền mặt', '2026-07-25T15:30:00+07:00', '2026-07-25T15:45:00+07:00'),
('ord_test252', 'tb7', 'admin', 35000, 5000, 'Đã thanh toán', 'Chuyển khoản', '2026-07-25T17:00:00+07:00', '2026-07-25T17:10:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test251a', 'ord_test251', 'TUK003', 'Matcha Latte', 'Ly', 25000, 1, 25000, ''),
('item_test251b', 'ord_test251', 'Y002', 'Yaourt dâu', 'Ly', 25000, 1, 25000, ''),
('item_test251c', 'ord_test251', 'CP001', 'Cà phê đá', 'Ly', 15000, 1, 15000, ''),
('item_test252a', 'ord_test252', 'TUK004', 'Matcha Latte kem muối', 'Ly', 30000, 1, 30000, ''),
('item_test252b', 'ord_test252', 'T001', 'Trà tắc', 'Ly', 15000, 1, 15000, '');

-- ==========================================
-- NGÀY 26/07/2026
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test261', 'tb4', 'admin', 50000, 0, 'Đã thanh toán', 'Tiền mặt', '2026-07-26T09:00:00+07:00', '2026-07-26T09:10:00+07:00'),
('ord_test262', 'tb5', 'admin', 47000, 3000, 'Đã thanh toán', 'Chuyển khoản', '2026-07-26T16:20:00+07:00', '2026-07-26T16:30:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test261a', 'ord_test261', 'T003', 'Trà đào', 'Ly', 25000, 2, 50000, ''),
('item_test262a', 'ord_test262', 'CP005', 'Bạc xìu', 'Ly', 22000, 1, 22000, ''),
('item_test262b', 'ord_test262', 'TUK002', 'Cacao kem muối', 'Ly', 25000, 1, 25000, '');

-- ==========================================
-- NGÀY 27/07/2026
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test271', 'tb1', 'admin', 30000, 0, 'Đã thanh toán', 'Tiền mặt', '2026-07-27T10:15:00+07:00', '2026-07-27T10:25:00+07:00'),
('ord_test272', 'tb6', 'admin', 80000, 10000, 'Đã thanh toán', 'Chuyển khoản', '2026-07-27T20:30:00+07:00', '2026-07-27T20:45:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test271a', 'ord_test271', 'CP001', 'Cà phê đá', 'Ly', 15000, 2, 30000, ''),
('item_test272a', 'ord_test272', 'T004', 'Trà vải', 'Ly', 25000, 2, 50000, ''),
('item_test272b', 'ord_test272', 'S003', 'Soda việt quất', 'Ly', 25000, 1, 25000, ''),
('item_test272c', 'ord_test272', 'CP001', 'Cà phê đá', 'Ly', 15000, 1, 15000, '');

-- ==========================================
-- NGÀY 28/07/2026 (HÔM NAY)
-- ==========================================
INSERT INTO public.hoadon (id, id_ban, id_nhan_vien, tong_tien, giam_gia, trang_thai_thanh_toan, phuong_thuc_thanh_toan, ngay_tao, ngay_thanh_toan)
VALUES 
('ord_test281', 'tb2', 'admin', 37000, 0, 'Đã thanh toán', 'Tiền mặt', '2026-07-28T09:00:00+07:00', '2026-07-28T09:10:00+07:00'),
('ord_test282', 'tb7', 'admin', 65000, 5000, 'Đã thanh toán', 'Chuyển khoản', '2026-07-28T15:20:00+07:00', '2026-07-28T15:35:00+07:00');

INSERT INTO public.hoadondetail (id, idhoadon, idsp, ten_san_pham, don_vi_tinh, don_gia, so_luong, thanh_tien, ghi_chu)
VALUES
('item_test281a', 'ord_test281', 'CP002', 'Cà phê sữa', 'Ly', 17000, 1, 17000, ''),
('item_test281b', 'ord_test281', 'Y001', 'Yaourt đá', 'Ly', 20000, 1, 20000, ''),
('item_test282a', 'ord_test282', 'T003', 'Trà đào', 'Ly', 25000, 2, 50000, ''),
('item_test282b', 'ord_test282', 'CP001', 'Cà phê đá', 'Ly', 15000, 1, 15000, '');



-- 3. CHÈN LỊCH SỬ KHO (LỊCH SỬ NHẬP XUẤT NGUYÊN LIỆU KHO TRẢI DÀI)

-- ==========================================
-- NGÀY 20/07/2026: Nhập kho lớn đầu kỳ
-- ==========================================
INSERT INTO public.lichsukho (id, id_nguyen_lieu, ten_nguyen_lieu_khac, so_luong_thay_doi, loai_giao_dich, chi_phi, ghi_chu, id_nhan_vien, thoi_gian_tao, trang_thai)
VALUES
('inv_test201', 'ing_caphe', NULL, 10000, 'Nhập kho', 1200000, 'Nhập 10kg hạt cà phê', 'admin', '2026-07-20T08:00:00+07:00', 'Đã duyệt'),
('inv_test202', 'ing_suadac', NULL, 12000, 'Nhập kho', 480000, 'Nhập 10 hộp sữa đặc', 'admin', '2026-07-20T08:05:00+07:00', 'Đã duyệt'),
('inv_test203', 'ing_suatuoi', NULL, 5000, 'Nhập kho', 150000, 'Nhập sữa tươi tiệt trùng', 'admin', '2026-07-20T08:10:00+07:00', 'Đã duyệt');

-- ==========================================
-- Bán hàng tiêu hao nguyên liệu (20/07 đến 28/07)
-- ==========================================
INSERT INTO public.lichsukho (id, id_nguyen_lieu, ten_nguyen_lieu_khac, so_luong_thay_doi, loai_giao_dich, chi_phi, ghi_chu, id_nhan_vien, thoi_gian_tao, trang_thai)
VALUES
-- Tiêu hao ngày 20
('inv_test204', 'ing_caphe', NULL, -72, 'Bán hàng', 0, 'Khấu trừ Cà phê đá x2, Cà phê sữa x2', 'admin', '2026-07-20T22:00:00+07:00', 'Đã duyệt'),
('inv_test205', 'ing_suadac', NULL, -100, 'Bán hàng', 0, 'Khấu trừ Sữa đặc (Cà phê sữa + Cacao sữa)', 'admin', '2026-07-20T22:00:00+07:00', 'Đã duyệt'),

-- Tiêu hao ngày 21
('inv_test214', 'ing_caphe', NULL, -33, 'Bán hàng', 0, 'Khấu trừ Cà phê sữa tươi x2', 'admin', '2026-07-21T22:00:00+07:00', 'Đã duyệt'),
('inv_test215', 'ing_suatuoi', NULL, -230, 'Bán hàng', 0, 'Khấu trừ sữa tươi (Cà phê sữa tươi + Cacao)', 'admin', '2026-07-21T22:00:00+07:00', 'Đã duyệt'),

-- Tiêu hao ngày 22
('inv_test224', 'ing_caphe', NULL, -18, 'Bán hàng', 0, 'Khấu trừ Cà phê đá x1', 'admin', '2026-07-22T22:00:00+07:00', 'Đã duyệt'),

-- ==========================================
-- NGÀY 23/07/2026: Nhập thêm nguyên liệu & tiêu hao
-- ==========================================
INSERT INTO public.lichsukho (id, id_nguyen_lieu, ten_nguyen_lieu_khac, so_luong_thay_doi, loai_giao_dich, chi_phi, ghi_chu, id_nhan_vien, thoi_gian_tao, trang_thai)
VALUES
('inv_test234', 'ing_cacao', NULL, 5000, 'Nhập kho', 600000, 'Nhập cacao bột AVA', 'admin', '2026-07-23T10:00:00+07:00', 'Đã duyệt'),
('inv_test235', 'ing_caphe', NULL, -36, 'Bán hàng', 0, 'Khấu trừ Cà phê muối x2', 'admin', '2026-07-23T22:00:00+07:00', 'Đã duyệt'),
('inv_test236', 'ing_kemmuoi', NULL, -120, 'Bán hàng', 0, 'Khấu trừ Kem muối (Cà phê muối)', 'admin', '2026-07-23T22:00:00+07:00', 'Đã duyệt');

-- ==========================================
-- NGÀY 24/07/2026: Tiêu hao & kiểm kê hao hụt
-- ==========================================
INSERT INTO public.lichsukho (id, id_nguyen_lieu, ten_nguyen_lieu_khac, so_luong_thay_doi, loai_giao_dich, chi_phi, ghi_chu, id_nhan_vien, thoi_gian_tao, trang_thai)
VALUES
('inv_test244', 'ing_suadac', NULL, -30, 'Bán hàng', 0, 'Khấu trừ Cà phê sữa x1', 'admin', '2026-07-24T22:00:00+07:00', 'Đã duyệt'),
('inv_test245', 'ing_caphe', NULL, -200, 'Hao hụt/Cân lại', 0, 'Hao hụt do rơi vãi hạt', 'admin', '2026-07-24T22:10:00+07:00', 'Đã duyệt');

-- ==========================================
-- NGÀY 25/07/2026: Tiêu hao
-- ==========================================
INSERT INTO public.lichsukho (id, id_nguyen_lieu, ten_nguyen_lieu_khac, so_luong_thay_doi, loai_giao_dich, chi_phi, ghi_chu, id_nhan_vien, thoi_gian_tao, trang_thai)
VALUES
('inv_test254', 'ing_caphe', NULL, -18, 'Bán hàng', 0, 'Khấu trừ Cà phê đá x1', 'admin', '2026-07-25T22:00:00+07:00', 'Đã duyệt');

-- ==========================================
-- NGÀY 26/07/2026: Tiêu hao
-- ==========================================
INSERT INTO public.lichsukho (id, id_nguyen_lieu, ten_nguyen_lieu_khac, so_luong_thay_doi, loai_giao_dich, chi_phi, ghi_chu, id_nhan_vien, thoi_gian_tao, trang_thai)
VALUES
('inv_test264', 'ing_caphe', NULL, -11, 'Bán hàng', 0, 'Khấu trừ Bạc xìu x1', 'admin', '2026-07-26T22:00:00+07:00', 'Đã duyệt'),
('inv_test265', 'ing_suadac', NULL, -40, 'Bán hàng', 0, 'Khấu trừ Sữa đặc (Bạc xìu)', 'admin', '2026-07-26T22:00:00+07:00', 'Đã duyệt');

-- ==========================================
-- NGÀY 27/07/2026: Nhập kho & tiêu hao
-- ==========================================
INSERT INTO public.lichsukho (id, id_nguyen_lieu, ten_nguyen_lieu_khac, so_luong_thay_doi, loai_giao_dich, chi_phi, ghi_chu, id_nhan_vien, thoi_gian_tao, trang_thai)
VALUES
('inv_test274', 'ing_suatuoi', NULL, 10000, 'Nhập kho', 300000, 'Nhập 10 hộp sữa tươi', 'admin', '2026-07-27T09:30:00+07:00', 'Đã duyệt'),
('inv_test275', 'ing_caphe', NULL, -45, 'Bán hàng', 0, 'Khấu trừ Cà phê đá x3', 'admin', '2026-07-27T22:00:00+07:00', 'Đã duyệt');

-- ==========================================
-- NGÀY 28/07/2026: Tiêu hao hôm nay
-- ==========================================
INSERT INTO public.lichsukho (id, id_nguyen_lieu, ten_nguyen_lieu_khac, so_luong_thay_doi, loai_giao_dich, chi_phi, ghi_chu, id_nhan_vien, thoi_gian_tao, trang_thai)
VALUES
('inv_test284', 'ing_caphe', NULL, -33, 'Bán hàng', 0, 'Khấu trừ Cà phê đá x1, Cà phê sữa x1', 'admin', '2026-07-28T17:00:00+07:00', 'Đã duyệt'),
('inv_test285', 'ing_suadac', NULL, -30, 'Bán hàng', 0, 'Khấu trừ Sữa đặc (Cà phê sữa)', 'admin', '2026-07-28T17:00:00+07:00', 'Đã duyệt');
