import { ArrowRight } from 'lucide-react';
import Container from '@/components/shared/Container';

type Route = {
  id: string;
  from: string;
  to: string;
};

const routes: Route[] = [
  { id: 'R-001', from: 'New York, NY', to: 'Miami, FL' },
  { id: 'R-002', from: 'Los Angeles, CA', to: 'New York, NY' },
  { id: 'R-003', from: 'Chicago, IL', to: 'Orlando, FL' },
  { id: 'R-004', from: 'Dallas, TX', to: 'Los Angeles, CA' },
  { id: 'R-005', from: 'Newark, NJ', to: 'Miami, FL' },
  { id: 'R-006', from: 'Atlanta, GA', to: 'Los Angeles, CA' },
  { id: 'R-007', from: 'Phoenix, AZ', to: 'Seattle, WA' },
  { id: 'R-008', from: 'Columbus, OH', to: 'Orlando, FL' },
  { id: 'R-009', from: 'Detroit, MI', to: 'Phoenix, AZ' },
  { id: 'R-010', from: 'Boston, MA', to: 'Miami, FL' },
];

const ROW_COLS = 'sm:grid-cols-[110px_1fr_28px_1fr] sm:items-center sm:gap-6';

export default function Routes() {
  return (
    <section
      id="routes"
      className="scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">
            <span>MANIFEST</span>
            <span className="mx-2 text-white/25" aria-hidden="true">
              {'//'}
            </span>
            <span className="text-white/60">10 ROUTES</span>
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] leading-[1.02] sm:text-4xl lg:text-5xl">
            We ship coast to coast
          </h2>
          <div className="mt-5 space-y-1 text-lg text-white/65">
            <p>We move cars between any two points in the United States.</p>
            <p>These are the routes we ship most often.</p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 lg:mt-16">
          {/* Header row (desktop only). */}
          <div
            className={`hidden border-b border-white/10 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:grid ${ROW_COLS}`}
            aria-hidden="true"
          >
            <span>ROUTE</span>
            <span>ORIGIN</span>
            <span />
            <span>DESTINATION</span>
          </div>

          <ul>
            {routes.map(({ id, from, to }) => (
              <li
                key={id}
                className="border-b border-white/10 transition-colors duration-200 ease-out-quart hover:bg-white/[0.03]"
              >
                <div
                  className={`grid grid-cols-1 gap-1.5 py-5 sm:gap-6 sm:py-4 ${ROW_COLS}`}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                    [{id}]
                  </p>
                  <p className="text-base font-semibold tracking-tight text-white">
                    {from}
                  </p>
                  {/* Mobile arrow row (hidden on desktop). */}
                  <div className="flex items-center gap-3 py-1 text-white/35 sm:hidden">
                    <ArrowRight
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 rotate-90"
                    />
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                  {/* Desktop arrow icon (hidden on mobile). */}
                  <ArrowRight
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="hidden h-4 w-4 text-white/40 sm:block"
                  />
                  <p className="text-base font-semibold tracking-tight text-white">
                    {to}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
          <span className="text-white/55">COVERAGE</span>
          <span className="mx-2 text-white/25" aria-hidden="true">
            {'//'}
          </span>
          <span>ALL 50 STATES</span>
          <span className="mx-2 text-white/25" aria-hidden="true">
            {'//'}
          </span>
          <span className="text-white/35">ROUTES ABOVE = MOST FREQUENT</span>
        </p>
      </Container>
    </section>
  );
}
