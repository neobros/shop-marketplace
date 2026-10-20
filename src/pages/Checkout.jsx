import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Banknote, Landmark, Lock, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api, { errMsg } from '../lib/api';
import { money } from '../lib/format';
import { BRAND, DISTRICTS } from '../lib/brand';
import { Img, Spinner } from '../components/ui';
import { OrderSummary } from './Cart';

const PAYMENTS = [
  { key: 'cod', label: 'Cash on delivery', text: 'Pay the courier when your order arrives', icon: Banknote },
  { key: 'bank', label: 'Bank transfer', text: `Transfer to ${BRAND.bank.name} after ordering`, icon: Landmark },
];

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, shipping, total, clear } = useCart();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [payment, setPayment] = useState('cod');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.address?.address || '',
    city: user?.address?.city || '',
    district: user?.address?.district || 'Colombo',
    postalCode: user?.address?.postalCode || '',
    note: '',
  });

  if (!items.length) return <Navigate to="/cart" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const shops = [...new Set(items.map((i) => i.shopName).filter(Boolean))];

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { note, ...shippingAddress } = form;
      const { data } = await api.post('/orders', {
        items: items.map(({ productId, quantity, color, size }) => ({ productId, quantity, color, size })),
        shippingAddress: { ...shippingAddress, country: 'Sri Lanka' },
        paymentMethod: payment,
        note,
      });
      clear();
      navigate(`/order-success/${data.order.id}`, { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-x py-10">
      <h1 className="mb-8 text-4xl font-semibold">Checkout</h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h3 className="mb-5 flex items-center gap-3 text-lg font-bold">
              <span className="grid size-7 place-items-center rounded-full bg-brand-600 text-sm text-white">1</span> Delivery details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.fullName} onChange={set('fullName')} required />
              <Field label="Mobile number" value={form.phone} onChange={set('phone')} required placeholder="07X XXX XXXX" />
              <Field label="Address" value={form.address} onChange={set('address')} required className="sm:col-span-2" placeholder="House no., street, area" />
              <Field label="City / town" value={form.city} onChange={set('city')} required />
              <div>
                <label className="label">District</label>
                <select className="input" value={form.district} onChange={set('district')} required>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <Field label="Postal code" value={form.postalCode} onChange={set('postalCode')} />
              <div className="sm:col-span-2">
                <label className="label">Note for the artisan / courier (optional)</label>
                <textarea rows={3} value={form.note} onChange={set('note')} className="input" placeholder="Gift message, landmark, best time to call…" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h3 className="mb-5 flex items-center gap-3 text-lg font-bold">
              <span className="grid size-7 place-items-center rounded-full bg-brand-600 text-sm text-white">2</span> Payment method
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENTS.map(({ key, label, text, icon: Icon }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setPayment(key)}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${payment === key ? 'border-brand-500 bg-brand-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <Icon className={`size-6 ${payment === key ? 'text-brand-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-slate-500">{text}</div>
                  </div>
                </button>
              ))}
            </div>
            {shops.length > 1 && (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-leaf-50 p-3 text-xs text-leaf-800">
                <Store className="size-4 shrink-0" /> Your order includes pieces from {shops.length} artisans — they may arrive in separate parcels.
              </p>
            )}
          </motion.div>
        </div>

        <OrderSummary subtotal={subtotal} shipping={shipping} total={total}>
          <ul className="mt-5 max-h-64 space-y-3 overflow-y-auto border-t border-slate-100 pt-5">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <div className="relative">
                  <Img src={i.image} className="size-14 rounded-xl" />
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{i.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.name}</div>
                  <div className="truncate text-xs text-slate-400">{[i.shopName, i.color, i.size].filter(Boolean).join(' · ')}</div>
                </div>
                <span className="text-sm font-semibold">{money(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <button disabled={saving} className="btn-brand mt-6 w-full !py-3.5">
            {saving ? <Spinner className="size-4" /> : <Lock className="size-4" />} Place order · {money(total)}
          </button>
          <Link to="/cart" className="mt-3 block text-center text-sm font-semibold text-slate-500 hover:text-brand-600">Back to cart</Link>
        </OrderSummary>
      </form>
    </div>
  );
}

function Field({ label, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}
