import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const { state, dispatch } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!state.cookiesAccepted) {
      const t = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(t);
    }
  }, [state.cookiesAccepted]);

  if (state.cookiesAccepted || !show) return null;

  const accept = () => { dispatch({ type: 'SET_COOKIES', payload: 'accepted' }); setShow(false); };
  const decline = () => { dispatch({ type: 'SET_COOKIES', payload: 'declined' }); setShow(false); };

  return (
    <div className={styles.banner}>
      <div className={styles.icon}>🍪</div>
      <div className={styles.content}>
        <p className={styles.title}>We use cookies</p>
        <p className={styles.text}>
          We use cookies to enhance your experience, personalise content and analyse traffic.
          By clicking &quot;Accept All&quot; you consent to our use of cookies in accordance with our{' '}
          <a href="/legal#cookies">Cookie Policy</a>. We comply with UK GDPR regulations.
        </p>
        <div className={styles.actions}>
          <button className={styles.btnAccept} onClick={accept}>Accept All</button>
          <button className={styles.btnDecline} onClick={decline}>Decline</button>
          <a href="/legal#cookies" className={styles.btnLearn}>Learn More</a>
        </div>
      </div>
    </div>
  );
}
