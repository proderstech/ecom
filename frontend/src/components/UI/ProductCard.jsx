import { useState } from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, getImageUrl } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, state } = useStore();
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const isWishlisted = state.wishlist.some(i => i.id === product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_quantity === 0) return;
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const stockStatus = product.stock_quantity === 0
    ? { label: 'Out of Stock', cls: styles.outOfStock }
    : (product.stock_quantity <= 5 && product.stock_quantity > 0)
    ? { label: `Only ${product.stock_quantity} left!`, cls: styles.lowStock }
    : null;

  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url;
  const imageSrc = getImageUrl(primaryImage || product.image || product.image_url);

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imgWrap}>
        <img 
          src={imageSrc} 
          alt={product.name} 
          loading="lazy" 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541334643621-0810332822f3?w=500&q=80'; e.target.onerror = null; }}
        />
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        {stockStatus && <span className={`${styles.stockBadge} ${stockStatus.cls}`}>{stockStatus.label}</span>}
        {/* Hover Actions */}
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${isWishlisted ? styles.wishlisted : ''}`}
            onClick={handleWishlist}
            aria-label="Wishlist"
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={e => { e.preventDefault(); navigate(`/product/${product.id}`); }}
            aria-label="Quick View"
            title="View product"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.tag}>{typeof product.category === 'object' && product.category !== null ? product.category.name : product.category}</div>
        <h3 className={styles.name}>{product.name}</h3>

        {/* Meta chips */}
        <div className={styles.meta}>
          {product.abv && <span>{product.abv} ABV</span>}
          {product.volume && <span>{product.volume}</span>}
          {product.country && <span>{product.country}</span>}
        </div>

        {/* Rating */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} fill={s <= Math.round(Number(product.rating || 0)) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className={styles.ratingVal}>{product.rating || 0}</span>
        </div>

        {/* Price + CTA */}
        <div className={styles.priceRow}>
          <div>
            <span className={styles.price}>£{Number(product.price || 0).toFixed(2)}</span>
            <span className={styles.vat}>inc. VAT</span>
          </div>
          <button
            className={`${styles.cartBtn} ${adding ? styles.adding : ''} ${product.stock_quantity === 0 ? styles.disabled : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            aria-label="Add to cart"
          >
            {adding ? '✓' : <ShoppingCart size={16} />}
          </button>
        </div>
      </div>
    </Link>
  );
}
