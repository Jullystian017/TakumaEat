# TakumaEat — Japanese & Asian Fusion Restaurant Website

Premium website for TakumaEat, a modern Japanese and Asian Fusion restaurant featuring minimalist design, elegant animations, and a sophisticated black-white-gold color palette.

## 🎨 Design System

### Color Palette
- **Black** (`#000000`) — Navbar, footer, primary text
- **White** (`#FFFFFF`) — Background, whitespace
- **Gold** (`#EFB036`) — CTA buttons, hover effects, badges

### Typography
- **Font**: Noto Sans JP
- **Style**: Clean, modern, premium
- **Tracking**: Wide letter-spacing for uppercase labels

### Visual Style
- Minimalist modern aesthetic
- Generous whitespace
- Rounded corners (`rounded-2xl`)
- Soft shadows and glow effects
- Smooth Framer Motion animations (fade-in, slide-up, parallax)

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Components**: shadcn/ui
- **Icons**: Lucide React (Bell, ShoppingCart, Clock, Sparkles, Wine)

## 📐 Project Structure

```
/app
├── layout.tsx
├── page.tsx
├── globals.css
└── /components
    ├── Navbar.tsx
    ├── HeroSection.tsx
    ├── CategorySection.tsx
    ├── PromoSection.tsx
    ├── PopularFoods.tsx
    ├── Testimonials.tsx
    ├── CTASection.tsx
    └── Footer.tsx
/components/ui
├── button.tsx
├── badge.tsx
└── card.tsx
/lib
└── utils.ts
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the homepage.

### Build

```bash
npm run build
npm start
```

## 📄 Homepage Sections

1. **Navbar** — Sticky transparent navbar with scroll-triggered white background, notification/cart icons, login button
2. **Hero** — Dark fullscreen section with two-column layout, chef showcase card, reservation badge
3. **Categories** — 4-column grid (Sushi, Ramen, Bento, Dessert) with hover overlays
4. **Promo** — Draggable carousel with seasonal offers
5. **Popular Foods** — 6 premium food cards with highlights, pairing info, and CTA
6. **Testimonials** — 3 customer reviews with ratings
7. **CTA** — Call-to-action section with "Order Now" button
8. **Footer** — Navigation, social links, copyright

## 🎯 Key Features

- **Responsive Design** — Mobile-first, fully responsive across all breakpoints
- **Smooth Animations** — Framer Motion scroll-triggered animations
- **Premium UX** — Hover effects, card lifts, glow shadows
- **Accessible** — Semantic HTML, ARIA labels
- **Performance** — Next.js Image optimization, lazy loading

## 📝 Notes

- Tailwind warnings (`@tailwind`, `@apply`) in `app/globals.css` are IDE-only; safe to ignore or silence via Tailwind CSS IntelliSense extension.
- `vscode://schemas/mcp` warning in `package.json` is an IDE artifact with no runtime impact.

## 📧 Contact

For questions or collaboration:
- **Email**: hello@takumaeat.com
- **Instagram**: @takumaeat

---

© 2025 TakumaEat. All rights reserved.
