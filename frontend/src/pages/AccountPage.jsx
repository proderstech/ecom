import { useState, useEffect } from 'react';
import { Navigate, Link, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ordersAPI, usersAPI, addressesAPI } from '../services/api';
import { Package, User, MapPin, Heart, LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '../components/UI/ProductCard';
import styles from './AccountPage.module.css';


export default function AccountPage() {
  const { state, dispatch } = useStore();
  const { tab: urlTab } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(urlTab || 'orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: state.user?.name || '',
    email: state.user?.email || '',
    phone: state.user?.phone || '',
    date_of_birth: state.user?.date_of_birth || '',
  });
  const [updating, setUpdating] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Address Management
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ id: null, name: state.user?.name || '', address: '', city: 'London', postcode: '', instructions: '' });

  useEffect(() => {
    if (tab === 'addresses' && state.user) {
      setLoadingAddresses(true);
      addressesAPI.list()
        .then(setAddresses)
        .catch(err => console.error('Failed to fetch addresses:', err))
        .finally(() => setLoadingAddresses(false));
    }
  }, [tab, state.user]);

  // Sync tab with URL
  useEffect(() => {
    if (urlTab && urlTab !== tab) {
      setTab(urlTab);
    }
  }, [urlTab, tab]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    navigate(`/account/${newTab}`);
  };

  useEffect(() => {
    if (tab === 'orders' && state.user) {
      setLoadingOrders(true);
      ordersAPI.list(1, 50)
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
          else if (data && Array.isArray(data.items)) setOrders(data.items);
          else setOrders([]);
        })
        .catch(err => {
          console.error('Failed to fetch orders:', err);
          setOrders([]);
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [tab, state.user]);

  useEffect(() => {
    if (state.user) {
      setProfileForm({
        name: state.user.name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        date_of_birth: state.user.date_of_birth || '',
      });
    }
  }, [state.user]);

  if (!state.user) return <Navigate to="/login" />;

  const handleLogout = () => dispatch({ type: 'LOGOUT' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.warning('Name is required');
    setUpdating(true);
    try {
      const updated = await usersAPI.update(profileForm);
      dispatch({ type: 'UPDATE_USER', payload: updated });
      toast.success('Profile updated successfully!');
    } catch (err) {
      // API errors are toasted by apiFetch, but we can add a fallback or additional context
      if (!err.message.includes("Database error")) {
         toast.error(err.message || 'Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.address || !addressForm.postcode) return toast.warning('Address and Postcode are required');
    
    setUpdating(true);
    try {
      if (addressForm.id) {
        const updated = await addressesAPI.update(addressForm.id, addressForm);
        setAddresses(prev => prev.map(a => a.id === addressForm.id ? updated : a));
        toast.success('Address updated');
      } else {
        const created = await addressesAPI.create(addressForm);
        setAddresses(prev => [created, ...prev]);
        toast.success('Address saved');
      }
      setShowAddressForm(false);
      setAddressForm({ id: null, name: state.user?.name || '', address: '', city: 'London', postcode: '', instructions: '' });
    } catch (err) {
      // API error toasted by apiFetch
    } finally {
      setUpdating(false);
    }
  };

  const handleEditAddress = (addr) => {
    setAddressForm(addr);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressesAPI.delete(id);
        setAddresses(prev => prev.filter(a => a.id !== id));
        toast.success('Address deleted');
      } catch (err) {
        // API error toasted by apiFetch
      }
    }
  };


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
            <button className={`${styles.navBtn} ${tab === 'orders' ? styles.active : ''}`} onClick={() => handleTabChange('orders')}><Package size={18} /> Orders</button>
            <button className={`${styles.navBtn} ${tab === 'profile' ? styles.active : ''}`} onClick={() => handleTabChange('profile')}><User size={18} /> Profile Details</button>
            <button className={`${styles.navBtn} ${tab === 'addresses' ? styles.active : ''}`} onClick={() => handleTabChange('addresses')}><MapPin size={18} /> Addresses</button>
            <button className={`${styles.navBtn} ${tab === 'wishlist' ? styles.active : ''}`} onClick={() => handleTabChange('wishlist')}>
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
                {loadingOrders ? (
                  <div className={styles.loading}><RefreshCw className={styles.spinning} /> Loading...</div>
                ) : orders.length === 0 ? (
                  <div className={styles.empty}>You haven't placed any orders yet.</div>
                ) : (
                  <div className={styles.orderList}>
                    {orders.map(o => (
                      <div key={o.id} className={styles.orderCard}>
                        <div className={styles.orderHead}>
                          <div>
                            <strong>#{o.order_number}</strong>
                            <span className={styles.orderDate}>{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className={styles.orderStatus} data-status={o.status}>{o.status}</span>
                        </div>
                        <div className={styles.orderBody}>
                          <div>{o.items?.length || 0} items</div>
                          <div className={styles.orderTotal}>£{parseFloat(o.total_price).toFixed(2)}</div>
                        </div>
                        <button className={styles.orderBtn} onClick={() => setExpandedOrder(prev => prev === o.id ? null : o.id)}>
                          {expandedOrder === o.id ? 'Hide Details' : 'View Details'}
                        </button>

                        {expandedOrder === o.id && (
                          <div className={styles.orderDetails}>
                            <div className={styles.detailsGrid}>
                              <div className={styles.detailsSection}>
                                <h4>Shipping Details</h4>
                                <p>{o.shipping_name || state.user?.name}</p>
                                <p>{o.shipping_address || 'Not Provided'}</p>
                                {o.shipping_city && <p>{o.shipping_city}, {o.shipping_postcode}</p>}
                              </div>
                              <div className={styles.detailsSection}>
                                <h4>Order Summary</h4>
                                <p><strong>Status:</strong> {o.status} | <strong>Payment:</strong> {o.payment_status}</p>
                                <p>Subtotal: £{parseFloat(o.subtotal || 0).toFixed(2)}</p>
                                <p>Shipping: £{parseFloat(o.shipping_cost || 0).toFixed(2)}</p>
                                {parseFloat(o.tax || 0) > 0 && <p>Tax: £{parseFloat(o.tax || 0).toFixed(2)}</p>}
                                {parseFloat(o.discount || 0) > 0 && <p>Discount: -£{parseFloat(o.discount || 0).toFixed(2)}</p>}
                                <p className={styles.grandTotal}><strong>Total: £{parseFloat(o.total_price || 0).toFixed(2)}</strong></p>
                              </div>
                            </div>
                            <div className={styles.detailsSection}>
                              <h4>Items</h4>
                              <div className={styles.orderItemsList}>
                                {o.items?.map(item => (
                                  <div key={item.id} className={styles.orderItemRow}>
                                    <div className={styles.itemInfo}>
                                      <span className={styles.itemName}>{item.product_name}</span>
                                      <span className={styles.itemMeta}>Qty: {item.quantity}</span>
                                    </div>
                                    <span className={styles.itemPrice}>£{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'profile' && (
              <div className={styles.panel}>
                <h2>Profile Details</h2>
                <form onSubmit={handleProfileUpdate}>
                  <div className={styles.grid}>
                    <div className={styles.field}>
                      <label>Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Email</label>
                      <input type="email" value={profileForm.email} disabled title="Email cannot be changed" />
                    </div>
                    <div className={styles.field}>
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+44 7000 000000"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={profileForm.date_of_birth}
                        onChange={e => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                        required
                      />
                      <small className={styles.fieldNote}>Required to verify age for alcohol delivery.</small>
                    </div>
                  </div>
                  <button type="submit" className={styles.saveBtn} disabled={updating}>
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

               <div className={styles.ageStatus}>
                  Status: <strong>{state.ageVerified ? 'Age Verified' : 'Standard'}</strong>
                </div>
              </div>
            )}

            {tab === 'addresses' && (
              <div className={styles.panel}>
                <div className={styles.flexBetween}>
                  <h2>Saved Addresses</h2>
                  {!showAddressForm && (
                    <button className={styles.saveBtn} onClick={() => setShowAddressForm(true)}>+ Add New</button>
                  )}
                </div>

                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className={styles.addressForm}>
                    <h3>{addressForm.id ? 'Edit Address' : 'Add New Address'}</h3>
                    <div className={styles.formGroup}>
                      <label>Recipient Name</label>
                      <input type="text" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} placeholder="John Smith" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Street Address</label>
                      <input type="text" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} placeholder="42 Example St" required />
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>City</label>
                        <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Postcode</label>
                        <input type="text" value={addressForm.postcode} onChange={e => setAddressForm({...addressForm, postcode: e.target.value})} placeholder="SW1X 8LR" required />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Delivery Instructions (Optional)</label>
                      <textarea value={addressForm.instructions} onChange={e => setAddressForm({...addressForm, instructions: e.target.value})} placeholder="Leave with neighbor if out..." rows={2} />
                    </div>
                    <div className={styles.formBtns}>
                      <button type="submit" className={styles.saveBtn}>{addressForm.id ? 'Update Address' : 'Save Address'}</button>
                      <button type="button" className={styles.cancelBtn} onClick={() => setShowAddressForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                <div className={styles.addressList}>
                  {loadingAddresses ? (
                    <div className={styles.loading}><RefreshCw className={styles.spinning} /> Loading...</div>
                  ) : addresses.length === 0 ? (
                    <div className={styles.empty}>No saved addresses.</div>
                  ) : (
                    addresses.map((addr, idx) => (
                      <div key={addr.id} className={styles.addressCard}>
                        {addr.is_default && <div className={styles.badge}>Default</div>}
                        <strong>{addr.name}</strong>
                        <p>{addr.address}<br />{addr.city}{addr.city && ', '}{addr.postcode}</p>
                        {addr.instructions && <p><em>Instructions: {addr.instructions}</em></p>}
                        <div className={styles.addressActions}>
                          <button onClick={() => handleEditAddress(addr)}>Edit</button> | <button onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                          {!addr.is_default && (
                            <> | <button onClick={async () => {
                              const updated = await addressesAPI.update(addr.id, { is_default: true });
                              addressesAPI.list().then(setAddresses);
                              toast.success('Default address updated');
                            }}>Set as Default</button></>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
