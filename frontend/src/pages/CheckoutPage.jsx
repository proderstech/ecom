import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Truck, MapPin, ChevronDown, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import styles from './CheckoutPage.module.css';

const STEPS = ['Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { state, dispatch, cartTotal } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [payMethod, setPayMethod] = useState('card');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: 'London', postcode: '', instructions: '',
    cardNumber: '', expiry: '', cvv: '', cardName: '',
    saveAddress: false,
  });

  const cart = state.cart;
  const subtotal = cartTotal;
  const delivery = 2.99;
  const total = subtotal + delivery;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOrder = () => {
    if (!ageConfirmed) { alert('Please confirm your age.'); return; }
    setSuccess(true);
    dispatch({ type: 'CLEAR_CART' });
  };

  if (success) return (
    <div className={styles.successPage}>
      <div className={styles.successCard}>
        <CheckCircle size={64} className={styles.successIcon} />
        <h1>Order Confirmed! 🎉</h1>
        <p>Thank you for your order. Your premium drinks are being prepared for delivery.</p>
        <div className={styles.orderDetails}>
          <div className={styles.orderRef}>Order #BG-{Math.floor(Math.random()*100000)}</div>
          <div className={styles.orderInfo}>
            <div><Truck size={16} /> Estimated delivery: <strong>Within 90 minutes</strong></div>
            <div><MapPin size={16} /> Delivery to: <strong>{form.address || '42 Example St, London'}</strong></div>
          </div>
        </div>
        <p className={styles.trackNote}>📱 You will receive SMS updates with live tracking.</p>
        <div className={styles.ageDeliveryNote}>
          🔞 <strong>Remember:</strong> Our delivery partner will verify your age at the door. Please have valid ID ready if you appear under 25.
        </div>
        <Link to="/" className={styles.successBtn}>Back to Home</Link>
      </div>
    </div>
  );

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
                <div className={styles.guestOption}>
                  <p>Already have an account? <Link to="/login">Sign in</Link> for faster checkout.</p>
                </div>
                <div className={styles.formGrid}>
                  {[
                    { name: 'firstName', label: 'First Name', placeholder: 'John' },
                    { name: 'lastName', label: 'Last Name', placeholder: 'Smith' },
                    { name: 'email', label: 'Email Address', placeholder: 'john@example.com', type: 'email', full: true },
                    { name: 'phone', label: 'Phone Number', placeholder: '+44 7700 900000', type: 'tel' },
                  ].map(f => (
                    <div key={f.name} className={`${styles.formGroup} ${f.full ? styles.formGroupFull : ''}`}>
                      <label>{f.label}</label>
                      <input type={f.type || 'text'} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required />
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
                <button className={styles.nextBtn} onClick={() => setStep(1)}>Continue to Payment →</button>
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
                  <button className={styles.nextBtn} onClick={() => setStep(2)}>Review Order →</button>
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
                      <img src={item.image} alt={item.name} />
                      <div className={styles.reviewItemInfo}>
                        <span>{item.name}</span>
                        <span className={styles.reviewItemMeta}>Qty: {item.qty} · {item.volume}</span>
                      </div>
                      <span className={styles.reviewItemPrice}>£{(item.price * item.qty).toFixed(2)}</span>
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
                    <div className={styles.summaryItemImg}><img src={item.image} alt={item.name} /></div>
                    <div className={styles.summaryItemName}>{item.name}<br /><span>×{item.qty}</span></div>
                    <div className={styles.summaryItemPrice}>£{(item.price * item.qty).toFixed(2)}</div>
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
