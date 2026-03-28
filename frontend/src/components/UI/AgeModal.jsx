/* ── Age Verification Modal ── */
import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AlertCircle } from 'lucide-react';
import styles from './AgeModal.module.css';

export default function AgeModal() {
  const { state, dispatch } = useStore();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [denied, setDenied] = useState(false);

  if (state.ageVerified) return null;

  const verify = () => {
    if (!day || !month || !year) { setError('Please enter your full date of birth.'); return; }
    const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
    if (age >= 18) {
      dispatch({ type: 'SET_AGE_VERIFIED' });
    } else {
      setDenied(true);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 17 - i);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {!denied ? (
          <>
            <div className={styles.crown}>🥂</div>
            <h1>Welcome to<br /><span className={styles.gold}>Belgravia Spirits</span></h1>
            <p className={styles.sub}>
              We sell alcohol and take our responsibilities seriously.<br />
              Please confirm your age to enter.
            </p>
            <div className={styles.challenge}>
              <span>🪪</span>
              <span className={styles.gold}>Challenge 25 — We operate a mandatory ID check policy</span>
            </div>
            <div className={styles.divider} />
            <p className={styles.label}>Enter your date of birth</p>
            <div className={styles.dobGroup}>
              <select value={day} onChange={e => setDay(e.target.value)}>
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={month} onChange={e => setMonth(e.target.value)}>
                <option value="">Month</option>
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select value={year} onChange={e => setYear(e.target.value)}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {error && <p className={styles.error}><AlertCircle size={16} />{error}</p>}
            <button className={styles.btnConfirm} onClick={verify}>
              Confirm — I am 18 or over
            </button>
            <button className={styles.btnDeny} onClick={() => setDenied(true)}>
              I am under 18
            </button>
            <p className={styles.footer}>
              By entering this site you confirm you are of legal drinking age in your location.
              We adhere to all UK alcohol licensing laws.
            </p>
          </>
        ) : (
          <div className={styles.denied}>
            <div className={styles.deniedIcon}>⛔</div>
            <h2>Access Restricted</h2>
            <p>We&apos;re sorry, but you must be 18 or over to access this website.</p>
            <p className={styles.deniedSub}>
              We take our responsibilities as a licensed alcohol retailer very seriously.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
