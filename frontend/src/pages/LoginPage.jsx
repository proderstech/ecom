import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', gdpr: false, age: false });
  const { dispatch } = useStore();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const user = { name: form.name || form.email.split('@')[0], email: form.email, id: Date.now() };
    dispatch({ type: 'SET_USER', payload: user });
    navigate('/account');
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <span>🥂</span>
            <div>
              <div className={styles.logoName}>Belgravia Spirits</div>
              <div className={styles.logoSub}>Premium London Delivery</div>
            </div>
          </Link>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`} onClick={() => setIsLogin(true)}>Sign In</button>
            <button className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`} onClick={() => setIsLogin(false)}>Join Now</button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" required />
                </div>
              </div>
            )}
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {!isLogin && (
              <>
                <div className={styles.formGroup}>
                  <label>Confirm Password</label>
                  <div className={styles.inputWrap}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
                  </div>
                </div>
                <div className={styles.checks}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" name="age" checked={form.age} onChange={handleChange} required />
                    <span>I confirm I am 18 or over and of legal drinking age. 🔞</span>
                  </label>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" name="gdpr" checked={form.gdpr} onChange={handleChange} required />
                    <span>I agree to the <Link to="/legal#terms">Terms & Conditions</Link> and <Link to="/legal#privacy">Privacy Policy</Link>. (GDPR)</span>
                  </label>
                </div>
              </>
            )}
            {isLogin && (
              <div className={styles.forgotRow}>
                <a href="#" className={styles.forgot}>Forgot password?</a>
              </div>
            )}
            <button type="submit" className={styles.submitBtn}>
              {isLogin ? 'Sign In to My Account' : 'Create Account — Join the Boutique Club'}
            </button>
          </form>

          <div className={styles.divider}><span>or continue with</span></div>
          <div className={styles.socials}>
            <button className={styles.socialBtn}>🔍 Google</button>
            <button className={styles.socialBtn}>🍎 Apple</button>
          </div>

          <div className={styles.footer}>
            <p className={styles.switchText}>
              {isLogin ? "Don't have an account?" : 'Already a member?'}{' '}
              <button className={styles.switchBtn} onClick={() => setIsLogin(l => !l)}>
                {isLogin ? 'Create one now' : 'Sign in'}
              </button>
            </p>
            <div className={styles.portals}>
              <Link to="/admin/login" className={styles.portalLink}>Admin Portal</Link>
              <span>·</span>
              <Link to="/delivery/login" className={styles.portalLink}>Delivery Partner</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
