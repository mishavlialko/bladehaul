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
      className="scroll-mt-20 bg-navy text-white sm:scroll-mt-24"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            We ship coast to coast
          </h2>
          <p className="mt-5 text-lg text-white/65">
            We move cars between any two points in the United States. These are
            the routes we ship most often.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5">
          {routes.map(({ from, to }) => (
            <li key={`${from}-${to}`}>
              <div className="group flex h-full flex-col gap-3 rounded-xl bg-white/[0.03] p-5 ring-1 ring-white/10 transition-colors duration-200 ease-out-quart hover:bg-white/[0.06] hover:ring-white/20">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  Route
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold tracking-tight text-white">
                    {from}
                  </span>
                  <div className="flex items-center gap-2 text-white/45">
                    <ArrowRight
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 text-orange"
                    />
                    <span className="h-px flex-1 bg-gradient-to-r from-orange/40 to-white/15" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-white">
                    {to}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-white/55 sm:text-base">
          We cover all 50 states. These are just the routes we ship most often.
        </p>
      </Container>
    </section>
  );
}
