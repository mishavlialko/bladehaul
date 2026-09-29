'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Field, inputClass } from '@/components/sections/QuoteField';
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

  const [zipCache, setZipCache] = useState<
    Record<string, string | 'not-found'>
  >({});
  // ZIPs already sent to the API. Lives in a ref so cache writes don't
  // re-trigger the effect (the old version listed zipCache in the deps
  // array and re-ran on every resolution).
  const requestedZips = useRef(new Set<string>());

  useEffect(() => {
    for (const zip of [pickupZip, deliveryZip]) {
      if (!/^\d{5}$/.test(zip)) continue;
      if (requestedZips.current.has(zip)) continue;
      requestedZips.current.add(zip);
      fetchCity(zip).then((label) => {
        setZipCache((prev) => ({ ...prev, [zip]: label ?? 'not-found' }));
      });
    }
  }, [pickupZip, deliveryZip]);

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
            aria-describedby={
              errors.pickupZip ? `${pickupId}-message` : undefined
            }
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
            aria-describedby={
              errors.deliveryZip ? `${deliveryId}-message` : undefined
            }
            {...register('deliveryZip', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              },
            })}
            className={inputClass(!!errors.deliveryZip)}
          />
        </Field>
      </div>

      <fieldset
        aria-describedby={
          errors.trailerType
            ? `${trailerOpenId}-error`
            : `${trailerOpenId}-helper`
        }
      >
        <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint">
          Trailer type
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-line-soft p-1 ring-1 ring-line">
          {TRAILER_TYPES.map((value) => {
            const id = value === 'open' ? trailerOpenId : trailerEnclosedId;
            const label = value === 'open' ? 'Open' : 'Enclosed';
            return (
              <label
                key={value}
                htmlFor={id}
                className="group flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium text-text-dim transition-colors duration-200 ease-out-quart hover:text-text has-[:checked]:bg-white has-[:checked]:text-text has-[:checked]:shadow-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange has-[:checked]:ring-1 has-[:checked]:ring-text/5"
              >
                <input
                  id={id}
                  type="radio"
                  value={value}
                  className="peer sr-only"
                  {...register('trailerType')}
                />
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-orange opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
        <p
          id={`${trailerOpenId}-helper`}
          className="mt-2 text-sm text-text-faint"
        >
          Open is standard and runs lower. Enclosed protects against weather and
          road debris.
        </p>
        {errors.trailerType && (
          <p
            id={`${trailerOpenId}-error`}
            role="alert"
            className="mt-2 text-sm font-medium text-orange-dark"
          >
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

type ZipReadoutProps = { lookup: ZipLookup };

function ZipReadout({ lookup }: ZipReadoutProps) {
  if (lookup.status === 'idle') return null;
  if (lookup.status === 'loading') {
    return (
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-text-faint"
      >
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-text-faint motion-reduce:animate-none" />
        Looking up city…
      </p>
    );
  }
  if (lookup.status === 'ok') {
    return (
      <p role="status" className="text-sm font-medium text-text-dim">
        {lookup.label}
      </p>
    );
  }
  return (
    <p role="status" className="text-sm text-orange-dark">
      City lookup is unavailable. Double-check the ZIP before continuing.
    </p>
  );
}
