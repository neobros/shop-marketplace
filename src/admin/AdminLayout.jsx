import { Image, LayoutDashboard, Package, ShoppingCart, Store, Tags, Users } from 'lucide-react';
import useFetch from '../lib/useFetch';
import { BRAND } from '../lib/brand';
import PanelLayout from './PanelLayout';

export default function AdminLayout() {
  // pending seller applications badge
  const { data } = useFetch('/sellers/admin/all', { params: { status: 'pending' } });
  const nav = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/sellers', label: 'Artisans', icon: Store, badge: data?.sellers?.length },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/banners', label: 'Banners', icon: Image },
    { to: '/admin/customers', label: 'Users', icon: Users },
  ];
  return <PanelLayout nav={nav} title={BRAND.name} roleLabel="Admin" />;
}
