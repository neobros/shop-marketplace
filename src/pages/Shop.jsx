import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from '../components/ProductCard';
import { EmptyState } from '../components/ui';
import { Mandala } from '../components/decor';
import { DISTRICTS } from '../lib/brand';
import useFetch from '../lib/useFetch';

const SORTS = [
  ['newest', 'Newest'],
  ['popular', 'Best selling'],
  ['rating', 'Top rated'],
  ['price-asc', 'Price: Low to High'],
  ['price-desc', 'Price: High to Low'],
];
const PRICES = [
  ['', '', 'Any price'],
  ['', '2000', 'Under Rs 2,000'],
  ['2000', '5000', 'Rs 2,000 – 5,000'],
  ['5000', '15000', 'Rs 5,000 – 15,000'],
  ['15000', '', 'Rs 15,000 & above'],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = Object.fromEntries(params.entries());
  const { data, loading } = useFetch('/products', { params: { limit: 12, ...query } });
  const { data: catData } = useFetch('/categories');
  const categories = catData?.categories || [];
  const activeCat = categories.find((c) => c.slug === query.category);

  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v === undefined || v === null ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query.page]);

  const chips = [
    query.q && ['q', `“${query.q}”`],
    activeCat && ['category', activeCat.name],
    (query.minPrice || query.maxPrice) && ['price', PRICES.find(([a, b]) => a === (query.minPrice || '') && b === (query.maxPrice || ''))?.[2] || 'Price'],
    query.isNew && ['isNew', 'New arrivals'],
    query.featured && ['featured', 'Featured'],
    query.district && ['district', query.district],
  ].filter(Boolean);

  const Filters = (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">Categories</h4>
        <div className="space-y-1">
          <FilterBtn active={!query.category} onClick={() => set({ category: '' })}>All products</FilterBtn>
          {categories.map((c) => (
            <FilterBtn key={c.id} active={query.category === c.slug} onClick={() => set({ category: c.slug })}>
              <span className="flex-1">{c.name}</span>
              <span className="text-xs text-slate-400">{c.productCount}</span>
            </FilterBtn>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">Price</h4>
        <div className="space-y-1">
          {PRICES.map(([min, max, label]) => (
            <FilterBtn
              key={label}
              active={(query.minPrice || '') === min && (query.maxPrice || '') === max}
              onClick={() => set({ minPrice: min, maxPrice: max })}
            >
              {label}
            </FilterBtn>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">Made in</h4>
        <select value={query.district || ''} onChange={(e) => set({ district: e.target.value })} className="input">
          <option value="">Anywhere in Sri Lanka</option>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">Show</h4>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-50">
          <input type="checkbox" className="size-4 accent-brand-600" checked={query.isNew === 'true'} onChange={(e) => set({ isNew: e.target.checked ? 'true' : '' })} />
          New arrivals only
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-50">
          <input type="checkbox" className="size-4 accent-brand-600" checked={query.featured === 'true'} onChange={(e) => set({ featured: e.target.checked ? 'true' : '' })} />
          Featured only
        </label>
      </div>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <section className="bg-pattern relative overflow-hidden bg-cream">
        <Mandala className="pointer-events-none absolute -right-24 -top-24 size-96 text-brand-400/20" />
        <div className="container-x relative py-12 sm:py-16">
          <nav className="mb-3 text-sm text-slate-500">
            <Link to="/" className="hover:text-brand-600">Home</Link> <span className="mx-1">/</span> Shop
            {activeCat && <> <span className="mx-1">/</span> {activeCat.name}</>}
          </nav>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-semibold sm:text-6xl">
            {activeCat?.name || (query.q ? 'Search results' : 'All products')}
          </motion.h1>
          <p className="mt-2 text-slate-500">{activeCat?.description || 'Authentic handmade products from artisans across Sri Lanka.'}</p>
        </div>
      </section>

      <div className="container-x mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28">{Filters}</div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setFiltersOpen(true)} className="btn-outline lg:hidden">
                <SlidersHorizontal className="size-4" /> Filters
              </button>
              <p className="text-sm text-slate-500">
                {loading ? 'Loading…' : <><b className="text-slate-900">{data?.total ?? 0}</b> products</>}
              </p>
            </div>
            <select value={query.sort || 'newest'} onChange={(e) => set({ sort: e.target.value })} className="input !w-auto !py-2">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {chips.map(([key, label]) => (
                <motion.button
                  layout
                  key={key}
                  onClick={() => set(key === 'price' ? { minPrice: '', maxPrice: '' } : { [key]: '' })}
                  className="badge bg-brand-50 !py-1.5 !pl-3 text-brand-700 hover:bg-brand-100"
                >
                  {label} <X className="size-3.5" />
                </motion.button>
              ))}
              <button onClick={() => setParams({})} className="text-xs font-semibold text-slate-500 hover:text-rose-500">
                Clear all
              </button>
            </div>
          )}

          {!loading && !data?.products?.length ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              text="Try changing your filters or search for something else."
              action={<button onClick={() => setParams({})} className="btn-primary">Reset filters</button>}
            />
          ) : (
            <ProductGrid products={data?.products} loading={loading} cols="grid-cols-2 md:grid-cols-3" count={9} />
          )}

          {data?.pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <PageBtn disabled={data.page <= 1} onClick={() => set({ page: data.page - 1 })}><ChevronLeft className="size-4" /></PageBtn>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <PageBtn key={n} active={n === data.page} onClick={() => set({ page: n })}>{n}</PageBtn>
              ))}
              <PageBtn disabled={data.page >= data.pages} onClick={() => set({ page: data.page + 1 })}><ChevronRight className="size-4" /></PageBtn>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[85] w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-2xl"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="rounded-lg p-2 hover:bg-slate-100"><X className="size-5" /></button>
              </div>
              <div onClick={(e) => e.target.closest('button') && setTimeout(() => setFiltersOpen(false), 150)}>{Filters}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
        active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function PageBtn({ active, disabled, children, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-xl text-sm font-semibold transition disabled:opacity-40 ${
        active ? 'bg-slate-900 text-white shadow-lg' : 'border border-slate-200 bg-white hover:border-brand-300 hover:text-brand-600'
      }`}
    >
      {children}
    </button>
  );
}
