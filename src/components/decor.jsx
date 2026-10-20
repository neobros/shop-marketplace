import { motion } from 'framer-motion';

/** Stylised lotus (nelum) — the brand mark. */
export function Lotus({ className = 'size-6', strokeWidth = 1.6 }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M24 8c5 6 6 14 0 22-6-8-5-16 0-22z" />
      <path d="M24 30c-4-7-10-11-17-11 1 8 7 12 17 11z" />
      <path d="M24 30c4-7 10-11 17-11-1 8-7 12-17 11z" />
      <path d="M24 30c-6 0-12 2-16 6 6 3 12 2 16-6zM24 30c6 0 12 2 16 6-6 3-12 2-16-6z" />
      <path d="M10 40h28" strokeLinecap="round" />
    </svg>
  );
}

/** Thin four-colour stripe inspired by the Sri Lankan flag (maroon, saffron, green, orange). */
export function FlagStripe({ className = '' }) {
  return (
    <div className={`flex h-1 overflow-hidden rounded-full ${className}`} aria-hidden="true">
      <span className="flex-[3] bg-[#8d153a]" />
      <span className="flex-1 bg-[#f7b718]" />
      <span className="flex-1 bg-[#00534e]" />
      <span className="flex-1 bg-[#eb7400]" />
    </div>
  );
}

/** Small ornamental divider: line · lotus · line */
export function LotusDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 text-brand-500 ${className}`} aria-hidden="true">
      <span className="h-px w-10 bg-linear-to-r from-transparent to-brand-300" />
      <Lotus className="size-5" />
      <span className="h-px w-10 bg-linear-to-l from-transparent to-brand-300" />
    </div>
  );
}

/** Slowly rotating "liyawela" ring of petals — decorative background element. */
export function Mandala({ className = '', petals = 16 }) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 90, ease: 'linear' }}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="100" cy="100" r="96" strokeDasharray="2 6" />
        <circle cx="100" cy="100" r="40" />
        <circle cx="100" cy="100" r="22" strokeDasharray="3 4" />
        {Array.from({ length: petals }, (_, i) => (
          <g key={i} transform={`rotate(${(360 / petals) * i} 100 100)`}>
            <path d="M100 60c8 10 8 20 0 30-8-10-8-20 0-30z" />
            <path d="M100 12c5 7 5 14 0 22-5-8-5-15 0-22z" />
            <circle cx="100" cy="44" r="2" />
          </g>
        ))}
      </g>
    </motion.svg>
  );
}
