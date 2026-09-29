import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/sections/Navbar';

export const metadata: Metadata = {
  title: 'Website Terms',
  description:
    'Simple terms for using the BladeHaul website and requesting a free vehicle transport quote.',
  alternates: { canonical: '/terms' },
};

const UPDATED_DATE = 'September 29, 2026';
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
                company. We are preparing to arrange vehicle transportation as a
                property broker. Our FMCSA broker authority application is
                Pending and is not currently AUTHORIZED. When we book a
                shipment, the independent motor carrier you approve handles the
                physical transportation.
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
                Before paid search or booking begins, you receive a separate
                transport agreement. It sets out the search window, broker
                commission, carrier balance, and cancellation rules for your
                order. Review and accept that agreement before authorizing the
                work.
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
                your information. If you provide a phone number and select phone
                or text follow-up, we use it to discuss that request with you.
                The form does not enroll you in automated marketing calls or
                texts.
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
              <p>
                Registered office: 11816 Inwood Rd, #1171, Dallas, TX 75244.
              </p>
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
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 sm:mt-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-base leading-relaxed text-text-dim">
        {children}
      </div>
    </section>
  );
}
