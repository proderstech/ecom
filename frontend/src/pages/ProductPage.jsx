import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ShoppingCart, Heart, Star, Truck, Shield, Clock, ChevronLeft, ChevronRight, Plus, Minus, Share2 } from 'lucide-react';
import { productsAPI, reviewsAPI, getImageUrl } from '../services/api';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/UI/ProductCard';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, state } = useStore();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [adding, setAdding] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productsAPI.getBySlug(id);
        setProduct(data);
        
        try {
          const reviewsData = await reviewsAPI.forProduct(data.id);
          setReviews(reviewsData);
        } catch (err) {
          console.error("Failed to fetch reviews", err);
        }
        
        // Fetch related products (e.g., others in same category)
        if (data.category_id) {
          const relatedData = await productsAPI.list({ category_id: data.category_id, limit: 5 });
          setRelated(relatedData.items.filter(p => p.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container} style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.loader}>Loading bespoke selection...</div>
      </div>
    );
  }

  if (!product) return (
    <div className={styles.notFound}>
      <div className={styles.nfIcon}>😕</div>
      <h2>Product Not Found</h2>
      <Link to="/shop" className={styles.backBtn}>Back to Shop</Link>
    </div>
  );

  const isWishlisted = state.wishlist.some(i => i.id === product.id);
  const categoryName = product.category?.name || 'Beverage';
  const images = product.images?.length > 0 
    ? product.images.map(img => getImageUrl(img.image_url)) 
    : [getImageUrl(product.image_url)];

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    setAdding(true);
    addToCart(product, qty);
    setTimeout(() => setAdding(false), 800);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!state.user) return;
    setSubmittingReview(true);
    try {
      const data = await reviewsAPI.create({
        product_id: product.id,
        rating: newReview.rating,
        review_text: newReview.text
      });
      setReviews([data, ...reviews]);
      setNewReview({ rating: 5, text: '' });
      setProduct({
        ...product,
        review_count: (product.review_count || 0) + 1,
        // Optional: Update average rating dynamically or just refetch, we'll just optimistically update count for now
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const TABS = [
    { id: 'description', label: 'Description' },
    { id: 'details', label: 'Details & Specs' },
    { id: 'delivery', label: 'Delivery Info' },
    { id: 'reviews', label: `Reviews (${product?.review_count || 0})` },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link><span>/</span>
          <Link to="/shop">Shop</Link><span>/</span>
          <Link to={`/shop?cat=${categoryName}`}>{categoryName}</Link><span>/</span>
          <span className={styles.current}>{product.name}</span>
        </div>

        <div className={styles.layout}>
          {/* ── Gallery ── */}
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              <img src={images[activeImg]} alt={product.name} />
              {product.badge && <span className={styles.badge}>{product.badge}</span>}
              <button className={`${styles.galleryNav} ${styles.galleryPrev}`} onClick={() => setActiveImg((activeImg - 1 + images.length) % images.length)}><ChevronLeft size={20} /></button>
              <button className={`${styles.galleryNav} ${styles.galleryNext}`} onClick={() => setActiveImg((activeImg + 1) % images.length)}><ChevronRight size={20} /></button>
            </div>
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button key={i} className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Info ── */}
          <div className={styles.info}>
            <div className={styles.infoTop}>
              <div className={styles.catTag}>{categoryName} · {product.brand}</div>
              <h1 className={styles.productName}>{product.name}</h1>

              {/* Rating */}
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} fill={s <= Math.round(Number(product.rating || 0)) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span>{product.rating || 0} · {product.review_count || 0} reviews</span>
              </div>

              {/* Price */}
              <div className={styles.priceBlock}>
                <span className={styles.price}>£{Number(product.price || 0).toFixed(2)}</span>
                <span className={styles.vatLabel}>incl. VAT</span>
              </div>

              {/* Specs */}
              <div className={styles.specs}>
                {product.abv && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>ABV</span>
                    <span className={styles.specValue}>{product.abv}</span>
                  </div>
                )}
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Volume</span>
                  <span className={styles.specValue}>{product.volume}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Country</span>
                  <span className={styles.specValue}>{product.country}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Stock</span>
                  <span className={`${styles.specValue} ${product.stock_quantity > 0 ? styles.inStock : styles.noStock}`}>
                    {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Age Notice */}
              {product.abv && (
                <div className={styles.ageNotice}>
                  🔞 <strong>18+ only.</strong> We operate a Challenge 25 policy — ID will be required on delivery.
                  <a href="/legal#challenge25"> Learn more</a>
                </div>
              )}

              {/* Qty + Add (No login required) */}
              <div className={styles.addRow}>
                <div className={styles.qtySelector}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={15} /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock_quantity || 99, q + 1))}><Plus size={15} /></button>
                </div>
                <button
                  className={`${styles.addBtn} ${adding ? styles.addingBtn : ''} ${product.stock_quantity === 0 ? styles.addDisabled : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart size={18} />
                  {adding ? 'Added! ✓' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Secondary actions */}
              <div className={styles.secondaryActions}>
                {/* Wishlist — shows auth modal if not logged in */}
                <button
                  className={`${styles.wishBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                  onClick={handleWishlist}
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                  {isWishlisted ? 'Wishlisted ❤️' : 'Add to Wishlist'}
                </button>
                <button className={styles.shareBtn}><Share2 size={16} /> Share</button>
              </div>

              {/* Wishlist hint for guests */}
              {!state.user && (
                <p className={styles.wishlistHint}>
                  💡 <em>Sign in to save items to your wishlist</em>
                </p>
              )}
            </div>

            {/* Delivery Infobars */}
            <div className={styles.deliveryInfos}>
              <div className={styles.dInfo}><Truck size={16} className={styles.dIcon} /><div><strong>Same-Day Delivery</strong> available across London</div></div>
              <div className={styles.dInfo}><Clock size={16} className={styles.dIcon} /><div><strong>Order before 9pm</strong> for today&apos;s delivery</div></div>
              <div className={styles.dInfo}><Shield size={16} className={styles.dIcon} /><div><strong>Secure Checkout</strong> with Stripe &amp; PayPal</div></div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <div className={styles.tabNav}>
            {TABS.map(tab => (
              <button key={tab.id} className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.tabPanel}>
                <p>{product.description}</p>
                <p>This product is suitable for adult consumption. Please drink responsibly. Do not drive after consuming alcohol.</p>
              </div>
            )}
            {activeTab === 'details' && (
              <div className={styles.tabPanel}>
                <table className={styles.specsTable}>
                  <tbody>
                    <tr><td>Name</td><td>{product.name}</td></tr>
                    <tr><td>Brand</td><td>{product.brand}</td></tr>
                    <tr><td>Category</td><td>{categoryName} — {product.subcategory}</td></tr>
                    {product.abv && <tr><td>ABV</td><td>{product.abv}</td></tr>}
                    <tr><td>Volume</td><td>{product.volume}</td></tr>
                    <tr><td>Country of Origin</td><td>{product.country}</td></tr>
                    <tr><td>Age Restriction</td><td>{product.abv ? '18+ only' : 'None'}</td></tr>
                    <tr><td>Allergens</td><td>May contain sulphites</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'delivery' && (
              <div className={styles.tabPanel}>
                <div className={styles.deliveryTable}>
                  {[
                    { name: 'ASAP (1–2 hrs)', time: 'Within 2 hours', cost: '£4.99' },
                    { name: 'Standard', time: '2–4 hours', cost: '£2.99' },
                    { name: 'Evening Slot', time: '6pm–10pm', cost: 'Free' },
                    { name: 'Free Delivery', time: 'On orders over £50', cost: 'Free' },
                  ].map((row, i) => (
                    <div key={i} className={styles.deliveryRow}>
                      <div>{row.name}</div><div>{row.time}</div>
                      <div className={row.cost === 'Free' ? styles.free : ''}>{row.cost}</div>
                    </div>
                  ))}
                </div>
                <p className={styles.deliveryNote}>🇬🇧 We currently deliver within Greater London only. Orders placed before 9pm will be delivered today.</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className={styles.tabPanel}>
                <div className={styles.reviewSummary}>
                  <div className={styles.reviewScore}>
                    <span className={styles.bigScore}>{product.rating || 0}</span>
                    <div className={styles.reviewRatingStars}>{'★'.repeat(Math.round(Number(product.rating || 0)))}</div>
                    <span className={styles.reviewCount}>{product.review_count || 0} reviews</span>
                  </div>
                </div>

                {state.user ? (
                  <div className={styles.reviewFormSection}>
                    <h3>Write a Review</h3>
                    <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
                      <div className={styles.ratingSelect}>
                        {[1, 2, 3, 4, 5].map(star => (
                           <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})} className={star <= newReview.rating ? styles.starSelected : styles.starUnselected}>
                             <Star size={20} fill={star <= newReview.rating ? 'currentColor' : 'none'} color={star <= newReview.rating ? '#fbbf24' : '#4b5563'} />
                           </button>
                        ))}
                      </div>
                      <textarea 
                        placeholder="Share your thoughts about this product..." 
                        value={newReview.text}
                        onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                        required
                        className={styles.reviewTextarea}
                        rows={4}
                      />
                      <button type="submit" disabled={submittingReview} className={styles.submitReviewBtn}>
                        {submittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className={styles.reviewGuestMessage}>
                    <p>Want to leave a review? <Link to="/login">Sign in</Link> so we know who you are!</p>
                  </div>
                )}

                <div className={styles.reviewList}>
                  {reviews.length === 0 ? (
                    <p className={styles.noReviews}>No reviews yet. Be the first to add one!</p>
                  ) : (
                    reviews.map((r, i) => (
                      <div key={i} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewAvatar}>{(r.user_name || 'U')[0].toUpperCase()}</div>
                          <div><strong>{r.user_name || 'User'}</strong><span className={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</span></div>
                          <div className={styles.reviewStars}>{'★'.repeat(Math.round(r.rating))}</div>
                        </div>
                        <p>{r.review_text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className={styles.related}>
            <h2 className={styles.relatedTitle}>You May Also Like</h2>
            <div className={styles.relatedGrid}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
