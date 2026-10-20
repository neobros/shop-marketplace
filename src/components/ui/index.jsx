import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageOff, LoaderCircle, Star, X } from 'lucide-react';
import { Lotus } from '../decor';

/** Image with skeleton while loading and a graceful fallback on error. */
export function Img({ src, alt = '', className = '', imgClassName = '', priority = false, ...rest }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  const ref = useRef(null);

  // Reset when the source changes, and catch images that finished loading (e.g. from cache)
  // before React attached the onLoad listener — otherwise the skeleton would never go away.
  useEffect(() => {
    if (!src) return setState('error');
    const el = ref.current;
    if (el?.complete) setState(el.naturalWidth > 0 ? 'ok' : 'error');
    else setState('loading');
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {state === 'loading' && <div className="skeleton absolute inset-0 rounded-none" />}
      {state === 'error' ? (
        <div className="absolute inset-0 grid place-items-center text-slate-300">
          <ImageOff className="size-8" />
        </div>
      ) : (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={`h-full w-full object-cover transition-opacity duration-500 ${state === 'ok' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...rest}
        />
      )}
    </div>
  );
}

/** Fades/slides children in when scrolled into view. */
export function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}

export function Stars({ value = 0, size = 'size-4', showValue = false, count }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${size} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
          />
        ))}
      </div>
      {showValue && <span className="text-xs font-semibold text-slate-600">{Number(value).toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-slate-400">({count})</span>}
    </div>
  );
}

export function Spinner({ className = 'size-5' }) {
  return <LoaderCircle className={`animate-spin ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-brand-600">
        <Spinner className="size-8" />
        <span className="text-sm text-slate-500">Loading…</span>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 px-6 py-16 text-center"
    >
      {Icon && (
        <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="size-7" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export function Modal({ open, onClose, title, children, size = 'max-w-lg', footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative flex max-h-[92vh] w-full ${size} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl`}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', text, loading, confirmText = 'Delete' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="max-w-md"
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading && <Spinner className="size-4" />} {confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{text}</p>
    </Modal>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, action, center }) {
  return (
    <div className={`mb-8 flex flex-col gap-3 ${center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <Reveal>
        {eyebrow && (
          <span className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600 ${center ? 'justify-center' : ''}`}>
            <Lotus className="size-4" /> {eyebrow}
          </span>
        )}
        <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-slate-500">{subtitle}</p>}
      </Reveal>
      {action}
    </div>
  );
}
