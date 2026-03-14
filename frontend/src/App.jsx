import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AgeModal from './components/UI/AgeModal';
import CookieBanner from './components/UI/CookieBanner';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import LegalPage from './pages/LegalPage';

// Portals
import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';

// Layout wrapping the public site
const StoreLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/legal" element={<LegalPage />} />
        </Route>

        {/* Portals (No Header/Footer) */}
        <Route path="/admin/login" element={<AdminDashboard />} />
        <Route path="/delivery/login" element={<DeliveryDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
