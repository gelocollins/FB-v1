
import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPaymentMethodsPage from './pages/admin/AdminPaymentMethodsPage';
import AdminPromosPage from './pages/admin/AdminPromosPage';
import AdminStockLogsPage from './pages/admin/AdminStockLogsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

// Main App Layout
const AppLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <HashRouter>
          <Routes>
            {/* User Facing Routes */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              
              <Route element={<ProtectedRoute />}>
                 <Route path="checkout" element={<CheckoutPage />} />
                 <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                 <Route path="account" element={<AccountPage />} />
              </Route>
            </Route>

            {/* Auth Routes (standalone layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true} />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="payment-methods" element={<AdminPaymentMethodsPage />} />
                    <Route path="promos" element={<AdminPromosPage />} />
                    <Route path="stock-logs" element={<AdminStockLogsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                </Route>
            </Route>

          </Routes>
        </HashRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
