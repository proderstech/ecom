import { useEffect } from 'react';
import { Wine, Award, History, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const FEATURES = [
    { icon: <Wine size={32} />, title: 'Expert Curation', desc: 'Every bottle in our cellar is hand-picked by our Master Sommelier, ensuring only the finest labels reach your door.' },
    { icon: <Users size={32} />, title: 'London Heritage', desc: 'Serving Belgravia and the wider London area since 2018, we understand the standards our city expects.' },
    { icon: <History size={32} />, title: 'Speed & Service', desc: 'Luxury isn\'t just about the product; it\'s about the experience. Our dedicated fleet ensures prestige delivery within hours.' },
    { icon: <Award size={32} />, title: 'Trusted Quality', desc: 'From provenance to storage, we guarantee the perfect condition of every vintage and spirit we sell.' },
  ];

  return (
    <main className={styles.about}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <p className={styles.label}>Since 2018</p>
            <h1>The Art of Premium<br /><span className={styles.gold}>Liquid Luxury</span></h1>
            <p className={styles.heroDesc}>Belgravia Spirits was founded on a simple principle: that the world\'s finest drinks should be as accessible as they are exceptional.</p>
          </div>
        </div>
      </section>

      {/* ── Master Story ── */}
      <section className={styles.story}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div className={styles.storyImg}>
              <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80" alt="Exquisite cellar" />
              <div className={styles.sinceBadge}>Est. 2018</div>
            </div>
            <div className={styles.storyText}>
              <p className={styles.sectionLabel}>Our Story</p>
              <h2>From a Private Cellar to London&apos;s Doorsteps</h2>
              <p>What started as a boutique private sourcing service in the heart of Belgravia has evolved into London&apos;s most trusted luxury delivery platform. We noticed a gap in the market — while London has the best bars in the world, the experience of ordering premium spirits at home was often anything but premium.</p>
              <p>Today, Belgravia Spirits serves thousands of discerning clients across the capital, providing same-day delivery of rare whiskies, fine wines, artisan beers, and curated groceries.</p>
              <div className={styles.stats}>
                <div className={styles.stat}><span>5k+</span> Labels</div>
                <div className={styles.stat}><span>60m</span> Delivery</div>
                <div className={styles.stat}><span>25k</span> Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className={styles.mission}>
        <div className={styles.container}>
          <div className={styles.missionBox}>
            <h2>Our Commitment to Quality</h2>
            <p>We operate with a simple ethos: Provost of Excellence. Whether you are ordering a celebratory bottle of Krug or your weekly fine groceries, the service remains at the level of a five-star hotel. We are Londoners, serving Londoners, with the sophistication the city deserves.</p>
            <div className={styles.missionCtas}>
              <Link to="/shop" className={styles.ctaPrimary}>Explore the Collection <ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team/Culture ── */}
      <section className={styles.values}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>The Belgravia Way</p>
            <h2>Built on Values</h2>
          </div>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3>Provenance</h3>
              <p>We only source from official brand owners and reputable estates, ensuring 100% authenticity and perfect provenance for every bottle.</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Sustainability</h3>
              <p>From our electric delivery fleet to 100% recyclable packaging, we are committed to reducing the environmental impact of luxury.</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Responsible Drinking</h3>
              <p>We are firm believers in "Drinking Better, Not More." We support responsible consumption and strict age verification on every delivery.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
