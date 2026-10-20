import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Check, Heart, MapPin, PackageX, Ruler, RotateCcw, ShoppingBag, Sprout, Store, Truck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api, { errMsg } from '../lib/api';
import useFetch from '../lib/useFetch';
import { date, discountPct, money } from '../lib/format';
import { EmptyState, Img, PageLoader, SectionTitle, Spinner, Stars } from '../components/ui';
import { QtyControl } from '../components/layout/CartDrawer';
import { ProductGrid } from '../components/ProductCard';

export default function ProductDetails() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useFetch(`/products/${slug}`);
  const { add } = useCart();
  const { user, inWishlist, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [tab, setTab] = useState('description');

  useEffect(() => {
    setImg(0);
    setQty(1);
    setColor('');
    setSize('');
  }, [slug]);

  if (loading) return <PageLoader />;
  if (error || !data?.product)
    return (
      <div className="container-x py-20">
        <EmptyState icon={PackageX} title="Product not found" text={error} action={<Link to="/shop" className="btn-primary">Back to shop</Link>} />
      </div>
    );

  const { product: p, seller, reviews, related } = data;
  const off = discountPct(p.price, p.comparePrice);
  const out = (p.stock ?? 0) <= 0;
  const images = p.images?.length ? p.images : [''];
  const liked = inWishlist(p.id);

  const validate = () => {
    if (p.colors?.length && !color) return toast.error('Please choose a colour'), false;
    if (p.sizes?.length && !size) return toast.error('Please choose a size'), false;
    return true;
  };
  const onAdd = () => {
    if (!validate()) return;
    add(p, qty, { color, size });
    toast.success('Added to cart');
  };
  const onBuy = () => {
    if (!validate()) return;
    add(p, qty, { color, size });
    navigate('/checkout');
  };
  const onLike = async () => {
    if (!user) return navigate('/login', { state: { from: `/product/${slug}` } });
    try {
      toast.success((await toggleWishlist(p.id)) ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="container-x pt-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link> <span className="mx-1">/</span>
        <Link to="/shop" className="hover:text-brand-600">Shop</Link>
        {p.category && (<> <span className="mx-1">/</span> <Link to={`/shop?category=${p.category.slug}`} className="hover:text-brand-600">{p.category.name}</Link></>)}
        <span className="mx-1">/</span> <span className="text-slate-800">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-50">
            <AnimatePresence mode="wait">
              <motion.div key={img} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                <ZoomImage src={images[img]} alt={p.name} />
              </motion.div>
            </AnimatePresence>
            {off > 0 && <span className="badge absolute left-5 top-5 bg-rose-500 !px-3 !py-1 text-sm text-white shadow-lg">-{off}%</span>}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImg(i)}
                  className={`overflow-hidden rounded-2xl ring-2 transition ${i === img ? 'ring-brand-500' : 'ring-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Img src={src} className="size-20" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2">
            <span className="badge bg-leaf-50 text-leaf-700"><BadgeCheck className="size-3.5" /> Handmade in {p.district || 'Sri Lanka'}</span>
            {p.isNew && <span className="badge bg-brand-50 text-brand-700">New</span>}
          </div>
          <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={p.rating} showValue count={p.numReviews} />
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">{p.sold || 0} sold</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-900">{money(p.price)}</span>
            {off > 0 && (
              <>
                <span className="text-xl text-slate-400 line-through">{money(p.comparePrice)}</span>
                <span className="badge bg-emerald-50 text-emerald-700">You save {money(p.comparePrice - p.price)}</span>
              </>
            )}
          </div>
          {p.shortDescription && <p className="mt-5 leading-relaxed text-slate-600">{p.shortDescription}</p>}

          {p.colors?.length > 0 && (
            <div className="mt-7">
              <div className="mb-3 text-sm font-semibold">Colour: <span className="font-normal text-slate-500">{color || 'Choose'}</span></div>
              <div className="flex flex-wrap gap-2">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${color === c ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:border-slate-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          {p.sizes?.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 text-sm font-semibold">Size: <span className="font-normal text-slate-500">{size || 'Choose'}</span></div>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`grid h-11 min-w-11 place-items-center rounded-xl border px-3 text-sm font-semibold transition ${size === s ? 'border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'border-slate-200 hover:border-slate-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center gap-2 text-sm">
            {out ? (
              <span className="badge bg-rose-50 text-rose-600">Out of stock</span>
            ) : p.stock <= 5 ? (
              <span className="flex items-center gap-2 font-medium text-amber-600">
                <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400" /><span className="relative size-2 rounded-full bg-amber-500" /></span>
                Only {p.stock} left — order soon
              </span>
            ) : (
              <span className="flex items-center gap-2 font-medium text-emerald-600"><Check className="size-4" /> In stock</span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QtyControl value={qty} max={p.stock} onChange={setQty} />
            <button onClick={onAdd} disabled={out} className="btn-primary flex-1 !py-3.5">
              <ShoppingBag className="size-5" /> Add to cart
            </button>
            <button onClick={onLike} className={`grid size-[50px] place-items-center rounded-xl border transition hover:scale-105 ${liked ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 text-slate-600'}`} aria-label="Wishlist">
              <Heart className={`size-5 ${liked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
          <button onClick={onBuy} disabled={out} className="btn-brand mt-3 w-full !py-3.5">
            <Zap className="size-5" /> Buy it now
          </button>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-600">
            <div className="flex flex-col items-center gap-1.5"><Truck className="size-5 text-brand-600" /> Free delivery over Rs 15,000</div>
            <div className="flex flex-col items-center gap-1.5"><RotateCcw className="size-5 text-brand-600" /> 7-day easy returns</div>
            <div className="flex flex-col items-center gap-1.5"><Check className="size-5 text-brand-600" /> Cash on delivery</div>
          </div>
          {(p.materials || p.dimensions) && (
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {p.materials && <div className="flex items-start gap-2"><Sprout className="mt-0.5 size-4 text-leaf-600" /><div><dt className="text-xs text-slate-400">Materials</dt><dd className="font-medium">{p.materials}</dd></div></div>}
              {p.dimensions && <div className="flex items-start gap-2"><Ruler className="mt-0.5 size-4 text-leaf-600" /><div><dt className="text-xs text-slate-400">Size</dt><dd className="font-medium">{p.dimensions}</dd></div></div>}
            </dl>
          )}

          {seller && (
            <Link to={`/artisans/${seller.slug}`} className="group mt-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-cream p-4 transition hover:border-brand-200 hover:shadow-soft">
              <Img src={seller.logo} className="size-14 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Made by</div>
                <div className="truncate font-display text-lg font-semibold group-hover:text-brand-700">{seller.name}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="size-3" /> {seller.district} · {seller.craft}</div>
              </div>
              <span className="btn-outline !px-3 !py-2 text-xs"><Store className="size-3.5" /> Visit shop</span>
            </Link>
          )}
          {p.sku && <p className="mt-4 text-xs text-slate-400">SKU: {p.sku}</p>}
        </motion.div>
      </div>

      {/* Tabs */}
      <section className="mt-16">
        <div className="flex gap-6 border-b border-slate-200">
          {[['description', 'Description'], ['reviews', `Reviews (${reviews.length})`]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`relative pb-3 text-sm font-semibold ${tab === k ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              {l}
              {tab === k && <motion.span layoutId="pd-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />}
            </button>
          ))}
        </div>
        <div className="py-8">
          {tab === 'description' ? (
            <p className="max-w-3xl whitespace-pre-line leading-relaxed text-slate-600">{p.description || 'No description.'}</p>
          ) : (
            <Reviews productId={p.id} reviews={reviews} onAdded={reload} />
          )}
        </div>
      </section>

      {related?.length > 0 && (
        <section className="mt-8">
          <SectionTitle eyebrow="You may also like" title="Related products" />
          <ProductGrid products={related.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}

function ZoomImage({ src, alt }) {
  const [pos, setPos] = useState(null);
  return (
    <div
      className="relative aspect-square cursor-zoom-in overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseLeave={() => setPos(null)}
    >
      <Img src={src} alt={alt} className="h-full w-full" priority />
      {pos && src && (
        <div
          className="pointer-events-none absolute inset-0 hidden bg-no-repeat md:block"
          style={{ backgroundImage: `url(${src})`, backgroundSize: '200%', backgroundPosition: `${pos.x}% ${pos.y}%` }}
        />
      )}
    </div>
  );
}

function Reviews({ productId, reviews, onAdded }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const mine = user && reviews.some((r) => r.userId === user.id);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      toast.success('Thanks for your review!');
      setComment('');
      onAdded();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {reviews.length === 0 && <p className="text-slate-500">No reviews yet. Be the first to review this product.</p>}
        {reviews.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">{r.userName?.[0]}</span>
                <div>
                  <div className="text-sm font-semibold">{r.userName}</div>
                  <div className="text-xs text-slate-400">{date(r.createdAt)}</div>
                </div>
              </div>
              <Stars value={r.rating} />
            </div>
            {r.comment && <p className="mt-3 text-sm text-slate-600">{r.comment}</p>}
          </motion.div>
        ))}
      </div>
      <div className="card h-fit p-6">
        <h4 className="font-bold">Write a review</h4>
        {!user ? (
          <p className="mt-2 text-sm text-slate-500"><Link to="/login" className="font-semibold text-brand-600">Sign in</Link> to leave a review.</p>
        ) : mine ? (
          <p className="mt-2 text-sm text-slate-500">You've already reviewed this product. Thank you!</p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="transition hover:scale-125">
                  <svg viewBox="0 0 24 24" className={`size-7 ${(hover || rating) >= n ? 'fill-amber-400' : 'fill-slate-200'}`}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Share your thoughts…" className="input" />
            <button disabled={saving} className="btn-primary w-full">{saving && <Spinner className="size-4" />} Submit review</button>
          </form>
        )}
      </div>
    </div>
  );
}
