import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Phone, ShoppingCart, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { dateTime, money } from '../lib/format';
import { PAYMENT_LABELS } from '../lib/brand';
import { EmptyState, Img, Spinner } from '../components/ui';
import StatusBadge, { STATUS_COLORS } from '../components/StatusBadge';
import { PageHeader, SearchInput, SkeletonRows, Table } from './components';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const { data, loading, reload, setData } = useFetch('/orders');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(params.get('open'));

  useEffect(() => {
    if (params.get('open')) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orders = data?.orders || [];
  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length])), [orders]);
  const list = orders.filter(
    (o) =>
      (!status || o.status === status) &&
      (!q || `${o.orderNumber} ${o.customer?.name} ${o.customer?.email}`.toLowerCase().includes(q.toLowerCase()))
  );
  const open = orders.find((o) => o.id === openId);

  const onUpdated = (order) => setData((d) => ({ ...d, orders: d.orders.map((o) => (o.id === order.id ? order : o)) }));

  return (
    <div>
      <PageHeader title="Orders" subtitle="Manage and fulfil customer orders" action={<SearchInput value={q} onChange={setQ} placeholder="Order #, customer…" />} />

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {[['', 'All', orders.length], ...STATUSES.map((s) => [s, s, counts[s]])].map(([key, label, n]) => (
          <button
            key={label}
            onClick={() => setStatus(key)}
            className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${status === key ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'}`}
          >
            {status === key && <motion.span layoutId="order-filter" className="absolute inset-0 rounded-xl bg-slate-900" />}
            {key && <span className="relative size-2 rounded-full" style={{ background: STATUS_COLORS[key] }} />}
            <span className="relative">{label}</span>
            <span className={`relative rounded-md px-1.5 text-xs ${status === key ? 'bg-white/20' : 'bg-slate-100'}`}>{n}</span>
          </button>
        ))}
      </div>

      <Table
        head={['Order', 'Customer', 'Date', 'Items', 'Payment', 'Status', { label: 'Total', className: 'text-right' }]}
        empty={!loading && !list.length && <div className="p-6"><EmptyState icon={ShoppingCart} title="No orders found" /></div>}
      >
        {loading ? (
          <SkeletonRows cols={7} />
        ) : (
          list.map((o) => (
            <tr key={o.id} onClick={() => setOpenId(o.id)} className="cursor-pointer transition hover:bg-brand-50/40">
              <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-900">{o.orderNumber}</td>
              <td className="px-5 py-3.5">
                <div className="font-medium">{o.customer?.name}</div>
                <div className="text-xs text-slate-400">{o.customer?.email}</div>
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{dateTime(o.createdAt)}</td>
              <td className="px-5 py-3.5">
                <div className="flex -space-x-2">
                  {o.items.slice(0, 3).map((it, i) => <Img key={i} src={it.image} className="size-8 rounded-lg ring-2 ring-white" />)}
                  {o.items.length > 3 && <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-xs font-semibold ring-2 ring-white">+{o.items.length - 3}</span>}
                </div>
              </td>
              <td className="px-5 py-3.5"><span className="mr-2 text-xs text-slate-500">{PAYMENT_LABELS[o.paymentMethod]}</span><StatusBadge status={o.paymentStatus} /></td>
              <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
              <td className="whitespace-nowrap px-5 py-3.5 text-right font-bold">{money(o.total)}</td>
            </tr>
          ))
        )}
      </Table>

      <OrderDrawer order={open} onClose={() => setOpenId(null)} onUpdated={onUpdated} reload={reload} />
    </div>
  );
}

function OrderDrawer({ order: o, onClose, onUpdated }) {
  const [saving, setSaving] = useState('');

  const update = async (body, key) => {
    setSaving(key);
    try {
      const { data } = await api.put(`/orders/${o.id}/status`, body);
      onUpdated(data.order);
      toast.success('Order updated');
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving('');
    }
  };

  return (
    <AnimatePresence>
      {o && (
        <>
          <motion.div className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-xl flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-extrabold">{o.orderNumber}</h3>
                <p className="text-sm text-slate-500">{dateTime(o.createdAt)}</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X className="size-5" /></button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Order status</h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={!!saving || o.status === s || o.status === 'cancelled'}
                      onClick={() => {
                        if (s === 'cancelled' && !confirm('Cancel this order? Stock will be restored.')) return;
                        update({ status: s }, s);
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold capitalize transition disabled:cursor-not-allowed ${
                        o.status === s ? 'border-transparent text-white shadow-lg' : 'border-slate-100 text-slate-600 hover:border-slate-200 disabled:opacity-40'
                      }`}
                      style={o.status === s ? { background: STATUS_COLORS[s] } : undefined}
                    >
                      {saving === s ? <Spinner className="size-4" /> : <span className="size-2 rounded-full" style={{ background: o.status === s ? '#fff' : STATUS_COLORS[s] }} />}
                      {s}
                    </button>
                  ))}
                </div>
                {o.status === 'cancelled' && <p className="mt-2 text-xs text-slate-400">Cancelled orders can't be reopened.</p>}
              </section>

              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Payment</h4>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm">
                    <span className="font-semibold">{PAYMENT_LABELS[o.paymentMethod]}</span> · <StatusBadge status={o.paymentStatus} />
                  </div>
                  <button
                    disabled={!!saving}
                    onClick={() => update({ paymentStatus: o.paymentStatus === 'paid' ? 'unpaid' : 'paid' }, 'pay')}
                    className="btn-outline !px-3 !py-1.5 text-xs"
                  >
                    {saving === 'pay' && <Spinner className="size-3" />} Mark as {o.paymentStatus === 'paid' ? 'unpaid' : 'paid'}
                  </button>
                </div>
              </section>

              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Items</h4>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Img src={it.image} className="size-12 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{it.name}</div>
                        <div className="text-xs text-slate-400">{it.shopName && <span className="font-medium text-leaf-700">{it.shopName} · </span>}{[it.color, it.size].filter(Boolean).join(' · ')} {money(it.price)} × {it.quantity}</div>
                        {it.sellerId && o.fulfilment?.[it.sellerId] && <div className="mt-1"><StatusBadge status={o.fulfilment[it.sellerId].status} /></div>}
                      </div>
                      <b className="text-sm">{money(it.price * it.quantity)}</b>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Subtotal</span>{money(o.subtotal)}</div>
                  <div className="flex justify-between"><span className="text-slate-500">Shipping</span>{o.shipping ? money(o.shipping) : 'Free'}</div>
                  <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span>{money(o.total)}</div>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-4 text-sm">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Customer</h4>
                  <p className="font-semibold">{o.customer?.name}</p>
                  <p className="text-slate-500">{o.customer?.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4 text-sm">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Ship to</h4>
                  <p className="font-semibold">{o.shippingAddress?.fullName}</p>
                  <p className="flex items-start gap-1 text-slate-500"><MapPin className="mt-0.5 size-3.5 shrink-0" />{o.shippingAddress?.address}, {o.shippingAddress?.city}, {o.shippingAddress?.district}</p>
                  <p className="flex items-center gap-1 text-slate-500"><Phone className="size-3.5" />{o.shippingAddress?.phone}</p>
                </div>
              </section>

              {o.note && (
                <section className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                  <b>Customer note:</b> {o.note}
                </section>
              )}

              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">History</h4>
                <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
                  {[...(o.statusHistory || [])].reverse().map((h, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-white" style={{ background: STATUS_COLORS[h.status] }} />
                      <div className="text-sm font-semibold capitalize">{h.status}</div>
                      <div className="text-xs text-slate-400">{dateTime(h.at)}</div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
