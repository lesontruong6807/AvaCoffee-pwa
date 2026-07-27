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
  { id: 'c_soda', name: 'Soda' }
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
  { id: 'ing_matcha', name: 'Bột Matcha', unit: 'g', stock_quantity: 500, opening_stock: 500, min_stock: 50, quy_cach: '500g' },
  { id: 'ing_trasanmay', name: 'Trà săn mây', unit: 'g', stock_quantity: 600, opening_stock: 600, min_stock: 300, quy_cach: '300g' },
  { id: 'ing_hongtra', name: 'Hồng trà', unit: 'g', stock_quantity: 1000, opening_stock: 1000, min_stock: 500, quy_cach: '100g' },
  { id: 'ing_suadac', name: 'Sữa đặc', unit: 'g', stock_quantity: 6000, opening_stock: 6000, min_stock: 2400, quy_cach: '1200g' },
  { id: 'ing_suatuoi', name: 'Sữa tươi', unit: 'ml', stock_quantity: 5000, opening_stock: 5000, min_stock: 2000, quy_cach: '1000ml' },
  { id: 'ing_lyden', name: 'Ly đen AVA', unit: 'cái', stock_quantity: 200, opening_stock: 200, min_stock: 50, quy_cach: 'cái' },
  { id: 'ing_lytrang', name: 'Ly trắng AVA', unit: 'cái', stock_quantity: 200, opening_stock: 200, min_stock: 50, quy_cach: 'cái' },
  { id: 'ing_lyhoavan', name: 'Ly trắng hoa văn AVA', unit: 'cái', stock_quantity: 200, opening_stock: 200, min_stock: 50, quy_cach: 'cái' },
  { id: 'ing_onghutthuong', name: 'Ống hút thường', unit: 'bịch', stock_quantity: 5, opening_stock: 5, min_stock: null, quy_cach: 'bịch' },
  { id: 'ing_onghuttraicay', name: 'Ống hút trái cây', unit: 'bịch', stock_quantity: 5, opening_stock: 5, min_stock: null, quy_cach: 'bịch' },
  { id: 'ing_muong', name: 'Muỗng', unit: 'bịch', stock_quantity: 5, opening_stock: 5, min_stock: null, quy_cach: 'bịch' },
  { id: 'ing_tuimangdi', name: 'Túi mang đi', unit: 'kg', stock_quantity: 5, opening_stock: 5, min_stock: null, quy_cach: '1kg' },
  { id: 'ing_duong', name: 'Đường', unit: 'g', stock_quantity: 5000, opening_stock: 5000, min_stock: 1000, quy_cach: '1000g' },
  { id: 'ing_nuocduong', name: 'Nước đường', unit: 'ml', stock_quantity: 1200, opening_stock: 1200, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_kembeo', name: 'Kem béo', unit: 'hộp', stock_quantity: 5, opening_stock: 5, min_stock: 1, quy_cach: 'hộp' },
  { id: 'ing_muoihong', name: 'Muối hồng', unit: 'g', stock_quantity: 500, opening_stock: 500, min_stock: 10, quy_cach: 'g' },
  { id: 'ing_kemmuoi', name: 'Kem muối', unit: 'ml', stock_quantity: 900, opening_stock: 900, min_stock: 120, quy_cach: 'ml' },
  { id: 'ing_suachua', name: 'Sữa chua', unit: 'hộp', stock_quantity: 20, opening_stock: 20, min_stock: 4, quy_cach: 'hộp' },
  { id: 'ing_mutdau', name: 'Mứt dâu', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_mutvietquat', name: 'Mứt việt quất', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_mutdao', name: 'Mứt đào', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_sirodau', name: 'Siro dâu', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_sirodao', name: 'Siro đào', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_sirovai', name: 'Siro vải', unit: 'ml', stock_quantity: 1000, opening_stock: 1000, min_stock: 200, quy_cach: 'ml' },
  { id: 'ing_7up', name: '7-Up', unit: 'chai', stock_quantity: 24, opening_stock: 24, min_stock: 10, quy_cach: 'chai' },
  { id: 'ing_nuoccothongtra', name: 'Nước cốt hồng trà', unit: 'ml', stock_quantity: 1600, opening_stock: 1600, min_stock: 500, quy_cach: 'ml' }
];

export const MOCK_RECIPES = [
  // 1. Cà phê đá
  { id: 'rec_cp1_1', product_id: 'CP001', ingredient_id: 'ing_caphe', quantity_needed: 18, unit: 'g' },
  { id: 'rec_cp1_2', product_id: 'CP001', ingredient_id: 'ing_nuocduong', quantity_needed: 10, unit: 'ml' },
  { id: 'rec_cp1_3', product_id: 'CP001', ingredient_id: 'ing_lyden', quantity_needed: 1, unit: 'cái' },

  // 2. Cà phê sữa
  { id: 'rec_cp2_1', product_id: 'CP002', ingredient_id: 'ing_caphe', quantity_needed: 18, unit: 'g' },
  { id: 'rec_cp2_2', product_id: 'CP002', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_cp2_3', product_id: 'CP002', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 3. Cà phê sữa tươi
  { id: 'rec_cp3_1', product_id: 'CP003', ingredient_id: 'ing_caphe', quantity_needed: 11, unit: 'g' },
  { id: 'rec_cp3_2', product_id: 'CP003', ingredient_id: 'ing_suadac', quantity_needed: 25, unit: 'g' },
  { id: 'rec_cp3_3', product_id: 'CP003', ingredient_id: 'ing_suatuoi', quantity_needed: 100, unit: 'ml' },
  { id: 'rec_cp3_4', product_id: 'CP003', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 4. Cà phê muối
  { id: 'rec_cp4_1', product_id: 'CP004', ingredient_id: 'ing_caphe', quantity_needed: 18, unit: 'g' },
  { id: 'rec_cp4_2', product_id: 'CP004', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_cp4_3', product_id: 'CP004', ingredient_id: 'ing_kemmuoi', quantity_needed: 60, unit: 'ml' },
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
  { id: 'rec_tuk2_4', product_id: 'TUK002', ingredient_id: 'ing_kemmuoi', quantity_needed: 60, unit: 'ml' },
  { id: 'rec_tuk2_5', product_id: 'TUK002', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 8. Matcha Latte
  { id: 'rec_tuk3_1', product_id: 'TUK003', ingredient_id: 'ing_matcha', quantity_needed: 3.5, unit: 'g' },
  { id: 'rec_tuk3_2', product_id: 'TUK003', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_tuk3_3', product_id: 'TUK003', ingredient_id: 'ing_suatuoi', quantity_needed: 100, unit: 'ml' },
  { id: 'rec_tuk3_4', product_id: 'TUK003', ingredient_id: 'ing_lytrang', quantity_needed: 1, unit: 'cái' },

  // 9. Matcha Latte kem muối
  { id: 'rec_tuk4_1', product_id: 'TUK004', ingredient_id: 'ing_matcha', quantity_needed: 3.5, unit: 'g' },
  { id: 'rec_tuk4_2', product_id: 'TUK004', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_tuk4_3', product_id: 'TUK004', ingredient_id: 'ing_suatuoi', quantity_needed: 100, unit: 'ml' },
  { id: 'rec_tuk4_4', product_id: 'TUK004', ingredient_id: 'ing_kemmuoi', quantity_needed: 60, unit: 'ml' },
  { id: 'rec_tuk4_5', product_id: 'TUK004', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 10. Trà tắc
  { id: 'rec_t1_1', product_id: 'T001', ingredient_id: 'ing_nuoccothongtra', quantity_needed: 300, unit: 'ml' },

  // 11. Trà dâu
  { id: 'rec_t2_1', product_id: 'T002', ingredient_id: 'ing_nuoccothongtra', quantity_needed: 150, unit: 'ml' },
  { id: 'rec_t2_2', product_id: 'T002', ingredient_id: 'ing_sirodau', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_t2_3', product_id: 'T002', ingredient_id: 'ing_nuocduong', quantity_needed: 20, unit: 'ml' },
  { id: 'rec_t2_4', product_id: 'T002', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 12. Trà đào
  { id: 'rec_t3_1', product_id: 'T003', ingredient_id: 'ing_nuoccothongtra', quantity_needed: 150, unit: 'ml' },
  { id: 'rec_t3_2', product_id: 'T003', ingredient_id: 'ing_sirodao', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_t3_3', product_id: 'T003', ingredient_id: 'ing_nuocduong', quantity_needed: 20, unit: 'ml' },
  { id: 'rec_t3_4', product_id: 'T003', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 13. Trà vải
  { id: 'rec_t4_1', product_id: 'T004', ingredient_id: 'ing_nuoccothongtra', quantity_needed: 150, unit: 'ml' },
  { id: 'rec_t4_2', product_id: 'T004', ingredient_id: 'ing_sirovai', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_t4_3', product_id: 'T004', ingredient_id: 'ing_nuocduong', quantity_needed: 20, unit: 'ml' },
  { id: 'rec_t4_4', product_id: 'T004', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 14. Yaourt đá
  { id: 'rec_y1_1', product_id: 'Y001', ingredient_id: 'ing_suachua', quantity_needed: 1, unit: 'hộp' },
  { id: 'rec_y1_2', product_id: 'Y001', ingredient_id: 'ing_suadac', quantity_needed: 50, unit: 'g' },
  { id: 'rec_y1_3', product_id: 'Y001', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 15. Yaourt dâu
  { id: 'rec_y2_1', product_id: 'Y002', ingredient_id: 'ing_suachua', quantity_needed: 1, unit: 'hộp' },
  { id: 'rec_y2_2', product_id: 'Y002', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_y2_3', product_id: 'Y002', ingredient_id: 'ing_mutdau', quantity_needed: 50, unit: 'ml' },
  { id: 'rec_y2_4', product_id: 'Y002', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 16. Yaourt việt quất
  { id: 'rec_y3_1', product_id: 'Y003', ingredient_id: 'ing_suachua', quantity_needed: 1, unit: 'hộp' },
  { id: 'rec_y3_2', product_id: 'Y003', ingredient_id: 'ing_suadac', quantity_needed: 30, unit: 'g' },
  { id: 'rec_y3_3', product_id: 'Y003', ingredient_id: 'ing_mutvietquat', quantity_needed: 50, unit: 'ml' },
  { id: 'rec_y3_4', product_id: 'Y003', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 17. Soda dâu
  { id: 'rec_s1_1', product_id: 'S001', ingredient_id: 'ing_7up', quantity_needed: 1, unit: 'chai' },
  { id: 'rec_s1_2', product_id: 'S001', ingredient_id: 'ing_mutdau', quantity_needed: 40, unit: 'ml' },
  { id: 'rec_s1_3', product_id: 'S001', ingredient_id: 'ing_sirodau', quantity_needed: 10, unit: 'ml' },
  { id: 'rec_s1_4', product_id: 'S001', ingredient_id: 'ing_nuocduong', quantity_needed: 10, unit: 'ml' },
  { id: 'rec_s1_5', product_id: 'S001', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 18. Soda đào
  { id: 'rec_s2_1', product_id: 'S002', ingredient_id: 'ing_7up', quantity_needed: 1, unit: 'chai' },
  { id: 'rec_s2_2', product_id: 'S002', ingredient_id: 'ing_mutdao', quantity_needed: 30, unit: 'ml' },
  { id: 'rec_s2_3', product_id: 'S002', ingredient_id: 'ing_sirodao', quantity_needed: 20, unit: 'ml' },
  { id: 'rec_s2_4', product_id: 'S002', ingredient_id: 'ing_nuocduong', quantity_needed: 10, unit: 'ml' },
  { id: 'rec_s2_5', product_id: 'S002', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' },

  // 19. Soda việt quất
  { id: 'rec_s3_1', product_id: 'S003', ingredient_id: 'ing_7up', quantity_needed: 1, unit: 'chai' },
  { id: 'rec_s3_2', product_id: 'S003', ingredient_id: 'ing_mutvietquat', quantity_needed: 50, unit: 'ml' },
  { id: 'rec_s3_3', product_id: 'S003', ingredient_id: 'ing_nuocduong', quantity_needed: 10, unit: 'ml' },
  { id: 'rec_s3_4', product_id: 'S003', ingredient_id: 'ing_lyhoavan', quantity_needed: 1, unit: 'cái' }
];

// Helper hiển thị tồn kho dạng ghép đơn vị (VD: 1kg + 982g, 1 bịch + 50g)
export function formatIngredientStock(quantity: number, unit: string, quyCach?: string): string {
  const qty = Math.max(0, quantity);
  if (unit === 'g') {
    if (quyCach === '1kg' || quyCach === '1000g') {
      const kg = Math.floor(qty / 1000);
      const g = Math.round(qty % 1000);
      if (kg > 0) {
        return g > 0 ? `${kg}kg + ${g}g` : `${kg}kg`;
      }
      return `${g}g`;
    }
    if (quyCach === '500g') {
      const bich = Math.floor(qty / 500);
      const g = Math.round(qty % 500);
      if (bich > 0) {
        return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      }
      return `${g}g`;
    }
    if (quyCach === '300g') {
      const bich = Math.floor(qty / 300);
      const g = Math.round(qty % 300);
      if (bich > 0) {
        return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      }
      return `${g}g`;
    }
    if (quyCach === '100g') {
      const bich = Math.floor(qty / 100);
      const g = Math.round(qty % 100);
      if (bich > 0) {
        return g > 0 ? `${bich} bịch + ${g}g` : `${bich} bịch`;
      }
      return `${g}g`;
    }
    if (quyCach === '1200g') {
      const hop = Math.floor(qty / 1200);
      const g = Math.round(qty % 1200);
      if (hop > 0) {
        return g > 0 ? `${hop} hộp + ${g}g` : `${hop} hộp`;
      }
      return `${g}g`;
    }
    return `${qty}g`;
  }
  if (unit === 'ml') {
    if (quyCach === '1000ml') {
      const hop = Math.floor(qty / 1000);
      const ml = Math.round(qty % 1000);
      if (hop > 0) {
        return ml > 0 ? `${hop} hộp + ${ml}ml` : `${hop} hộp`;
      }
      return `${ml}ml`;
    }
    return `${qty}ml`;
  }
  return `${qty} ${unit}`;
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('danhmuc').select('*');
      if (!error && data) return data.map(mapCategoryToClient).filter(Boolean).sort((a: any, b: any) => a.name.localeCompare(b.name)) as any[];
    }
    return mockDb.getCategories().sort((a, b) => a.name.localeCompare(b.name));
  },

  async createCategory(name: string) {
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('sanpham').select('*');
      if (!error && data) return data.map(mapProductToClient).filter(Boolean) as any[];
    }
    return mockDb.getProducts();
  },

  async createProduct(product: any) {
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
  },

  async createOrder(orderData: { table_id: string; staff_id: string; total_amount: number; discount?: number; items: any[] }) {
    const { table_id, staff_id, total_amount, discount = 0, items } = orderData;
    const orderId = generateShortId('ord_');
    const createdAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // 1. Ghi hóa đơn chính (hoadon)
      const { data: order, error: orderErr } = await supabase
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

      if (!orderErr && order) {
        // 2. Chuyển trạng thái bàn sang Đang phục vụ
        await supabase.from('danhsachban').update({ trang_thai: 'Đang phục vụ' }).eq('id', table_id);

        // Lấy thông tin sản phẩm để ghi trực tiếp (Tên món, Đơn vị tính) vào chi tiết hóa đơn
        const products = await this.getProducts();

        // 3. Ghi chi tiết hóa đơn (hoadondetail)
        const orderItemsToInsert = items.map(item => {
          const prod = products.find(p => p.id === item.product_id);
          return {
            id: generateShortId('item_'),
            idhoadon: orderId,
            idsp: item.product_id,
            ten_san_pham: prod ? prod.name : 'Sản phẩm',
            don_vi_tinh: prod ? (prod as any).don_vi_tinh : 'Ly',
            don_gia: item.unit_price || item.price,
            so_luong: item.quantity,
            thanh_tien: item.subtotal,
            ghi_chu: item.notes || ''
          };
        });
        await supabase.from('hoadondetail').insert(orderItemsToInsert);
        return mapOrderToClient(order);
      }
    }

    // Mock DB Fallback
    const orders = mockDb.getOrders();
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

    const tables = mockDb.getTables();
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
        ghi_chu: item.notes || ''
      };
    });
    mockDb.setOrderItems([...orderItems, ...newItems]);

    return newOrder;
  },

  async payOrder(orderId: string, paymentMethod: 'Tiền mặt' | 'Chuyển khoản') {
    const paidAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data: order } = await supabase.from('hoadon').select('id_ban').eq('id', orderId).single();
      
      // Trừ kho nguyên liệu khi thanh toán
      const { data: items } = await supabase.from('hoadondetail').select('idsp, so_luong').eq('idhoadon', orderId);
      if (items && items.length > 0) {
        const cartItems = items.map(item => ({ product_id: item.idsp, quantity: item.so_luong }));
        await this.deductStockFromOrder(cartItems);
      }

      const { data: updatedOrder, error } = await supabase
        .from('hoadon')
        .update({
          trang_thai_thanh_toan: 'Đã thanh toán',
          phuong_thuc_thanh_toan: paymentMethod,
          ngay_thanh_toan: paidAt
        })
        .eq('id', orderId)
        .select()
        .single();

      if (!error && updatedOrder && order?.id_ban) {
        await supabase.from('danhsachban').update({ trang_thai: 'Trống' }).eq('id', order.id_ban);
        return mapOrderToClient(updatedOrder);
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
              opening_stock: Number(ing.ton_dau_ngay || ing.so_luong_ton),
              min_stock: ing.muc_canh_bao !== null ? Number(ing.muc_canh_bao) : null,
              quy_cach: ing.quy_cach
            }));
          }
        } else {
          ingredients = mockDb.getIngredients();
        }

        for (const ing of ingredients) {
          ing.opening_stock = ing.stock_quantity;
          if (isSupabaseConfigured && supabase) {
            await supabase.from('nguyenlieu').update({ ton_dau_ngay: ing.stock_quantity }).eq('id', ing.id);
          }
        }

        if (!isSupabaseConfigured || !supabase) {
          mockDb.setIngredients(ingredients);
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
          opening_stock: Number(ing.ton_dau_ngay !== null ? ing.ton_dau_ngay : ing.so_luong_ton),
          min_stock: ing.muc_canh_bao !== null ? Number(ing.muc_canh_bao) : null,
          quy_cach: ing.quy_cach
        }));
      }
    }
    return mockDb.getIngredients();
  },

  async getRecipes() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('congthuc').select('*');
      if (!error && data) {
        return data.map(rec => ({
          id: rec.id,
          product_id: rec.id_san_pham,
          ingredient_id: rec.id_nguyen_lieu,
          quantity_needed: Number(rec.so_luong_can),
          unit: rec.don_vi_tinh
        }));
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
      const ing = ingredients.find(i => i.id === payload.ingredient_id);
      if (ing) {
        ing.stock_quantity = Number(ing.stock_quantity) + payload.change_amount;

        // Xử lý khấu trừ tự động đối với 3 món tự pha chế:
        // Nước đường (ing_nuocduong): +1200ml -> Trừ 1 bao đường (1000g)
        if (payload.ingredient_id === 'ing_nuocduong') {
          const duongIng = ingredients.find(i => i.id === 'ing_duong');
          if (duongIng) duongIng.stock_quantity = Math.max(0, duongIng.stock_quantity - 1000);
        }
        // Nước cốt hồng trà (ing_nuoccothongtra): +1600ml -> Trừ 1 bịch hồng trà (100g)
        else if (payload.ingredient_id === 'ing_nuoccothongtra') {
          const hongtraIng = ingredients.find(i => i.id === 'ing_hongtra');
          if (hongtraIng) hongtraIng.stock_quantity = Math.max(0, hongtraIng.stock_quantity - 100);
        }
        // Kem muối (ing_kemmuoi): +900ml -> Trừ 1 hộp kem béo, 20g sữa đặc, 30ml sữa tươi, 5g muối hồng
        else if (payload.ingredient_id === 'ing_kemmuoi') {
          const kbIng = ingredients.find(i => i.id === 'ing_kembeo');
          if (kbIng) kbIng.stock_quantity = Math.max(0, kbIng.stock_quantity - 1);
          const sdIng = ingredients.find(i => i.id === 'ing_suadac');
          if (sdIng) sdIng.stock_quantity = Math.max(0, sdIng.stock_quantity - 20);
          const stIng = ingredients.find(i => i.id === 'ing_suatuoi');
          if (stIng) stIng.stock_quantity = Math.max(0, stIng.stock_quantity - 30);
          const mhIng = ingredients.find(i => i.id === 'ing_muoihong');
          if (mhIng) mhIng.stock_quantity = Math.max(0, mhIng.stock_quantity - 5);
        }
      }

      if (isSupabaseConfigured && supabase) {
        // Update Supabase tables
        await supabase
          .from('nguyenlieu')
          .update({ so_luong_ton: ing?.stock_quantity })
          .eq('id', payload.ingredient_id);

        if (payload.ingredient_id === 'ing_nuocduong') {
          const duong = ingredients.find(i => i.id === 'ing_duong');
          if (duong) await supabase.from('nguyenlieu').update({ so_luong_ton: duong.stock_quantity }).eq('id', 'ing_duong');
        } else if (payload.ingredient_id === 'ing_nuoccothongtra') {
          const ht = ingredients.find(i => i.id === 'ing_hongtra');
          if (ht) await supabase.from('nguyenlieu').update({ so_luong_ton: ht.stock_quantity }).eq('id', 'ing_hongtra');
        } else if (payload.ingredient_id === 'ing_kemmuoi') {
          const kb = ingredients.find(i => i.id === 'ing_kembeo');
          if (kb) await supabase.from('nguyenlieu').update({ so_luong_ton: kb.stock_quantity }).eq('id', 'ing_kembeo');
          const sd = ingredients.find(i => i.id === 'ing_suadac');
          if (sd) await supabase.from('nguyenlieu').update({ so_luong_ton: sd.stock_quantity }).eq('id', 'ing_suadac');
          const st = ingredients.find(i => i.id === 'ing_suatuoi');
          if (st) await supabase.from('nguyenlieu').update({ so_luong_ton: st.stock_quantity }).eq('id', 'ing_suatuoi');
          const mh = ingredients.find(i => i.id === 'ing_muoihong');
          if (mh) await supabase.from('nguyenlieu').update({ so_luong_ton: mh.stock_quantity }).eq('id', 'ing_muoihong');
        }
      } else {
        mockDb.setIngredients(ingredients);
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

  // Hoàn trả kho nguyên liệu khi hủy đơn hàng
  async restoreStockFromOrder(items: Array<{ product_id: string; quantity: number }>) {
    try {
      const recipes = await this.getRecipes();
      const ingredients = await this.getIngredients();
      let updated = false;

      for (const item of items) {
        const itemRecipes = recipes.filter(r => r.product_id === item.product_id);
        for (const rec of itemRecipes) {
          const ing = ingredients.find(i => i.id === rec.ingredient_id);
          if (ing) {
            const restoreQty = rec.quantity_needed * item.quantity;
            ing.stock_quantity = Number(ing.stock_quantity) + restoreQty;
            updated = true;

            if (isSupabaseConfigured && supabase) {
              await supabase.from('nguyenlieu').update({ so_luong_ton: ing.stock_quantity }).eq('id', ing.id);
              await supabase.from('lichsukho').insert([{
                id: generateShortId('inv_'),
                id_nguyen_lieu: ing.id,
                so_luong_thay_doi: restoreQty,
                loai_giao_dich: 'Khác',
                chi_phi: 0,
                ghi_chu: `Hoàn kho do hủy đơn hàng (Mã SP: ${item.product_id})`,
                trang_thai: 'Đã duyệt'
              }]);
            } else {
              const logs = mockDb.getInventoryLogs();
              logs.push({
                id: generateShortId('inv_'),
                ingredient_id: ing.id,
                custom_ingredient_name: null,
                change_amount: restoreQty,
                type: 'Khác' as const,
                cost: 0,
                note: `Hoàn kho do hủy đơn hàng (Mã SP: ${item.product_id})`,
                staff_id: 'system',
                created_at: new Date().toISOString(),
                status: 'Đã duyệt' as const
              });
              mockDb.setInventoryLogs(logs);
            }
          }
        }
      }

      if (updated && (!isSupabaseConfigured || !supabase)) {
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

      for (const item of items) {
        const itemRecipes = recipes.filter(r => r.product_id === item.product_id);
        for (const rec of itemRecipes) {
          const ing = ingredients.find(i => i.id === rec.ingredient_id);
          if (ing) {
            const deductQty = rec.quantity_needed * item.quantity;
            ing.stock_quantity = Math.max(0, Number(ing.stock_quantity) - deductQty);
            updated = true;

            if (isSupabaseConfigured && supabase) {
              await supabase.from('nguyenlieu').update({ so_luong_ton: ing.stock_quantity }).eq('id', ing.id);
              await supabase.from('lichsukho').insert([{
                id: generateShortId('inv_'),
                id_nguyen_lieu: ing.id,
                so_luong_thay_doi: -deductQty,
                loai_giao_dich: 'Bán hàng',
                chi_phi: 0,
                ghi_chu: `Khấu trừ tự động qua POS (Mã SP: ${item.product_id})`,
                trang_thai: 'Đã duyệt'
              }]);
            } else {
              const logs = mockDb.getInventoryLogs();
              logs.push({
                id: generateShortId('inv_'),
                ingredient_id: ing.id,
                custom_ingredient_name: null,
                change_amount: -deductQty,
                type: 'Bán hàng' as const,
                cost: 0,
                note: `Khấu trừ tự động qua POS (Mã SP: ${item.product_id})`,
                staff_id: 'system',
                created_at: new Date().toISOString(),
                status: 'Đã duyệt' as const
              });
              mockDb.setInventoryLogs(logs);
            }
          }
        }
      }

      if (updated && (!isSupabaseConfigured || !supabase)) {
        mockDb.setIngredients(ingredients);
      }
    } catch (e) {
      console.error('Lỗi khi khấu trừ tồn kho bán hàng:', e);
    }
  }
};
