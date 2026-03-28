import { useState } from 'react';
import { Heart, X, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { authAPI } from '../../services/api';
import styles from './WishlistAuthModal.module.css';

export default function WishlistAuthModal() {
  const { state, dispatch, login, claimPendingWishlist } = useStore();
  const { showWishlistModal, pendingWishlistProduct } = state;
  const navigate = useNavigate();

  const [mode, setMode] = useState('prompt'); // 'prompt' | 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showWishlistModal) return null;

  const close = () => {
    dispatch({ type: 'HIDE_WISHLIST_MODAL' });
    setMode('prompt');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        close();
        // Pass the product explicitly to avoid stale closure
        await claimPendingWishlist(pendingWishlistProduct);
      }
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
      // Auto-login after register
      const user = await login(email, password);
      if (user) {
        close();
        await claimPendingWishlist(pendingWishlistProduct);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const continueBrowsing = () => {
    close();
  };

  const goToLogin = () => {
    close();
    navigate('/login');
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={close} aria-label="Close">
          <X size={18} />
        </button>

        {mode === 'prompt' && (
          <div className={styles.content}>
            <div className={styles.heartIcon}>
              <Heart size={32} fill="currentColor" />
            </div>
            <h2>Save to Your Wishlist</h2>
            {pendingWishlistProduct && (
              <div className={styles.productPreview}>
                {pendingWishlistProduct.image && (
                  <img src={pendingWishlistProduct.image} alt={pendingWishlistProduct.name} />
                )}
                <span>{pendingWishlistProduct.name}</span>
              </div>
            )}
            <p>Sign in or create a free account to save items to your wishlist and access them anytime. ❤️</p>
            <div className={styles.actions}>
              <button className={styles.loginBtn} onClick={() => setMode('login')}>
                Sign In
              </button>
              <button className={styles.registerBtn} onClick={() => setMode('register')}>
                Create Account
              </button>
              <button className={styles.browseBtn} onClick={continueBrowsing}>
                Continue Browsing
              </button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className={styles.content}>
            <div className={styles.heartIcon}><Heart size={28} fill="currentColor" /></div>
            <h2>Sign In to Save</h2>
            <p>Log in to add <strong>{pendingWishlistProduct?.name}</strong> to your wishlist.</p>
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
                {loading ? <Loader2 size={16} className={styles.spinner} /> : null}
                {loading ? 'Signing in…' : 'Sign In & Save ❤️'}
              </button>
            </form>
            <button className={styles.switchBtn} onClick={() => setMode('register')}>
              Don't have an account? Register
            </button>
            <button className={styles.browseBtn} onClick={continueBrowsing}>
              Continue Browsing
            </button>
          </div>
        )}

        {mode === 'register' && (
          <div className={styles.content}>
            <div className={styles.heartIcon}><Heart size={28} fill="currentColor" /></div>
            <h2>Create Free Account</h2>
            <p>Join to save <strong>{pendingWishlistProduct?.name}</strong> to your wishlist.</p>
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
              <button type="submit" className={styles.registerBtn} disabled={loading}>
                {loading ? <Loader2 size={16} className={styles.spinner} /> : null}
                {loading ? 'Creating account…' : 'Create Account & Save ❤️'}
              </button>
            </form>
            <button className={styles.switchBtn} onClick={() => setMode('login')}>
              Already have an account? Sign In
            </button>
            <button className={styles.browseBtn} onClick={continueBrowsing}>
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
