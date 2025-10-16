import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_JP } from "next/font/google";

import Providers from "./providers";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto"
});

export const metadata: Metadata = {
  title: "TakumaEat — Authentic Taste of Japan",
  description:
    "TakumaEat menyajikan kuliner Jepang dan Asian Fusion premium dengan cita rasa autentik di setiap hidangan."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSans.variable} bg-white text-black antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
