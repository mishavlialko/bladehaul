'use client';

import Link from 'next/link';
import { useId, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Field, inputClass } from '@/components/sections/QuoteField';
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
        helper="Add this for a same-day call and text update. Without it, the quote comes by email only."
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
              placeholder="+1 (555) 123-4567"
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

