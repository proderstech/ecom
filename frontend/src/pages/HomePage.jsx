import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Clock, Shield, Star, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import { PRODUCTS, CATEGORIES, REVIEWS } from '../data/products';
import styles from './HomePage.module.css';

const HERO_SLIDES = [
  {
    title: 'Exceptional Wines',
    subtitle: 'From Bordeaux to Burgundy',
    desc: 'Curated selection of the world\'s finest wines, delivered to your London door within hours.',
    img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=85',
    cta: { label: 'Shop Wine', path: '/shop?cat=Wine' },
    color: '#8B1A1A',
  },
  {
    title: 'Premium Whisky',
    subtitle: 'Single Malts & Rare Blends',
    desc: 'Explore Scotland\'s finest single malts, American bourbons, and Japanese whisky — all with same-day delivery.',
    img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1600&q=85',
    cta: { label: 'Shop Whisky', path: '/shop?cat=Whisky' },
    color: '#6B4423',
  },
  {
    title: 'Fresh Groceries',
    subtitle: 'London\'s Best Delivered',
    desc: 'Premium groceries, artisan produce, and everyday essentials — delivered alongside your drinks order.',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=85',
    cta: { label: 'Shop Groceries', path: '/shop?cat=Groceries' },
    color: '#1A4A2E',
  },
];

const FEATURED = PRODUCTS.filter(p => p.badge).slice(0, 8);

