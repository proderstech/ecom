import { createContext, useContext, useReducer, useEffect } from 'react';

/* ── Initial State ── */
const initialState = {
  cart: JSON.parse(localStorage.getItem('bs_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('bs_wishlist') || '[]'),
  ageVerified: localStorage.getItem('bs_age_verified') === 'true',
  cookiesAccepted: localStorage.getItem('bs_cookies_accepted') || null,
  user: JSON.parse(localStorage.getItem('bs_user') || 'null'),
};

/* ── Reducer ── */
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.id === action.payload.id);
      const cart = existing
        ? state.cart.map(i => i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i)
        : [...state.cart, { ...action.payload, qty: 1 }];
      return { ...state, cart };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.id !== action.payload) };
    case 'UPDATE_QTY':
      return {
        ...state,
        cart: state.cart.map(i =>
          i.id === action.payload.id ? { ...i, qty: Math.max(1, action.payload.qty) } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.find(i => i.id === action.payload.id);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter(i => i.id !== action.payload.id)
          : [...state.wishlist, action.payload],
      };
    }
    case 'SET_AGE_VERIFIED':
      return { ...state, ageVerified: true };
    case 'SET_COOKIES':
      return { ...state, cookiesAccepted: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, cart: [], wishlist: [] };
    default:
      return state;
  }
}

/* ── Context ── */
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* Persist to localStorage */
  useEffect(() => { localStorage.setItem('bs_cart', JSON.stringify(state.cart)); }, [state.cart]);
  useEffect(() => { localStorage.setItem('bs_wishlist', JSON.stringify(state.wishlist)); }, [state.wishlist]);
  useEffect(() => { if (state.ageVerified) localStorage.setItem('bs_age_verified', 'true'); }, [state.ageVerified]);
  useEffect(() => { if (state.cookiesAccepted !== null) localStorage.setItem('bs_cookies_accepted', state.cookiesAccepted); }, [state.cookiesAccepted]);
  useEffect(() => {
    if (state.user) localStorage.setItem('bs_user', JSON.stringify(state.user));
    else localStorage.removeItem('bs_user');
  }, [state.user]);

  /* Derived */
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <StoreContext.Provider value={{ state, dispatch, cartCount, cartTotal }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
