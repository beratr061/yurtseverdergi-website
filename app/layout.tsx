import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yurtsever.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "YurtSever Dergi - Edebiyat ve Kültür Dergisi",
    template: "%s | YurtSever Dergi",
  },
  description: "Şiir, edebiyat, kültür ve sanat üzerine derinlikli yazılar. Türkiye'nin önde gelen yazarları ve şairleri ile buluşun.",
  keywords: ["şiir", "edebiyat", "kültür", "sanat", "dergi", "yazar", "şair", "türk edebiyatı", "poetika", "eleştiri"],
  authors: [{ name: "YurtSever Dergi" }],
  creator: "YurtSever Dergi",
  publisher: "YurtSever Dergi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "YurtSever Dergi",
    title: "YurtSever Dergi - Edebiyat ve Kültür Dergisi",
    description: "Şiir, edebiyat, kültür ve sanat üzerine derinlikli yazılar.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YurtSever Dergi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YurtSever Dergi - Edebiyat ve Kültür Dergisi",
    description: "Şiir, edebiyat, kültür ve sanat üzerine derinlikli yazılar.",
    images: ["/og-image.jpg"],
    creator: "@yurtseverdergi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`}
      >
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
