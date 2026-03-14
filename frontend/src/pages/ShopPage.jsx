import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid3X3, List } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import { PRODUCTS, CATEGORIES } from '../data/products';
import styles from './ShopPage.module.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'newest', label: 'Newest' },
];

const BRANDS = [...new Set(PRODUCTS.map(p => p.brand))];
const COUNTRIES = [...new Set(PRODUCTS.map(p => p.country))];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [view, setView] = useState('grid');
  const [openSections, setOpenSections] = useState({ category: true, price: true, brand: false, country: false, abv: false });

  const catFilter = params.get('cat') || '';
  const searchFilter = params.get('search') || '';

  const setCat = (cat) => {
    const p = new URLSearchParams(params);
    if (cat) p.set('cat', cat); else p.delete('cat');
    setParams(p);
  };

  const toggleBrand = (b) => setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  const toggleCountry = (c) => setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleSection = (s) => setOpenSections(o => ({ ...o, [s]: !o[s] }));

  const clearFilters = () => {
    setCat('');
    setSelectedBrands([]);
    setSelectedCountries([]);
    setPriceRange([0, 200]);
  };

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (catFilter) list = list.filter(p => p.category === catFilter);
    if (searchFilter) list = list.filter(p =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase())
    );
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedBrands.length) list = list.filter(p => selectedBrands.includes(p.brand));
    if (selectedCountries.length) list = list.filter(p => selectedCountries.includes(p.country));
    switch (sort) {
      case 'price-asc': return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      case 'rating': return list.sort((a, b) => b.rating - a.rating);
      default: return list;
    }
  }, [catFilter, searchFilter, priceRange, selectedBrands, selectedCountries, sort]);

  const SidebarContent = () => (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3>Filters</h3>
        <button className={styles.clearBtn} onClick={clearFilters}>Clear All</button>
      </div>

      {/* Category */}
      <div className={styles.filterGroup}>
        <button className={styles.filterToggle} onClick={() => toggleSection('category')}>
          <span>Category</span>{openSections.category ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {openSections.category && (
          <div className={styles.filterOptions}>
            <button className={`${styles.catBtn} ${!catFilter ? styles.catBtnActive : ''}`} onClick={() => setCat('')}>All Products ({PRODUCTS.length})</button>
            {CATEGORIES.map(c => (
              <button key={c.id} className={`${styles.catBtn} ${catFilter === c.label ? styles.catBtnActive : ''}`} onClick={() => setCat(c.label)}>
                {c.icon} {c.label} ({PRODUCTS.filter(p => p.category === c.label).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className={styles.filterGroup}>
        <button className={styles.filterToggle} onClick={() => toggleSection('price')}>
          <span>Price Range</span>{openSections.price ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {openSections.price && (
          <div className={styles.filterOptions}>
            <div className={styles.priceDisplay}>
              <span>£{priceRange[0]}</span><span>£{priceRange[1]}+</span>
            </div>
            <input type="range" min="0" max="200" step="5"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className={styles.range} />
          </div>
        )}
      </div>

      {/* Brand */}
      <div className={styles.filterGroup}>
        <button className={styles.filterToggle} onClick={() => toggleSection('brand')}>
          <span>Brand</span>{openSections.brand ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {openSections.brand && (
          <div className={styles.filterOptions}>
            {BRANDS.map(b => (
              <label key={b} className={styles.checkLabel}>
                <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} />
                <span>{b}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Country */}
      <div className={styles.filterGroup}>
        <button className={styles.filterToggle} onClick={() => toggleSection('country')}>
          <span>Country</span>{openSections.country ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {openSections.country && (
          <div className={styles.filterOptions}>
            {COUNTRIES.map(c => (
              <label key={c} className={styles.checkLabel}>
                <input type="checkbox" checked={selectedCountries.includes(c)} onChange={() => toggleCountry(c)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <a href="/">Home</a><span>/</span>
          <span>Shop</span>
          {catFilter && <><span>/</span><span className={styles.current}>{catFilter}</span></>}
        </div>

        <div className={styles.pageHeader}>
          <div>
            <h1>{catFilter || searchFilter ? (catFilter || `Search: "${searchFilter}"`) : 'All Products'}</h1>
            <p>{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className={styles.pageActions}>
            <button className={styles.filterToggleBtn} onClick={() => setMobileSidebar(true)}>
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className={styles.sortWrap}>
              <label>Sort by:</label>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`} onClick={() => setView('grid')}><Grid3X3 size={16} /></button>
              <button className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`} onClick={() => setView('list')}><List size={16} /></button>
            </div>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Desktop Sidebar */}
          <div className={`${styles.sidebarWrap} ${sidebarOpen ? '' : styles.sidebarHidden}`}>
            <SidebarContent />
          </div>

          {/* Products */}
          <div className={styles.products}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className={styles.emptyBtn} onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className={`${styles.grid} ${view === 'list' ? styles.listView : ''}`}>
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebar && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobileSidebar}>
            <div className={styles.mobileSidebarHeader}>
              <h3>Filters</h3>
              <button onClick={() => setMobileSidebar(false)}><X size={20} /></button>
            </div>
            <SidebarContent />
            <button className={styles.applyBtn} onClick={() => setMobileSidebar(false)}>
              Apply Filters ({filtered.length} results)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
