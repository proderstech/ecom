import { useState } from 'react';
import { Lock, X, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { authAPI } from '../../services/api';
import styles from './CheckoutAuthModal.module.css';

export default function CheckoutAuthModal() {
  const { state, dispatch, login } = useStore();
  const { showCheckoutModal } = state;
  const navigate = useNavigate();

  const [mode, setMode] = useState('prompt'); // 'prompt' | 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showCheckoutModal) return null;

  const close = () => {
    dispatch({ type: 'HIDE_CHECKOUT_MODAL' });
    setMode('prompt');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const afterLogin = (user) => {
    close();
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      navigate('/admin');
    } else {
      navigate('/checkout');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) afterLogin(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register({ name, email, password });
      const user = await login(email, password);
      if (user) afterLogin(user);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={close} aria-label="Close">
          <X size={18} />
        </button>

        {mode === 'prompt' && (
          <div className={styles.content}>
            <div className={styles.lockIcon}>
              <Lock size={30} />
            </div>
            <h2>Sign In to Checkout</h2>
            <div className={styles.cartPreview}>
              <ShoppingBag size={16} />
              <span>Your cart is saved. Sign in to complete your order.</span>
            </div>
            <p>
              To protect your order and payment details, please sign in or create a free account.
              Your cart items are safe and waiting!
            </p>
            <div className={styles.steps}>
              <div className={styles.step}><span>1</span> Sign In or Create Account</div>
              <div className={styles.stepLine} />
              <div className={styles.step}><span>2</span> Add Delivery Address</div>
              <div className={styles.stepLine} />
              <div className={styles.step}><span>3</span> Choose Payment & Place Order</div>
            </div>
            <div className={styles.actions}>
              <button className={styles.loginBtn} onClick={() => setMode('login')}>
                <Lock size={15} /> Sign In to Checkout
              </button>
              <button className={styles.registerBtn} onClick={() => setMode('register')}>
                Create Free Account
              </button>
            </div>
            <button className={styles.browseBtn} onClick={close}>
              ← Continue Shopping
            </button>
          </div>
        )}

        {mode === 'login' && (
          <div className={styles.content}>
            <div className={styles.lockIcon}><Lock size={26} /></div>
            <h2>Sign In to Checkout</h2>
            <p>Welcome back! Sign in to complete your order.</p>
            {error && <div className={styles.error}><AlertCircle size={16} />{error}</div>}
            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label>Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoFocus
                />
              </div>
              <div className={styles.field}>
                <label>Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                />
              </div>
              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {loading && <Loader2 size={16} className={styles.spinner} />}
                {loading ? 'Signing in…' : '🔒 Sign In & Continue to Checkout'}
              </button>
            </form>
            <button className={styles.switchBtn} onClick={() => setMode('register')}>
              Don't have an account? Create one free
            </button>
            <button className={styles.browseBtn} onClick={close}>← Continue Shopping</button>
          </div>
        )}

        {mode === 'register' && (
          <div className={styles.content}>
            <div className={styles.lockIcon}><Lock size={26} /></div>
            <h2>Create Account to Order</h2>
            <p>Quick setup — it takes 30 seconds.</p>
            {error && <div className={styles.error}><AlertCircle size={16} />{error}</div>}
            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="James Henderson" required autoFocus
                />
              </div>
              <div className={styles.field}>
                <label>Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                />
              </div>
              <div className={styles.field}>
                <label>Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters" required minLength={8}
                />
              </div>
              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {loading && <Loader2 size={16} className={styles.spinner} />}
                {loading ? 'Creating account…' : '🔒 Create Account & Checkout'}
              </button>
            </form>
            <button className={styles.switchBtn} onClick={() => setMode('login')}>
              Already have an account? Sign In
            </button>
            <button className={styles.browseBtn} onClick={close}>← Continue Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
}
