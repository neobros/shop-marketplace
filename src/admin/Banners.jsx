import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Image as ImageIcon, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { ConfirmDialog, EmptyState, Img, Modal, Spinner } from '../components/ui';
import { PageHeader, Toggle } from './components';

const POSITIONS = [
  { key: 'hero', label: 'Hero slider', text: 'Large slides at the top of the home page' },
  { key: 'promo', label: 'Promo cards', text: 'Two side-by-side cards (first 2 shown)' },
  { key: 'strip', label: 'Announcement', text: 'Scrolling text bar above the navbar' },
];
const BG = ['#fdf3e7', '#eef5ea', '#fbeee6', '#e9f3f1', '#f6ead8', '#fbe9e7', '#f4ead9', '#fef6e0'];
const EMPTY = { title: '', subtitle: '', tag: '', image: '', buttonText: 'Shop now', link: '/shop', position: 'hero', bgColor: '#fdf3e7', textColor: '', order: 0, active: true };

export default function Banners() {
  const { data, loading, reload } = useFetch('/banners', { params: { all: true } });
  const [tab, setTab] = useState('hero');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const banners = (data?.banners || []).filter((b) => b.position === tab);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { id, createdAt, updatedAt, ...body } = editing;
      body.order = Number(body.order) || 0;
      if (id) await api.put(`/banners/${id}`, body);
      else await api.post('/banners', body);
      toast.success('Banner saved');
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (b) => {
    try {
      await api.put(`/banners/${b.id}`, { active: b.active === false });
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/banners/${deleting.id}`);
      toast.success('Banner deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setEditing((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));

  return (
    <div>
      <PageHeader
        title="Banners"
        subtitle="Control the home page hero slider, promo cards and announcement bar"
        action={<button onClick={() => setEditing({ ...EMPTY, position: tab, order: banners.length + 1 })} className="btn-brand"><Plus className="size-4" /> Add banner</button>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {POSITIONS.map((p) => (
          <button key={p.key} onClick={() => setTab(p.key)} className={`relative rounded-2xl border-2 p-4 text-left transition ${tab === p.key ? 'border-brand-500 bg-white shadow-soft' : 'border-transparent bg-white/60 hover:bg-white'}`}>
            {tab === p.key && <motion.span layoutId="banner-tab" className="absolute inset-x-6 -bottom-0.5 h-1 rounded-full bg-brand-500" />}
            <div className="font-bold">{p.label}</div>
            <div className="text-xs text-slate-500">{p.text}</div>
            <span className="badge absolute right-3 top-3 bg-slate-100 text-slate-600">{(data?.banners || []).filter((b) => b.position === p.key).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : !banners.length ? (
        <EmptyState icon={tab === 'strip' ? Megaphone : ImageIcon} title="No banners here yet" action={<button onClick={() => setEditing({ ...EMPTY, position: tab })} className="btn-primary">Create one</button>} />
      ) : (
        <div className={tab === 'promo' ? 'grid gap-5 lg:grid-cols-2' : 'space-y-4'}>
          {banners.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`card overflow-hidden ${b.active === false ? 'opacity-60' : ''}`}>
              {tab === 'strip' ? (
                <div className="bg-linear-to-r from-brand-700 via-brand-600 to-amber-500 px-5 py-3 text-sm font-medium text-white">{b.title}</div>
              ) : (
                <BannerPreview banner={b} compact />
              )}
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="badge bg-slate-100 text-slate-600">Order {b.order ?? 0}</span>
                  {b.link && tab !== 'strip' && <span className="hidden truncate sm:inline">→ {b.link}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Toggle checked={b.active !== false} onChange={() => toggle(b)} />
                  <button onClick={() => setEditing({ ...EMPTY, ...b })} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Pencil className="size-4" /></button>
                  <button onClick={() => setDeleting(b)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit banner' : 'New banner'}
        size="max-w-4xl"
        footer={<><button onClick={() => setEditing(null)} className="btn-outline">Cancel</button><button form="banner-form" disabled={busy} className="btn-brand">{busy && <Spinner className="size-4" />} Save banner</button></>}
      >
        {editing && (
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Live preview</div>
              {editing.position === 'strip' ? (
                <div className="rounded-xl bg-linear-to-r from-brand-700 via-brand-600 to-amber-500 px-5 py-3 text-sm font-medium text-white">{editing.title || 'Announcement text…'}</div>
              ) : (
                <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200"><BannerPreview banner={editing} /></div>
              )}
            </div>
            <form id="banner-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Position</label>
                <select className="input" value={editing.position} onChange={set('position')}>
                  {POSITIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <div><label className="label">Sort order</label><input type="number" className="input" value={editing.order} onChange={set('order')} /></div>
              <div className="sm:col-span-2"><label className="label">{editing.position === 'strip' ? 'Announcement text *' : 'Title *'}</label><input className="input" required value={editing.title} onChange={set('title')} /></div>
              {editing.position !== 'strip' && (
                <>
                  <div><label className="label">Tag / eyebrow</label><input className="input" value={editing.tag} onChange={set('tag')} placeholder="New Season" /></div>
                  <div><label className="label">Subtitle</label><input className="input" value={editing.subtitle} onChange={set('subtitle')} /></div>
                  <div className="sm:col-span-2"><label className="label">Image URL</label><input className="input" value={editing.image} onChange={set('image')} placeholder="https://…" /></div>
                  <div><label className="label">Button text</label><input className="input" value={editing.buttonText} onChange={set('buttonText')} /></div>
                  <div><label className="label">Button link</label><input className="input" value={editing.link} onChange={set('link')} placeholder="/shop?category=fashion" /></div>
                  <div className="sm:col-span-2">
                    <label className="label">Background colour</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {BG.map((c) => (
                        <button type="button" key={c} onClick={() => set('bgColor')(c)} className={`size-9 rounded-xl ring-2 ring-offset-2 transition ${editing.bgColor === c ? 'ring-brand-500' : 'ring-transparent'}`} style={{ background: c }} />
                      ))}
                      <input type="color" value={editing.bgColor || '#eef2ff'} onChange={set('bgColor')} className="size-9 cursor-pointer rounded-xl border border-slate-200" />
                    </div>
                  </div>
                </>
              )}
              <div className="sm:col-span-2"><Toggle checked={editing.active !== false} onChange={set('active')} label="Active" /></div>
            </form>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} title="Delete banner?" text={`"${deleting?.title}" will be removed from the store.`} />
    </div>
  );
}

function BannerPreview({ banner: b, compact }) {
  return (
    <div className={`relative grid grid-cols-2 items-center overflow-hidden ${compact ? 'min-h-40' : 'min-h-56'}`} style={{ background: b.bgColor || '#eef2ff' }}>
      <div className="relative z-10 p-6">
        {b.tag && <span className="badge mb-2 bg-white/80 text-brand-700">{b.tag}</span>}
        <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-extrabold leading-tight`} style={{ color: b.textColor || '#0f172a' }}>{b.title || 'Banner title'}</h3>
        {b.subtitle && <p className="mt-1 line-clamp-2 text-xs text-slate-600">{b.subtitle}</p>}
        <span className="mt-3 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">{b.buttonText || 'Shop now'} <ArrowRight className="size-3" /></span>
      </div>
      <Img src={b.image} className="absolute inset-y-0 right-0 h-full w-1/2" />
    </div>
  );
}
