import CoverageRouteScanner from '@/components/sections/CoverageRouteScanner';
import Container from '@/components/shared/Container';
import { ROUTES, type RouteId } from '@/lib/routes';

const COVERAGE_ROUTE_IDS = [
  'R-002',
  'R-004',
  'R-006',
  'R-001',
] as const satisfies readonly RouteId[];

const COVERAGE_ROUTES = COVERAGE_ROUTE_IDS.map((routeId) => {
  const route = ROUTES.find(({ id }) => id === routeId);
  if (!route) throw new Error(`Missing route ${routeId}`);
  return route;
});

export default function Coverage() {
  return (
    <section
      id="coverage"
      className="relative isolate scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          data-coverage-wash
          className="absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(234,106,17,0.16),transparent_62%),radial-gradient(circle_at_10%_85%,rgba(234,106,17,0.065),transparent_58%)] blur-[48px]"
        />
      </div>

      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span
              aria-hidden="true"
              className="absolute inline-flex h-full w-full rounded-full bg-orange opacity-60 motion-safe:animate-ping"
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange" />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">
            Coverage
          </p>
        </div>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <h2
              aria-label="All 50 states. Every interstate."
              className="font-display text-3xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-4xl lg:text-5xl"
            >
              All 50 states.
              <br />
              Every <em className="not-italic text-orange">interstate.</em>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/65">
              Auto transport across all 50 states. We confirm pickup access,
              carrier availability, and any port arrangements with your quote.
            </p>

            <dl className="mt-10 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-5">
              <div className="flex flex-col gap-1 pr-4">
                <dt className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                  50
                </dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                  States
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-4">
                <dt className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                  Vetted
                </dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                  Carriers
                </dd>
              </div>
              <div className="flex flex-col gap-1 pl-4">
                <dt className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                  Door
                </dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                  to door
                </dd>
              </div>
            </dl>
          </div>

          <CoverageRouteScanner routes={COVERAGE_ROUTES} />
        </div>
      </Container>
    </section>
  );
}
