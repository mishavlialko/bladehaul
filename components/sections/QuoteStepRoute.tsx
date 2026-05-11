'use client';

import { useEffect, useId, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { cn } from '@/lib/cn';
import { TRAILER_TYPES, type QuoteInput } from '@/lib/validation';

type ZipLookup = { status: 'idle' | 'loading' | 'ok' | 'bad'; label?: string };

async function fetchCity(zip: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data?.places?.[0];
    if (!place) return null;
    return `${place['place name']}, ${place['state abbreviation']}`;
  } catch {
    return null;
  }
}

export default function QuoteStepRoute() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<QuoteInput>();

  const pickupId = useId();
  const deliveryId = useId();
  const trailerOpenId = useId();
  const trailerEnclosedId = useId();

  const pickupZip = useWatch({ control, name: 'pickupZip' }) ?? '';
  const deliveryZip = useWatch({ control, name: 'deliveryZip' }) ?? '';

  const [zipCache, setZipCache] = useState<Record<string, string | 'not-found'>>(
    {},
  );

  useEffect(() => {
    if (!/^\d{5}$/.test(pickupZip)) return;
    if (zipCache[pickupZip] !== undefined) return;
    let cancelled = false;
    fetchCity(pickupZip).then((label) => {
      if (cancelled) return;
      setZipCache((prev) => ({
        ...prev,
        [pickupZip]: label ?? 'not-found',
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [pickupZip, zipCache]);

  useEffect(() => {
    if (!/^\d{5}$/.test(deliveryZip)) return;
    if (zipCache[deliveryZip] !== undefined) return;
    let cancelled = false;
    fetchCity(deliveryZip).then((label) => {
      if (cancelled) return;
      setZipCache((prev) => ({
        ...prev,
        [deliveryZip]: label ?? 'not-found',
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [deliveryZip, zipCache]);

  const pickupLookup = lookupStatus(pickupZip, zipCache);
  const deliveryLookup = lookupStatus(deliveryZip, zipCache);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id={pickupId}
          label="Pickup ZIP"
          error={errors.pickupZip?.message}
          readout={<ZipReadout lookup={pickupLookup} />}
        >
          <input
            id={pickupId}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="90210"
            maxLength={5}
            aria-invalid={!!errors.pickupZip}
            {...register('pickupZip', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              },
            })}
            className={inputClass(!!errors.pickupZip)}
          />
        </Field>

        <Field
          id={deliveryId}
          label="Delivery ZIP"
          error={errors.deliveryZip?.message}
          readout={<ZipReadout lookup={deliveryLookup} />}
        >
          <input
            id={deliveryId}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="33101"
            maxLength={5}
            aria-invalid={!!errors.deliveryZip}
            {...register('deliveryZip', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              },
            })}
            className={inputClass(!!errors.deliveryZip)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint">
          Trailer type
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {TRAILER_TYPES.map((value) => {
            const id = value === 'open' ? trailerOpenId : trailerEnclosedId;
            const label = value === 'open' ? 'Open' : 'Enclosed';
            return (
              <label
                key={value}
                htmlFor={id}
                className="group relative flex cursor-pointer items-center justify-center rounded-xl bg-line-soft/60 px-4 py-3.5 text-base font-medium text-text ring-1 ring-line transition duration-200 ease-out-quart hover:bg-white has-[:checked]:bg-white has-[:checked]:ring-2 has-[:checked]:ring-orange"
              >
                <input
                  id={id}
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register('trailerType')}
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-text-faint">
          Open is standard and runs lower. Enclosed protects against weather
          and road debris.
        </p>
        {errors.trailerType && (
          <p role="alert" className="mt-2 text-xs font-medium text-orange-dark">
            {errors.trailerType.message}
          </p>
        )}
      </fieldset>
    </div>
  );
}

function lookupStatus(
  zip: string,
  cache: Record<string, string | 'not-found'>,
): ZipLookup {
  if (!/^\d{5}$/.test(zip)) return { status: 'idle' };
  const cached = cache[zip];
  if (cached === undefined) return { status: 'loading' };
  if (cached === 'not-found') return { status: 'bad' };
  return { status: 'ok', label: cached };
}

function inputClass(hasError: boolean) {
  return cn(
    'block h-12 w-full rounded-xl bg-line-soft/60 px-4 text-base text-text ring-1 ring-line transition duration-200 ease-out-quart placeholder:text-text-faint/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/40',
    hasError && 'ring-orange/60 focus:ring-orange',
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  readout?: React.ReactNode;
  children: React.ReactNode;
};

function Field({ id, label, error, readout, children }: FieldProps) {
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
      {error && (
        <p role="alert" className="text-xs font-medium text-orange-dark">
          {error}
        </p>
      )}
    </div>
  );
}

type ZipReadoutProps = { lookup: ZipLookup };

function ZipReadout({ lookup }: ZipReadoutProps) {
  if (lookup.status === 'idle') return null;
  if (lookup.status === 'loading') {
    return (
      <p className="flex items-center gap-2 text-xs text-text-faint">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-text-faint" />
        Looking up city…
      </p>
    );
  }
  if (lookup.status === 'ok') {
    return (
      <p className="text-xs font-medium text-text-dim">{lookup.label}</p>
    );
  }
  return (
    <p className="text-xs text-orange-dark">
      We couldn&apos;t find that ZIP. Double-check the digits.
    </p>
  );
}
