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
    q: 'Are you a licensed auto transport broker?',
    a: 'Yes. BladeHaul Auto Transport LLC is an AUTHORIZED Broker of Property Except HHG (USDOT 6803480, MC 85480782). We arrange vehicle transport with independent motor carriers you approve. This authority does not cover Household Goods.',
  },
  {
    q: 'How long does car shipping take?',
    a: 'Most cars cross the country in 5 to 10 days. Door-to-door time depends on distance and carrier availability. We give you a realistic window when we book the load and update you daily.',
  },
  {
    q: 'How is my price determined?',
    a: 'We check current market conditions for your route, vehicle, dates, and trailer type. Before you accept a carrier, we confirm the total price and payment details in writing.',
  },
  {
    q: "Why don't you list prices on the site?",
    a: 'Your price depends on the route, season, vehicle size and condition, trailer type, and current carrier availability. An individual quote lets us account for those details. You approve the carrier and final price before dispatch.',
  },
  {
    q: 'What if carrier availability or market conditions change?',
    a: 'If anything changes before dispatch, your agent explains the situation and walks you through the available options. You decide how to proceed. We confirm the carrier, price, and agreed booking details in writing before taking any payment.',
  },
  {
    q: 'When do I pay, and who handles my shipment?',
    a: 'Your quote is free. Your transport order sets out the spot reservation amount, carrier payment, and cancellation terms before you book. The spot reservation amount is ordinarily collected after your carrier is confirmed, before pickup. Your agent stays with you from quote to delivery, with daily updates.',
  },
  {
    q: 'Open trailer vs enclosed trailer, which do I need?',
    a: 'Open transport suits most everyday vehicles and usually costs less. The vehicle travels exposed to weather and road debris. Enclosed transport offers more protection and may suit collector cars, exotics, classics, or lowered vehicles. We explain the options and any special loading needs before you choose.',
  },
  {
    q: 'How should I prep the car before pickup?',
    a: 'Keep fuel around a quarter tank, check the tires and battery, and tell us about leaks or mechanical issues. Disable alarms and remove toll transponders, garage remotes, valuables, and loose accessories. Ask before packing personal belongings: carrier permission and weight limits vary, and vehicle cargo coverage may exclude those items.',
  },
  {
    q: 'Is my car insured during transport?',
    a: "We check the carrier's insurance before assignment and provide the details before pickup. Coverage depends on the carrier's policy, limits, exclusions, and the facts of a claim. Tell us about high-value vehicles or special coverage needs before you accept a carrier.",
  },
  {
    q: 'What happens if my car is damaged in transit?',
    a: 'Inspect the vehicle with the driver at pickup and delivery, take clear photos, and record any new damage on the delivery inspection report. Contact the carrier and your BladeHaul agent promptly. We help gather the shipment records and connect you with the carrier; the carrier and insurer evaluate the claim under the applicable terms and law.',
  },
  {
    q: 'Can you handle classic, exotic, or non-running vehicles?',
    a: 'We can arrange transport for these vehicles with suitable carriers and equipment. Tell us whether the vehicle starts, rolls, steers, and brakes, along with any clearance issues, when you request a quote.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'Booking 2 to 4 weeks ahead gives you the best choice of carriers and pickup dates. We can still help with shorter notice, but options become more limited.',
  },
  {
    q: 'Do you ship to or from auctions?',
    a: 'We can arrange auction, dealer, private-sale, and port pickups where the carrier has the required access. Share the release paperwork and collection requirements before scheduling so the driver arrives prepared.',
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
            <h2 className="max-w-2xl font-display text-3xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
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
                    className="flex min-h-14 w-full cursor-pointer items-start justify-between gap-6 py-5 text-left text-base font-medium text-white transition-colors duration-200 ease-out-quart hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange sm:text-lg"
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
                    aria-hidden={!isOpen}
                    inert={!isOpen}
                    className={cn(
                      'grid transition-[grid-template-rows] duration-300 ease-out-quart motion-reduce:transition-none',
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div
                      className={cn(
                        'overflow-hidden',
                        isOpen ? 'visible' : 'invisible',
                      )}
                    >
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
