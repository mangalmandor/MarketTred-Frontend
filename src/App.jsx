import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { connectSocket } from './services/socket';

import Home from './pages/Home';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import Login from './pages/auth/Login';

import Marketplace from './pages/products/Marketplace';
import Cart from './pages/products/Cart';
import ChatRoom from './pages/chat/ChatRoom';
import BuyerChatZone from './pages/chat/BuyerChatZone';

import AdminDashboard from './pages/dashboards/AdminDashboard';
import SellerDashboard from './pages/dashboards/SellerDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import AddProduct from './pages/dashboards/AddProduct';

import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './pages/products/ProductDetails';
import PublicRoute from './components/PublicRoute';

const App = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/products" element={<PublicRoute></PublicRoute>} />
        <Route path="/products/marketplace" element={<Marketplace />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/buyer/chatzone/:productId" element={<BuyerChatZone />} />
          <Route path="/chat/:otherUserId/:productId" element={<ChatRoom />} />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/seller"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/seller/add-product"
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<div className="flex items-center justify-center h-screen font-bold">404 - Page Not Found Bhai!</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
