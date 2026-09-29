import { cn } from '@/lib/cn';
import { type ShipmentPreview } from '@/lib/shipments';

type Props = {
  shipment: ShipmentPreview;
  activeIndex: number;
  count: number;
  onNext: () => void;
  ready?: boolean;
};

export default function ShipmentCard({
  shipment,
  activeIndex,
  count,
  onNext,
  ready = true,
}: Props) {
  return (
    <div
      data-ready={ready}
      className="shipment-example rounded-xl bg-white/[0.04] p-1.5 ring-1 ring-white/10"
    >
      <div className="rounded-lg bg-dark/95 p-5">
        <div className="flex min-h-5 items-center justify-between gap-3">
          <p className="whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
            Example shipment
          </p>
          <div
            aria-hidden={!ready}
            className="shipment-example-content flex shrink-0 items-center gap-2 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-white/70"
          >
            <span className="text-white/40">
              {activeIndex + 1} / {count}
            </span>
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-orange"
            />
            <span className="whitespace-nowrap">{shipment.status}</span>
          </div>
        </div>

        <div
          aria-hidden={!ready}
          className="shipment-example-content mt-4 grid grid-cols-[minmax(0,1fr)_minmax(5rem,1.05fr)_minmax(0,1fr)] items-center gap-3"
        >
          <div className="min-w-0">
            <p className="flex min-h-9 items-center text-sm font-semibold leading-tight tracking-tight text-white">
              {shipment.fromCity}
            </p>
            <p className="font-mono text-[10px] tabular-nums text-white/60">
              {shipment.fromZip}
            </p>
          </div>

          <div aria-hidden="true" className="relative h-4 min-w-0">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/15" />
            <div className="relative grid h-full grid-cols-4 items-center">
              {([0, 1, 2, 3] as const).map((stage) => (
                <span
                  key={stage}
                  className={cn(
                    'relative z-10 mx-auto h-2 w-2 rounded-full border',
                    stage < shipment.stage && 'border-white/70 bg-white/70',
                    stage === shipment.stage &&
                      'border-orange bg-orange ring-4 ring-orange/15',
                    stage > shipment.stage && 'border-white/35 bg-dark',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0 text-right">
            <p className="flex min-h-9 items-center justify-end text-sm font-semibold leading-tight tracking-tight text-white">
              {shipment.toCity}
            </p>
            <p className="font-mono text-[10px] tabular-nums text-white/60">
              {shipment.toZip}
            </p>
          </div>
        </div>

        <div
          aria-hidden={!ready}
          className="shipment-example-content mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-white/10 pt-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium tracking-tight text-white/90">
              {shipment.vehicle}
            </p>
            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-white/60">
              {shipment.transport}
              <span aria-hidden="true" className="px-1.5 text-white/25">
                /
              </span>
              {shipment.detail}
            </p>
          </div>

          <button
            type="button"
            aria-label="Show next example shipment"
            disabled={!ready}
            onClick={onNext}
            className="group flex min-h-11 items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55 transition-colors duration-150 ease-out hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            Next
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
