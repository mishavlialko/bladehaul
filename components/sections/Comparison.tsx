import { Check, X } from 'lucide-react';
import { Fragment } from 'react';
import Container from '@/components/shared/Container';

type Pair = {
  bad: string;
  good: string;
};

const pairs: Pair[] = [
  {
    bad: "Quote you a low price they can't actually deliver",
    good: 'We quote you the real market price for your route today',
  },
  {
    bad: 'Go silent after taking your deposit',
    good: 'Daily updates from the day you book until delivery',
  },
  {
    bad: 'Call you the day before pickup demanding more money',
    good: 'If the price changes, we explain why and give you two options in writing',
  },
  {
    bad: 'Different person every time you call',
    good: 'Same dispatcher handles your order from quote to driveway',
  },
  {
    bad: 'Leave you guessing who is actually moving your car',
    good: 'We only work with carriers we have personally vetted',
  },
];

export default function Comparison() {
  return (
    <section className="bg-white text-text">
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            How we&apos;re different
          </h2>
          <p className="mt-5 text-lg text-text-dim">
            Here&apos;s what actually happens after you book.
          </p>
        </div>

        <div className="mt-14 grid gap-x-12 sm:grid-cols-2 lg:mt-20">
          <p className="hidden border-b border-line pb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-faint sm:block">
            Other brokers
          </p>
          <p className="hidden border-b border-line pb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange sm:block">
            BladeHaul
          </p>

          {pairs.map((pair, idx) => (
            <Fragment key={idx}>
              <div className="flex items-start gap-3 border-b border-line py-6">
                <X
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="mt-0.5 h-5 w-5 shrink-0 text-text-faint"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-faint sm:sr-only">
                    Other brokers
                  </span>
                  <p className="text-base leading-relaxed text-text-dim sm:text-[17px]">
                    {pair.bad}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-b border-line py-6">
                <Check
                  aria-hidden="true"
                  strokeWidth={2}
                  className="mt-0.5 h-5 w-5 shrink-0 text-orange"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange sm:sr-only">
                    BladeHaul
                  </span>
                  <p className="text-base font-medium leading-relaxed text-text sm:text-[17px]">
                    {pair.good}
                  </p>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </Container>
    </section>
  );
}
