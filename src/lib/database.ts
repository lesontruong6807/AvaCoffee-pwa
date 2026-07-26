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

// Dữ liệu mẫu khởi tạo cho Mock DB
const MOCK_CATEGORIES = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'Cà phê' },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'Thức uống khác' },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Trà' },
  { id: 'c4444444-4444-4444-4444-444444444444', name: 'Yaourt' },
  { id: 'c5555555-5555-5555-5555-555555555555', name: 'Soda' }
];

const MOCK_PRODUCTS = [
  // Cà phê (CP)
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Cà phê đen',
    price: 15000,
    cost_price: 5000,
    image_url: 'https://i.pinimg.com/vwebp/736x/fa/21/eb/fa21eb28c29f08f40bd7f44e9d21f27d.webp',
    status: 'Còn hàng' as const
  },
  {
    id: 'd1111111-1111-1111-1111-111111111112',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Cà phê sữa',
    price: 17000,
    cost_price: 6000,
    image_url: 'https://i.pinimg.com/vwebp/736x/25/f1/c4/25f1c44880e288b19afcc6c747567405a.webp',
    status: 'Còn hàng' as const
  },
  {
    id: 'd1111111-1111-1111-1111-111111111113',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Cà phê sữa tươi',
    price: 22000,
    cost_price: 8000,
    image_url: 'https://i.pinimg.com/736x/02/15/55/0215554e3cf993469d0625ab1921b98a.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd1111111-1111-1111-1111-111111111114',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Cà phê muối',
    price: 22000,
    cost_price: 8000,
    image_url: 'https://i.pinimg.com/736x/d7/65/9c/d7659c0e02595551e771e7b2edab17e.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd1111111-1111-1111-1111-111111111115',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Bạc xiu',
    price: 22000,
    cost_price: 8000,
    image_url: 'https://i.pinimg.com/736x/be/8d/41/be8d413f945e09c6236f726ec3b95f5f.jpg',
    status: 'Còn hàng' as const
  },
  // Thức uống khác (TUK)
  {
    id: 'd2222222-2222-2222-2222-222222222221',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Cacao',
    price: 20000,
    cost_price: 7000,
    image_url: 'https://i.pinimg.com/736x/d6/f5/a1/d6f5a103292180b1943c83b35325bdf2.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Cacao kem muối',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/736x/b2/6e/8d/b26e8d7ed1495873ee9fd936df9d0532.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd2222222-2222-2222-2222-222222222223',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Matcha Latte',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/1200x/2e/ac/ae/2eacae2f52c4ac369ae5192bf17ea1b4.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd2222222-2222-2222-2222-222222222224',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Matcha Latte kem muối',
    price: 30000,
    cost_price: 11000,
    image_url: 'https://i.pinimg.com/736x/39/22/2c/39222cae47d07268215d1751a0b6c6c.jpg',
    status: 'Còn hàng' as const
  },
  // Trà (T)
  {
    id: 'd3333333-3333-3333-3333-333333333331',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Trà tắc',
    price: 15000,
    cost_price: 5000,
    image_url: 'https://i.pinimg.com/736x/14/91/f4/1491f4c34770937dfd4190da0da8556b2f.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd3333333-3333-3333-3333-333333333332',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Trà dâu',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/1200x/bf/f2/6d/bff26dce28c30a6ff849e87252726293.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Trà đào',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/736x/9e/b2/b0/9eb2b01ea2306476b37454f4b8b8b0a4.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd3333333-3333-3333-3333-333333333334',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Trà vải',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/736x/0f/c1/a3/0fc1a3f9275c4dc68a0e7394d4fce71f.jpg',
    status: 'Còn hàng' as const
  },
  // Yaourt (Y)
  {
    id: 'd4444444-4444-4444-4444-444444444441',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Yaourt đá',
    price: 20000,
    cost_price: 7000,
    image_url: 'https://i.pinimg.com/vwebp/1200x/e3/0e/0a/e30e0a3070bae2b2ec7a9a6101c85b7b.webp',
    status: 'Còn hàng' as const
  },
  {
    id: 'd4444444-4444-4444-4444-444444444442',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Yaourt dâu',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/1200x/27/34/33/27343309543e0cc6b1348302c2a379e5.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd4444444-4444-4444-4444-444444444443',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Yaourt việt quất',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/736x/5e/83/e5/5e83e5ad1b5c4ab983b09caf1b5e1ac2.jpg',
    status: 'Còn hàng' as const
  },
  // Soda (S)
  {
    id: 'd5555555-5555-5555-5555-555555555551',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Soda dâu',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/736x/4f/7a/60/4f7a608bd5384c201a6d707b16263616.jpg',
    status: 'Còn hàng' as const
  },
  {
    id: 'd5555555-5555-5555-5555-555555555552',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Soda đào',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/1200x/e2/1e/02/e21e0287ce4f1e1cfaf1a0cd8d9d729a.webp',
    status: 'Còn hàng' as const
  },
  {
    id: 'd5555555-5555-5555-5555-555555555553',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Soda việt quất',
    price: 25000,
    cost_price: 9000,
    image_url: 'https://i.pinimg.com/736x/3f/54/43/3f54439327709c6236f726ec3b95f5f.jpg',
    status: 'Còn hàng' as const
  }
];

