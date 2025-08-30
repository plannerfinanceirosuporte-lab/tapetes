import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { StoreProvider } from './contexts/StoreContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';

// Public pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductPage } from './pages/ProductPage';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { PaymentCallback } from './pages/PaymentCallback';
import { ThankYou } from './pages/ThankYou';
import Historico from './pages/Historico';

// Admin pages
import { AdminLogin } from './pages/admin/Login';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminCategories } from './pages/admin/Categories';
import { AdminOrders } from './pages/admin/Orders';
import { AdminReviews } from './pages/admin/Reviews';
import { AdminUsers } from './pages/admin/Users';
import { AdminSettings } from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><Header /><Home /></>} />
              <Route path="/products" element={<><Header /><Products /></>} />
              <Route path="/product/:id" element={<><Header /><ProductPage /></>} />
              <Route path="/cart" element={<><Header /><Cart /></>} />
              <Route path="/checkout" element={<><Header /><Checkout /></>} />
              <Route path="/order-confirmation" element={<><Header /><OrderConfirmation /></>} />
              <Route path="/payment-callback" element={<><Header /><PaymentCallback /></>} />
              <Route path="/thank-you" element={<><Header /><ThankYou /></>} />
              <Route path="/historico" element={<><Header /><Historico /></>} />
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </Router>
  );
}

export default App;