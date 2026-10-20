import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, HandHeart, Truck } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { FlagStripe, Lotus, Mandala } from '../decor';

const FALLBACK = [
  {
    id: 'f1',
    tag: 'Handmade in Sri Lanka',
    title: 'Crafted by island hands, made for your home',
    subtitle: 'Add hero banners from the admin panel to customise this slider.',
    image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1600&q=80&auto=format&fit=crop',
    buttonText: 'Explore crafts',
    link: '/shop',
    bgColor: '#fdf3e7',
  },
];

const DELAY = 6500;

export default function HeroSlider({ banners }) {
  const slides = banners?.length ? banners : FALLBACK;
  const [active, setActive] = useState(0);
  const swiperRef = useRef(null);

  return (
    <section className="relative">
      <div className="container-x pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-[2.5rem]">
          <Swiper
            className="hero-swiper"
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={1000}
            loop={slides.length > 1}
            autoplay={{ delay: DELAY, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            onSwiper={(s) => (swiperRef.current = s)}
            onSlideChange={(s) => setActive(s.realIndex)}
          >
            {slides.map((b, i) => (
              <SwiperSlide key={b.id}>
                <Slide banner={b} isActive={i === active} />
              </SwiperSlide>
            ))}
          </Swiper>

          {slides.length > 1 && (
            <div className="absolute bottom-6 right-6 z-10 hidden gap-2 md:flex">
              <button onClick={() => swiperRef.current?.slidePrev()} className="grid size-11 place-items-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:scale-110 hover:bg-white" aria-label="Previous slide">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => swiperRef.current?.slideNext()} className="grid size-11 place-items-center rounded-full bg-slate-900 text-white shadow-lg transition hover:scale-110 hover:bg-brand-600" aria-label="Next slide">
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}

          {slides.length > 1 && (
            <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-slate-900/5">
              <motion.div
                key={active}
                className="h-full bg-linear-to-r from-brand-600 via-amber-500 to-leaf-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: DELAY / 1000, ease: 'linear' }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Slide({ banner: b, isActive }) {
  const item = (delay) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <div className="relative grid min-h-[600px] items-center overflow-hidden md:min-h-[620px] md:grid-cols-[1.05fr_1fr]" style={{ background: b.bgColor || '#fdf3e7' }}>
      <div className="bg-pattern pointer-events-none absolute inset-0 opacity-70" />
      <Mandala className="pointer-events-none absolute -left-24 -top-24 size-[420px] text-brand-500/15" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 size-72 animate-blob rounded-full bg-amber-300/25 blur-3xl" />

      <div className="relative z-10 px-6 py-12 sm:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div key="content" exit={{ opacity: 0 }}>
              {b.tag && (
                <motion.span {...item(0.1)} className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700 shadow-sm backdrop-blur">
                  <Lotus className="size-4" /> {b.tag}
                </motion.span>
              )}
              <motion.h1 {...item(0.2)} className="max-w-xl text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-[3.6rem]" style={{ color: b.textColor || '#1c1917' }}>
                {b.title}
              </motion.h1>
              <motion.div {...item(0.3)} className="mt-5 w-28"><FlagStripe /></motion.div>
              {b.subtitle && (
                <motion.p {...item(0.4)} className="mt-5 max-w-md text-base text-slate-600 sm:text-lg">{b.subtitle}</motion.p>
              )}
              <motion.div {...item(0.55)} className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={b.link || '/shop'} className="btn-primary group !px-7 !py-3.5 text-base">
                  {b.buttonText || 'Shop now'}
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/artisans" className="btn !px-5 !py-3.5 text-base text-slate-700 hover:text-brand-600">Meet the artisans</Link>
              </motion.div>
              <motion.div {...item(0.7)} className="mt-10 hidden items-center gap-6 text-sm text-slate-600 sm:flex">
                <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-leaf-600" /> 100% handmade</span>
                <span className="flex items-center gap-2"><Truck className="size-4 text-leaf-600" /> Island-wide COD</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image in a temple-arch frame */}
      <div className="relative h-80 px-6 pb-10 md:h-full md:px-0 md:py-10 md:pr-10">
        <div className="relative h-full overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-2xl ring-8 ring-white/60">
          <motion.img
            src={b.image}
            alt={b.title}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.15 }}
            animate={isActive ? { scale: 1 } : { scale: 1.15 }}
            transition={{ duration: 7, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />
        </div>

        {isActive && (
          <>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="absolute -left-6 top-16 hidden animate-float rounded-2xl bg-white/90 p-3 pr-5 shadow-xl backdrop-blur-md lg:flex lg:items-center lg:gap-3"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><HandHeart className="size-5" /></div>
              <div>
                <div className="text-sm font-bold">100+ artisans</div>
                <div className="text-xs text-slate-500">from all 25 districts</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="absolute bottom-16 right-14 hidden animate-float rounded-2xl bg-white/90 px-5 py-3 shadow-xl backdrop-blur-md [animation-delay:-3s] lg:block"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Made with love in</div>
              <div className="font-display text-2xl font-bold text-gradient">Sri Lanka</div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
