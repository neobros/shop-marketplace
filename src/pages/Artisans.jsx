import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Package, Phone, Search, Star, Store, Users } from 'lucide-react';
import useFetch from '../lib/useFetch';
import { date } from '../lib/format';
import { EmptyState, Img, PageLoader } from '../components/ui';
import { ArtisanCard } from '../components/home/Sections';
import { ProductGrid } from '../components/ProductCard';
import { FlagStripe, Lotus, Mandala } from '../components/decor';

function PageHero({ title, subtitle, children }) {
  return (
    <section className="bg-pattern relative overflow-hidden bg-cream">
      <Mandala className="pointer-events-none absolute -right-24 -top-24 size-96 text-brand-400/20" />
      <div className="container-x relative py-14 sm:py-20">
        <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600"><Lotus className="size-4" /> Handmade in Sri Lanka</span>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-semibold sm:text-6xl">{title}</motion.h1>
        <FlagStripe className="mt-5 w-28" />
        <p className="mt-4 max-w-2xl text-slate-600">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

export function Artisans() {
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('');
  const { data, loading } = useFetch('/sellers', { params: { q, district } });
  const sellers = data?.sellers || [];

  return (
    <div>
      <PageHero title="Meet the artisans" subtitle="Independent makers, family workshops and small creative businesses from across the island. Every shop is reviewed by our team before it goes live.">
        <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shops or crafts…" className="input !rounded-full !py-3 !pl-11" />
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input !w-auto !rounded-full !py-3">
            <option value="">All districts</option>
            {data?.districts?.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </PageHero>

      <div className="container-x mt-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-3xl" />)}</div>
        ) : !sellers.length ? (
          <EmptyState icon={Users} title="No artisans found" text="Try another district or search term." />
        ) : (
          <>
            <p className="mb-6 text-sm text-slate-500"><b className="text-slate-900">{sellers.length}</b> artisan shops</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sellers.map((s, i) => <ArtisanCard key={s.id} seller={s} index={i} />)}
            </div>
          </>
        )}

        <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-3xl bg-leaf-50 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-2xl font-semibold text-leaf-800">Are you an artisan?</h3>
            <p className="text-leaf-700/80">Open your shop for free and reach customers in all 25 districts.</p>
          </div>
          <Link to="/sell" className="btn-leaf !px-6 !py-3"><Store className="size-4" /> Start selling</Link>
        </div>
      </div>
    </div>
  );
}

export function ArtisanShop() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/sellers/${slug}`);
  const [sort, setSort] = useState('newest');

  if (loading) return <PageLoader />;
  if (error || !data?.seller)
    return <div className="container-x py-20"><EmptyState icon={Store} title="Shop not found" text={error} action={<Link to="/artisans" className="btn-primary">All artisans</Link>} /></div>;

  const { seller: s } = data;
  const products = [...data.products].sort((a, b) =>
    sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : sort === 'popular' ? (b.sold || 0) - (a.sold || 0) : 0
  );

  return (
    <div>
      <section className="container-x pt-6">
        <div className="relative h-56 overflow-hidden rounded-[2.5rem] sm:h-80">
          <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="h-full">
            <Img src={s.banner || s.logo} className="h-full w-full" priority />
          </motion.div>
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        </div>
        <div className="relative -mt-16 flex flex-col gap-6 px-4 sm:-mt-20 sm:flex-row sm:items-end sm:px-10">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <Img src={s.logo} className="size-32 rounded-[2rem] shadow-xl ring-8 ring-white sm:size-40" priority />
          </motion.div>
          <div className="flex-1 pb-2">
            <span className="badge mb-2 bg-leaf-50 text-leaf-700">Verified artisan</span>
            <h1 className="text-3xl font-semibold sm:text-4xl">{s.name}</h1>
            <p className="mt-1 text-slate-500">{s.tagline}</p>
          </div>
        </div>
      </section>

      <div className="container-x mt-10 grid gap-10 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold">About the maker</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.bio}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Users className="size-4 text-brand-500" /> {s.ownerName}</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-brand-500" /> {s.district}, Sri Lanka</li>
              <li className="flex items-center gap-2"><Lotus className="size-4 text-brand-500" /> {s.craft}</li>
              {s.memberSince && <li className="flex items-center gap-2"><CalendarDays className="size-4 text-brand-500" /> Member since {date(s.memberSince, { month: 'long', year: 'numeric' })}</li>}
              {s.phone && <li className="flex items-center gap-2"><Phone className="size-4 text-brand-500" /> {s.phone}</li>}
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[[s.productCount, 'Products', Package], [s.sold, 'Sold', Store], [s.rating || '—', 'Rating', Star]].map(([v, l, Icon]) => (
              <div key={l} className="card p-3">
                <Icon className="mx-auto size-4 text-brand-500" />
                <div className="mt-1 font-display text-xl font-bold">{v}</div>
                <div className="text-[11px] text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Products by {s.name}</h2>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto !py-2">
              <option value="newest">Newest</option>
              <option value="popular">Best selling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {products.length ? <ProductGrid products={products} cols="grid-cols-2 md:grid-cols-3" /> : <EmptyState icon={Package} title="No products yet" text="This artisan is preparing their first pieces." />}
        </div>
      </div>
    </div>
  );
}
