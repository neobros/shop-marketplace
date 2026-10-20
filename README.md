# shop-marketplace

**Ceylon Craft Collective** is an online marketplace to buy and sell authentic Sri Lankan handmade products.

It is a multi-vendor marketplace for arts, crafts and handmade goods: home décor, crochet, clothing, jewellery, pottery, batik, coconut crafts, art, and tea & spices. It is built for Sri Lankan artisans and small creative businesses.

**Stack:** React + Vite, Tailwind CSS v4, Framer Motion, Swiper and Recharts. The API lives in [`shop-marketplace-backend`](../shop-marketplace-backend).

## Run

```bash
npm install
npm run dev        # http://localhost:5173  (proxies /api → http://localhost:5000)
npm run build
```

For production, set `VITE_API_URL=https://your-api.com/api` in `.env`.

The brand name, contact details, bank details and delivery fees are all in `src/lib/brand.js`. Logo files (full logo, emblem, light versions for dark backgrounds, favicons) are in `public/brand/`.

## Design
- **Palette:** taken from the logo — deep forest green and antique gold on warm whites. A four-colour stripe taken from the Sri Lankan flag is used as an accent.
- **Type:** *Fraunces* serif headings with *Plus Jakarta Sans* body text.
- **Motifs:** the interwoven-leaf emblem, a subtle lotus (nelum) pattern background, slowly rotating "liyawela" rings, and temple-arch image frames.
- **Animation:** hero slider with Ken Burns zoom and live progress, scroll reveals, a craft-name marquee, a deal-of-the-day countdown, animated counters and a scroll progress bar.

## Pages

**Store**
- Home: hero banners, shop-by-craft circles, product tabs, promo banners, artisan showcase, deal of the day, our story, sell CTA
- Shop: filters for craft, price (Rs), district, new and featured
- Product page: gallery zoom, materials and size, a "Made by" artisan card, reviews
- `/artisans` directory and `/artisans/:slug` shop pages
- `/sell`: "Sell with us" landing page and shop application, which also creates the account
- Cart, checkout (25 districts; Cash on delivery or Bank transfer), and the order success page with bank details
- Account: profile, orders with per-artisan status, wishlist

**Seller dashboard** (`/seller`)
- Earnings after commission, pending payout, sales chart, best sellers, low stock and latest reviews
- Orders: only the seller's own items, with one-click *Start preparing → Shipped → Delivered*
- Products: manage own listings
- Shop settings, with a live preview
- Pending, rejected or suspended shops see a status banner

**Admin panel** (`/admin`)
- Dashboard: revenue, orders, commission earned, shop applications, top artisans, charts
- **Artisans:** approve, reject (with reason), suspend or reactivate shops
- Orders: per-artisan fulfilment, payment status and history
- Products: all shops, featured flag, assign to a shop
- Categories (icon picker), banners (live preview), and users

Demo logins are listed in the backend README.
