import { cn } from '@/lib/cn';

export type StepIndex = 0 | 1 | 2;

const STEPS: readonly { label: string; aria: string }[] = [
  { label: 'Route', aria: 'Route' },
  { label: 'Vehicle', aria: 'Vehicle details' },
  { label: 'Contact', aria: 'Contact details' },
];

type Props = {
  current: StepIndex;
};

export default function QuoteProgress({ current }: Props) {
  return (
    <nav aria-label="Quote progress" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((step, idx) => {
          const isActive = idx === current;
          const isDone = idx < current;
          return (
            <li
              key={step.label}
              aria-current={isActive ? 'step' : undefined}
              className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
            >
              <span className="sr-only">
                Step {idx + 1}: {step.aria}
                {isActive ? ', current step' : isDone ? ', completed' : ''}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-tight transition-colors duration-200 ease-out-quart sm:h-8 sm:w-8',
                  isActive && 'bg-orange text-navy',
                  isDone && 'bg-text text-white',
                  !isActive && !isDone && 'bg-line text-text-faint',
                )}
              >
                {idx + 1}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'hidden text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ease-out-quart sm:inline',
                  isActive && 'text-text',
                  isDone && 'text-text-dim',
                  !isActive && !isDone && 'text-text-faint',
                )}
              >
                {step.label}
              </span>
              {idx < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px flex-1 transition-colors duration-200 ease-out-quart',
                    idx < current ? 'bg-text' : 'bg-line',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
