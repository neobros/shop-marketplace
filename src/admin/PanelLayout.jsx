import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, LogOut, Menu, PanelLeft, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/layout/Navbar';
import { FlagStripe, Lotus } from '../components/decor';

/**
 * Shared dashboard shell for the admin panel and the seller dashboard.
 * nav: [{ to, label, icon, end?, badge? }]
 */
export default function PanelLayout({ nav, title, roleLabel, accent = 'brand', banner }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const current = [...nav].sort((a, b) => b.to.length - a.to.length).find((n) => location.pathname.startsWith(n.to)) || nav[0];
  const activeBg = accent === 'leaf' ? 'from-leaf-600 to-leaf-500 shadow-leaf-950/40' : 'from-brand-600 to-brand-500 shadow-brand-950/40';

  useEffect(() => setMobile(false), [location.pathname]);

  const sidebar = (isCollapsed) => (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 p-4">
      <Lotus className="pointer-events-none absolute -bottom-10 -left-10 size-56 text-white/[0.03]" strokeWidth={0.8} />
      <div className={`mb-6 flex items-center ${isCollapsed ? 'justify-center' : ''} px-1 pt-1`}>
        <Logo light compact={isCollapsed} />
      </div>
      {!isCollapsed && (
        <div className="mb-5 rounded-2xl bg-white/5 px-3 py-2.5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{roleLabel}</div>
          <div className="truncate text-sm font-semibold text-white">{title}</div>
          <FlagStripe className="mt-2" />
        </div>
      )}
      <nav className="flex flex-col gap-1">
        {nav.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobile(false)}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span layoutId={`panel-nav-${roleLabel}`} className={`absolute inset-0 rounded-xl bg-linear-to-r shadow-lg ${activeBg}`} transition={{ type: 'spring', damping: 26, stiffness: 300 }} />
                )}
                <Icon className="relative size-5 shrink-0" />
                {!isCollapsed && <span className="relative flex-1">{label}</span>}
                {!!badge && (
                  <span className={`relative grid min-w-5 place-items-center rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-slate-900 ${isCollapsed ? 'absolute -right-1 -top-1' : ''}`}>{badge}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <Link to="/" target="_blank" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}>
          <ExternalLink className="size-5" /> {!isCollapsed && 'View store'}
        </Link>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="size-5" /> {!isCollapsed && 'Log out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <motion.aside animate={{ width: collapsed ? 84 : 264 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="sticky top-0 hidden h-screen shrink-0 overflow-hidden lg:block">
        {sidebar(collapsed)}
      </motion.aside>

      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
              <button onClick={() => setMobile(false)} className="absolute right-3 top-5 z-10 rounded-lg p-1.5 text-slate-400 hover:text-white"><X className="size-5" /></button>
              {sidebar(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobile(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
            <button onClick={() => setCollapsed((c) => !c)} className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:block" aria-label="Toggle sidebar"><PanelLeft className="size-5" /></button>
            <div>
              <div className="text-xs text-slate-400">{roleLabel} / {current.label}</div>
              <div className="text-sm font-bold text-slate-900">{current.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-slate-400">{roleLabel}</div>
            </div>
            <div className={`grid size-10 place-items-center rounded-xl bg-linear-to-br font-bold text-white shadow-md ${accent === 'leaf' ? 'from-leaf-500 to-leaf-700' : 'from-brand-500 to-brand-700'}`}>{user.name[0]}</div>
          </div>
        </header>
        {banner}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
