import type { Metadata, Viewport } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bladehaul.com';

const TITLE = 'BladeHaul Auto Transport — The Sharpest Way to Ship Your Car';
const DESCRIPTION =
  'US car shipping with one dispatcher from quote to delivery, daily updates, and price changes confirmed in writing. Get a real quote in one minute.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · BladeHaul Auto Transport',
  },
  description: DESCRIPTION,
  applicationName: 'BladeHaul',
  authors: [{ name: 'BladeHaul Auto Transport LLC' }],
  generator: 'Next.js',
  keywords: [
    'auto transport',
    'car shipping',
    'vehicle shipping',
    'auto transport broker',
    'coast to coast car shipping',
    'open trailer transport',
    'enclosed trailer transport',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'BladeHaul Auto Transport',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'business',
};

export const viewport: Viewport = {
  themeColor: '#0B0D11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} scroll-smooth`}
    >
      <body>{children}</body>
    </html>
  );
}
