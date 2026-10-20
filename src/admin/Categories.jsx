import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { CATEGORY_ICONS, categoryIcon } from '../lib/icons';
import { ConfirmDialog, EmptyState, Img, Modal, Spinner } from '../components/ui';
import { PageHeader, Toggle } from './components';

const EMPTY = { name: '', description: '', image: '', icon: 'Tag', order: 0, active: true };

export default function Categories() {
  const { data, loading, reload } = useFetch('/categories', { params: { all: true } });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const cats = data?.categories || [];

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { id, productCount, slug, createdAt, updatedAt, ...body } = editing;
      body.order = Number(body.order) || 0;
      if (id) await api.put(`/categories/${id}`, body);
      else await api.post('/categories', body);
      toast.success('Category saved');
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
      await api.delete(`/categories/${deleting.id}`);
      toast.success('Category deleted');
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
        title="Categories"
        subtitle="Organise your catalogue"
        action={<button onClick={() => setEditing({ ...EMPTY, order: cats.length })} className="btn-brand"><Plus className="size-4" /> Add category</button>}
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-60 rounded-2xl" />)}</div>
      ) : !cats.length ? (
        <EmptyState icon={Tags} title="No categories yet" text="Create your first category to start adding products." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cats.map((c, i) => {
            const Icon = categoryIcon(c.icon);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card group overflow-hidden">
                <div className="relative">
                  <Img src={c.image} className="h-36" imgClassName="transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                    <span className="grid size-9 place-items-center rounded-xl bg-white/20 backdrop-blur"><Icon className="size-4" /></span>
                    <span className="text-lg font-bold">{c.name}</span>
                  </div>
                  {c.active === false && <span className="badge absolute right-3 top-3 bg-slate-900/80 text-white">Hidden</span>}
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm text-slate-500">{c.productCount} products</div>
                    <div className="line-clamp-1 text-xs text-slate-400">{c.description || '—'}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(c)} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Pencil className="size-4" /></button>
                    <button onClick={() => setDeleting(c)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit category' : 'New category'}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            <button form="cat-form" disabled={busy} className="btn-brand">{busy && <Spinner className="size-4" />} Save</button>
          </>
        }
      >
        {editing && (
          <form id="cat-form" onSubmit={save} className="space-y-4">
            <div><label className="label">Name *</label><input className="input" required value={editing.name} onChange={set('name')} /></div>
            <div><label className="label">Description</label><input className="input" value={editing.description} onChange={set('description')} /></div>
            <div>
              <label className="label">Image URL</label>
              <input className="input" value={editing.image} onChange={set('image')} placeholder="https://…" />
              {editing.image && <Img src={editing.image} className="mt-3 h-32 rounded-xl" />}
            </div>
            <div>
              <label className="label">Icon</label>
              <div className="grid grid-cols-9 gap-2">
                {Object.entries(CATEGORY_ICONS).map(([name, Icon]) => (
                  <button
                    type="button"
                    key={name}
                    title={name}
                    onClick={() => set('icon')(name)}
                    className={`grid aspect-square place-items-center rounded-xl border transition ${editing.icon === name ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-6">
              <div className="w-32"><label className="label">Sort order</label><input type="number" className="input" value={editing.order} onChange={set('order')} /></div>
              <div className="pb-2"><Toggle checked={editing.active !== false} onChange={set('active')} label="Visible in store" /></div>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} title="Delete category?" text={`"${deleting?.name}" will be deleted. Categories that still contain products can't be deleted.`} />
    </div>
  );
}
