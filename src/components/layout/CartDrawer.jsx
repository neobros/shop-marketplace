import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FREE_SHIPPING_OVER, money } from '../../lib/format';
import { Img } from '../ui';

export function QtyControl({ value, onChange, max = 99, small }) {
  const s = small ? 'size-7' : 'size-9';
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
      <button className={`grid ${s} place-items-center rounded-full hover:bg-slate-100`} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease">
        <Minus className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-semibold">{value}</span>
      <button className={`grid ${s} place-items-center rounded-full hover:bg-slate-100 disabled:opacity-40`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export default function CartDrawer() {
  const { items, open, setOpen, update, remove, subtotal } = useCart();
  const left = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingBag className="size-5 text-brand-600" /> Your Cart
                <span className="badge bg-brand-50 text-brand-700">{items.length}</span>
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>

            {items.length > 0 && (
              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                <p className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                  <Truck className="size-4 text-brand-600" />
                  {left > 0 ? (
                    <>Add <b className="text-slate-900">{money(left)}</b> more for free shipping</>
                  ) : (
                    <b className="text-emerald-600">You unlocked free shipping! 🎉</b>
                  )}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-brand-500 to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="mb-4 grid size-20 place-items-center rounded-3xl bg-brand-50 text-brand-500"
                  >
                    <ShoppingBag className="size-9" />
                  </motion.div>
                  <h3 className="font-bold">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-slate-500">Looks like you haven't added anything yet.</p>
                  <Link to="/shop" onClick={() => setOpen(false)} className="btn-brand mt-5">
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.li
                        key={i.key}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60, height: 0, marginTop: 0 }}
                        className="flex gap-4"
                      >
                        <Img src={i.image} alt={i.name} className="size-20 shrink-0 rounded-xl" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-2 text-sm font-semibold">{i.name}</h4>
                            <button onClick={() => remove(i.key)} className="text-slate-400 hover:text-rose-500" aria-label="Remove">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          {(i.color || i.size) && (
                            <p className="text-xs text-slate-400">{[i.color, i.size].filter(Boolean).join(' · ')}</p>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QtyControl small value={i.quantity} max={i.stock} onChange={(q) => update(i.key, q)} />
                            <span className="font-bold">{money(i.price * i.quantity)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-slate-100 px-6 py-5">
                <div className="flex justify-between text-base">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold">{money(subtotal)}</span>
                </div>
                <p className="text-xs text-slate-400">Shipping calculated at checkout.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/cart" onClick={() => setOpen(false)} className="btn-outline">
                    View cart
                  </Link>
                  <Link to="/checkout" onClick={() => setOpen(false)} className="btn-brand">
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
