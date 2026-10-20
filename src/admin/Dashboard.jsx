import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { AlertTriangle, ArrowRight, Banknote, Check, MapPin, Package, RefreshCw, ShoppingCart, Store, Users } from 'lucide-react';
import useFetch from '../lib/useFetch';
import { date, money, shortMoney } from '../lib/format';
import { Img, PageLoader } from '../components/ui';
import StatusBadge, { STATUS_COLORS } from '../components/StatusBadge';
import { PageHeader, StatCard } from './components';

const RANGES = [7, 30, 90];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-xl">
      <div className="mb-1 font-semibold text-slate-900">{date(label, { day: 'numeric', month: 'short' })}</div>
      <div className="text-brand-600">Revenue: <b>{money(payload[0].value)}</b></div>
      {payload[0].payload.orders !== undefined && <div className="text-slate-500">Orders: <b>{payload[0].payload.orders}</b></div>}
    </div>
  );
}

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const { data, loading, reload } = useFetch('/admin/stats', { params: { days } });

  if (loading && !data) return <PageLoader />;
  if (!data) return <p className="text-slate-500">Could not load stats.</p>;
  const { totals, period, series, statusCounts, salesByCategory, topProducts, lowStock, recentOrders, sellers } = data;
  const statusTotal = statusCounts.reduce((s, x) => s + x.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Here's what's happening with your store."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              {RANGES.map((r) => (
                <button key={r} onClick={() => setDays(r)} className={`relative rounded-lg px-3.5 py-1.5 text-sm font-semibold ${days === r ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  {days === r && <motion.span layoutId="range" className="absolute inset-0 rounded-lg bg-slate-900" />}
                  <span className="relative">{r}d</span>
                </button>
              ))}
            </div>
            <button onClick={reload} className="btn-outline !p-2.5" aria-label="Refresh"><RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Revenue (${days}d)`} value={period.revenue} format={money} change={period.revenueChange} hint="vs previous period" icon={Banknote} tint="brand" />
        <StatCard label={`Orders (${days}d)`} value={period.orders} change={period.ordersChange} hint="vs previous period" icon={ShoppingCart} tint="emerald" delay={0.08} />
        <StatCard label="Customers" value={totals.customers} hint={`+${period.newCustomers} new in ${days}d`} icon={Users} tint="amber" delay={0.16} />
        <StatCard label="Platform commission" value={sellers.commissionEarned} format={money} hint={`${Math.round(sellers.commissionRate * 100)}% of artisan sales · ${sellers.approved} live shops`} icon={Store} tint="rose" delay={0.24} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold">
              Shop applications
              {sellers.pending > 0 && <span className="badge bg-amber-100 text-amber-800">{sellers.pending} waiting</span>}
            </h3>
            <Link to="/admin/sellers" className="flex items-center gap-1 text-sm font-semibold text-brand-600">Review <ArrowRight className="size-4" /></Link>
          </div>
          {sellers.pendingList.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-slate-500"><Check className="size-4 text-leaf-600" /> No pending applications.</p>
          ) : (
            <ul className="space-y-3">
              {sellers.pendingList.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl bg-amber-50/60 p-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-white font-display font-bold text-brand-700">{s.name[0]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.owner} · {s.craft} · {s.district}</div>
                  </div>
                  <span className="text-xs text-slate-400">{date(s.appliedAt, { day: 'numeric', month: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h3 className="mb-4 font-bold">Top artisans (all time)</h3>
          <ul className="space-y-3">
            {sellers.top.map((s, i) => {
              const max = sellers.top[0]?.revenue || 1;
              return (
                <li key={s.id}>
                  <Link to={`/artisans/${s.slug}`} target="_blank" className="flex items-center gap-3">
                    <Img src={s.logo} className="size-10 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between text-sm"><span className="truncate font-semibold">{s.name}</span><b>{shortMoney(s.revenue)}</b></div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div className="h-full rounded-full bg-linear-to-r from-brand-500 to-amber-400" initial={{ width: 0 }} animate={{ width: `${(s.revenue / max) * 100}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} />
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="size-3" /> {s.district}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 xl:col-span-2">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="font-bold">Revenue overview</h3>
              <p className="text-sm text-slate-500">All-time revenue <b className="text-slate-900">{money(totals.revenue)}</b></p>
            </div>
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <span className="relative flex size-2"><span className="absolute size-full animate-ping rounded-full bg-emerald-400" /><span className="relative size-2 rounded-full bg-emerald-500" /></span>
              Live
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -10, right: 8, top: 5 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b04424" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#b04424" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => date(d, { day: 'numeric', month: 'short' })} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis tickFormatter={shortMoney} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#f6c9b5', strokeDasharray: 4 }} />
                <Area type="monotone" dataKey="revenue" stroke="#b04424" strokeWidth={2.5} fill="url(#rev)" animationDuration={1200} activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="font-bold">Order status</h3>
          <p className="text-sm text-slate-500">{totals.orders} orders total</p>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusCounts.filter((s) => s.count)} dataKey="count" nameKey="status" innerRadius={60} outerRadius={85} paddingAngle={3} stroke="none" animationDuration={1000}>
                  {statusCounts.filter((s) => s.count).map((s) => <Cell key={s.status} fill={STATUS_COLORS[s.status]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div><div className="text-2xl font-extrabold">{statusTotal}</div><div className="text-xs text-slate-400">orders</div></div>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            {statusCounts.map((s) => (
              <div key={s.status} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] }} />
                <span className="flex-1 capitalize text-slate-600">{s.status}</span>
                <span className="font-semibold">{s.count}</span>
                <span className="w-10 text-right text-xs text-slate-400">{statusTotal ? Math.round((s.count / statusTotal) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-bold">Recent orders</h3>
            <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all">View all <ArrowRight className="size-4" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-6 py-3">Order</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-6 py-3.5 font-semibold"><Link to={`/admin/orders?open=${o.id}`} className="hover:text-brand-600">{o.orderNumber}</Link></td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-600">{o.customer?.name}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-500">{date(o.createdAt)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-3.5 text-right font-semibold">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h3 className="mb-4 font-bold">Top products</h3>
          <ul className="space-y-4">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-slate-300">{i + 1}</span>
                <Img src={p.image} className="size-11 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.sold} sold · {money(p.price)}</div>
                </div>
                <div className="text-sm font-bold">{shortMoney(p.sold * p.price)}</div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card p-6 xl:col-span-2">
          <h3 className="mb-4 font-bold">Sales by category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCategory} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b04424" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={shortMoney} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [money(v), 'Sales']} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="url(#bar)" radius={[8, 8, 0, 0]} maxBarSize={48} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold"><AlertTriangle className="size-4 text-amber-500" /> Low stock</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-500">All products are well stocked. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/products?edit=${p.id}`} className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50">
                    <Img src={p.image} className="size-10 rounded-lg" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className={`badge ${p.stock === 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'}`}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
