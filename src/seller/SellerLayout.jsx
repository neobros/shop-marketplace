import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ban, Hourglass, LayoutDashboard, Package, Settings, ShoppingCart, Store, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PanelLayout from '../admin/PanelLayout';

const NAV = [
  { to: '/seller', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/seller/products', label: 'Products', icon: Package },
  { to: '/seller/settings', label: 'Shop settings', icon: Settings },
];

export default function SellerLayout() {
  const { user } = useAuth();
  if (user.role !== 'seller') return <Navigate to="/sell" replace />;
  return <PanelLayout nav={NAV} title={user.shop?.name} roleLabel="Seller" accent="leaf" banner={<StatusBanner shop={user.shop} />} />;
}

function StatusBanner({ shop }) {
  if (!shop || shop.status === 'approved') return null;
  const cfg = {
    pending: { icon: Hourglass, cls: 'bg-amber-50 text-amber-800 border-amber-200', text: 'Your shop is under review. You can prepare your shop settings — products can be added once you are approved (usually within 24 hours).' },
    rejected: { icon: XCircle, cls: 'bg-rose-50 text-rose-800 border-rose-200', text: `Your application was not approved${shop.note ? `: “${shop.note}”` : '.'} Update your details and re-apply.` },
    suspended: { icon: Ban, cls: 'bg-slate-100 text-slate-700 border-slate-200', text: `Your shop is suspended and hidden from the store${shop.note ? `: “${shop.note}”` : '.'} Please contact support.` },
  }[shop.status];
  if (!cfg) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mx-4 mt-4 flex items-start gap-3 rounded-2xl border p-4 text-sm sm:mx-6 lg:mx-8 ${cfg.cls}`}>
      <cfg.icon className="mt-0.5 size-5 shrink-0" />
      <p className="flex-1">{cfg.text}</p>
      {shop.status === 'rejected' && <Link to="/sell#apply" className="btn-outline !px-3 !py-1.5 text-xs">Re-apply</Link>}
    </motion.div>
  );
}

/** Wraps seller pages that need an approved shop. */
export function RequireApproved({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user.shop?.status === 'approved') return children;
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-leaf-50 text-leaf-600"><Store className="size-7" /></div>
        <h2 className="mt-4 text-2xl font-semibold">Available once your shop is approved</h2>
        <p className="mt-2 text-slate-500">You'll be able to manage {location.pathname.includes('orders') ? 'orders' : 'products'} here.</p>
        <Link to="/seller/settings" className="btn-leaf mt-6">Complete shop settings</Link>
      </div>
    </div>
  );
}
