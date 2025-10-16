import { CTASection } from '@/app/components/CTASection';
import { CategorySection } from '@/app/components/CategorySection';
import { Footer } from '@/app/components/Footer';
import { HeroSection } from '@/app/components/HeroSection';
import { Navbar } from '@/app/components/Navbar';
import { PromoSection } from '@/app/components/PromoSection';
import { PopularFoods } from '@/app/components/PopularFoods';
import { PromoMarquee } from '@/app/components/PromoMarquee';
import { Testimonials } from '@/app/components/Testimonials';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#fdf9f1]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-52 -left-32 h-[420px] w-[420px] rounded-full bg-brand-gold/12 blur-[140px]" />
        <div className="absolute top-[45%] -right-48 h-[360px] w-[360px] rounded-full bg-[#d6defa]/35 blur-[160px]" />
        <div className="absolute bottom-[-220px] left-1/2 h-[300px] w-[620px] -translate-x-1/2 bg-gradient-to-t from-[#f1d7a4]/25 via-transparent to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.92)_0%,rgba(253,246,229,0.88)_40%,rgba(255,255,255,0.95)_100%)]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/5 via-transparent to-transparent mix-blend-soft-light" />

      <div className="relative z-10 space-y-0">
        <Navbar />
        <HeroSection />

        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-20 h-24 -z-10 bg-gradient-to-b from-[#fbe7c4]/70 via-transparent to-transparent" />
          <CategorySection />
        </section>

        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-16 h-24 -z-10 bg-gradient-to-b from-[#f5f0ff]/65 via-transparent to-transparent" />
          <PopularFoods />
        </section>

        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-16 h-24 -z-10 bg-gradient-to-b from-[#ffeedd]/55 via-transparent to-transparent" />
          <PromoMarquee />
        </section>

        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-16 h-24 -z-10 bg-gradient-to-b from-[#f2f6ff]/55 via-transparent to-transparent" />
          <PromoSection />
        </section>

        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-16 h-24 -z-10 bg-gradient-to-b from-[#fdeed7]/55 via-transparent to-transparent" />
          <Testimonials />
        </section>

        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-16 h-24 -z-10 bg-gradient-to-b from-[#f9f5ff]/55 via-transparent to-transparent" />
          <CTASection />
        </section>

        <Footer />
      </div>
    </main>
  );
}
