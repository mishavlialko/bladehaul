import Image from 'next/image';
import Container from '@/components/shared/Container';
import MiniQuoteForm from '@/components/sections/MiniQuoteForm';
import ShipmentCascade from '@/components/sections/ShipmentCascade';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      {/* Generated evening-city image, enhanced with the installed Upscayl
          engine. Responsive derivatives keep the large master off the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-navy"
      >
        <Image
          src="/hero-bg-v4-city-upscayl.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-left"
        />
      </div>
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
      {/* Bottom fade into the dark section below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-b from-transparent to-navy"
      />

      <Container className="relative z-0 pb-20 pt-[calc(8rem+env(safe-area-inset-top))] sm:pb-28 sm:pt-[calc(9rem+env(safe-area-inset-top))] lg:pb-36 lg:pt-[calc(13rem+env(safe-area-inset-top))]">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 lg:pt-6 xl:col-span-7">
            <div
              role="img"
              aria-label="A real quote is based on your route, vehicle, and current market."
              className="w-full max-w-[20rem]"
            >
              <div
                aria-hidden="true"
                className="grid h-11 grid-cols-[auto_0.75rem_minmax(3rem,1fr)_auto] grid-rows-3 items-center font-mono text-[10px] uppercase leading-none tracking-[0.18em] sm:text-[11px]"
              >
                <span className="col-start-1 row-start-1 text-white/55">
                  Route
                </span>
                <span className="col-start-1 row-start-2 text-white/55">
                  Vehicle
                </span>
                <span className="col-start-1 row-start-3 text-white/55">
                  Market
                </span>

                <div className="relative col-start-3 row-span-3 row-start-1 h-11 min-w-0">
                  <svg
                    viewBox="0 0 100 44"
                    preserveAspectRatio="none"
                    focusable="false"
                    className="h-full w-full text-white/20"
                  >
                    <path
                      d="M0 7 L100 22 M0 22 H100 M0 37 L100 22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-orange" />
                </div>

                <span className="col-start-4 row-span-3 row-start-1 pl-3 text-white/85">
                  Real quote
                </span>
              </div>
            </div>

            <h1
              aria-label="The Sharpest Way to Ship Your Car"
              className="mt-5 font-display text-[2.25rem] font-semibold leading-[0.96] tracking-[-0.035em] [text-wrap:balance] sm:text-6xl lg:text-7xl"
            >
              The{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, #F2A516 0%, #EA6A11 22%, #C97432 46%, #8A95A8 72%, #C5CCD6 100%)',
                }}
              >
                Sharpest
              </span>{' '}
              Way
              <br className="hidden sm:inline" /> to Ship Your Car
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
              Sharp on every detail.
            </p>

            <a
              href="#how-it-works"
              className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-white/70 underline-offset-4 transition-colors duration-200 ease-out-quart hover:text-white hover:underline"
            >
              See how it works
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="lg:col-span-5 xl:col-span-5">
            <MiniQuoteForm />
            <div className="mt-6">
              <ShipmentCascade />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
