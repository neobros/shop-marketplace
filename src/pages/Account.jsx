import { useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Heart, Package, PackageCheck, Truck, User, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { date, dateTime, money } from '../lib/format';
import { DISTRICTS, PAYMENT_LABELS } from '../lib/brand';
import { EmptyState, Img, PageLoader, Spinner } from '../components/ui';
import StatusBadge from '../components/StatusBadge';
import { ProductGrid } from '../components/ProductCard';

const tabs = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
];

export function AccountLayout() {
  const { user } = useAuth();
  return (
    <div className="container-x py-10">
      <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-linear-to-r from-brand-800 via-brand-700 to-brand-500 p-8 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 size-60 animate-blob rounded-full bg-white/20 blur-2xl" />
        <div className="relative flex items-center gap-5">
          <div className="grid size-16 place-items-center rounded-2xl bg-white/20 text-2xl font-extrabold backdrop-blur">{user.name[0]}</div>
          <div>
            <p className="text-sm text-white/70">Welcome back,</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">{user.name}</h1>
            <p className="text-sm text-white/70">{user.email}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div><Outlet /></div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    address: user.address?.address || '',
    city: user.address?.city || '',
    postalCode: user.address?.postalCode || '',
    district: user.address?.district || 'Colombo',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving('profile');
    try {
      const { name, phone, ...address } = form;
      await updateProfile({ name, phone, address });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving('');
    }
  };
  const changePw = async (e) => {
    e.preventDefault();
    setSaving('pw');
    try {
      await api.put('/auth/me/password', pw);
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card p-6">
        <h3 className="mb-5 text-lg font-bold">Personal information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label><input className="input" value={form.name} onChange={set('name')} required /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={set('address')} /></div>
          <div><label className="label">City</label><input className="input" value={form.city} onChange={set('city')} /></div>
          <div><label className="label">Postal code</label><input className="input" value={form.postalCode} onChange={set('postalCode')} /></div>
          <div className="sm:col-span-2"><label className="label">District</label><select className="input" value={form.district} onChange={set('district')}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></div>
        </div>
        <button disabled={saving === 'profile'} className="btn-primary mt-6">{saving === 'profile' && <Spinner className="size-4" />} Save changes</button>
      </form>
      <form onSubmit={changePw} className="card p-6">
        <h3 className="mb-5 text-lg font-bold">Change password</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Current password</label><input type="password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></div>
          <div><label className="label">New password</label><input type="password" minLength={6} className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></div>
        </div>
        <button disabled={saving === 'pw'} className="btn-outline mt-6">{saving === 'pw' && <Spinner className="size-4" />} Update password</button>
      </form>
    </div>
  );
}

export function MyOrders() {
  const { data, loading } = useFetch('/orders/mine');
  if (loading) return <PageLoader />;
  if (!data?.orders?.length)
    return <EmptyState icon={Package} title="No orders yet" text="When you place an order it will appear here." action={<Link to="/shop" className="btn-brand">Start shopping</Link>} />;

  return (
    <div className="space-y-4">
      {data.orders.map((o, i) => (
        <motion.div key={o.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Link to={`/account/orders/${o.id}`} className="card group flex flex-wrap items-center gap-4 p-5 transition hover:shadow-lift">
            <div className="flex -space-x-3">
              {o.items.slice(0, 3).map((it, k) => <Img key={k} src={it.image} className="size-14 rounded-xl ring-2 ring-white" />)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold">{o.orderNumber}</div>
              <div className="text-sm text-slate-500">{date(o.createdAt)} · {o.items.length} item(s)</div>
            </div>
            <StatusBadge status={o.status} />
            <div className="w-24 text-right font-bold">{money(o.total)}</div>
            <ChevronRight className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

const STEPS = [
  { key: 'pending', label: 'Order placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
];

export function OrderDetail() {
  const { id } = useParams();
  const { data, loading, setData } = useFetch(`/orders/${id}`);
  const [cancelling, setCancelling] = useState(false);
  if (loading) return <PageLoader />;
  const o = data?.order;
  if (!o) return <EmptyState icon={Package} title="Order not found" />;

  const cancelled = o.status === 'cancelled';
  const stepIdx = STEPS.findIndex((s) => s.key === o.status);
  const at = (s) => o.statusHistory?.findLast?.((h) => h.status === s)?.at;

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${o.id}/cancel`);
      setData(res.data);
      toast.success('Order cancelled');
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/account/orders" className="text-sm text-slate-500 hover:text-brand-600">← All orders</Link>
            <h2 className="mt-1 text-xl font-extrabold">{o.orderNumber}</h2>
            <p className="text-sm text-slate-500">Placed {dateTime(o.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={o.status} />
            {o.status === 'pending' && (
              <button onClick={cancel} disabled={cancelling} className="btn-outline !py-2 text-rose-600 hover:!border-rose-300 hover:!text-rose-600">
                {cancelling ? <Spinner className="size-4" /> : <X className="size-4" />} Cancel
              </button>
            )}
          </div>
        </div>

        {cancelled ? (
          <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">This order was cancelled on {dateTime(at('cancelled'))}.</div>
        ) : (
          <div className="relative mt-10 grid grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-brand-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${(Math.max(0, stepIdx) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            {STEPS.map((s, i) => {
              const done = i <= stepIdx;
              return (
                <div key={s.key} className="relative flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className={`grid size-11 place-items-center rounded-full ring-4 ring-white ${done ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {done && i < stepIdx ? <Check className="size-5" /> : <s.icon className="size-5" />}
                  </motion.div>
                  <div className={`mt-3 text-xs font-semibold sm:text-sm ${done ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</div>
                  <div className="text-[11px] text-slate-400">{at(s.key) ? date(at(s.key), { day: 'numeric', month: 'short' }) : ''}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="card divide-y divide-slate-100">
          {o.items.map((it, i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <Img src={it.image} className="size-16 rounded-xl" />
              <div className="flex-1">
                <Link to={`/product/${it.productId}`} className="font-semibold hover:text-brand-600">{it.name}</Link>
                <div className="text-sm text-slate-500">{it.shopName && <Link to={`/artisans/${it.shopSlug}`} className="font-medium text-leaf-700 hover:underline">{it.shopName}</Link>} {[it.color, it.size].filter(Boolean).join(' · ')} · {money(it.price)} × {it.quantity}</div>
                {it.sellerId && o.fulfilment?.[it.sellerId] && o.status !== 'cancelled' && <div className="mt-1"><StatusBadge status={o.fulfilment[it.sellerId].status} /></div>}
              </div>
              <b>{money(it.price * it.quantity)}</b>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="card p-5 text-sm">
            <h4 className="mb-3 font-bold">Summary</h4>
            <div className="flex justify-between py-1"><span className="text-slate-500">Subtotal</span>{money(o.subtotal)}</div>
            <div className="flex justify-between py-1"><span className="text-slate-500">Shipping</span>{o.shipping ? money(o.shipping) : 'Free'}</div>
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-3 text-base font-bold"><span>Total</span>{money(o.total)}</div>
            <div className="mt-3 flex justify-between"><span className="text-slate-500">Payment</span><span>{PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod} · <StatusBadge status={o.paymentStatus} /></span></div>
          </div>
          <div className="card p-5 text-sm">
            <h4 className="mb-3 font-bold">Shipping to</h4>
            <p className="font-medium">{o.shippingAddress.fullName}</p>
            <p className="text-slate-500">{o.shippingAddress.address}, {o.shippingAddress.city} {o.shippingAddress.postalCode}</p>
            <p className="text-slate-500">{o.shippingAddress.district} District</p>
            <p className="text-slate-500">{o.shippingAddress.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Wishlist() {
  const { user } = useAuth();
  const { data, loading } = useFetch('/auth/me/wishlist', { params: { v: user.wishlist?.length } });
  const products = (data?.products || []).filter((p) => user.wishlist?.includes(p.id));
  if (!loading && !products.length)
    return <EmptyState icon={Heart} title="Your wishlist is empty" text="Tap the heart on any product to save it here." action={<Link to="/shop" className="btn-brand">Browse products</Link>} />;
  return <ProductGrid products={products} loading={loading} cols="grid-cols-2 md:grid-cols-3" count={3} />;
}
