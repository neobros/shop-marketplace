import { Lotus } from '../decor';
import useFetch from '../../lib/useFetch';

/** Scrolling announcement strip driven by banners with position "strip". */
export default function AnnouncementBar() {
  const { data } = useFetch('/banners', { params: { position: 'strip' } });
  const texts = data?.banners?.map((b) => b.title).filter(Boolean);
  if (!texts?.length) return null;
  const row = Array.from({ length: 6 }, () => texts).flat();

  return (
    <div className="relative overflow-hidden bg-linear-to-r from-brand-800 via-brand-700 to-brand-600 py-2 text-white">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-xs font-medium sm:text-sm">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="flex items-center gap-2">
            <Lotus className="size-4 opacity-80" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
