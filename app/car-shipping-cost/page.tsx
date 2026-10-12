import Link from 'next/link';
import InformationPage from '@/components/shared/InformationPage';
import pageMetadata from '@/lib/page-metadata';

export const metadata = pageMetadata(
  'Car Shipping Cost: Factors, Quotes & Payment | BladeHaul',
  'See what affects car shipping cost, how to compare quotes, and when you pay. Get a free BladeHaul quote for your route, vehicle, and preferred pickup dates.',
  '/car-shipping-cost',
);

const linkClass =
  'font-medium text-text underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange';

export default function CarShippingCostPage() {
  return (
    <InformationPage
      eyebrow="Car shipping guide"
      title="How much does car shipping cost?"
      intro={
        <>
          <p>
            Your car shipping cost depends on your route, vehicle, pickup dates,
            and trailer type, plus the carriers available for that shipment. A
            useful quote starts with those details.
          </p>
          <p>
            BladeHaul checks current carrier rates and reviews your options with
            you. Requesting a quote is free. You pay nothing until your carrier
            is confirmed.
          </p>
        </>
      }
      relatedLinks={[
        {
          href: '/open-vs-enclosed-car-shipping',
          label: 'Open vs. enclosed car shipping',
        },
        {
          href: '/booking-and-payment',
          label: 'How booking and payment work',
        },
      ]}
    >
      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          What affects your car shipping price?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <h3 className="pt-4 text-lg font-semibold text-text">Your route</h3>
          <p>
            Distance matters, along with the pickup and delivery locations and
            carrier availability between them. Two trips of similar length can
            have different prices. Send both ZIP codes so we can check your
            specific route.
          </p>
          <h3 className="pt-4 text-lg font-semibold text-text">
            Your vehicle’s size and condition
          </h3>
          <p>
            Make, model, size, weight, and modifications affect the equipment
            and trailer space needed. A large pickup and a compact sedan may
            cost different amounts to ship on the same route.
          </p>
          <p>
            Tell us whether the vehicle starts, rolls, steers, and brakes. A
            non-running car may need special loading equipment and additional
            labor. Mention low clearance, oversized tires, or other
            modifications before we prepare the quote.
          </p>
          <h3 className="pt-4 text-lg font-semibold text-text">
            Your pickup dates
          </h3>
          <p>
            Seasonal demand and the carriers available for your dates affect
            pricing. A narrow pickup window can limit your options. Share your
            first available date, how flexible you are, and any deadline we
            should know about.
          </p>
          <h3 className="pt-4 text-lg font-semibold text-text">
            Open or enclosed transport
          </h3>
          <p>
            Open transport usually costs less and suits most everyday vehicles.
            Your car travels on an open trailer, exposed to weather and road
            debris.
          </p>
          <p>
            Enclosed transport adds protection from the elements and may suit a
            classic, exotic, or collector car. Tell us about your vehicle and
            priorities so we can review suitable options and loading
            requirements. Compare{' '}
            <Link href="/open-vs-enclosed-car-shipping" className={linkClass}>
              open and enclosed car shipping
            </Link>{' '}
            before choosing.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          How do I get an accurate quote?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>Start with complete shipment details:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Pickup and delivery ZIP codes</li>
            <li>Vehicle year, make, and model</li>
            <li>Whether it starts, rolls, steers, and brakes</li>
            <li>Earliest pickup date and any timing limits</li>
            <li>Open or enclosed transport preference</li>
            <li>Modifications or pickup access requirements</li>
          </ul>
          <p>
            A real person reviews your request and follows up. We prepare the
            quote around your shipment and current carrier rates. If your route,
            vehicle condition, or dates change, tell your agent so the options
            reflect what you actually need.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Can my quote change before I book?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Carrier availability and prices can change before you accept an
            arrangement. Your agent explains the available options and confirms
            the carrier, total price, and booking details in writing.
          </p>
          <p>
            A different price or material change needs your agreement.
            Requesting a quote alone does not book a carrier or authorize a
            payment.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          How should I compare car shipping quotes?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>Compare the full shipment details alongside the total price:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Does each quote cover the same route, vehicle condition, and
              trailer type?
            </li>
            <li>What pickup window is being discussed?</li>
            <li>Has a carrier been confirmed?</li>
            <li>
              What is payable to the broker, and what is payable to the carrier?
            </li>
            <li>
              What does the shipment agreement say about changes and
              cancellation?
            </li>
          </ul>
          <p>
            An estimate is easier to evaluate when you know what it includes and
            what still needs to be confirmed. Ask for those details in writing
            before deciding.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          When do I pay BladeHaul?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>No payment is collected before your carrier is confirmed.</p>
          <p>
            After confirmation and before pickup, you pay the agreed broker spot
            reservation amount. The remaining carrier balance is paid directly
            to the carrier according to your written booking details.
          </p>
          <p>
            Your separate transport agreement sets out the amounts, payment
            timing, and terms for your order. Review it before accepting. Learn{' '}
            <Link href="/booking-and-payment" className={linkClass}>
              how booking and payment work
            </Link>
            , or read our{' '}
            <Link href="/terms" className={linkClass}>
              website terms
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Get a quote for your route
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            BladeHaul Auto Transport LLC is a Texas-based, FMCSA-authorized
            broker that arranges vehicle transportation with independent motor
            carriers. The carrier handles the physical move. Your BladeHaul
            agent helps coordinate the shipment.
          </p>
          <p>
            Send us your route and vehicle details. We’ll help you understand
            the available options and what your shipment will cost. See{' '}
            <Link href="/#how-it-works" className={linkClass}>
              how shipping with BladeHaul works
            </Link>
            . For questions before you request a quote,{' '}
            <Link href="/contact" className={linkClass}>
              contact BladeHaul
            </Link>
            .
          </p>
        </div>
      </section>
    </InformationPage>
  );
}
