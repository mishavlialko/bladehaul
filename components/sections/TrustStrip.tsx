import Container from '@/components/shared/Container';

type Metric = {
  headline: string;
  detail: string;
};

const metrics: Metric[] = [
  {
    headline: 'Daily updates',
    detail: 'Even on quiet days.',
  },
  {
    headline: 'Written confirmations',
    detail: 'Price changes never come by phone.',
  },
  {
    headline: 'One dispatcher',
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
        <dl className="grid grid-cols-2 divide-x divide-y divide-white/10 [&>*:nth-child(-n+2)]:border-t-0 [&>*:nth-child(2n-1)]:border-l-0 lg:grid-cols-4 lg:divide-y-0 lg:[&>*]:border-t-0">
          {metrics.map((metric) => (
            <div
              key={metric.headline}
              className="flex flex-col gap-2 px-5 py-8 sm:px-7 sm:py-10"
            >
              <dt className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                {metric.headline}
              </dt>
              <dd className="text-xs text-white/55 sm:text-sm">
                {metric.detail}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
