// assets/js/main.js
// ============================================
// FUNGSI GLOBAL UNTUK SEMUA HALAMAN
// ============================================

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };
    
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.style.cssText = `
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        animation: slideInLeft 0.4s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 450px;
        background: ${colors[type] || colors.info};
        margin-bottom: 8px;
        transform: translateX(0);
        transition: all 0.3s ease;
    `;
    
    toast.innerHTML = `
        <i class="bi ${icons[type] || icons.info}" style="font-size: 20px;"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" 
                style="margin-left: auto; background: none; border: none; color: white; font-size: 24px; cursor: pointer; opacity: 0.7; line-height: 1;">
            &times;
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 90vw;
    `;
    document.body.appendChild(container);
    return container;
}

// ============================================
// SIDEBAR TOGGLE (Mobile)
// ============================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('show');
        if (overlay) overlay.classList.toggle('show');
    }
}

// ============================================
// AUTO CLOSE SIDEBAR ON RESIZE
// ============================================
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    }
});

// ============================================
// ANIMATION HELPER
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes to elements
    document.querySelectorAll('.animate-fadeInUp').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.05}s`;
    });
});

// ============================================
// EXPOSE GLOBAL FUNCTIONS
// ============================================
window.showToast = showToast;
window.toggleSidebar = toggleSidebar;// assets/js/main.js
// ============================================
// FUNGSI GLOBAL UNTUK SEMUA HALAMAN
// ============================================

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };
    
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.style.cssText = `
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        animation: slideInLeft 0.4s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 450px;
        background: ${colors[type] || colors.info};
        margin-bottom: 8px;
        transform: translateX(0);
        transition: all 0.3s ease;
    `;
    
    toast.innerHTML = `
        <i class="bi ${icons[type] || icons.info}" style="font-size: 20px;"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" 
                style="margin-left: auto; background: none; border: none; color: white; font-size: 24px; cursor: pointer; opacity: 0.7; line-height: 1;">
            &times;
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 90vw;
    `;
    document.body.appendChild(container);
    return container;
}

// ============================================
// SIDEBAR TOGGLE (Mobile)
// ============================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('show');
        if (overlay) overlay.classList.toggle('show');
    }
}

// ============================================
// AUTO CLOSE SIDEBAR ON RESIZE
// ============================================
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    }
});

// ============================================
// ANIMATION HELPER
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes to elements
    document.querySelectorAll('.animate-fadeInUp').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.05}s`;
    });
});

// ============================================
// EXPOSE GLOBAL FUNCTIONS
// ============================================
window.showToast = showToast;
window.toggleSidebar = toggleSidebar;