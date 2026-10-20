import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, motion, useInView } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, Banknote, Clock, Flame, Gift, HandHeart, MapPin, Star, Store, Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Img, Reveal, SectionTitle } from '../ui';
import { money, discountPct } from '../../lib/format';
import { categoryIcon } from '../../lib/icons';
import { COMMISSION_RATE } from '../../lib/brand';
import { FlagStripe, Lotus, Mandala } from '../decor';

export function FeatureStrip() {
  const items = [
    { icon: BadgeCheck, title: '100% Handmade', text: 'Verified Sri Lankan artisans' },
    { icon: Truck, title: 'Island-wide Delivery', text: 'Free over Rs 15,000' },
    { icon: Banknote, title: 'Cash on Delivery', text: 'Or pay by bank transfer' },
    { icon: HandHeart, title: 'Fair to Makers', text: 'Most of every sale goes to them' },
  ];
  return (
    <section className="container-x mt-10">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-soft sm:p-5">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-all duration-300 group-hover:rotate-6 group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="size-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{title}</div>
                <div className="text-xs text-slate-500">{text}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Round craft "badges" — fits all 9 categories in one row on desktop. */
export function CategoryCircles({ categories = [] }) {
  if (!categories.length) return null;
  return (
    <section className="container-x mt-20">
      <SectionTitle center eyebrow="Explore" title="Shop by craft" subtitle="Traditions passed down through generations, from every corner of the island." />
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-5 lg:grid-cols-9">
        {categories.map((c, i) => {
          const Icon = categoryIcon(c.icon);
          return (
            <Reveal key={c.id} delay={i * 0.05}>
              <Link to={`/shop?category=${c.slug}`} className="group flex flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute -inset-1.5 rounded-full border-2 border-dashed border-brand-200 transition-all duration-700 group-hover:rotate-180 group-hover:border-brand-400" />
                  <Img src={c.image} alt={c.name} className="size-24 rounded-full sm:size-28" imgClassName="transition-transform duration-700 group-hover:scale-115" />
                  <span className="absolute -bottom-1 right-0 grid size-8 place-items-center rounded-full bg-white text-brand-600 shadow-md ring-2 ring-white transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-4" />
                  </span>
                </div>
                <div className="mt-4 text-sm font-semibold text-slate-800 group-hover:text-brand-700">{c.name}</div>
                <div className="text-xs text-slate-400">{c.productCount} items</div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function PromoBanners({ banners = [] }) {
  if (!banners.length) return null;
  return (
    <section className="container-x mt-20 grid gap-5 md:grid-cols-2">
      {banners.slice(0, 2).map((b, i) => (
        <Reveal key={b.id} delay={i * 0.12}>
          <Link to={b.link || '/shop'} className="group relative flex min-h-[280px] overflow-hidden rounded-[2rem] p-8 sm:p-10" style={{ background: b.bgColor || '#f4ead9' }}>
            <div className="bg-pattern pointer-events-none absolute inset-0" />
            <img
              src={b.image}
              alt=""
              className="absolute inset-y-0 right-0 h-full w-[55%] object-cover transition-transform duration-700 [mask-image:linear-gradient(to_right,transparent,black_35%)] group-hover:scale-110"
            />
            <div className="relative z-10 flex max-w-[55%] flex-col items-start">
              {b.tag && <span className="badge mb-3 bg-white/85 text-brand-700">{b.tag}</span>}
              <h3 className="font-display text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl" style={{ color: b.textColor || undefined }}>{b.title}</h3>
              {b.subtitle && <p className="mt-2 text-sm text-slate-600">{b.subtitle}</p>}
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-slate-900">
                {b.buttonText || 'Shop now'}
                <span className="grid size-8 place-items-center rounded-full bg-slate-900 text-white transition-all group-hover:translate-x-1 group-hover:bg-brand-600">
                  <ArrowRight className="size-4" />
                </span>
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </section>
  );
}

function useCountdown(target) {
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.floor(left / 1000);
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function TimeBox({ value, label }) {
  const v = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white/10 text-3xl font-bold tabular-nums backdrop-blur sm:h-20 sm:w-20 sm:text-4xl">
        <motion.span key={v} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', damping: 15 }}>{v}</motion.span>
      </div>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-white/60">{label}</span>
    </div>
  );
}

/** Live countdown "artisan deal of the day" — resets at midnight. */
export function DealOfTheDay({ product }) {
  const [end] = useState(() => {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  });
  const { h, m, s } = useCountdown(end);
  if (!product) return null;
  const off = discountPct(product.price, product.comparePrice);
  const soldPct = Math.min(92, 35 + ((product.sold || 0) % 55));

  return (
    <section className="container-x mt-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-900 text-white">
          <Mandala className="pointer-events-none absolute -right-32 -top-32 size-[520px] text-amber-300/10" />
          <div className="pointer-events-none absolute -bottom-32 left-10 size-96 animate-blob rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <span className="badge mb-4 bg-amber-400/20 text-amber-200"><Flame className="size-3.5" /> Artisan deal of the day</span>
              <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">{product.name}</h2>
              {product.shopName && (
                <p className="mt-3 flex items-center gap-2 text-white/70"><Store className="size-4" /> {product.shopName} · {product.district}</p>
              )}
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold">{money(product.price)}</span>
                {off > 0 && (
                  <>
                    <span className="text-lg text-white/40 line-through">{money(product.comparePrice)}</span>
                    <span className="badge bg-leaf-400/20 text-leaf-200">Save {off}%</span>
                  </>
                )}
              </div>
              <div className="mt-7 flex items-center gap-3 text-sm text-white/60"><Clock className="size-5" /> Offer ends in</div>
              <div className="mt-3 flex gap-3">
                <TimeBox value={h} label="Hours" />
                <TimeBox value={m} label="Mins" />
                <TimeBox value={s} label="Secs" />
              </div>
              <div className="mt-7 max-w-sm">
                <div className="mb-2 flex justify-between text-xs text-white/60"><span>Sold: {soldPct}%</span><span>Small-batch — limited pieces</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-linear-to-r from-amber-300 via-amber-500 to-brand-400" initial={{ width: 0 }} whileInView={{ width: `${soldPct}%` }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut' }} />
                </div>
              </div>
              <Link to={`/product/${product.slug || product.id}`} className="btn mt-8 bg-amber-400 !px-7 !py-3.5 text-slate-900 hover:bg-amber-300">
                Grab the deal <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-6 animate-pulse rounded-full bg-amber-500/25 blur-3xl" />
              <motion.div animate={{ y: [0, -16, 0], rotate: [0, 1.5, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} className="relative">
                <Img src={product.images?.[0]} alt={product.name} className="aspect-square rounded-t-[999px] rounded-b-[2rem] shadow-2xl ring-8 ring-white/10" />
              </motion.div>
              {off > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  whileInView={{ scale: 1, rotate: 12 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', delay: 0.4 }}
                  className="absolute -right-3 top-10 grid size-24 place-items-center rounded-full bg-linear-to-br from-amber-400 to-brand-500 text-center font-extrabold leading-none shadow-xl"
                >
                  <div><div className="text-2xl">-{off}%</div><div className="text-[10px] uppercase tracking-wider">today</div></div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function ArtisanCard({ seller, index = 0 }) {
  return (
    <Reveal delay={(index % 4) * 0.08}>
      <Link to={`/artisans/${seller.slug}`} className="group block overflow-hidden rounded-3xl bg-white ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
        <div className="relative h-36 overflow-hidden">
          <Img src={seller.banner || seller.logo} className="h-full w-full" imgClassName="transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/50 to-transparent" />
          <span className="badge absolute right-3 top-3 bg-white/90 text-slate-700"><MapPin className="size-3 text-brand-500" /> {seller.district}</span>
        </div>
        <div className="relative px-5 pb-5">
          <Img src={seller.logo} className="-mt-8 size-16 rounded-2xl ring-4 ring-white" />
          <h3 className="mt-3 font-display text-lg font-semibold text-slate-900 group-hover:text-brand-700">{seller.name}</h3>
          <p className="line-clamp-1 text-sm text-slate-500">{seller.tagline || seller.craft}</p>
          <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {seller.rating || '—'}</span>
            <span>{seller.productCount} products</span>
            <span className="flex items-center gap-1 font-semibold text-brand-600">Visit <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function ArtisansShowcase({ sellers = [] }) {
  if (!sellers.length) return null;
  return (
    <section className="mt-24 bg-cream py-20">
      <div className="container-x">
        <SectionTitle
          eyebrow="The makers"
          title="Meet our artisans"
          subtitle="Independent workshops and family businesses — every shop is verified by our team."
          action={<Link to="/artisans" className="btn-outline group">All artisans <ArrowRight className="size-4 transition group-hover:translate-x-1" /></Link>}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sellers.slice(0, 4).map((s, i) => <ArtisanCard key={s.id} seller={s} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

export function StorySection({ image, image2, artisans = 0, products = 0 }) {
  return (
    <section className="container-x mt-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="relative grid grid-cols-5 gap-4">
            <Img src={image} className="col-span-3 aspect-[3/4] rounded-t-[999px] rounded-b-3xl shadow-xl" />
            <div className="col-span-2 flex flex-col justify-end gap-4 pb-10">
              <Img src={image2} className="aspect-square rounded-3xl shadow-lg" />
              <div className="rounded-3xl bg-leaf-600 p-5 text-white shadow-lg">
                <div className="font-display text-3xl font-bold"><Counter to={25} /></div>
                <div className="text-xs text-white/80">districts represented</div>
              </div>
            </div>
          </div>
          <Lotus className="absolute -left-6 -top-6 size-20 animate-sway text-amber-500" />
        </Reveal>
        <Reveal delay={0.15}>
          <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600"><Lotus className="size-4" /> Our story</span>
          <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl">Every piece carries the story of the hands that made it</h2>
          <FlagStripe className="mt-6 w-28" />
          <p className="mt-6 leading-relaxed text-slate-600">
            From batik studios in Kandy and potters on the Kegalle road to mask carvers in Ambalangoda and tea growers in Nuwara Eliya —
            we connect Sri Lanka’s artisans directly with people who value real craftsmanship. No middlemen, fair prices, and a
            marketplace built for small creative businesses.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              [artisans, '+', 'Artisan shops'],
              [products, '+', 'Handmade products'],
              [Math.round((1 - COMMISSION_RATE) * 100), '%', 'Goes to the maker'],
            ].map(([n, suf, label]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-soft">
                <div className="font-display text-3xl font-bold text-brand-600"><Counter to={n} suffix={suf} /></div>
                <div className="mt-1 text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
          <Link to="/artisans" className="btn-primary mt-8">Meet the makers <ArrowRight className="size-4" /></Link>
        </Reveal>
      </div>
    </section>
  );
}

const CRAFT_WORDS = ['Batik', 'Pottery', 'Crochet', 'Coconut crafts', 'Lacquerware', 'Ambalangoda masks', 'Ceylon tea', 'True cinnamon', 'Handloom', 'Brassware', 'Moonstone', 'Beeralu lace'];

export function CraftMarquee() {
  const row = [...CRAFT_WORDS, ...CRAFT_WORDS];
  return (
    <section className="mt-24 overflow-hidden border-y border-brand-100 bg-brand-50/50 py-7">
      <div className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
          {[...row, ...row].map((w, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl font-semibold text-brand-800/70 transition-colors hover:text-brand-600 sm:text-3xl">
              {w} <Lotus className="size-6 text-amber-500" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SellCTA({ image }) {
  return (
    <section className="container-x mt-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-leaf-800 text-white">
          <Mandala className="pointer-events-none absolute -left-20 -bottom-40 size-[460px] text-white/10" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <span className="badge mb-4 bg-white/15 text-leaf-100"><Store className="size-3.5" /> For artisans & small businesses</span>
              <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">Sell your handmade products to the whole island</h2>
              <ul className="mt-6 space-y-2 text-white/80">
                <li className="flex items-center gap-2"><BadgeCheck className="size-5 text-amber-300" /> Free to open a shop — pay only {Math.round(COMMISSION_RATE * 100)}% when you sell</li>
                <li className="flex items-center gap-2"><BadgeCheck className="size-5 text-amber-300" /> Your own shop page, dashboard & order tracking</li>
                <li className="flex items-center gap-2"><BadgeCheck className="size-5 text-amber-300" /> We handle payments, COD and customer support</li>
              </ul>
              <Link to="/sell" className="btn mt-8 bg-amber-400 !px-7 !py-3.5 text-slate-900 hover:bg-amber-300">Open your shop <ArrowRight className="size-4" /></Link>
            </div>
            <div className="relative hidden h-full min-h-[420px] lg:block">
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover [mask-image:linear-gradient(to_right,transparent,black_30%)]" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState('');
  return (
    <section className="container-x mt-24">
      <Reveal>
        <div className="bg-pattern relative overflow-hidden rounded-[2.5rem] bg-cream px-6 py-14 text-center ring-1 ring-brand-100 sm:px-12">
          <Mandala className="pointer-events-none absolute -right-24 -top-24 size-80 text-brand-300/30" />
          <div className="relative mx-auto max-w-xl">
            <div className="mx-auto mb-4 grid size-14 animate-float place-items-center rounded-2xl bg-white text-brand-600 shadow-lg"><Gift className="size-6" /></div>
            <h2 className="text-3xl font-semibold sm:text-4xl">Get <span className="text-gradient">10% off</span> your first order</h2>
            <p className="mt-3 text-slate-500">New crafts, artisan stories and festival offers for Avurudu, Vesak & Christmas — straight to your inbox.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                toast.success('Thank you! Use code AYUBOWAN10 at checkout');
                setEmail('');
              }}
              className="mx-auto mt-7 flex max-w-md flex-col gap-2 rounded-full bg-white p-2 shadow-soft sm:flex-row"
            >
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 rounded-full px-5 py-3 text-sm outline-none" />
              <button className="btn-brand !py-3">Subscribe</button>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
