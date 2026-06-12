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
    body: 'We check current market rates for your exact route and give you a price we can actually deliver, not a lowball number to win the deposit.',
  },
  {
    number: '02',
    title: 'Lock in your carrier',
    body: 'We post your load to our vetted carriers, take the best offer, and confirm everything in writing before anything moves.',
  },
  {
    number: '03',
    title: 'Daily updates until delivery',
    body: 'From the day you book until the car reaches your driveway, you get an update every day. Even when nothing changes.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">
            <span>OPERATIONS</span>
            <span className="mx-2 text-white/25" aria-hidden="true">
              {'//'}
            </span>
            <span className="text-white/60">03 STEPS</span>
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] leading-[1.02] sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-5 text-lg text-white/65">
            We do the same thing every single time.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 sm:mt-20 sm:grid-cols-3">
          {steps.map(({ number, title, body }, i) => {
            const isLast = i === steps.length - 1;
            return (
              <li
                key={number}
                className={`relative pl-9 sm:pl-0 sm:pt-12 ${
                  isLast ? '' : 'pb-14 sm:pb-0 sm:pr-8'
                }`}
              >
                {/* Connector to the next step. Hidden on the last item. */}
                {!isLast && (
                  <>
                    {/* Vertical rail (mobile). */}
                    <span
                      aria-hidden="true"
                      className="absolute left-[7px] top-[16px] bottom-0 w-px bg-white/25 sm:hidden"
                    />
                    {/* Horizontal rail (desktop). */}
                    <span
                      aria-hidden="true"
                      className="absolute left-[16px] right-0 top-[7px] hidden h-px bg-white/25 sm:block"
                    />
                  </>
                )}

                {/* Node dot. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 block h-[15px] w-[15px] rounded-full border-2 border-orange bg-navy"
                >
                  <span className="absolute left-1/2 top-1/2 block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange" />
                </span>

                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                  [{number}]
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-white sm:mt-4 sm:text-2xl">
                  {title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/65">
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
