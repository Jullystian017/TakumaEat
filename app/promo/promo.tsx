'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Gift, Sparkles, TicketPercent } from 'lucide-react';

import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { Button } from '@/components/ui/button';

const heroPromos = [
  {
    title: 'Takuma Anniversary Feast',
    description:
      'Rayakan ulang tahun TakumaEat dengan menu degustation 8-course eksklusif, lengkap dengan wine pairing dan gift set premium.',
    badge: 'Limited Seating',
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    cta: 'Reservasi Sekarang'
  },
  {
    title: 'Golden Hour Sakura Bar',
    description:
      'Nikmati koktail sakura spesial dan tapas fusion setiap pukul 17.00-19.00 dengan diskon 30%.',
    badge: 'Everyday 17.00 - 19.00',
    image: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    cta: 'Jelajahi Menu Bar'
  }
];

const seasonalPromos = [
  {
    title: 'Sakura Garden Dining',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Midnight Teppanyaki',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Ocean Breeze Lounge',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Zen Garden Brunch',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Takuma Dessert Atelier',
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1400&auto=format&fit=crop'
  },
  {
    title: 'Premium Sake Vault',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1400&auto=format&fit=crop'
  }
];

const membershipPerks = [
  {
    icon: Sparkles,
    title: 'Golden Rewards',
    description: 'Kumpulkan poin setiap transaksi dan tukarkan dengan menu signature atau akses private event.'
  },
  {
    icon: TicketPercent,
    title: 'Exclusive Voucher',
    description: 'Voucher 15% khusus member pada minggu pertama setiap bulan dan spesial ulang tahun.'
  },
  {
    icon: Gift,
    title: 'Chef Surprise',
    description: 'Sample hidangan baru sebelum dirilis publik dan dapatkan tasting note langsung dari chef.'
  }
];

const faqItems = [
  {
    question: 'Bagaimana cara melakukan reservasi promo khusus?',
    answer:
      'Hubungi concierge kami melalui WhatsApp atau gunakan form reservasi online. Pilih promo yang diinginkan dan sebutkan kode unik saat konfirmasi.'
  },
  {
    question: 'Apakah promo dapat digabung dengan membership TakumaCircle?',
    answer:
      'Mayoritas promo dapat digabung dengan poin TakumaCircle, kecuali promo flash sale. Detail setiap promo akan diinformasikan pada syarat & ketentuan.'
  },
  {
    question: 'Bisakah saya memesan untuk acara privat?',
    answer:
      'Tentu. Tim events kami siap menyesuaikan menu dan dekorasi sesuai kebutuhan acara Anda. Silakan jadwalkan sesi konsultasi dengan concierge.'
  }
];