const DELIVERY_FEATURES = [
  { icon: <Zap size={24} />, title: 'Same-Day Delivery', desc: 'Order before 9pm for delivery across London today', highlight: true },
  { icon: <Truck size={24} />, title: 'Free Over £50', desc: 'Complimentary delivery on all orders over £50' },
  { icon: <Clock size={24} />, title: 'Track Live', desc: 'Real-time GPS tracking from pick-up to your door' },
  { icon: <Shield size={24} />, title: '18+ Verified', desc: 'Age verified on every alcohol delivery — Challenge 25' },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [gdprCheck, setGdprCheck] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goSlide = (n) => {
    setSlide((slide + n + HERO_SLIDES.length) % HERO_SLIDES.length);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!gdprCheck) return alert('Please agree to receive emails.');
    if (newsletterEmail) { setSubSuccess(true); setNewsletterEmail(''); setGdprCheck(false); }
  };

  const current = HERO_SLIDES[slide];

  return (
    <main className={styles.main}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} style={{ backgroundImage: `url(${current.img})` }} key={slide} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            <p className={styles.heroLabel}>🇬🇧 London&apos;s Premium Delivery</p>
            <h1 className={styles.heroTitle}>
              Premium Drinks &amp;<br />
              Groceries Delivered<br />
              <span className={styles.heroGold}>Across London</span>
            </h1>
            <p className={styles.heroDesc}>
              {current.desc}
            </p>
            <div className={styles.heroBadge}>
              🔞 18+ Only &nbsp;|&nbsp; ⚡ Same-Day Delivery &nbsp;|&nbsp; 🔒 Secure Checkout
            </div>
            <div className={styles.heroCtas}>
              <Link to="/shop?cat=Wine" className={styles.ctaPrimary}>
                🍷 Shop Alcohol <ArrowRight size={16} />
              </Link>
              <Link to="/shop?cat=Groceries" className={styles.ctaSecondary}>
                🛒 Shop Groceries
              </Link>
            </div>
          </div>
          {/* Slide controls */}
          <button className={`${styles.slideBtn} ${styles.slidePrev}`} onClick={() => goSlide(-1)} aria-label="Previous">
            <ChevronLeft size={22} />
          </button>
          <button className={`${styles.slideBtn} ${styles.slideNext}`} onClick={() => goSlide(1)} aria-label="Next">
            <ChevronRight size={22} />
          </button>
          <div className={styles.slideDots}>
            {HERO_SLIDES.map((_, i) => (
              <button key={i} className={`${styles.dot} ${i === slide ? styles.dotActive : ''}`} onClick={() => setSlide(i)} aria-label={`Slide ${i+1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery Features ── */}
      <section className={styles.deliveryBar}>
        <div className={styles.container}>
          <div className={styles.deliveryGrid}>
            {DELIVERY_FEATURES.map((f, i) => (
              <div key={i} className={`${styles.deliveryItem} ${f.highlight ? styles.deliveryHighlight : ''}`}>
                <div className={styles.deliveryIcon}>{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className={`${styles.section} ${styles.categories}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Browse By Category</p>
            <h2>What Are You Looking For?</h2>
            <p>From rare single malts to everyday essentials — we&apos;ve got London covered.</p>
          </div>
          <div className={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <Link key={cat.id} to={`/shop?cat=${cat.label}`} className={styles.catCard}>
                <div className={styles.catIcon}>{cat.icon}</div>
                <h3>{cat.label}</h3>
                <p>{cat.desc}</p>
                <span className={styles.catCount}>{cat.count}+ products</span>
                <div className={styles.catArrow}><ArrowRight size={16} /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className={`${styles.section} ${styles.featured}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <p className={styles.sectionLabel}>Hand-Picked for You</p>
              <h2>Featured Products</h2>
            </div>
            <Link to="/shop" className={styles.viewAll}>View All <ArrowRight size={15} /></Link>
          </div>
          <div className={styles.productsGrid}>
            {FEATURED.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── Promo Banner ── */}
      <section className={styles.promoBanner}>
        <div className={styles.container}>
          <div className={styles.promoInner}>
            <div className={styles.promoText}>
              <p className={styles.sectionLabel}>Limited Offer</p>
              <h2>Free Delivery All Weekend 🎉</h2>
              <p>Order any alcohol or grocery delivery this weekend and get free same-day delivery — no minimum spend.</p>
              <div className={styles.promoCountdown}>
                <div className={styles.countdownUnit}><span>02</span><label>Days</label></div>
                <div className={styles.countdownSep}>:</div>
                <div className={styles.countdownUnit}><span>14</span><label>Hours</label></div>
                <div className={styles.countdownSep}>:</div>
                <div className={styles.countdownUnit}><span>33</span><label>Mins</label></div>
              </div>
              <Link to="/shop" className={styles.ctaPrimary}>Shop Now <ArrowRight size={15} /></Link>
            </div>
            <div className={styles.promoImg}>
              <img src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=80" alt="Promotion" />
            </div>
          </div>
        </div>
      </section>

      {/* ── All Products ── */}
      <section className={`${styles.section} ${styles.allProducts}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <p className={styles.sectionLabel}>Our Selection</p>
              <h2>Shop All Products</h2>
            </div>
            <Link to="/shop" className={styles.viewAll}>Browse all <ArrowRight size={15} /></Link>
          </div>
          <div className={styles.productsGrid}>
            {PRODUCTS.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className={styles.shopMoreWrap}>
            <Link to="/shop" className={styles.shopMoreBtn}>
              Browse All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className={`${styles.section} ${styles.whyUs}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Why Belgravia Spirits</p>
            <h2>London&apos;s Most Trusted Delivery</h2>
          </div>
          <div className={styles.whyGrid}>
            {[
              { icon: '🏆', title: '5★ Rated Service', desc: 'Rated excellent on Trustpilot with thousands of happy Londoners.' },
              { icon: '🔒', title: 'Safe & Secure', desc: 'SSL-encrypted checkout with Stripe & PayPal. Your data is safe.' },
              { icon: '🌿', title: 'Sustainable Packaging', desc: 'We use eco-friendly, recyclable packaging for every order.' },
              { icon: '🎁', title: 'Gift Wrapping', desc: 'Premium gift wrapping available. Perfect for every occasion.' },
              { icon: '🔄', title: 'Easy Returns', desc: 'Not happy? Return within 14 days for a full refund. No questions asked.' },
              { icon: '👨‍💼', title: 'Expert Curation', desc: 'Our sommelier team personally selects every product in our range.' },
            ].map((item, i) => (
              <div key={i} className={styles.whyCard}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className={`${styles.section} ${styles.reviews}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Customer Reviews</p>
            <h2>What Londoners Say</h2>
            <div className={styles.overallRating}>
              <div className={styles.stars}>{'★★★★★'}</div>
              <strong>4.9 / 5</strong> based on 2,847 reviews
            </div>
          </div>
          <div className={styles.reviewGrid}>
            {REVIEWS.map(r => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewStars}>{'★'.repeat(r.rating)}</div>
                <p className={styles.reviewText}>&ldquo;{r.text}&rdquo;</p>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewAvatar}>{r.avatar}</div>
                  <div>
                    <div className={styles.reviewName}>{r.name}</div>
                    <div className={styles.reviewMeta}>{r.location} · {r.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className={`${styles.section} ${styles.newsletter}`}>
        <div className={styles.container}>
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterText}>
              <p className={styles.sectionLabel}>Stay In The Know</p>
              <h2>Get Exclusive Offers</h2>
              <p>Join our mailing list for member-only discounts, new arrivals, and sommelier picks — delivered straight to your inbox.</p>
            </div>
            {subSuccess ? (
              <div className={styles.subSuccess}>
                <div className={styles.subSuccessIcon}>🥂</div>
                <h3>Welcome to the Boutique!</h3>
                <p>Thank you for subscribing. Your first exclusive offer is on its way.</p>
              </div>
            ) : (
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <div className={styles.emailRow}>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className={styles.ctaPrimary}>Subscribe <ArrowRight size={15} /></button>
                </div>
                <label className={styles.gdprRow}>
                  <input type="checkbox" checked={gdprCheck} onChange={e => setGdprCheck(e.target.checked)} required />
                  <span>
                    I agree to receive marketing emails and confirm I am 18+. Read our{' '}
                    <Link to="/legal#privacy">Privacy Policy</Link>.
                  </span>
                </label>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
