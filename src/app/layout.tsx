import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Merriweather, Roboto, Lora, Be_Vietnam_Pro, Dancing_Script } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-merriweather",
  display: "swap",
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lora",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-cinzel",
  display: "swap",
});

const dancingScript = Dancing_Script({
  weight: ["400", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-cinzel-deco",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Đọc Light Novel Watanare Online | Watanare Reader",
    template: "%s | Watanare Reader"
  },
  description: "Đọc light novel Không đời nào tớ làm người yêu cậu đâu, điều đó là không thể! (※Nhưng điều đó đâu phải là không thể!?) (Watanare) online. Trải nghiệm đọc truyện cao cấp, không quảng cáo, đắm chìm cho tất cả các tập và chương.",
  keywords: ["Watanare", "Không đời nào tớ làm người yêu cậu đâu", "light novel", "đọc online", "Yuri", "Renako Amaori", "Mai Ouzuka", "watanare reader"],
  openGraph: {
    title: "Đọc Light Novel Watanare Online | Watanare Reader",
    description: "Đọc light novel Không đời nào tớ làm người yêu cậu đâu, điều đó là không thể! (※Nhưng điều đó đâu phải là không thể!?) (Watanare) online. Trải nghiệm đọc truyện cao cấp, không quảng cáo, đắm chìm cho tất cả các tập và chương..",
    url: "https://watanare-reader.pages.dev",
    siteName: "Watanare Reader",
    images: [
      {
        url: "/assets/preview-hero.png",
        width: 1200,
        height: 630,
        alt: "Watanare Reader Preview",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đọc Light Novel Watanare Online | Watanare Reader",
    description: "Đọc light novel Không đời nào tớ làm người yêu cậu đâu, điều đó là không thể! (※Nhưng điều đó đâu phải là không thể!?) (Watanare) online. Trải nghiệm đọc truyện cao cấp, không quảng cáo, đắm chìm cho tất cả các tập và chương.",
    images: ["/assets/preview-hero.png"],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://watanare-reader.pages.dev'),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};


import { AuthProvider } from "@/context/AuthContext";
import { GlobalContinueReading } from "@/components/GlobalContinueReading";
import { GuestbookPopup } from "@/components/GuestbookPopup";
import RedirectPagesDev from "@/components/RedirectPagesDev";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Watanare Reader",
  alternateName: ["Không đời nào tớ làm người yêu cậu đâu Reader", "Watanare Light Novel Reader"],
  url: "https://watanare-reader.pages.dev",
  description: "Đọc light novel Không đời nào tớ làm người yêu cậu đâu, điều đó là không thể! (※Nhưng điều đó đâu phải là không thể!?) (Watanare) online. Trải nghiệm đọc truyện cao cấp, không quảng cáo, đắm chìm cho tất cả các tập và chương.",
  author: {
    "@type": "Person",
    name: "Mikami Teren",
  },
  genre: ["Light Novel", "Yuri", "Romantic Comedy", "School Life"],
  inLanguage: "vi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth">
      <head />
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} ${merriweather.variable} ${roboto.variable} ${lora.variable} ${beVietnamPro.variable} ${dancingScript.variable} font-sans antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
      >
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7547996225576947"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Adsterra Social Bar */}
        <Script 
          src='//pl29389303.profitablecpmratenetwork.com/22/16/63/221663704df730d47d3c9c66e9efbe7a.js'
          strategy="lazyOnload"
        />
        <RedirectPagesDev />
        <AuthProvider>
          <GlobalContinueReading />
          <GuestbookPopup />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
        </AuthProvider>

      </body>
    </html>
  );
}