const MOCK_TABLES: Array<{ id: string; table_name: string; capacity: number; status: 'Trống' | 'Đang phục vụ' }> = [
  { id: 't1', table_name: 'Bàn 1', capacity: 4, status: 'Trống' },
  { id: 't2', table_name: 'Bàn 2', capacity: 4, status: 'Trống' },
  { id: 't3', table_name: 'Bàn 3', capacity: 2, status: 'Trống' },
  { id: 't4', table_name: 'Bàn 4', capacity: 2, status: 'Trống' },
  { id: 't5', table_name: 'Bàn 5', capacity: 6, status: 'Trống' },
  { id: 't6', table_name: 'Bàn 6', capacity: 6, status: 'Trống' },
  { id: 't7', table_name: 'Khách mang về', capacity: 99, status: 'Trống' }
];

const MOCK_USERS = [
  { id: 'u1', email: 'admin@avacoffee.com', full_name: 'Lê Sơn (Admin)', role: 'Admin' as const, created_at: new Date().toISOString() },
  { id: 'u2', email: 'nhanvien1@avacoffee.com', full_name: 'Nguyễn Văn Minh', role: 'User' as const, created_at: new Date().toISOString() },
  { id: 'u3', email: 'nhanvien2@avacoffee.com', full_name: 'Trần Thị Thuỷ', role: 'User' as const, created_at: new Date().toISOString() }
];

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
  setLeaveRequests: (requests: any[]) => setStorageItem('ava_leave_requests', requests)
};

// Cấu hình tài khoản đăng nhập hiện tại mặc định
export const getCurrentUser = (): typeof MOCK_USERS[0] => {
  if (typeof window === 'undefined') return MOCK_USERS[0];
  const user = localStorage.getItem('ava_current_user');
  if (!user) {
    // Mặc định cho ban đầu là u1 (Admin) để dễ review
    localStorage.setItem('ava_current_user', JSON.stringify(MOCK_USERS[0]));
    return MOCK_USERS[0];
  }
  return JSON.parse(user);
};

export const setCurrentUser = (user: typeof MOCK_USERS[0]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ava_current_user', JSON.stringify(user));
  }
};

