import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import HeroSlider from '../components/home/HeroSlider';
import {
  ArtisansShowcase, CategoryCircles, CraftMarquee, DealOfTheDay, FeatureStrip, Newsletter, PromoBanners, SellCTA, StorySection,
} from '../components/home/Sections';
import { ProductGrid } from '../components/ProductCard';
import { SectionTitle } from '../components/ui';
import useFetch from '../lib/useFetch';

const TABS = [
  { key: 'featured', label: 'Featured', params: { featured: true, limit: 8 } },
  { key: 'new', label: 'New arrivals', params: { isNew: true, limit: 8 } },
  { key: 'popular', label: 'Best sellers', params: { sort: 'popular', limit: 8 } },
  { key: 'rating', label: 'Top rated', params: { sort: 'rating', limit: 8 } },
];

// Imagery for the story / sell sections (swap for your own photos)
const STORY_IMG = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Woman_batik_painting_Sri_Lanka.JPG/960px-Woman_batik_painting_Sri_Lanka.JPG';
const STORY_IMG_2 = 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=600&q=80&auto=format&fit=crop';
const SELL_IMG = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Polonn%C3%A4ruv%C3%A2_Centre_artisanal_de_sculptures_sur_bois_WLF2023_%281%29.jpg/960px-Polonn%C3%A4ruv%C3%A2_Centre_artisanal_de_sculptures_sur_bois_WLF2023_%281%29.jpg';

export default function Home() {
  const [tab, setTab] = useState(TABS[0]);
  const { data: bannerData } = useFetch('/banners');
  const { data: catData } = useFetch('/categories');
  const { data: sellerData } = useFetch('/sellers');
  const { data: tabData, loading: tabLoading } = useFetch('/products', { params: tab.params });
  const { data: dealData } = useFetch('/products', { params: { sort: 'popular', limit: 12 } });
  const { data: latest, loading: latestLoading } = useFetch('/products', { params: { sort: 'newest', limit: 4 } });

  const banners = bannerData?.banners || [];
  const hero = banners.filter((b) => b.position === 'hero');
  const promo = banners.filter((b) => b.position === 'promo');
  const deal = dealData?.products?.find((p) => p.comparePrice > p.price && p.stock > 0) || dealData?.products?.[0];
  const sellers = sellerData?.sellers || [];
  const productTotal = catData?.categories?.reduce((s, c) => s + c.productCount, 0) || 0;

  return (
    <>
      <HeroSlider banners={hero} />
      <FeatureStrip />
      <CategoryCircles categories={catData?.categories} />

      <section className="container-x mt-24">
        <SectionTitle eyebrow="Loved by our customers" title="Handpicked for you" subtitle="Small-batch pieces from workshops across Sri Lanka." />
        <div className="no-scrollbar -mt-2 mb-8 flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t)}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${tab.key === t.key ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {tab.key === t.key && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-brand-700" transition={{ type: 'spring', damping: 25, stiffness: 300 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <ProductGrid products={tabData?.products} loading={tabLoading} />
        {!tabLoading && !tabData?.products?.length && <p className="py-10 text-center text-slate-500">No products yet — artisans can add them from their dashboard.</p>}
      </section>

      <PromoBanners banners={promo} />
      <ArtisansShowcase sellers={sellers} />
      <DealOfTheDay product={deal} />
      <StorySection image={STORY_IMG} image2={STORY_IMG_2} artisans={Math.max(sellers.length, 0)} products={productTotal} />
      <CraftMarquee />

      <section className="container-x mt-20">
        <SectionTitle
          eyebrow="Fresh from the workshop"
          title="Just added"
          action={<Link to="/shop" className="btn-outline group">View all <ArrowRight className="size-4 transition group-hover:translate-x-1" /></Link>}
        />
        <ProductGrid products={latest?.products} loading={latestLoading} count={4} />
      </section>

      <SellCTA image={SELL_IMG} />
      <Newsletter />
    </>
  );
}
