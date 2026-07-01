// config/supabase.js
// ============================================
// KONFIGURASI SUPABASE
// ============================================

// GANTI DENGAN KREDENSIAL ANDA!
const SUPABASE_URL = 'https://dqlimiyxeqjqfmvzbdwn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KiQi41m-R8Ihl6kTpv0Eag_rWIBTH0-'; // GANTI DENGAN KEY LENGKAP!
// config/supabase.js



// Inisialisasi Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage
    }
});

console.log('✅ Supabase connected!');

// ============================================
// AUTHENTICATION CLASS
// ============================================
class SupabaseAuth {
    static async checkAuth() {
        // Cegah multiple call bersamaan
        if (this._checking) {
            console.log('⏳ Auth check already in progress...');
            return true;
        }
        
        this._checking = true;
        
        try {
            // Ambil session dari localStorage dulu
            const sessionData = localStorage.getItem('session');
            
            if (!sessionData) {
                console.warn('⚠️ No session in localStorage');
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
                return false;
            }
            
            // Verifikasi session ke Supabase
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            if (error || !session) {
                console.warn('⚠️ Invalid session, redirecting...');
                localStorage.removeItem('user');
                localStorage.removeItem('session');
                localStorage.removeItem('supabase.auth.token');
                
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
                return false;
            }
            
            console.log('✅ Session active:', session.user.email);
            return true;
            
        } catch (error) {
            console.error('❌ Auth check error:', error);
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return false;
        } finally {
            this._checking = false;
        }
    }

    static async login(email, password) {
        try {
            // Hapus session lama sebelum login
            localStorage.removeItem('user');
            localStorage.removeItem('session');
            localStorage.removeItem('supabase.auth.token');
            
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('session', JSON.stringify(data.session));
                return { success: true, user: data.user };
            }
            
            return { success: false, error: 'Login gagal' };
            
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error.message };
        }
    }

    static async logout() {
        try {
            // Hapus semua data localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('session');
            localStorage.removeItem('supabase.auth.token');
            
            // Hapus semua yang berhubungan dengan supabase
            Object.keys(localStorage).forEach(key => {
                if (key.includes('supabase') || key.includes('auth')) {
                    localStorage.removeItem(key);
                }
            });
            
            await supabaseClient.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    static getCurrentUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }
}

// ============================================
// DATABASE OPERATIONS CLASS
// ============================================
class DatabaseOperations {
    // ===== PRODUCTS =====
    static async getProducts() {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .select(`
                    *,
                    categories:category_id (id, name),
                    suppliers:supplier_id (id, name)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            return [];
        }
    }

    static async getProductById(id) {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .select(`
                    *,
                    categories:category_id (id, name),
                    suppliers:supplier_id (id, name)
                `)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error fetching product:', error);
            return null;
        }
    }

    static async addProduct(productData) {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .insert([productData])
                .select();
            
            if (error) throw error;
            return { success: true, data: data?.[0] };
        } catch (error) {
            console.error('❌ Error adding product:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateProduct(id, productData) {
        try {
            const { data, error } = await supabaseClient
                .from('products')
                .update(productData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data: data?.[0] };
        } catch (error) {
            console.error('❌ Error updating product:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteProduct(id) {
        try {
            const { error } = await supabaseClient
                .from('products')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== STOCK IN =====
    static async getStockIn() {
        try {
            const { data, error } = await supabaseClient
                .from('stock_in')
                .select(`
                    *,
                    products:product_id (id, name)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching stock in:', error);
            return [];
        }
    }

