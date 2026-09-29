'use client';

import { useEffect, useState } from 'react';
import ShipmentCard from '@/components/sections/ShipmentCard';
import {
  orderShipmentExamples,
  type LastShipmentExample,
  type ShipmentPreview,
} from '@/lib/shipments';

type Props = {
  shipments: readonly ShipmentPreview[];
};

const LAST_EXAMPLE_KEY = 'bladehaul:last-shipment-example';

type TrackerState = {
  order: readonly ShipmentPreview[];
  activeIndex: number;
  interactions: number;
};

function readLastExample(): LastShipmentExample | undefined {
  try {
    const raw = sessionStorage.getItem(LAST_EXAMPLE_KEY);
    const value: unknown = raw ? JSON.parse(raw) : undefined;
    if (
      value &&
      typeof value === 'object' &&
      'id' in value &&
      'status' in value &&
      typeof value.id === 'string' &&
      typeof value.status === 'string' &&
      ['Carrier assigned', 'Picked up', 'In transit', 'Delivered'].includes(
        value.status,
      )
    ) {
      return {
        id: value.id,
        status: value.status as ShipmentPreview['status'],
      };
    }
  } catch {
    // The examples still work if the browser blocks optional session storage.
  }
  return undefined;
}

export default function ShipmentTracker({ shipments }: Props) {
  const [tracker, setTracker] = useState<TrackerState | null>(null);

  useEffect(() => {
    // Keep the same card frame on the server and client. Choose examples
    // after hydration, then reveal only the content inside that stable frame.
    const frame = requestAnimationFrame(() => {
      setTracker({
        order: orderShipmentExamples(shipments, readLastExample()),
        activeIndex: 0,
        interactions: 0,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [shipments]);

  const currentShipment = tracker?.order[tracker.activeIndex];

  useEffect(() => {
    if (!currentShipment) return;
    try {
      // Technical display state only: no customer or quote information.
      sessionStorage.setItem(
        LAST_EXAMPLE_KEY,
        JSON.stringify({
          id: currentShipment.id,
          status: currentShipment.status,
        }),
      );
    } catch {
      // Private/restricted browsing may decline this optional preference.
    }
  }, [currentShipment]);

  const handleNext = () => {
    setTracker(
      (current) =>
        current && {
          ...current,
          activeIndex: (current.activeIndex + 1) % current.order.length,
          interactions: current.interactions + 1,
        },
    );
  };

  if (shipments.length === 0) return null;

  const announcement =
    tracker?.interactions && currentShipment
      ? `Example ${tracker.activeIndex + 1} of ${tracker.order.length}. ${currentShipment.status}. ${currentShipment.vehicle}, ${currentShipment.fromCity} to ${currentShipment.toCity}, ${currentShipment.transport}.`
      : '';

  return (
    <section aria-label="Shipment examples" aria-busy={!currentShipment}>
      <ShipmentCard
        shipment={currentShipment ?? shipments[0]}
        activeIndex={tracker?.activeIndex ?? 0}
        count={shipments.length}
        onNext={handleNext}
        ready={!!currentShipment}
      />
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
