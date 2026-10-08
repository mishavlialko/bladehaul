import Container from '@/components/shared/Container';
import { cn } from '@/lib/cn';

type Metric = {
  headline: string;
  detail: string;
};

const metrics: Metric[] = [
  {
    headline: 'AUTHORIZED broker',
    // Keep each ID together so wrap lands on the · on narrow screens.
    detail: 'USDOT\u00A06803480 · MC\u00A085480782',
  },
  {
    headline: 'Daily updates',
    detail: 'Even on quiet days.',
  },
  {
    headline: 'Your agent',
    detail: 'Quote to delivery, same person.',
  },
  {
    headline: 'No payment',
    detail: 'Until your carrier is confirmed.',
  },
];

export default function TrustStrip() {
  return (
    <section
      aria-label="What you can count on"
      className="border-b border-white/10 bg-navy text-white"
    >
      <Container>
        {/* Outer frame + explicit internal borders. Avoid divide-* on a 2×2
            grid: divide-x paints a left border on the bottom-left cell too,
            which throws off the frame on ~390px. */}
        <dl className="grid grid-cols-2 border border-white/10 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.headline}
              className={cn(
                'flex min-h-[8rem] flex-col justify-center gap-1.5 px-4 py-5 sm:min-h-0 sm:gap-2 sm:px-7 sm:py-10',
                'border-white/10',
                // Mobile 2×2: right edge on col 1, bottom edge on row 1.
                index % 2 === 0 && 'border-r lg:border-r-0',
                index < 2 && 'border-b lg:border-b-0',
                // Desktop 4-col: vertical rules only between cells.
                index < 3 && 'lg:border-r',
              )}
            >
              <dt className="text-balance font-display text-lg font-semibold leading-tight tracking-[-0.02em] sm:text-2xl sm:leading-snug">
                {metric.headline}
              </dt>
              <dd className="text-pretty text-xs leading-snug text-white/55 sm:text-sm sm:leading-normal">
                {metric.detail}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
