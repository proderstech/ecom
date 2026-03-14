import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, FileText, Lock, CheckCircle, Info } from 'lucide-react';
import styles from './LegalPage.module.css';

const SECTIONS = [
  { id: 'privacy', title: 'Privacy Policy', icon: <Lock size={20} /> },
  { id: 'terms', title: 'Terms & Conditions', icon: <FileText size={20} /> },
  { id: 'challenge25', title: 'Challenge 25 Policy', icon: <ShieldAlert size={20} /> },
  { id: 'returns', title: 'Returns & Refunds', icon: <CheckCircle size={20} /> },
];

export default function LegalPage() {
  const [active, setActive] = useState('privacy');
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (SECTIONS.find(s => s.id === hash)) setActive(hash);
  }, [location]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Legal &amp; Compliance</h1>
          <p>Belgravia Spirits takes legal compliance and responsible retail seriously.</p>
        </div>
        <div className={styles.layout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`${styles.navBtn} ${active === s.id ? styles.active : ''}`}
                onClick={() => { setActive(s.id); window.history.pushState(null, '', `#${s.id}`); }}
              >
                {s.icon} {s.title}
              </button>
            ))}
            <div className={styles.contactCard}>
              <Info size={16} className={styles.infoIcon} />
              <h4>Need help?</h4>
              <p>For legal enquiries, contact us at legal@belgraviaSpirits.co.uk</p>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {active === 'challenge25' && (
              <div className={styles.policyCard}>
                <div className={styles.policyHeader}>
                  <ShieldAlert size={32} className={styles.iconGold} />
                  <h2>Challenge 25 Policy</h2>
                  <span className={styles.badge}>Mandatory Compliance</span>
                </div>
                <div className={styles.textBody}>
                  <p>As a responsible retailer of alcohol, Belgravia Spirits operates a strict <strong>Challenge 25 policy</strong> for all deliveries.</p>
                  <h3>Age Verification on Delivery</h3>
                  <p>When our delivery partner arrives, they are legally required to verify the age of the recipient if they appear to be under 25 years of age. They will ask to see a valid form of identification.</p>
                  <p>The only accepted forms of ID are:</p>
                  <ul>
                    <li>A valid passport</li>
                    <li>A valid photocard driving licence</li>
                    <li>A Proof of Age Standards Scheme (PASS) approved card</li>
                    <li>Military ID card</li>
                  </ul>
                  <div className={styles.warningBox}>
                    <strong>Important:</strong> If valid ID cannot be provided upon request, the delivery partner will refuse to hand over the alcohol. The items will be returned to our store and your payment will be refunded minus the delivery and a £5 restocking fee.
                  </div>
                  <h3>Proxy Purchasing</h3>
                  <p>It is an offence to buy alcohol on behalf of a person under the age of 18. Our delivery partners are trained to look for signs of proxy purchasing and will refuse delivery if they suspect the alcohol is intended for minors.</p>
                </div>
              </div>
            )}

            {active === 'privacy' && (
              <div className={styles.policyCard}>
                <h2>Privacy Policy (GDPR Compliance)</h2>
                <div className={styles.textBody}>
                  <p>Last updated: October 2026</p>
                  <p>Belgravia Spirits respects your privacy and is committed to protecting your personal data in accordance with the UK General Data Protection Regulation (UK GDPR).</p>
                  <h3>1. Data We Collect</h3>
                  <p>We collect Identity Data (name, DOB), Contact Data (address, email, phone), Financial Data (payment details are handled securely by Stripe), and Transaction Data.</p>
                  <h3>2. How We Use Your Data</h3>
                  <ul>
                    <li>To process and deliver your order, including age verification.</li>
                    <li>To manage our relationship with you.</li>
                    <li>To provide recommendations and marketing (if you have opted in).</li>
                  </ul>
                  <h3>3. Data Sharing</h3>
                  <p>We share necessary data with our delivery partners solely for the purpose of fulfilling your order. We do not sell your data to third parties.</p>
                </div>
              </div>
            )}

            {active === 'terms' && (
              <div className={styles.policyCard}>
                <h2>Terms & Conditions</h2>
                <div className={styles.textBody}>
                  <h3>1. Introduction</h3>
                  <p>These terms and conditions govern the use of our website and the purchase of goods from Belgravia Spirits. By using our site, you agree to these terms.</p>
                  <h3>2. Sale of Alcohol</h3>
                  <p>By placing an order containing alcohol, you confirm that you are at least 18 years old. It is an offence for anyone under 18 to purchase or attempt to purchase alcohol.</p>
                  <h3>3. Pricing and Availability</h3>
                  <p>All prices include VAT at the current UK rate. Products are subject to availability. In the event an item is out of stock after ordering, we will contact you to offer a substitute or refund.</p>
                </div>
              </div>
            )}

            {active === 'returns' && (
              <div className={styles.policyCard}>
                <h2>Returns & Refunds</h2>
                <div className={styles.textBody}>
                  <h3>14-Day Return Policy</h3>
                  <p>You have the right to cancel your order within 14 days without giving any reason, provided the goods are in their original, unopened condition with seals intact.</p>
                  <h3>Faulty Products</h3>
                  <p>If you receive a faulty or damaged product (e.g., corked wine), please contact us within 48 hours of delivery. We will arrange a replacement or provide a full refund.</p>
                  <h3>Refund Process</h3>
                  <p>Refunds will be processed to the original payment method within 3-5 working days of us receiving the returned goods or confirming the issue.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
