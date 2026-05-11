'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import {
  Controller,
  useForm,
  useWatch,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import Container from '@/components/shared/Container';
import { cn } from '@/lib/cn';
import { formatUSPhone } from '@/lib/phone';
import { quoteSchema, type QuoteInput } from '@/lib/validation';

const CURRENT_YEAR = new Date().getFullYear();
const OLDEST_YEAR = 1990;

type ZipLookup = { status: 'idle' | 'loading' | 'ok' | 'bad'; label?: string };

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

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

export default function QuoteForm() {
  const years = useMemo(
    () =>
      Array.from(
        { length: CURRENT_YEAR + 1 - OLDEST_YEAR + 1 },
        (_, i) => CURRENT_YEAR + 1 - i,
      ),
    [],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setFocus,
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: 'onBlur',
    defaultValues: {
      pickupZip: '',
      deliveryZip: '',
      year: '',
      readyDate: todayPlus(3),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  const [zipCache, setZipCache] = useState<
    Record<string, string | 'not-found'>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const pickupId = useId();
  const deliveryId = useId();
  const yearId = useId();
  const dateId = useId();
  const firstId = useId();
  const lastId = useId();
  const emailId = useId();
  const phoneId = useId();

  const pickupZip = useWatch({ control, name: 'pickupZip' });
  const deliveryZip = useWatch({ control, name: 'deliveryZip' });

  // Pre-populate from MiniQuoteForm via sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('bladehaul:mini-quote');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.fromZip) setValue('pickupZip', data.fromZip);
      if (data.toZip) setValue('deliveryZip', data.toZip);
      if (data.year) setValue('year', data.year);
    } catch {
      // ignore
    }
  }, [setValue]);

  // ZIP lookups: cache-keyed by ZIP. We only setState inside async callback,
  // never synchronously inside the effect body (lint rule + perf).
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

  const pickupLookup: ZipLookup = lookupStatus(pickupZip, zipCache);
  const deliveryLookup: ZipLookup = lookupStatus(deliveryZip, zipCache);

  const onSubmit = async (values: QuoteInput) => {
    setSubmitError(null);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(
          body?.error ?? 'Something went wrong. Please try again.',
        );
        return;
      }
      setSubmitted(true);
      try {
        sessionStorage.removeItem('bladehaul:mini-quote');
      } catch {
        // ignore
      }
    } catch {
      setSubmitError(
        'We could not reach the server. Check your connection and try again.',
      );
    }
  };

  const onInvalid = () => {
    const firstError = Object.keys(errors)[0] as keyof QuoteInput | undefined;
    if (firstError) setFocus(firstError);
  };

  return (
    <section
      id="quote"
      className="scroll-mt-20 bg-line-soft text-text sm:scroll-mt-24"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Get a real quote
            </h2>
            <p className="mt-5 text-lg text-text-dim">It takes one minute.</p>
          </div>

          {submitted ? (
            <SuccessState />
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              noValidate
              aria-label="Quote request"
              className="mt-12 rounded-2xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(11,13,17,0.15)] ring-1 ring-line sm:p-10 lg:mt-16"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field
                  id={pickupId}
                  label="Pickup ZIP"
                  helper="City will auto-fill"
                  error={errors.pickupZip?.message}
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
                  <ZipReadout lookup={pickupLookup} />
                </Field>

                <Field
                  id={deliveryId}
                  label="Delivery ZIP"
                  helper="City will auto-fill"
                  error={errors.deliveryZip?.message}
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
                  <ZipReadout lookup={deliveryLookup} />
                </Field>
              </div>

              <div className="mt-6">
                <Field
                  id={yearId}
                  label="Vehicle year"
                  helper="1990 to current year"
                  error={errors.year?.message}
                >
                  <select
                    id={yearId}
                    aria-invalid={!!errors.year}
                    {...register('year')}
                    className={cn(inputClass(!!errors.year), 'pr-10')}
                  >
                    <option value="" disabled>
                      Select a year
                    </option>
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <RadioGroup
                label="Vehicle condition"
                helper="Select runs or doesn't run"
                error={errors.condition?.message}
                register={register('condition')}
                options={[
                  { value: 'runs', label: 'Runs' },
                  { value: 'inop', label: 'Doesn’t run' },
                ]}
              />

              <RadioGroup
                label="Trailer type"
                helper="Open is standard for most cars"
                error={errors.trailer?.message}
                register={register('trailer')}
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'enclosed', label: 'Enclosed' },
                ]}
              />

              <div className="mt-6">
                <Field
                  id={dateId}
                  label="Ready date"
                  helper="We usually pick up 3 to 7 days from today"
                  error={errors.readyDate?.message}
                >
                  <input
                    id={dateId}
                    type="date"
                    min={todayPlus(0)}
                    aria-invalid={!!errors.readyDate}
                    {...register('readyDate')}
                    className={inputClass(!!errors.readyDate)}
                  />
                </Field>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field
                  id={firstId}
                  label="First name"
                  helper="Real name for your dispatcher"
                  error={errors.firstName?.message}
                >
                  <input
                    id={firstId}
                    type="text"
                    autoComplete="given-name"
                    placeholder="First"
                    aria-invalid={!!errors.firstName}
                    {...register('firstName')}
                    className={inputClass(!!errors.firstName)}
                  />
                </Field>

                <Field
                  id={lastId}
                  label="Last name"
                  error={errors.lastName?.message}
                >
                  <input
                    id={lastId}
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last"
                    aria-invalid={!!errors.lastName}
                    {...register('lastName')}
                    className={inputClass(!!errors.lastName)}
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Field
                  id={emailId}
                  label="Email"
                  helper="Where your quote arrives"
                  error={errors.email?.message}
                >
                  <input
                    id={emailId}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                    className={inputClass(!!errors.email)}
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Field
                  id={phoneId}
                  label="Phone"
                  helper="We only call to confirm pickup. No robocalls, ever."
                  error={errors.phone?.message}
                >
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <input
                        id={phoneId}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+1 (___) ___-____"
                        aria-invalid={!!errors.phone}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(formatUSPhone(e.target.value))
                        }
                        onBlur={field.onBlur}
                        className={inputClass(!!errors.phone)}
                      />
                    )}
                  />
                </Field>
              </div>

              {submitError && (
                <p
                  role="alert"
                  className="mt-6 rounded-lg bg-orange-bg px-4 py-3 text-sm font-medium text-orange-dark"
                >
                  {submitError}
                </p>
              )}

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-orange pl-7 pr-3 text-base font-medium tracking-tight text-white transition duration-200 ease-out-quart hover:bg-orange-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 sm:w-auto sm:pl-8"
                >
                  <span>{isSubmitting ? 'Sending…' : 'Get a Real Quote'}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 ease-out-quart group-hover:translate-x-1 group-hover:scale-[1.06]"
                  >
                    <ArrowRight strokeWidth={1.75} className="h-4 w-4" />
                  </span>
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-text-faint sm:text-left">
                No spam. No robocalls. A real person follows up.
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
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
  helper?: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, helper, error, children }: FieldProps) {
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint"
      >
        {label}
      </label>
      <div aria-describedby={error ? errorId : helper ? helperId : undefined}>
        {children}
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-orange-dark"
        >
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-xs text-text-faint">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

type RadioGroupProps = {
  label: string;
  helper?: string;
  error?: string;
  register: UseFormRegisterReturn;
  options: { value: string; label: string }[];
};

function RadioGroup({
  label,
  helper,
  error,
  register,
  options,
}: RadioGroupProps) {
  return (
    <fieldset className="mt-6">
      <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint">
        {label}
      </legend>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="group relative flex cursor-pointer items-center justify-center rounded-xl bg-line-soft/60 px-4 py-3.5 text-base font-medium text-text ring-1 ring-line transition duration-200 ease-out-quart hover:bg-white has-[:checked]:bg-white has-[:checked]:ring-2 has-[:checked]:ring-orange"
          >
            <input
              type="radio"
              value={opt.value}
              className="sr-only"
              {...register}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-orange-dark">
          {error}
        </p>
      ) : helper ? (
        <p className="mt-2 text-xs text-text-faint">{helper}</p>
      ) : null}
    </fieldset>
  );
}

