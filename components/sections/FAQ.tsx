'use client';

import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import Container from '@/components/shared/Container';
import { cn } from '@/lib/cn';

type Item = {
  q: string;
  a: string;
};

const items: Item[] = [
  {
    q: 'How long does car shipping take?',
    a: 'Most cars cross the country in 5 to 10 days. Door-to-door time depends on distance and carrier availability. We give you a realistic window when we book the load and update you daily.',
  },
  {
    q: 'How is my price determined?',
    a: 'We check current market rates for your exact route on the day you request a quote. The price reflects real carrier bids, not a lowball number designed to win your deposit.',
  },
  {
    q: "Why don't you list prices on the site?",
    a: "Because carrier prices move every day. A price list that looks fixed would be a promise we can't keep, and that's exactly the game we refuse to play. What actually sets your price: distance and route, the season, the size and weight of your vehicle, whether it runs, open or enclosed trailer, and current fuel costs. We check all of it against the live market for your exact route and send you a real number.",
  },
  {
    q: 'What if the market price changes after I book?',
    a: 'This is covered by our Written Price Rule. If the price goes up, we tell you in writing and give you two options: pay the difference to keep your pickup date, or extend the pickup date to keep the original price. You choose. No surprise phone calls, no pressure.',
  },
  {
    q: "How do I know you won't disappear after I pay?",
    a: "We don't take a deposit until a carrier is confirmed in writing. Until then, you owe us nothing. After booking, the same person answers you every time. No queue, no ticket system, no going quiet.",
  },
  {
    q: 'Open trailer vs enclosed trailer, which do I need?',
    a: 'Open trailer covers about 90% of shipments and works fine for most vehicles. The cars travel exposed to weather and road debris, but incidents are rare and carriers are tightly regulated. Open is usually the cheaper option because each truck carries 7 to 10 vehicles. Enclosed is the call for collector cars, exotics, classics, lowered cars, or anything you want fully protected from weather and dust. We quote both when it makes sense so you can compare.',
  },
  {
    q: 'How should I prep the car before pickup?',
    a: 'Keep the fuel at a quarter to half tank, make sure tires are inflated, the battery has a charge, and there are no active leaks. Disable any car alarms so they do not drain the battery in transit. Remove toll transponders like EZ-Pass, garage remotes, and loose antennas. Personal items are allowed up to about 100 pounds, kept in the trunk and below window level.',
  },
  {
    q: 'Is my car insured during transport?',
    a: "Every carrier we book must meet our insurance requirements before they take the load. You get the carrier's insurance details in writing before pickup.",
  },
  {
    q: 'What happens if my car is damaged in transit?',
    a: "Before pickup, the driver inspects the car with you and records its condition on the Bill of Lading. The same inspection happens at delivery. If something changed in between, note it on the Bill of Lading before signing. That document is what the carrier's insurance pays on. We help you file the claim and stay in the loop until it's resolved.",
  },
  {
    q: 'Can you handle classic, exotic, or non-running vehicles?',
    a: 'Yes. We regularly ship classics, exotics, and non-running cars. Just tell us the condition when you request a quote so we can book the right equipment.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'Booking 2 to 4 weeks ahead gives you the best choice of carriers and pickup dates. We can still help with shorter notice, but options become more limited.',
  },
  {
    q: 'Do you ship to or from auctions?',
    a: 'Yes. We regularly pick up from and deliver to dealer auctions, private sales, and ports.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section
      id="faq"
      className="scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        {/* Two-column on desktop: sticky heading left, accordion right.
            Fills the band without giving up the left-aligned editorial set. */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em] leading-[1.02] sm:text-4xl lg:text-5xl">
              Questions we get asked most
            </h2>
          </div>

          <ul className="border-t border-white/10">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            const triggerId = `${baseId}-trigger-${idx}`;
            const panelId = `${baseId}-panel-${idx}`;
            return (
              <li key={item.q} className="border-b border-white/10">
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full cursor-pointer items-start justify-between gap-6 py-5 text-left text-base font-medium text-white transition-colors duration-200 ease-out-quart hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange sm:text-lg"
                >
                  <span>{item.q}</span>
                  <Plus
                    aria-hidden="true"
                    strokeWidth={1.75}
                    className={cn(
                      'mt-1 h-5 w-5 shrink-0 text-orange transition-transform duration-300 ease-out-quart',
                      isOpen && 'rotate-45',
                    )}
                  />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out-quart motion-reduce:transition-none',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-10 text-[15px] leading-relaxed text-white/65">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