    static async addStockIn(stockData) {
        try {
            const { data: stockIn, error: stockError } = await supabaseClient
                .from('stock_in')
                .insert([{
                    product_id: stockData.product_id,
                    quantity: stockData.quantity,
                    note: stockData.note || '',
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (stockError) throw stockError;
            
            const product = await this.getProductById(stockData.product_id);
            if (product) {
                const newStock = (product.stock || 0) + stockData.quantity;
                await this.updateProduct(stockData.product_id, { stock: newStock });
            }
            
            return { success: true, data: stockIn?.[0] };
        } catch (error) {
            console.error('❌ Error adding stock in:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteStockIn(id) {
        try {
            const { data: stockData, error: fetchError } = await supabaseClient
                .from('stock_in')
                .select('*')
                .eq('id', id)
                .single();
            
            if (fetchError) throw fetchError;
            
            const { error: deleteError } = await supabaseClient
                .from('stock_in')
                .delete()
                .eq('id', id);
            
            if (deleteError) throw deleteError;
            
            if (stockData) {
                const product = await this.getProductById(stockData.product_id);
                if (product) {
                    const newStock = Math.max(0, (product.stock || 0) - stockData.quantity);
                    await this.updateProduct(stockData.product_id, { stock: newStock });
                }
            }
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting stock in:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== STOCK OUT =====
    static async getStockOut() {
        try {
            const { data, error } = await supabaseClient
                .from('stock_out')
                .select(`
                    *,
                    products:product_id (id, name)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching stock out:', error);
            return [];
        }
    }

    static async addStockOut(stockData) {
        try {
            const product = await this.getProductById(stockData.product_id);
            if (!product) {
                return { success: false, error: 'Produk tidak ditemukan' };
            }
            
            if ((product.stock || 0) < stockData.quantity) {
                return { success: false, error: 'Stok tidak mencukupi' };
            }
            
            const { data: stockOut, error: stockError } = await supabaseClient
                .from('stock_out')
                .insert([{
                    product_id: stockData.product_id,
                    quantity: stockData.quantity,
                    note: stockData.note || '',
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (stockError) throw stockError;
            
            const newStock = (product.stock || 0) - stockData.quantity;
            await this.updateProduct(stockData.product_id, { stock: newStock });
            
            return { success: true, data: stockOut?.[0] };
        } catch (error) {
            console.error('❌ Error adding stock out:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteStockOut(id) {
        try {
            const { data: stockData, error: fetchError } = await supabaseClient
                .from('stock_out')
                .select('*')
                .eq('id', id)
                .single();
            
            if (fetchError) throw fetchError;
            
            const { error: deleteError } = await supabaseClient
                .from('stock_out')
                .delete()
                .eq('id', id);
            
            if (deleteError) throw deleteError;
            
            if (stockData) {
                const product = await this.getProductById(stockData.product_id);
                if (product) {
                    const newStock = (product.stock || 0) + stockData.quantity;
                    await this.updateProduct(stockData.product_id, { stock: newStock });
                }
            }
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting stock out:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== CATEGORIES =====
    static async getCategories() {
        try {
            const { data, error } = await supabaseClient
                .from('categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            return [];
        }
    }

    static async addCategory(categoryData) {
        try {
            const { data, error } = await supabaseClient
                .from('categories')
                .insert([categoryData])
                .select();
            
            if (error) throw error;
            return { success: true, data: data?.[0] };
        } catch (error) {
            console.error('❌ Error adding category:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateCategory(id, categoryData) {
        try {
            const { data, error } = await supabaseClient
                .from('categories')
                .update(categoryData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data: data?.[0] };
        } catch (error) {
            console.error('❌ Error updating category:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteCategory(id) {
        try {
            const { error } = await supabaseClient
                .from('categories')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting category:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== SUPPLIERS =====
    static async getSuppliers() {
        try {
            const { data, error } = await supabaseClient
                .from('suppliers')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching suppliers:', error);
            return [];
        }
    }

    static async addSupplier(supplierData) {
        try {
            const { data, error } = await supabaseClient
                .from('suppliers')
                .insert([supplierData])
                .select();
            
            if (error) throw error;
            return { success: true, data: data?.[0] };
        } catch (error) {
            console.error('❌ Error adding supplier:', error);
            return { success: false, error: error.message };
        }
    }

    static async updateSupplier(id, supplierData) {
        try {
            const { data, error } = await supabaseClient
                .from('suppliers')
                .update(supplierData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return { success: true, data: data?.[0] };
        } catch (error) {
            console.error('❌ Error updating supplier:', error);
            return { success: false, error: error.message };
        }
    }

    static async deleteSupplier(id) {
        try {
            const { error } = await supabaseClient
                .from('suppliers')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting supplier:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== DASHBOARD STATS =====
    static async getDashboardStats() {
        try {
            const products = await this.getProducts();
            
            const totalItems = products.reduce((sum, p) => sum + (p.stock || 0), 0);
            const lowStock = products.filter(p => (p.stock || 0) <= (p.min_stock || 5)).length;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const { data: stockInToday } = await supabaseClient
                .from('stock_in')
                .select('quantity')
                .gte('created_at', today.toISOString())
                .lt('created_at', tomorrow.toISOString());
            
            const { data: stockOutToday } = await supabaseClient
                .from('stock_out')
                .select('quantity')
                .gte('created_at', today.toISOString())
                .lt('created_at', tomorrow.toISOString());
            
            const totalIn = stockInToday?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            const totalOut = stockOutToday?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            
            return {
                totalItems,
                totalIn,
                totalOut,
                lowStock,
                products
            };
        } catch (error) {
            console.error('❌ Error getting dashboard stats:', error);
            return { totalItems: 0, totalIn: 0, totalOut: 0, lowStock: 0, products: [] };
        }
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatRupiah(amount) {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return Math.floor(diff / 60) + ' menit lalu';
    if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
    if (diff < 172800) return 'Kemarin';
    
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// EXPOSE KE GLOBAL
// ============================================
window.SupabaseAuth = SupabaseAuth;
window.DatabaseOperations = DatabaseOperations;
window.formatRupiah = formatRupiah;
window.formatDate = formatDate;
window.supabaseClient = supabaseClient;

console.log('✅ Supabase config loaded successfully!');
console.log('📦 Methods available:', Object.keys(DatabaseOperations));