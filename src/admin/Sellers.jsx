import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ban, Check, ExternalLink, Eye, MapPin, Phone, RotateCcw, Store, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { date, money } from '../lib/format';
import { EmptyState, Img, Modal, Spinner } from '../components/ui';
import { PageHeader, SearchInput } from './components';

const TABS = [
  ['pending', 'Applications', 'bg-amber-400'],
  ['approved', 'Approved', 'bg-leaf-500'],
  ['rejected', 'Rejected', 'bg-rose-500'],
  ['suspended', 'Suspended', 'bg-slate-500'],
];
const STATUS_BADGE = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-leaf-50 text-leaf-700',
  rejected: 'bg-rose-50 text-rose-700',
  suspended: 'bg-slate-100 text-slate-600',
};

export default function Sellers() {
  const { data, loading, reload } = useFetch('/sellers/admin/all');
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [viewing, setViewing] = useState(null);
  const [action, setAction] = useState(null); // { seller, status }
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const all = data?.sellers || [];
  const list = all.filter(
    (s) => s.status === tab && (!q || `${s.name} ${s.ownerName} ${s.email} ${s.district} ${s.craft}`.toLowerCase().includes(q.toLowerCase()))
  );

  const run = async (seller, status, withNote = '') => {
    setBusy(true);
    try {
      await api.put(`/sellers/${seller.id}/status`, { status, note: withNote });
      toast.success(
        { approved: `${seller.name} approved 🎉`, rejected: 'Application rejected', suspended: 'Shop suspended', pending: 'Moved back to review' }[status]
      );
      setAction(null);
      setViewing(null);
      setNote('');
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // Approve / reactivate run immediately; reject / suspend ask for a reason first.
  const act = (seller, status) => (status === 'rejected' || status === 'suspended' ? setAction({ seller, status }) : run(seller, status));

  return (
    <div>
      <PageHeader title="Artisans" subtitle="Review shop applications and manage sellers" action={<SearchInput value={q} onChange={setQ} placeholder="Shop, owner, district…" />} />

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {TABS.map(([key, label, dot]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === key ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'}`}
          >
            {tab === key && <motion.span layoutId="seller-tab" className="absolute inset-0 rounded-xl bg-slate-900" />}
            <span className={`relative size-2 rounded-full ${dot}`} />
            <span className="relative">{label}</span>
            <span className={`relative rounded-md px-1.5 text-xs ${tab === key ? 'bg-white/20' : 'bg-slate-100'}`}>{all.filter((s) => s.status === key).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
      ) : !list.length ? (
        <EmptyState icon={Store} title={tab === 'pending' ? 'No pending applications' : 'Nothing here'} text={tab === 'pending' ? 'New shop applications will appear here.' : undefined} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden">
              <div className="relative h-24 bg-cream">
                {s.banner && <Img src={s.banner} className="h-full w-full" />}
                <span className={`badge absolute right-3 top-3 capitalize ${STATUS_BADGE[s.status]}`}>{s.status}</span>
              </div>
              <div className="px-5 pb-5">
                <div className="relative -mt-7 flex items-end gap-3">
                  {s.logo ? <Img src={s.logo} className="size-14 rounded-2xl ring-4 ring-white" /> : <div className="grid size-14 place-items-center rounded-2xl bg-brand-100 font-display text-xl font-bold text-brand-700 ring-4 ring-white">{s.name[0]}</div>}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.name}</h3>
                <p className="text-sm text-slate-500">{s.ownerName} · {s.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="badge bg-slate-100 text-slate-600"><MapPin className="size-3" /> {s.district}</span>
                  <span className="badge bg-brand-50 text-brand-700">{s.craft}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
                  <div><div className="font-bold text-slate-900">{s.productCount}</div><div className="text-slate-400">Products</div></div>
                  <div><div className="font-bold text-slate-900">{money(s.revenue)}</div><div className="text-slate-400">Sales</div></div>
                  <div><div className="font-bold text-slate-900">{date(s.appliedAt, { day: 'numeric', month: 'short' })}</div><div className="text-slate-400">Applied</div></div>
                </div>
                {s.note && <p className="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">Note: {s.note}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setViewing(s)} className="btn-outline !px-3 !py-2 text-xs"><Eye className="size-3.5" /> Details</button>
                  {s.status === 'pending' && (
                    <>
                      <button disabled={busy} onClick={() => act(s, 'approved')} className="btn-leaf !px-3 !py-2 text-xs"><Check className="size-3.5" /> Approve</button>
                      <button disabled={busy} onClick={() => act(s, 'rejected')} className="btn-outline !px-3 !py-2 text-xs text-rose-600"><X className="size-3.5" /> Reject</button>
                    </>
                  )}
                  {s.status === 'approved' && (
                    <>
                      <Link to={`/artisans/${s.slug}`} target="_blank" className="btn-outline !px-3 !py-2 text-xs"><ExternalLink className="size-3.5" /> Shop</Link>
                      <button disabled={busy} onClick={() => act(s, 'suspended')} className="btn-outline !px-3 !py-2 text-xs text-rose-600"><Ban className="size-3.5" /> Suspend</button>
                    </>
                  )}
                  {(s.status === 'rejected' || s.status === 'suspended') && (
                    <button disabled={busy} onClick={() => act(s, 'approved')} className="btn-leaf !px-3 !py-2 text-xs"><RotateCcw className="size-3.5" /> {s.status === 'suspended' ? 'Reactivate' : 'Approve'}</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Shop application" size="max-w-2xl"
        footer={viewing?.status === 'pending' && (
          <>
            <button onClick={() => act(viewing, 'rejected')} className="btn-outline text-rose-600">Reject</button>
            <button disabled={busy} onClick={() => act(viewing, 'approved')} className="btn-leaf">{busy && <Spinner className="size-4" />} Approve shop</button>
          </>
        )}
      >
        {viewing && (
          <div className="space-y-4">
            {viewing.banner && <Img src={viewing.banner} className="h-40 rounded-2xl" />}
            <div className="flex items-center gap-4">
              {viewing.logo && <Img src={viewing.logo} className="size-16 rounded-2xl" />}
              <div>
                <h3 className="font-display text-2xl font-semibold">{viewing.name}</h3>
                <p className="text-sm text-slate-500">{viewing.tagline}</p>
              </div>
            </div>
            <dl className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-400">Owner</dt><dd className="font-medium">{viewing.ownerName}</dd></div>
              <div><dt className="text-xs text-slate-400">Email</dt><dd className="font-medium">{viewing.email}</dd></div>
              <div><dt className="text-xs text-slate-400">Phone</dt><dd className="flex items-center gap-1 font-medium"><Phone className="size-3.5" /> {viewing.phone}</dd></div>
              <div><dt className="text-xs text-slate-400">District</dt><dd className="font-medium">{viewing.district}</dd></div>
              <div><dt className="text-xs text-slate-400">Craft</dt><dd className="font-medium">{viewing.craft}</dd></div>
              <div><dt className="text-xs text-slate-400">Applied</dt><dd className="font-medium">{date(viewing.appliedAt)}</dd></div>
            </dl>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Their story</div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{viewing.bio || '—'}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!action} onClose={() => setAction(null)} title={action?.status === 'rejected' ? 'Reject application' : 'Suspend shop'} size="max-w-md"
        footer={
          <>
            <button onClick={() => setAction(null)} className="btn-outline">Cancel</button>
            <button disabled={busy} onClick={() => run(action.seller, action.status, note)} className="btn-danger">{busy && <Spinner className="size-4" />} Confirm</button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {action?.status === 'suspended' ? 'All products from this shop will be hidden from the store until it is reactivated.' : 'The applicant will see this reason and can apply again.'}
        </p>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="input mt-4" placeholder="Reason (shown to the seller)" />
      </Modal>
    </div>
  );
}
