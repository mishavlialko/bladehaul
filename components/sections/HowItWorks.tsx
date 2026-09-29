import Container from '@/components/shared/Container';

type Step = {
  number: string;
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    number: '01',
    title: 'Get a real quote',
    body: 'We prepare your quote using your route, vehicle, timing, and current carrier rates.',
  },
  {
    number: '02',
    title: 'Confirm your carrier',
    body: 'Your agent reviews the options with you. Once you decide, we confirm the carrier, price, and booking details in writing before any deposit.',
  },
  {
    number: '03',
    title: 'Daily updates until delivery',
    body: 'Your agent keeps you updated every day from booking through delivery, even when nothing changes.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      <Container className="py-20 sm:py-24 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
            <span>Process</span>
            <span className="mx-2 text-white/25" aria-hidden="true">
              {'//'}
            </span>
            <span className="text-white/60">03 steps</span>
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-5 text-lg text-white/65 [text-wrap:balance]">
            Every shipment follows the same clear process.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 sm:mt-14 lg:mt-16 lg:grid-cols-3">
          {steps.map(({ number, title, body }, i) => {
            const isLast = i === steps.length - 1;
            return (
              <li
                key={number}
                className={`relative pl-10 lg:pl-0 lg:pt-12 ${
                  isLast ? '' : 'pb-12 sm:pb-14 lg:pb-0 lg:pr-8'
                }`}
              >
                {/* Connector to the next step. Hidden on the last item. */}
                {!isLast && (
                  <>
                    {/* Vertical rail (mobile). */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[8px] top-[18px] w-px bg-white/20 lg:hidden"
                    />
                    {/* Horizontal rail (desktop). */}
                    <span
                      aria-hidden="true"
                      className="absolute left-[18px] right-0 top-[8px] hidden h-px bg-white/20 lg:block"
                    />
                  </>
                )}

                {/* Node dot. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 block h-[17px] w-[17px] rounded-full border-2 border-orange bg-navy"
                >
                  <span className="absolute left-1/2 top-1/2 block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange" />
                </span>

                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                  [{number}]
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-white sm:mt-4 sm:text-2xl">
                  {title}
                </h3>
                <p className="mt-3 max-w-[21rem] text-base leading-7 text-white/65">
                  {body}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
