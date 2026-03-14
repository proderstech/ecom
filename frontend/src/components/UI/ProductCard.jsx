import { useState } from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, showQuickView = false }) {
  const { dispatch, state } = useStore();
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const isWishlisted = state.wishlist.some(i => i.id === product.id);

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    dispatch({ type: 'ADD_TO_CART', payload: product });
    setTimeout(() => setAdding(false), 800);
  };

  const toggleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product });
  };

  const stockStatus = product.stock === 0
    ? { label: 'Out of Stock', cls: styles.outOfStock }
    : product.stock <= 5
    ? { label: `Only ${product.stock} left!`, cls: styles.lowStock }
    : null;

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imgWrap}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        {stockStatus && <span className={`${styles.stockBadge} ${stockStatus.cls}`}>{stockStatus.label}</span>}
        {/* Hover Actions */}
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${isWishlisted ? styles.wishlisted : ''}`} onClick={toggleWish} aria-label="Wishlist">
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button className={styles.actionBtn} onClick={e => { e.preventDefault(); navigate(`/product/${product.id}`); }} aria-label="Quick View">
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.tag}>{product.category}</div>
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
              <Star key={s} size={11} fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <span className={styles.ratingVal}>{product.rating}</span>
        </div>

        {/* Price + CTA */}
        <div className={styles.priceRow}>
          <div>
            <span className={styles.price}>£{product.price.toFixed(2)}</span>
            <span className={styles.vat}>inc. VAT</span>
          </div>
          <button
            className={`${styles.cartBtn} ${adding ? styles.adding : ''} ${product.stock === 0 ? styles.disabled : ''}`}
            onClick={addToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
          >
            {adding ? '✓' : <ShoppingCart size={16} />}
          </button>
        </div>
      </div>
    </Link>
  );
}
