import Container from '@/components/shared/Container';

const facts = [
  '5 years in car shipping',
  '1,000+ shipments dispatched before BladeHaul',
  'Wyoming-registered LLC',
];

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-64 bg-navy text-white sm:scroll-mt-72"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] leading-[1.02] sm:text-4xl lg:text-5xl">
            Built by someone who actually does this
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/65">
            <p>
              BladeHaul is run by Mykhailo. Before starting this company I spent
              five years dispatching over 1,000 car shipments.
            </p>
            <p>
              I saw the same problems repeat every week: silent brokers,
              last-minute price hikes, and a different person on the phone every
              time.
            </p>
            <p>That&apos;s why I built BladeHaul. To do it differently.</p>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-white/10 pt-8 sm:grid-cols-3">
            {facts.map((fact) => (
              <li
                key={fact}
                className="flex items-start gap-2.5 text-sm font-medium text-white"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40"
                />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
