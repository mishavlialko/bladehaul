import Link from 'next/link';
import InformationPage from '@/components/shared/InformationPage';
import pageMetadata from '@/lib/page-metadata';

export const metadata = pageMetadata(
  'How Booking and Payment Work | BladeHaul',
  'Learn how BladeHaul quotes, carrier confirmation, and payments work. Review your price and terms in writing before paying for your vehicle shipment.',
  '/booking-and-payment',
);

const linkClass =
  'font-medium text-text underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange';

export default function BookingAndPaymentPage() {
  return (
    <InformationPage
      eyebrow="Car shipping guide"
      title="How Booking and Payment Work"
      intro={
        <>
          <p>
            Shipping your vehicle starts with a free quote. Before you pay, you
            review the carrier, total price, and payment terms in writing. No
            payment is collected before your carrier is confirmed. After
            confirmation, the agreed broker spot reservation amount is due
            before pickup. You pay the remaining carrier balance directly to the
            motor carrier according to your accepted transport order.
          </p>
          <p>
            BladeHaul Auto Transport LLC is an auto transport broker. We arrange
            your shipment with an independent motor carrier that you approve.
            That carrier performs the physical transportation. Your BladeHaul
            agent helps coordinate your booking and shipment.
          </p>
        </>
      }
      relatedLinks={[
        {
          href: '/car-shipping-cost',
          label: 'What affects car shipping cost?',
        },
        {
          href: '/open-vs-enclosed-car-shipping',
          label: 'Open vs. enclosed car shipping',
        },
      ]}
    >
      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          1. Request your quote
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Tell us your pickup and delivery locations, vehicle details,
            preferred dates, and whether you want{' '}
            <Link href="/open-vs-enclosed-car-shipping" className={linkClass}>
              open or enclosed transport
            </Link>
            . Include any information that could affect loading, such as a
            vehicle that does not run or has limited ground clearance.
          </p>
          <p>
            Your quote reflects the route, vehicle, timing, and available
            carrier market. Requesting one is free and does not reserve a
            carrier, authorize a payment, or create a cancellation charge.
            Carrier availability and pricing can change before you accept an
            arrangement. See{' '}
            <Link href="/car-shipping-cost" className={linkClass}>
              what affects car shipping cost
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          2. Review your transport agreement
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Before booking work begins, you receive a separate transport
            agreement to review and accept. It describes your shipment and the
            terms for arranging it, including the carrier search window, broker
            spot reservation amount, carrier balance, and cancellation
            conditions.
          </p>
          <p>
            Read the agreement and ask your agent about anything that is
            unclear. The terms you accept for your specific order govern that
            shipment. This page explains the process; your order contains the
            details that apply to you.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          3. Approve your carrier and price
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Your agent reviews the available options with you. We check the
            carrier’s identity, operating authority, and insurance before
            assignment, and confirm the carrier, total price, and agreed booking
            details in writing before collecting any payment.
          </p>
          <p>
            You decide whether to accept the arrangement. A change to the price
            or another material booking detail requires your agreement.
            Requested pickup dates and estimated delivery windows depend on
            carrier availability and operating conditions; they are not
            guaranteed by requesting a quote.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          4. Pay the agreed broker reservation amount
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            After your carrier is confirmed, you pay the agreed broker spot
            reservation amount before pickup. The amount and payment
            instructions must match your accepted transport order.
          </p>
          <p>
            Review those instructions before paying. If the amount, recipient,
            or instructions change unexpectedly, check with your BladeHaul agent
            at{' '}
            <a href="mailto:info@bladehaul.com" className={linkClass}>
              info@bladehaul.com
            </a>{' '}
            before sending money. Our website quote form does not accept
            payments. Keep card numbers, bank details, and identity documents
            out of that form.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          5. Pay the carrier balance as agreed
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            The remaining carrier balance is paid directly to the motor carrier
            according to your accepted transport order. That order specifies the
            amount, when it is due, and the agreed payment method. Confirm these
            details before pickup so you know what to prepare.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Changes, cancellations, and questions
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            If your plans change, contact your agent promptly. Cancellation
            charges, refund eligibility, and other conditions depend on the
            agreement you accepted and the circumstances of your order. Review
            those terms before booking rather than assuming a standard
            cancellation period or refund amount.
          </p>
          <p>
            Contact your BladeHaul agent if you need an update or your plans
            change. For questions before you book,{' '}
            <Link href="/contact" className={linkClass}>
              contact BladeHaul
            </Link>
            , call{' '}
            <a href="tel:+12149452742" className={linkClass}>
              (214) 945-2742
            </a>
            , or email{' '}
            <a href="mailto:info@bladehaul.com" className={linkClass}>
              info@bladehaul.com
            </a>
            . You can also review our{' '}
            <Link href="/terms" className={linkClass}>
              Website Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className={linkClass}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </InformationPage>
  );
}
