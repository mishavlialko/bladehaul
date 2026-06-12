import Image from 'next/image';
import Container from '@/components/shared/Container';
import MiniQuoteForm from '@/components/sections/MiniQuoteForm';
import ShipmentCascade from '@/components/sections/ShipmentCascade';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      {/* Background photo layer — swap /public/hero-bg.jpg for the final asset.
          next/image with priority marks this as the LCP element and serves
          resized AVIF/WebP instead of the raw 469 KB JPEG. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-navy"
      >
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
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
      {/* Bottom fade into the dark section below + hides Banana watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-b from-transparent to-navy"
      />

      <Container className="relative z-0 pt-[calc(8rem+env(safe-area-inset-top))] pb-20 sm:pt-[calc(12rem+env(safe-area-inset-top))] sm:pb-28 md:pt-[calc(15rem+env(safe-area-inset-top))] lg:pb-36">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 xl:col-span-7 lg:pt-6">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-white/55 sm:text-[11px]">
              <span className="text-white/35">STATUS:</span>{' '}
              <span className="text-white/75">ACTIVE</span>
              <span aria-hidden="true" className="px-2 text-white/25">
                {'//'}
              </span>
              <span className="text-white/35">DISPATCH:</span>{' '}
              <span className="text-white/75">ONLINE</span>
              <span aria-hidden="true" className="px-2 text-white/25">
                {'//'}
              </span>
              <span className="text-white/75">50 STATES</span>
            </p>

            <h1 className="mt-7 font-display text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
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
              <ShipmentCascade />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
