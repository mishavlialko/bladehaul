import Container from '@/components/shared/Container';

const chips = [
  'Daily updates — even on quiet days',
  'Price changes confirmed in writing',
  'Same dispatcher from quote to delivery',
  'No deposit until carrier confirmed',
];

export default function TrustStrip() {
  return (
    <section
      aria-label="What you can count on"
      className="border-y border-white/10 bg-dark text-white/75"
    >
      <Container className="py-5 sm:py-6">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
          {chips.map((chip) => (
            <li
              key={chip}
              className="flex items-center gap-2 text-xs font-medium sm:text-sm"
            >
              <span
                aria-hidden="true"
                className="inline-block h-1 w-1 shrink-0 rounded-full bg-orange"
              />
              {chip}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