// UNIFIED DATABASE SERVICE
export const db = {
  // --- USERS ---
  async getUsers() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error) return data;
    }
    return mockDb.getUsers();
  },

  async createUser(user: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').insert([user]).select();
      if (!error) return data?.[0];
    }
    const users = mockDb.getUsers();
    users.push(user);
    mockDb.setUsers(users);
    return user;
  },

  async updateUser(id: string, updates: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').update(updates).eq('id', id).select();
      if (!error) return data?.[0];
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
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) return true;
    }
    const users = mockDb.getUsers();
    const filtered = users.filter(u => u.id !== id);
    mockDb.setUsers(filtered);
    return true;
  },

  // --- TABLES ---
  async getTables() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tables').select('*').order('table_name');
      if (!error) return data;
    }
    return mockDb.getTables().sort((a, b) => a.table_name.localeCompare(b.table_name));
  },

  async updateTableStatus(id: string, status: 'Trống' | 'Đang phục vụ') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tables').update({ status }).eq('id', id).select();
      if (!error) return data?.[0];
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
      const { data, error } = await supabase.from('tables').insert([table]).select();
      if (!error) return data?.[0];
    }
    const tables = mockDb.getTables();
    const newTable = { id: `t_${Date.now()}`, ...table };
    tables.push(newTable);
    mockDb.setTables(tables);
    return newTable;
  },

  async deleteTable(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('tables').delete().eq('id', id);
      if (!error) return true;
    }
    const tables = mockDb.getTables();
    mockDb.setTables(tables.filter(t => t.id !== id));
    return true;
  },

  // --- CATEGORIES ---
  async getCategories() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error) return data;
    }
    return mockDb.getCategories().sort((a, b) => a.name.localeCompare(b.name));
  },

  async createCategory(name: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').insert([{ name }]).select();
      if (!error) return data?.[0];
    }
    const categories = mockDb.getCategories();
    const newCat = { id: `c_${Date.now()}`, name };
    categories.push(newCat);
    mockDb.setCategories(categories);
    return newCat;
  },

  async deleteCategory(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) return true;
    }
    const categories = mockDb.getCategories();
    mockDb.setCategories(categories.filter(c => c.id !== id));
    return true;
  },

  // --- PRODUCTS ---
  async getProducts() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error) return data;
    }
    return mockDb.getProducts();
  },

  async createProduct(product: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').insert([product]).select();
      if (!error) return data?.[0];
    }
    const products = mockDb.getProducts();
    const newProd = { id: `p_${Date.now()}`, ...product };
    products.push(newProd);
    mockDb.setProducts(products);
    return newProd;
  },

  async updateProduct(id: string, updates: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
      if (!error) return data?.[0];
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
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    }
    const products = mockDb.getProducts();
    mockDb.setProducts(products.filter(p => p.id !== id));
    return true;
  },

  // --- ORDERS & ORDER ITEMS ---
  async getOrders() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables (table_name),
          users (full_name)
        `)
        .order('created_at', { ascending: false });
      if (!error) return data;
    }
    // Mock join
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
        .from('order_items')
        .select(`
          *,
          products (name, image_url)
        `)
        .eq('order_id', orderId);
      if (!error) return data;
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

  async createOrder(orderData: { table_id: string; staff_id: string; total_amount: number; items: any[] }) {
    const { table_id, staff_id, total_amount, items } = orderData;
    const orderId = `o_${Date.now()}`;
    const createdAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // Bắt đầu insert hóa đơn
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          table_id,
          staff_id,
          total_amount,
          payment_status: 'Chưa thanh toán',
          created_at: createdAt
        }])
        .select()
        .single();

      if (!orderErr && order) {
        // Cập nhật trạng thái bàn sang "Đang phục vụ"
        await supabase.from('tables').update({ status: 'Đang phục vụ' }).eq('id', table_id);

        // Insert chi tiết hóa đơn
        const orderItemsToInsert = items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        }));
        await supabase.from('order_items').insert(orderItemsToInsert);
        return order;
      }
    }

    // Mock DB Fallback
    const orders = mockDb.getOrders();
    const newOrder = {
      id: orderId,
      table_id,
      staff_id,
      total_amount,
      payment_status: 'Chưa thanh toán' as const,
      payment_method: null,
      created_at: createdAt,
      paid_at: null
    };
    orders.push(newOrder);
    mockDb.setOrders(orders);

    // Cập nhật bàn sang "Đang phục vụ"
    const tables = mockDb.getTables();
    const tIdx = tables.findIndex(t => t.id === table_id);
    if (tIdx !== -1) {
      tables[tIdx].status = 'Đang phục vụ';
      mockDb.setTables(tables);
    }

    // Insert chi tiết
    const orderItems = mockDb.getOrderItems();
    const newItems = items.map((item, idx) => ({
      id: `oi_${Date.now()}_${idx}`,
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal
    }));
    mockDb.setOrderItems([...orderItems, ...newItems]);

    return newOrder;
  },

  async payOrder(orderId: string, paymentMethod: 'Tiền mặt' | 'Chuyển khoản') {
    const paidAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // Lấy thông tin hóa đơn để biết table_id
      const { data: order } = await supabase.from('orders').select('table_id').eq('id', orderId).single();
      
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'Đã thanh toán',
          payment_method: paymentMethod,
          paid_at: paidAt
        })
        .eq('id', orderId)
        .select()
        .single();

      if (!error && updatedOrder && order?.table_id) {
        // Trả trạng thái bàn về "Trống"
        await supabase.from('tables').update({ status: 'Trống' }).eq('id', order.table_id);
        return updatedOrder;
      }
    }

    // Mock DB Fallback
    const orders = mockDb.getOrders();
    const oIdx = orders.findIndex(o => o.id === orderId);
    if (oIdx !== -1) {
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
      const { data: order } = await supabase.from('orders').select('table_id').eq('id', orderId).single();
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({ payment_status: 'Đã hủy' })
        .eq('id', orderId)
        .select()
        .single();

      if (!error && updatedOrder && order?.table_id) {
        await supabase.from('tables').update({ status: 'Trống' }).eq('id', order.table_id);
        return updatedOrder;
      }
    }

    const orders = mockDb.getOrders();
    const oIdx = orders.findIndex(o => o.id === orderId);
    if (oIdx !== -1) {
      orders[oIdx].payment_status = 'Đã hủy';
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

  // --- TIME LOGS ---
  async getTimeLogs() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('time_logs')
        .select(`
          *,
          users (full_name, email)
        `)
        .order('submitted_at', { ascending: false });
      if (!error) return data;
    }
    const logs = mockDb.getTimeLogs();
    const users = mockDb.getUsers();
    return logs.map(log => ({
      ...log,
      users: users.find(u => u.id === log.user_id) || null
    })).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  },

  async createTimeLog(log: { user_id: string; check_in_time: string; latitude: number; longitude: number; location_address: string }) {
    const newLog = {
      id: `tl_${Date.now()}`,
      ...log,
      submitted_at: new Date().toISOString(),
      status: 'Chờ duyệt' as const
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('time_logs').insert([log]).select();
      if (!error) return data?.[0];
    }

    const logs = mockDb.getTimeLogs();
    logs.push(newLog);
    mockDb.setTimeLogs(logs);
    return newLog;
  },

  async approveTimeLog(id: string, status: 'Đã duyệt' | 'Từ chối') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('time_logs').update({ status }).eq('id', id).select();
      if (!error) return data?.[0];
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

  // --- LEAVE REQUESTS ---
  async getLeaveRequests() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          users (full_name, email)
        `)
        .order('submitted_at', { ascending: false });
      if (!error) return data;
    }
    const requests = mockDb.getLeaveRequests();
    const users = mockDb.getUsers();
    return requests.map(req => ({
      ...req,
      users: users.find(u => u.id === req.user_id) || null
    })).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  },

  async createLeaveRequest(req: { user_id: string; start_date: string; end_date: string; reason: string; latitude: number; longitude: number; location_address: string }) {
    const newReq = {
      id: `lr_${Date.now()}`,
      ...req,
      submitted_at: new Date().toISOString(),
      status: 'Chờ duyệt' as const
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leave_requests').insert([req]).select();
      if (!error) return data?.[0];
    }

    const requests = mockDb.getLeaveRequests();
    requests.push(newReq);
    mockDb.setLeaveRequests(requests);
    return newReq;
  },

  async approveLeaveRequest(id: string, status: 'Đã duyệt' | 'Từ chối') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leave_requests').update({ status }).eq('id', id).select();
      if (!error) return data?.[0];
    }
    const requests = mockDb.getLeaveRequests();
    const idx = requests.findIndex(r => r.id === id);
    if (idx !== -1) {
      requests[idx].status = status;
      mockDb.setLeaveRequests(requests);
      return requests[idx];
    }
    return null;
  }
};
