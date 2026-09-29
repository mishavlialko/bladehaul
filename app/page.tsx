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

const organizationId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: 'BladeHaul Auto Transport',
      url: SITE_URL,
      publisher: { '@id': organizationId },
      about: { '@id': organizationId },
    },
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'BladeHaul Auto Transport',
      legalName: 'BladeHaul Auto Transport LLC',
      url: SITE_URL,
      email: 'info@bladehaul.com',
      description:
        'Texas company preparing US car shipping brokerage. Request a quote — same-agent service, daily updates, and clear options once we are authorized to operate. No deposit on this website.',
      areaServed: {
        '@type': 'Country',
        name: 'United States',
      },
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
        streetAddress: '11816 Inwood Rd, #1171',
        addressLocality: 'Dallas',
        addressRegion: 'TX',
        postalCode: '75244',
      },
    },
  ],
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
