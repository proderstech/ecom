import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User, Menu, X, Wine, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import styles from './Header.module.css';

const NAV = [
  { label: 'Home', path: '/' },
  {
    label: 'Shop', path: '/shop',
    dropdown: [
      { label: '🍷 Wine', path: '/shop?cat=Wine' },
      { label: '🥃 Whisky', path: '/shop?cat=Whisky' },
      { label: '🍺 Beer', path: '/shop?cat=Beer' },
      { label: '🍸 Spirits', path: '/shop?cat=Spirits' },
      { label: '🛒 Groceries', path: '/shop?cat=Groceries' },
    ],
  },
  { label: 'About', path: '/about' },
  { label: 'Legal', path: '/legal' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, state } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  }, [location]);

  const toggleMobile = () => {
    const next = !mobileOpen;
    setMobileOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>🥂</div>
            <div>
              <div className={styles.logoName}>Belgravia Spirits</div>
              <div className={styles.logoSub}>London&apos;s Premium Delivery</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {NAV.map(item => (
              item.dropdown ? (
                <div key={item.label} className={styles.navDropdown}>
                  <Link
                    to={item.path}
                    className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
                  >
                    {item.label} <ChevronDown size={13} />
                  </Link>
                  <div className={styles.dropdown}>
                    {item.dropdown.map(d => (
                      <Link key={d.label} to={d.path} className={styles.dropdownItem}>{d.label}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(s => !s)} aria-label="Search">
              <Search size={18} />
            </button>
            <Link to="/account/wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <Heart size={18} />
              {state.wishlist.length > 0 && (
                <span className={styles.badge}>{state.wishlist.length}</span>
              )}
            </Link>
            <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </Link>
            <Link to={state.user ? '/account' : '/login'} className={`${styles.iconBtn} ${styles.userBtn}`}>
              <User size={18} />
              {state.user && <span className={styles.userDot} />}
            </Link>
            <button className={styles.hamburger} onClick={toggleMobile} aria-label="Menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className={styles.searchBar}>
            <div className={styles.searchInner}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search wines, whisky, beer, groceries…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={styles.searchSubmit}>Search</button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Nav */}
      <div className={`${styles.mobileNav} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobileNavContent}>
          <div className={styles.mobileLogo}>
            <div className={styles.logoIcon}>🥂</div>
            <div className={styles.logoName}>Belgravia Spirits</div>
          </div>
          {NAV.map(item => (
            <Link key={item.label} to={item.path} className={styles.mobileLink}>
              {item.label}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          <Link to={state.user ? '/account' : '/login'} className={styles.mobileLink}>
            👤 {state.user ? `My Account (${state.user.name})` : 'Login / Register'}
          </Link>
          <Link to="/cart" className={styles.mobileLink}>
            🛒 Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          <Link to="/admin/login" className={styles.mobileLinkSmall}>Admin Portal</Link>
          <Link to="/delivery/login" className={styles.mobileLinkSmall}>Delivery Partner</Link>
        </div>
      </div>
      {mobileOpen && <div className={styles.mobileOverlay} onClick={toggleMobile} />}
    </>
  );
}
