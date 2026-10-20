const num = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

/** Sri Lankan rupees, e.g. "Rs 4,500" */
export const money = (n) => `Rs ${num.format(Math.round(Number(n) || 0))}`;

/** Short form for charts, e.g. "Rs 1.2M" */
export const shortMoney = (n) => `Rs ${compact.format(Number(n) || 0)}`;

export const date = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', opts) : '—';

export const dateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const discountPct = (price, compare) => (compare > price ? Math.round(((compare - price) / compare) * 100) : 0);

export { FREE_SHIPPING_OVER, SHIPPING_FLAT } from './brand';
