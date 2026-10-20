import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowRight, ExternalLink, Package, RefreshCw, ShoppingCart, Star, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useFetch from '../lib/useFetch';
import { date, money, shortMoney } from '../lib/format';
import { Img, PageLoader, Stars } from '../components/ui';
import StatusBadge from '../components/StatusBadge';
import { PageHeader, StatCard } from '../admin/components';

const RANGES = [7, 30, 90];

export default function SellerDashboard() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);
  const { data, loading, reload } = useFetch('/seller/stats', { params: { days } });

  if (loading && !data) return <PageLoader />;
  if (!data) return <p className="text-slate-500">Could not load your stats.</p>;
  const { totals, period, series, topProducts, lowStock, recentOrders, recentReviews, toFulfil, commissionRate } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ayubowan, ${user.name.split(' ')[0]} 🙏`}
        subtitle={`Here's how ${user.shop?.name} is doing.`}
        action={
          <div className="flex items-center gap-2">
            {user.shop?.status === 'approved' && <Link to={`/artisans/${user.shop.slug}`} target="_blank" className="btn-outline !py-2"><ExternalLink className="size-4" /> My shop page</Link>}
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              {RANGES.map((r) => (
                <button key={r} onClick={() => setDays(r)} className={`relative rounded-lg px-3.5 py-1.5 text-sm font-semibold ${days === r ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  {days === r && <motion.span layoutId="seller-range" className="absolute inset-0 rounded-lg bg-leaf-700" />}
                  <span className="relative">{r}d</span>
                </button>
              ))}
            </div>
            <button onClick={reload} className="btn-outline !p-2.5" aria-label="Refresh"><RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        }
      />

      {toFulfil > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Link to="/seller/orders" className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200 transition hover:bg-amber-100">
            <span className="relative flex size-3"><span className="absolute size-full animate-ping rounded-full bg-amber-400" /><span className="relative size-3 rounded-full bg-amber-500" /></span>
            <b>{toFulfil} order{toFulfil > 1 ? 's' : ''}</b> waiting to be prepared or shipped
            <ArrowRight className="ml-auto size-4" />
          </Link>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Sales (${days}d)`} value={period.revenue} format={money} change={period.revenueChange} hint="vs previous period" icon={ShoppingCart} tint="emerald" />
        <StatCard label="Your earnings (all time)" value={totals.earnings} format={money} hint={`after ${Math.round(commissionRate * 100)}% fee`} icon={Wallet} tint="brand" delay={0.08} />
        <StatCard label="Pending payout" value={totals.pendingPayout} format={money} hint="orders not yet delivered" icon={Wallet} tint="amber" delay={0.16} />
        <StatCard label="Shop rating" value={totals.rating} format={(n) => n.toFixed(1)} hint={`${totals.reviews} reviews · ${totals.activeProducts} live products`} icon={Star} tint="rose" delay={0.24} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 xl:col-span-2">
          <h3 className="font-bold">Sales overview</h3>
          <p className="mb-6 text-sm text-slate-500">{period.orders} orders in the last {days} days</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -10, right: 8, top: 5 }}>
                <defs>
                  <linearGradient id="sellerRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3f8453" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3f8453" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f5f5f4" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => date(d, { day: 'numeric', month: 'short' })} tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tickFormatter={shortMoney} tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(v) => [money(v), 'Sales']} labelFormatter={(d) => date(d)} />
                <Area type="monotone" dataKey="revenue" stroke="#2f6a41" strokeWidth={2.5} fill="url(#sellerRev)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="mb-4 font-bold">Best sellers</h3>
          {topProducts.length === 0 ? <p className="text-sm text-slate-500">No sales yet.</p> : (
            <ul className="space-y-4">
              {topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-bold text-slate-300">{i + 1}</span>
                  <Img src={p.image} className="size-11 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.sold} sold · {p.stock} in stock</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-bold">Recent orders</h3>
            <Link to="/seller/orders" className="flex items-center gap-1 text-sm font-semibold text-leaf-700">View all <ArrowRight className="size-4" /></Link>
          </div>
          {recentOrders.length === 0 ? <p className="px-6 pb-6 text-sm text-slate-500">No orders yet — share your shop link to get started!</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr><th className="px-6 py-3">Order</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Your share</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="whitespace-nowrap px-6 py-3.5 font-semibold">{o.orderNumber}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-slate-600">{o.customer?.name}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-slate-500">{date(o.createdAt)}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={o.sellerStatus} /></td>
                      <td className="px-6 py-3.5 text-right font-semibold">{money(o.earnings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold"><AlertTriangle className="size-4 text-amber-500" /> Low stock</h3>
            {lowStock.length === 0 ? <p className="text-sm text-slate-500">All products are well stocked.</p> : (
              <ul className="space-y-3">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <Link to={`/seller/products?edit=${p.id}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-50">
                      <Img src={p.image} className="size-10 rounded-lg" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                      <span className={`badge ${p.stock === 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'}`}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card p-6">
            <h3 className="mb-4 font-bold">Latest reviews</h3>
            {recentReviews.length === 0 ? <p className="text-sm text-slate-500">No reviews yet.</p> : (
              <ul className="space-y-4">
                {recentReviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="flex items-center justify-between"><b>{r.userName}</b><Stars value={r.rating} size="size-3" /></div>
                    {r.comment && <p className="mt-1 line-clamp-2 text-slate-500">“{r.comment}”</p>}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>

      {totals.products === 0 && (
        <div className="card flex flex-col items-center p-10 text-center">
          <Package className="size-10 text-leaf-600" />
          <h3 className="mt-3 text-xl font-semibold">Add your first product</h3>
          <p className="mt-1 text-sm text-slate-500">Great photos and a short story about how it's made help your pieces sell.</p>
          <Link to="/seller/products" className="btn-leaf mt-5">Add product</Link>
        </div>
      )}
    </div>
  );
}
