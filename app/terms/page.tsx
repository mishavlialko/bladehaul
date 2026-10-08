import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/sections/Navbar';

const TERMS_TITLE = 'Website Terms';
const TERMS_DESCRIPTION =
  'Website terms for BladeHaul Auto Transport LLC, an AUTHORIZED Broker of Property Except HHG (USDOT 6803480, MC 85480782).';
const TERMS_URL = 'https://bladehaul.com/terms';

export const metadata: Metadata = {
  title: TERMS_TITLE,
  description: TERMS_DESCRIPTION,
  alternates: { canonical: '/terms' },
  openGraph: {
    title: TERMS_TITLE,
    description: TERMS_DESCRIPTION,
    url: TERMS_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: TERMS_TITLE,
    description: TERMS_DESCRIPTION,
  },
};

const UPDATED_DATE = 'October 8, 2026';
const linkClass =
  'font-medium text-text underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <article className="bg-white pb-24 pt-[calc(8rem+env(safe-area-inset-top))] text-text sm:pb-28 sm:pt-[calc(9rem+env(safe-area-inset-top))] lg:pb-32 lg:pt-[calc(13rem+env(safe-area-inset-top))]">
          <Container className="max-w-3xl">
            <Link
              href="/"
              className={`${linkClass} inline-flex min-h-11 items-center text-sm`}
            >
              Back to BladeHaul
            </Link>
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.22em] text-text-faint">
              Updated {UPDATED_DATE}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Website terms
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-dim">
              These terms cover this website and its free quote form. A shipment
              has its own agreement, with the route, price, timing, and payment
              terms you accept before booking.
            </p>

            <Section title="About BladeHaul">
              <p>
                BladeHaul Auto Transport LLC is a Texas limited liability
                company and an AUTHORIZED Broker of Property Except HHG (USDOT
                6803480, MC 85480782). We arrange vehicle transportation with
                independent motor carriers you approve. This authority does not
                cover Household Goods. The independent motor carrier you approve
                handles the physical transportation.
              </p>
            </Section>

            <Section title="A quote is a starting point">
              <p>
                Requesting a quote is free. It does not book a carrier,
                authorize a card payment, or create a cancellation fee. We use
                your route, vehicle details, and preferred pickup date to
                discuss available options with you.
              </p>
              <p>
                Carrier availability and prices can change before you accept an
                arrangement. We explain the available options and confirm the
                carrier, total price, and booking details in writing. A
                different price or material change needs your agreement.
              </p>
            </Section>

            <Section title="Booking and payment">
              <p>
                Before any payment is collected or booking begins, you receive a
                separate transport agreement. It sets out the search window,
                spot reservation amount, carrier balance, and cancellation rules
                for your order. Review and accept that agreement before
                authorizing the work.
              </p>
              <p>
                This website does not collect card details or take payments. Do
                not enter card numbers, bank details, or identity documents in
                the quote form.
              </p>
            </Section>

            <Section title="Using the site">
              <p>
                Please give us accurate information and submit requests only for
                yourself or someone you are authorized to represent. You may
                save or print site information for your own planning. Do not
                impersonate another person, submit spam, interfere with the
                site, or attempt to access private information.
              </p>
              <p>
                Site content belongs to BladeHaul or its licensors. Permission
                to use the site does not transfer ownership of the content or
                brand.
              </p>
            </Section>

            <Section title="Privacy and communication">
              <p>
                Our{' '}
                <Link href="/privacy" className={linkClass}>
                  Privacy Policy
                </Link>{' '}
                explains how we use your request and how to contact us about
                your information. Automated text messages about your
                vehicle-shipping quote, including marketing follow-ups, require
                your prior consent to receive those messages from BladeHaul Auto
                Transport LLC. Our website collects this consent through an
                optional SMS checkbox. We may also accept consent collected on
                our behalf by another quote-request service, provided we can
                verify that it covers BladeHaul and the messages we send.
                Receiving your contact information alone does not enroll you in
                our SMS program. Our website quote form does not enroll you in
                automated calls.
              </p>
            </Section>

            <Section
              id="sms-terms"
              title="BladeHaul Auto Transport LLC SMS Terms"
            >
              <p>
                Our SMS program provides automated and personalized text
                messages about your vehicle-shipping quote, including marketing
                follow-ups. To enroll through our website, check the optional
                SMS consent box and submit your quote request. Enrollment
                through another quote-request service requires verifiable
                consent to receive these messages from BladeHaul Auto Transport
                LLC. Message frequency varies. Message and data rates may apply.
                Consent is not required to request a quote or purchase services.
              </p>
              <p>
                Reply STOP to opt out or HELP for assistance, or contact
                info@bladehaul.com. We also honor other clear requests to stop
                text messages. After opting out, you may receive one
                confirmation text, but no further program texts unless you
                enroll again. Carriers are not liable for delayed or undelivered
                messages. See our{' '}
                <Link href="/privacy" className={linkClass}>
                  Privacy Policy
                </Link>{' '}
                for information about how we handle your data.
              </p>
            </Section>

            <Section title="Questions and changes">
              <p>
                If something on the site looks incorrect or a submission does
                not work, email{' '}
                <a href="mailto:info@bladehaul.com" className={linkClass}>
                  info@bladehaul.com
                </a>
                . We will help you check the details. Site information is
                general; the written terms accepted for your specific shipment
                control that order.
              </p>
              <p>
                These website terms follow Texas law and applicable federal law,
                without limiting consumer rights that cannot be waived. We may
                update this page and will show the revision date above. A
                website update does not change an existing transport agreement.
              </p>
            </Section>

            <Section title="Contact">
              <p>BladeHaul Auto Transport LLC, Texas, USA.</p>
              <p>11816 Inwood Rd, #1171, Dallas, TX 75244.</p>
              <p>
                <a
                  href="mailto:info@bladehaul.com"
                  className={`${linkClass} inline-flex min-h-11 items-center`}
                >
                  info@bladehaul.com
                </a>
              </p>
            </Section>
          </Container>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-32 sm:mt-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-base leading-relaxed text-text-dim">
        {children}
      </div>
    </section>
  );
}
