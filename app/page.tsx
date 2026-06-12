import About from '@/components/sections/About';
import Comparison from '@/components/sections/Comparison';
import Coverage from '@/components/sections/Coverage';
import FAQ from '@/components/sections/FAQ';
import FinalCTA from '@/components/sections/FinalCTA';
import Footer from '@/components/sections/Footer';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import Navbar from '@/components/sections/Navbar';
import QuoteForm from '@/components/sections/QuoteForm';
import Routes from '@/components/sections/Routes';
import TrustStrip from '@/components/sections/TrustStrip';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bladehaul.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MovingCompany',
  name: 'BladeHaul Auto Transport',
  legalName: 'BladeHaul Auto Transport LLC',
  url: SITE_URL,
  email: 'info@bladehaul.com',
  description:
    'US car shipping brokerage with one dispatcher from quote to delivery, daily updates, and price changes confirmed in writing.',
  founder: {
    '@type': 'Person',
    name: 'Mykhailo Vlialko',
  },
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  serviceType: 'Auto Transport',
  knowsAbout: [
    'Open trailer auto transport',
    'Enclosed trailer auto transport',
    'Door-to-door car shipping',
    'Classic and exotic vehicle transport',
    'Non-running vehicle transport',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressRegion: 'WY',
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Comparison />
        <Coverage />
        <Routes />
        <About />
        <FAQ />
        <FinalCTA />
        <QuoteForm />
      </main>

      <Footer />
    </>
  );
}
