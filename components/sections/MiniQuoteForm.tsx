'use client';

import { useId, useMemo, useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';

const CURRENT_YEAR = new Date().getFullYear();
const OLDEST_YEAR = 1990;

export default function MiniQuoteForm() {
  const fromId = useId();
  const toId = useId();
  const yearId = useId();

  const [fromZip, setFromZip] = useState('');
  const [toZip, setToZip] = useState('');
  const [year, setYear] = useState('');

  const years = useMemo(
    () =>
      Array.from(
        { length: CURRENT_YEAR + 1 - OLDEST_YEAR + 1 },
        (_, i) => CURRENT_YEAR + 1 - i,
      ),
    [],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      sessionStorage.setItem(
        'bladehaul:mini-quote',
        JSON.stringify({ fromZip, toZip, year }),
      );
    } catch {
      // sessionStorage may be unavailable (private mode); proceed without it
    }

    const target = document.getElementById('quote');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.hash = '#quote';
    }
  };

  return (
    <div className="relative rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-orange/40 to-transparent" />
      <form
        onSubmit={handleSubmit}
        className="relative rounded-[calc(2rem-0.375rem)] bg-white p-6 text-text shadow-[0_30px_60px_-30px_rgba(11,13,17,0.6)] sm:p-7"
        aria-label="Get a quick auto transport quote"
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange">
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

          <FieldShell label="Vehicle year" htmlFor={yearId}>
            <select
              id={yearId}
              name="vehicle-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2020%2020%22%20fill=%22%238A95A8%22><path%20fill-rule=%22evenodd%22%20d=%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.06l3.71-3.83a.75.75%200%20011.08%201.04l-4.25%204.39a.75.75%200%2001-1.08%200L5.21%208.27a.75.75%200%2001.02-1.06z%22%20clip-rule=%22evenodd%22/></svg>')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat pr-9"
            >
              <option value="" disabled>
                Select a year
              </option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </FieldShell>
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
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-text-faint">
        {label}
      </span>
      <div
        className={cn(
          'mt-1.5 rounded-xl bg-line-soft/60 ring-1 ring-line transition duration-200 ease-out-quart',
          'focus-within:bg-white focus-within:ring-2 focus-within:ring-orange/30',
          '[&_input]:h-12 [&_input]:w-full [&_input]:rounded-xl [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-base [&_input]:text-text [&_input]:outline-none [&_input]:placeholder:text-text-faint/70',
          '[&_select]:h-12 [&_select]:w-full [&_select]:rounded-xl [&_select]:bg-transparent [&_select]:px-4 [&_select]:text-base [&_select]:text-text [&_select]:outline-none',
        )}
      >
        {children}
      </div>
    </label>
  );
}
