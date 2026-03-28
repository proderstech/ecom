import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Inquiry', message: '' });
    }, 1500);
  };

  return (
    <main className={styles.contactPage}>
      {/* ── Header ── */}
      <section className={styles.header}>
        <div className={styles.container}>
          <p className={styles.label}>Concierge & Support</p>
          <h1>How Can We <br /><span className={styles.gold}>Assist You?</span></h1>
          <p className={styles.headerDesc}>Whether you are looking for a rare vintage, planning a corporate event, or need assistance with an order, our dedicated Belgravia concierge is here to help.</p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Form */}
            <div className={styles.formSection}>
              {submitted ? (
                <div className={styles.success}>
                  <CheckCircle size={60} className={styles.successIcon} />
                  <h2>Message Received</h2>
                  <p>Thank you for contacting Belgravia Spirits. One of our concierge specialists will contact you within 4 business hours.</p>
                  <button onClick={() => setSubmitted(false)} className={styles.backBtn}>Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formHeader}>
                    <h2>Send a Message</h2>
                    <p>Field marked with * are required.</p>
                  </div>
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Alexander Hamilton"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="e.g. alexander@hamilton.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Subject</label>
                    <select 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                    >
                      <option>General Inquiry</option>
                      <option>Order Assistance</option>
                      <option>Corporate Events</option>
                      <option>Wholesale Partnerships</option>
                      <option>Rare Bottle Sourcing</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Message *</label>
                    <textarea 
                      required 
                      rows="6"
                      placeholder="How can our concierge assist you today?"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Processing...' : (
                      <>Send Message <Send size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className={styles.infoSection}>
              <div className={styles.infoCard}>
                <h3>Our Offices</h3>
                <div className={styles.infoItems}>
                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}><MapPin size={20} /></div>
                    <div>
                      <div className={styles.infoTitle}>Flagship Location</div>
                      <div className={styles.infoDesc}>42 Belgravia Square, London SW1X 8LR</div>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}><Phone size={20} /></div>
                    <div>
                      <div className={styles.infoTitle}>Private Concierge</div>
                      <div className={styles.infoDesc}>+44 20 7123 4567</div>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}><Mail size={20} /></div>
                    <div>
                      <div className={styles.infoTitle}>Email Correspondence</div>
                      <div className={styles.infoDesc}>hello@belgraviaspirits.co.uk</div>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.iconCircle}><Clock size={20} /></div>
                    <div>
                      <div className={styles.infoTitle}>Operating Hours</div>
                      <div className={styles.infoDesc}>
                        Mon–Sat: 9am – 11pm<br />
                        Sun: 10am – 10:30pm
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.faqCard}>
                <h3>Quick Help</h3>
                <div className={styles.faqItem}>
                  <strong>Same-day delivery?</strong>
                  <p>Yes, all orders placed before 9pm are eligible for same-day delivery across London.</p>
                </div>
                <div className={styles.faqItem}>
                  <strong>Wholesale and Corporate?</strong>
                  <p>We provide curated packages for events. Please select "Corporate Events" in the form.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map/Location ── */}
      <section className={styles.mapSection}>
        <div className={styles.mapInner}>
          <div className={styles.mapOverlay}>
            <div className={styles.mapCard}>
              <div className={styles.logoBadge}>🥂</div>
              <h3>Visit Our Boutique</h3>
              <p>Experience our selection in person at our Belgravia flagship store. Private tastings by appointment only.</p>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.mapLink}>Get Directions</a>
            </div>
          </div>
          <div className={styles.mapMockup} />
        </div>
      </section>
    </main>
  );
}
