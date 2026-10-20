import { motion } from 'framer-motion';
import { Eye, Heart, MapPin, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { discountPct, money } from '../lib/format';
import { errMsg } from '../lib/api';
import { Img, Stars } from './ui';

export default function ProductCard({ product, index = 0 }) {
  const { add } = useCart();
  const { user, inWishlist, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const off = discountPct(product.price, product.comparePrice);
  const out = (product.stock ?? 0) <= 0;
  const needsOptions = product.sizes?.length || product.colors?.length;
  const liked = inWishlist(product.id);

  const onAdd = (e) => {
    e.preventDefault();
    if (needsOptions) return navigate(`/product/${product.slug || product.id}`);
    add(product, 1);
    toast.success('Added to cart');
  };

  const onLike = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: window.location.pathname } });
    try {
      const now = await toggleWishlist(product.id);
      toast.success(now ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/product/${product.slug || product.id}`}
        className="group block rounded-3xl bg-white p-2.5 ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift hover:ring-brand-100"
      >
        <div className="relative">
          <Img
            src={product.images?.[0]}
            alt={product.name}
            className="aspect-[4/5] rounded-2xl"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full rounded-2xl object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {off > 0 && <span className="badge bg-rose-500 text-white shadow">-{off}%</span>}
            {product.isNew && <span className="badge bg-white/90 text-leaf-700 shadow backdrop-blur">New</span>}
            {out && <span className="badge bg-slate-900 text-white">Sold out</span>}
          </div>

          <button
            onClick={onLike}
            aria-label="Toggle wishlist"
            className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 shadow backdrop-blur transition hover:scale-110 ${liked ? 'text-rose-500' : 'text-slate-500'}`}
          >
            <Heart className={`size-4 ${liked ? 'fill-rose-500' : ''}`} />
          </button>

          <div className="absolute inset-x-3 bottom-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={onAdd}
              disabled={out}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900/95 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-brand-600 disabled:opacity-50"
            >
              <ShoppingBag className="size-4" /> {needsOptions ? 'Choose options' : 'Add to cart'}
            </button>
            <span className="grid size-10 place-items-center rounded-xl bg-white/95 text-slate-700 backdrop-blur">
              <Eye className="size-4" />
            </span>
          </div>
        </div>

        <div className="px-1.5 pb-1.5 pt-3.5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1 truncate text-xs text-slate-400">
              <MapPin className="size-3 shrink-0 text-brand-400" />
              <span className="truncate">{product.district || 'Sri Lanka'}</span>
            </span>
            <Stars value={product.rating} size="size-3" />
          </div>
          <h3 className="line-clamp-1 font-semibold text-slate-900 transition-colors group-hover:text-brand-600">
            {product.name}
          </h3>
          {product.shopName && <p className="truncate text-xs text-slate-500">by <span className="font-medium text-leaf-700">{product.shopName}</span></p>}
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">{money(product.price)}</span>
            {off > 0 && <span className="text-sm text-slate-400 line-through">{money(product.comparePrice)}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl p-2.5 ring-1 ring-slate-100">
      <div className="skeleton aspect-[4/5] rounded-2xl" />
      <div className="space-y-2 px-1.5 pb-1.5 pt-3.5">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-5 w-1/4" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, loading, count = 8, cols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 sm:gap-6 ${cols}`}>
      {loading
        ? Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}
