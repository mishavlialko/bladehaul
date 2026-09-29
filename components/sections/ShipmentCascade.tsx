import ShipmentTracker from '@/components/sections/ShipmentTracker';
import { shipmentPreviews } from '@/lib/shipments';

// Desktop-only secondary proof beside the quote form. One calm, explicitly
// labelled example stays subordinate to the conversion form. Its vehicle and
// status change on refresh without implying a real customer or live tracking.
export default function ShipmentCascade() {
  return (
    <div className="hidden min-h-[13.25rem] lg:block">
      <ShipmentTracker shipments={shipmentPreviews} />
    </div>
  );
}
