import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Truck, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { ordersAPI, cartAPI, getImageUrl } from '../services/api';
import { useStore } from '../context/StoreContext';
import CartItemImage from '../components/UI/CartItemImage';
import styles from './CheckoutPage.module.css';

const STEPS = ['Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { state, dispatch, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();

  // Auth guard — redirect to home with modal if not logged in
  useEffect(() => {
    if (!state.user) {
      dispatch({ type: 'SHOW_CHECKOUT_MODAL' });
      navigate('/cart', { replace: true });
    }
  }, [state.user, dispatch, navigate]);

  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [payMethod, setPayMethod] = useState('card');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [form, setForm] = useState({
    firstName: state.user?.name?.split(' ')[0] || '',
    lastName: state.user?.name?.split(' ').slice(1).join(' ') || '',
    email: state.user?.email || '',
    phone: state.user?.phone || '',
    dateOfBirth: state.user?.date_of_birth || '',
    address: '', city: 'London', postcode: '', instructions: '',
    cardNumber: '', expiry: '', cvv: '', cardName: '',
    saveAddress: false,
  });

  // Pre-fill address from localStorage if logged in
  useEffect(() => {
    if (state.user?.email) {
      const saved = localStorage.getItem(`addresses_${state.user.email}`);
      if (saved) {
        try {
          const addrList = JSON.parse(saved);
          const defaultAddr = addrList[0]; // Take the first one as default
          if (defaultAddr) {
            setForm(f => ({
              ...f,
              address: defaultAddr.address || f.address,
              city: defaultAddr.city || f.city,
              postcode: defaultAddr.postcode || f.postcode,
              instructions: defaultAddr.instructions || f.instructions,
            }));
          }
        } catch (e) {
          console.error("Failed to parse saved addresses", e);
        }
      }
    }
  }, [state.user]);

  const cart = state.cart;
  const subtotal = cartTotal;
  const delivery = 2.99;
  const total = subtotal + delivery;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateStep0 = () => {
    const { firstName, lastName, email, phone, dateOfBirth, address, postcode } = form;
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !address || !postcode) {
      toast.warning('Please fill in all required delivery fields.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (payMethod === 'card') {
      const { cardNumber, expiry, cvv, cardName } = form;
      if (!cardNumber || !expiry || !cvv || !cardName) {
        toast.warning('Please fill in all card details.');
        return false;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        toast.warning('Invalid card number.');
        return false;
      }
    }
    return true;
  };

  const handleOrder = async () => {
    if (!ageConfirmed) {
      toast.warning('Please confirm your age.');
      return;
    }

    try {
      const orderData = {
        shipping_name: `${form.firstName} ${form.lastName}`,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_postcode: form.postcode,
        shipping_phone: form.phone,
        notes: form.instructions,
      };

      // Sync the user's local cart to the backend before placing the order
      await cartAPI.clear();
      for (const item of cart) {
        await cartAPI.add(item.id, item.quantity);
      }

      await ordersAPI.create(orderData);
      clearCart();
      // Navigate to the dedicated order confirmation page
      navigate('/order-confirmation', {
        state: {
          address: form.address,
          postcode: form.postcode,
          payMethod,
          cardNumber: form.cardNumber,
          total,
        },
        replace: true,
      });
    } catch (err) {
      // API errors are toasted automatically by apiFetch in api.js
      // We only toast here if it wasn't an API error or for redundancy with specialized handling
      if (!err.message.includes("Database error")) {
        // Optionally toast if apiFetch somehow missed it or it's a logic error
      }
    }
  };



  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.checkoutHeader}>
          <Link to="/" className={styles.headerLogo}>🥂 Belgravia Spirits</Link>
          <div className={styles.stepIndicator}>
            {STEPS.map((s, i) => (
              <div key={s} className={styles.stepWrap}>
                <div className={`${styles.stepDot} ${i < step ? styles.stepDone : i === step ? styles.stepActive : ''}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
              </div>
            ))}
          </div>
          <div className={styles.secureBadge}><Lock size={13} /> Secure Checkout</div>
        </div>

        <div className={styles.layout}>
          {/* ── Left: Form ── */}
          <div className={styles.formSide}>
            {/* Step 0: Delivery */}
            {step === 0 && (
              <div className={styles.formCard}>
                <h2><Truck size={20} /> Delivery Details</h2>
                {!state.user && (
                  <div className={styles.guestOption}>
                    <p>Already have an account? <Link to="/login">Sign in</Link> for faster checkout.</p>
                  </div>
                )}
                <div className={styles.formGrid}>
                  {[
                    { name: 'firstName', label: 'First Name', placeholder: 'John' },
                    { name: 'lastName', label: 'Last Name', placeholder: 'Smith' },
                    { name: 'email', label: 'Email Address', placeholder: 'john@example.com', type: 'email', full: true },
                    { name: 'phone', label: 'Phone Number', placeholder: '+44 7700 900000', type: 'tel' },
                    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', note: 'Required to verify age' },
                  ].map(f => (
                    <div key={f.name} className={`${styles.formGroup} ${f.full ? styles.formGroupFull : ''}`}>
                      <label>{f.label}</label>
                      <input type={f.type || 'text'} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required />
                      {f.note && <small className={styles.fieldNote}>{f.note}</small>}
                    </div>
                  ))}
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label>Delivery Address</label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Start typing your London address…" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>City</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Postcode</label>
                    <input type="text" name="postcode" value={form.postcode} onChange={handleChange} placeholder="SW1X 8LR" required />
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label>Delivery Instructions (Optional)</label>
                    <textarea name="instructions" value={form.instructions} onChange={handleChange} placeholder="Leave at door, ring bell etc." rows={3} />
                  </div>
                </div>
                <label className={styles.checkLabel}>
                  <input type="checkbox" name="saveAddress" checked={form.saveAddress} onChange={handleChange} />
                  Save this address for future orders
                </label>
                <button className={styles.nextBtn} onClick={() => validateStep0() && setStep(1)}>Continue to Payment →</button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className={styles.formCard}>
                <h2><CreditCard size={20} /> Payment Method</h2>
                <div className={styles.payMethods}>
                  {[
                    { id: 'card', label: '💳 Credit / Debit Card', sub: 'Visa, Mastercard, Amex' },
                    { id: 'paypal', label: '🅿 PayPal' },
                    { id: 'apple', label: '🍎 Apple Pay' },
                  ].map(m => (
                    <label key={m.id} className={`${styles.payMethod} ${payMethod === m.id ? styles.payMethodActive : ''}`}>
                      <input type="radio" name="payMethod" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} />
                      <div>
                        <span className={styles.payMethodLabel}>{m.label}</span>
                        {m.sub && <span className={styles.payMethodSub}>{m.sub}</span>}
                      </div>
                    </label>
                  ))}
                </div>
                {payMethod === 'card' && (
                  <div className={styles.cardForm}>
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label>Card Number</label>
                      <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Expiry Date</label>
                        <input type="text" name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>CVV</label>
                        <input type="text" name="cvv" value={form.cvv} onChange={handleChange} placeholder="123" maxLength={4} />
                      </div>
                      <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label>Name on Card</label>
                        <input type="text" name="cardName" value={form.cardName} onChange={handleChange} placeholder="John Smith" />
                      </div>
                    </div>
                    <div className={styles.secureNote}><Lock size={12} /> Your payment is secured with 256-bit SSL encryption via Stripe.</div>
                  </div>
                )}
                {payMethod === 'paypal' && (
                  <div className={styles.paypalNote}>You will be redirected to PayPal to complete your payment securely.</div>
                )}
                <div className={styles.stepBtns}>
                  <button className={styles.backBtn} onClick={() => setStep(0)}>← Back</button>
                  <button className={styles.nextBtn} onClick={() => validateStep1() && setStep(2)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className={styles.formCard}>
                <h2>Review Your Order</h2>
                <div className={styles.reviewItems}>
                  {cart.map(item => (
                    <div key={item.id} className={styles.reviewItem}>
                      <CartItemImage item={item} />
                      <div className={styles.reviewItemInfo}>
                        <span>{item.name}</span>
                        <span className={styles.reviewItemMeta}>Qty: {item.quantity} · {item.volume}</span>
                      </div>
                      <span className={styles.reviewItemPrice}>£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.reviewSummary}>
                  <div className={styles.reviewRow}><span>Delivery to</span><strong>{form.address || 'Address not entered'}, {form.postcode}</strong></div>
                  <div className={styles.reviewRow}><span>Payment</span><strong>{payMethod === 'card' ? `Card ending ****${form.cardNumber.slice(-4) || '****'}` : payMethod.toUpperCase()}</strong></div>
                </div>
                <div className={styles.ageConfirm}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={ageConfirmed} onChange={e => setAgeConfirmed(e.target.checked)} />
                    <span>🔞 I confirm I am 18+ years old and consent to age verification on delivery. I accept the <Link to="/legal#terms">Terms & Conditions</Link>.</span>
                  </label>
                </div>
                <div className={styles.stepBtns}>
                  <button className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                  <button className={styles.placeBtn} onClick={handleOrder}>
                    <Lock size={16} /> Place Order — £{total.toFixed(2)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Summary ── */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className={styles.summaryItems}>
                {cart.map(item => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.summaryItemImg}><img src={getImageUrl(item.image || item.image_url)} alt={item.name} /></div>
                    <div className={styles.summaryItemName}>{item.name}<br /><span>×{item.quantity}</span></div>
                    <div className={styles.summaryItemPrice}>£{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className={styles.summaryTotals}>
                <div className={styles.summaryRow}><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                <div className={styles.summaryRow}><span>Delivery</span><span>£{delivery.toFixed(2)}</span></div>
                <div className={styles.summaryDivider} />
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>Total (incl. VAT)</span><span>£{total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
