import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Navbar';
import { BRAND } from '../../lib/brand';
import useFetch from '../../lib/useFetch';
import { FlagStripe } from '../decor';

const cols = [
  { title: 'Explore', links: [['New arrivals', '/shop?isNew=true'], ['Best sellers', '/shop?sort=popular'], ['Meet the artisans', '/artisans'], ['Sell with us', '/sell']] },
  { title: 'Help', links: [['My orders', '/account/orders'], ['Wishlist', '/account/wishlist'], ['Delivery & returns', '/'], ['Contact us', '/']] },
];

const linkClass = 'inline-block text-sm text-slate-400 transition hover:translate-x-1 hover:text-amber-300';

export default function Footer() {
  // Craft categories come from the database, so new categories added in the admin panel appear here automatically
  const { data } = useFetch('/categories');
  const categories = data?.categories || [];

  return (
    <footer className="relative mt-24 overflow-hidden bg-brand-950 text-slate-300">
      <FlagStripe className="!h-1.5 rounded-none" />
      <img src="/brand/emblem-light.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-10 -top-6 w-80 opacity-[0.05]" />
      <div className="container-x relative grid grid-cols-2 gap-x-6 gap-y-10 py-16 lg:grid-cols-6">
        <div className="col-span-2">
          <Logo light full />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">{BRAND.tagline} Every order supports an artisan family somewhere on the island.</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-amber-400" /> {BRAND.address}</li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-amber-400" />
              <a href={`tel:${BRAND.phoneLink}`} className="hover:text-amber-300">{BRAND.phone}</a>
              <span className="text-slate-600">·</span>
              <a href={`https://wa.me/${BRAND.phoneLink.replace('+', '')}`} target="_blank" rel="noreferrer" className="hover:text-amber-300">WhatsApp</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-amber-400" />
              <a href={`mailto:${BRAND.email}`} className="break-all hover:text-amber-300">{BRAND.email}</a>
            </li>
          </ul>
        </div>

        <div className="col-span-2">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Shop by craft</h4>
          <ul className="columns-2 gap-x-6 [&>li]:mb-2.5 [&>li]:break-inside-avoid">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.slug}`} className={linkClass}>{c.name}</Link>
              </li>
            ))}
          </ul>
          <Link to="/shop" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 transition hover:gap-2.5 hover:text-amber-300">
            View all crafts <ArrowRight className="size-4" />
          </Link>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className={linkClass}>{label}</Link>
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
              <span key={p} className="rounded-md border border-white/15 px-2 py-1 text-[11px] font-bold text-slate-300">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
