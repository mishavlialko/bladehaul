import { FileText, MapPin, Truck } from 'lucide-react';
import Container from '@/components/shared/Container';

type Step = {
  number: string;
  title: string;
  body: string;
  Icon: typeof FileText;
};

const steps: Step[] = [
  {
    number: '01',
    title: 'Get a real quote',
    body: 'We check current market rates for your exact route and give you a price we can actually deliver, not a lowball number to win the deposit.',
    Icon: FileText,
  },
  {
    number: '02',
    title: 'Lock in your carrier',
    body: 'We post your load to our vetted carriers, take the best offer, and confirm everything in writing before anything moves.',
    Icon: Truck,
  },
  {
    number: '03',
    title: 'Daily updates until delivery',
    body: 'From the day you book until the car reaches your driveway, you get an update every day. Even when nothing changes.',
    Icon: MapPin,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-navy text-white sm:scroll-mt-24"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-5 text-lg text-white/65">
            We do the same thing every single time.
          </p>
        </div>

        <ol className="mt-14 grid divide-y divide-white/10 overflow-hidden rounded-2xl ring-1 ring-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:mt-20">
          {steps.map(({ number, title, body, Icon }) => (
            <li key={number} className="flex flex-col p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-medium tracking-[0.22em] text-white/40">
                  {number}
                </span>
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="h-5 w-5 text-orange"
                />
              </div>
              <h3 className="mt-10 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/65">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
