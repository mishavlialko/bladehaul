import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/sections/Navbar';

const PRIVACY_TITLE = 'Privacy Policy';
const PRIVACY_DESCRIPTION =
  'What BladeHaul collects through a quote request, how we use it, and your privacy choices.';
const PRIVACY_URL = 'https://bladehaul.com/privacy';

export const metadata: Metadata = {
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    url: PRIVACY_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
  },
};

const UPDATED_DATE = 'September 29, 2026';
const linkClass =
  'font-medium text-text underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange';

export default function PrivacyPage() {
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
              Effective {UPDATED_DATE}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-dim">
              BladeHaul Auto Transport LLC uses the information you provide to
              respond to your request and, if you book, help arrange your
              shipment. We do not sell your personal information or share it for
              targeted advertising.
            </p>

            <Section title="Information you provide">
              <p>A quote request includes:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Your name and email address</li>
                <li>Pickup and delivery ZIP codes and preferred pickup date</li>
                <li>
                  Vehicle year, make, model, body type, and running condition
                </li>
                <li>Your open or enclosed trailer preference</li>
                <li>An optional phone number, VIN, and additional details</li>
              </ul>
              <p>
                We also keep the messages you send us and details you provide
                later about an agreed shipment. Please leave card numbers, bank
                details, and identity documents out of the quote form.
              </p>
            </Section>

            <Section title="How we use it">
              <p>
                We use your details to review the route and vehicle, prepare
                your quote, answer questions, and discuss your options. If you
                accept a separate transport order, we use the relevant details
                to find a suitable carrier, confirm the arrangement, and keep
                you informed about the shipment.
              </p>
              <p>
                We also use information to prevent duplicate requests and abuse,
                resolve problems, and meet applicable recordkeeping
                requirements. Providing a phone number and choosing phone or
                text follow-up are optional. We use that number to discuss this
                request when you select that option. The form does not enroll
                you in automated marketing calls or texts.
              </p>
            </Section>

            <Section title="Who receives your information">
              <ul className="list-disc space-y-3 pl-6">
                <li>
                  <strong>Our service providers.</strong> Vercel hosts the site
                  and stores a private delivery backup of submitted requests.
                  Resend delivers request notifications to our business email,
                  which is hosted by Google Workspace. These providers process
                  the information needed to perform those services.
                </li>
                <li>
                  <strong>Carriers for an accepted transport order.</strong> We
                  share the shipment details needed to find a suitable carrier.
                  The carrier you approve receives the contact and location
                  information needed for pickup and delivery.
                </li>
                <li>
                  <strong>Required disclosures.</strong> We may disclose
                  relevant information when required by law or necessary to
                  respond to fraud, legal claims, or a security incident.
                </li>
              </ul>
            </Section>

            <Section title="Site operation and browser storage">
              <p>
                Our hosting and security providers receive technical information
                such as your IP address, browser information, requested pages,
                and request times to deliver and protect the site. We do not
                place quote contents in application logs.
              </p>
              <p>
                The quote form uses browser session storage to carry details
                between steps and help you finish a request. You can clear this
                data through your browser settings. We also remember the last
                illustrative shipment shown in the current tab so refreshing the
                page can show a different example. When you enter a complete ZIP
                code, the form asks Zippopotam.us for its city and state. That
                provider receives the ZIP code and the technical information
                sent by your browser, including its IP address.
              </p>
              <p>
                We do not use advertising trackers or a site analytics service.
                We do not enable third-party advertising or analytics tools to
                track your activity across websites. A browser Do Not Track
                setting does not change how this site operates.
              </p>
            </Section>

            <Section title="How long we keep information">
              <p>
                We keep private delivery backups of quote submissions for 30
                days, then remove them through scheduled cleanup. This helps us
                recover a request if email delivery has a problem. A copy
                delivered to our business inbox is separate from that temporary
                backup.
              </p>
              <p>
                We keep business correspondence and shipment records for as long
                as needed to handle your request or order and meet legal,
                accounting, and dispute-resolution requirements. Applicable
                broker transaction records are retained for at least three
                years. That rule does not automatically apply to every unbooked
                quote. Service providers also retain operational records under
                their own retention terms.
              </p>
            </Section>

            <Section title="Your choices">
              <p>
                Email{' '}
                <a href="mailto:info@bladehaul.com" className={linkClass}>
                  info@bladehaul.com
                </a>{' '}
                to ask for access to, correction of, or deletion of your
                personal information, or to change your communication
                preferences. We may verify that the request is yours before
                sharing or changing a record. We respond within the period
                required by applicable law.
              </p>
              <p>
                You can ask us to stop optional communications at any time. We
                may still need to send information about an active order or
                retain records required by law or needed for an unresolved
                matter. If we cannot fulfill a request, we will explain why.
              </p>
            </Section>

            <Section title="Security and children">
              <p>
                We use access controls and other reasonable safeguards to
                protect the information we handle. No online service can
                guarantee complete security. We respond to security incidents
                and provide notices as required by law.
              </p>
              <p>
                Our services are intended for adults. We do not knowingly
                collect personal information from children under 13. Contact us
                if you believe a child has submitted personal information.
              </p>
            </Section>

            <Section title="Updates and contact">
              <p>
                We will update the date on this page when the policy changes. A
                material change will be identified on this page, with any
                additional notice or consent required by law.
              </p>
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
