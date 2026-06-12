'use client';

import { useEffect, useState } from 'react';
import { type Shipment } from '@/lib/shipments';

type Props = {
  shipment: Shipment;
  // Front card animates the progress marker + shows the In transit ping.
  // Back cards skip those — they're decorative texture, not data.
  interactive?: boolean;
};

export default function ShipmentCard({ shipment, interactive = true }: Props) {
  // Decorative back cards render at final progress with no animation;
  // only the front card starts at 0 and slides its marker into place.
  const [animatedProgress, setAnimatedProgress] = useState(
    interactive ? 0 : shipment.progress,
  );

  useEffect(() => {
    if (!interactive) return;
    const t = window.setTimeout(
      () => setAnimatedProgress(shipment.progress),
      120,
    );
    return () => window.clearTimeout(t);
  }, [shipment.progress, interactive]);

  return (
    <div className="relative rounded-[1.25rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
      <div className="rounded-[calc(1.25rem-0.375rem)] bg-dark/85 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
            Example shipment
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/65">
            {interactive ? (
              <span className="relative flex h-1.5 w-1.5">
                <span
                  aria-hidden="true"
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-60"
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-orange"
              />
            )}
            In transit
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold tracking-tight text-white">
              {shipment.fromCity}
            </span>
            <span className="text-[10px] text-white/45">
              {shipment.fromZip}
            </span>
          </div>
          <div aria-hidden="true" className="flex flex-1 items-center gap-1.5">
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
            <span className="text-[10px] text-white/45">{shipment.toZip}</span>
          </div>
        </div>

        <p className="mt-4 border-t border-white/5 pt-3 text-xs text-white/75">
          {shipment.vehicle} · Open transport
        </p>
      </div>
    </div>
  );
}
