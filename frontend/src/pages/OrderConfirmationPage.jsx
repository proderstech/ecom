import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, MapPin, Package, ArrowRight, Home } from 'lucide-react';
import styles from './OrderConfirmationPage.module.css';

export default function OrderConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Generate order ref once (stable per render)
  const orderRef = `BG-${Math.floor(Math.random() * 900000 + 100000)}`;

  // If accessed without order data, redirect to home
  useEffect(() => {
    if (!state?.total) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state?.total) return null;

  const { address, postcode, payMethod, cardNumber, total } = state;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Success Animation */}
        <div className={styles.successBurst}>
          <div className={styles.successRing} />
          <div className={styles.successIcon}>
            <CheckCircle size={52} />
          </div>
        </div>

        <h1 className={styles.title}>Order Confirmed! 🎉</h1>
        <p className={styles.subtitle}>
          Thank you for your order. Your premium drinks are being prepared for delivery.
        </p>

        {/* Order Reference */}
        <div className={styles.refBadge}>
          <Package size={16} />
          <span>Order Reference: <strong>{orderRef}</strong></span>
        </div>

        {/* Order Details Card */}
        <div className={styles.detailsCard}>
          <h2>Order Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <Truck size={18} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Estimated Delivery</span>
                <span className={styles.detailValue}>Within 90 minutes</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <MapPin size={18} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Delivery Address</span>
                <span className={styles.detailValue}>
                  {address || '42 Example Street'}{postcode ? `, ${postcode}` : ''}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.payEmoji}>💳</span>
              <div>
                <span className={styles.detailLabel}>Payment</span>
                <span className={styles.detailValue}>
                  {payMethod === 'card'
                    ? `Card ending ****${cardNumber?.slice(-4) || '****'}`
                    : payMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.payEmoji}>💰</span>
              <div>
                <span className={styles.detailLabel}>Total Charged</span>
                <span className={`${styles.detailValue} ${styles.totalVal}`}>£{Number(total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SMS / Tracking Note */}
        <div className={styles.trackNote}>
          📱 You will receive <strong>SMS updates</strong> with live tracking from our delivery partner.
        </div>

        {/* Age Verification Note */}
        <div className={styles.ageNote}>
          🔞 <strong>Important:</strong> Our delivery partner will verify your age at the door.
          Please have valid ID ready if you appear under 25 (Challenge 25 policy).
        </div>

        {/* CTAs */}
        <div className={styles.ctas}>
          <Link to="/account" className={styles.trackBtn}>
            <Package size={16} /> Track My Order
          </Link>
          <Link to="/shop" className={styles.shopBtn}>
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

        <Link to="/" className={styles.homeLink}>
          <Home size={14} /> Back to Home
        </Link>
      </div>
    </main>
  );
}
