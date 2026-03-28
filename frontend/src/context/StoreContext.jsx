import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI, cartAPI, wishlistAPI } from '../services/api';
import { toast } from 'sonner';

/* ── Helpers ────────────────────────────────────────────────────────────── */
const GUEST_CART_KEY = 'bs_guest_cart';

function loadGuestCart() {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]'); }
  catch { return []; }
}

function saveGuestCart(cart) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

function guestCartToState(guestCart) {
  return {
    items: guestCart,
    total: guestCart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0),
    count: guestCart.reduce((s, i) => s + i.quantity, 0),
  };
}

/* ── Initial State ─────────────────────────────────────────────────────── */
const guestCart = loadGuestCart();
const initialState = {
  cart: guestCart,                // Array of {id, name, price, image, quantity, ...}
  cartTotal: guestCart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0),
  cartCount: guestCart.reduce((s, i) => s + i.quantity, 0),
  wishlist: [],
  ageVerified: localStorage.getItem('bs_age_verified') === 'true',
  cookiesAccepted: localStorage.getItem('bs_cookies_accepted') || null,
  user: JSON.parse(localStorage.getItem('bs_user') || 'null'),
  cartLoading: false,
  // Intent preservation: store product user tried to wishlist before login
  pendingWishlistProduct: null,
  // Auth modal triggers
  showWishlistModal: false,
  showCheckoutModal: false,
};

/* ── Reducer ───────────────────────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    /* ── Cart ── */
    case 'SET_CART': {
      const cart = action.payload?.items || [];
      return {
        ...state,
        cart,
        cartTotal: cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0),
        cartCount: cart.reduce((s, i) => s + i.quantity, 0),
        cartLoading: false,
      };
    }
    case 'SET_CART_LOADING':
      return { ...state, cartLoading: action.payload };

    /* ── Guest Cart Actions ── */
    case 'GUEST_ADD_TO_CART': {
      const product = action.payload;
      const qty = action.qty || 1;
      const existing = state.cart.find(i => i.id === product.id);
      let newCart;
      if (existing) {
        newCart = state.cart.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      } else {
        newCart = [...state.cart, { ...product, quantity: qty }];
      }
      saveGuestCart(newCart);
      const { total, count } = guestCartToState(newCart);
      return { ...state, cart: newCart, cartTotal: total, cartCount: count };
    }
    case 'GUEST_UPDATE_QTY': {
      const { id, quantity } = action.payload;
      let newCart;
      if (quantity <= 0) {
        newCart = state.cart.filter(i => i.id !== id);
      } else {
        newCart = state.cart.map(i => i.id === id ? { ...i, quantity } : i);
      }
      saveGuestCart(newCart);
      const { total, count } = guestCartToState(newCart);
      return { ...state, cart: newCart, cartTotal: total, cartCount: count };
    }
    case 'GUEST_REMOVE_FROM_CART': {
      const newCart = state.cart.filter(i => i.id !== action.payload);
      saveGuestCart(newCart);
      const { total, count } = guestCartToState(newCart);
      return { ...state, cart: newCart, cartTotal: total, cartCount: count };
    }
    case 'GUEST_CLEAR_CART': {
      saveGuestCart([]);
      return { ...state, cart: [], cartTotal: 0, cartCount: 0 };
    }

    /* ── Wishlist ── */
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
    case 'TOGGLE_WISHLIST_ITEM': {
      const product = action.payload;
      const exists = state.wishlist.some(i => i.id === product.id);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter(i => i.id !== product.id)
          : [...state.wishlist, product],
      };
    }

    /* ── Auth ── */
    case 'SET_AGE_VERIFIED':
      return { ...state, ageVerified: true };
    case 'SET_COOKIES':
      return { ...state, cookiesAccepted: action.payload };
    case 'SET_USER':
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return {
        ...state, user: null,
        wishlist: [],
        // Keep cart (guest cart) so products aren't lost
      };

    /* ── Modals ── */
    case 'SHOW_WISHLIST_MODAL':
      return { ...state, showWishlistModal: true, pendingWishlistProduct: action.payload };
    case 'HIDE_WISHLIST_MODAL':
      return { ...state, showWishlistModal: false };
    case 'SHOW_CHECKOUT_MODAL':
      return { ...state, showCheckoutModal: true };
    case 'HIDE_CHECKOUT_MODAL':
      return { ...state, showCheckoutModal: false };
    case 'CLEAR_PENDING_WISHLIST':
      return { ...state, pendingWishlistProduct: null };

    default:
      return state;
  }
}

