export const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-sky-50 text-sky-700 ring-sky-200',
  shipped: 'bg-teal-50 text-teal-700 ring-teal-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  unpaid: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export const STATUS_COLORS = {
  pending: '#d4a53d',
  processing: '#0ea5e9',
  shipped: '#0d9488',
  delivered: '#10b981',
  cancelled: '#f43f5e',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge capitalize ring-1 ring-inset ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
