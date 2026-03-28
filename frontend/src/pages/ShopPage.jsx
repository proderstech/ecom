import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid3X3, List, Search, Filter } from 'lucide-react';
import ProductCard from '../components/UI/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import styles from './ShopPage.module.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [view, setView] = useState('grid');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Derived filter values from URL
  const selectedCatName = useMemo(() => params.get('cat'), [params]);
  const query = useMemo(() => params.get('q') || params.get('search'), [params]);

  const setCat = (catName) => {
    const p = new URLSearchParams(params);
    if (catName) p.set('cat', catName); else p.delete('cat');
    setParams(p);
    setPage(1);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // If we have a category name in the URL, find its ID to send to the backend
      let categoryId = undefined;
      if (selectedCatName && categories.length > 0) {
        const cat = categories.find(c => c.name.toLowerCase() === selectedCatName.toLowerCase());
        if (cat) categoryId = cat.id;
      }

      const data = await productsAPI.list({
        page, 
        limit: 12, 
        sort,
        search: query || undefined,
        category_id: categoryId || undefined,
        min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
        max_price: priceRange[1] < 500 ? priceRange[1] : undefined,
      });
      setProducts(data?.items || []);
      setTotal(data?.total || 0);
    } catch (e) {
      console.error("Fetch products failed:", e);
    } finally {
      setLoading(false);
    }
  }, [page, sort, priceRange, selectedCatName, query, categories]);

  useEffect(() => { 
    fetchProducts(); 
  }, [fetchProducts]);

  useEffect(() => {
    categoriesAPI.list().then(cats => {
      setCategories(cats?.items || cats || []);
    }).catch(console.error);
  }, []);

  const clearFilters = () => {
    setParams({});
    setPriceRange([0, 500]);
    setSort('featured');
  };

  const currentCategoryName = useMemo(() => {
     return selectedCatName || null;
  }, [selectedCatName]);

  const SidebarContent = () => (
    <div className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <div className={styles.sidebarHeader}>
           <Filter size={16} />
           <span>Filters</span>
        </div>
        <button className={styles.clearAll} onClick={clearFilters}>Reset All</button>
      </div>

      {/* Categories */}
      <div className={styles.filterBlock}>
        <h4 className={styles.blockTitle}>Categories</h4>
        <div className={styles.catList}>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`${styles.catItem} ${selectedCatName === cat.name ? styles.catActive : ''}`}
              onClick={() => setCat(cat.name)}
            >
              <span className={styles.catIcon}>{cat.icon || '🍷'}</span>
              <span className={styles.catName}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className={styles.filterBlock}>
        <h4 className={styles.blockTitle}>Price (GBP)</h4>
        <div className={styles.priceInputs}>
           <div className={styles.priceSlider}>
             <input 
               type="range" 
               min="0" max="500" step="10"
               value={priceRange[1]}
               onChange={e => setPriceRange([0, parseInt(e.target.value)])}
             />
             <div className={styles.priceLabels}>
                <span>£0</span>
                <span>£{priceRange[1]}{priceRange[1] === 500 ? '+' : ''}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header Area */}
        <div className={styles.pageHero}>
          <div className={styles.heroContent}>
            <div className={styles.breadcrumb}>
              <a href="/">Home</a> <span>/</span> <span>Shop</span>
            </div>
            <h1>{currentCategoryName || (query ? `Results for "${query}"` : 'The Collection')}</h1>
            <p className={styles.countText}>{total} premium products found</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Sidebar Area (Desktop) */}
          <aside className={styles.sidebarWrapper}>
            <SidebarContent />
          </aside>

          {/* Product Grid Area */}
          <div className={styles.content}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
               <button className={styles.mobileFilterBtn} onClick={() => setMobileSidebar(true)}>
                 <SlidersHorizontal size={16} /> Filters
               </button>
               
               <div className={styles.toolGroup}>
                 <div className={styles.sortContainer}>
                   <span>Sort:</span>
                   <select value={sort} onChange={e => setSort(e.target.value)}>
                     {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                   </select>
                 </div>
                 <div className={styles.viewToggle}>
                   <button 
                    className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`}
                    onClick={() => setView('grid')}
                   >
                     <Grid3X3 size={18} />
                   </button>
                   <button 
                    className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`}
                    onClick={() => setView('list')}
                   >
                     <List size={18} />
                   </button>
                 </div>
               </div>
            </div>

            {/* List/Grid */}
            {loading ? (
              <div className={styles.productsGrid}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} className={styles.emptyIcon} />
                <h2>No products found</h2>
                <p>We couldn't find any items matching your current filters. Try resetting them.</p>
                <button onClick={clearFilters} className={styles.resetBtn}>Reset All Filters</button>
              </div>
            ) : (
              <div className={`${styles.productsGrid} ${view === 'list' ? styles.listView : ''}`}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination Placeholder */}
            {total > products.length && (
               <div className={styles.loadMore}>
                 <button onClick={() => setPage(p => p + 1)} className={styles.loadBtn}>Load More Products</button>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebar && (
        <div className={styles.mobileOverlay} onClick={() => setMobileSidebar(false)}>
          <div className={styles.mobileSidebar} onClick={e => e.stopPropagation()}>
            <div className={styles.mobileHeader}>
              <h3>Filters</h3>
              <button onClick={() => setMobileSidebar(false)}><X size={20} /></button>
            </div>
            <div className={styles.mobileSidebarBody}>
               <SidebarContent />
            </div>
            <button className={styles.mobileApply} onClick={() => setMobileSidebar(false)}>
              Show {total} Results
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
