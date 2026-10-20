import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/api';
import { Spinner } from '../components/ui';
import { Logo } from '../components/layout/Navbar';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <img
          src="https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Woman_with_brush_painting_batik_Sri_Lanka.JPG/1280px-Woman_with_brush_painting_batik_Sri_Lanka.JPG"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-linear-to-br from-brand-900/85 via-slate-950/50 to-leaf-900/70" />
        <div className="pointer-events-none absolute -left-10 top-20 size-80 animate-blob rounded-full bg-brand-500/40 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo light />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="max-w-md text-5xl font-semibold leading-tight">Ayubowan! Discover the island’s finest handmade crafts.</h2>
            <p className="mt-4 max-w-sm text-white/70">Batik, pottery, masks, tea and more — straight from the artisans who make them.</p>
            <div className="mt-8 flex -space-x-3">
              {['1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1438761681033-6461ffad8d80', '1500648767791-00dcc994a43e'].map((id) => (
                <img key={id} src={`https://images.unsplash.com/photo-${id}?w=80&h=80&fit=crop`} alt="" className="size-11 rounded-full object-cover ring-2 ring-slate-900" />
              ))}
              <span className="grid size-11 place-items-center rounded-full bg-white text-xs font-bold text-slate-900 ring-2 ring-slate-900">100+</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </motion.div>
      </div>
    </div>
  );
}

function IconInput({ icon: Icon, type = 'text', ...props }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input type={isPw && show ? 'text' : type} className="input !py-3 !pl-11 !pr-11" {...props} />
      {isPw && (
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    </div>
  );
}

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={location.state?.from || (user.role === 'admin' ? '/admin' : '/')} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(location.state?.from || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footer={<>Don't have an account? <Link to="/register" state={location.state} className="font-semibold text-brand-600">Create one</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <IconInput icon={Mail} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <IconInput icon={Lock} type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        <button disabled={loading} className="btn-brand w-full !py-3.5">{loading && <Spinner className="size-4" />} Sign in</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created!');
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Shop authentic Sri Lankan crafts — or open your own artisan shop later."
      footer={<>Already have an account? <Link to="/login" state={location.state} className="font-semibold text-brand-600">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <IconInput icon={User} required value={form.name} onChange={set('name')} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="label">Email</label>
          <IconInput icon={Mail} type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Password</label>
            <IconInput icon={Lock} type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min 6 chars" />
          </div>
          <div>
            <label className="label">Confirm</label>
            <IconInput icon={Lock} type="password" required value={form.confirm} onChange={set('confirm')} placeholder="Repeat" />
          </div>
        </div>
        <button disabled={loading} className="btn-brand w-full !py-3.5">{loading && <Spinner className="size-4" />} Create account</button>
      </form>
    </AuthShell>
  );
}
