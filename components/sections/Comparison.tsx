import { Check, X } from 'lucide-react';
import { Fragment } from 'react';
import Container from '@/components/shared/Container';

type Pair = {
  bad: string;
  good: string;
};

const pairs: Pair[] = [
  {
    bad: 'A quote that does not match available carriers',
    good: 'We check the current market for your route and vehicle',
  },
  {
    bad: 'Silence after booking',
    good: 'Daily updates from the day you book until delivery',
  },
  {
    bad: 'Pressure to make a last-minute decision',
    good: 'We explain what changed and your options. You decide what happens next.',
  },
  {
    bad: 'Different person every time you call',
    good: 'Your agent handles your order from quote to driveway.',
  },
  {
    bad: 'Unclear information about who is moving your car',
    good: 'We check carrier identity, authority, and insurance before assignment',
  },
];

export default function Comparison() {
  return (
    <section className="bg-navy text-white">
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            How we&apos;re different
          </h2>
          <p className="mt-5 text-lg text-white/65">
            Here&apos;s what actually happens after you book.
          </p>
        </div>

        <div className="mt-14 grid gap-x-12 sm:grid-cols-2 lg:mt-20">
          <p className="hidden border-b border-white/10 pb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55 sm:block">
            Common frustrations
          </p>
          <p className="hidden border-b border-white/10 pb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange sm:block">
            BladeHaul
          </p>

          {pairs.map((pair, idx) => (
            <Fragment key={idx}>
              <div className="flex items-start gap-3 border-b border-white/10 py-6">
                <X
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="mt-0.5 h-5 w-5 shrink-0 text-white/55"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55 sm:sr-only">
                    Common frustrations
                  </span>
                  <p className="text-base leading-relaxed text-white/60 sm:text-[17px]">
                    {pair.bad}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-b border-white/10 py-6">
                <Check
                  aria-hidden="true"
                  strokeWidth={2}
                  className="mt-0.5 h-5 w-5 shrink-0 text-orange"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange sm:sr-only">
                    BladeHaul
                  </span>
                  <p className="text-base font-medium leading-relaxed text-white sm:text-[17px]">
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
