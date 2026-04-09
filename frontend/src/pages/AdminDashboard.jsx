import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Package, Tag, Users, Tag as CategoryIcon,
  LogOut, RefreshCw, Plus, Edit2, Trash2, CheckCircle,
  XCircle, Settings, TrendingUp, Eye, ShieldAlert, Upload, Calendar
} from 'lucide-react';
import { adminAPI, authAPI, usersAPI } from '../services/api';
import { useStore } from '../context/StoreContext';
import styles from './AdminDashboard.module.css';

// ── Order status badge colors
const STATUS_COLORS = {
  pending: '#F59E0B', confirmed: '#3B82F6', processing: '#8B5CF6',
  shipped: '#06B6D4', delivered: '#10B981', cancelled: '#EF4444', refunded: '#6B7280'
};

function StatCard({ icon, label, value, sub, color = '#C9A96E' }) {
  return (
    <div className={styles.statCard} style={{ borderBottom: `4px solid ${color}` }}>
      <div className={styles.statIcon} style={{ color, background: `${color}1A` }}>{icon}</div>
      <div className={styles.statInfo}>
        <span>{label}</span>
        <strong>{value}</strong>
        {sub && <small style={{ color }}>{sub}</small>}
      </div>
    </div>
  );
}

// ── Dashboard Tab
function DashboardTab({ stats, orderStats }) {
  return (
    <>
      <div className={styles.statsGrid}>
        <StatCard icon={<TrendingUp size={24} />} label="Today's Revenue" value={`£${stats?.revenue?.today?.toFixed(2) || '0.00'}`} color="#10B981" />
        <StatCard icon={<Calendar size={24} />} label="Monthly Revenue" value={`£${stats?.revenue?.monthly?.toFixed(2) || '0.00'}`} color="#3B82F6" />
        <StatCard icon={<Package size={24} />} label="Total Orders" value={stats?.orders?.total || 0} color="#8B5CF6" />
        <StatCard icon={<Users size={24} />} label="Total Customers" value={stats?.users?.total || 0} sub={`${stats?.users?.new_today || 0} new today`} color="#C9A96E" />
        <StatCard icon={<Tag size={24} />} label="Products" value={stats?.products?.total || 0} sub={`${stats?.products?.active || 0} active`} color="#F59E0B" />
        <StatCard icon={<Package size={24} />} label="Pending Orders" value={stats?.orders?.pending || 0} color="#EF4444" />
      </div>

      {/* Top Selling */}
      {stats?.products?.top_selling?.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3>🏆 Top Selling Products</h3></div>
          <table className={styles.table}>
            <thead><tr><th>Product</th><th>Units Sold</th></tr></thead>
            <tbody>
              {stats.products.top_selling.map(p => (
                <tr key={p.product_id}><td>{p.name}</td><td><strong>{p.sold}</strong></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Orders Tab
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.listOrders(page, 15, statusFilter);
      setOrders(data?.items || []);
      setTotal(data?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try { 
      await adminAPI.updateOrderStatus(id, status); 
      await fetchOrders(); 
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
      toast.success('Status updated'); 
    }
    catch (e) { toast.error(e.message); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Orders Management</h3>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={styles.filterSelect}>
          <option value="">All Statuses</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <div className={styles.formOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.formCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Order {selectedOrder.order_number}</h3>
              <span className={styles.statusBadge} style={{ background: STATUS_COLORS[selectedOrder.status] + '22', color: STATUS_COLORS[selectedOrder.status], fontSize: '13px' }}>
                {selectedOrder.status.toUpperCase()}
              </span>
            </div>

            <div className={styles.orderModalContent}>
              <div className={styles.orderGrid}>
                {/* Customer & Shipping Info */}
                <div className={styles.orderSection}>
                  <h4><Package size={18} /> Delivery Details</h4>
                  <div className={styles.infoPair}><span>Name</span><strong>{selectedOrder.shipping_name || 'N/A'}</strong></div>
                  <div className={styles.infoPair} style={{ marginTop: '12px' }}>
                    <span>Address</span>
                    <strong>
                      {selectedOrder.shipping_address}<br/>
                      {selectedOrder.shipping_city}, {selectedOrder.shipping_postcode}
                    </strong>
                  </div>
                  <div className={styles.infoPair} style={{ marginTop: '12px' }}><span>Phone</span><strong>{selectedOrder.shipping_phone || 'N/A'}</strong></div>
                  {selectedOrder.notes && (
                     <div className={styles.infoPair} style={{ marginTop: '12px' }}><span>Customer Notes</span><strong style={{ color: '#F59E0B' }}>{selectedOrder.notes}</strong></div>
                  )}
                </div>

                {/* Payment Info */}
                <div className={styles.orderSection}>
                  <h4><Tag size={18} /> Payment & Status</h4>
                  <div className={styles.infoPair}><span>Date</span><strong>{new Date(selectedOrder.created_at).toLocaleString('en-GB')}</strong></div>
                  <div className={styles.infoPair} style={{ marginTop: '12px' }}><span>Payment Method</span><strong>{selectedOrder.payment_method ? selectedOrder.payment_method.toUpperCase() : 'STRIPE / CARD'}</strong></div>
                  <div className={styles.infoPair} style={{ marginTop: '12px' }}><span>Payment Status</span><strong style={{ color: selectedOrder.payment_status === 'paid' ? '#10B981' : '#F59E0B' }}>{selectedOrder.payment_status ? selectedOrder.payment_status.toUpperCase() : 'PENDING'}</strong></div>
                  {selectedOrder.coupon_code && (
                     <div className={styles.infoPair} style={{ marginTop: '12px' }}><span>Coupon Applied</span><strong>{selectedOrder.coupon_code}</strong></div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className={styles.orderSection}>
                <h4><Package size={18} /> Order Items ({selectedOrder.items?.length || 0})</h4>
                <div className={styles.orderItemsList}>
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className={styles.orderItemRow}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles.orderItemName}>{item.product_name}</span>
                        <span className={styles.orderItemQty}>x{item.quantity}</span>
                      </div>
                      <span className={styles.orderItemPrice}>£{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.totalsBreakdown}>
                  <div className={styles.totalRow}><span>Subtotal</span><span>£{parseFloat(selectedOrder.subtotal).toFixed(2)}</span></div>
                  <div className={styles.totalRow}><span>Shipping</span><span>£{parseFloat(selectedOrder.shipping_cost).toFixed(2)}</span></div>
                  <div className={styles.totalRow}><span>Tax (Included)</span><span>£{parseFloat(selectedOrder.tax).toFixed(2)}</span></div>
                  {parseFloat(selectedOrder.discount) > 0 && (
                    <div className={`${styles.totalRow} ${styles.discount}`}><span>Discount</span><span>-£{parseFloat(selectedOrder.discount).toFixed(2)}</span></div>
                  )}
                  <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>Total</span><span>£{parseFloat(selectedOrder.total_price).toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>UPDATE STATUS:</span>
                <select
                  value={selectedOrder.status}
                  className={styles.statusSelect}
                  onChange={e => updateStatus(selectedOrder.id, e.target.value)}
                  disabled={updatingId === selectedOrder.id}
                  style={{ background: '#222', padding: '8px 12px' }}
                >
                  {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button className={styles.cancelBtn} onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p className={styles.loading}>Loading orders...</p> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.order_number}</strong></td>
                  <td>{o.shipping_name || 'N/A'}</td>
                  <td>£{parseFloat(o.total_price).toFixed(2)}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>
                      {o.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className={styles.iconBtn} onClick={() => setSelectedOrder(o)} title="View Order Details"><Eye size={14} /></button>
                      <select
                        defaultValue={o.status}
                        className={styles.statusSelect}
                        onChange={e => updateStatus(o.id, e.target.value)}
                        disabled={updatingId === o.id}
                      >
                        {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pagination}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>Page {page}</span>
        <button disabled={orders.length < 15} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

// ── Products Tab
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', slug: '', price: '', stock_quantity: '', brand: '',
    is_featured: false, is_active: true, description: '', category_id: '',
    sku: '', badge: '', tags: '', abv: '', volume: '', country: '', subcategory: ''
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [pData, cData] = await Promise.all([
        adminAPI.listProducts(page, 15, search),
        adminAPI.listCategories()
      ]);
      setProducts(pData?.items || []);
      setCategories(cData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      name: '', slug: '', price: '', stock_quantity: '', brand: '',
      is_featured: false, is_active: true, description: '', category_id: '',
      sku: '', badge: '', tags: '', abv: '', volume: '', country: '', subcategory: ''
    });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name, slug: p.slug, price: p.price, stock_quantity: p.stock_quantity,
      brand: p.brand || '', is_featured: p.is_featured, is_active: p.is_active,
      description: p.description || '', category_id: p.category_id || '',
      sku: p.sku || '', badge: p.badge || '', tags: p.tags || '',
      abv: p.abv || '', volume: p.volume || '', country: p.country || '',
      subcategory: p.subcategory || ''
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      
      // Convert empty strings to null to avoid backend validation/unique constraints errors
      Object.keys(data).forEach(key => {
        if (data[key] === '') data[key] = null;
      });
      
      data.price = parseFloat(form.price);
      data.stock_quantity = parseInt(form.stock_quantity) || 0;
      data.category_id = form.category_id ? parseInt(form.category_id) : null;
      
      if (editingProduct) await adminAPI.updateProduct(editingProduct.id, data);
      else await adminAPI.createProduct(data);
      setShowForm(false);
      fetchProducts();
      toast.success(editingProduct ? 'Product updated' : 'Product created');
    } catch (err) { toast.error(err.message); }
  };

  const handleImageUpload = async (productId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await adminAPI.uploadProductImage(productId, file, true);
      toast.success('Image uploaded!');
      fetchProducts();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await adminAPI.deleteProduct(id); fetchProducts(); toast.success('Product deleted'); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Products ({products.length})</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input className={styles.searchInput} placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <button className={styles.addBtn} onClick={openCreate}><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formCard}>
            <h3>{editingProduct ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSave} className={styles.adminForm}>
              <div className={styles.formGrid}>
                <div className={styles.formField}><label>Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} required /></div>
                <div className={styles.formField}><label>Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required /></div>
                <div className={styles.formField}><label>Price (£)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
                <div className={styles.formField}><label>Stock</label><input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} required /></div>
                <div className={styles.formField}><label>Brand</label><input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
                <div className={styles.formField}>
                  <label>Category</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">None</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className={styles.formField}><label>SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
                <div className={styles.formField}><label>ABV (%)</label><input value={form.abv} onChange={e => setForm({ ...form, abv: e.target.value })} placeholder="e.g. 40%" /></div>
                <div className={styles.formField}><label>Volume</label><input value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} placeholder="e.g. 70cl" /></div>
                <div className={styles.formField}><label>Country</label><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
                <div className={styles.formField}><label>Badge</label><input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. New, Sale" /></div>
                <div className={styles.formField} style={{ gridColumn: '1/-1' }}><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                <div className={styles.formField}><label><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} /> Featured</label></div>
                <div className={styles.formField}><label><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active</label></div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className={styles.addBtn}>{editingProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p className={styles.loading}>Loading...</p> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Featured</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br /><small style={{ color: '#888' }}>{p.brand}</small></td>
                  <td>£{parseFloat(p.price).toFixed(2)}</td>
                  <td>{p.stock_quantity}</td>
                  <td>{p.is_featured ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#6B7280" />}</td>
                  <td>{p.is_active ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className={styles.iconBtn} onClick={() => openEdit(p)} title="Edit"><Edit2 size={14} /></button>
                      <label className={styles.uploadIconBtn} title="Upload Image">
                        <Upload size={14} />
                        <input type="file" hidden onChange={e => handleImageUpload(p.id, e)} />
                      </label>
                      <button className={styles.iconBtn} style={{ color: '#EF4444' }} onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pagination}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>Page {page}</span>
        <button disabled={products.length < 15} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

// ── Users Tab
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.listUsers(page, 20);
      setUsers(data?.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (id) => {
    if (!window.confirm('Ban this user?')) return;
    try {
      await adminAPI.banUser(id);
      toast.success('User banned');
      fetchUsers();
    } catch (e) { toast.error(e.message); }
  };
  const handleActivate = async (id) => {
    try {
      await adminAPI.activateUser(id);
      toast.success('User activated');
      fetchUsers();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}><h3>Users Management</h3></div>
      {loading ? <p className={styles.loading}>Loading...</p> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>{u.role}</span></td>
                  <td>{u.is_verified ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#F59E0B" />}</td>
                  <td>{u.is_active ? <span style={{ color: '#10B981', fontSize: '12px' }}>Active</span> : <span style={{ color: '#EF4444', fontSize: '12px' }}>Banned</span>}</td>
                  <td>{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {u.is_active
                        ? <button className={styles.iconBtn} style={{ color: '#EF4444' }} onClick={() => handleBan(u.id)} title="Ban user"><XCircle size={14} /></button>
                        : <button className={styles.iconBtn} style={{ color: '#10B981' }} onClick={() => handleActivate(u.id)} title="Activate user"><CheckCircle size={14} /></button>
                      }
                      {u.role === 'customer' && (
                         <button className={styles.iconBtn} title="Promote to admin" onClick={() => { if(window.confirm(`Promote ${u.name} to admin?`)) adminAPI.promoteToAdmin(u.id).then(fetchUsers); }}><ShieldAlert size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pagination}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>Page {page}</span>
        <button disabled={users.length < 20} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

// ── Categories Tab
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.listCategories();
      setCategories(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await adminAPI.updateCategory(editing.id, form);
      else await adminAPI.createCategory(form);
      setShowForm(false);
      fetchCategories();
      toast.success(editing ? 'Category updated' : 'Category created');
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await adminAPI.deleteCategory(id); fetchCategories(); toast.success('Category deleted'); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Categories ({categories.length})</h3>
        <button className={styles.addBtn} onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', is_active: true }); setShowForm(true); }}>
          <Plus size={16} /> New Category
        </button>
      </div>

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formCard}>
            <h3>{editing ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSave} className={styles.adminForm}>
              <div className={styles.formGrid}>
                <div className={styles.formField}><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} required /></div>
                <div className={styles.formField}><label>Slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required /></div>
                <div className={styles.formField} style={{ gridColumn: '1/-1' }}><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
                <div className={styles.formField}><label><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label></div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className={styles.addBtn}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p className={styles.loading}>Loading...</p> : (
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Slug</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.slug}</td>
                <td>{c.is_active ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={styles.iconBtn} onClick={() => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || '', is_active: c.is_active }); setShowForm(true); }}><Edit2 size={14} /></button>
                    <button className={styles.iconBtn} style={{ color: '#EF4444' }} onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Settings Tab (Profile)
function SettingsTab() {
  const { state, dispatch } = useStore();
  const [profile, setProfile] = useState({ name: state.user?.name || '', phone: state.user?.phone || '' });
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updated = await usersAPI.update(profile);
      dispatch({ type: 'SET_USER', payload: updated });
      toast.success('Profile updated!');
    } catch (e) { toast.error(e.message); }
    finally { setUpdating(false); }
  };

  return (
    <div className={styles.panel} style={{ maxWidth: '600px' }}>
      <div className={styles.panelHeader}><h3>Admin Profile Settings</h3></div>
      <form onSubmit={handleUpdate} className={styles.adminForm}>
        <div className={styles.formField}><label>Full Name</label><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required /></div>
        <div className={styles.formField}><label>Email Address (Cannot change)</label><input value={state.user?.email || ''} disabled /></div>
        <div className={styles.formField}><label>Phone Number</label><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+44 7700 000000" /></div>
        <div className={styles.formActions}><button type="submit" className={styles.addBtn} disabled={updating}>{updating ? 'Updating...' : 'Save Settings'}</button></div>
      </form>
    </div>
  );
}

// ── Main Admin Dashboard Component
export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const { state, logout } = useStore();
  const navigate = useNavigate();

  const isAdmin = state.user?.role === 'admin' || state.user?.role === 'super_admin';

  useEffect(() => {
    if (!state.user) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/'); return; }
  }, [state.user, isAdmin, navigate]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [revenue, orders, products, users] = await Promise.all([
        adminAPI.revenue(), adminAPI.orderStats(), adminAPI.productStats(), adminAPI.userStats(),
      ]);
      setStats({ revenue, orders, products, users });
    } catch (e) { console.error(e); }
    finally { setLoadingStats(false); }
  }, []);

  useEffect(() => { if (isAdmin) loadStats(); }, [isAdmin, loadStats]);

  const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={18} /> },
    { key: 'orders', label: 'Orders', icon: <Package size={18} />, badge: stats?.orders?.pending },
    { key: 'categories', label: 'Categories', icon: <CategoryIcon size={18} /> },
    { key: 'products', label: 'Products', icon: <Tag size={18} /> },
    { key: 'users', label: 'Users', icon: <Users size={18} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];






  if (!state.user || !isAdmin) return null;

  return (
    <div className={styles.adminWrap}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>🥂 Admin Portal</div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} className={`${styles.navBtn} ${tab === item.key ? styles.active : ''}`} onClick={() => setTab(item.key)}>
              {item.icon}
              {item.label}
              {item.badge > 0 && <span className={styles.badge}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.navBtn} onClick={() => navigate('/')}>
            <Eye size={18} /> View Site
          </button>
          <button className={styles.navBtn} onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h2>{NAV_ITEMS.find(n => n.key === tab)?.label || 'Dashboard'}</h2>
          <div className={styles.headerRight}>
            <button className={styles.refreshBtn} onClick={loadStats}><RefreshCw size={16} /></button>
            <div className={styles.userMenu}>
              <span className={styles.userAvatar}>{state.user?.name?.[0] || 'A'}</span>
              <span>{state.user?.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {tab === 'dashboard' && (
            loadingStats
              ? <div className={styles.loadingFull}><RefreshCw size={32} className={styles.spinning} /> Loading analytics...</div>
              : <DashboardTab stats={stats} orderStats={stats?.orders} />
          )}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'settings' && <SettingsTab />}

        </div>
      </main>
    </div>
  );
}
