import ShipmentCard from '@/components/sections/ShipmentCard';
import { shipments, type Shipment } from '@/lib/shipments';

type Trio = readonly [Shipment, Shipment, Shipment];

// Deterministic, hand-picked spread (snowbird, coast-to-coast, midwest-west).
// This used to shuffle in a mount effect, which repainted the cards right
// after hydration — a visible text swap for zero conversion value. The page
// is statically prerendered, so per-visit randomness isn't possible
// server-side anyway.
const PICKS: Trio = [shipments[0], shipments[5], shipments[10]];

// Secondary visual proof element. Three shipment cards stacked like a deck —
// front is sharp + animated, back two are blurred texture peeking from behind.
// Sits next to the conversion form; must NOT compete for attention.
// Hidden on mobile (the form alone owns the right column on small screens).
export default function ShipmentCascade() {
  return (
    <div aria-hidden="true" className="relative hidden h-[200px] lg:block">
      {/* Back-2: deepest, most blurred */}
      <div className="pointer-events-none absolute inset-x-0 top-0 translate-x-2.5 translate-y-4 rotate-[2.4deg] opacity-35 blur-[3px]">
        <ShipmentCard shipment={PICKS[2]} interactive={false} />
      </div>

      {/* Back-1: middle layer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 translate-x-1 translate-y-2 rotate-[1.2deg] opacity-60 blur-[1.5px]">
        <ShipmentCard shipment={PICKS[1]} interactive={false} />
      </div>

      {/* Front: sharp, animated, owns the data */}
      <div className="relative">
        <ShipmentCard shipment={PICKS[0]} interactive />
      </div>
    </div>
  );
}
