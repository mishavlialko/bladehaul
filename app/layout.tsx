import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Inter, JetBrains_Mono } from 'next/font/google';
import AnchorScroll from '@/components/shared/AnchorScroll';
import './globals.css';

// Inter: workhorse body face. Best legibility for long text on phone
// screens, which matters because our audience is reading on iPhones.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Big Shoulders Display: display headings (H1 slogan, section H2s).
// American industrial heritage — condensed bold workhorse face designed
// for Chicago Design Museum. Echoes the BladeHaul wordmark's heavy
// condensed character without copying it. Variable weights 100-900.
const bigShoulders = Big_Shoulders({
  variable: '--font-big-shoulders',
  subsets: ['latin'],
  display: 'swap',
});

// JetBrains Mono: operator-console flavor for the navbar top-strip,
// ShipmentCard footers, Coverage caption — anywhere mono signals
// "tactical telemetry" rather than just decorative.
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bladehaul.com';

const TITLE = 'BladeHaul Auto Transport | The Sharpest Way to Ship Your Car';
const DESCRIPTION =
  'US car shipping with the same agent from quote to delivery, daily updates, clear options, and no deposit until your carrier is confirmed. Get a real quote.';

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
    'car shipping quotes',
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
  // viewport-fit=cover lets the page extend into the iOS safe-area
  // (notch / Dynamic Island). We then use env(safe-area-inset-top)
  // inside sticky elements to avoid being clipped by the Dynamic Island.
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bigShoulders.variable} ${jetbrainsMono.variable} motion-safe:scroll-smooth`}
    >
      <body>
        <AnchorScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-paper focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-text focus:outline-2 focus:outline-offset-2 focus:outline-orange"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
