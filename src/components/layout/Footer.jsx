import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Navbar';
import { BRAND } from '../../lib/brand';
import { FlagStripe, Lotus } from '../decor';

const cols = [
  { title: 'Shop', links: [['All crafts', '/shop'], ['Batik', '/shop?category=batik'], ['Tea & spices', '/shop?category=tea-spices'], ['New arrivals', '/shop?isNew=true']] },
  { title: 'Artisans', links: [['Meet the artisans', '/artisans'], ['Sell with us', '/sell'], ['Seller dashboard', '/seller']] },
  { title: 'Help', links: [['My orders', '/account/orders'], ['Delivery & returns', '/'], ['Contact us', '/']] },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-slate-950 text-slate-300">
      <FlagStripe className="!h-1.5 rounded-none" />
      <Lotus className="pointer-events-none absolute -right-16 -top-10 size-96 text-white/[0.03]" strokeWidth={0.6} />
      <div className="container-x relative grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">{BRAND.tagline} Every order supports an artisan family somewhere on the island.</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2"><MapPin className="size-4 text-amber-400" /> {BRAND.address}</li>
            <li className="flex items-center gap-2"><Phone className="size-4 text-amber-400" /> {BRAND.phone}</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-amber-400" /> {BRAND.email}</li>
          </ul>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="inline-block text-sm text-slate-400 transition hover:translate-x-1 hover:text-amber-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. Proudly made in Sri Lanka 🇱🇰</p>
          <div className="flex items-center gap-2">
            {['Cash on delivery', 'Bank transfer', 'VISA', 'Mastercard'].map((p) => (
              <span key={p} className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-bold text-slate-400">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
