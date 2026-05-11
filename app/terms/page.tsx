import type { Metadata } from 'next';
import Container from '@/components/shared/Container';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/sections/Navbar';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms that govern your use of the BladeHaul Auto Transport website and our broker services.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/terms' },
};

const EFFECTIVE_DATE = 'May 10, 2026';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <article className="bg-white py-24 text-text sm:py-28 lg:py-32">
          <Container className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-faint">
              Effective {EFFECTIVE_DATE}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-6 text-lg text-text-dim">
              These Terms govern your use of the BladeHaul Auto Transport
              website (the &ldquo;Site&rdquo;) and any quote you request through
              it. By using the Site, you agree to these Terms.
            </p>

            <Section title="Who we are">
              <p>
                BladeHaul Auto Transport LLC is a Wyoming limited liability
                company operating as a licensed property broker of household
                goods in the United States. FMCSA broker authority is pending at
                the time of writing; once active, our USDOT and MC numbers will
                be published on the Site.
              </p>
            </Section>

            <Section title="What we do">
              <p>
                BladeHaul is a broker. We do not own trucks or trailers. We
                match your shipment with a vetted motor carrier who actually
                transports your vehicle. The carrier is responsible for the
                physical movement of the vehicle and carries the cargo insurance
                that covers the shipment in transit.
              </p>
            </Section>

            <Section title="Quotes and price">
              <p>
                A quote we give you reflects the carrier market rates at the
                time you request it. Carrier rates move with fuel, demand, and
                route density. If the market shifts between the quote and
                dispatch, we will tell you in writing and offer you two options:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Accept the adjusted price to keep the original pickup window.
                </li>
                <li>
                  Keep the original price and extend the pickup window until a
                  carrier accepts the load at that rate.
                </li>
              </ul>
              <p className="mt-4">
                You must confirm the adjustment in writing before we proceed. We
                do not change prices verbally or under time pressure.
              </p>
            </Section>

            <Section title="Deposits and payment">
              <p>
                We do not charge a deposit until a carrier is confirmed for your
                load. After carrier confirmation, the deposit amount, payment
                method, and remaining balance terms will be disclosed to you in
                writing before you authorize payment. Payments to BladeHaul are
                for the broker service; the carrier collects the balance
                directly on delivery according to the agreed terms.
              </p>
            </Section>

            <Section title="Cancellations">
              <p>
                If you cancel before a carrier is confirmed, you owe nothing. If
                you cancel after carrier confirmation, the carrier may charge a
                cancellation fee that we will pass through to you, and our
                broker deposit may be non-refundable. Specific cancellation
                terms will be disclosed in writing at the time of booking.
              </p>
            </Section>

            <Section title="Your obligations">
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Provide accurate pickup and delivery addresses, vehicle
                  information, and contact info.
                </li>
                <li>
                  Disclose the vehicle&apos;s actual condition, including
                  whether it runs and any oversized modifications. Pricing
                  depends on accurate vehicle details.
                </li>
                <li>
                  Remove personal belongings from the vehicle before pickup.
                  Carriers are not licensed to transport household goods inside
                  the vehicle, and items left inside are not covered by cargo
                  insurance.
                </li>
                <li>
                  Be present (or designate someone) at pickup and delivery to
                  inspect the vehicle and sign the bill of lading.
                </li>
              </ul>
            </Section>

            <Section title="Carrier liability and claims">
              <p>
                The carrier is the legal transporter of your vehicle and is
                responsible for any damage that occurs in their care. The
                carrier carries cargo insurance for that purpose. Damage claims
                must be noted on the bill of lading at delivery; we will help
                you file the claim with the carrier and follow up until it is
                resolved, but BladeHaul as a broker is not the insurer.
              </p>
            </Section>

            <Section title="No guarantee of dispatch time">
              <p>
                We give you realistic pickup and delivery windows based on
                current carrier availability for your route. Carrier schedules,
                weather, breakdowns, and other factors outside our control can
                shift these windows. We will keep you updated daily.
              </p>
            </Section>

            <Section title="Limitation of liability">
              <p>
                To the maximum extent allowed by law, BladeHaul&apos;s liability
                arising from your use of the Site or our broker services is
                limited to the amount you paid us for the relevant shipment. We
                are not liable for indirect, incidental, or consequential
                damages.
              </p>
            </Section>

            <Section title="Governing law">
              <p>
                These Terms are governed by the laws of the State of Wyoming,
                USA, without regard to conflict-of-laws principles. Any dispute
                will be resolved in the courts located in Wyoming.
              </p>
            </Section>

            <Section title="Changes to these terms">
              <p>
                We may update these Terms from time to time. The effective date
                at the top tells you when they were last revised. Continued use
                of the Site after a change means you accept the revised Terms.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                BladeHaul Auto Transport LLC (Wyoming, USA).{' '}
                <a
                  href="mailto:info@bladehaul.com"
                  className="font-medium text-text underline underline-offset-4 hover:text-orange"
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
    <section className="mt-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-base leading-relaxed text-text-dim">
        {children}
      </div>
    </section>
  );
}
