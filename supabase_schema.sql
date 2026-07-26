-- SCRIPT TẠO CƠ SỞ DỮ LIỆU CHO ỨNG DỤNG AVA COFFEE
-- Hãy chạy script này trong SQL Editor của Supabase

-- 1. BẢNG NGƯỜI DÙNG (users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'User')) DEFAULT 'User',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. BẢNG DANH SÁCH BÀN (tables)
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL CHECK (status IN ('Trống', 'Đang phục vụ')) DEFAULT 'Trống'
);

-- 3. BẢNG LOẠI SẢN PHẨM (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- 4. BẢNG SẢN PHẨM (products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    cost_price NUMERIC NOT NULL CHECK (cost_price >= 0) DEFAULT 0,
    image_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('Còn hàng', 'Hết hàng')) DEFAULT 'Còn hàng'
);

-- 5. BẢNG HÓA ĐƠN (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0) DEFAULT 0,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Chưa thanh toán', 'Đã thanh toán', 'Đã hủy')) DEFAULT 'Chưa thanh toán',
    payment_method TEXT CHECK (payment_method IN ('Tiền mặt', 'Chuyển khoản')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 6. BẢNG CHI TIẾT HÓA ĐƠN (order_items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC NOT NULL CHECK (subtotal >= 0)
);

-- 7. BẢNG CHẤM CÔNG (time_logs)
CREATE TABLE IF NOT EXISTS public.time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    location_address TEXT,
    status TEXT NOT NULL CHECK (status IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối')) DEFAULT 'Chờ duyệt'
);

-- 8. BẢNG XIN NGHỈ PHÉP (leave_requests)
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    location_address TEXT,
    status TEXT NOT NULL CHECK (status IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối')) DEFAULT 'Chờ duyệt',
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- BẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- TẠO CÁC CHÍNH SÁCH RLS (BẢN ĐƠN GIẢN CHO DEV)
-- Cho phép đọc công khai (để demo dễ dàng) và ghi đối với user đã đăng nhập
CREATE POLICY "Cho phép đọc mọi bảng công khai" ON public.users FOR SELECT USING (true);
CREATE POLICY "Cho phép ghi đối với user đăng nhập" ON public.users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép đọc bảng tables công khai" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng tables công khai" ON public.tables FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép đọc bảng categories công khai" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng categories công khai" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép đọc bảng products công khai" ON public.products FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng products công khai" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép đọc bảng orders công khai" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng orders công khai" ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép đọc bảng order_items công khai" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng order_items công khai" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép đọc bảng time_logs công khai" ON public.time_logs FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng time_logs công khai" ON public.time_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Cho phép đọc bảng leave_requests công khai" ON public.leave_requests FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật bảng leave_requests công khai" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);

-- TẠO TRIGGER TỰ ĐỘNG THÊM USER VÀO BẢNG PUBLIC.USERS KHI ĐĂNG KÝ QUA SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Nhân viên mới'),
    COALESCE(new.raw_user_meta_data->>'role', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CHÈN DỮ LIỆU MẪU (SEED DATA)
-- Thêm bàn
INSERT INTO public.tables (table_name, capacity, status) VALUES
('Bàn 1', 4, 'Trống'),
('Bàn 2', 4, 'Trống'),
('Bàn 3', 2, 'Trống'),
('Bàn 4', 2, 'Trống'),
('Bàn 5', 6, 'Trống'),
('Bàn 6', 6, 'Trống'),
('Bàn 7', 8, 'Trống'),
('Bàn 8', 4, 'Trống'),
('Bàn 9 (Ngoài trời)', 4, 'Trống'),
('Bàn 10 (Ngoài trời)', 4, 'Trống'),
('Khách mang về', 99, 'Trống')
ON CONFLICT (table_name) DO NOTHING;

-- Thêm danh mục món
INSERT INTO public.categories (id, name) VALUES
('c1111111-1111-1111-1111-111111111111', 'Cà phê'),
('c2222222-2222-2222-2222-222222222222', 'Thức uống khác'),
('c3333333-3333-3333-3333-333333333333', 'Trà'),
('c4444444-4444-4444-4444-444444444444', 'Yaourt'),
('c5555555-5555-5555-5555-555555555555', 'Soda')
ON CONFLICT (name) DO NOTHING;

-- Thêm sản phẩm mẫu
INSERT INTO public.products (id, category_id, name, price, cost_price, image_url, status) VALUES
-- Cà phê (CP)
('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Cà phê đen', 15000, 5000, 'https://i.pinimg.com/vwebp/736x/fa/21/eb/fa21eb28c29f08f40bd7f44e9d21f27d.webp', 'Còn hàng'),
('d1111111-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 'Cà phê sữa', 17000, 6000, 'https://i.pinimg.com/vwebp/736x/25/f1/c4/25f1c44880e288b19afcc6c747567405a.webp', 'Còn hàng'),
('d1111111-1111-1111-1111-111111111113', 'c1111111-1111-1111-1111-111111111111', 'Cà phê sữa tươi', 22000, 8000, 'https://i.pinimg.com/736x/02/15/55/0215554e3cf993469d0625ab1921b98a.jpg', 'Còn hàng'),
('d1111111-1111-1111-1111-111111111114', 'c1111111-1111-1111-1111-111111111111', 'Cà phê muối', 22000, 8000, 'https://i.pinimg.com/736x/d7/65/9c/d7659c0e02595551e771e7b2edab17e.jpg', 'Còn hàng'),
('d1111111-1111-1111-1111-111111111115', 'c1111111-1111-1111-1111-111111111111', 'Bạc xiu', 22000, 8000, 'https://i.pinimg.com/736x/be/8d/41/be8d413f945e09c6236f726ec3b95f5f.jpg', 'Còn hàng'),

-- Thức uống khác (TUK)
('d2222222-2222-2222-2222-222222222221', 'c2222222-2222-2222-2222-222222222222', 'Cacao', 20000, 7000, 'https://i.pinimg.com/736x/d6/f5/a1/d6f5a103292180b1943c83b35325bdf2.jpg', 'Còn hàng'),
('d2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Cacao kem muối', 25000, 9000, 'https://i.pinimg.com/736x/b2/6e/8d/b26e8d7ed1495873ee9fd936df9d0532.jpg', 'Còn hàng'),
('d2222222-2222-2222-2222-222222222223', 'c2222222-2222-2222-2222-222222222222', 'Matcha Latte', 25000, 9000, 'https://i.pinimg.com/1200x/2e/ac/ae/2eacae2f52c4ac369ae5192bf17ea1b4.jpg', 'Còn hàng'),
('d2222222-2222-2222-2222-222222222224', 'c2222222-2222-2222-2222-222222222222', 'Matcha Latte kem muối', 30000, 11000, 'https://i.pinimg.com/736x/39/22/2c/39222cae47d07268215d1751a0b6c6c.jpg', 'Còn hàng'),

-- Trà (T)
('d3333333-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', 'Trà tắc', 15000, 5000, 'https://i.pinimg.com/736x/14/91/f4/1491f4c34770937dfd4190da0da8556b2f.jpg', 'Còn hàng'),
('d3333333-3333-3333-3333-333333333332', 'c3333333-3333-3333-3333-333333333333', 'Trà dâu', 25000, 9000, 'https://i.pinimg.com/1200x/bf/f2/6d/bff26dce28c30a6ff849e87252726293.jpg', 'Còn hàng'),
('d3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Trà đào', 25000, 9000, 'https://i.pinimg.com/736x/9e/b2/b0/9eb2b01ea2306476b37454f4b8b8b0a4.jpg', 'Còn hàng'),
('d3333333-3333-3333-3333-333333333334', 'c3333333-3333-3333-3333-333333333333', 'Trà vải', 25000, 9000, 'https://i.pinimg.com/736x/0f/c1/a3/0fc1a3f9275c4dc68a0e7394d4fce71f.jpg', 'Còn hàng'),

-- Yaourt (Y)
('d4444444-4444-4444-4444-444444444441', 'c4444444-4444-4444-4444-444444444444', 'Yaourt đá', 20000, 7000, 'https://i.pinimg.com/vwebp/1200x/e3/0e/0a/e30e0a3070bae2b2ec7a9a6101c85b7b.webp', 'Còn hàng'),
('d4444444-4444-4444-4444-444444444442', 'c4444444-4444-4444-4444-444444444444', 'Yaourt dâu', 25000, 9000, 'https://i.pinimg.com/1200x/27/34/33/27343309543e0cc6b1348302c2a379e5.jpg', 'Còn hàng'),
('d4444444-4444-4444-4444-444444444443', 'c4444444-4444-4444-4444-444444444444', 'Yaourt việt quất', 25000, 9000, 'https://i.pinimg.com/736x/5e/83/e5/5e83e5ad1b5c4ab983b09caf1b5e1ac2.jpg', 'Còn hàng'),

-- Soda (S)
('d5555555-5555-5555-5555-555555555551', 'c5555555-5555-5555-5555-555555555555', 'Soda dâu', 25000, 9000, 'https://i.pinimg.com/736x/4f/7a/60/4f7a608bd5384c201a6d707b16263616.jpg', 'Còn hàng'),
('d5555555-5555-5555-5555-555555555552', 'c5555555-5555-5555-5555-555555555555', 'Soda đào', 25000, 9000, 'https://i.pinimg.com/1200x/e2/1e/02/e21e0287ce4f1e1cfaf1a0cd8d9d729a.webp', 'Còn hàng'),
('d5555555-5555-5555-5555-555555555553', 'c5555555-5555-5555-5555-555555555555', 'Soda việt quất', 25000, 9000, 'https://i.pinimg.com/736x/3f/54/43/3f54439327709c6236f726ec3b95f5f.jpg', 'Còn hàng')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    price = EXCLUDED.price, 
    cost_price = EXCLUDED.cost_price, 
    image_url = EXCLUDED.image_url, 
    status = EXCLUDED.status;
