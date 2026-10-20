import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, ClipboardList, Hourglass, LayoutDashboard, Package, Store, Truck, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../lib/api';
import { COMMISSION_RATE, DISTRICTS } from '../lib/brand';
import { Reveal, SectionTitle, Spinner } from '../components/ui';
import { FlagStripe, Lotus, Mandala } from '../components/decor';

const CRAFTS = ['Batik', 'Handloom & clothing', 'Pottery & terracotta', 'Crochet & lace', 'Coconut shell crafts', 'Jewellery & gems', 'Masks & wood carving', 'Paintings & art', 'Tea & spices', 'Lacquer, brass & décor', 'Other handmade'];

const STEPS = [
  { icon: ClipboardList, title: 'Apply', text: 'Tell us about your craft and workshop. It takes 3 minutes.' },
  { icon: BadgeCheck, title: 'Get verified', text: 'Our team reviews every shop to keep the marketplace 100% handmade.' },
  { icon: Package, title: 'List products', text: 'Add photos, prices and stock from your seller dashboard.' },
  { icon: Truck, title: 'Sell & get paid', text: `Ship orders island-wide. You keep ${Math.round((1 - COMMISSION_RATE) * 100)}% of every sale.` },
];

export default function SellWithUs() {
  const { user, register, setUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    accName: '', email: '', password: '',
    name: '', craft: CRAFTS[0], district: 'Colombo', phone: user?.phone || '', tagline: '', bio: '', logo: '', banner: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const status = user?.shop?.status;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!user) await register({ name: form.accName, email: form.email, password: form.password });
      const { accName, email, password, ...shop } = form;
      const { data } = await api.post('/sellers/apply', shop);
      setUser(data.user);
      toast.success('Application sent! We will review it shortly.');
      navigate('/seller');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-leaf-800 text-white">
        <Mandala className="pointer-events-none absolute -right-32 -top-32 size-[560px] text-white/10" />
        <div className="container-x relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="badge mb-4 bg-white/15 text-leaf-100"><Store className="size-3.5" /> Sell with us</span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-semibold leading-tight sm:text-6xl">
              Your craft deserves a bigger stage
            </motion.h1>
            <FlagStripe className="mt-6 w-28" />
            <p className="mt-6 max-w-lg text-lg text-white/75">
              Open a free shop on Sri Lanka’s marketplace for handmade products. Reach customers in every district — and beyond.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="btn bg-amber-400 !px-7 !py-3.5 text-slate-900 hover:bg-amber-300">Apply now</a>
              {user?.role === 'seller' && <Link to="/seller" className="btn border border-white/30 !px-7 !py-3.5 text-white hover:bg-white/10"><LayoutDashboard className="size-4" /> Seller dashboard</Link>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Rs 0', 'to open a shop'],
              [`${Math.round(COMMISSION_RATE * 100)}%`, 'only when you sell'],
              ['25', 'districts we deliver to'],
              ['24h', 'typical approval time'],
            ].map(([v, l], i) => (
              <motion.div key={l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="rounded-3xl bg-white/10 p-6 backdrop-blur">
                <div className="font-display text-4xl font-bold text-amber-300">{v}</div>
                <div className="mt-1 text-sm text-white/70">{l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x mt-20">
        <SectionTitle center eyebrow="How it works" title="Four simple steps" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="relative h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
                <span className="absolute right-5 top-4 font-display text-5xl font-bold text-brand-100">{i + 1}</span>
                <div className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="size-5" /></div>
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="apply" className="container-x mt-20 scroll-mt-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600"><Lotus className="size-4" /> Application</span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Open your artisan shop</h2>
            <p className="mt-3 text-slate-600">We review applications within 1–2 working days. You can add products as soon as your shop is approved.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><BadgeCheck className="size-5 shrink-0 text-leaf-600" /> Products must be handmade or hand-finished in Sri Lanka</li>
              <li className="flex gap-2"><BadgeCheck className="size-5 shrink-0 text-leaf-600" /> Clear photos of your real products</li>
              <li className="flex gap-2"><Wallet className="size-5 shrink-0 text-leaf-600" /> Payouts to any Sri Lankan bank account</li>
            </ul>
          </div>

          {status === 'pending' || status === 'approved' || status === 'suspended' ? (
            <div className="card flex flex-col items-center p-10 text-center">
              <div className="grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600">{status === 'approved' ? <Store className="size-7" /> : <Hourglass className="size-7" />}</div>
              <h3 className="mt-4 font-display text-2xl font-semibold">
                {status === 'approved' ? 'Your shop is live!' : status === 'pending' ? 'Application under review' : 'Shop suspended'}
              </h3>
              <p className="mt-2 text-slate-500">{user.shop.name}</p>
              <Link to="/seller" className="btn-primary mt-6"><LayoutDashboard className="size-4" /> Go to seller dashboard</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
              {status === 'rejected' && (
                <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
                  Your previous application was not approved{user.shop.note ? `: ${user.shop.note}` : '.'} You can update the details and apply again.
                </div>
              )}
              {!user && (
                <fieldset className="grid gap-4 rounded-2xl bg-cream p-4 sm:grid-cols-3">
                  <legend className="px-1 text-sm font-bold text-slate-700">1. Your account <Link to="/login" state={{ from: '/sell' }} className="ml-2 font-medium text-brand-600">Already registered? Sign in</Link></legend>
                  <div><label className="label">Your name</label><input className="input" required value={form.accName} onChange={set('accName')} /></div>
                  <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={set('email')} /></div>
                  <div><label className="label">Password</label><input type="password" minLength={6} className="input" required value={form.password} onChange={set('password')} /></div>
                </fieldset>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 text-sm font-bold text-slate-700">{user ? 'Shop details' : '2. Shop details'}</div>
                <div><label className="label">Shop name *</label><input className="input" required value={form.name} onChange={set('name')} placeholder="e.g. Kandyan Batik House" /></div>
                <div>
                  <label className="label">Main craft *</label>
                  <select className="input" value={form.craft} onChange={set('craft')}>{CRAFTS.map((c) => <option key={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label className="label">District *</label>
                  <select className="input" value={form.district} onChange={set('district')}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
                </div>
                <div><label className="label">Phone / WhatsApp *</label><input className="input" required value={form.phone} onChange={set('phone')} placeholder="07X XXX XXXX" /></div>
                <div className="sm:col-span-2"><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={set('tagline')} placeholder="Hand-waxed batik since 1987" /></div>
                <div className="sm:col-span-2"><label className="label">Your story</label><textarea rows={4} className="input" value={form.bio} onChange={set('bio')} placeholder="Who you are, how you make your products, what makes them special…" /></div>
                <div><label className="label">Logo image URL</label><input className="input" value={form.logo} onChange={set('logo')} placeholder="https://…" /></div>
                <div><label className="label">Cover image URL</label><input className="input" value={form.banner} onChange={set('banner')} placeholder="https://…" /></div>
              </div>
              <button disabled={saving} className="btn-brand w-full !py-3.5">{saving && <Spinner className="size-4" />} Submit application</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
