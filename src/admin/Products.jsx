import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Package, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { money } from '../lib/format';
import { ConfirmDialog, EmptyState, Img, Modal, Spinner } from '../components/ui';
import { ImagesInput, PageHeader, SearchInput, SkeletonRows, Table, Toggle } from './components';

const EMPTY = {
  name: '', categoryId: '', price: '', comparePrice: '', stock: '', sku: '', sellerId: '',
  shortDescription: '', description: '', images: [], colors: '', sizes: '', tags: '', materials: '', dimensions: '',
  featured: false, isNew: true, active: true,
};

/**
 * Product manager shared by the admin panel (mode="admin": every product, shop column, featured flag,
 * can assign a seller) and the seller dashboard (mode="seller": own products only).
 */
export default function Products({ mode = 'admin' }) {
  const isAdmin = mode === 'admin';
  const [params, setParams] = useSearchParams();
  const { data, loading, reload } = useFetch(isAdmin ? '/products' : '/seller/products', { params: isAdmin ? { all: true, limit: 1000 } : undefined });
  const { data: catData } = useFetch('/categories', { params: { all: true } });
  const { data: sellerData } = useFetch('/sellers', { skip: !isAdmin });
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [shop, setShop] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const categories = catData?.categories || [];
  const sellers = sellerData?.sellers || [];
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const openEdit = (p) =>
    setEditing({
      ...EMPTY,
      ...p,
      colors: (p.colors || []).join(', '),
      sizes: (p.sizes || []).join(', '),
      tags: (p.tags || []).join(', '),
    });

  // Open the editor directly when linked with ?edit=<id> (e.g. from the dashboard low-stock list)
  useEffect(() => {
    const id = params.get('edit');
    const p = id && data?.products?.find((x) => x.id === id);
    if (p) {
      openEdit(p);
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, params]);

  const list = useMemo(() => {
    let l = data?.products || [];
    if (q) l = l.filter((p) => `${p.name} ${p.shopName} ${p.sku}`.toLowerCase().includes(q.toLowerCase()));
    if (cat) l = l.filter((p) => p.categoryId === cat);
    if (shop) l = l.filter((p) => p.sellerId === shop);
    if (stockFilter === 'low') l = l.filter((p) => p.stock > 0 && p.stock <= 3);
    if (stockFilter === 'out') l = l.filter((p) => p.stock <= 0);
    return l;
  }, [data, q, cat, shop, stockFilter]);

  const quickToggle = async (p, field, value) => {
    try {
      await api.put(`/products/${p.id}`, { [field]: value });
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { id, ...body } = editing;
      if (id) await api.put(`/products/${id}`, body);
      else await api.post('/products', body);
      toast.success(id ? 'Product updated' : 'Product created');
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/products/${deleting.id}`);
      toast.success('Product deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setEditing((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));
  const head = ['Product', ...(isAdmin ? ['Artisan'] : []), 'Category', 'Price', 'Stock', 'Sold', ...(isAdmin ? ['Featured'] : []), 'Active', { label: '', className: 'text-right' }];

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'Products' : 'My products'}
        subtitle={`${data?.total ?? 0} products ${isAdmin ? 'across all artisans' : 'in your shop'}`}
        action={<button onClick={() => setEditing({ ...EMPTY, categoryId: categories[0]?.id || '' })} className="btn-brand"><Plus className="size-4" /> Add product</button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search name, SKU…" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input !w-auto">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {isAdmin && (
          <select value={shop} onChange={(e) => setShop(e.target.value)} className="input !w-auto">
            <option value="">All artisans</option>
            {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="input !w-auto">
          <option value="">Any stock</option>
          <option value="low">Low stock (≤3)</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      <Table head={head} empty={!loading && !list.length && <div className="p-6"><EmptyState icon={Package} title="No products" text={isAdmin ? 'Try a different filter.' : 'Add your first handmade product to start selling.'} /></div>}>
        {loading ? (
          <SkeletonRows cols={head.length} />
        ) : (
          list.map((p) => (
            <tr key={p.id} className={`transition hover:bg-slate-50/60 ${p.sellerActive === false ? 'opacity-50' : ''}`}>
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <Img src={p.images?.[0]} className="size-12 shrink-0 rounded-xl" />
                  <div className="min-w-0">
                    <div className="max-w-[220px] truncate font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.sku || '—'}</div>
                  </div>
                </div>
              </td>
              {isAdmin && (
                <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                  {p.shopName || <span className="text-slate-400">Marketplace</span>}
                  {p.sellerActive === false && <div className="text-xs text-rose-500">Shop hidden</div>}
                </td>
              )}
              <td className="whitespace-nowrap px-5 py-3 text-slate-600">{catName[p.categoryId] || '—'}</td>
              <td className="whitespace-nowrap px-5 py-3">
                <div className="font-semibold">{money(p.price)}</div>
                {p.comparePrice > p.price && <div className="text-xs text-slate-400 line-through">{money(p.comparePrice)}</div>}
              </td>
              <td className="px-5 py-3">
                <span className={`badge ${p.stock <= 0 ? 'bg-rose-50 text-rose-600' : p.stock <= 3 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{p.stock}</span>
              </td>
              <td className="px-5 py-3 text-slate-600">{p.sold || 0}</td>
              {isAdmin && (
                <td className="px-5 py-3">
                  <button onClick={() => quickToggle(p, 'featured', !p.featured)} className="transition hover:scale-110" aria-label="Toggle featured">
                    <Star className={`size-5 ${p.featured ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                </td>
              )}
              <td className="px-5 py-3"><Toggle checked={p.active !== false} onChange={() => quickToggle(p, 'active', p.active === false)} /></td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1">
                  <Link to={`/product/${p.slug || p.id}`} target="_blank" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Eye className="size-4" /></Link>
                  <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Pencil className="size-4" /></button>
                  <button onClick={() => setDeleting(p)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit product' : 'New product'}
        size="max-w-3xl"
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            <button form="product-form" disabled={busy} className="btn-brand">{busy && <Spinner className="size-4" />} Save product</button>
          </>
        }
      >
        {editing && (
          <form id="product-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">Name *</label><input className="input" required value={editing.name} onChange={set('name')} /></div>
            <div>
              <label className="label">Category *</label>
              <select className="input" required value={editing.categoryId} onChange={set('categoryId')}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {isAdmin ? (
              <div>
                <label className="label">Artisan shop</label>
                <select className="input" value={editing.sellerId || ''} onChange={set('sellerId')}>
                  <option value="">Marketplace (no seller)</option>
                  {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            ) : (
              <div><label className="label">SKU</label><input className="input" value={editing.sku} onChange={set('sku')} /></div>
            )}
            <div><label className="label">Price (Rs) *</label><input className="input" type="number" step="1" min="0" required value={editing.price} onChange={set('price')} /></div>
            <div><label className="label">Original price (Rs)</label><input className="input" type="number" step="1" min="0" value={editing.comparePrice} onChange={set('comparePrice')} placeholder="Shown crossed out for discounts" /></div>
            <div><label className="label">Stock *</label><input className="input" type="number" min="0" required value={editing.stock} onChange={set('stock')} /></div>
            {isAdmin && <div><label className="label">SKU</label><input className="input" value={editing.sku} onChange={set('sku')} /></div>}
            <div className="sm:col-span-2"><label className="label">Photos</label><ImagesInput value={editing.images} onChange={set('images')} /></div>
            <div className="sm:col-span-2"><label className="label">Short description</label><input className="input" value={editing.shortDescription} onChange={set('shortDescription')} placeholder="One line shown under the title" /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><textarea rows={4} className="input" value={editing.description} onChange={set('description')} placeholder="How it's made, care instructions, the story behind it…" /></div>
            <div><label className="label">Materials</label><input className="input" value={editing.materials} onChange={set('materials')} placeholder="Cotton, natural dyes" /></div>
            <div><label className="label">Size / dimensions</label><input className="input" value={editing.dimensions} onChange={set('dimensions')} placeholder="30 × 40 cm" /></div>
            <div><label className="label">Colours <span className="text-slate-400">(comma separated)</span></label><input className="input" value={editing.colors} onChange={set('colors')} placeholder="Indigo, Maroon" /></div>
            <div><label className="label">Sizes <span className="text-slate-400">(comma separated)</span></label><input className="input" value={editing.sizes} onChange={set('sizes')} placeholder="S, M, L" /></div>
            <div className="sm:col-span-2"><label className="label">Tags</label><input className="input" value={editing.tags} onChange={set('tags')} placeholder="gift, avurudu, eco" /></div>
            <div className="flex flex-wrap gap-6 sm:col-span-2">
              <Toggle checked={editing.active} onChange={set('active')} label="Visible in store" />
              <Toggle checked={editing.isNew} onChange={set('isNew')} label="New arrival" />
              {isAdmin && <Toggle checked={editing.featured} onChange={set('featured')} label="Featured on home page" />}
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete product?"
        text={`"${deleting?.name}" will be permanently removed. Existing orders keep their copy of the product details.`}
      />
    </div>
  );
}