type ZipReadoutProps = { lookup: ZipLookup };

function ZipReadout({ lookup }: ZipReadoutProps) {
  if (lookup.status === 'idle') return null;
  if (lookup.status === 'loading') {
    return (
      <p className="mt-1.5 flex items-center gap-2 text-xs text-text-faint">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-text-faint" />
        Looking up city…
      </p>
    );
  }
  if (lookup.status === 'ok') {
    return (
      <p className="mt-1.5 flex items-center gap-2 text-xs font-medium text-text-dim">
        <Check
          strokeWidth={2.25}
          className="h-3.5 w-3.5 shrink-0 text-orange"
          aria-hidden="true"
        />
        {lookup.label}
      </p>
    );
  }
  return (
    <p className="mt-1.5 text-xs text-orange-dark">
      We couldn’t find that ZIP. Double-check the digits.
    </p>
  );
}

function SuccessState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-12 rounded-2xl bg-white p-8 text-center shadow-[0_30px_60px_-30px_rgba(11,13,17,0.15)] ring-1 ring-line sm:p-12 lg:mt-16"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange/15 ring-1 ring-orange/30">
        <Check
          strokeWidth={2.25}
          className="h-6 w-6 text-orange"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        Thank you.
      </h3>
      <p className="mt-4 text-base text-text-dim sm:text-lg">
        Your quote request is received.
      </p>
      <p className="mt-2 text-base text-text-dim sm:text-lg">
        Misha, your dispatcher, will email and text you within 2 hours with your
        real price.
      </p>
    </div>
  );
}
