import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Kiểm tra xem Supabase đã được cấu hình hay chưa
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-key';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cache variables for performance optimization
let cachedCategories: any[] | null = null;
let cachedProducts: any[] | null = null;
let cachedRecipes: any[] | null = null;

// Helper tạo ID ngắn giống trên database khi offline (ví dụ: p_3a4b5c)
export const generateShortId = (prefix: string): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Dữ liệu mẫu khởi tạo cho Mock DB
const MOCK_CATEGORIES = [
  { id: 'c_caphe', name: 'Cà phê' },
  { id: 'c_douongkhac', name: 'Thức uống khác' },
  { id: 'c_tra', name: 'Trà' },
  { id: 'c_yaourt', name: 'Yaourt' },
  { id: 'c_soda', name: 'Soda' },
  { id: 'c_nuocngot', name: 'Nước ngọt/suối' }
];

const MOCK_PRODUCTS = [
  // Cà phê (CP)
  {
    id: 'CP001',
    category_id: 'c_caphe',
    name: 'Cà phê đá',
    price: 15000,
    cost_price: 5000,
    image_url: '/products/CP001.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'CP002',
    category_id: 'c_caphe',
    name: 'Cà phê sữa',
    price: 17000,
    cost_price: 6000,
    image_url: '/products/CP002.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'CP003',
    category_id: 'c_caphe',
    name: 'Cà phê sữa tươi',
    price: 22000,
    cost_price: 8000,
    image_url: '/products/CP003.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'CP004',
    category_id: 'c_caphe',
    name: 'Cà phê muối',
    price: 22000,
    cost_price: 8000,
    image_url: '/products/CP004.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'CP005',
    category_id: 'c_caphe',
    name: 'Bạc xìu',
    price: 22000,
    cost_price: 8000,
    image_url: '/products/CP005.png',
    status: 'Còn hàng' as const
  },
  // Thức uống khác (TUK)
  {
    id: 'TUK001',
    category_id: 'c_douongkhac',
    name: 'Cacao sữa',
    price: 20000,
    cost_price: 7000,
    image_url: '/products/TUK001.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'TUK002',
    category_id: 'c_douongkhac',
    name: 'Cacao kem muối',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/TUK002.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'TUK003',
    category_id: 'c_douongkhac',
    name: 'Matcha Latte',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/TUK003.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'TUK004',
    category_id: 'c_douongkhac',
    name: 'Matcha Latte kem muối',
    price: 30000,
    cost_price: 11000,
    image_url: '/products/TUK004.png',
    status: 'Còn hàng' as const
  },
  // Trà (T)
  {
    id: 'T001',
    category_id: 'c_tra',
    name: 'Trà tắc',
    price: 15000,
    cost_price: 5000,
    image_url: '/products/T001.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'T002',
    category_id: 'c_tra',
    name: 'Trà dâu',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/T002.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'T003',
    category_id: 'c_tra',
    name: 'Trà đào',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/T003.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'T004',
    category_id: 'c_tra',
    name: 'Trà vải',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/T004.png',
    status: 'Còn hàng' as const
  },
  // Yaourt (Y)
  {
    id: 'Y001',
    category_id: 'c_yaourt',
    name: 'Yaourt đá',
    price: 20000,
    cost_price: 7000,
    image_url: '/products/Y001.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'Y002',
    category_id: 'c_yaourt',
    name: 'Yaourt dâu',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/Y002.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'Y003',
    category_id: 'c_yaourt',
    name: 'Yaourt việt quất',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/Y003.png',
    status: 'Còn hàng' as const
  },
  // Soda (S)
  {
    id: 'S001',
    category_id: 'c_soda',
    name: 'Soda dâu',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/S001.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'S002',
    category_id: 'c_soda',
    name: 'Soda đào',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/S002.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'S003',
    category_id: 'c_soda',
    name: 'Soda việt quất',
    price: 25000,
    cost_price: 9000,
    image_url: '/products/S003.png',
    status: 'Còn hàng' as const
  },
  {
    id: 'N001',
    category_id: 'c_nuocngot',
    name: '7-Up',
    price: 15000,
    cost_price: 5000,
    image_url: '/products/N001.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'N002',
    category_id: 'c_nuocngot',
    name: 'Bò Húc',
    price: 20000,
    cost_price: 8000,
    image_url: '/products/N002.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'N003',
    category_id: 'c_nuocngot',
    name: 'Coca',
    price: 15000,
    cost_price: 5000,
    image_url: '/products/N003.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'N004',
    category_id: 'c_nuocngot',
    name: 'Number 1',
    price: 15000,
    cost_price: 5000,
    image_url: '/products/N004.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'N005',
    category_id: 'c_nuocngot',
    name: 'Nước suối',
    price: 10000,
    cost_price: 3000,
    image_url: '/products/N005.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'N006',
    category_id: 'c_nuocngot',
    name: 'Pepsi',
    price: 15000,
    cost_price: 5000,
    image_url: '/products/N006.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'N007',
    category_id: 'c_nuocngot',
    name: 'Revive',
    price: 15000,
    cost_price: 5000,
    image_url: '/products/N007.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'N008',
    category_id: 'c_nuocngot',
    name: 'Sting',
    price: 15000,
    cost_price: 5000,
    image_url: '/products/N008.jpg',
    status: 'Còn hàng' as const
  }
];

const MOCK_TABLES: Array<{ id: string; table_name: string; capacity: number; status: 'Trống' | 'Đang phục vụ' }> = [
  { id: 'tb1', table_name: 'Bàn 1', capacity: 4, status: 'Trống' },
  { id: 'tb2', table_name: 'Bàn 2', capacity: 4, status: 'Trống' },
  { id: 'tb3', table_name: 'Bàn 3', capacity: 2, status: 'Trống' },
  { id: 'tb4', table_name: 'Bàn 4', capacity: 2, status: 'Trống' },
  { id: 'tb5', table_name: 'Bàn 5', capacity: 6, status: 'Trống' },
  { id: 'tb6', table_name: 'Bàn 6', capacity: 6, status: 'Trống' },
  { id: 'tb7', table_name: 'Khách mang về', capacity: 99, status: 'Trống' }
];

const MOCK_USERS = [
  { id: 'admin', username: 'admin', password: '123456', email: 'admin@avacoffee.com', full_name: 'Lê Sơn (Admin)', role: 'Admin' as const, created_at: new Date().toISOString() },
  { id: 'nv001', username: 'nv001', password: '123456', email: 'nhanvien1@avacoffee.com', full_name: 'Nguyễn Văn Minh', role: 'User' as const, created_at: new Date().toISOString() },
  { id: 'nv002', username: 'nv002', password: '123456', email: 'nhanvien2@avacoffee.com', full_name: 'Trần Thị Thuỷ', role: 'User' as const, created_at: new Date().toISOString() }
];

export const MOCK_INGREDIENTS = [
  { id: 'ing_caphe', name: 'Cà phê hạt AVA', unit: 'g', stock_quantity: 5000, opening_stock: 5000, min_stock: 1000, quy_cach: '1kg' },
  { id: 'ing_cacao', name: 'Cacao AVA', unit: 'g', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: '1kg' },
  { id: 'ing_matcha', name: 'Bột Matcha', unit: 'g', stock_quantity: 500, opening_stock: 500, min_stock: 50, quy_cach: '200g' },
  { id: 'ing_hongtra', name: 'Hồng trà', unit: 'g', stock_quantity: 1500, opening_stock: 1500, min_stock: 300, quy_cach: '30g' },
  { id: 'ing_suadac', name: 'Sữa đặc', unit: 'g', stock_quantity: 6420, opening_stock: 6420, min_stock: 1284, quy_cach: '1284g' },
  { id: 'ing_suatuoi', name: 'Sữa tươi', unit: 'ml', stock_quantity: 5000, opening_stock: 5000, min_stock: 2000, quy_cach: '1000ml' },
  { id: 'ing_lyden', name: 'Ly đen AVA', unit: 'cái', stock_quantity: 200, opening_stock: 200, min_stock: 50, quy_cach: 'cái' },
  { id: 'ing_lytrang', name: 'Ly trắng AVA', unit: 'cái', stock_quantity: 200, opening_stock: 200, min_stock: 50, quy_cach: 'cái' },
  { id: 'ing_lyhoavan', name: 'Ly trắng hoa văn AVA', unit: 'cái', stock_quantity: 200, opening_stock: 200, min_stock: 50, quy_cach: 'cái' },
  { id: 'ing_muong', name: 'Muỗng', unit: 'bịch', stock_quantity: 5, opening_stock: 5, min_stock: null, quy_cach: 'bịch' },
  { id: 'ing_tuimangdi', name: 'Túi mang đi', unit: 'kg', stock_quantity: 5, opening_stock: 5, min_stock: null, quy_cach: '1kg' },
  { id: 'ing_duong', name: 'Đường', unit: 'g', stock_quantity: 5000, opening_stock: 5000, min_stock: 1000, quy_cach: '1000g' },
  { id: 'ing_kembeo', name: "Kem RICH'S", unit: 'g', stock_quantity: 2270, opening_stock: 2270, min_stock: 454, quy_cach: '454g' },
  { id: 'ing_suachua', name: 'Sữa chua', unit: 'hộp', stock_quantity: 20, opening_stock: 20, min_stock: 4, quy_cach: 'hộp' },
  { id: 'ing_mutdau', name: 'Mứt dâu', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_mutvietquat', name: 'Mứt việt quất', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_mutdao', name: 'Mứt đào', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_sirodau', name: 'Siro dâu', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_sirodao', name: 'Siro đào', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_sirovai', name: 'Siro vải', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_7up', name: '7-Up', unit: 'chai', stock_quantity: 24, opening_stock: 24, min_stock: 10, quy_cach: '390ml' },
  { id: 'ing_n001', name: '7-Up (lon)', unit: 'lon', stock_quantity: 24, opening_stock: 24, min_stock: 2, quy_cach: 'lon' },
  { id: 'ing_n002', name: 'Bò Húc (lon)', unit: 'lon', stock_quantity: 24, opening_stock: 24, min_stock: 2, quy_cach: 'lon' },
  { id: 'ing_n003', name: 'Coca (lon)', unit: 'lon', stock_quantity: 24, opening_stock: 24, min_stock: 2, quy_cach: 'lon' },
  { id: 'ing_n004', name: 'Number 1 (chai)', unit: 'chai', stock_quantity: 24, opening_stock: 24, min_stock: 2, quy_cach: 'chai' },
  { id: 'ing_n005', name: 'Nước suối (chai)', unit: 'chai', stock_quantity: 24, opening_stock: 24, min_stock: 2, quy_cach: 'chai' },
  { id: 'ing_n006', name: 'Pepsi (lon)', unit: 'lon', stock_quantity: 24, opening_stock: 24, min_stock: 2, quy_cach: 'lon' },
  { id: 'ing_n007', name: 'Revive (chai)', unit: 'chai', stock_quantity: 24, opening_stock: 24, min_stock: 2, quy_cach: 'chai' },
  { id: 'ing_n008', name: 'Sting (lon)', unit: 'lon', stock_quantity: 24, opening_stock: 24, min_stock: 2, quy_cach: 'lon' },
  { id: 'ing_lytratac', name: 'Ly trà tắc', unit: 'cái', stock_quantity: 200, opening_stock: 200, min_stock: 2, quy_cach: 'cái' },
  { id: 'ing_muoibien', name: 'Topping Muối biển', unit: 'bịch', stock_quantity: 5, opening_stock: 5, min_stock: 2, quy_cach: '500g' }
];

