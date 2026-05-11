import Container from '@/components/shared/Container';
import MiniQuoteForm from '@/components/sections/MiniQuoteForm';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-navy"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 hidden w-[55%] items-center justify-start lg:flex"
      >
        <div className="relative -ml-24 aspect-[587/533] w-[640px] -rotate-[5deg] xl:-ml-32 xl:w-[820px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.7),rgba(255,255,255,0.35)_38%,rgba(234,106,17,0.18)_70%,rgba(255,255,255,0.05)_100%)] opacity-[0.18] [-webkit-mask-image:url('/blade-emblem.png')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] [mask-image:url('/blade-emblem.png')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
          <div className="absolute inset-0 bg-[conic-gradient(from_210deg_at_50%_50%,rgba(255,255,255,0.5),transparent_30%,transparent_70%,rgba(255,255,255,0.4))] opacity-[0.10] mix-blend-screen [-webkit-mask-image:url('/blade-emblem.png')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] [mask-image:url('/blade-emblem.png')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </div>
      </div>

      <Container className="relative z-0 py-20 sm:py-28 lg:py-36">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-orange" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55 sm:text-xs">
                One Dispatcher <span aria-hidden="true">·</span> 50 States{' '}
                <span aria-hidden="true">·</span> Daily Updates
              </p>
            </div>

            <h1 className="mt-7 font-display text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl lg:leading-[0.98]">
              The Sharpest Way
              <br className="hidden sm:inline" /> to Ship Your Car
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/65 sm:text-xl">
              Sharp on every detail.
            </p>

            <ShipmentPreview />

            <a
              href="#how-it-works"
              className="mt-6 inline-flex items-center gap-2 text-sm text-white/55 underline-offset-4 transition-colors duration-200 ease-out-quart hover:text-white hover:underline"
            >
              See how it works
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="lg:col-span-5 xl:col-span-5">
            <MiniQuoteForm />
          </div>
        </div>
      </Container>
    </section>
  );
}

function ShipmentPreview() {
  return (
    <div className="mt-10 max-w-md">
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
                Brooklyn, NY
              </span>
              <span className="text-[11px] text-white/45">11201</span>
            </div>
            <div
              aria-hidden="true"
              className="flex flex-1 items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
              <span className="h-px flex-1 bg-gradient-to-r from-orange/80 via-white/30 to-white/15" />
              <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-white/40" />
            </div>
            <div className="flex min-w-0 flex-col items-end text-right">
              <span className="text-sm font-semibold tracking-tight text-white">
                Tampa, FL
              </span>
              <span className="text-[11px] text-white/45">33602</span>
            </div>
          </div>

          <div className="mt-5 border-t border-white/5 pt-4">
            <p className="text-sm text-white/85">
              2019 Honda Accord · Open transport
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

          <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-white/60">
            <span
              aria-hidden="true"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange/15 text-[10px] font-semibold text-orange ring-1 ring-orange/30"
            >
              M
            </span>
            <span>Misha, your dispatcher. Updates every 24 hours.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
