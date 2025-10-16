"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Users, ChefHat, Wine, CalendarCheck, Flame, ArrowRight, Award, TrendingUp, Quote } from "lucide-react";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { Button } from "@/components/ui/button";

const milestones = [
  {
    year: "2012",
    title: "TakumaEat Born",
    description:
      "Chef Hiroshi membuka TakumaEat sebagai izakaya modern dengan fokus pada bahan lokal dan teknik Jepang klasik."
  },
  {
    year: "2016",
    title: "Signature Omakase Debut",
    description:
      "Menambahkan pengalaman omakase 12 course yang dikurasi langsung oleh chef, menjadi favorit pelanggan setia."
  },
  {
    year: "2019",
    title: "Sake Lab & Dessert Atelier",
    description:
      "Meluncurkan sake pairing lounge dan dessert atelier untuk menghadirkan pengalaman dining yang menyeluruh."
  },
  {
    year: "2023",
    title: "TakumaCircle Community",
    description:
      "Memperkenalkan membership eksklusif dengan concierge pribadi, event privat, dan promosi curated."
  }
];

const teamHighlights = [
  {
    name: "Chef Hiroshi Takuma",
    role: "Executive Chef & Founder",
    image: "https://images.unsplash.com/photo-1555992336-cbf3d1b4a463?q=80&w=1200&auto=format&fit=crop",
    bio: "Chef Jepang dengan pengalaman 18 tahun di Tokyo & Kyoto. Menggabungkan teknik kaiseki dengan sentuhan modern."
  },
  {
    name: "Mayaka Ishii",
    role: "Head Sommelier",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
    bio: "Spesialis sake dan wine pairing. Merancang menu pairing personal untuk event privat dan omakase."
  },
  {
    name: "Raka Pratama",
    role: "Guest Experience Curator",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    bio: "Mengatur event tematik, ambience, serta kolaborasi dengan seniman lokal untuk menciptakan pengalaman multi-sensory."
  }
];

