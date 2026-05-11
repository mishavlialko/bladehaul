import Container from '@/components/shared/Container';
import MiniQuoteForm from '@/components/sections/MiniQuoteForm';
import ShipmentPreview from '@/components/sections/ShipmentPreview';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      {/* Background photo layer — swap /public/hero-bg.jpg for the final asset */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-navy [background-image:url('/hero-bg.jpg')] bg-cover bg-center"
      />
      {/* Light universal darken (keeps photo visible) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-navy/30"
      />
      {/* Focal darken behind left-column text only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_75%_at_20%_50%,rgba(11,13,17,0.65),transparent_75%)]"
      />
      {/* Bottom fade into the dark section below + hides Banana watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-b from-transparent to-navy"
      />

      <Container className="relative z-0 py-20 sm:py-28 lg:py-36">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 xl:col-span-7 lg:pt-6">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-white/20" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55 sm:text-xs">
                One Dispatcher <span aria-hidden="true">·</span> 50 States{' '}
                <span aria-hidden="true">·</span> Daily Updates
              </p>
            </div>

            <h1 className="mt-7 font-display text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              The Sharpest Way
              <br className="hidden sm:inline" /> to Ship Your Car
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/75 sm:text-xl">
              Sharp on every detail.
            </p>

            <a
              href="#how-it-works"
              className="mt-8 inline-flex items-center gap-2 text-sm text-white/60 underline-offset-4 transition-colors duration-200 ease-out-quart hover:text-white hover:underline"
            >
              See how it works
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="lg:col-span-5 xl:col-span-5">
            <MiniQuoteForm />
            <div className="mt-6">
              <ShipmentPreview />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
