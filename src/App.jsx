import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ShopLayout from './components/layout/ShopLayout';
import { PageLoader } from './components/ui';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import { Login, Register } from './pages/Auth';
import { AccountLayout, MyOrders, OrderDetail, Profile, Wishlist } from './pages/Account';
import { ArtisanShop, Artisans } from './pages/Artisans';
import SellWithUs from './pages/SellWithUs';
import NotFound from './pages/NotFound';

// Admin & seller dashboards are code-split so shoppers never download them (recharts etc.)
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const AdminProducts = lazy(() => import('./admin/Products'));
const AdminCategories = lazy(() => import('./admin/Categories'));
const AdminOrders = lazy(() => import('./admin/Orders'));
const AdminCustomers = lazy(() => import('./admin/Customers'));
const AdminBanners = lazy(() => import('./admin/Banners'));
const AdminSellers = lazy(() => import('./admin/Sellers'));

const SellerLayout = lazy(() => import('./seller/SellerLayout'));
const SellerDashboard = lazy(() => import('./seller/SellerDashboard'));
const SellerOrders = lazy(() => import('./seller/SellerOrders'));
const ShopSettings = lazy(() => import('./seller/ShopSettings'));
const RequireApproved = lazy(() => import('./seller/SellerLayout').then((m) => ({ default: m.RequireApproved })));

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (role && user.role !== role) return <Navigate to={role === 'seller' ? '/sell' : '/'} replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<ShopLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetails />} />
          <Route path="artisans" element={<Artisans />} />
          <Route path="artisans/:slug" element={<ArtisanShop />} />
          <Route path="sell" element={<SellWithUs />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="order-success/:id" element={<RequireAuth><OrderSuccess /></RequireAuth>} />
          <Route path="account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
            <Route index element={<Profile />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route path="admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProducts mode="admin" />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        <Route path="seller" element={<RequireAuth role="seller"><SellerLayout /></RequireAuth>}>
          <Route index element={<SellerDashboard />} />
          <Route path="orders" element={<RequireApproved><SellerOrders /></RequireApproved>} />
          <Route path="products" element={<RequireApproved><AdminProducts mode="seller" /></RequireApproved>} />
          <Route path="settings" element={<ShopSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
