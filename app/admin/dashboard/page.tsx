import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  Clock3,
  Flame,
  LineChart,
  ListCheck,
  PackageSearch,
  PlusCircle,
  ShoppingBag,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/auth-options';

export const metadata: Metadata = {
  title: 'Admin Dashboard | TakumaEat',
  description: 'Kelola operasional TakumaEat, termasuk pesanan masuk, menu, dan promosi.'
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'admin') {
    redirect('/');
  }

  const displayName = session.user?.name?.split(' ')[0] ?? 'Administrator';

  const overviewCards: {
    label: string;
    value: string;
    sublabel: string;
    icon: LucideIcon;
    accent: string;
  }[] = [
    {
      label: 'Total Orders (30 hari)',
      value: '1.284',
      sublabel: '+18% dibandingkan bulan lalu',
      icon: ShoppingBag,
      accent: 'from-amber-400 via-brand-gold to-orange-500'
    },
    {
      label: 'Revenue',
      value: 'Rp 182,6 Jt',
      sublabel: '+12% YoY',
      icon: LineChart,
      accent: 'from-emerald-400 via-emerald-500 to-emerald-600'
    },
    {
      label: 'Pesanan Aktif',
      value: '36',
      sublabel: '12 dine-in · 24 delivery',
      icon: Clock3,
      accent: 'from-sky-400 via-blue-500 to-indigo-500'
    },
    {
      label: 'Menu Favorit',
      value: 'Takoyaki Supreme',
      sublabel: 'Terjual 210 porsi minggu ini',
      icon: Flame,
      accent: 'from-pink-400 via-rose-500 to-red-500'
    }
  ];

  const quickActions: { label: string; description: string; icon: LucideIcon }[] = [
    {
      label: 'Tambah Menu Baru',
      description: 'Daftarkan hidangan musiman atau menu spesial chef',
      icon: PlusCircle
    },
    {
      label: 'Susun Promo Mingguan',
      description: 'Atur diskon & bundling akhir pekan untuk menarik pelanggan',
      icon: ArrowUpRight
    },
    {
      label: 'Kelola Persediaan',
      description: 'Pantau stok bahan baku dan ajukan permintaan pengadaan',
      icon: PackageSearch
    }
  ];

  const kitchenTasks: { title: string; status: string; highlight?: boolean }[] = [
    { title: 'Queue pesanan dapur utama', status: '18 pesanan · rata-rata 12 menit', highlight: true },
    { title: 'Catatan alergi pelanggan', status: '4 pesanan dengan alergi seafood' },
    { title: 'Meja VIP pukul 19:30', status: 'Reservasi 6 pax · siapkan plating signature' }
  ];

  const activityTimeline: { time: string; title: string; detail: string }[] = [
    {
      time: '09:45',
      title: 'Chef Haru merilis menu “Sakura Bento”',
      detail: 'Menu baru otomatis tampil di halaman promo dan aplikasi kasir.'
    },
    {
      time: '10:20',
      title: 'Batch stok salmon segar diterima',
      detail: 'Gudang pusat memperbarui inventori +24 KG di sistem.'
    },
    {
      time: '11:05',
      title: 'Kolaborasi content creator',
      detail: '@tasteofasia memposting review Takoyaki Supreme · reach 12k.'
    }
  ];

  const topTeam: { name: string; role: string; metric: string }[] = [
    { name: 'Chef Haru', role: 'Head Chef', metric: '98% rating kepuasan plating' },
    { name: 'Sakura', role: 'Bar Lead', metric: '120 minuman signature terjual' },
    { name: 'Riku', role: 'Service Captain', metric: 'Nilai NPS 9.4 minggu ini' }
  ];

  return (
    <main className="min-h-screen bg-[#070d1d] pb-20 pt-24 text-white">
      <section className="mx-auto w-full max-w-6xl px-6">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-gold">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-gold" />
              Dashboard Admin
            </span>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Selamat datang kembali, {displayName}
            </h1>
            <p className="text-base text-white/80">
              Monitor performa operasional TakumaEat, optimalkan menu spesial, dan respons pesanan pelanggan secara real-time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold tracking-[0.16em] text-black shadow-[0_20px_45px_rgba(239,176,54,0.45)] hover:shadow-[0_30px_60px_rgba(239,176,54,0.52)]">
              Lihat Laporan Bulanan
            </Button>
            <Button
              variant="ghost"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold tracking-[0.16em] text-white hover:bg-white/10"
            >
              Unduh Data CSV
            </Button>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-4">
          {overviewCards.map((card) => (
            <article
              key={card.label}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(8,15,35,0.45)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className={`absolute -right-10 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${card.accent} opacity-25 blur-3xl`} />
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.32em] text-white/60">{card.label}</p>
                  <p className="text-3xl font-semibold text-white">{card.value}</p>
                  <p className="text-xs text-white/70">{card.sublabel}</p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <card.icon className="h-5 w-5 text-white/70" />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.3fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(8,15,35,0.42)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Ringkasan Dapur</h2>
                  <p className="text-sm text-white/60">Pantau proses dapur dan service untuk menjaga kualitas pengalaman pelanggan.</p>
                </div>
                <Button
                  variant="ghost"
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white hover:bg-white/10"
                >
                  Lihat Detail
                </Button>
              </div>
              <div className="mt-6 space-y-4">
                {kitchenTasks.map((task) => (
                  <div
                    key={task.title}
                    className={`flex items-start justify-between gap-4 rounded-2xl border border-white/10 px-4 py-4 ${
                      task.highlight ? 'bg-[radial-gradient(circle_at_top,_rgba(239,176,54,0.18),_transparent_70%)]' : 'bg-white/2'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white/90">{task.title}</p>
                      <p className="text-xs text-white/60">{task.status}</p>
                    </div>
                    <ListCheck className="mt-1 h-4 w-4 text-brand-gold" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(8,15,35,0.42)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Aktivitas Tim & Kampanye</h2>
                  <p className="text-sm text-white/60">Highlight kegiatan terbaru untuk menjaga momentum operasional.</p>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                {activityTimeline.map((activity) => (
                  <div key={activity.time} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">{activity.time}</span>
                      <span className="mt-3 h-full w-px flex-1 bg-gradient-to-b from-brand-gold/60 to-transparent" />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm font-semibold text-white/90">{activity.title}</p>
                      <p className="text-xs text-white/60">{activity.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(8,15,35,0.42)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Tindakan Cepat</h2>
                  <p className="text-sm text-white/60">Akses kilat untuk menjaga operasional tetap gesit dan adaptif.</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="flex w-full items-start gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-left transition-all duration-200 hover:border-brand-gold/60 hover:bg-white/10"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-brand-gold">
                      <action.icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{action.label}</p>
                      <p className="text-xs text-white/60">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(8,15,35,0.42)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Performa Staff</h2>
                  <p className="text-sm text-white/60">Sorotan tim yang menjaga standar premium TakumaEat.</p>
                </div>
                <Users className="h-5 w-5 text-white/60" />
              </div>
              <div className="mt-6 space-y-4">
                {topTeam.map((member) => (
                  <div key={member.name} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4">
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-brand-gold">{member.role}</p>
                    <p className="mt-1 text-xs text-white/60">{member.metric}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
