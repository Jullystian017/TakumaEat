'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PhoneCall, MessageCircle, Mail, Clock4, CalendarCheck2 } from 'lucide-react';

import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { Button } from '@/components/ui/button';

const contactChannels = [
  {
    title: 'Concierge Hotline',
    description: 'Tim concierge kami siap membantu reservasi, konsultasi menu, hingga koordinasi event privat.',
    icon: PhoneCall,
    actions: [
      { label: 'Call Concierge', href: 'tel:+622112345678' },
      { label: 'Schedule Call', href: '/promo' }
    ]
  },
  {
    title: 'WhatsApp Priority',
    description: 'Balasan instan untuk perubahan reservasi, special request dietary, atau informasi promo terbaru.',
    icon: MessageCircle,
    actions: [
      { label: 'Chat via WhatsApp', href: 'https://wa.me/6281234567890' }
    ]
  },
  {
    title: 'Email Concierge',
    description: 'Kirimkan brief event, permintaan proposal corporate dining, atau kerjasama brand ke tim kami.',
    icon: Mail,
    actions: [
      { label: 'Email Kami', href: 'mailto:concierge@takumaeat.id' }
    ]
  }
];

const conciergeHighlights = [
  {
    title: 'Event & Private Dining',
    description: 'Rancang intimate gathering, corporate dinner, maupun chef table eksklusif dengan kurasi menu personal.'
  },
  {
    title: 'Personalised Pairing',
    description: 'Sommelier kami siap menyesuaikan wine & sake pairing sesuai preferensi tamu dan tema acara.'
  },
  {
    title: 'Seasonal Experiences',
    description: 'Dapatkan akses early booking untuk Omakase Musim, Sakura Night, hingga Dessert Atelier terbaru.'
  }
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.15),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1200px)] flex-col gap-10 px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 text-center text-black">
            <span className="inline-flex items-center gap-2 self-center rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-black/58">
            <span className="h-2 w-2 rounded-full bg-brand-gold" />
              Concierge TakumaEat
            </span>
            <h1 className="text-3xl font-semibold sm:text-4xl">Pilih saluran komunikasi yang paling nyaman untuk Anda</h1>
            <p className="mx-auto max-w-2xl text-sm text-black/60 sm:text-base">
              Terhubung dengan kami kapan pun, melalui hotline, WhatsApp, atau email concierge. Setiap pesan akan ditangani tim spesialis untuk
              memastikan pengalaman dining Anda sempurna.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {contactChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <motion.div
                  key={channel.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="flex h-full flex-col gap-5 rounded-[28px] border border-black/5 bg-white p-6 text-left shadow-[0_20px_55px_rgba(15,23,42,0.1)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/20">
                    <Icon className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-black">{channel.title}</h3>
                    <p className="text-sm leading-relaxed text-black/60">{channel.description}</p>
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    {channel.actions.map((action) => (
                      <Button
                        key={action.label}
                        asChild
                        variant={channel.actions.length > 1 ? 'outline' : 'default'}
                        className={`justify-center px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
                          channel.actions.length > 1
                            ? 'border-black/15 text-black hover:-translate-y-1'
                            : 'bg-brand-gold text-black shadow-[0_16px_40px_rgba(239,176,54,0.35)] hover:-translate-y-1'
                        }`}
                      >
                        <Link href={action.href} target={action.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                          {action.label}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-gradient-to-b from-white to-[#f9f9f7] py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.15),transparent_65%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1180px)] flex-col gap-10 px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
            >
              <div className="flex flex-col gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] text-black/58">
                  <span className="h-2 w-2 rounded-full bg-brand-gold"></span>
                    Concierge Form
                  </span>
                  <h2 className="text-2xl font-semibold text-black sm:text-3xl">Kirimkan detail acara atau permintaan khusus</h2>
                  <p className="text-sm text-black/60">
                    Isi form singkat berikut dan tim concierge akan menghubungi Anda kurang dari 45 menit pada jam operasional. Kami siap
                    mempersonalisasi pengalaman kuliner terbaik untuk tamu Anda.
                  </p>
                </div>
                <form className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Nama Anda"
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Email</label>
                    <input
                      type="email"
                      placeholder="nama@perusahaan.com"
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Tanggal Preferensi</label>
                    <input
                      type="date"
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Jumlah Tamu</label>
                    <input
                      type="number"
                      min={2}
                      placeholder="4"
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-brand-gold"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Detail Permintaan</label>
                    <textarea
                      rows={4}
                      placeholder="Ceritakan konsep acara, preferensi menu, atau kebutuhan lainnya"
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-brand-gold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button className="w-full rounded-2xl bg-brand-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-black shadow-[0_20px_45px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-1">
                      Kirim ke Concierge
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
              className="rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_20px_55px_rgba(15,23,42,0.1)]"
            >
              <h3 className="text-lg font-semibold text-black">Concierge Highlight</h3>
              <p className="mt-2 text-sm text-black/60">
                Setiap detail ditangani dedicated specialist. Nikmati proses perencanaan yang mulus dan responsif.
              </p>
              <div className="mt-6 space-y-5">
                {conciergeHighlights.map((highlight) => (
                  <div key={highlight.title} className="rounded-2xl border border-black/10 bg-black/5 px-4 py-4">
                    <h4 className="text-sm font-semibold text-black">{highlight.title}</h4>
                    <p className="text-xs text-black/60">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-gradient-to-b from-white to-[#faf6ef] py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.18),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1100px)] flex-col items-center gap-8 px-5 text-center sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="space-y-5"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] text-black/58">
            <span className="h-2 w-2 rounded-full bg-brand-gold"></span>
              See You Soon
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Kami tidak sabar menyambut Anda di TakumaEat</h2>
            <p className="mx-auto max-w-2xl text-sm text-black/60 sm:text-base">
              Baik untuk merayakan milestone hidup, jamuan klien, atau sekadar menikmati omakase favorit—tim kami siap memastikan setiap
              kunjungan penuh makna. Terima kasih telah mempercayakan momen berharga Anda kepada TakumaEat.
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-brand-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-black shadow-[0_18px_45px_rgba(239,176,54,0.38)] hover:-translate-y-1">
              <Link href="/menu">Jelajahi Menu Musiman</Link>
            </Button>
            <Button variant="outline" asChild className="border-black/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-black hover:-translate-y-1">
              <Link href="tel:+622112345678">Hubungi Concierge</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
