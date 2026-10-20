import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Package, PackageCheck, Phone, ShoppingCart, Truck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { dateTime, money } from '../lib/format';
import { PAYMENT_LABELS } from '../lib/brand';
import { EmptyState, Img, Spinner } from '../components/ui';
import StatusBadge, { STATUS_COLORS } from '../components/StatusBadge';
import { PageHeader, SearchInput } from '../admin/components';

const FILTERS = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const NEXT = {
  pending: { status: 'processing', label: 'Start preparing', icon: Package },
  processing: { status: 'shipped', label: 'Mark as shipped', icon: Truck },
  shipped: { status: 'delivered', label: 'Mark as delivered', icon: PackageCheck },
};

export default function SellerOrders() {
  const { data, loading, setData } = useFetch('/seller/orders');
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState('');
  const orders = data?.orders || [];
  const list = orders.filter(
    (o) => (!filter || o.sellerStatus === filter) && (!q || `${o.orderNumber} ${o.customer?.name}`.toLowerCase().includes(q.toLowerCase()))
  );

  const advance = async (o) => {
    const next = NEXT[o.sellerStatus];
    setSaving(o.id);
    try {
      const res = await api.put(`/seller/orders/${o.id}/status`, { status: next.status });
      setData((d) => ({ ...d, orders: d.orders.map((x) => (x.id === o.id ? res.data.order : x)) }));
      toast.success(`Order ${next.status}`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving('');
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Only the items from your shop are shown. Update the status as you prepare and ship." action={<SearchInput value={q} onChange={setQ} placeholder="Order # or customer" />} />

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {FILTERS.map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)} className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${filter === s ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
            {filter === s && <motion.span layoutId="seller-order-filter" className="absolute inset-0 rounded-xl bg-leaf-700" />}
            {s && <span className="relative size-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />}
            <span className="relative">{s || 'All'}</span>
            <span className={`relative rounded-md px-1.5 text-xs ${filter === s ? 'bg-white/20' : 'bg-slate-100'}`}>{s ? orders.filter((o) => o.sellerStatus === s).length : orders.length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : !list.length ? (
        <EmptyState icon={ShoppingCart} title="No orders here" text="New orders for your products will appear here." />
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {list.map((o, i) => {
              const next = NEXT[o.sellerStatus];
              return (
                <motion.div key={o.id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
                    <b>{o.orderNumber}</b>
                    <span className="text-sm text-slate-400">{dateTime(o.createdAt)}</span>
                    <StatusBadge status={o.sellerStatus} />
                    {o.otherSellers > 0 && <span className="badge bg-slate-100 text-slate-500"><Users className="size-3" /> +{o.otherSellers} other artisan{o.otherSellers > 1 ? 's' : ''}</span>}
                    <span className="ml-auto text-sm">{PAYMENT_LABELS[o.paymentMethod]} · <StatusBadge status={o.paymentStatus} /></span>
                  </div>
                  <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px_220px]">
                    <div className="space-y-3">
                      {o.items.map((it, k) => (
                        <div key={k} className="flex items-center gap-3">
                          <Img src={it.image} className="size-14 rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{it.name}</div>
                            <div className="text-xs text-slate-400">{[it.color, it.size].filter(Boolean).join(' · ')} {money(it.price)} × {it.quantity}</div>
                          </div>
                          <b className="text-sm">{money(it.price * it.quantity)}</b>
                        </div>
                      ))}
                      {o.note && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800"><b>Note:</b> {o.note}</p>}
                    </div>
                    <div className="rounded-2xl bg-cream p-4 text-sm">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Ship to</div>
                      <p className="font-semibold">{o.shippingAddress?.fullName}</p>
                      <p className="flex items-start gap-1 text-slate-600"><MapPin className="mt-0.5 size-3.5 shrink-0" /> {o.shippingAddress?.address}, {o.shippingAddress?.city}, {o.shippingAddress?.district}</p>
                      <p className="flex items-center gap-1 text-slate-600"><Phone className="size-3.5" /> {o.shippingAddress?.phone}</p>
                    </div>
                    <div className="flex flex-col justify-between gap-3">
                      <div className="text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Items</span>{money(o.subtotal)}</div>
                        <div className="flex justify-between text-slate-500"><span>Platform fee</span>- {money(o.commission)}</div>
                        <div className="mt-1 flex justify-between border-t border-slate-100 pt-1 font-bold"><span>You earn</span><span className="text-leaf-700">{money(o.earnings)}</span></div>
                      </div>
                      {next && o.status !== 'cancelled' && (
                        <button disabled={saving === o.id} onClick={() => advance(o)} className="btn-leaf w-full">
                          {saving === o.id ? <Spinner className="size-4" /> : <next.icon className="size-4" />} {next.label}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
