import { useState } from 'react';
import { Ban, Plus, Shield, ShieldOff, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { date, money } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog, EmptyState, Modal, Spinner } from '../components/ui';
import { PageHeader, SearchInput, SkeletonRows, Table } from './components';

export default function Customers() {
  const { user: me } = useAuth();
  const { data, loading, reload } = useFetch('/users');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [creating, setCreating] = useState(null);
  const [busy, setBusy] = useState(false);

  const users = (data?.users || []).filter(
    (u) => (!role || u.role === role) && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
  );

  const patch = async (u, body, msg) => {
    try {
      await api.put(`/users/${u.id}`, body);
      toast.success(msg);
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/users/${deleting.id}`);
      toast.success('User deleted');
      setDeleting(null);
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/users', creating);
      toast.success('User created');
      setCreating(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${data?.users?.length ?? 0} registered users`}
        action={<button onClick={() => setCreating({ name: '', email: '', password: '', role: 'customer' })} className="btn-brand"><Plus className="size-4" /> Add user</button>}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search name or email…" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input !w-auto">
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <Table
        head={['User', 'Role', 'Orders', 'Total spent', 'Joined', 'Status', '']}
        empty={!loading && !users.length && <div className="p-6"><EmptyState icon={Users} title="No users found" /></div>}
      >
        {loading ? (
          <SkeletonRows cols={7} />
        ) : (
          users.map((u) => (
            <tr key={u.id} className="transition hover:bg-slate-50/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className={`grid size-10 place-items-center rounded-full font-bold text-white ${u.role === 'admin' ? 'bg-linear-to-br from-brand-500 to-amber-500' : 'bg-linear-to-br from-slate-400 to-slate-500'}`}>{u.name?.[0]}</span>
                  <div>
                    <div className="font-semibold">{u.name} {u.id === me.id && <span className="text-xs text-slate-400">(you)</span>}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3"><span className={`badge capitalize ${u.role === 'admin' ? 'bg-brand-50 text-brand-700' : u.role === 'seller' ? 'bg-leaf-50 text-leaf-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
              <td className="px-5 py-3">{u.orderCount}</td>
              <td className="px-5 py-3 font-semibold">{money(u.totalSpent)}</td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">{date(u.createdAt)}</td>
              <td className="px-5 py-3">{u.blocked ? <span className="badge bg-rose-50 text-rose-600">Blocked</span> : <span className="badge bg-emerald-50 text-emerald-700">Active</span>}</td>
              <td className="px-5 py-3">
                {u.id !== me.id && (
                  <div className="flex justify-end gap-1">
                    {u.role !== 'seller' && (
                      <IconBtn
                        title={u.role === 'admin' ? 'Make customer' : 'Make admin'}
                        icon={u.role === 'admin' ? ShieldOff : Shield}
                        onClick={() => patch(u, { role: u.role === 'admin' ? 'customer' : 'admin' }, 'Role updated')}
                      />
                    )}
                    <IconBtn
                      title={u.blocked ? 'Unblock' : 'Block'}
                      icon={Ban}
                      active={u.blocked}
                      onClick={() => patch(u, { blocked: !u.blocked }, u.blocked ? 'User unblocked' : 'User blocked')}
                    />
                    <IconBtn title="Delete" icon={Trash2} danger onClick={() => setDeleting(u)} />
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </Table>

      <Modal
        open={!!creating}
        onClose={() => setCreating(null)}
        title="Add user"
        footer={<><button onClick={() => setCreating(null)} className="btn-outline">Cancel</button><button form="user-form" disabled={busy} className="btn-brand">{busy && <Spinner className="size-4" />} Create</button></>}
      >
        {creating && (
          <form id="user-form" onSubmit={create} className="space-y-4">
            <div><label className="label">Name</label><input className="input" required value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} /></div>
            <div><label className="label">Email</label><input type="email" className="input" required value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} /></div>
            <div><label className="label">Password</label><input type="password" minLength={6} className="input" required value={creating.password} onChange={(e) => setCreating({ ...creating, password: e.target.value })} /></div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={creating.role} onChange={(e) => setCreating({ ...creating, role: e.target.value })}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} title="Delete user?" text={`${deleting?.name} (${deleting?.email}) will be permanently deleted. Their past orders are kept.`} />
    </div>
  );
}

function IconBtn({ icon: Icon, title, onClick, danger, active }) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition ${
        active ? 'bg-rose-50 text-rose-600' : danger ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600' : 'text-slate-400 hover:bg-brand-50 hover:text-brand-600'
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}
