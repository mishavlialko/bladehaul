import Container from '@/components/shared/Container';

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
    headline: 'No deposit',
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
        {/* Outer border frames the strip; divide-* draw internal lines only. */}
        <dl className="grid grid-cols-2 divide-x divide-y divide-white/10 border border-white/10 lg:grid-cols-4 lg:divide-y-0">
          {metrics.map((metric) => (
            <div
              key={metric.headline}
              className="flex min-h-[8rem] flex-col justify-center gap-1.5 px-4 py-5 sm:min-h-0 sm:gap-2 sm:px-7 sm:py-10"
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
