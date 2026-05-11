import type { Metadata } from 'next';
import Container from '@/components/shared/Container';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/sections/Navbar';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How BladeHaul Auto Transport collects, uses, and protects your information.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy' },
};

const EFFECTIVE_DATE = 'May 10, 2026';

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-6 text-lg text-text-dim">
              BladeHaul Auto Transport LLC (&ldquo;BladeHaul&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates
              this website. This Privacy Policy explains what information we
              collect when you use the site or request a quote, how we use it,
              and your choices.
            </p>

            <Section title="What we collect">
              <p>When you request a quote or contact us, we may collect:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Pickup and delivery ZIP codes</li>
                <li>Vehicle year, condition, and trailer-type preference</li>
                <li>Desired pickup date</li>
                <li>First and last name</li>
                <li>Email address</li>
                <li>Phone number</li>
              </ul>
              <p className="mt-4">
                We also collect basic technical information automatically when
                you visit the site: IP address, browser type, device type, pages
                viewed, and referring URL. This is standard for any website and
                is used to understand site usage and prevent abuse.
              </p>
            </Section>

            <Section title="How we use your information">
              <ul className="list-disc space-y-2 pl-6">
                <li>To prepare and send you an auto transport quote</li>
                <li>To match your shipment with a vetted carrier</li>
                <li>To communicate with you about your shipment</li>
                <li>
                  To send written confirmations of price changes if they occur
                </li>
                <li>
                  To comply with legal obligations (record-keeping, FMCSA broker
                  requirements when applicable)
                </li>
                <li>To prevent fraud and protect the site from abuse</li>
              </ul>
              <p className="mt-4">
                We do not sell your information to third parties. We do not send
                marketing texts or robocalls.
              </p>
            </Section>

            <Section title="Who we share it with">
              <p>We share necessary information with:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong>Carriers we book for your shipment.</strong> They need
                  your pickup and delivery details and contact info to dispatch
                  your vehicle.
                </li>
                <li>
                  <strong>
                    Service providers we use to operate the business.
                  </strong>{' '}
                  This includes hosting (Vercel), email delivery (Resend), and
                  the CRM we use to manage shipments (BeRocker, activated after
                  FMCSA authority is in place).
                </li>
                <li>
                  <strong>Law enforcement or regulators</strong> if required by
                  law, subpoena, or to defend our rights.
                </li>
              </ul>
            </Section>

            <Section title="Cookies and analytics">
              <p>
                We may use cookies to remember your session and to measure how
                the site is used. We currently do not run third-party
                advertising trackers. If we add analytics in the future, we will
                update this policy and respect Do Not Track signals where
                technically feasible.
              </p>
            </Section>

            <Section title="Data retention">
              <p>
                We keep quote requests and shipment records for at least the
                period required by FMCSA recordkeeping rules for licensed
                brokers (currently three years), and longer if needed to comply
                with tax, accounting, or legal obligations.
              </p>
            </Section>

            <Section title="Your choices">
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  You can ask us what personal information we hold about you and
                  request a copy.
                </li>
                <li>You can ask us to correct inaccurate information.</li>
                <li>
                  You can ask us to delete information that is not required for
                  legal or recordkeeping reasons.
                </li>
                <li>
                  You can opt out of non-essential communications at any time.
                </li>
              </ul>
              <p className="mt-4">
                To make any of these requests, email{' '}
                <a
                  href="mailto:info@bladehaul.com"
                  className="font-medium text-text underline underline-offset-4 hover:text-orange"
                >
                  info@bladehaul.com
                </a>
                . We will respond within a reasonable time.
              </p>
            </Section>

            <Section title="Security">
              <p>
                We use commercially reasonable safeguards to protect your
                information. No system is completely secure, and we cannot
                guarantee absolute security. If we ever experience a breach that
                affects you, we will notify you as required by applicable law.
              </p>
            </Section>

            <Section title="Children">
              <p>
                The site is intended for adults. We do not knowingly collect
                information from anyone under 18.
              </p>
            </Section>

            <Section title="Changes to this policy">
              <p>
                We may update this Privacy Policy from time to time. The
                effective date at the top tells you when it was last revised. If
                we make material changes, we will note them at the top of this
                page.
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
