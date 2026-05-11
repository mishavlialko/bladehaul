'use client';

import Link from 'next/link';
import { useId, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { cn } from '@/lib/cn';
import { formatUSPhone } from '@/lib/phone';
import { type QuoteInput } from '@/lib/validation';

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function QuoteStepContact() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<QuoteInput>();

  const dateId = useId();
  const firstId = useId();
  const lastId = useId();
  const emailId = useId();
  const phoneId = useId();

  const dateBounds = useMemo(
    () => ({ min: todayPlus(0), max: todayPlus(180) }),
    [],
  );

  return (
    <div className="space-y-6">
      <Field
        id={dateId}
        label="First available pickup"
        helper="Most cars get picked up within 3 to 7 days of this date."
        error={errors.readyDate?.message}
      >
        <input
          id={dateId}
          type="date"
          min={dateBounds.min}
          max={dateBounds.max}
          aria-invalid={!!errors.readyDate}
          {...register('readyDate')}
          className={inputClass(!!errors.readyDate)}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={firstId} label="First name" error={errors.firstName?.message}>
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
        <Field id={lastId} label="Last name" error={errors.lastName?.message}>
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

      <Field
        id={emailId}
        label="Email"
        helper="We send the quote here."
        error={errors.email?.message}
      >
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={!!errors.email}
          {...register('email')}
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field
        id={phoneId}
        label="Phone (optional)"
        helper="Add this if you want a same-day call. We text the quote either way."
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
              placeholder="(555) 123-4567"
              aria-invalid={!!errors.phone}
              value={field.value ?? ''}
              onChange={(e) =>
                field.onChange(formatUSPhone(e.target.value))
              }
              onBlur={field.onBlur}
              className={inputClass(!!errors.phone)}
            />
          )}
        />
      </Field>

      <p className="text-xs leading-relaxed text-text-faint">
        By submitting this form, you agree we may contact you by email and,
        if you provided a phone number, by text and call about your quote,
        including from an automatic dialing system. Standard message and
        data rates apply. Consent is not required to get a quote. Reply
        STOP to texts to opt out. See our{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-text-dim">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/terms" className="underline underline-offset-2 hover:text-text-dim">
          Terms
        </Link>
        .
      </p>
    </div>
  );
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
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-orange-dark">
          {error}
        </p>
      ) : helper ? (
        <p className="text-xs text-text-faint">{helper}</p>
      ) : null}
    </div>
  );
}
