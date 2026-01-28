# 🍱 TakumaEat - Premium Japanese Dining Experience

TakumaEat adalah platform pemesanan makanan (Online Ordering System) modern yang dirancang khusus untuk restoran dengan pengalaman kuliner Jepang yang premium. Dibangun dengan fokus pada kecepatan, estetika modern, dan kemudahan penggunaan baik bagi pelanggan maupun administrator.

## 🚀 Fitur Utama

### 🛒 Pengalaman Pelanggan
- **Interactive Menu**: Menu dengan kategori dan pencarian yang cepat serta animasi smooth menggunakan Framer Motion.
- **Flexible Checkout**: Mendukung mode **Takeaway** (Pilih Cabang) dan **Delivery** (Integrasi Peta).
- **Secure Payment**: Pembayaran otomatis melalui **Midtrans** (Virtual Account, E-Wallet, Kartu Kredit) dan COD.
- **Smart Auth**: Login cepat dengan **Google OAuth** atau email konvensional.
- **Password Recovery**: Sistem reset password yang aman dengan token terenkripsi.
- **Order Tracking**: Pantau status pesanan secara real-time dari dashboard pelanggan.

### 🛠️ Dashboard Admin (Super-Power)
- **Order Management**: Kelola status pesanan (Processing → Preparing → Ready → Delivered) dengan notifikasi status otomatis.
- **Menu & Inventory**: Update stok, harga, deskripsi, dan kategori menu secara instan.
- **Promotion System**: Kelola kode promo/diskon untuk meningkatkan penjualan.
- **Analytics & Reports**: Visualisasi data penjualan dan statistik pesanan dalam bentuk chart interaktif.
- **Branch Management**: Pengaturan multi-cabang untuk operasional yang lebih luas.

## 💻 Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [TailwindCSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials & Google Provider)
- **Payments**: [Midtrans API](https://midtrans.com/)
- **UI Components**: Radix UI & Lucide Icons
- **State Management**: React Context & Hooks

## 🛠️ Instalasi Lokal

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/Jullystian017/TakumaEat.git
   cd TakumaEat
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Buat file `.env.local` di root direktori dan isi sesuai kebutuhan:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # NextAuth
   NEXTAUTH_SECRET=your_secret_string
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret

   # Midtrans
   MIDTRANS_SERVER_KEY=your_server_key
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
   ```

4. **Jalankan Project**:
   ```bash
   npm run dev
   ```

## 🔒 Keamanan & RBAC
Project ini menggunakan **Role-Based Access Control (RBAC)**.
- **Admin**: Akses penuh ke `/admin/*` dashboard.
- **Customer**: Akses ke fitur pemesanan dan profil pribadi.
- **Middleware**: Proteksi route otomatis untuk mencegah akses tidak sah ke dashboard admin.

---

All made with love by Jullystian
