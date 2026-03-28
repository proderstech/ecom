import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, Truck, Lock } from 'lucide-react';
import { getImageUrl } from '../services/api';
import CartItemImage from '../components/UI/CartItemImage';
import { toast } from 'sonner';
import { useStore } from '../context/StoreContext';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { state, dispatch, cartTotal, removeFromCart, updateQty } = useStore();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const cart = state.cart;
  const subtotal = cartTotal;
  const FREE_DELIVERY_THRESHOLD = 50;
  const delivery = cart.length > 0 ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 2.99) : 0;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal - discount + delivery);
  const vatAmount = (total * 0.2).toFixed(2);

  const applyCoupon = () => {
    if (coupon.toLowerCase() === 'belgravia10') {
      setCouponApplied(true);
    } else {
      toast.error('Invalid coupon code. Try: BELGRAVIA10');
    }
  };

  const handleCheckout = () => {
    if (!state.user) {
      // Show auth modal — checkout requires login
      dispatch({ type: 'SHOW_CHECKOUT_MODAL' });
    } else {
      window.location.href = '/checkout';
    }
  };

  if (cart.length === 0) {
    return (
      <main className={styles.main}>
        <div className={styles.empty}>
          <ShoppingBag size={64} className={styles.emptyIcon} />
          <h2>Your cart is empty</h2>
          <p>Add some premium drinks or groceries to get started.</p>
          <Link to="/shop" className={styles.shopBtn}>Browse Products <ArrowRight size={16} /></Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Your Cart</h1>

        {/* Free delivery progress */}
        {subtotal < FREE_DELIVERY_THRESHOLD && (
          <div className={styles.freeDeliveryBar}>
            <Truck size={16} />
            <span>Add <strong>£{(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)}</strong> more for free delivery!</span>
            <div className={styles.progressWrap}>
              <div className={styles.progressFill} style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
            </div>
          </div>
        )}

        <div className={styles.layout}>
          {/* ── Cart Items ── */}
          <div className={styles.items}>
            {cart.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImg}>
                  <CartItemImage item={item} />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTag}>{typeof item.category === 'object' && item.category !== null ? item.category.name : item.category}</div>
                  <Link to={`/product/${item.id}`} className={styles.itemName}>{item.name}</Link>
                  <div className={styles.itemMeta}>
                    {item.abv && <span>{item.abv}</span>}
                    {item.volume && <span>{item.volume}</span>}
                  </div>
                  {item.abv && <div className={styles.ageTag}>🔞 18+ required</div>}
                </div>
                <div className={styles.itemControls}>
                  <div className={styles.qtyRow}>
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className={styles.itemPrice}>£{(item.price * item.quantity).toFixed(2)}</div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className={styles.summary}>

            {/* Coupon */}
            <div className={styles.summaryCard}>
              <h3>Promo Code</h3>
              {couponApplied ? (
                <div className={styles.couponApplied}><Tag size={14} /> 10% discount applied! Code: <strong>BELGRAVIA10</strong></div>
              ) : (
                <div className={styles.couponRow}>
                  <input type="text" placeholder="Enter promo code" value={coupon} onChange={e => setCoupon(e.target.value)} />
                  <button className={styles.applyBtn} onClick={applyCoupon}>Apply</button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className={styles.totals}>
                <div className={styles.totalRow}><span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span><span>£{subtotal.toFixed(2)}</span></div>
                {couponApplied && <div className={`${styles.totalRow} ${styles.discount}`}><span>💚 Promo Discount</span><span>-£{discount.toFixed(2)}</span></div>}
                <div className={styles.totalRow}><span>Delivery</span><span>{delivery === 0 ? <span className={styles.free}>Free</span> : `£${delivery.toFixed(2)}`}</span></div>
                <div className={styles.totalRow} style={{ fontSize: '11px', color: 'var(--light-grey)' }}><span>VAT (included in price)</span><span>£{vatAmount}</span></div>
                <div className={styles.divider} />
                <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>Total</span><span>£{total.toFixed(2)}</span></div>
              </div>

              <div className={styles.checkboxRow}>
                <input type="checkbox" id="ageConfirm" required />
                <label htmlFor="ageConfirm">I confirm I am 18+ and accept the <Link to="/legal#terms">Terms &amp; Conditions</Link>. Age verification may be required on delivery.</label>
              </div>

              {/* Checkout button — shows auth modal if not logged in */}
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                {state.user ? (
                  <>Proceed to Checkout <ArrowRight size={18} /></>
                ) : (
                  <><Lock size={16} /> Sign In to Checkout</>
                )}
              </button>

              {!state.user && (
                <p className={styles.guestNote}>
                  🔒 A free account is required to place your order. Your cart is saved!
                </p>
              )}

              <Link to="/shop" className={styles.continueBtn}>← Continue Shopping</Link>
            </div>

            {/* Trust badges */}
            <div className={styles.trustBadges}>
              {['🔒 Secure Payment', '🚚 Same-Day Delivery', '🔞 Age Verified', '↩ Easy Returns'].map(b => (
                <span key={b} className={styles.trustBadge}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
