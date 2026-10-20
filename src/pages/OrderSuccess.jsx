import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import useFetch from '../lib/useFetch';
import { BRAND, PAYMENT_LABELS } from '../lib/brand';
import { money } from '../lib/format';

const confetti = Array.from({ length: 28 }, (_, i) => ({
  x: (Math.random() - 0.5) * 600,
  y: -200 - Math.random() * 250,
  r: Math.random() * 360,
  c: ['#155a3b', '#c48c22', '#23714d', '#e0bb61', '#0a2e1c'][i % 5],
  d: Math.random() * 0.3,
}));

export default function OrderSuccess() {
  const { id } = useParams();
  const { data } = useFetch(`/orders/${id}`);
  const order = data?.order;

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <div className="relative max-w-lg text-center">
        <div className="pointer-events-none absolute left-1/2 top-12">
          {confetti.map((p, i) => (
            <motion.span
              key={i}
              className="absolute size-2.5 rounded-sm"
              style={{ background: p.c }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: [p.y, 400], opacity: [1, 1, 0], rotate: p.r * 3 }}
              transition={{ duration: 2.4, delay: p.d, ease: 'easeOut' }}
            />
          ))}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.1 }}
          className="mx-auto grid size-24 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
            <Check className="size-12" strokeWidth={3} />
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h1 className="mt-8 text-4xl font-semibold">Bohoma sthuthi! Thank you 🙏</h1>
          <p className="mt-3 text-slate-500">
            Your order has been sent to the artisans. You'll get updates as each piece is prepared and shipped.
          </p>
          {order && (
            <div className="card mt-8 p-5 text-left text-sm">
              <div className="flex justify-between py-1"><span className="text-slate-500">Order number</span><b>{order.orderNumber}</b></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Items</span><b>{order.items.reduce((s, i) => s + i.quantity, 0)}</b></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Total</span><b>{money(order.total)}</b></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Payment</span><b>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</b></div>
            </div>
          )}
          {order?.paymentMethod === 'bank' && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left text-sm text-amber-900">
              <b>Bank transfer details</b>
              <p className="mt-2">{BRAND.bank.name} · {BRAND.bank.branch}<br />Account: <b>{BRAND.bank.account}</b><br />Name: {BRAND.bank.holder}</p>
              <p className="mt-2 text-xs">Please use <b>{order.orderNumber}</b> as the reference and WhatsApp the slip to {BRAND.whatsapp}.</p>
            </div>
          )}
          <div className="mt-8 flex justify-center gap-3">
            <Link to={`/account/orders/${id}`} className="btn-primary">Track order</Link>
            <Link to="/shop" className="btn-outline">Continue shopping</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
