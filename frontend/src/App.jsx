import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AgeModal from './components/UI/AgeModal';
import CookieBanner from './components/UI/CookieBanner';
import WishlistAuthModal from './components/UI/WishlistAuthModal';
import CheckoutAuthModal from './components/UI/CheckoutAuthModal';
import { Toaster } from 'sonner';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import LegalPage from './pages/LegalPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Portals
import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';

// Layout wrapping the public site
const StoreLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
    {/* Global auth modals */}
    <WishlistAuthModal />
    <CheckoutAuthModal />
  </>
);

function App() {
  return (
    <BrowserRouter>
      {/* Global Toast Notifications */}
      <Toaster 
        position="top-right" 
        expand={false} 
        richColors 
        closeButton
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
            padding: '12px',
          },
        }}
      />

      {/* Global Overlays */}
      <AgeModal />
      <CookieBanner />

      <Routes>
        {/* Public Storefront */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account/:tab?" element={<AccountPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Portals (No Header/Footer) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/delivery" element={<DeliveryDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