export default function PromoPage() {
  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />
      <section className="relative overflow-hidden pt-24 pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.18),transparent_65%)]" />
        <div className="pointer-events-none absolute -left-20 top-32 hidden h-72 w-72 rounded-full bg-brand-gold/15 blur-3xl lg:block" />
        <div className="pointer-events-none absolute -right-32 bottom-10 hidden h-80 w-80 rounded-full bg-black/5 blur-3xl xl:block" />

        <div className="relative mx-auto flex max-w-[min(95vw,1380px)] flex-col gap-14 px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[48px] border border-black/5 shadow-[0_28px_70px_rgba(15,23,42,0.18)]"
          >
            <div className="grid gap-8 lg:gap-0 lg:grid-cols-[1.2fr_1fr]">
              <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px]">
                <Image
                  src="https://images.unsplash.com/photo-1476055439777-977cdf3a5699?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="TakumaEat promo hero"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/45 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 text-white sm:px-10 sm:py-12">
                  <div className="space-y-5">
                    <span className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/78 shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur">
                      <span className="inline-block h-2 w-2 rounded-full bg-brand-gold" />
                      Takuma Promo
                    </span>
                    <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-[52px]">Kurasi Promo Premium TakumaEat</h1>
                    <p className="max-w-2xl text-white/75 sm:text-lg">
                      Dari degustation eksklusif hingga happy hour sakura, jelajahi penawaran terbaik yang dirancang khusus untuk memperkaya pengalaman dining Anda.
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-[10px] uppercase tracking-[0.24em] text-white/75">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/18 px-3 py-1">Signature Events</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/18 px-3 py-1">Limited Seats</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/18 px-3 py-1">Concierge Support</span>
                  </div>
                </div>
              </div>

              <div className="relative hidden bg-white px-6 py-8 sm:px-10 sm:py-12 lg:block">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.12),transparent_65%)]" />
                <div className="relative flex flex-col gap-6">
                  {heroPromos.map((promo, index) => (
                    <motion.div
                      key={promo.title}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.08, duration: 0.45, ease: 'easeOut' }}
                      className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-black/80 shadow-[0_18px_45px_rgba(15,23,42,0.18)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.22)]"
                    >
                      <Image
                        src={promo.image}
                        alt={promo.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/45 to-black/20" />

                      <div className="relative flex h-full flex-col justify-between gap-6 p-6 text-white">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-white/78">
                            <span className="h-2 w-2 rounded-full bg-brand-gold" />
                            {promo.badge}
                          </span>
                          <ArrowRight className="h-5 w-5 text-brand-gold transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold sm:text-2xl">{promo.title}</h3>
                          <p className="text-sm text-white/75 sm:text-base">{promo.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/75">
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.22em]">
                            <Clock className="h-4 w-4 text-brand-gold" />
                            Concierge 24/7
                          </div>
                          <Button className="group/cta inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_16px_38px_rgba(255,255,255,0.18)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(255,255,255,0.24)]">
                            <span>{promo.cta}</span>
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group/cta-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lg:hidden">
            <div className="mt-6 flex flex-col gap-5">
              {heroPromos.map((promo, index) => (
                <motion.div
                  key={`hero-mobile-${promo.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.1, duration: 0.45, ease: 'easeOut' }}
                  className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-black/80 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                >
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/20" />
                  <div className="relative flex h-full flex-col justify-between gap-5 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-white/78">
                        <span className="h-2 w-2 rounded-full bg-brand-gold" />
                        {promo.badge}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{promo.title}</h3>
                      <p className="text-sm text-white/75">{promo.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/75">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.22em]">
                        <Clock className="h-4 w-4 text-brand-gold" />
                        Concierge 24/7
                      </div>
                      <Button className="group/cta inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_16px_38px_rgba(255,255,255,0.18)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(255,255,255,0.24)]">
                        <span>{promo.cta}</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-white py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.15),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1280px)] flex-col gap-12 px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 text-center text-black">
            <span className="inline-flex items-center gap-1.5 self-center rounded-full border border-black/10 bg-black/[0.05] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] text-black/58">
              <span className="h-2 w-2 rounded-full bg-brand-gold" />
              Seasonal Spotlight
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Highlight Promo Musiman</h2>
            <p className="mx-auto max-w-2xl text-sm text-black/60 sm:text-base">
              Promo musiman dengan ketersediaan terbatas. Sempurna untuk merayakan momen spesial, meeting penting, atau sekadar indulgensi bersama sahabat terdekat.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {seasonalPromos.map((promo, index) => (
              <motion.div
                key={promo.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
                whileHover={{ y: -10 }}
                className="group relative min-h-[240px] overflow-hidden rounded-[28px] border border-black/5 shadow-[0_24px_55px_rgba(15,23,42,0.12)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(15,23,42,0.16)] sm:min-h-[320px]"
              >
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-gradient-to-b from-[#fff] to-[#f8f8f8] py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.14),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1280px)] flex-col gap-12 px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 text-center text-black">
            <span className="inline-flex items-center gap-1.5 self-center rounded-full border border-black/10 bg-black/[0.05] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] text-black/58">
              <span className="h-2 w-2 rounded-full bg-brand-gold" />
              Membership Perks
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Keistimewaan Member TakumaCircle</h2>
            <p className="mx-auto max-w-2xl text-sm text-black/60 sm:text-base">
              Bergabunglah dengan TakumaCircle untuk akses Prioritas, gift spesial, dan undangan private tasting bersama chef kami.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {membershipPerks.map((perk) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="flex flex-col gap-4 rounded-[28px] border border-black/5 bg-white p-6 text-center shadow-[0_20px_55px_rgba(15,23,42,0.1)] transition-transform duration-300 hover:-translate-y-1.5 sm:p-8"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/20">
                  <perk.icon className="h-7 w-7 text-brand-gold" />
                </div>
                <h3 className="text-xl font-semibold text-black">{perk.title}</h3>
                <p className="text-sm leading-relaxed text-black/60">{perk.description}</p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand-gold transition-colors duration-300 hover:text-brand-gold/80"
                >
                  Gabung Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-white py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.12),transparent_65%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1080px)] flex-col gap-10 px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 text-center text-black">
            <span className="inline-flex items-center gap-1.5 self-center rounded-full border border-black/10 bg-black/[0.05] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] text-black/58">
              <span className="h-2 w-2 rounded-full bg-brand-gold" />
              FAQ Promo
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Pertanyaan Umum tentang Promo</h2>
            <p className="mx-auto max-w-2xl text-sm text-black/60 sm:text-base">
              Informasi penting seputar redeem voucher, syarat dan ketentuan, serta cara memastikan slot promo tetap aman untuk reservasi Anda.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-black/5 overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.1)]">
            {faqItems.map((faq, index) => (
              <motion.details
                key={faq.question}
                initial="closed"
                animate="open"
                className="group"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-black transition-colors duration-300 hover:text-brand-gold sm:px-8 sm:py-6">
                  <span>{faq.question}</span>
                  <motion.span
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 90 }}
                    className="text-brand-gold"
                  >
                    +
                  </motion.span>
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed text-black/65 sm:px-8">
                  {faq.answer}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto mb-12 h-px max-w-6xl overflow-hidden">
        <span className="block h-full bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
      </div>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff] to-[#f2eee6] pt-22 pb-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.16),transparent_60%)]" />
        <div className="relative mx-auto flex w-full max-w-[min(98vw,1480px)] flex-col gap-14 px-5 sm:px-9 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.55, ease: 'easeOut' }}
            className="overflow-hidden rounded-[40px] border border-black/5 bg-black text-white shadow-[0_32px_85px_rgba(15,23,42,0.22)]"
          >
            <div className="grid gap-0 lg:grid-cols-[1.2fr_0.95fr]">
              <div className="relative min-h-[340px] px-10 py-12 sm:px-16 sm:py-14 xl:px-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,176,54,0.3),transparent_68%)]" />
                <div className="relative z-10 space-y-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/12 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/78">
                   <span className="h-2 w-2 rounded-full bg-brand-gold" />
                    Concierge Access
                  </span>
                  <h3 className="text-3xl font-semibold leading-snug sm:text-[40px]">
                    Rencanakan Event Privat bersama Concierge TakumaEat
                  </h3>
                  <p className="max-w-3xl text-sm text-white/70 sm:text-base">
                    Event planner kami siap membantu mulai dari curated menu, dekorasi, hingga entertainment. Booking jadwal konsultasi gratis dan wujudkan event impian Anda.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/70">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1">Corporate Gathering</span>
                    <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1">Intimate Wedding</span>
                    <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1">Chef Table</span>
                  </div>
                  <div className="pt-4">
                    <Button className="rounded-full bg-brand-gold px-7 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-black shadow-[0_22px_55px_rgba(239,176,54,0.4)] transition-transform duration-300 hover:-translate-y-1">
                      Jadwalkan Konsultasi
                    </Button>
                  </div>
                </div>
              </div>
              <div className="relative min-h-[340px] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1400&auto=format&fit=crop"
                  alt="Concierge service"
                  fill
                  className="object-cover brightness-[1.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/15 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
