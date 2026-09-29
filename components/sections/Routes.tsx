import { ArrowRight } from 'lucide-react';
import Container from '@/components/shared/Container';
import { ROUTES } from '@/lib/routes';

const ROW_COLS = 'sm:grid-cols-[110px_1fr_28px_1fr] sm:items-center sm:gap-6';

export default function Routes() {
  return (
    <section
      id="routes"
      className="scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
            <span>MANIFEST</span>
            <span className="mx-2 text-white/25" aria-hidden="true">
              {'//'}
            </span>
            <span className="text-white/60">10 ROUTES</span>
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            Coast-to-coast routes
          </h2>
          <div className="mt-5 space-y-1 text-lg text-white/65">
            <p>Explore popular coast-to-coast and seasonal routes.</p>
            <p>Your quote is based on your own route and vehicle.</p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 lg:mt-16">
          {/* Header row (desktop only). */}
          <div
            className={`hidden border-b border-white/10 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 sm:grid ${ROW_COLS}`}
            aria-hidden="true"
          >
            <span>ROUTE</span>
            <span>ORIGIN</span>
            <span />
            <span>DESTINATION</span>
          </div>

          <ul>
            {ROUTES.map(({ id, from, to }) => (
              <li
                key={id}
                className="border-b border-white/10 transition-colors duration-200 ease-out-quart hover:bg-white/[0.03]"
              >
                <div
                  className={`grid grid-cols-[1fr_20px_1fr] gap-x-3 gap-y-2 py-4 sm:gap-6 sm:py-4 ${ROW_COLS}`}
                >
                  <p className="col-span-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/55 sm:col-span-1">
                    [{id}]
                  </p>
                  <p className="text-sm font-semibold tracking-tight text-white sm:text-base">
                    {from}
                  </p>
                  {/* Mobile arrow row (hidden on desktop). */}
                  <div className="flex items-center justify-center text-white/55 sm:hidden">
                    <ArrowRight
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5"
                    />
                  </div>
                  {/* Desktop arrow icon (hidden on mobile). */}
                  <ArrowRight
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="hidden h-4 w-4 text-white/40 sm:block"
                  />
                  <p className="text-sm font-semibold tracking-tight text-white sm:text-base">
                    {to}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
          <span className="text-white/55">COVERAGE</span>
          <span className="mx-2 text-white/25" aria-hidden="true">
            {'//'}
          </span>
          <span>ALL 50 STATES</span>
          <span className="mx-2 text-white/25" aria-hidden="true">
            {'//'}
          </span>
          <span className="text-white/55">POPULAR ROUTE EXAMPLES</span>
        </p>
      </Container>
    </section>
  );
}
