import Button from '@/components/shared/Button';
import Container from '@/components/shared/Container';

export default function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden border-y border-white/10 bg-navy text-white">
      <Container className="py-24 text-center sm:py-28 lg:py-32">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            Ready to get your real quote?
          </h2>
          <div className="mt-6 flex flex-col items-center gap-1 text-lg text-white/65">
            <p>Takes one minute.</p>
            <p>No spam.</p>
            <p>No pressure.</p>
          </div>
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
