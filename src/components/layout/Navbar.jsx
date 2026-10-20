import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, Store, User, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import useFetch from '../../lib/useFetch';
import { BRAND } from '../../lib/brand';
import { categoryIcon } from '../../lib/icons';

/** Brand logo from /public/brand. `light` = version for dark backgrounds, `compact` = emblem only. */
export function Logo({ light, compact, className = '' }) {
  const src = compact ? (light ? '/brand/emblem-light.png' : '/brand/emblem.png') : light ? '/brand/logo-light.png' : '/brand/logo.png';
  return (
    <Link to="/" className={`group flex shrink-0 items-center ${className}`} aria-label={BRAND.name}>
      <img
        src={src}
        alt={BRAND.name}
        className={`w-auto transition-transform duration-500 group-hover:scale-[1.03] ${compact ? 'h-10' : 'h-11 sm:h-14'}`}
        width={compact ? 33 : 137}
        height={40}
      />
    </Link>
  );
}

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/artisans', label: 'Artisans' },
  { to: '/sell', label: 'Sell with us' },
];

export default function Navbar() {
  const { user, isAdmin, isSeller, logout } = useAuth();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const { data } = useFetch('/categories');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobile(false);
    setSearchOpen(false);
    setMenu(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    setQ('');
  };

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-slate-100 bg-white/85 shadow-soft backdrop-blur-xl' : 'bg-white'}`}>
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setMobile(true)} aria-label="Menu">
            <Menu className="size-5" />
          </button>
          <Logo />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.slice(0, 2).map((l) => <NavItem key={l.to} {...l} active={isActive(l.to)} />)}
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-brand-600">
              Crafts <ChevronDown className="size-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-[620px] -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid grid-cols-3 gap-1 rounded-3xl border border-slate-100 bg-white p-3 shadow-xl">
                {data?.categories?.map((c) => {
                  const Icon = categoryIcon(c.icon);
                  return (
                    <Link key={c.id} to={`/shop?category=${c.slug}`} className="group/item flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-brand-50">
                      <span className="relative">
                        <img src={c.image} alt="" className="size-11 rounded-xl object-cover" />
                        <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-white text-brand-600 shadow">
                          <Icon className="size-3" />
                        </span>
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover/item:text-brand-700">{c.name}</div>
                        <div className="text-xs text-slate-400">{c.productCount} items</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          {links.slice(2).map((l) => <NavItem key={l.to} {...l} active={isActive(l.to)} />)}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <form onSubmit={submitSearch} className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search batik, tea, masks…"
              className="w-44 rounded-full border border-slate-200 bg-cream py-2 pl-10 pr-4 text-sm outline-none transition-all focus:w-64 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 xl:w-56"
            />
          </form>
          <button className="rounded-full p-2.5 hover:bg-slate-100 md:hidden" onClick={() => setSearchOpen((s) => !s)} aria-label="Search">
            <Search className="size-5" />
          </button>

          {user && (
            <Link to="/account/wishlist" className="relative hidden rounded-full p-2.5 hover:bg-slate-100 sm:block" aria-label="Wishlist">
              <Heart className="size-5" />
              {user.wishlist?.length > 0 && (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{user.wishlist.length}</span>
              )}
            </Link>
          )}

          <button onClick={() => setOpen(true)} className="relative rounded-full p-2.5 hover:bg-slate-100" aria-label="Cart">
            <ShoppingBag className="size-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1.4, 1] }}
                  exit={{ scale: 0 }}
                  className="absolute right-0.5 top-0.5 grid size-[18px] place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-2 ring-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenu((m) => !m)} className="ml-1 flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 transition hover:border-brand-300">
                <span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-brand-500 to-amber-500 text-sm font-bold text-white">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate text-sm font-medium sm:block">{user.name.split(' ')[0]}</span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl"
                  >
                    <div className="px-3 py-2">
                      <div className="truncate text-sm font-semibold">{user.name}</div>
                      <div className="truncate text-xs text-slate-400">{user.email}</div>
                    </div>
                    <div className="my-1 h-px bg-slate-100" />
                    {isAdmin && <MenuLink to="/admin" icon={LayoutDashboard} className="text-brand-700">Admin panel</MenuLink>}
                    {isSeller && (
                      <MenuLink to="/seller" icon={Store} className="text-leaf-700">
                        Seller dashboard
                        {user.shop?.status !== 'approved' && <span className="badge ml-auto bg-amber-50 capitalize text-amber-700">{user.shop?.status}</span>}
                      </MenuLink>
                    )}
                    <MenuLink to="/account" icon={User}>My account</MenuLink>
                    <MenuLink to="/account/orders" icon={Package}>My orders</MenuLink>
                    <MenuLink to="/account/wishlist" icon={Heart}>Wishlist</MenuLink>
                    {!isSeller && !isAdmin && <MenuLink to="/sell" icon={Store}>Open a shop</MenuLink>}
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="size-4" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-primary ml-1 hidden !px-4 !py-2 sm:inline-flex">
              <User className="size-4" /> Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.form onSubmit={submitSearch} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100 md:hidden">
            <div className="container-x py-3">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search batik, tea, masks…" className="input" />
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white p-5 shadow-2xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button onClick={() => setMobile(false)} className="rounded-lg p-2 hover:bg-slate-100"><X className="size-5" /></button>
              </div>
              <nav className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.div key={l.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                    <Link to={l.to} className="block rounded-xl px-4 py-3 font-medium hover:bg-brand-50 hover:text-brand-600">{l.label}</Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mb-2 mt-6 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Crafts</div>
              <div className="flex flex-col gap-1 overflow-y-auto">
                {data?.categories?.map((c) => (
                  <Link key={c.id} to={`/shop?category=${c.slug}`} className="flex items-center gap-3 rounded-xl px-4 py-2 hover:bg-slate-50">
                    <img src={c.image} alt="" className="size-8 rounded-lg object-cover" />
                    <span className="text-sm">{c.name}</span>
                  </Link>
                ))}
              </div>
              {!user && <Link to="/login" className="btn-primary mt-auto">Sign in</Link>}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavItem({ to, label, active }) {
  return (
    <Link to={to} className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors hover:text-brand-600 ${active ? 'text-brand-600' : 'text-slate-600'}`}>
      {label}
      {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-linear-to-r from-brand-500 to-amber-500" />}
    </Link>
  );
}

function MenuLink({ to, icon: Icon, children, className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 ${className}`}>
      <Icon className="size-4" /> {children}
    </Link>
  );
}
