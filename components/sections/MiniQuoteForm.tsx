'use client';

import { useId, useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';

type Trailer = 'open' | 'enclosed';

export const MINI_QUOTE_EVENT = 'bladehaul:hydrate-quote';

export type MiniQuotePayload = {
  pickupZip: string;
  deliveryZip: string;
  trailerType: Trailer;
};

export default function MiniQuoteForm() {
  const fromId = useId();
  const toId = useId();
  const trailerOpenId = useId();
  const trailerEnclosedId = useId();

  const [fromZip, setFromZip] = useState('');
  const [toZip, setToZip] = useState('');
  const [trailer, setTrailer] = useState<Trailer>('open');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: MiniQuotePayload = {
      pickupZip: fromZip,
      deliveryZip: toZip,
      trailerType: trailer,
    };

    try {
      sessionStorage.setItem('bladehaul:mini-quote', JSON.stringify(payload));
    } catch {
      // sessionStorage may be unavailable (private mode); proceed without it
    }

    // Notify QuoteForm (already mounted on the page) to hydrate + advance.
    window.dispatchEvent(
      new CustomEvent<MiniQuotePayload>(MINI_QUOTE_EVENT, { detail: payload }),
    );

    const target = document.getElementById('quote');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.hash = '#quote';
    }
  };

  return (
    <div className="relative rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <form
        onSubmit={handleSubmit}
        className="relative rounded-[calc(2rem-0.375rem)] bg-white p-6 text-text shadow-[0_30px_60px_-30px_rgba(11,13,17,0.6)] sm:p-7"
        aria-label="Start a quote"
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-faint">
            Start a quote
          </p>
          <p className="text-[11px] font-medium text-text-faint">
            Takes 60 seconds
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <FieldShell label="From" htmlFor={fromId}>
            <input
              id={fromId}
              name="from-zip"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              autoComplete="postal-code"
              placeholder="ZIP code"
              value={fromZip}
              onChange={(e) => setFromZip(e.target.value.replace(/\D/g, ''))}
              required
            />
          </FieldShell>

          <FieldShell label="To" htmlFor={toId}>
            <input
              id={toId}
              name="to-zip"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              autoComplete="postal-code"
              placeholder="ZIP code"
              value={toZip}
              onChange={(e) => setToZip(e.target.value.replace(/\D/g, ''))}
              required
            />
          </FieldShell>

          <fieldset>
            <legend className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-faint">
              Trailer
            </legend>
            <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl bg-line-soft p-1 ring-1 ring-line">
              <label
                htmlFor={trailerOpenId}
                className="group flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium text-text-dim transition-all duration-200 ease-out-quart hover:text-text has-[:checked]:bg-white has-[:checked]:text-text has-[:checked]:shadow-sm has-[:checked]:ring-1 has-[:checked]:ring-text/5"
              >
                <input
                  id={trailerOpenId}
                  type="radio"
                  value="open"
                  name="trailer"
                  checked={trailer === 'open'}
                  onChange={() => setTrailer('open')}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-orange opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                />
                <span>Open</span>
              </label>
              <label
                htmlFor={trailerEnclosedId}
                className="group flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium text-text-dim transition-all duration-200 ease-out-quart hover:text-text has-[:checked]:bg-white has-[:checked]:text-text has-[:checked]:shadow-sm has-[:checked]:ring-1 has-[:checked]:ring-text/5"
              >
                <input
                  id={trailerEnclosedId}
                  type="radio"
                  value="enclosed"
                  name="trailer"
                  checked={trailer === 'enclosed'}
                  onChange={() => setTrailer('enclosed')}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-orange opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                />
                <span>Enclosed</span>
              </label>
            </div>
          </fieldset>
        </div>

        <button
          type="submit"
          className="group relative mt-6 flex h-14 w-full items-center justify-center rounded-full bg-orange pl-7 pr-3 text-base font-medium tracking-tight text-white transition duration-300 ease-out-quart will-change-transform hover:bg-orange-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange active:scale-[0.985]"
        >
          <span className="absolute left-7">Get a Real Quote</span>
          <span
            aria-hidden="true"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-out-quart group-hover:translate-x-1 group-hover:scale-[1.06]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </button>

        <p className="mt-4 text-center text-[11px] text-text-faint">
          No spam. No robocalls. A real person follows up.
        </p>
      </form>
    </div>
  );
}

function FieldShell({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  // Label and input are siblings linked via htmlFor — nesting the input
  // inside the label AND pointing htmlFor at it confuses screen readers.
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium uppercase tracking-[0.18em] text-text-faint"
      >
        {label}
      </label>
      <div
        className={cn(
          'mt-1.5 rounded-xl bg-line-soft/60 ring-1 ring-line transition duration-200 ease-out-quart',
          'focus-within:bg-white focus-within:ring-2 focus-within:ring-orange/30',
          '[&_input]:h-12 [&_input]:w-full [&_input]:rounded-xl [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-base [&_input]:text-text [&_input]:outline-none [&_input]:placeholder:text-text-faint/70',
        )}
      >
        {children}
      </div>
    </div>
  );
}
