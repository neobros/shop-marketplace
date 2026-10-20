import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Plus, Search, Trash2 } from 'lucide-react';
import { Img } from '../components/ui';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Number that animates from 0 to value when visible. */
export function CountUp({ value, format = (n) => Math.round(n).toLocaleString() }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value || 0, { duration: 1.4, ease: 'easeOut', onUpdate: setDisplay });
    return () => c.stop();
  }, [inView, value]);
  return <span ref={ref}>{format(display)}</span>;
}

export function StatCard({ label, value, format, change, icon: Icon, tint = 'brand', delay = 0, hint }) {
  const tints = {
    brand: 'from-brand-500 to-amber-500 shadow-brand-500/30',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
    amber: 'from-amber-400 to-amber-600 shadow-amber-500/30',
    rose: 'from-brand-700 to-brand-950 shadow-brand-900/30',
    sky: 'from-sky-500 to-cyan-500 shadow-sky-500/30',
  };
  const up = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="card relative overflow-hidden p-5"
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-linear-to-br opacity-10 ${tints[tint]}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 whitespace-nowrap text-2xl font-extrabold tracking-tight text-slate-900">
            <CountUp value={value} format={format} />
          </p>
        </div>
        <div className={`grid size-12 place-items-center rounded-2xl bg-linear-to-br text-white shadow-lg ${tints[tint]}`}>
          <Icon className="size-5" />
        </div>
      </div>
      {(change !== undefined || hint) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {change !== undefined && (
            <span className={`badge ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(change)}%
            </span>
          )}
          <span className="text-slate-400">{hint}</span>
        </div>
      )}
    </motion.div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input !pl-10 sm:!w-72" />
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${checked ? 'right-0.5' : 'left-0.5'}`}
        />
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}

/** Edit a list of image URLs with live previews. */
export function ImagesInput({ value = [], onChange, max = 6 }) {
  const [url, setUrl] = useState('');
  const add = () => {
    const u = url.trim();
    if (!u || value.includes(u) || value.length >= max) return;
    onChange([...value, u]);
    setUrl('');
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Paste image URL and press Enter"
          className="input"
        />
        <button type="button" onClick={add} className="btn-outline shrink-0 !px-3"><Plus className="size-4" /></button>
      </div>
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {value.map((src, i) => (
            <div key={src} className="group relative">
              <Img src={src} className="size-20 rounded-xl ring-1 ring-slate-200" />
              {i === 0 && <span className="badge absolute bottom-1 left-1 bg-slate-900/80 !px-1.5 text-[10px] text-white">Main</span>}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== src))}
                className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-rose-500 text-white opacity-0 shadow transition group-hover:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Table({ head, children, empty }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>{head.map((h, i) => <th key={i} className={`whitespace-nowrap px-5 py-3.5 ${h.className || ''}`}>{h.label ?? h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
      {empty}
    </div>
  );
}

export function SkeletonRows({ cols, rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((__, j) => (
        <td key={j} className="px-5 py-4"><div className="skeleton h-4 w-full max-w-[140px]" /></td>
      ))}
    </tr>
  ));
}
