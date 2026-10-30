import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import About from './pages/About';
import Contact from './pages/Contact';
import OrderDetail from './pages/OrderDetail';
import { Toaster } from 'react-hot-toast';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout, { AdminGuard } from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAbout from './pages/admin/AdminAbout';
import AdminMessages from './pages/admin/AdminMessages';
import { initPixel, trackPageView } from './utils/fbPixel';
import { initGoogleAnalytics, trackGoogleAnalyticsPageView } from './utils/googleAnalytics';

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const lastTrackedPath = useRef<string>();

  useEffect(() => {
    if (isAdminRoute || lastTrackedPath.current === location.pathname) return;

    initPixel();
    trackPageView();
    initGoogleAnalytics();
    trackGoogleAnalyticsPageView(location.pathname);
    lastTrackedPath.current = location.pathname;
  }, [isAdminRoute, location.pathname]);

  return (
      <div className="flex flex-col min-h-screen bg-white">
        {!isAdminRoute && <Header />}
        
        <main className="flex-1">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="team" element={<AdminAbout />} />
              <Route path="faq" element={<AdminAbout />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </main>

        {!isAdminRoute && <Footer />}
        <Toaster position="top-right" />
      </div>
  );
}
