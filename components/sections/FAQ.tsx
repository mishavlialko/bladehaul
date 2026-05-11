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
    q: 'What if the market price changes after I book?',
    a: 'If the price goes up, we tell you in writing and give you two options: pay the difference to keep your pickup date, or extend the pickup date to keep the original price. You choose.',
  },
  {
    q: 'Open trailer vs enclosed trailer, which do I need?',
    a: 'Open trailer is standard and works for most vehicles. Enclosed is available if you want extra protection from weather or road debris. We quote both so you can decide.',
  },
  {
    q: 'Is my car insured during transport?',
    a: 'Every carrier we work with carries insurance. We only use carriers who meet our insurance requirements. You get the carrier insurance details in writing before pickup.',
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
      className="scroll-mt-64 bg-navy text-white sm:scroll-mt-72"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] leading-[1.02] sm:text-4xl lg:text-5xl">
            Questions we get asked most
          </h2>
        </div>

        <ul className="mt-12 max-w-3xl border-t border-white/10 lg:mt-16">
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
      </Container>
    </section>
  );
}
