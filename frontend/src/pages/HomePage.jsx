import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Clock, Shield, Zap } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import styles from './HomePage.module.css';

const HERO_SLIDES = [
  { title: 'Exceptional Wines', desc: 'Curated from the world\'s finest vineyards. Delivered to your London door within hours.', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=85', cta: { label: 'Shop Wine', path: '/shop?cat=Wine' } },
  { title: 'Premium Whisky', desc: 'Single Malts & Rare Blends — Scotch, Bourbon, Japanese — all with same-day delivery.', img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1600&q=85', cta: { label: 'Shop Whisky', path: '/shop?cat=Whisky' } },
  { title: 'Fresh Groceries', desc: 'Premium groceries and artisan produce — delivered alongside your drinks order.', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=85', cta: { label: 'Shop Groceries', path: '/shop?cat=Groceries' } },
];

const DELIVERY_FEATURES = [
  { icon: <Zap size={24} />, title: 'Same-Day Delivery', desc: 'Order before 9pm for delivery across London today', highlight: true },
  { icon: <Truck size={24} />, title: 'Free Over £50', desc: 'Complimentary delivery on orders over £50' },
  { icon: <Clock size={24} />, title: 'Track Live', desc: 'Real-time GPS tracking from pick-up to your door' },
  { icon: <Shield size={24} />, title: '18+ Verified', desc: 'Age verified on every alcohol delivery — Challenge 25' },
];

// Static reviews (these are testimonials, not dynamic product reviews)
const REVIEWS = [
  { id: 1, name: 'James H.', location: 'Chelsea', rating: 5, text: 'Absolutely brilliant service. Ordered at 6pm and had my Macallan in under an hour.', date: '2 days ago', avatar: 'JH' },
  { id: 2, name: 'Sophie C.', location: 'Mayfair', rating: 5, text: 'The wine selection is superb. My Château Margaux arrived perfectly chilled. Truly premium.', date: '1 week ago', avatar: 'SC' },
  { id: 3, name: 'Omar A.', location: 'Shoreditch', rating: 4, text: 'Fast delivery and great prices. I use it weekly now for my household essentials.', date: '2 weeks ago', avatar: 'OA' },
  { id: 4, name: 'Priya M.', location: 'Canary Wharf', rating: 5, text: 'Needed champagne at the last minute. Belgravia came through in 45 minutes. Lifesaver!', date: '3 weeks ago', avatar: 'PM' },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [gdprCheck, setGdprCheck] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    Promise.all([
      productsAPI.featured(8),
      productsAPI.list({ limit: 7 }),
      categoriesAPI.list(),
    ]).then(([featured, all, cats]) => {
      setFeaturedProducts(Array.isArray(featured) ? featured : featured?.items || []);
      setAllProducts(all?.items || []);
      setCategories(cats || []);
    }).catch(console.error).finally(() => setLoading(false));
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
            <h1 className={styles.heroTitle}>Premium Drinks &<br />Groceries Delivered<br /><span className={styles.heroGold}>Across London</span></h1>
            <p className={styles.heroDesc}>{current.desc}</p>
            <div className={styles.heroBadge}>🔞 18+ Only &nbsp;|&nbsp; ⚡ Same-Day Delivery &nbsp;|&nbsp; 🔒 Secure Checkout</div>
            <div className={styles.heroCtas}>
              <Link to="/shop?cat=Wine" className={styles.ctaPrimary}>🍷 Shop Alcohol <ArrowRight size={16} /></Link>
              <Link to="/shop?cat=Groceries" className={styles.ctaSecondary}>🛒 Shop Groceries</Link>
            </div>
          </div>
          <button className={`${styles.slideBtn} ${styles.slidePrev}`} onClick={() => goSlide(-1)}>&#8249;</button>
          <button className={`${styles.slideBtn} ${styles.slideNext}`} onClick={() => goSlide(1)}>&#8250;</button>
          <div className={styles.slideDots}>
            {HERO_SLIDES.map((_, i) => (
              <button key={i} className={`${styles.dot} ${i === slide ? styles.dotActive : ''}`} onClick={() => setSlide(i)} />
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
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
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
            {categories.length > 0 ? categories.map(cat => (
              <Link key={cat.id} to={`/shop?cat=${cat.name}`} className={styles.catCard}>
                <div className={styles.catIcon}>{cat.icon || '🛒'}</div>
                <h3>{cat.name}</h3>
                <p>{cat.description || ''}</p>
                <div className={styles.catArrow}><ArrowRight size={16} /></div>
              </Link>
            )) : (
              // Fallback static categories while loading
              [
                { id: 'wine', label: 'Wine', icon: '🍷', desc: 'Red, White, Rosé & Sparkling', path: 'Wine' },
                { id: 'whisky', label: 'Whisky', icon: '🥃', desc: 'Scotch, Bourbon & Irish', path: 'Whisky' },
                { id: 'beer', label: 'Beer', icon: '🍺', desc: 'Craft, Ales & Lagers', path: 'Beer' },
                { id: 'spirits', label: 'Spirits', icon: '🍸', desc: 'Gin, Vodka & Tequila', path: 'Spirits' },
                { id: 'groceries', label: 'Groceries', icon: '🛒', desc: 'Fresh & Everyday Essentials', path: 'Groceries' },
              ].map(cat => (
                <Link key={cat.id} to={`/shop?cat=${cat.path}`} className={styles.catCard}>
                  <div className={styles.catIcon}>{cat.icon}</div>
                  <h3>{cat.label}</h3>
                  <p>{cat.desc}</p>
                  <div className={styles.catArrow}><ArrowRight size={16} /></div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className={`${styles.section} ${styles.featured}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderRow}>
            <div><p className={styles.sectionLabel}>Hand-Picked for You</p><h2>Featured Products</h2></div>
            <Link to="/shop" className={styles.viewAll}>View All <ArrowRight size={15} /></Link>
          </div>
          <div className={styles.scrollableGrid}>
            {loading
              ? Array(8).fill(0).map((_, i) => <div key={i} className={styles.scrollableItem} style={{ height: '320px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />)
              : featuredProducts.map(p => <div key={p.id} className={styles.scrollableItem}><ProductCard product={p} /></div>)
            }
          </div>
        </div>
      </section>

      {/* ── All Products ── */}
      <section className={`${styles.section} ${styles.allProducts}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderRow}>
            <div><p className={styles.sectionLabel}>Our Selection</p><h2>Shop All Products</h2></div>
            <Link to="/shop" className={styles.viewAll}>Browse all <ArrowRight size={15} /></Link>
          </div>
          <div className={styles.scrollableGrid}>
            {loading
              ? Array(7).fill(0).map((_, i) => <div key={i} className={styles.scrollableItem} style={{ height: '320px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }} />)
              : allProducts.map(p => <div key={p.id} className={styles.scrollableItem}><ProductCard product={p} /></div>)
            }
          </div>
          <div className={styles.shopMoreWrap}>
            <Link to="/shop" className={styles.shopMoreBtn}>Browse All Products <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className={`${styles.section} ${styles.whyUs}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><p className={styles.sectionLabel}>Why Belgravia Spirits</p><h2>London&apos;s Most Trusted Delivery</h2></div>
          <div className={styles.whyGrid}>
            {[
              { icon: '🏆', title: '5★ Rated Service', desc: 'Rated excellent on Trustpilot with thousands of happy Londoners.' },
              { icon: '🔒', title: 'Safe & Secure', desc: 'SSL-encrypted checkout with Stripe & PayPal. Your data is safe.' },
              { icon: '🌿', title: 'Sustainable Packaging', desc: 'We use eco-friendly, recyclable packaging for every order.' },
              { icon: '🎁', title: 'Gift Wrapping', desc: 'Premium gift wrapping available. Perfect for every occasion.' },
              { icon: '🔄', title: 'Easy Returns', desc: 'Not happy? Return within 14 days for a full refund.' },
              { icon: '👨‍💼', title: 'Expert Curation', desc: 'Our sommelier team personally selects every product in our range.' },
            ].map((item, i) => (
              <div key={i} className={styles.whyCard}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <h3>{item.title}</h3><p>{item.desc}</p>
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
            <div className={styles.overallRating}><div className={styles.stars}>{'★★★★★'}</div><strong>4.9 / 5</strong> based on 2,847 reviews</div>
          </div>
          <div className={styles.reviewGrid}>
            {REVIEWS.map(r => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewStars}>{'★'.repeat(r.rating)}</div>
                <p className={styles.reviewText}>&ldquo;{r.text}&rdquo;</p>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewAvatar}>{r.avatar}</div>
                  <div><div className={styles.reviewName}>{r.name}</div><div className={styles.reviewMeta}>{r.location} · {r.date}</div></div>
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
              <p>Join our mailing list for member-only discounts, new arrivals, and sommelier picks.</p>
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
                  <input type="email" placeholder="Your email address" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} required />
                  <button type="submit" className={styles.ctaPrimary}>Subscribe <ArrowRight size={15} /></button>
                </div>
                <label className={styles.gdprRow}>
                  <input type="checkbox" checked={gdprCheck} onChange={e => setGdprCheck(e.target.checked)} required />
                  <span>I agree to receive marketing emails and confirm I am 18+. Read our <Link to="/legal#privacy">Privacy Policy</Link>.</span>
                </label>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
