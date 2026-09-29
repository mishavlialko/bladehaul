import Container from '@/components/shared/Container';

const facts = [
  'Auto transport experience since 2022',
  'Experience gained before BladeHaul',
  'Texas-registered LLC',
];

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            Built by someone who actually does this
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/65">
            <p>
              BladeHaul is built on hands-on auto transport experience gained
              since 2022, before the company was formed.
            </p>
            <p>
              That experience shaped the way we work: one agent handling your
              shipment, daily updates, and clear options before you make a
              decision.
            </p>
            <p>
              We arrange your transport. You approve the carrier and the price.
            </p>
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
