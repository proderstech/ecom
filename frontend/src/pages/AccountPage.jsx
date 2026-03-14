import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Package, User, MapPin, Heart, LogOut } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import styles from './AccountPage.module.css';

export default function AccountPage() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('orders');

  if (!state.user) return <Navigate to="/login" />;

  const handleLogout = () => dispatch({ type: 'LOGOUT' });

  const MOCK_ORDERS = [
    { id: '#BG-84920', date: 'Oct 12, 2026', total: 145.98, status: 'Delivered', items: 3 },
    { id: '#BG-73041', date: 'Sep 28, 2026', total: 42.99, status: 'Delivered', items: 1 },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Account</h1>
          <p>Welcome back, {state.user.name}</p>
        </div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <button className={`${styles.navBtn} ${tab === 'orders' ? styles.active : ''}`} onClick={() => setTab('orders')}><Package size={18} /> Orders</button>
            <button className={`${styles.navBtn} ${tab === 'profile' ? styles.active : ''}`} onClick={() => setTab('profile')}><User size={18} /> Profile Details</button>
            <button className={`${styles.navBtn} ${tab === 'addresses' ? styles.active : ''}`} onClick={() => setTab('addresses')}><MapPin size={18} /> Addresses</button>
            <button className={`${styles.navBtn} ${tab === 'wishlist' ? styles.active : ''}`} onClick={() => setTab('wishlist')}>
              <Heart size={18} /> Wishlist {state.wishlist.length > 0 && <span>({state.wishlist.length})</span>}
            </button>
            <div className={styles.divider} />
            <button className={styles.navBtnOut} onClick={handleLogout}><LogOut size={18} /> Sign Out</button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {tab === 'orders' && (
              <div className={styles.panel}>
                <h2>Order History</h2>
                <div className={styles.orderList}>
                  {MOCK_ORDERS.map(o => (
                    <div key={o.id} className={styles.orderCard}>
                      <div className={styles.orderHead}>
                        <div>
                          <strong>{o.id}</strong>
                          <span className={styles.orderDate}>{o.date}</span>
                        </div>
                        <span className={styles.orderStatus}>{o.status}</span>
                      </div>
                      <div className={styles.orderBody}>
                        <div>{o.items} items</div>
                        <div className={styles.orderTotal}>£{o.total.toFixed(2)}</div>
                      </div>
                      <button className={styles.orderBtn}>View Details</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'profile' && (
              <div className={styles.panel}>
                <h2>Profile Details</h2>
                <div className={styles.grid}>
                  <div className={styles.field}><label>Name</label><input type="text" defaultValue={state.user.name} /></div>
                  <div className={styles.field}><label>Email</label><input type="email" defaultValue={state.user.email} /></div>
                  <div className={styles.field}><label>Phone</label><input type="tel" placeholder="+44 7000 000000" /></div>
                </div>
                <button className={styles.saveBtn}>Save Changes</button>
                <div className={styles.ageStatus}>
                  Status: <strong>{state.ageVerified ? 'Age Verified' : 'Standard'}</strong>
                </div>
              </div>
            )}

            {tab === 'addresses' && (
              <div className={styles.panel}>
                <div className={styles.flexBetween}>
                  <h2>Saved Addresses</h2>
                  <button className={styles.saveBtn}>+ Add New</button>
                </div>
                <div className={styles.addressCard}>
                  <div className={styles.badge}>Default</div>
                  <strong>{state.user.name}</strong>
                  <p>42 Example Street<br />London, SW1X 8LR</p>
                  <p>Delivery Instructions: Please leave in porch if not in.</p>
                  <div className={styles.addressActions}>
                    <button>Edit</button> | <button>Delete</button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'wishlist' && (
              <div className={styles.panel}>
                <h2>My Wishlist</h2>
                {state.wishlist.length === 0 ? (
                  <div className={styles.empty}>
                    <Heart size={48} className={styles.emptyIcon} />
                    <p>Your wishlist is empty.</p>
                    <Link to="/shop" className={styles.saveBtn}>Browse Shop</Link>
                  </div>
                ) : (
                  <div className={styles.productsGrid}>
                    {state.wishlist.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
