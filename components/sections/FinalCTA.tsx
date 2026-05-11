import Button from '@/components/shared/Button';
import Container from '@/components/shared/Container';

export default function FinalCTA() {
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
      <Container className="py-24 text-center sm:py-28 lg:py-32">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to get your real quote?
          </h2>
          <p className="mt-5 text-lg text-white/65">
            Takes one minute. No spam. No pressure.
          </p>
          <div className="mt-10 flex justify-center">
            <Button href="#quote" size="lg">
              Get a Real Quote
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
