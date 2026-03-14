import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Phone, Mail, MapPin, Clock } from 'lucide-react';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Shop Wine', path: '/shop?cat=Wine' },
  { label: 'Shop Whisky', path: '/shop?cat=Whisky' },
  { label: 'Shop Beer', path: '/shop?cat=Beer' },
  { label: 'Shop Groceries', path: '/shop?cat=Groceries' },
  { label: 'About Us', path: '/about' },
];
const LEGAL_LINKS = [
  { label: 'Privacy Policy', path: '/legal#privacy' },
  { label: 'Terms & Conditions', path: '/legal#terms' },
  { label: 'Returns Policy', path: '/legal#returns' },
  { label: 'Shipping Policy', path: '/legal#shipping' },
  { label: 'Cookie Policy', path: '/legal#cookies' },
  { label: 'Challenge 25 Policy', path: '/legal#challenge25' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brand}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>🥂</div>
                <div>
                  <div className={styles.logoName}>Belgravia Spirits</div>
                  <div className={styles.logoSub}>London&apos;s Premium Delivery</div>
                </div>
              </div>
              <p>Premium wines, spirits, beers and groceries delivered to your door across London. Serving the capital since 2018.</p>
              <div className={styles.socials}>
                <a href="#" aria-label="Instagram" className={styles.social}><Instagram size={16} /></a>
                <a href="#" aria-label="Twitter" className={styles.social}><Twitter size={16} /></a>
                <a href="#" aria-label="Facebook" className={styles.social}><Facebook size={16} /></a>
                <a href="#" aria-label="Youtube" className={styles.social}><Youtube size={16} /></a>
              </div>
              <div className={styles.licenceBadge}>
                🏛️ Alcohol Licence No. <strong>PA/2018/00347/LCC</strong>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.col}>
              <h4>Shop</h4>
              <ul>
                {QUICK_LINKS.map(l => (
                  <li key={l.label}><Link to={l.path} className={styles.link}>{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className={styles.col}>
              <h4>Legal & Compliance</h4>
              <ul>
                {LEGAL_LINKS.map(l => (
                  <li key={l.label}><Link to={l.path} className={styles.link}>{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact & Hours */}
            <div className={styles.col}>
              <h4>Contact Us</h4>
              <div className={styles.contact}>
                <div className={styles.contactItem}>
                  <MapPin size={14} className={styles.contactIcon} />
                  <span>42 Belgravia Square, London SW1X 8LR</span>
                </div>
                <div className={styles.contactItem}>
                  <Phone size={14} className={styles.contactIcon} />
                  <span>+44 20 7123 4567</span>
                </div>
                <div className={styles.contactItem}>
                  <Mail size={14} className={styles.contactIcon} />
                  <span>hello@belgraviaSpirits.co.uk</span>
                </div>
                <div className={styles.contactItem}>
                  <Clock size={14} className={styles.contactIcon} />
                  <div>
                    <div>Mon–Sat: 9:00am – 11:00pm</div>
                    <div>Sunday: 10:00am – 10:30pm</div>
                  </div>
                </div>
              </div>
              <div className={styles.ageWarning}>
                🔞 We operate a Challenge 25 policy. ID may be required on delivery.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.container}>
          <div className={styles.bottomInner}>
            <div className={styles.legal}>
              <p>© {new Date().getFullYear()} Belgravia Spirits Ltd. All rights reserved. Registered in England & Wales No. 11234567.</p>
              <p className={styles.ageNotice}>🔞 You must be 18+ to purchase alcohol. Drink Responsibly. <a href="https://www.drinkaware.co.uk" target="_blank" rel="noopener noreferrer">drinkaware.co.uk</a></p>
            </div>
            <div className={styles.payments}>
              <span className={styles.payIcon}>💳 Stripe</span>
              <span className={styles.payIcon}>🅿 PayPal</span>
              <span className={styles.payIcon}>🍎 Apple Pay</span>
              <span className={styles.payIcon}>🔒 SSL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
