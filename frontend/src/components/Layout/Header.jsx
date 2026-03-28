import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { categoriesAPI } from '../../services/api';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  
  const { cartCount, state, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const NAV = [
    { label: 'Home', path: '/' },
    {
      label: 'Shop',
      path: '/shop',
      dropdown: categories.length > 0 ? categories.map(c => ({
        label: c.name,
        path: `/shop?cat=${encodeURIComponent(c.name)}`,
        icon: c.icon || '🍷'
      })) : [
        { label: '🍷 Wine', path: '/shop?cat=Wine' },
        { label: '🥃 Whisky', path: '/shop?cat=Whisky' },
        { label: '🍺 Beer', path: '/shop?cat=Beer' },
        { label: '🍸 Spirits', path: '/shop?cat=Spirits' },
      ],
    },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.list();
        setCategories(data?.items || data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileDropdowns({});
    document.body.style.overflow = '';
  }, [location]);

  const toggleMobile = () => {
    const next = !mobileOpen;
    setMobileOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const toggleMobileDropdown = (label) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const isAdmin = state.user?.role === 'admin' || state.user?.role === 'super_admin';

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${searchOpen ? styles.searchActive : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>🥂</div>
            <div className={styles.logoText}>
              <div className={styles.logoName}>Belgravia</div>
              <div className={styles.logoSub}>Spirits & Groceries</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {NAV.map(item => (
              item.dropdown ? (
                <div key={item.label} className={styles.navDropdown}>
                  <Link
                    to={item.path}
                    className={`${styles.navLink} ${location.pathname.startsWith(item.path) ? styles.active : ''}`}
                  >
                    {item.label} <ChevronDown size={13} className={styles.chevron} />
                  </Link>
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownInner}>
                      {item.dropdown.map(d => (
                        <Link key={d.label} to={d.path} className={styles.dropdownItem}>
                          <span className={styles.dropIcon}>{d.icon}</span>
                          {d.label}
                        </Link>
                      ))}
                    </div>
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
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <Link to="/account/wishlist" className={`${styles.iconBtn} ${styles.hideMobile}`} aria-label="Wishlist">
              <Heart size={18} />
              {state.wishlist?.length > 0 && (
                <span className={styles.badge}>{state.wishlist.length}</span>
              )}
            </Link>
            <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </Link>
            <div className={`${styles.userDropdownContainer} ${styles.hideMobile}`}>
              <Link to={state.user ? '/account' : '/login'} className={`${styles.iconBtn} ${styles.userBtn}`}>
                <User size={18} />
                {state.user && <span className={styles.userDot} />}
              </Link>
              {state.user && (
                <div className={styles.userMenu}>
                  <div className={styles.userMenuHeader}>
                    <div className={styles.userName}>{state.user.full_name || state.user.email}</div>
                    <div className={styles.userRole}>{state.user.role}</div>
                  </div>
                  <div className={styles.userMenuLinks}>
                    <Link to="/account"><User size={14} /> My Profile</Link>
                    <Link to="/account/orders"><ShoppingCart size={14} /> My Orders</Link>
                    {isAdmin && <Link to="/admin"><LayoutDashboard size={14} /> Admin Panel</Link>}
                    <button onClick={handleLogout} className={styles.logoutBtn}><LogOut size={14} /> Logout</button>
                  </div>
                </div>
              )}
            </div>
            <button className={styles.hamburger} onClick={toggleMobile} aria-label="Menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${styles.searchBar} ${searchOpen ? styles.searchBarOpen : ''}`}>
          <div className={styles.searchInner}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search premium spirits, fine wines, groceries..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus={searchOpen}
              />
              <button type="submit" className={styles.searchSubmit}>Search</button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className={`${styles.mobileNav} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobileNavContent}>
          <div className={styles.mobileActions}>
             {state.user ? (
               <div className={styles.mobileUser}>
                 <div className={styles.mobileUserInfo}>
                   <div className={styles.mobileUserName}>{state.user.full_name || 'My Account'}</div>
                   <div className={styles.mobileUserEmail}>{state.user.email}</div>
                 </div>
                 <button onClick={handleLogout} className={styles.mobileLogoutIcon}><LogOut size={20} /></button>
               </div>
             ) : (
               <Link to="/login" className={styles.mobileLoginBtn}>Login / Register</Link>
             )}
          </div>

          <div className={styles.mobileMenuScroll}>
            {NAV.map(item => (
              <div key={item.label} className={styles.mobileMenuItem}>
                {item.dropdown ? (
                  <>
                    <button 
                      className={`${styles.mobileLink} ${styles.mobileLinkExpand}`}
                      onClick={() => toggleMobileDropdown(item.label)}
                    >
                      {item.label}
                      <ChevronDown size={18} className={`${styles.chevron} ${mobileDropdowns[item.label] ? styles.chevronUp : ''}`} />
                    </button>
                    <div className={`${styles.mobileSubMenu} ${mobileDropdowns[item.label] ? styles.mobileSubMenuOpen : ''}`}>
                      <Link to={item.path} className={styles.mobileSubLink}>All {item.label}</Link>
                      {item.dropdown.map(d => (
                        <Link key={d.label} to={d.path} className={styles.mobileSubLink}>
                          <span className={styles.dropIcon}>{d.icon}</span> {d.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link to={item.path} className={styles.mobileLink}>{item.label}</Link>
                )}
              </div>
            ))}
            
            <div className={styles.mobileDivider} />
            
            <Link to="/account" className={styles.mobileLink}><User size={18} /> My Account</Link>
            <Link to="/account/wishlist" className={styles.mobileLink}><Heart size={18} /> My Wishlist</Link>
            <Link to="/cart" className={styles.mobileLink}><ShoppingCart size={18} /> Cart ({cartCount})</Link>
            
            {isAdmin && (
              <>
                <div className={styles.mobileDivider} />
                <Link to="/admin" className={styles.mobileLinkAdmin}><LayoutDashboard size={18} /> Admin Dashboard</Link>
              </>
            )}
            
            <div className={styles.mobileDivider} />

            <Link to="/legal" className={styles.mobileLinkSmall}>Terms & Conditions</Link>
          </div>
        </div>
      </div>
      {mobileOpen && <div className={styles.mobileOverlay} onClick={toggleMobile} />}
    </>
  );
}