export const MOCK_RECIPES = [
  // 1. Cà phê đá
  { id: 'rec_cp1_1', product_id: 'CP001', ingredient_id: 'ing_caphe', quantity_needed: 18, unit: 'g' },
  { id: 'rec_cp1_duong', product_id: 'CP001', ingredient_id: 'ing_duong', quantity_needed: 8.33, unit: 'g' },
  { id: 'rec_cp1_3', product_id: 'CP001', ingredient_id: 'ing_lyden', quantity_needed: 1, unit: 'cái' },

  // 2. Cà phê sữa
  { id: 'rec_cp2_1', product_id: 'CP002', ingredient_id: 'ing_caphe', quantity_needed: 18, unit: 'g' },
  { id: 'rec_cp2_2', product_id: 'CP002', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_cp2_3', product_id: 'CP002', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 3. Cà phê sữa tươi
  { id: 'rec_cp3_1', product_id: 'CP003', ingredient_id: 'ing_caphe', quantity_needed: 11, unit: 'g' },
  { id: 'rec_cp3_2', product_id: 'CP003', ingredient_id: 'ing_suadac', quantity_needed: 25, unit: 'g' },
  { id: 'rec_cp3_3', product_id: 'CP003', ingredient_id: 'ing_suatuoi', quantity_needed: 100, unit: 'ml' },
  { id: 'rec_cp3_4', product_id: 'CP003', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 4. Cà phê muối
  { id: 'rec_cp4_1', product_id: 'CP004', ingredient_id: 'ing_caphe', quantity_needed: 18, unit: 'g' },
  { id: 'rec_cp4_2', product_id: 'CP004', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_cp4_kembeo', product_id: 'CP004', ingredient_id: 'ing_kembeo', quantity_needed: 0.0667, unit: 'hộp' },
  { id: 'rec_cp4_suadac_km', product_id: 'CP004', ingredient_id: 'ing_suadac', quantity_needed: 1.33, unit: 'g' },
  { id: 'rec_cp4_suatuoi_km', product_id: 'CP004', ingredient_id: 'ing_suatuoi', quantity_needed: 2, unit: 'ml' },
  { id: 'rec_cp4_4', product_id: 'CP004', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 5. Bạc xỉu
  { id: 'rec_cp5_1', product_id: 'CP005', ingredient_id: 'ing_caphe', quantity_needed: 11, unit: 'g' },
  { id: 'rec_cp5_2', product_id: 'CP005', ingredient_id: 'ing_suadac', quantity_needed: 40, unit: 'g' },
  { id: 'rec_cp5_3', product_id: 'CP005', ingredient_id: 'ing_suatuoi', quantity_needed: 50, unit: 'ml' },
  { id: 'rec_cp5_4', product_id: 'CP005', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 6. Cacao sữa
  { id: 'rec_tuk1_1', product_id: 'TUK001', ingredient_id: 'ing_cacao', quantity_needed: 10, unit: 'g' },
  { id: 'rec_tuk1_2', product_id: 'TUK001', ingredient_id: 'ing_suadac', quantity_needed: 40, unit: 'g' },
  { id: 'rec_tuk1_3', product_id: 'TUK001', ingredient_id: 'ing_suatuoi', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_tuk1_4', product_id: 'TUK001', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 7. Cacao kem muối
  { id: 'rec_tuk2_1', product_id: 'TUK002', ingredient_id: 'ing_cacao', quantity_needed: 10, unit: 'g' },
  { id: 'rec_tuk2_2', product_id: 'TUK002', ingredient_id: 'ing_suadac', quantity_needed: 40, unit: 'g' },
  { id: 'rec_tuk2_3', product_id: 'TUK002', ingredient_id: 'ing_suatuoi', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_tuk2_kembeo', product_id: 'TUK002', ingredient_id: 'ing_kembeo', quantity_needed: 0.0667, unit: 'hộp' },
  { id: 'rec_tuk2_suadac_km', product_id: 'TUK002', ingredient_id: 'ing_suadac', quantity_needed: 1.33, unit: 'g' },
  { id: 'rec_tuk2_suatuoi_km', product_id: 'TUK002', ingredient_id: 'ing_suatuoi', quantity_needed: 2, unit: 'ml' },
  { id: 'rec_tuk2_5', product_id: 'TUK002', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 8. Matcha Latte
  { id: 'rec_tuk3_1', product_id: 'TUK003', ingredient_id: 'ing_matcha', quantity_needed: 3.5, unit: 'g' },
  { id: 'rec_tuk3_2', product_id: 'TUK003', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_tuk3_3', product_id: 'TUK003', ingredient_id: 'ing_suatuoi', quantity_needed: 100, unit: 'ml' },
  { id: 'rec_tuk3_4', product_id: 'TUK003', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 9. Matcha Latte kem muối
  { id: 'rec_tuk4_1', product_id: 'TUK004', ingredient_id: 'ing_matcha', quantity_needed: 3.5, unit: 'g' },
  { id: 'rec_tuk4_2', product_id: 'TUK004', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_tuk4_3', product_id: 'TUK004', ingredient_id: 'ing_suatuoi', quantity_needed: 100, unit: 'ml' },
  { id: 'rec_tuk4_kembeo', product_id: 'TUK004', ingredient_id: 'ing_kembeo', quantity_needed: 0.0667, unit: 'hộp' },
  { id: 'rec_tuk4_suadac_km', product_id: 'TUK004', ingredient_id: 'ing_suadac', quantity_needed: 1.33, unit: 'g' },
  { id: 'rec_tuk4_suatuoi_km', product_id: 'TUK004', ingredient_id: 'ing_suatuoi', quantity_needed: 2, unit: 'ml' },
  { id: 'rec_tuk4_5', product_id: 'TUK004', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 10. Trà tắc
  { id: 'rec_t1_hongtra', product_id: 'T001', ingredient_id: 'ing_hongtra', quantity_needed: 1.875, unit: 'bịch' },
  { id: 'rec_t1_lytratac', product_id: 'T001', ingredient_id: 'ing_lytratac', quantity_needed: 1, unit: 'cái' },

  // 11. Trà dâu
  { id: 'rec_t2_hongtra', product_id: 'T002', ingredient_id: 'ing_hongtra', quantity_needed: 0.9375, unit: 'bịch' },
  { id: 'rec_t2_2', product_id: 'T002', ingredient_id: 'ing_sirodau', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_t2_duong', product_id: 'T002', ingredient_id: 'ing_duong', quantity_needed: 16.67, unit: 'g' },
  { id: 'rec_t2_4', product_id: 'T002', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 12. Trà đào
  { id: 'rec_t3_hongtra', product_id: 'T003', ingredient_id: 'ing_hongtra', quantity_needed: 0.9375, unit: 'bịch' },
  { id: 'rec_t3_2', product_id: 'T003', ingredient_id: 'ing_sirodao', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_t3_duong', product_id: 'T003', ingredient_id: 'ing_duong', quantity_needed: 16.67, unit: 'g' },
  { id: 'rec_t3_4', product_id: 'T003', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 13. Trà vải
  { id: 'rec_t4_hongtra', product_id: 'T004', ingredient_id: 'ing_hongtra', quantity_needed: 0.9375, unit: 'bịch' },
  { id: 'rec_t4_2', product_id: 'T004', ingredient_id: 'ing_sirovai', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_t4_duong', product_id: 'T004', ingredient_id: 'ing_duong', quantity_needed: 16.67, unit: 'g' },
  { id: 'rec_t4_4', product_id: 'T004', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 14. Yaourt đá
  { id: 'rec_y1_1', product_id: 'Y001', ingredient_id: 'ing_suachua', quantity_needed: 1, unit: 'hộp' },
  { id: 'rec_y1_2', product_id: 'Y001', ingredient_id: 'ing_suadac', quantity_needed: 50, unit: 'g' },
  { id: 'rec_y1_3', product_id: 'Y001', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 15. Yaourt dâu
  { id: 'rec_y2_1', product_id: 'Y002', ingredient_id: 'ing_suachua', quantity_needed: 1, unit: 'hộp' },
  { id: 'rec_y2_2', product_id: 'Y002', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_y2_3', product_id: 'Y002', ingredient_id: 'ing_mutdau', quantity_needed: 50, unit: 'ml' },
  { id: 'rec_y2_4', product_id: 'Y002', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 16. Yaourt việt quất
  { id: 'rec_y3_1', product_id: 'Y003', ingredient_id: 'ing_suachua', quantity_needed: 1, unit: 'hộp' },
  { id: 'rec_y3_2', product_id: 'Y003', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_y3_3', product_id: 'Y003', ingredient_id: 'ing_mutvietquat', quantity_needed: 50, unit: 'ml' },
  { id: 'rec_y3_4', product_id: 'Y003', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 17. Soda dâu
  { id: 'rec_s1_1', product_id: 'S001', ingredient_id: 'ing_7up', quantity_needed: 0.5, unit: 'chai' },
  { id: 'rec_s1_2', product_id: 'S001', ingredient_id: 'ing_mutdau', quantity_needed: 40, unit: 'ml' },
  { id: 'rec_s1_3', product_id: 'S001', ingredient_id: 'ing_sirodau', quantity_needed: 10, unit: 'ml' },
  { id: 'rec_s1_duong', product_id: 'S001', ingredient_id: 'ing_duong', quantity_needed: 8.33, unit: 'g' },
  { id: 'rec_s1_5', product_id: 'S001', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 18. Soda đào
  { id: 'rec_s2_1', product_id: 'S002', ingredient_id: 'ing_7up', quantity_needed: 0.5, unit: 'chai' },
  { id: 'rec_s2_2', product_id: 'S002', ingredient_id: 'ing_mutdao', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_s2_3', product_id: 'S002', ingredient_id: 'ing_sirodao', quantity_needed: 20, unit: 'ml' },
  { id: 'rec_s2_duong', product_id: 'S002', ingredient_id: 'ing_duong', quantity_needed: 8.33, unit: 'g' },
  { id: 'rec_s2_5', product_id: 'S002', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 19. Soda việt quất
  { id: 'rec_s3_1', product_id: 'S003', ingredient_id: 'ing_7up', quantity_needed: 0.5, unit: 'chai' },
  { id: 'rec_s3_2', product_id: 'S003', ingredient_id: 'ing_mutvietquat', quantity_needed: 50, unit: 'ml' },
  { id: 'rec_s3_duong', product_id: 'S003', ingredient_id: 'ing_duong', quantity_needed: 8.33, unit: 'g' },
  { id: 'rec_s3_4', product_id: 'S003', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },
  { id: 'rec_n1', product_id: 'N001', ingredient_id: 'ing_n001', quantity_needed: 1, unit: 'lon' },
  { id: 'rec_n2', product_id: 'N002', ingredient_id: 'ing_n002', quantity_needed: 1, unit: 'lon' },
  { id: 'rec_n3', product_id: 'N003', ingredient_id: 'ing_n003', quantity_needed: 1, unit: 'lon' },
  { id: 'rec_n4', product_id: 'N004', ingredient_id: 'ing_n004', quantity_needed: 1, unit: 'chai' },
  { id: 'rec_n5', product_id: 'N005', ingredient_id: 'ing_n005', quantity_needed: 1, unit: 'chai' },
  { id: 'rec_n6', product_id: 'N006', ingredient_id: 'ing_n006', quantity_needed: 1, unit: 'lon' },
  { id: 'rec_n7', product_id: 'N007', ingredient_id: 'ing_n007', quantity_needed: 1, unit: 'chai' },
  { id: 'rec_n8', product_id: 'N008', ingredient_id: 'ing_n008', quantity_needed: 1, unit: 'lon' }
];

export function getIngredientPackageInfo(unit: string, quyCach?: string): { inputUnit: string; multiplier: number } {
  const u = (unit || '').toLowerCase();
  const qc = (quyCach || '').toLowerCase();

  if (qc.includes('454')) {
    return { inputUnit: 'hộp', multiplier: 454 };
  }
  if (qc.includes('1284')) {
    return { inputUnit: 'hộp', multiplier: 1284 };
  }
  if (qc.includes('390')) {
    return { inputUnit: 'chai', multiplier: 390 };
  }
  if (qc === '1kg' || qc === '1000g') {
    return { inputUnit: 'kg', multiplier: 1000 };
  }
  if (qc === '500g') {
    return { inputUnit: 'bịch', multiplier: 500 };
  }
  if (qc === '300g') {
    return { inputUnit: 'bịch', multiplier: 300 };
  }
  if (qc === '200g') {
    return { inputUnit: 'bịch', multiplier: 200 };
  }
  if (qc === '150g') {
    return { inputUnit: 'bịch', multiplier: 150 };
  }
  if (qc === '30g' || u === 'bịch') {
    return { inputUnit: 'bịch', multiplier: 30 };
  }
  if (qc === '1000ml' || qc === '1l') {
    return { inputUnit: 'hộp', multiplier: 1000 };
  }
  return { inputUnit: unit, multiplier: 1 };
}

// Helper hiển thị tồn kho dạng ghép đơn vị (VD: 1kg + 982g, 1 bịch + 50g, 1 chai + 195ml)
export function formatIngredientStock(quantity: number, unit: string, quyCach?: string): string {
  const qty = Math.max(0, quantity);

  if (unit === 'g' || unit === 'bịch' || unit === 'hộp') {
    if (quyCach === '1kg' || quyCach === '1000g') {
      const kg = Math.floor(qty / 1000);
      const g = Math.round(qty % 1000);
      if (kg > 0) return g > 0 ? `${kg}kg + ${g}g` : `${kg}kg`;
      return `${g}g`;
    }
    if (quyCach === '500g') {
      const bich = Math.floor(qty / 500);
      const g = Math.round(qty % 500);
      if (bich > 0) return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      return `${g}g`;
    }
    if (quyCach === '454g' || quyCach?.includes('454')) {
      const hop = Math.floor(qty / 454);
      const g = Math.round(qty % 454);
      if (hop > 0) return g > 0 ? `${hop} hộp + ${g}g` : `${hop} hộp`;
      return `${g}g`;
    }
    if (quyCach === '300g') {
      const bich = Math.floor(qty / 300);
      const g = Math.round(qty % 300);
      if (bich > 0) return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      return `${g}g`;
    }
    if (quyCach === '200g') {
      const bich = Math.floor(qty / 200);
      const g = Math.round(qty % 200);
      if (bich > 0) return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      return `${g}g`;
    }
    if (quyCach === '100g') {
      const bich = Math.floor(qty / 100);
      const g = Math.round(qty % 100);
      if (bich > 0) return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      return `${g}g`;
    }
    if (quyCach === '1284g') {
      const hop = Math.floor(qty / 1284);
      const g = Math.round(qty % 1284);
      if (hop > 0) return g > 0 ? `${hop} hộp + ${g}g` : `${hop} hộp`;
      return `${g}g`;
    }
    if (quyCach === '150g') {
      const bich = Math.floor(qty / 150);
      const g = Math.round(qty % 150);
      if (bich > 0) return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      return `${g}g`;
    }
    if (quyCach === '30g' || unit === 'bịch') {
      const bich = Math.floor(qty / 30);
      const g = Math.round(qty % 30);
      if (bich > 0) return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      return `${g}g`;
    }
    if (quyCach === '1200g') {
      const hop = Math.floor(qty / 1200);
      const g = Math.round(qty % 1200);
      if (hop > 0) return g > 0 ? `${hop} hộp + ${g}g` : `${hop} hộp`;
      return `${g}g`;
    }
    const rounded = Number.isInteger(qty) ? qty : Math.round(qty * 100) / 100;
    return `${rounded}${unit === 'g' ? 'g' : ` ${unit}`}`;
  }

  if (unit === 'ml' || unit === 'chai') {
    if (quyCach === '390ml' || quyCach?.includes('390')) {
      const chai = Math.floor(qty / 390);
      const ml = Math.round(qty % 390);
      if (chai > 0) return ml > 0 ? `${chai} chai + ${ml}ml` : `${chai} chai`;
      return `${ml}ml`;
    }
    if (quyCach === '1000ml' || quyCach === '1L' || quyCach === '1l') {
      const l = Math.floor(qty / 1000);
      const ml = Math.round(qty % 1000);
      if (l > 0) return ml > 0 ? `${l}L + ${ml}ml` : `${l}L`;
      return `${ml}ml`;
    }
    const rounded = Number.isInteger(qty) ? qty : Math.round(qty * 100) / 100;
    return `${rounded}ml`;
  }

  const rounded = Number.isInteger(qty) ? qty : Math.round(qty * 100) / 100;
  return `${rounded} ${unit}`;
}

export function formatIngredientRefill(quantity: number, unit: string, quyCach?: string): string {
  const qty = Math.max(0, quantity);
  const pkg = getIngredientPackageInfo(unit, quyCach);

  if (pkg.multiplier > 1) {
    const pkgs = qty / pkg.multiplier;
    if (Number.isInteger(pkgs)) {
      return `+${pkgs} ${pkg.inputUnit}`;
    }
    const intPkgs = Math.floor(pkgs);
    const rem = Math.round(qty % pkg.multiplier);
    if (intPkgs > 0) {
      return `+${intPkgs} ${pkg.inputUnit} + ${rem}g`;
    }
    return `+${rem}g`;
  }
  return `+${formatIngredientStock(qty, unit, quyCach)}`;
}

// Helper lấy/ghi LocalStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Lớp Mock Database lưu trữ qua LocalStorage
export const mockDb = {
  getUsers: () => getStorageItem('ava_users', MOCK_USERS),
  setUsers: (users: typeof MOCK_USERS) => setStorageItem('ava_users', users),

  getTables: () => getStorageItem('ava_tables', MOCK_TABLES),
  setTables: (tables: typeof MOCK_TABLES) => setStorageItem('ava_tables', tables),

  getCategories: () => getStorageItem('ava_categories', MOCK_CATEGORIES),
  setCategories: (categories: typeof MOCK_CATEGORIES) => setStorageItem('ava_categories', categories),

  getProducts: () => getStorageItem('ava_products', MOCK_PRODUCTS),
  setProducts: (products: typeof MOCK_PRODUCTS) => setStorageItem('ava_products', products),

  getOrders: () => getStorageItem<any[]>('ava_orders', []),
  setOrders: (orders: any[]) => setStorageItem('ava_orders', orders),

  getOrderItems: () => getStorageItem<any[]>('ava_order_items', []),
  setOrderItems: (items: any[]) => setStorageItem('ava_order_items', items),

  getTimeLogs: () => getStorageItem<any[]>('ava_time_logs', []),
  setTimeLogs: (logs: any[]) => setStorageItem('ava_time_logs', logs),

  getLeaveRequests: () => getStorageItem<any[]>('ava_leave_requests', []),
  setLeaveRequests: (requests: any[]) => setStorageItem('ava_leave_requests', requests),

  getIngredients: () => getStorageItem('ava_ingredients', MOCK_INGREDIENTS),
  setIngredients: (ingredients: typeof MOCK_INGREDIENTS) => setStorageItem('ava_ingredients', ingredients),

  getRecipes: () => getStorageItem('ava_recipes', MOCK_RECIPES),
  setRecipes: (recipes: typeof MOCK_RECIPES) => setStorageItem('ava_recipes', recipes),

  getInventoryLogs: () => getStorageItem<any[]>('ava_inventory_logs', []),
  setInventoryLogs: (logs: any[]) => setStorageItem('ava_inventory_logs', logs)
};

export const getCurrentUser = (): typeof MOCK_USERS[0] | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('ava_current_user');
  if (!user) {
    return null; 
  }
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

export const setCurrentUser = (user: typeof MOCK_USERS[0] | null) => {
  if (typeof window !== 'undefined') {
    if (user === null) {
      localStorage.removeItem('ava_current_user');
    } else {
      localStorage.setItem('ava_current_user', JSON.stringify(user));
    }
  }
};

// --- DATA MAPPER FUNCTIONS (MAPPING BETWEEN FRONTEND AND VIETNAMESE DB COLUMNS) ---
const mapUserToClient = (u: any) => u ? {
  id: u.id,
  username: u.username,
  password: u.password,
  email: u.email,
  full_name: u.ho_ten,
  role: u.vai_tro,
  created_at: u.ngay_tao
} : null;

const mapTableToClient = (t: any) => t ? {
  id: t.id,
  table_name: t.ten_ban,
  capacity: t.suc_chua,
  status: t.trang_thai
} : null;

const mapCategoryToClient = (c: any) => c ? {
  id: c.id,
  name: c.ten_danh_muc
} : null;

const mapProductToClient = (p: any) => p ? {
  id: p.id,
  category_id: p.id_danh_muc,
  name: p.ten_san_pham,
  price: Number(p.don_gia),
  cost_price: Number(p.gia_von),
  image_url: p.hinh_anh,
  status: p.trang_thai,
  don_vi_tinh: p.don_vi_tinh || 'Ly',
  mo_ta: p.mo_ta || ''
} : null;

const mapOrderToClient = (o: any) => o ? {
  id: o.id,
  table_id: o.id_ban,
  staff_id: o.id_nhan_vien,
  total_amount: Number(o.tong_tien),
  discount: Number(o.giam_gia || 0),
  payment_status: o.trang_thai_thanh_toan,
  payment_method: o.phuong_thuc_thanh_toan,
  created_at: o.ngay_tao,
  paid_at: o.ngay_thanh_toan,
  tables: o.danhsachban ? { table_name: o.danhsachban.ten_ban } : null,
  users: o.nguoidung ? { full_name: o.nguoidung.ho_ten } : null
} : null;

const mapOrderItemToClient = (oi: any) => oi ? {
  id: oi.id,
  order_id: oi.idhoadon,
  product_id: oi.idsp,
  quantity: oi.so_luong,
  unit_price: Number(oi.don_gia),
  subtotal: Number(oi.thanh_tien),
  ghi_chu: oi.ghi_chu || '',
  cost_price: Number(oi.gia_von || 0),
  products: {
    name: oi.ten_san_pham,
    image_url: oi.sanpham?.hinh_anh || ''
  }
} : null;

const mapTimeLogToClient = (tl: any) => tl ? {
  id: tl.id,
  user_id: tl.id_nhan_vien,
  shift: tl.ca_lam,
  check_in_time: tl.gio_vao,
  check_out_time: tl.gio_ra,
  submitted_at: tl.thoi_gian_thuc_vao,
  real_check_out_time: tl.thoi_gian_thuc_ra,
  latitude: Number(tl.vi_do),
  longitude: Number(tl.kinh_do),
  location_address: tl.dia_chi,
  ghi_chu_vao: tl.ghi_chu_vao || '',
  ghi_chu_ra: tl.ghi_chu_ra || '',
  status: tl.trang_thai,
  is_edited: tl.sua_lai || false,
  users: tl.nguoidung ? { full_name: tl.nguoidung.ho_ten, email: tl.nguoidung.email } : null
} : null;

const mapLeaveRequestToClient = (lr: any) => lr ? {
  id: lr.id,
  user_id: lr.id_nhan_vien,
  start_date: lr.ngay_bat_dau,
  end_date: lr.ngay_ket_thuc,
  reason: lr.ly_do,
  submitted_at: lr.ngay_nop,
  status: lr.trang_thai,
  users: lr.nguoidung ? { full_name: lr.nguoidung.ho_ten, email: lr.nguoidung.email } : null
} : null;

// UNIFIED DATABASE SERVICE
export const db = {
  // --- USERS (nguoidung) ---
  async login(username: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('nguoidung')
        .select('*')
        .eq('username', username)
        .eq('password', password);
      
      if (!error && data && data.length > 0) {
        return mapUserToClient(data[0]);
      }
    }
    const users = mockDb.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  },

  async getUsers() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('nguoidung').select('*');
      if (!error && data) return data.map(mapUserToClient).filter(Boolean) as any[];
    }
    return mockDb.getUsers();
  },

  async createUser(user: any) {
    const newUser = { id: user.id || generateShortId('u_'), ...user };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('nguoidung').insert([{
        id: newUser.id,
        username: newUser.username,
        password: newUser.password,
        email: newUser.email,
        ho_ten: newUser.full_name,
        vai_tro: newUser.role,
        ngay_tao: newUser.created_at || new Date().toISOString()
      }]).select();
      if (!error && data) return mapUserToClient(data[0]);
    }
    const users = mockDb.getUsers();
    users.push(newUser);
    mockDb.setUsers(users);
    return newUser;
  },

  async updateUser(id: string, updates: any) {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {};
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.password !== undefined) dbUpdates.password = updates.password;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.full_name !== undefined) dbUpdates.ho_ten = updates.full_name;
      if (updates.role !== undefined) dbUpdates.vai_tro = updates.role;

      const { data, error } = await supabase.from('nguoidung').update(dbUpdates).eq('id', id).select();
      if (!error && data) return mapUserToClient(data[0]);
    }
    const users = mockDb.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      mockDb.setUsers(users);
      return users[index];
    }
    return null;
  },

  async deleteUser(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('nguoidung').delete().eq('id', id);
      if (!error) return true;
    }
    const users = mockDb.getUsers();
    const filtered = users.filter(u => u.id !== id);
    mockDb.setUsers(filtered);
    return true;
  },

  // --- TABLES (danhsachban) ---
  async getTables() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('danhsachban').select('*');
      if (!error && data) return data.map(mapTableToClient).filter(Boolean).sort((a: any, b: any) => a.table_name.localeCompare(b.table_name)) as any[];
    }
    return mockDb.getTables().sort((a, b) => a.table_name.localeCompare(b.table_name));
  },

  async updateTableStatus(id: string, status: 'Trống' | 'Đang phục vụ') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('danhsachban').update({ trang_thai: status }).eq('id', id).select();
      if (!error && data) return mapTableToClient(data[0]);
    }
    const tables = mockDb.getTables();
    const idx = tables.findIndex(t => t.id === id);
    if (idx !== -1) {
      tables[idx].status = status;
      mockDb.setTables(tables);
      return tables[idx];
    }
    return null;
  },

  async createTable(table: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('danhsachban').insert([{
        ten_ban: table.table_name,
        suc_chua: table.capacity,
        trang_thai: table.status
      }]).select();
      if (!error && data) return mapTableToClient(data[0]);
    }
    const tables = mockDb.getTables();
    const newTable = { id: generateShortId('tb_'), ...table };
    tables.push(newTable);
    mockDb.setTables(tables);
    return newTable;
  },

  async deleteTable(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('danhsachban').delete().eq('id', id);
      if (!error) return true;
    }
    const tables = mockDb.getTables();
    mockDb.setTables(tables.filter(t => t.id !== id));
    return true;
  },

  // --- CATEGORIES (danhmuc) ---
  async getCategories() {
    if (cachedCategories) return cachedCategories;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('danhmuc').select('*');
      if (!error && data) {
        cachedCategories = data.map(mapCategoryToClient).filter(Boolean).sort((a: any, b: any) => a.name.localeCompare(b.name)) as any[];
        return cachedCategories;
      }
    }
    return mockDb.getCategories().sort((a, b) => a.name.localeCompare(b.name));
  },

  async createCategory(name: string) {
    cachedCategories = null;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('danhmuc').insert([{ ten_danh_muc: name }]).select();
      if (!error && data) return mapCategoryToClient(data[0]);
    }
    const categories = mockDb.getCategories();
    const newCat = { id: generateShortId('c_'), name };
    categories.push(newCat);
    mockDb.setCategories(categories);
    return newCat;
  },

  async deleteCategory(id: string) {
    cachedCategories = null;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('danhmuc').delete().eq('id', id);
      if (!error) return true;
    }
    const categories = mockDb.getCategories();
    mockDb.setCategories(categories.filter(c => c.id !== id));
    return true;
  },

  // --- PRODUCTS (sanpham) ---
  async getProducts() {
    if (cachedProducts) return cachedProducts;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('sanpham').select('*');
      if (!error && data) {
        cachedProducts = data.map(mapProductToClient).filter(Boolean) as any[];
        return cachedProducts;
      }
    }
    return mockDb.getProducts();
  },

  async createProduct(product: any) {
    cachedProducts = null;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('sanpham').insert([{
        id: product.id || generateShortId('p_'),
        id_danh_muc: product.category_id,
        ten_san_pham: product.name,
        don_vi_tinh: product.don_vi_tinh || 'Ly',
        don_gia: product.price,
        gia_von: product.cost_price,
        hinh_anh: product.image_url,
        mo_ta: product.mo_ta || '',
        trang_thai: product.status
      }]).select();
      if (!error && data) return mapProductToClient(data[0]);
    }
    const products = mockDb.getProducts();
    const newProd = { id: generateShortId('p_'), ...product };
    products.push(newProd);
    mockDb.setProducts(products);
    return newProd;
  },

  async updateProduct(id: string, updates: any) {
    cachedProducts = null;
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {};
      if (updates.category_id !== undefined) dbUpdates.id_danh_muc = updates.category_id;
      if (updates.name !== undefined) dbUpdates.ten_san_pham = updates.name;
      if (updates.don_vi_tinh !== undefined) dbUpdates.don_vi_tinh = updates.don_vi_tinh;
      if (updates.price !== undefined) dbUpdates.don_gia = updates.price;
      if (updates.cost_price !== undefined) dbUpdates.gia_von = updates.cost_price;
      if (updates.image_url !== undefined) dbUpdates.hinh_anh = updates.image_url;
      if (updates.mo_ta !== undefined) dbUpdates.mo_ta = updates.mo_ta;
      if (updates.status !== undefined) dbUpdates.trang_thai = updates.status;

      const { data, error } = await supabase.from('sanpham').update(dbUpdates).eq('id', id).select();
      if (!error && data) return mapProductToClient(data[0]);
    }
    const products = mockDb.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updates };
      mockDb.setProducts(products);
      return products[idx];
    }
    return null;
  },

  async deleteProduct(id: string) {
    cachedProducts = null;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('sanpham').delete().eq('id', id);
      if (!error) return true;
    }
    const products = mockDb.getProducts();
    mockDb.setProducts(products.filter(p => p.id !== id));
    return true;
  },

  // --- ORDERS & ORDER ITEMS (hoadon & hoadondetail) ---
  async getOrders() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('hoadon')
        .select(`
          *,
          danhsachban (ten_ban),
          nguoidung (ho_ten)
        `)
        .order('ngay_tao', { ascending: false });
      if (!error && data) return data.map(mapOrderToClient).filter(Boolean) as any[];
    }
    const orders = mockDb.getOrders();
    const tables = mockDb.getTables();
    const users = mockDb.getUsers();
    return orders.map(order => ({
      ...order,
      tables: tables.find(t => t.id === order.table_id) || null,
      users: users.find(u => u.id === order.staff_id) || null
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getOrderItems(orderId: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('hoadondetail')
        .select(`
          *,
          sanpham (hinh_anh)
        `)
        .eq('idhoadon', orderId);
      if (!error && data) return data.map(mapOrderItemToClient).filter(Boolean) as any[];
    }
    const items = mockDb.getOrderItems();
    const products = mockDb.getProducts();
    return items
      .filter(item => item.order_id === orderId)
      .map(item => ({
        ...item,
        products: products.find(p => p.id === item.product_id) || null
      }));
  },  async getAllOrderItems() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('hoadondetail')
        .select(`
          *,
          sanpham (ten_san_pham, hinh_anh)
        `);
      if (!error && data) {
        return data.map(oi => ({
          ...mapOrderItemToClient(oi),
          products: {
            name: oi.sanpham?.ten_san_pham || oi.ten_san_pham || '',
            image_url: oi.sanpham?.hinh_anh || ''
          }
        })).filter(Boolean) as any[];
      }
    }
    return mockDb.getOrderItems();
  },

  async createOrder(orderData: { table_id: string; staff_id: string; total_amount: number; discount?: number; items: any[] }) {
    const { table_id, staff_id, total_amount, discount = 0, items } = orderData;
    const createdAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // Tải trước giá vốn của các sản phẩm để ghi nhận snapshot gia_von vào hoadondetail
      const productIds = items.map(item => item.product_id);
      const { data: dbProducts } = await supabase
        .from('sanpham')
        .select('id, gia_von')
        .in('id', productIds);

      // 1. Lấy thông tin bàn trước để kiểm tra tên bàn
      const { data: tableData } = await supabase
        .from('danhsachban')
        .select('ten_ban')
        .eq('id', table_id)
        .single();
      
      const isTakeaway = tableData?.ten_ban === 'Khách mang về';

      if (!isTakeaway) {
        // Kiểm tra xem có hóa đơn chưa thanh toán cho bàn này hay không
        const { data: existingUnpaidOrder, error: unpaidError } = await supabase
          .from('hoadon')
          .select('*')
          .eq('id_ban', table_id)
          .eq('trang_thai_thanh_toan', 'Chưa thanh toán')
          .order('ngay_tao', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!unpaidError && existingUnpaidOrder) {
          const existingOrderId = existingUnpaidOrder.id;
          const newTotalAmount = Number(existingUnpaidOrder.tong_tien || 0) + total_amount;
          const newDiscount = Number(existingUnpaidOrder.giam_gia || 0) + discount;

          // Cập nhật hóa đơn chính với tổng tiền mới và giảm giá mới
          const { data: updatedOrder, error: updateErr } = await supabase
            .from('hoadon')
            .update({
              tong_tien: newTotalAmount,
              giam_gia: newDiscount
            })
            .eq('id', existingOrderId)
            .select()
            .single();

          if (!updateErr && updatedOrder) {
            // Tải các chi tiết hóa đơn cũ của hóa đơn này
            const { data: existingDetails } = await supabase
              .from('hoadondetail')
              .select('*')
              .eq('idhoadon', existingOrderId);

            const dbInserts: any[] = [];
            const dbUpdates: any[] = [];

            for (const item of items) {
              const matchedDetail = existingDetails?.find(d => d.idsp === item.product_id);
              const dbProd = dbProducts?.find(p => p.id === item.product_id);
              const costPrice = dbProd ? Number(dbProd.gia_von || 0) : 0;

              if (matchedDetail) {
                // Đã có -> Cập nhật số lượng và thành tiền
                const newQty = Number(matchedDetail.so_luong || 0) + item.quantity;
                const newSubtotal = Number(matchedDetail.thanh_tien || 0) + item.subtotal;
                dbUpdates.push(
                  supabase
                    .from('hoadondetail')
                    .update({
                      so_luong: newQty,
                      thanh_tien: newSubtotal
                    })
                    .eq('id', matchedDetail.id)
                );
              } else {
                // Chưa có -> Thêm mới
                dbInserts.push({
                  id: generateShortId('item_'),
                  idhoadon: existingOrderId,
                  idsp: item.product_id,
                  ten_san_pham: item.name || 'Sản phẩm',
                  don_vi_tinh: item.don_vi_tinh || 'Ly',
                  don_gia: item.unit_price || item.price,
                  so_luong: item.quantity,
                  thanh_tien: item.subtotal,
                  ghi_chu: item.notes || '',
                  gia_von: costPrice
                });
              }
            }

            if (dbUpdates.length > 0) {
              await Promise.all(dbUpdates);
            }
            if (dbInserts.length > 0) {
              await supabase.from('hoadondetail').insert(dbInserts);
            }

            return mapOrderToClient(updatedOrder);
          }
        }
      }

      // 2. Nếu chưa có, tạo hóa đơn mới như bình thường
      const orderId = generateShortId('ord_');
      let order = null;
      let orderErr = null;

      const firstAttempt = await supabase
        .from('hoadon')
        .insert([{
          id: orderId,
          id_ban: table_id,
          id_nhan_vien: staff_id,
          tong_tien: total_amount,
          giam_gia: discount,
          trang_thai_thanh_toan: 'Chưa thanh toán',
          ngay_tao: createdAt
        }])
        .select()
        .single();

      if (firstAttempt.error) {
        console.warn('Lỗi ghi hoadon kèm giam_gia, thử lại không kèm giam_gia:', firstAttempt.error);
        const retryAttempt = await supabase
          .from('hoadon')
          .insert([{
            id: orderId,
            id_ban: table_id,
            id_nhan_vien: staff_id,
            tong_tien: total_amount,
            trang_thai_thanh_toan: 'Chưa thanh toán',
            ngay_tao: createdAt
          }])
          .select()
          .single();
        order = retryAttempt.data;
        orderErr = retryAttempt.error;
      } else {
        order = firstAttempt.data;
        orderErr = firstAttempt.error;
      }

      if (!orderErr && order) {
        const orderItemsToInsert = items.map(item => {
          const dbProd = dbProducts?.find(p => p.id === item.product_id);
          const costPrice = dbProd ? Number(dbProd.gia_von || 0) : 0;
          return {
            id: generateShortId('item_'),
            idhoadon: orderId,
            idsp: item.product_id,
            ten_san_pham: item.name || 'Sản phẩm',
            don_vi_tinh: item.don_vi_tinh || 'Ly',
            don_gia: item.unit_price || item.price,
            so_luong: item.quantity,
            thanh_tien: item.subtotal,
            ghi_chu: item.notes || '',
            gia_von: costPrice
          };
        });

        await Promise.all([
          supabase.from('danhsachban').update({ trang_thai: 'Đang phục vụ' }).eq('id', table_id),
          supabase.from('hoadondetail').insert(orderItemsToInsert)
        ]);
        return mapOrderToClient(order);
      }
    }

    // Mock DB Fallback
    const orders = mockDb.getOrders();
    const tables = mockDb.getTables();
    const targetTable = tables.find(t => t.id === table_id);
    const isTakeaway = targetTable?.table_name === 'Khách mang về';

    if (!isTakeaway) {
      const existingUnpaidOrder = orders.find(o => o.table_id === table_id && o.payment_status === 'Chưa thanh toán');

      if (existingUnpaidOrder) {
        const existingOrderId = existingUnpaidOrder.id;
        existingUnpaidOrder.total_amount = Number(existingUnpaidOrder.total_amount || 0) + total_amount;
        existingUnpaidOrder.giam_gia = Number(existingUnpaidOrder.giam_gia || 0) + discount;

        mockDb.setOrders(orders);

        const orderItems = mockDb.getOrderItems();
        const products = mockDb.getProducts();

        items.forEach((item) => {
          const matchedItem = orderItems.find(
            oi => oi.order_id === existingOrderId && oi.product_id === item.product_id
          );
          if (matchedItem) {
            matchedItem.quantity = Number(matchedItem.quantity || 0) + item.quantity;
            matchedItem.subtotal = Number(matchedItem.subtotal || 0) + item.subtotal;
          } else {
            const prod = products.find(p => p.id === item.product_id);
            orderItems.push({
              id: generateShortId('item_'),
              order_id: existingOrderId,
              product_id: item.product_id,
              ten_san_pham: prod ? prod.name : 'Sản phẩm',
              don_vi_tinh: prod ? (prod as any).don_vi_tinh : 'Ly',
              quantity: item.quantity,
              unit_price: item.unit_price || item.price,
              subtotal: item.subtotal,
              ghi_chu: item.notes || '',
              gia_von: prod ? Number(prod.cost_price || 0) : 0
            });
          }
        });
        mockDb.setOrderItems(orderItems);
        return existingUnpaidOrder;
      }
    }

    const orderId = generateShortId('ord_');
    const newOrder = {
      id: orderId,
      table_id,
      staff_id,
      total_amount,
      giam_gia: discount,
      payment_status: 'Chưa thanh toán' as const,
      payment_method: null,
      created_at: createdAt,
      paid_at: null
    };
    orders.push(newOrder);
    mockDb.setOrders(orders);

    const tIdx = tables.findIndex(t => t.id === table_id);
    if (tIdx !== -1) {
      tables[tIdx].status = 'Đang phục vụ';
      mockDb.setTables(tables);
    }

    const orderItems = mockDb.getOrderItems();
    const products = mockDb.getProducts();
    const newItems = items.map((item) => {
      const prod = products.find(p => p.id === item.product_id);
      return {
        id: generateShortId('item_'),
        order_id: orderId,
        product_id: item.product_id,
        ten_san_pham: prod ? prod.name : 'Sản phẩm',
        don_vi_tinh: prod ? (prod as any).don_vi_tinh : 'Ly',
        quantity: item.quantity,
        unit_price: item.unit_price || item.price,
        subtotal: item.subtotal,
        ghi_chu: item.notes || '',
        gia_von: prod ? Number(prod.cost_price || 0) : 0
      };
    });
    mockDb.setOrderItems([...orderItems, ...newItems]);

    return newOrder;
  },

  async payOrder(orderId: string, paymentMethod: 'Tiền mặt' | 'Chuyển khoản') {
    const paidAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // Song song: lấy thông tin bàn + lấy danh sách items cùng lúc
      const [orderResult, itemsResult] = await Promise.all([
        supabase.from('hoadon').select('id_ban').eq('id', orderId).single(),
        supabase.from('hoadondetail').select('idsp, so_luong').eq('idhoadon', orderId)
      ]);
      const order = orderResult.data;
      const items = itemsResult.data;

      // Trừ kho nguyên liệu khi thanh toán
      if (items && items.length > 0) {
        const cartItems = items.map(item => ({ product_id: item.idsp, quantity: item.so_luong }));
        await this.deductStockFromOrder(cartItems);
      }

      // Song song: cập nhật trạng thái thanh toán + cập nhật trạng thái bàn cùng lúc
      const updatePromises: any[] = [
        supabase
          .from('hoadon')
          .update({
            trang_thai_thanh_toan: 'Đã thanh toán',
            phuong_thuc_thanh_toan: paymentMethod,
            ngay_thanh_toan: paidAt
          })
          .eq('id', orderId)
          .select()
          .single()
      ];
      if (order?.id_ban) {
        updatePromises.push(
          supabase.from('danhsachban').update({ trang_thai: 'Trống' }).eq('id', order.id_ban)
        );
      }
      const [payResult] = await Promise.all(updatePromises);
      if (!payResult.error && payResult.data) {
        return mapOrderToClient(payResult.data);
      }
    }

    const orders = mockDb.getOrders();
    const oIdx = orders.findIndex(o => o.id === orderId);
    if (oIdx !== -1) {
      // Trừ kho nguyên liệu trong Mock DB khi thanh toán
      const items = mockDb.getOrderItems().filter(item => item.order_id === orderId);
      if (items && items.length > 0) {
        const cartItems = items.map(item => ({ product_id: item.product_id, quantity: item.quantity }));
        await this.deductStockFromOrder(cartItems);
      }

      orders[oIdx].payment_status = 'Đã thanh toán';
      orders[oIdx].payment_method = paymentMethod;
      orders[oIdx].paid_at = paidAt;
      mockDb.setOrders(orders);

      const tableId = orders[oIdx].table_id;
      const tables = mockDb.getTables();
      const tIdx = tables.findIndex(t => t.id === tableId);
      if (tIdx !== -1) {
        tables[tIdx].status = 'Trống';
        mockDb.setTables(tables);
      }
      return orders[oIdx];
    }
    return null;
  },

  async cancelOrder(orderId: string) {
    if (isSupabaseConfigured && supabase) {
      const { data: order } = await supabase.from('hoadon').select('id_ban').eq('id', orderId).single();
      
      // 1. Delete details
      await supabase.from('hoadondetail').delete().eq('idhoadon', orderId);
      
      // 2. Delete main order
      const { error } = await supabase.from('hoadon').delete().eq('id', orderId);
      
      if (!error && order?.id_ban) {
        // 3. Reset table status
        await supabase.from('danhsachban').update({ trang_thai: 'Trống' }).eq('id', order.id_ban);
        return true;
      }
      return false;
    }

    // Mock DB Fallback
    const orders = mockDb.getOrders();
    const oIdx = orders.findIndex(o => o.id === orderId);
    if (oIdx !== -1) {
      const tableId = orders[oIdx].table_id;
      
      // Xóa hóa đơn
      orders.splice(oIdx, 1);
      mockDb.setOrders(orders);
      
      // Xóa chi tiết hóa đơn
      const allItems = mockDb.getOrderItems();
      const filteredItems = allItems.filter(item => item.order_id !== orderId);
      mockDb.setOrderItems(filteredItems);
      
      // Giải phóng bàn
      const tables = mockDb.getTables();
      const tIdx = tables.findIndex(t => t.id === tableId);
      if (tIdx !== -1) {
        tables[tIdx].status = 'Trống';
        mockDb.setTables(tables);
      }
      return true;
    }
    return false;
  },

  async cancelPaidOrder(orderId: string) {
    try {
      let items: any[] = [];
      if (isSupabaseConfigured && supabase) {
        // 1. Lấy chi tiết hóa đơn từ Supabase
        const { data: dbItems } = await supabase
          .from('hoadondetail')
          .select('idsp, so_luong')
          .eq('idhoadon', orderId);
        
        if (dbItems && dbItems.length > 0) {
          items = dbItems.map(item => ({
            product_id: item.idsp,
            quantity: item.so_luong
          }));
        }
      } else {
        // Mock DB
        const mockItems = mockDb.getOrderItems().filter(item => item.order_id === orderId);
        items = mockItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }));
      }

      // 2. Hoàn lại tồn kho
      if (items.length > 0) {
        await this.restoreStockFromOrder(items);
      }

      // 3. Xóa hóa đơn và chi tiết
      const success = await this.cancelOrder(orderId);
      return success;
    } catch (e) {
      console.error('Lỗi khi hủy hóa đơn đã thanh toán:', e);
      return false;
    }
  },

  async getYesterdayProductSales(): Promise<{ [productId: string]: number }> {
    const yesterdaySales: { [productId: string]: number } = {};
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (isSupabaseConfigured && supabase) {
        const yest = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const yestStr = yest.toISOString().split('T')[0];
        const startOfYest = `${yestStr}T00:00:00+07:00`;
        const endOfYest = `${yestStr}T23:59:59+07:00`;

        const { data: orders } = await supabase
          .from('hoadon')
          .select('id')
          .eq('trang_thai_thanh_toan', 'Đã thanh toán')
          .gte('ngay_thanh_toan', startOfYest)
          .lte('ngay_thanh_toan', endOfYest);

        if (orders && orders.length > 0) {
          const orderIds = orders.map(o => o.id);
          const { data: items } = await supabase
            .from('hoadondetail')
            .select('idsp, so_luong')
            .in('idhoadon', orderIds);

          if (items) {
            items.forEach(item => {
              yesterdaySales[item.idsp] = (yesterdaySales[item.idsp] || 0) + Number(item.so_luong || 0);
            });
          }
        }
        return yesterdaySales;
      }

      // Mock DB Fallback
      const orders = mockDb.getOrders().filter(o => {
        if (o.payment_status !== 'Đã thanh toán') return false;
        const date = new Date(o.created_at || o.paid_at);
        return date.toDateString() === yesterdayStr;
      });

      const orderItems = mockDb.getOrderItems();
      orders.forEach(order => {
        const items = orderItems.filter(item => item.order_id === order.id);
        items.forEach(item => {
          yesterdaySales[item.product_id] = (yesterdaySales[item.product_id] || 0) + Number(item.quantity || 0);
        });
      });
    } catch (e) {
      console.error('Lỗi khi lấy doanh số hôm qua:', e);
    }
    return yesterdaySales;
  },

  async deleteOrderItem(orderId: string, itemId: string, quantityToRemove?: number) {
    if (isSupabaseConfigured && supabase) {
      if (quantityToRemove && quantityToRemove > 0) {
        // Lấy chi tiết món ăn hiện tại
        const { data: detail } = await supabase
          .from('hoadondetail')
          .select('so_luong, don_gia')
          .eq('id', itemId)
          .single();

        if (detail) {
          const currentQty = Number(detail.so_luong || 0);
          if (currentQty > quantityToRemove) {
            // Cập nhật giảm bớt số lượng
            const newQty = currentQty - quantityToRemove;
            const newSubtotal = newQty * Number(detail.don_gia || 0);
            await supabase
              .from('hoadondetail')
              .update({
                so_luong: newQty,
                thanh_tien: newSubtotal
              })
              .eq('id', itemId);
          } else {
            // Xóa luôn
            await supabase.from('hoadondetail').delete().eq('id', itemId);
          }
        }
      } else {
        // Xóa hoàn toàn món ăn khỏi chi tiết
        await supabase.from('hoadondetail').delete().eq('id', itemId);
      }

      // 2. Lấy danh sách món ăn còn lại
      const { data: remaining } = await supabase
        .from('hoadondetail')
        .select('thanh_tien')
        .eq('idhoadon', orderId);

      if (!remaining || remaining.length === 0) {
        // Hóa đơn không còn món nào -> Hủy/Xóa luôn hóa đơn
        await this.cancelOrder(orderId);
        return { orderDeleted: true };
      }

      // 3. Tính toán lại tổng tiền và giảm giá
      const sumRemaining = remaining.reduce((sum, item) => sum + Number(item.thanh_tien || 0), 0);
      const { data: order } = await supabase.from('hoadon').select('giam_gia').eq('id', orderId).single();
      const newDiscount = Math.min(sumRemaining, Number(order?.giam_gia || 0));
      const newTotal = Math.max(0, sumRemaining - newDiscount);

      // 4. Cập nhật hóa đơn
      await supabase
        .from('hoadon')
        .update({
          tong_tien: newTotal,
          giam_gia: newDiscount
        })
        .eq('id', orderId);

      return { orderDeleted: false, newTotal, newDiscount };
    }

    // Mock DB Fallback
    const orderItems = mockDb.getOrderItems();
    const itemIdx = orderItems.findIndex(item => item.id === itemId);
    if (itemIdx !== -1) {
      const item = orderItems[itemIdx];
      const currentQty = Number(item.quantity || 0);
      if (quantityToRemove && quantityToRemove > 0 && currentQty > quantityToRemove) {
        item.quantity = currentQty - quantityToRemove;
        item.subtotal = item.quantity * Number(item.unit_price || 0);
      } else {
        orderItems.splice(itemIdx, 1);
      }
      mockDb.setOrderItems(orderItems);
    }

    const remaining = orderItems.filter(item => item.order_id === orderId);
    if (remaining.length === 0) {
      await this.cancelOrder(orderId);
      return { orderDeleted: true };
    }

    const sumRemaining = remaining.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const orders = mockDb.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const newDiscount = Math.min(sumRemaining, Number(order.giam_gia || 0));
      order.giam_gia = newDiscount;
      order.total_amount = Math.max(0, sumRemaining - newDiscount);
      mockDb.setOrders(orders);
      return { orderDeleted: false, newTotal: order.total_amount, newDiscount };
    }

    return { orderDeleted: false, newTotal: 0, newDiscount: 0 };
  },

  // --- TIME LOGS (chamcong) ---
  async getTimeLogs() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('chamcong')
        .select(`
          *,
          nguoidung (ho_ten, email)
        `)
        .order('thoi_gian_thuc_vao', { ascending: false });
      if (!error && data) return data.map(mapTimeLogToClient).filter(Boolean) as any[];
    }
    const logs = mockDb.getTimeLogs();
    const users = mockDb.getUsers();
    return logs.map(log => ({
      ...log,
      users: users.find(u => u.id === log.user_id) || null
    })).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  },

  async createTimeLog(log: { 
    user_id: string; 
    shift: string; 
    check_in_time: string; 
    latitude: number; 
    longitude: number; 
    location_address: string;
    ghi_chu_vao?: string;
  }) {
    const newLog = {
      id: generateShortId('log_'),
      user_id: log.user_id,
      shift: log.shift,
      check_in_time: log.check_in_time,
      check_out_time: null,
      submitted_at: new Date().toISOString(),
      real_check_out_time: null,
      latitude: log.latitude,
      longitude: log.longitude,
      location_address: log.location_address,
      ghi_chu_vao: log.ghi_chu_vao || '',
      ghi_chu_ra: '',
      status: 'Đang trong ca' as const
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('chamcong').insert([{
        id: newLog.id,
        id_nhan_vien: log.user_id,
        ca_lam: log.shift,
        gio_vao: log.check_in_time,
        gio_ra: null,
        thoi_gian_thuc_vao: newLog.submitted_at,
        thoi_gian_thuc_ra: null,
        vi_do: log.latitude,
        kinh_do: log.longitude,
        dia_chi: log.location_address,
        ghi_chu_vao: log.ghi_chu_vao || null,
        ghi_chu_ra: null,
        trang_thai: 'Đang trong ca'
      }]).select();
      if (!error && data) return mapTimeLogToClient(data[0]);
    }

    const logs = mockDb.getTimeLogs();
    logs.push(newLog);
    mockDb.setTimeLogs(logs);
    return newLog;
  },

  async checkOutTimeLog(logId: string, checkOutData: {
    check_out_time: string;
    latitude: number;
    longitude: number;
    location_address: string;
    ghi_chu_ra?: string;
  }) {
    const realCheckOut = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('chamcong')
        .update({
          gio_ra: checkOutData.check_out_time,
          thoi_gian_thuc_ra: realCheckOut,
          vi_do: checkOutData.latitude,
          kinh_do: checkOutData.longitude,
          dia_chi: checkOutData.location_address,
          ghi_chu_ra: checkOutData.ghi_chu_ra || null,
          trang_thai: 'Chờ duyệt'
        })
        .eq('id', logId)
        .select();
      if (!error && data) return mapTimeLogToClient(data[0]);
    }

    const logs = mockDb.getTimeLogs();
    const idx = logs.findIndex(l => l.id === logId);
    if (idx !== -1) {
      logs[idx].check_out_time = checkOutData.check_out_time;
      logs[idx].real_check_out_time = realCheckOut;
      logs[idx].latitude = checkOutData.latitude;
      logs[idx].longitude = checkOutData.longitude;
      logs[idx].location_address = checkOutData.location_address;
      logs[idx].ghi_chu_ra = checkOutData.ghi_chu_ra || '';
      logs[idx].status = 'Chờ duyệt';
      mockDb.setTimeLogs(logs);
      return logs[idx];
    }
    return null;
  },

  async approveTimeLog(id: string, status: 'Đã duyệt' | 'Từ chối') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('chamcong').update({ trang_thai: status }).eq('id', id).select();
      if (!error && data) return mapTimeLogToClient(data[0]);
    }
    const logs = mockDb.getTimeLogs();
    const idx = logs.findIndex(l => l.id === id);
    if (idx !== -1) {
      logs[idx].status = status;
      mockDb.setTimeLogs(logs);
      return logs[idx];
    }
    return null;
  },

  async updateTimeLogRequest(logId: string, updates: {
    check_in_time: string;
    check_out_time: string | null;
    ghi_chu_vao: string;
  }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('chamcong')
        .update({
          gio_vao: updates.check_in_time,
          gio_ra: updates.check_out_time,
          ghi_chu_vao: updates.ghi_chu_vao,
          trang_thai: 'Chờ duyệt',
          sua_lai: true
        })
        .eq('id', logId)
        .select();
      if (!error && data) return mapTimeLogToClient(data[0]);
    }

    const logs = mockDb.getTimeLogs();
    const idx = logs.findIndex(l => l.id === logId);
    if (idx !== -1) {
      logs[idx].check_in_time = updates.check_in_time;
      logs[idx].check_out_time = updates.check_out_time;
      logs[idx].ghi_chu_vao = updates.ghi_chu_vao;
      logs[idx].status = 'Chờ duyệt';
      logs[idx].sua_lai = true;
      mockDb.setTimeLogs(logs);
      return logs[idx];
    }
    return null;
  },

  // --- LEAVE REQUESTS (nghiphep) ---
  async getLeaveRequests() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('nghiphep')
        .select(`
          *,
          nguoidung (ho_ten, email)
        `)
        .order('ngay_nop', { ascending: false });
      if (!error && data) return data.map(mapLeaveRequestToClient).filter(Boolean) as any[];
    }
    const requests = mockDb.getLeaveRequests();
    const users = mockDb.getUsers();
    return requests.map(req => ({
      ...req,
      users: users.find(u => u.id === req.user_id) || null
    })).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  },

  async createLeaveRequest(req: { user_id: string; start_date: string; end_date: string; reason: string }) {
    const newReq = {
      id: generateShortId('lv_'),
      ...req,
      submitted_at: new Date().toISOString(),
      status: 'Chờ duyệt' as const
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('nghiphep').insert([{
        id_nhan_vien: req.user_id,
        ngay_bat_dau: req.start_date,
        ngay_ket_thuc: req.end_date,
        ly_do: req.reason
      }]).select();
      if (!error && data) return mapLeaveRequestToClient(data[0]);
    }

    const requests = mockDb.getLeaveRequests();
    requests.push(newReq);
    mockDb.setLeaveRequests(requests);
    return newReq;
  },

  async approveLeaveRequest(id: string, status: 'Đã duyệt' | 'Từ chối') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('nghiphep').update({ trang_thai: status }).eq('id', id).select();
      if (!error && data) return mapLeaveRequestToClient(data[0]);
    }
    const requests = mockDb.getLeaveRequests();
    const idx = requests.findIndex(r => r.id === id);
    if (idx !== -1) {
      requests[idx].status = status;
      mockDb.setLeaveRequests(requests);
      return requests[idx];
    }
    return null;
  },

  async checkDailyRollover() {
    if (typeof window === 'undefined') return;
    const todayStr = new Date().toLocaleDateString('en-CA');
    const lastRollover = localStorage.getItem('ava_last_rollover_date');
    if (lastRollover !== todayStr) {
      try {
        let ingredients: any[] = [];
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.from('nguyenlieu').select('*');
          if (data) {
            ingredients = data.map(ing => ({
              id: ing.id,
              name: ing.ten_nguyen_lieu,
              unit: ing.don_vi_tinh,
              stock_quantity: Number(ing.so_luong_ton),
              opening_stock: Number(ing.so_luong_ton),
              min_stock: ing.muc_canh_bao !== null ? Number(ing.muc_canh_bao) : null,
              quy_cach: ing.quy_cach,
              don_gia_nhap: Number(ing.don_gia_nhap || 0)
            }));
          }
        } else {
          ingredients = mockDb.getIngredients().map(ing => ({
            ...ing,
            don_gia_nhap: Number((ing as any).don_gia_nhap || 0)
          }));
        }

        localStorage.setItem('ava_last_rollover_date', todayStr);
      } catch (e) {
        console.error('Lỗi khi rollover ngày mới cho kho:', e);
      }
    }
  },

  // --- NGUYÊN LIỆU & KHO (nguyenlieu, congthuc, lichsukho) ---
  async getIngredients() {
    await this.checkDailyRollover();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('nguyenlieu')
        .select('*')
        .order('ten_nguyen_lieu', { ascending: true });
      if (!error && data) {
        return data.map(ing => ({
          id: ing.id,
          name: ing.ten_nguyen_lieu,
          unit: ing.don_vi_tinh,
          stock_quantity: Number(ing.so_luong_ton),
          opening_stock: Number(ing.so_luong_ton),
          min_stock: ing.muc_canh_bao !== null ? Number(ing.muc_canh_bao) : null,
          quy_cach: ing.quy_cach,
          don_gia_nhap: Number(ing.don_gia_nhap || 0),
          gia_von_trung_binh: Number(ing.gia_von_trung_binh || ing.don_gia_nhap || 0)
        }));
      }
    }
    return mockDb.getIngredients().map(ing => ({
      ...ing,
      don_gia_nhap: Number((ing as any).don_gia_nhap || 0),
      gia_von_trung_binh: Number((ing as any).gia_von_trung_binh || (ing as any).don_gia_nhap || 0)
    }));
  },

  async getRecipes() {
    if (cachedRecipes) return cachedRecipes;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('congthuc').select('*');
      if (!error && data) {
        cachedRecipes = data.map(rec => ({
          id: rec.id,
          product_id: rec.id_san_pham,
          ingredient_id: rec.id_nguyen_lieu,
          quantity_needed: Number(rec.so_luong_can),
          unit: rec.don_vi_tinh
        }));
        return cachedRecipes;
      }
    }
    return mockDb.getRecipes();
  },

  async getProductRecipes(productId: string) {
    const allRecipes = await this.getRecipes();
    const allIngredients = await this.getIngredients();
    const recipesForProduct = allRecipes.filter(r => r.product_id === productId);
    
    return recipesForProduct.map(r => {
      const ing = allIngredients.find(i => i.id === r.ingredient_id);
      return {
        ...r,
        ingredient_name: ing ? ing.name : 'Nguyên liệu',
        ingredient_unit: r.unit || (ing ? ing.unit : '')
      };
    });
  },

  async getInventoryLogs() {
    this.consolidateDuplicateSalesLogs().catch(err => console.error(err));
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('lichsukho')
        .select(`
          *,
          nguyenlieu (ten_nguyen_lieu, don_vi_tinh),
          nguoidung (ho_ten)
        `)
        .order('thoi_gian_tao', { ascending: false });
      if (!error && data) {
        return data.map(log => ({
          id: log.id,
          ingredient_id: log.id_nguyen_lieu,
          custom_ingredient_name: log.ten_nguyen_lieu_khac,
          change_amount: Number(log.so_luong_thay_doi),
          type: log.loai_giao_dich,
          cost: Number(log.chi_phi || 0),
          note: log.ghi_chu,
          staff_id: log.id_nhan_vien,
          staff_name: log.nguoidung?.ho_ten || 'Nhân viên',
          ingredient_name: log.nguyenlieu?.ten_nguyen_lieu || log.ten_nguyen_lieu_khac || 'Khác',
          ingredient_unit: log.nguyenlieu?.don_vi_tinh || '',
          created_at: log.thoi_gian_tao,
          status: log.trang_thai
        }));
      }
    }
    const logs = mockDb.getInventoryLogs();
    const ingredients = mockDb.getIngredients();
    const users = mockDb.getUsers();
    return logs.map(log => {
      const ing = ingredients.find(i => i.id === log.ingredient_id);
      const user = users.find(u => u.id === log.staff_id);
      return {
        ...log,
        staff_name: user?.full_name || 'Nhân viên',
        ingredient_name: ing?.name || log.custom_ingredient_name || 'Khác',
        ingredient_unit: ing?.unit || ''
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Nhập thêm nguyên liệu (Restock) - Cộng kho ngay lập tức & Trừ nguyên liệu thô nếu là món tự pha chế
  async restockIngredient(payload: {
    ingredient_id?: string;
    custom_ingredient_name?: string;
    change_amount: number;
    cost: number;
    note?: string;
    staff_id: string;
  }) {
    const isCustom = !payload.ingredient_id || payload.ingredient_id === 'other';
    const logId = generateShortId('inv_');
    const newLog = {
      id: logId,
      ingredient_id: isCustom ? null : payload.ingredient_id,
      custom_ingredient_name: isCustom ? payload.custom_ingredient_name : null,
      change_amount: payload.change_amount,
      type: 'Nhập kho' as const,
      cost: payload.cost,
      note: payload.note || '',
      staff_id: payload.staff_id,
      created_at: new Date().toISOString(),
      status: 'Chờ duyệt' as const
    };

    const ingredients = await this.getIngredients();

    // 1. Nếu là món có trong danh mục kho -> Cộng tồn kho ngay lập tức
    if (!isCustom && payload.ingredient_id) {
      if (isSupabaseConfigured && supabase) {
        // Tạo phiếu nhập kho và chi tiết phiếu nhập -> Kích hoạt trigger tự động cập nhật nguyenlieu và gia_von_trung_binh
        const phieuId = generateShortId('phieu_');
        const maPhieu = 'PNK-' + generateShortId('').toUpperCase();
        const donGiaNhap = payload.change_amount > 0 ? (payload.cost / payload.change_amount) : 0;
        
        await supabase.from('phieunhapkho').insert({
          id: phieuId,
          ma_phieu: maPhieu,
          id_nhan_vien: payload.staff_id,
          nha_cung_cap: 'AVA Coffee Supplier',
          tong_tien: payload.cost,
          ghi_chu: payload.note || 'Nhập kho nguyên liệu',
          ngay_nhap: new Date().toISOString()
        });

        await supabase.from('chitietnhapkho').insert({
          id: generateShortId('ct_'),
          id_phieu_nhap: phieuId,
          id_nguyen_lieu: payload.ingredient_id,
          so_luong: payload.change_amount,
          don_gia_nhap: donGiaNhap,
          thanh_tien: payload.cost
        });
      } else {
        const ing = ingredients.find(i => i.id === payload.ingredient_id);
        const donGiaNhap = payload.change_amount > 0 ? (payload.cost / payload.change_amount) : 0;
        if (ing) {
          const v_ton_hien_tai = Number(ing.stock_quantity || 0);
          const v_gia_von_cu = Number((ing as any).gia_von_trung_binh || (ing as any).don_gia_nhap || 0);
          const newQty = v_ton_hien_tai + payload.change_amount;
          
          let newGiaVon = 0;
          if (newQty > 0) {
            newGiaVon = ((v_ton_hien_tai * v_gia_von_cu) + payload.cost) / newQty;
          } else {
            newGiaVon = donGiaNhap;
          }
          
          ing.stock_quantity = newQty;
          (ing as any).don_gia_nhap = donGiaNhap;
          (ing as any).gia_von_trung_binh = newGiaVon;
          mockDb.setIngredients(ingredients);
        }

        // Tự động tính toán lại giá vốn của các sản phẩm sử dụng nguyên liệu này (offline fallback)
        try {
          await this.recalculateProductsCostPriceByIngredient(payload.ingredient_id);
        } catch (err) {
          console.error('Error recalculating cost price:', err);
        }
      }
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lichsukho').insert([{
        id: logId,
        id_nguyen_lieu: isCustom ? null : payload.ingredient_id,
        ten_nguyen_lieu_khac: isCustom ? payload.custom_ingredient_name : null,
        so_luong_thay_doi: payload.change_amount,
        loai_giao_dich: 'Nhập kho',
        chi_phi: payload.cost,
        ghi_chu: payload.note || '',
        id_nhan_vien: payload.staff_id,
        trang_thai: 'Chờ duyệt'
      }]);
    } else {
      const logs = mockDb.getInventoryLogs();
      logs.push(newLog);
      mockDb.setInventoryLogs(logs);
    }

    return newLog;
  },

  // Kiểm kho Cuối ngày / Cuối tuần (Stocktake)
  async submitStocktake(payload: {
    ingredient_id: string;
    actual_stock: number;
    system_stock: number;
    note?: string;
    staff_id: string;
  }) {
    const diff = payload.actual_stock - payload.system_stock;
    const logId = generateShortId('inv_');
    const newLog = {
      id: logId,
      ingredient_id: payload.ingredient_id,
      custom_ingredient_name: null,
      change_amount: diff,
      type: 'Hao hụt/Cân lại' as const,
      cost: 0,
      note: `Kiểm kho thực tế: ${payload.actual_stock} (Hệ thống: ${payload.system_stock}). ${payload.note || ''}`,
      staff_id: payload.staff_id,
      created_at: new Date().toISOString(),
      status: 'Chờ duyệt' as const
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lichsukho').insert([{
        id: logId,
        id_nguyen_lieu: payload.ingredient_id,
        so_luong_thay_doi: diff,
        loai_giao_dich: 'Hao hụt/Cân lại',
        chi_phi: 0,
        ghi_chu: newLog.note,
        id_nhan_vien: payload.staff_id,
        trang_thai: 'Chờ duyệt'
      }]);
    } else {
      const logs = mockDb.getInventoryLogs();
      logs.push(newLog);
      mockDb.setInventoryLogs(logs);
    }

    return newLog;
  },

  // Admin Phê duyệt / Từ chối đơn Nhập kho & Kiểm kho
  async approveInventoryLog(id: string, status: 'Đã duyệt' | 'Từ chối') {
    const logs = await this.getInventoryLogs();
    const targetLog = logs.find(l => l.id === id);
    if (!targetLog) return null;

    targetLog.status = status;

    const ingredients = await this.getIngredients();

    // Nếu từ chối đơn "Nhập kho" -> Trừ lại số lượng đã cộng trước đó
    if (status === 'Từ chối' && targetLog.type === 'Nhập kho' && targetLog.ingredient_id) {
      const ing = ingredients.find(i => i.id === targetLog.ingredient_id);
      if (ing) {
        ing.stock_quantity = Math.max(0, Number(ing.stock_quantity) - targetLog.change_amount);
        if (isSupabaseConfigured && supabase) {
          await supabase.from('nguyenlieu').update({ so_luong_ton: ing.stock_quantity }).eq('id', targetLog.ingredient_id);
        } else {
          mockDb.setIngredients(ingredients);
        }
      }
    }
    // Nếu chấp nhận đơn "Hao hụt/Cân lại" -> Cập nhật tồn kho theo số chênh lệch kiểm kho
    else if (status === 'Đã duyệt' && targetLog.type === 'Hao hụt/Cân lại' && targetLog.ingredient_id) {
      const ing = ingredients.find(i => i.id === targetLog.ingredient_id);
      if (ing) {
        ing.stock_quantity = Math.max(0, Number(ing.stock_quantity) + targetLog.change_amount);
        if (isSupabaseConfigured && supabase) {
          await supabase.from('nguyenlieu').update({ so_luong_ton: ing.stock_quantity }).eq('id', targetLog.ingredient_id);
        } else {
          mockDb.setIngredients(ingredients);
        }
      }
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lichsukho').update({ trang_thai: status }).eq('id', id);
    } else {
      mockDb.setInventoryLogs(logs);
    }

    return targetLog;
  },

  // --- BATCH APPROVE (Duyệt hàng loạt) ---
  async approveAllTimeLogs(ids: string[], status: 'Đã duyệt' | 'Từ chối') {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('chamcong').update({ trang_thai: status }).in('id', ids);
    } else {
      const logs = mockDb.getTimeLogs();
      ids.forEach(id => { const l = logs.find(x => x.id === id); if (l) l.status = status; });
      mockDb.setTimeLogs(logs);
    }
  },

  async approveAllLeaveRequests(ids: string[], status: 'Đã duyệt' | 'Từ chối') {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('nghiphep').update({ trang_thai: status }).in('id', ids);
    } else {
      const requests = mockDb.getLeaveRequests();
      ids.forEach(id => { const r = requests.find(x => x.id === id); if (r) r.status = status; });
      mockDb.setLeaveRequests(requests);
    }
  },

  async approveAllInventoryLogs(ids: string[], status: 'Đã duyệt' | 'Từ chối') {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('lichsukho').update({ trang_thai: status }).in('id', ids);
    } else {
      const logs = mockDb.getInventoryLogs();
      ids.forEach(id => { const l = logs.find(x => x.id === id); if (l) l.status = status; });
      mockDb.setInventoryLogs(logs);
    }
  },

  async recalculateProductCostPrice(productId: string) {
    try {
      const allRecipes = await this.getRecipes();
      const productRecipes = allRecipes.filter(r => r.product_id === productId);
      const allIngredients = await this.getIngredients();
      
      let totalCost = 0;
      for (const recipe of productRecipes) {
        const ing = allIngredients.find(i => i.id === recipe.ingredient_id);
        const costPrice = ing ? Number((ing as any).gia_von_trung_binh || (ing as any).don_gia_nhap || 0) : 0;
        totalCost += recipe.quantity_needed * costPrice;
      }
      
      totalCost = Math.round(totalCost * 100) / 100;
      
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('sanpham')
          .update({ gia_von: totalCost })
          .eq('id', productId);
      } else {
        const products = mockDb.getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
          product.cost_price = totalCost;
          mockDb.setProducts(products);
        }
      }
      return totalCost;
    } catch (e) {
      console.error('Lỗi khi tính toán lại giá vốn cho sản phẩm:', productId, e);
      return 0;
    }
  },

  async recalculateProductsCostPriceByIngredient(ingredientId: string) {
    try {
      const allRecipes = await this.getRecipes();
      const productIds = allRecipes
        .filter(r => r.ingredient_id === ingredientId)
        .map(r => r.product_id);
      
      const uniqueProductIds = Array.from(new Set(productIds));
      for (const pId of uniqueProductIds) {
        await this.recalculateProductCostPrice(pId);
      }
    } catch (e) {
      console.error('Lỗi khi tính toán lại giá vốn theo nguyên liệu:', ingredientId, e);
    }
  },

  // Hoàn trả kho nguyên liệu khi hủy đơn hàng
  async restoreStockFromOrder(items: Array<{ product_id: string; quantity: number }>) {
    try {
      const recipes = await this.getRecipes();
      const ingredients = await this.getIngredients();
      let updated = false;

      // Group ingredient changes
      const ingChanges: { [id: string]: { restoreQty: number; productIds: string[] } } = {};

      for (const item of items) {
        const itemRecipes = recipes.filter(r => r.product_id === item.product_id);
        for (const rec of itemRecipes) {
          const restoreQty = rec.quantity_needed * item.quantity;
          if (!ingChanges[rec.ingredient_id]) {
            ingChanges[rec.ingredient_id] = { restoreQty: 0, productIds: [] };
          }
          ingChanges[rec.ingredient_id].restoreQty += restoreQty;
          if (!ingChanges[rec.ingredient_id].productIds.includes(item.product_id)) {
            ingChanges[rec.ingredient_id].productIds.push(item.product_id);
          }
        }
      }

      const dbUpdates: any[] = [];
      const historyLogsToInsert: any[] = [];

      for (const ingId in ingChanges) {
        const ing = ingredients.find(i => i.id === ingId);
        if (ing) {
          const { restoreQty, productIds } = ingChanges[ingId];
          ing.stock_quantity = Number(ing.stock_quantity) + restoreQty;
          updated = true;

          if (isSupabaseConfigured && supabase) {
            dbUpdates.push(
              supabase.from('nguyenlieu').update({ so_luong_ton: ing.stock_quantity }).eq('id', ing.id)
            );
            historyLogsToInsert.push({
              id: generateShortId('inv_'),
              id_nguyen_lieu: ing.id,
              so_luong_thay_doi: restoreQty,
              loai_giao_dich: 'Khác',
              chi_phi: 0,
              ghi_chu: `Hoàn kho do hủy đơn hàng (Mã SP: ${productIds.join(', ')})`,
              trang_thai: 'Đã duyệt'
            });
          } else {
            const logs = mockDb.getInventoryLogs();
            logs.push({
              id: generateShortId('inv_'),
              ingredient_id: ing.id,
              custom_ingredient_name: null,
              change_amount: restoreQty,
              type: 'Khác' as const,
              cost: 0,
              note: `Hoàn kho do hủy đơn hàng (Mã SP: ${productIds.join(', ')})`,
              staff_id: 'system',
              created_at: new Date().toISOString(),
              status: 'Đã duyệt' as const
            });
            mockDb.setInventoryLogs(logs);
          }
        }
      }

      if (isSupabaseConfigured && supabase) {
        if (dbUpdates.length > 0) {
          await Promise.all(dbUpdates);
        }
        if (historyLogsToInsert.length > 0) {
          await supabase.from('lichsukho').insert(historyLogsToInsert);
        }
      } else if (updated) {
        mockDb.setIngredients(ingredients);
      }
    } catch (e) {
      console.error('Lỗi khi hoàn trả tồn kho đơn hàng:', e);
    }
  },

  // Tự động khấu trừ kho khi có đơn bán hàng mới ở POS
  async deductStockFromOrder(items: Array<{ product_id: string; quantity: number }>) {
    try {
      const recipes = await this.getRecipes();
      const ingredients = await this.getIngredients();
      let updated = false;

      const ingChanges: { [id: string]: { deductQty: number; productIds: string[] } } = {};
      for (const item of items) {
        const itemRecipes = recipes.filter(r => r.product_id === item.product_id);
        for (const rec of itemRecipes) {
          const deductQty = rec.quantity_needed * item.quantity;
          if (!ingChanges[rec.ingredient_id]) {
            ingChanges[rec.ingredient_id] = { deductQty: 0, productIds: [] };
          }
          ingChanges[rec.ingredient_id].deductQty += deductQty;
          if (!ingChanges[rec.ingredient_id].productIds.includes(item.product_id)) {
            ingChanges[rec.ingredient_id].productIds.push(item.product_id);
          }
        }
      }

      // Xác định ngày địa phương Việt Nam (YYYY-MM-DD)
      const now = new Date();
      const vnDateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

      let existingTodayLogs: any[] = [];
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('lichsukho')
          .select('*')
          .eq('loai_giao_dich', 'Bán hàng')
          .order('thoi_gian_tao', { ascending: false })
          .limit(100);

        if (data) {
          existingTodayLogs = data.filter(l => {
            const logVnDate = new Date(l.thoi_gian_tao).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
            return logVnDate === vnDateStr;
          });
        }
      }

      const dbUpdates: any[] = [];
      const historyLogsToInsert: any[] = [];

      for (const ingId in ingChanges) {
        const ing = ingredients.find(i => i.id === ingId);
        if (ing) {
          const { deductQty } = ingChanges[ingId];
          ing.stock_quantity = Math.max(0, Number(ing.stock_quantity) - deductQty);
          updated = true;

          if (isSupabaseConfigured && supabase) {
            dbUpdates.push(
              supabase.from('nguyenlieu').update({ so_luong_ton: ing.stock_quantity }).eq('id', ing.id)
            );
            
            const existingLog = existingTodayLogs.find(l => l.id_nguyen_lieu === ing.id);
            if (existingLog) {
              const newQty = Number(existingLog.so_luong_thay_doi) - deductQty;
              dbUpdates.push(
                supabase.from('lichsukho').update({ 
                  so_luong_thay_doi: newQty,
                  thoi_gian_tao: now.toISOString()
                }).eq('id', existingLog.id)
              );
            } else {
              historyLogsToInsert.push({
                id: generateShortId('inv_'),
                id_nguyen_lieu: ing.id,
                so_luong_thay_doi: -deductQty,
                loai_giao_dich: 'Bán hàng',
                chi_phi: 0,
                ghi_chu: `Khấu trừ tổng hợp bán hàng POS ngày ${now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
                trang_thai: 'Đã duyệt'
              });
            }
          } else {
            const logs = mockDb.getInventoryLogs();
            const existingMockLog = logs.find(l => 
              l.ingredient_id === ing.id && 
              l.type === 'Bán hàng' && 
              new Date(l.created_at).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }) === vnDateStr
            );
            if (existingMockLog) {
              existingMockLog.change_amount = Number(existingMockLog.change_amount) - deductQty;
            } else {
              logs.push({
                id: generateShortId('inv_'),
                ingredient_id: ing.id,
                custom_ingredient_name: null,
                change_amount: -deductQty,
                type: 'Bán hàng' as const,
                cost: 0,
                note: `Khấu trừ tổng hợp bán hàng POS ngày ${now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
                staff_id: 'system',
                created_at: now.toISOString(),
                status: 'Đã duyệt' as const
              });
            }
            mockDb.setInventoryLogs(logs);
          }
        }
      }

      if (isSupabaseConfigured && supabase) {
        if (dbUpdates.length > 0) {
          await Promise.all(dbUpdates);
        }
        if (historyLogsToInsert.length > 0) {
          await supabase.from('lichsukho').insert(historyLogsToInsert);
        }
      } else if (updated) {
        mockDb.setIngredients(ingredients);
      }
    } catch (e) {
      console.error('Lỗi khi khấu trừ tồn kho bán hàng:', e);
    }
  },

  // Gộp các log bán hàng trùng lặp trong cùng một ngày cho từng nguyên liệu
  async consolidateDuplicateSalesLogs() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: salesLogs, error } = await supabase
        .from('lichsukho')
        .select('*')
        .eq('loai_giao_dich', 'Bán hàng');

      if (error || !salesLogs || salesLogs.length === 0) return;

      const groups: { [key: string]: any[] } = {};
      salesLogs.forEach(log => {
        const vnDateStr = new Date(log.thoi_gian_tao).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
        const key = `${log.id_nguyen_lieu}_${vnDateStr}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(log);
      });

      const updates: any[] = [];
      const idsToDelete: string[] = [];

      Object.values(groups).forEach(group => {
        if (group.length > 1) {
          group.sort((a, b) => new Date(b.thoi_gian_tao).getTime() - new Date(a.thoi_gian_tao).getTime());
          const keepLog = group[0];
          const totalQty = group.reduce((sum, l) => sum + Number(l.so_luong_thay_doi || 0), 0);

          updates.push(
            supabase.from('lichsukho').update({ so_luong_thay_doi: totalQty }).eq('id', keepLog.id)
          );

          for (let i = 1; i < group.length; i++) {
            idsToDelete.push(group[i].id);
          }
        }
      });

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      if (idsToDelete.length > 0) {
        for (let i = 0; i < idsToDelete.length; i += 50) {
          const batch = idsToDelete.slice(i, i + 50);
          await supabase.from('lichsukho').delete().in('id', batch);
        }
      }
    } catch (e) {
      console.error('Lỗi khi gộp nhật ký bán hàng trùng lặp:', e);
    }
  },

  // --- OPERATIONAL EXPENSES (chiphivanhang) ---
  async getExpenses(startDate?: string, endDate?: string) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('chiphivanhang').select(`
        *,
        nguoidung (ho_ten)
      `);
      if (startDate) {
        query = query.gte('ngay_chi', startDate);
      }
      if (endDate) {
        query = query.lte('ngay_chi', endDate);
      }
      const { data, error } = await query.order('ngay_chi', { ascending: false });
      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          name: item.ten_chi_phi,
          type: item.loai_chi_phi, // 'co_dinh' or 'bien_dong'
          amount: Number(item.so_tien),
          date: item.ngay_chi,
          staff_id: item.id_nhan_vien,
          notes: item.ghi_chu || '',
          staff_name: item.nguoidung?.ho_ten || 'Không rõ'
        }));
      }
    }
    
    // Mock DB Fallback
    const expenses = getStorageItem<any[]>('ava_expenses', []);
    const users = mockDb.getUsers();
    let filtered = expenses;
    if (startDate) {
      filtered = filtered.filter(e => e.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(e => e.date <= endDate);
    }
    return filtered.map(e => ({
      ...e,
      staff_name: users.find(u => u.id === e.staff_id)?.full_name || 'Không rõ'
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createExpense(payload: {
    name: string;
    type: 'co_dinh' | 'bien_dong';
    amount: number;
    date: string;
    staff_id: string;
    notes?: string;
  }) {
    const id = generateShortId('exp_');
    const newExpense = {
      id,
      ten_chi_phi: payload.name,
      loai_chi_phi: payload.type,
      so_tien: payload.amount,
      ngay_chi: payload.date,
      id_nhan_vien: payload.staff_id,
      ghi_chu: payload.notes || ''
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('chiphivanhang').insert([newExpense]).select().single();
      if (!error && data) {
        return {
          id: data.id,
          name: data.ten_chi_phi,
          type: data.loai_chi_phi,
          amount: Number(data.so_tien),
          date: data.ngay_chi,
          staff_id: data.id_nhan_vien,
          notes: data.ghi_chu || ''
        };
      }
    }

    const expenses = getStorageItem<any[]>('ava_expenses', []);
    const clientExpense = {
      id,
      name: payload.name,
      type: payload.type,
      amount: payload.amount,
      date: payload.date,
      staff_id: payload.staff_id,
      notes: payload.notes || ''
    };
    expenses.push(clientExpense);
    setStorageItem('ava_expenses', expenses);
    return clientExpense;
  },

  async deleteExpense(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('chiphivanhang').delete().eq('id', id);
      if (!error) return true;
    }

    const expenses = getStorageItem<any[]>('ava_expenses', []);
    const filtered = expenses.filter(e => e.id !== id);
    setStorageItem('ava_expenses', filtered);
    return true;
  }
};

