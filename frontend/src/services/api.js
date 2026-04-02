import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const API_ROOT = BASE_URL.replace('/api/v1', '');

export const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1541334643621-0810332822f3?w=500&q=80';
  if (path.startsWith('http')) return path;
  return `${API_ROOT}${path.startsWith('/') ? '' : '/'}${path}`;
};

// ── Token Management ──────────────────────────────────────────────────────
export function getAccessToken() { return localStorage.getItem('bs_access_token'); }
export function getRefreshToken() { return localStorage.getItem('bs_refresh_token'); }
export function setTokens(access, refresh) {
  localStorage.setItem('bs_access_token', access);
  localStorage.setItem('bs_refresh_token', refresh);
}
export function clearTokens() {
  localStorage.removeItem('bs_access_token');
  localStorage.removeItem('bs_refresh_token');
}

// ── Core fetch with auto-refresh ──────────────────────────────────────────
async function apiFetch(endpoint, options = {}, retry = true) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers, credentials: 'include' });

    if (res.status === 401 && retry && !options.skipAuthRedirect) {
      // Try refresh
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh }),
          });
          if (refreshRes.ok) {
            const tokens = await refreshRes.json();
            setTokens(tokens.access_token, tokens.refresh_token);
            return apiFetch(endpoint, options, false);
          }
        } catch {
          // Refresh failed
        }
      }
      clearTokens();
      // Only redirect if not already on login page to avoid endless loops or state loss
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return null;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err.detail || err.message || `Error ${res.status}: ${res.statusText}`;

      // Don't show toast for some errors (e.g. auth handled by component)
      if (!options.silent) {
        toast.error(message, {
          id: message, // prevent duplicate toasts
          style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
        });
      }

      throw new Error(message);
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      toast.error('Network Error. Please check your connection.', {
        style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
      });
    }
    throw err;
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => apiFetch('/auth/register', { 
    method: 'POST', 
    body: JSON.stringify(data),
    skipAuthRedirect: true,
    silent: true 
  }),
  login: async (email, password) => {
    const tokens = await apiFetch('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify({ email, password }),
      skipAuthRedirect: true,
      silent: true 
    });
    if (tokens) setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  },
  logout: () => { clearTokens(); return apiFetch('/auth/logout', { method: 'POST' }); },
  me: () => apiFetch('/auth/me'),
  forgotPassword: (email) => apiFetch('/auth/forgot-password', { 
    method: 'POST', 
    body: JSON.stringify({ email }),
    skipAuthRedirect: true,
    silent: true
  }),
  resetPassword: (token, new_password) => apiFetch('/auth/reset-password', { 
    method: 'POST', 
    body: JSON.stringify({ token, new_password }),
    skipAuthRedirect: true,
    silent: true
  }),
  verifyEmail: (token) => apiFetch('/auth/verify-email', { 
    method: 'POST', 
    body: JSON.stringify({ token }),
    skipAuthRedirect: true,
    silent: true
  }),
};

// ── Products ──────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
    return apiFetch(`/products${q ? `?${q}` : ''}`);
  },
  featured: (limit = 8) => apiFetch(`/products/featured?limit=${limit}`),
  getBySlug: (slug) => apiFetch(`/products/${slug}`),
  search: (q, params = {}) => productsAPI.list({ search: q, ...params }),
};

// ── Categories ────────────────────────────────────────────────────────────
export const categoriesAPI = {
  list: () => apiFetch('/categories'),
  getBySlug: (slug) => apiFetch(`/categories/${slug}`),
};

// ── Cart ──────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => apiFetch('/cart'),
  add: (product_id, quantity = 1) => apiFetch('/cart/add', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  update: (item_id, quantity) => apiFetch('/cart/update', { method: 'PUT', body: JSON.stringify({ item_id, quantity }) }),
  remove: (item_id) => apiFetch(`/cart/remove/${item_id}`, { method: 'DELETE' }),
  clear: () => apiFetch('/cart/clear', { method: 'POST' }),
};

// ── Orders ────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (data) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
  list: (page = 1, limit = 10) => apiFetch(`/orders?page=${page}&limit=${limit}`),
  get: (id) => apiFetch(`/orders/${id}`),
};

// ── Reviews ───────────────────────────────────────────────────────────────
export const reviewsAPI = {
  forProduct: (product_id) => apiFetch(`/reviews/${product_id}`),
  create: (data) => apiFetch('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Wishlist ──────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => apiFetch('/wishlist'),
  add: (product_id) => apiFetch(`/wishlist/add?product_id=${product_id}`, { method: 'POST' }),
  remove: (product_id) => apiFetch(`/wishlist/remove/${product_id}`, { method: 'DELETE' }),
};

// ── Users ─────────────────────────────────────────────────────────────────
export const usersAPI = {
  me: () => apiFetch('/users/me'),
  update: (data) => apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Addresses ─────────────────────────────────────────────────────────────
export const addressesAPI = {
  list: () => apiFetch('/addresses/'),
  create: (data) => apiFetch('/addresses/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/addresses/${id}`, { method: 'DELETE' }),
};

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  // Stats
  revenue: () => apiFetch('/admin/stats/revenue'),
  orderStats: () => apiFetch('/admin/stats/orders'),
  productStats: () => apiFetch('/admin/stats/products'),
  userStats: () => apiFetch('/admin/stats/users'),
  // Orders
  listOrders: (page = 1, limit = 20, status = '') => apiFetch(`/admin/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
  updateOrderStatus: (id, status) => apiFetch(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  // Products
  listProducts: (page = 1, limit = 20, search = '') => apiFetch(`/admin/products?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),
  createProduct: (data) => apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => apiFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
  uploadProductImage: async (id, file, is_primary = false) => {
    const fd = new FormData(); fd.append('file', file); fd.append('is_primary', is_primary);
    const token = getAccessToken();
    try {
      const res = await fetch(`${BASE_URL}/admin/products/${id}/images`, {
        method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Image upload failed');
      }
      return res.json();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  },
  // Categories
  listCategories: () => apiFetch('/admin/categories'),
  createCategory: (data) => apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => apiFetch(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
  // Users
  listUsers: (page = 1, limit = 20) => apiFetch(`/admin/users?page=${page}&limit=${limit}`),
  banUser: (id) => apiFetch(`/admin/users/${id}/ban`, { method: 'PUT' }),
  activateUser: (id) => apiFetch(`/admin/users/${id}/activate`, { method: 'PUT' }),
  promoteToAdmin: (id) => apiFetch(`/admin/users/${id}/promote`, { method: 'PUT' }),
};

// ── Payments ──────────────────────────────────────────────────────────────
export const paymentsAPI = {
  createPaymentIntent: (amount, currency = 'gbp') => 
    apiFetch('/payments/create-payment-intent', { 
      method: 'POST', 
      body: JSON.stringify({ amount, currency }) 
    }),
};
