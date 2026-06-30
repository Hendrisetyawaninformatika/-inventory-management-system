// Konfigurasi Supabase
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Inisialisasi Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fungsi helper untuk autentikasi
class SupabaseAuth {
    static async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (error) throw error;
        return data;
    }

    static async logout() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        localStorage.removeItem('user');
    }

    static async getCurrentUser() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    }

    static async checkAuth() {
        const user = await this.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    }
}

// Fungsi database operations
class DatabaseOperations {
    // Products
    static async getProducts() {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*, categories(name), suppliers(name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    static async addProduct(product) {
        const { data, error } = await supabaseClient
            .from('products')
            .insert([product])
            .select();
        if (error) throw error;
        return data;
    }

    static async updateProduct(id, product) {
        const { data, error } = await supabaseClient
            .from('products')
            .update(product)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    }

    static async deleteProduct(id) {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }

    // Stock In
    static async addStockIn(stockIn) {
        // Start transaction
        const { data: product, error: productError } = await supabaseClient
            .from('products')
            .select('stock')
            .eq('id', stockIn.product_id)
            .single();
        
        if (productError) throw productError;

        const newStock = product.stock + stockIn.quantity;

        const { error: updateError } = await supabaseClient
            .from('products')
            .update({ stock: newStock })
            .eq('id', stockIn.product_id);

        if (updateError) throw updateError;

        const { data, error } = await supabaseClient
            .from('stock_in')
            .insert([stockIn])
            .select();
        
        if (error) throw error;
        return data;
    }

    // Stock Out
    static async addStockOut(stockOut) {
        const { data: product, error: productError } = await supabaseClient
            .from('products')
            .select('stock')
            .eq('id', stockOut.product_id)
            .single();
        
        if (productError) throw productError;

        if (product.stock < stockOut.quantity) {
            throw new Error('Stok tidak mencukupi');
        }

        const newStock = product.stock - stockOut.quantity;

        const { error: updateError } = await supabaseClient
            .from('products')
            .update({ stock: newStock })
            .eq('id', stockOut.product_id);

        if (updateError) throw updateError;

        const { data, error } = await supabaseClient
            .from('stock_out')
            .insert([stockOut])
            .select();
        
        if (error) throw error;
        return data;
    }

    // Suppliers
    static async getSuppliers() {
        const { data, error } = await supabaseClient
            .from('suppliers')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    static async addSupplier(supplier) {
        const { data, error } = await supabaseClient
            .from('suppliers')
            .insert([supplier])
            .select();
        if (error) throw error;
        return data;
    }

    static async updateSupplier(id, supplier) {
        const { data, error } = await supabaseClient
            .from('suppliers')
            .update(supplier)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    }

    static async deleteSupplier(id) {
        const { error } = await supabaseClient
            .from('suppliers')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }

    // Categories
    static async getCategories() {
        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('name');
        if (error) throw error;
        return data;
    }

    // Dashboard
    static async getDashboardStats() {
        const { data: products, error: productError } = await supabaseClient
            .from('products')
            .select('stock, min_stock');
        
        if (productError) throw productError;

        const totalItems = products.length;
        const lowStock = products.filter(p => p.stock <= p.min_stock).length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

        // Get today's stock in
        const today = new Date().toISOString().split('T')[0];
        const { data: stockIn, error: stockInError } = await supabaseClient
            .from('stock_in')
            .select('quantity')
            .gte('created_at', today);
        
        if (stockInError) throw stockInError;

        const { data: stockOut, error: stockOutError } = await supabaseClient
            .from('stock_out')
            .select('quantity')
            .gte('created_at', today);
        
        if (stockOutError) throw stockOutError;

        const totalIn = stockIn.reduce((sum, s) => sum + s.quantity, 0);
        const totalOut = stockOut.reduce((sum, s) => sum + s.quantity, 0);

        return {
            totalItems,
            lowStock,
            totalStock,
            totalIn,
            totalOut
        };
    }
}