import { ArrowRight } from 'lucide-react';
import Container from '@/components/shared/Container';

type Route = {
  from: string;
  to: string;
};

const routes: Route[] = [
  { from: 'New York, NY', to: 'Miami, FL' },
  { from: 'Los Angeles, CA', to: 'New York, NY' },
  { from: 'Chicago, IL', to: 'Orlando, FL' },
  { from: 'Dallas, TX', to: 'Los Angeles, CA' },
  { from: 'Newark, NJ', to: 'Miami, FL' },
  { from: 'Atlanta, GA', to: 'Los Angeles, CA' },
  { from: 'Phoenix, AZ', to: 'Seattle, WA' },
  { from: 'Columbus, OH', to: 'Orlando, FL' },
  { from: 'Detroit, MI', to: 'Phoenix, AZ' },
  { from: 'Boston, MA', to: 'Miami, FL' },
];

export default function Routes() {
  return (
    <section
      id="routes"
      className="scroll-mt-64 bg-navy text-white sm:scroll-mt-72"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] leading-[1.02] sm:text-4xl lg:text-5xl">
            We ship coast to coast
          </h2>
          <div className="mt-5 space-y-1 text-lg text-white/65">
            <p>We move cars between any two points in the United States.</p>
            <p>These are the routes we ship most often.</p>
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5">
          {routes.map(({ from, to }) => (
            <li key={`${from}-${to}`}>
              <div className="group flex h-full flex-col gap-3 rounded-xl bg-dark p-5 ring-1 ring-white/10 transition-colors duration-200 ease-out-quart hover:ring-white/25">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  Route
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold tracking-tight text-white">
                    {from}
                  </span>
                  <div className="flex items-center gap-2 text-white/40">
                    <ArrowRight
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 text-white/40"
                    />
                    <span className="h-px flex-1 bg-gradient-to-r from-white/30 to-white/5" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-white">
                    {to}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-white/45 sm:text-base">
          We cover all 50 states. These are just the routes we ship most often.
        </p>
      </Container>
    </section>
  );
}
