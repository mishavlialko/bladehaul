import { cn } from '@/lib/cn';

// Shared field shell + input styling for the QuoteForm steps. The three
// step files previously carried three identical private copies of both.

export function inputClass(hasError: boolean): string {
  return cn(
    'block h-12 w-full rounded-xl bg-line-soft/60 px-4 text-base text-text ring-1 ring-line transition duration-200 ease-out-quart placeholder:text-text-faint/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/40',
    hasError && 'ring-orange/60 focus:ring-orange',
  );
}

type FieldProps = {
  id: string;
  label: string;
  /** Validation error. Replaces the helper line while present. */
  error?: string;
  /** Muted helper line under the input. */
  helper?: string;
  /** Arbitrary node between input and error/helper (e.g. ZIP city readout). */
  readout?: React.ReactNode;
  children: React.ReactNode;
};

export function Field({
  id,
  label,
  error,
  helper,
  readout,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint"
      >
        {label}
      </label>
      {children}
      {readout}
      {error ? (
        <p
          id={`${id}-message`}
          role="alert"
          className="text-sm font-medium text-orange-dark"
        >
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-message`} className="text-sm text-text-faint">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
