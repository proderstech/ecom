import { useState } from 'react';
import { Package, Users, Tag, BarChart2, CheckCircle, Clock } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const MOCK_ORDERS = [
  { id: '#BG-84920', user: 'James H.', total: 145.98, status: 'pending', items: 3, time: '10 mins ago' },
  { id: '#BG-84919', user: 'Emma R.', total: 89.50, status: 'dispatched', items: 2, time: '1 hr ago' },
  { id: '#BG-84918', user: 'Oliver K.', total: 210.00, status: 'delivered', items: 6, time: '3 hrs ago' },
  { id: '#BG-84917', user: 'Sophia L.', total: 42.99, status: 'delivered', items: 1, time: 'Yesterday' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className={styles.adminWrap}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>🥂 Admin Portal</div>
        <nav className={styles.nav}>
          <button className={`${styles.navBtn} ${tab === 'dashboard' ? styles.active : ''}`} onClick={() => setTab('dashboard')}><BarChart2 size={18} /> Dashboard</button>
          <button className={`${styles.navBtn} ${tab === 'orders' ? styles.active : ''}`} onClick={() => setTab('orders')}><Package size={18} /> Orders <span className={styles.badge}>2</span></button>
          <button className={`${styles.navBtn} ${tab === 'products' ? styles.active : ''}`} onClick={() => setTab('products')}><Tag size={18} /> Products</button>
          <button className={`${styles.navBtn} ${tab === 'customers' ? styles.active : ''}`} onClick={() => setTab('customers')}><Users size={18} /> Customers</button>
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h2>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h2>
          <div className={styles.userMenu}>Admin User</div>
        </header>

        <div className={styles.content}>
          {tab === 'dashboard' && (
            <>
              {/* Stats */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><BarChart2 size={24} /></div>
                  <div className={styles.statInfo}>
                    <span>Today's Sales</span>
                    <strong>£1,284.50</strong>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><Package size={24} /></div>
                  <div className={styles.statInfo}>
                    <span>Pending Orders</span>
                    <strong>2</strong>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><Users size={24} /></div>
                  <div className={styles.statInfo}>
                    <span>Active Customers</span>
                    <strong>1,492</strong>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><CheckCircle size={24} /></div>
                  <div className={styles.statInfo}>
                    <span>Delivery Success</span>
                    <strong>98.5%</strong>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h3>Recent Orders</h3>
                  <button className={styles.viewAll}>View All</button>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Time</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {MOCK_ORDERS.map(o => (
                        <tr key={o.id}>
                          <td><strong>{o.id}</strong></td>
                          <td>{o.user}</td>
                          <td>£{o.total.toFixed(2)}</td>
                          <td>
                            <span className={`${styles.statusLabel} ${styles[`status${o.status}`]}`}>
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td className={styles.time}><Clock size={12} /> {o.time}</td>
                          <td><button className={styles.actionBtn}>Manage</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === 'orders' && (
            <div className={styles.panel}>
              <h3>Manage Orders</h3>
              <p className={styles.emptyText}>Showing all active orders...</p>
              {/* In a real app, full order management UI here */}
            </div>
          )}

          {tab === 'products' && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Product Inventory</h3>
                <button className={styles.addBtn}>+ Add Product</button>
              </div>
              <p className={styles.emptyText}>Manage catalog, categories, pricing, and stock levels.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