/* ── Context ───────────────────────────────────────────────────────────── */
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* Persist age verified + cookies */
  useEffect(() => { if (state.ageVerified) localStorage.setItem('bs_age_verified', 'true'); }, [state.ageVerified]);
  useEffect(() => { if (state.cookiesAccepted !== null) localStorage.setItem('bs_cookies_accepted', state.cookiesAccepted); }, [state.cookiesAccepted]);
  useEffect(() => {
    if (state.user) localStorage.setItem('bs_user', JSON.stringify(state.user));
    else localStorage.removeItem('bs_user');
  }, [state.user]);

  /* Load wishlist from API when user is set */
  const refreshWishlist = useCallback(async () => {
    const token = localStorage.getItem('bs_access_token');
    if (!token) return;
    try {
      const data = await wishlistAPI.get();
      // data from backend is List of {id (wishlist_id), product_id, product: {...}}
      // We want our state to be a list of product objects for consistency
      const rawItems = data?.items || data || [];
      const productItems = rawItems
        .filter(item => item && item.product)
        .map(item => ({
          ...item.product,
          wishlist_record_id: item.id, // keep this just in case
        }));
      dispatch({ type: 'SET_WISHLIST', payload: productItems });
    } catch (err) {
      console.error("Wishlist refresh failed", err);
    }
  }, []);

  /* Load user on mount */
  useEffect(() => {
    const token = localStorage.getItem('bs_access_token');
    if (token && !state.user) {
      authAPI.me().then(user => {
        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
          refreshWishlist();
        }
      }).catch(() => { });
    } else if (token && state.user) {
      refreshWishlist();
    }
  }, []); // eslint-disable-line

  /* ── Cart Actions ── (Guest-first, no login needed) ── */
  const addToCart = useCallback((product, quantity = 1) => {
    // Map API product fields to our cart fields
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.image_url,
      category: product.category,
      volume: product.volume,
      abv: product.abv,
      stock: product.stock,
      quantity,
    };
    dispatch({ type: 'GUEST_ADD_TO_CART', payload: cartItem, qty: quantity });
    toast.success(`${product.name} added to cart! 🛒`, {
      duration: 2500,
      action: { label: 'View Cart', onClick: () => window.location.href = '/cart' },
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'GUEST_REMOVE_FROM_CART', payload: id });
  }, []);

  const updateQty = useCallback((id, quantity) => {
    dispatch({ type: 'GUEST_UPDATE_QTY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'GUEST_CLEAR_CART' });
  }, []);

  /* ── Wishlist Actions ── (Login required) ── */
  const toggleWishlist = useCallback(async (product) => {
    if (!state.user) {
      // Save intent and show modal
      dispatch({ type: 'SHOW_WISHLIST_MODAL', payload: product });
      return;
    }
    // Optimistically toggle
    dispatch({ type: 'TOGGLE_WISHLIST_ITEM', payload: product });
    const isNowWishlisted = !state.wishlist.some(i => i.id === product.id);
    try {
      if (isNowWishlisted) {
        await wishlistAPI.add(product.id);
        toast.success(`${product.name} added to wishlist ❤️`);
      } else {
        await wishlistAPI.remove(product.id);
        toast.info(`${product.name} removed from wishlist`);
      }
    } catch {
      // Revert on error
      dispatch({ type: 'TOGGLE_WISHLIST_ITEM', payload: product });
    }
  }, [state.user, state.wishlist]);

  /* Claim pending wishlist after login — reads pendingWishlistProduct from state at call time */
  const claimPendingWishlist = useCallback(async (pendingProduct) => {
    // Accept optional explicit product (passed from modal) or fall back to state
    const product = pendingProduct || state.pendingWishlistProduct;
    if (!product) return;
    dispatch({ type: 'TOGGLE_WISHLIST_ITEM', payload: product });
    try {
      await wishlistAPI.add(product.id);
      toast.success(`${product.name} added to wishlist ❤️`);
    } catch { /* silent */ }
    dispatch({ type: 'CLEAR_PENDING_WISHLIST' });
  }, [state.pendingWishlistProduct]);

  /* ── Auth Actions ── */
  const login = useCallback(async (email, password) => {
    const tokens = await authAPI.login(email, password);
    if (tokens) {
      const user = await authAPI.me();
      dispatch({ type: 'SET_USER', payload: user });
      await refreshWishlist();
      return user;
    }
    return null;
  }, [refreshWishlist]);

  const logout = useCallback(() => {
    authAPI.logout();
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('bs_user');
  }, []);

  return (
    <StoreContext.Provider value={{
      state, dispatch,
      cartCount: state.cartCount,
      cartTotal: state.cartTotal,
      addToCart, removeFromCart, updateQty, clearCart,
      toggleWishlist, claimPendingWishlist, refreshWishlist,
      login, logout,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
