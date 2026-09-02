import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Kost Rosa Ria Rio - Residence',
  description: 'Hunian kos AC dan Non-AC murah, bersih, dan aman di Semabung Lama, Pangkal Pinang. Hubungi admin untuk cek ketersediaan kamar.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    siteName: 'Kost Rosa Ria Rio',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kost Rosa Ria Rio',
    url: 'https://kost-rosariario.vercel.app/',
  };

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}