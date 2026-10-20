import { useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../lib/api';
import { DISTRICTS } from '../lib/brand';
import { Img, Spinner } from '../components/ui';
import { PageHeader } from '../admin/components';

export default function ShopSettings() {
  const { user, setUser } = useAuth();
  const s = user.shop || {};
  const [form, setForm] = useState({
    name: s.name || '', tagline: s.tagline || '', bio: s.bio || '', district: s.district || 'Colombo',
    phone: s.phone || '', craft: s.craft || '', logo: s.logo || '', banner: s.banner || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/sellers/me', form);
      setUser(data.user);
      toast.success('Shop updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Shop settings"
        subtitle="This is how customers see your shop."
        action={s.status === 'approved' && <Link to={`/artisans/${s.slug}`} target="_blank" className="btn-outline"><ExternalLink className="size-4" /> View shop page</Link>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
          <div><label className="label">Shop name</label><input className="input" required value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Main craft</label><input className="input" value={form.craft} onChange={set('craft')} /></div>
          <div className="sm:col-span-2"><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={set('tagline')} /></div>
          <div className="sm:col-span-2"><label className="label">Your story</label><textarea rows={5} className="input" value={form.bio} onChange={set('bio')} /></div>
          <div>
            <label className="label">District</label>
            <select className="input" value={form.district} onChange={set('district')}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
          </div>
          <div><label className="label">Phone / WhatsApp</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div className="sm:col-span-2"><label className="label">Logo image URL</label><input className="input" value={form.logo} onChange={set('logo')} placeholder="https://…" /></div>
          <div className="sm:col-span-2"><label className="label">Cover image URL</label><input className="input" value={form.banner} onChange={set('banner')} placeholder="https://…" /></div>
          <div className="sm:col-span-2"><button disabled={saving} className="btn-leaf">{saving && <Spinner className="size-4" />} Save changes</button></div>
        </form>

        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Preview</div>
          <div className="card overflow-hidden">
            <Img src={form.banner || form.logo} className="h-32" />
            <div className="px-5 pb-5">
              <Img src={form.logo} className="-mt-8 size-16 rounded-2xl ring-4 ring-white" />
              <h3 className="mt-3 font-display text-xl font-semibold">{form.name || 'Your shop'}</h3>
              <p className="text-sm text-slate-500">{form.tagline || form.craft}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><MapPin className="size-3" /> {form.district}</p>
              <p className="mt-3 line-clamp-4 text-sm text-slate-600">{form.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
