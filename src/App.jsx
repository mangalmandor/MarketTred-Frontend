import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { connectSocket } from './services/socket';

// Auth Pages
import Home from './pages/Home';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import Login from './pages/auth/Login';

// Product & Chat Pages
import ProductList from './pages/products/ProductList';
import Marketplace from './pages/products/Marketplace';
import Cart from './pages/products/Cart';
import ChatRoom from './pages/chat/ChatRoom';
import BuyerChatZone from './pages/chat/BuyerChatZone';

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SellerDashboard from './pages/dashboards/SellerDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import AddProduct from './pages/dashboards/AddProduct';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './pages/products/ProductDetails';

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
        {/* --- 1. PUBLIC ROUTES (No Login Required) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/marketplace" element={<Marketplace />} />

        {/* --- 2. PROTECTED ROUTES WRAPPER (Login Required) --- */}
        {/* Iske andar wahi routes aayenge jo bina login ke nahi khulne chahiye */}
        <Route element={<ProtectedRoute />}>

          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Common Protected Routes */}
          <Route path="/cart" element={<Cart />} />

          {/* Buyer's Specialized Chat Zone */}
          <Route path="/buyer/chatzone/:productId" element={<BuyerChatZone />} />

          {/* General Chat Room (Seller's Perspective or Direct) */}
          <Route path="/chat/:otherUserId/:productId" element={<ChatRoom />} />

          {/* --- ROLE BASED DASHBOARDS --- */}
          {/* Admin Only */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Seller Only */}
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

          {/* Buyer Only */}
          <Route
            path="/dashboard/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* --- 404 NOT FOUND (Optional) --- */}
        <Route path="*" element={<div className="flex items-center justify-center h-screen font-bold">404 - Page Not Found Bhai!</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;