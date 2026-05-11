'use client';

import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { shipments, type Shipment } from '@/lib/shipments';

export default function ShipmentPreview() {
  // SSR/initial-mount value matches across server + client to avoid
  // hydration mismatch. The randomizer runs after mount.
  const [shipment, setShipment] = useState<Shipment>(shipments[0]);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const next = shipments[Math.floor(Math.random() * shipments.length)];
    // queueMicrotask defers the state update out of the effect body to
    // satisfy React 19's "set-state-in-effect" rule.
    queueMicrotask(() => setShipment(next));
    // Tiny delay so the marker mounts at 0 and the CSS transition
    // animates it into its target position, signalling "live tracking".
    const t = window.setTimeout(() => setAnimatedProgress(next.progress), 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="max-w-md lg:max-w-none">
      <div className="relative rounded-[1.5rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-dark/85 p-5 backdrop-blur-sm sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
              Example shipment
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/65">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  aria-hidden="true"
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-60"
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange" />
              </span>
              In transit
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3 sm:gap-4">
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold tracking-tight text-white">
                {shipment.fromCity}
              </span>
              <span className="text-[11px] text-white/45">
                {shipment.fromZip}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="flex flex-1 items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
              <div className="relative h-px flex-1">
                <span className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-white/10" />
                <span
                  style={{ left: `${animatedProgress * 100}%` }}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-[1200ms] ease-out-quart motion-reduce:transition-none"
                >
                  <span className="block h-2 w-2 rounded-full bg-orange shadow-[0_0_10px_rgba(234,106,17,0.7)]" />
                </span>
              </div>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-white/40" />
            </div>
            <div className="flex min-w-0 flex-col items-end text-right">
              <span className="text-sm font-semibold tracking-tight text-white">
                {shipment.toCity}
              </span>
              <span className="text-[11px] text-white/45">
                {shipment.toZip}
              </span>
            </div>
          </div>

          <div className="mt-5 border-t border-white/5 pt-4">
            <p className="text-sm text-white/85">
              {shipment.vehicle} · Open transport
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/65">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 shrink-0 text-orange"
                aria-hidden="true"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
              <span>Carrier confirmed. Price locked in writing.</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-white/65">
            <MapPin
              aria-hidden="true"
              strokeWidth={1.75}
              className="h-3.5 w-3.5 shrink-0 text-orange"
            />
            <span>Real-time location updates. Daily phone check-ins.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
