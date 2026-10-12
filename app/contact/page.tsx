import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/shared/Button';
import InformationPage from '@/components/shared/InformationPage';
import pageMetadata from '@/lib/page-metadata';

export const metadata = pageMetadata(
  'Contact BladeHaul | Auto Transport Quotes and Support',
  'Contact BladeHaul for a vehicle-shipping quote or help with your booking. Call (214) 945-2742, email info@bladehaul.com, or message us on WhatsApp.',
  '/contact',
);

const linkClass =
  'inline-flex min-h-11 items-center font-medium text-text underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange';
const whatsappUrl = 'https://wa.me/message/GEFAILE4QR5YN1?src=qr';

export default function ContactPage() {
  return (
    <InformationPage
      eyebrow="Contact"
      title="Contact BladeHaul"
      intro={
        <p>
          Have a question about shipping your vehicle or an existing booking?
          Get in touch to discuss your route, vehicle, timing, or transport
          order.
        </p>
      }
      showContactLink={false}
      showIntroQuote={false}
      relatedLinks={[
        {
          href: '/car-shipping-cost',
          label: 'What affects car shipping cost?',
        },
        {
          href: '/open-vs-enclosed-car-shipping',
          label: 'Open vs. enclosed car shipping',
        },
        { href: '/booking-and-payment', label: 'How booking and payment work' },
      ]}
    >
      <section className="mt-10 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Get in touch
        </h2>
        <dl className="mt-5 divide-y divide-line text-base">
          <div className="py-4 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-6">
            <dt className="font-semibold text-text">Call</dt>
            <dd>
              <a href="tel:+12149452742" className={linkClass}>
                (214) 945-2742
              </a>
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-6">
            <dt className="font-semibold text-text">Email</dt>
            <dd>
              <a href="mailto:info@bladehaul.com" className={linkClass}>
                info@bladehaul.com
              </a>
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-6">
            <dt className="font-semibold text-text">Business hours</dt>
            <dd className="mt-2 leading-relaxed text-text-dim sm:mt-0">
              Monday–Friday, 7:00 AM–5:00 PM Central Time. Weekend and
              after-hours assistance is available when possible.
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex items-start justify-between gap-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">WhatsApp</h3>
            <Button
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message us on WhatsApp
            </Button>
          </div>
          <figure className="hidden w-44 shrink-0 lg:block">
            <Image
              src="/whatsapp-qr.png"
              width={256}
              height={256}
              alt="QR code to message BladeHaul on WhatsApp. The message button opens the same chat."
              className="h-44 w-44"
            />
            <figcaption className="mt-3 text-sm leading-relaxed text-text-dim">
              Scan to message BladeHaul on WhatsApp.
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          What to include
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            For a new quote, include your pickup and delivery ZIP codes, vehicle
            year, make and model, and preferred pickup date. Let us know whether
            the vehicle runs and whether you prefer open or enclosed transport.
            For an existing shipment, include your order number if you have one.
          </p>
          <p>
            A quote request is free. Your carrier, price, and payment terms are
            confirmed in writing before any payment. Learn{' '}
            <Link href="/booking-and-payment" className={linkClass}>
              how booking and payment work
            </Link>
            .
          </p>
        </div>
      </section>
      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Mailing address
        </h2>
        <address className="mt-5 text-base not-italic leading-relaxed text-text-dim">
          BladeHaul Auto Transport LLC
          <br />
          11816 Inwood Rd, #1171
          <br />
          Dallas, TX 75244
        </address>
      </section>
    </InformationPage>
  );
}
