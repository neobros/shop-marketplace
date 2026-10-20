import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { money } from '../lib/format';
import { EmptyState, Img } from '../components/ui';
import { QtyControl } from '../components/layout/CartDrawer';

export function OrderSummary({ children, subtotal, shipping, total }) {
  return (
    <div className="card h-fit p-6 lg:sticky lg:top-28">
      <h3 className="text-lg font-bold">Order summary</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{money(subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Shipping</dt>
          <dd className="font-semibold">{shipping === 0 ? <span className="text-emerald-600">Free</span> : money(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-dashed border-slate-200 pt-4 text-base">
          <dt className="font-bold">Total</dt><dd className="text-xl font-extrabold">{money(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}

export default function Cart() {
  const { items, update, remove, clear, subtotal, shipping, total } = useCart();

  if (!items.length)
    return (
      <div className="container-x py-20">
        <EmptyState icon={ShoppingCart} title="Your cart is empty" text="Browse the shop and add something you love." action={<Link to="/shop" className="btn-brand">Start shopping</Link>} />
      </div>
    );

  return (
    <div className="container-x py-10">
      <div className="mb-8 flex items-end justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Shopping cart</h1>
        <button onClick={clear} className="text-sm font-semibold text-slate-400 hover:text-rose-500">Clear cart</button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card divide-y divide-slate-100">
          <AnimatePresence initial={false}>
            {items.map((i) => (
              <motion.div key={i.key} layout exit={{ opacity: 0, x: -40 }} className="flex gap-4 p-5 sm:gap-6">
                <Link to={`/product/${i.productId}`}><Img src={i.image} alt={i.name} className="size-24 rounded-2xl sm:size-28" /></Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link to={`/product/${i.productId}`} className="font-semibold hover:text-brand-600">{i.name}</Link>
                      {(i.color || i.size) && <p className="mt-0.5 text-sm text-slate-400">{[i.color, i.size].filter(Boolean).join(' · ')}</p>}
                      <p className="mt-1 text-sm text-slate-500">{money(i.price)} each</p>
                    </div>
                    <span className="text-lg font-bold">{money(i.price * i.quantity)}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QtyControl value={i.quantity} max={i.stock} onChange={(q) => update(i.key, q)} />
                    <button onClick={() => remove(i.key)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-rose-500">
                      <Trash2 className="size-4" /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <OrderSummary subtotal={subtotal} shipping={shipping} total={total}>
          <Link to="/checkout" className="btn-brand group mt-6 w-full !py-3.5">
            Proceed to checkout <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
          <Link to="/shop" className="mt-3 block text-center text-sm font-semibold text-slate-500 hover:text-brand-600">Continue shopping</Link>
        </OrderSummary>
      </div>
    </div>
  );
}
