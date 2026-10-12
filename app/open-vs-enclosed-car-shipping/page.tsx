import Link from 'next/link';
import InformationPage from '@/components/shared/InformationPage';
import pageMetadata from '@/lib/page-metadata';

export const metadata = pageMetadata(
  'Open vs. Enclosed Car Shipping: Which to Choose | BladeHaul',
  'Compare open and enclosed car shipping by cost, exposure, availability, and loading needs. Find the right fit for your vehicle and get a quote from BladeHaul.',
  '/open-vs-enclosed-car-shipping',
);

const linkClass =
  'font-medium text-text underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange';

export default function OpenVsEnclosedCarShippingPage() {
  return (
    <InformationPage
      eyebrow="Car shipping guide"
      title="Open vs. Enclosed Car Shipping"
      intro={
        <p>
          Open transport usually costs less and suits most everyday vehicles.
          Enclosed transport adds protection from weather and road debris and
          can be worth considering for classics, exotics, and cars with valuable
          finishes. Your vehicle’s condition, loading needs, budget, and pickup
          window all matter.
        </p>
      }
      relatedLinks={[
        {
          href: '/car-shipping-cost',
          label: 'What affects car shipping cost?',
        },
        {
          href: '/booking-and-payment',
          label: 'How booking and payment work',
        },
      ]}
    >
      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          What is open car shipping?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Open car shipping moves your vehicle on an unenclosed trailer, often
            alongside other vehicles. Your car is exposed to weather, dust, road
            spray, and debris during the trip.
          </p>
          <p>Choose open transport when:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You’re shipping a daily driver, family car, SUV, or standard
              pickup
            </li>
            <li>Keeping the shipping cost down is a priority</li>
            <li>
              You’re comfortable with outdoor exposure and a car that may arrive
              dirty
            </li>
          </ul>
          <p>
            Open transport generally offers a broader choice of carriers.
            Availability still depends on your route, dates, and vehicle.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          What is enclosed car shipping?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Enclosed car shipping moves your vehicle inside a covered trailer.
            The enclosure provides an additional barrier against weather and
            road debris during transit.
          </p>
          <p>Consider enclosed transport when:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You’re moving a collector car, restored classic, exotic, or show
              car
            </li>
            <li>Protecting a custom or valuable finish is a priority</li>
            <li>
              Reducing outdoor exposure matters enough to justify a higher quote
            </li>
          </ul>
          <p>
            Enclosed trailers and loading equipment vary. Ask which trailer and
            loading method the proposed carrier will use. Enclosed transport
            reduces exposure; it does not guarantee a damage-free shipment.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          How do price and availability compare?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Open transport usually costs less. Enclosed transport typically
            costs more, and fewer enclosed carriers may be available for your
            route and pickup window.
          </p>
          <p>
            The actual difference depends on distance, season, vehicle size and
            condition, timing, and current carrier availability. Compare quotes
            for the same vehicle, route, and dates rather than relying on a
            fixed price difference. Learn more about{' '}
            <Link href="/car-shipping-cost" className={linkClass}>
              what affects car shipping cost
            </Link>
            .
          </p>
          <p>
            If timing is tight, tell us your earliest pickup date and any firm
            deadline. Ask what pickup and delivery windows are available before
            choosing a carrier.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Low clearance, non-running, or exotic? Ask first.
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Trailer type is only part of the decision. Share these details
            before accepting a transport arrangement:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-semibold text-text">
                Low clearance:
              </strong>{' '}
              Give the ground clearance and describe lowered suspension,
              splitters, or other modifications. Ask whether the carrier’s ramps
              or liftgate can accommodate the vehicle.
            </li>
            <li>
              <strong className="font-semibold text-text">
                Non-running vehicles:
              </strong>{' '}
              Explain whether the car starts, rolls, steers, and brakes. Mention
              locked wheels, missing keys, or leaks. Ask what loading equipment
              is needed and whether it changes the quote.
            </li>
            <li>
              <strong className="font-semibold text-text">
                Classics and exotics:
              </strong>{' '}
              Identify unusual dimensions, handling instructions, modifications,
              and the vehicle’s value. Ask about the carrier’s experience with
              similar vehicles and any coverage limitations.
            </li>
          </ul>
          <p>
            Suitability depends on the specific carrier and equipment. Confirm
            those details before booking.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          What should you check with either option?
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            Ask for the carrier’s identity and insurance details. Review
            applicable policy limits, exclusions, deductibles, and the claim
            process. An enclosed trailer alone does not establish what insurance
            covers.
          </p>
          <p>
            At pickup and delivery, inspect the vehicle with the driver and take
            clear photos. Keep copies of the inspection reports and record any
            new damage on the delivery report. Notify the carrier and your
            BladeHaul agent promptly if you notice a problem.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Compare your options with BladeHaul
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-dim">
          <p>
            BladeHaul Auto Transport LLC is a Texas-registered, authorized auto
            transport broker. We arrange shipments with independent motor
            carriers. The carrier you approve provides the truck and performs
            the physical transportation.
          </p>
          <p>
            We confirm the carrier, total price, and booking details in writing
            before any payment. A free quote request does not book a shipment;
            review your separate transport agreement before proceeding. Learn{' '}
            <Link href="/booking-and-payment" className={linkClass}>
              how booking and payment work
            </Link>
            .
          </p>
          <p>
            Prefer email? Send your pickup and delivery ZIP codes, vehicle
            year/make/model, condition, and preferred dates to{' '}
            <a href="mailto:info@bladehaul.com" className={linkClass}>
              info@bladehaul.com
            </a>
            . Ask us to compare open and enclosed options for your shipment, or{' '}
            <Link href="/contact" className={linkClass}>
              contact BladeHaul
            </Link>{' '}
            with your questions.
          </p>
        </div>
      </section>
    </InformationPage>
  );
}
