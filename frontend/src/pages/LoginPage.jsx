import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { authAPI } from '../services/api';
import { AlertCircle, CheckCircle } from 'lucide-react';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, claimPendingWishlist } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      // Claim any pending wishlist intent
      await claimPendingWishlist();
      // Redirect based on role or previous location
      const from = location.state?.from || null;
      if (user.role === 'admin' || user.role === 'super_admin') navigate('/admin');
      else if (user.role === 'delivery') navigate('/delivery');
      else if (from) navigate(from, { replace: true });
      else navigate('/account');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your full name');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setError(''); setLoading(true);
    try {
      await authAPI.register({ name, email, password, phone: phone || undefined });
      setSuccess('Account created! Please check your email to verify, then log in.');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccess('If that email is registered, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.logo}>🥂</div>
        <h1 className={styles.title}>
          {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'login' ? 'Sign in to your Belgravia Spirits account' : mode === 'register' ? 'Join London\'s premium delivery service' : 'Enter your email to receive a reset link'}
        </p>

        {error && <div className={styles.error}><AlertCircle size={18} /><span>{error}</span></div>}
        {success && <div className={styles.successMsg}><CheckCircle size={18} /><span>{success}</span></div>}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="button" className={styles.forgotLink} onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>
              Forgot your password?
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field}><label>Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="James Henderson" /></div>
            <div className={styles.field}><label>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" /></div>
            <div className={styles.field}><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 8 characters" /></div>
            <div className={styles.field}><label>Phone (Optional)</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 000000" /></div>
            <p className={styles.ageNote}>By registering you confirm you are 18+ and agree to our <Link to="/legal">Terms</Link>.</p>
            <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className={styles.form}>
            <div className={styles.field}><label>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" /></div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
        )}

        <div className={styles.switchMode}>
          {mode === 'login' ? (
            <p>Don&apos;t have an account? <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>Register</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Sign In</button></p>
          )}
        </div>
      </div>
    </main>
  );
}