const milestoneIcons = [CalendarCheck, Wine, ChefHat, Leaf];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />

      <section className="relative overflow-hidden pt-28 pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.18),transparent_65%)]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 hidden h-80 w-80 rounded-full bg-brand-gold/15 blur-3xl lg:block" />
        <div className="pointer-events-none absolute -right-24 top-20 hidden h-72 w-72 rounded-full bg-black/5 blur-3xl md:block" />

        <div className="relative mx-auto flex max-w-[min(95vw,1280px)] flex-col gap-12 px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid gap-10 lg:grid-cols-[1.2fr_1fr]"
          >
            <div className="space-y-7 text-black">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-5 py-2 text-xs uppercase tracking-[0.24em] text-black/60">
                <span className="h-2 w-2 rounded-full bg-brand-gold" />
                About TakumaEat
              </span>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-[46px]">
                Menenun tradisi Jepang dan kreativitas modern dalam satu meja.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-black/70 sm:text-base">
                Sejak hari pertama, kami percaya bahwa pengalaman dining bukan sekadar hidangan lezat. Ini tentang cerita, budaya,
                dan rasa hangat yang menyatukan orang. TakumaEat lahir dari impian Chef Hiroshi untuk membawa filosofi
                <em> omotenashi</em>—keramahtamahan Jepang—ke dalam setiap detail layanan kami di Jakarta.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-brand-gold px-6 py-3 text-sm uppercase tracking-[0.20em] text-black shadow-[0_18px_40px_rgba(239,176,54,0.35)] hover:-translate-y-1">
                  <Link href="/menu">Jelajahi Menu Signature</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-black/15 px-6 py-3 text-sm uppercase tracking-[0.20em] text-black hover:-translate-y-1"
                >
                  <Link href="/promo">Promo & Event</Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden rounded-[36px]">
              <Image
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop"
                alt="TakumaEat dining room"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 space-y-3 text-white">
                <p className="max-w-sm text-sm text-white/75">
                  “Kami memegang komitmen untuk menyuguhkan pengalaman dining yang hangat, intim, dan penuh kejutan rasa.”
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid gap-4 sm:grid-cols-3 sm:gap-6"
          >
            {[
              {
                value: "12+",
                label: "Tahun menghadirkan pengalaman kuliner premium",
                detail: "Sejak 2012 menjaga warisan rasa",
                icon: Award
              },
              {
                value: "40K",
                label: "Tamu signature omakase & degustation",
                detail: "Rata-rata 320 tamu eksklusif / bulan",
                icon: Users
              },
              {
                value: "95%",
                label: "Tingkat repeat guest setiap musim",
                detail: "Survei internal TakumaCircle 2024",
                icon: TrendingUp
              }
            ].map((item, index, array) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.value}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.08 * index, duration: 0.45, ease: "easeOut" }}
                  className="group relative overflow-hidden rounded-[26px] border border-black/5 bg-white/95 px-5 py-7 text-center shadow-[0_18px_45px_rgba(15,23,42,0.1)]"
                >
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(239,176,54,0.2),transparent_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-brand-gold/25 bg-brand-gold/12 text-brand-gold shadow-[0_8px_20px_rgba(239,176,54,0.25)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[36px] font-semibold tracking-tight text-brand-gold sm:text-[44px]">{item.value}</span>
                  <p className="text-sm font-semibold text-black/90">{item.label}</p>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-black/40">{item.detail}</p>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-gold/75">
                    <span className="inline-flex h-1 w-1 rounded-full bg-brand-gold" />
                    <span>Takuma Insight</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-white py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.15),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1180px)] flex-col gap-12 px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold sm:text-4xl">Filosofi Dapur Kami</h2>
              <p className="text-sm leading-relaxed text-black/65 sm:text-base">
                Dapur TakumaEat bekerja layaknya studio kreatif. Tim kami memadukan resep keluarga Chef Hiroshi, inspirasi
                perjalanan, dan kolaborasi dengan produsen lokal. Kami meracik rasa dengan disiplin presisi—mulai dari pemilihan
                ikan yang dilelang setiap pagi, kaldu yang dimasak 18 jam, hingga plating yang mencerminkan estetika wabi-sabi.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-black/5 px-4 py-5">
                  <Leaf className="mt-1 h-6 w-6 text-brand-gold" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Bahan Musiman Premium</p>
                    <p className="text-xs text-black/60">
                      Menjalin relasi dengan supplier Jepang dan pertanian lokal untuk bahan segar sepanjang tahun.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-black/5 px-4 py-5">
                  <CalendarCheck className="mt-1 h-6 w-6 text-brand-gold" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Ritme Menu Berganti</p>
                    <p className="text-xs text-black/60">
                      Menu direfresh setiap musim, menyorot inspirasi perjalanan Chef dan kolaborasi artis lokal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative min-h-[360px] overflow-hidden rounded-[30px]">
              <Image
                src="https://images.unsplash.com/photo-1549971790-bdc1eda03241?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="TakumaEat kitchen"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
            </div>
          </motion.div>

        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-gradient-to-b from-white to-[#f9f9f9] py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.12),transparent_65%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1180px)] flex-col gap-12 px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 text-center text-black">
            <span className="inline-flex items-center gap-2 self-center rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-black/58">
             <span className="h-2 w-2 rounded-full bg-brand-gold" />
              Tim Kami
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Para Penggerak TakumaEat</h2>
            <p className="mx-auto max-w-2xl text-sm text-black/60 sm:text-base">
              Bertemu dengan tim di balik panggung yang meracik setiap detail—dari dapur hingga layanan concierge—agar pengalaman dining Anda istimewa.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {teamHighlights.map((member) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="group flex flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white text-left shadow-[0_20px_55px_rgba(15,23,42,0.1)]"
              >
                <div className="relative h-60 w-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{member.name}</h3>
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-gold/90">{member.role}</p>
                  </div>
                  <p className="text-sm text-black/60">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-white py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.15),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,1120px)] flex-col gap-12 px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 text-center text-black">
            <span className="inline-flex items-center gap-2 self-center rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-black/58">
             <span className="h-2 w-2 rounded-full bg-brand-gold" />
              Perjalanan TakumaEat
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Milestone & Cerita Signature</h2>
            <p className="mx-auto max-w-2xl text-sm text-black/60 sm:text-base">
              Kilas balik momen-momen yang mengukuhkan TakumaEat sebagai destinasi dining premium di Jakarta.
            </p>
          </div>

          <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-12">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[3px] -translate-x-1/2 bg-gradient-to-b from-brand-gold/0 via-brand-gold/70 to-brand-gold/0 lg:block"
            />
            {milestones.map((milestone, index) => {
              const isLeft = index % 2 === 0;
              const Icon = milestoneIcons[index % milestoneIcons.length];
              return (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.12 * index }}
                  className={`group relative flex flex-col gap-4 rounded-[28px] border border-black/5 bg-white/95 px-6 py-8 text-left shadow-[0_22px_55px_rgba(15,23,42,0.1)] backdrop-blur sm:px-8 sm:py-9 lg:max-w-[calc(50%-32px)] ${
                    isLeft ? "lg:self-start lg:pr-16" : "lg:self-end lg:pl-16"
                  }`}
                >
                  {isLeft ? (
                    <div className="pointer-events-none absolute top-10 -right-12 hidden h-10 w-10 items-center justify-center rounded-full border border-brand-gold/30 bg-white shadow-[0_12px_30px_rgba(239,176,54,0.25)] lg:flex">
                      <span className="h-2 w-2 rounded-full bg-brand-gold" />
                    </div>
                  ) : (
                    <div className="pointer-events-none absolute top-10 -left-12 hidden h-10 w-10 items-center justify-center rounded-full border border-brand-gold/30 bg-white shadow-[0_12px_30px_rgba(239,176,54,0.25)] lg:flex">
                      <span className="h-2 w-2 rounded-full bg-brand-gold" />
                    </div>
                  )}

                  <span className="inline-flex items-center gap-2 self-start rounded-full border border-brand-gold/25 bg-brand-gold/15 px-4 py-1 text-[11px] uppercase tracking-[0.32em] text-brand-gold">
                    {milestone.year}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold/70">
                    <Icon className="h-4 w-4" />
                    Signature Moment
                  </div>
                  <h3 className="text-xl font-semibold text-black sm:text-2xl">{milestone.title}</h3>
                  <p className="text-sm leading-relaxed text-black/60 sm:text-base">{milestone.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-black/40">
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/5 px-3 py-1">
                      <CalendarCheck className="h-3.5 w-3.5 text-brand-gold" />
                      Season Highlight
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/5 px-3 py-1">
                      <ArrowRight className="h-3.5 w-3.5 text-brand-gold" />
                      Forward Journey
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Link
              href="/promo"
              className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_18px_45px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-1"
            >
              Jelajahi Program Spesial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/5 bg-gradient-to-b from-white to-[#faf6ef] py-18 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.18),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-[min(95vw,900px)] flex-col gap-8 px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[30px] border border-black/5 bg-black px-7 py-10 text-white shadow-[0_24px_65px_rgba(15,23,42,0.18)] sm:px-10 sm:py-12"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,176,54,0.28),transparent_70%)]" />
            <div className="relative space-y-5 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[10px] uppercase tracking-[0.3em] text-white/70">
                Quote
              </span>
              <Quote className="mx-auto h-10 w-10 text-brand-gold" />
              <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-white/85 sm:text-[24px]">
                “TakumaEat bukan sekadar restoran—ini adalah perjalanan rasa yang mengundang Anda merayakan koneksi, cerita, dan momen intim yang tak terlupakan.”
              </p>
              <div className="space-y-1 text-sm uppercase tracking-[0.28em] text-white/50">
                <p>Hiroshi Takuma</p>
                <p>Executive Chef & Founder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
