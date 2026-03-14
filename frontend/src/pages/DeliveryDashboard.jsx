import { useState } from 'react';
import { MapPin, Phone, ShieldAlert, CheckCircle, Navigation } from 'lucide-react';
import styles from './DeliveryDashboard.module.css';

const ACTIVE_DELIVERIES = [
  { id: '#BG-84920', name: 'James H.', address: '42 Belgravia Sq, London, SW1X 8LR', phone: '+44 7700 900123', ageCheck: true, distance: '1.2 mi' },
  { id: '#BG-84922', name: 'Sarah W.', address: '15 Knightsbridge, London, SW1X 7LY', phone: '+44 7700 900456', ageCheck: false, distance: '2.5 mi' }
];

export default function DeliveryDashboard() {
  const [activeJob, setActiveJob] = useState(null);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>🚚 Driver Portal</div>
        <div className={styles.status}>
          <span className={styles.dot}></span> Online
        </div>
      </header>

      <main className={styles.main}>
        {activeJob ? (
          <div className={styles.activeJob}>
            <button className={styles.backBtn} onClick={() => setActiveJob(null)}>← Back to List</button>
            <div className={styles.jobCard}>
              <div className={styles.jobHead}>
                <h2>Order {activeJob.id}</h2>
                <span className={styles.distance}>{activeJob.distance} away</span>
              </div>

              <div className={styles.customerInfo}>
                <div className={styles.infoRow}>
                  <MapPin size={20} className={styles.icon} />
                  <div>
                    <strong>{activeJob.name}</strong>
                    <p>{activeJob.address}</p>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <Phone size={20} className={styles.icon} />
                  <a href={`tel:${activeJob.phone}`}>{activeJob.phone}</a>
                </div>
              </div>

              {activeJob.ageCheck && (
                <div className={styles.ageAlert}>
                  <ShieldAlert size={24} className={styles.alertIcon} />
                  <div>
                    <h3>Challenge 25 Policy Applies</h3>
                    <p>Alcohol enclosed. You <strong>must</strong> check ID if the customer looks under 25. No ID = No Delivery.</p>
                  </div>
                </div>
              )}

              <div className={styles.actionBtns}>
                <button className={styles.navBtn}><Navigation size={18} /> Get Directions</button>
                <button className={styles.completeBtn} onClick={() => { alert('Delivery Marked Complete'); setActiveJob(null); }}>
                  <CheckCircle size={18} /> Mark as Delivered
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.jobList}>
            <div className={styles.listHeader}>
              <h2>Active Deliveries ({ACTIVE_DELIVERIES.length})</h2>
            </div>
            {ACTIVE_DELIVERIES.map(job => (
              <div key={job.id} className={styles.listItem} onClick={() => setActiveJob(job)}>
                <div className={styles.listHead}>
                  <strong>{job.id}</strong>
                  <span>{job.distance}</span>
                </div>
                <div className={styles.listBody}>
                  <p>{job.address}</p>
                  {job.ageCheck && <span className={styles.ageTag}>🔞 Age Verification Required</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
