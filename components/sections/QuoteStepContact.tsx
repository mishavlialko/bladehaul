'use client';

import Link from 'next/link';
import { useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Field, inputClass } from '@/components/sections/QuoteField';
import { formatUSPhone } from '@/lib/phone';
import { getQuoteDateBounds, type QuoteInput } from '@/lib/validation';

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
  const consentId = useId();

  const dateBounds = getQuoteDateBounds();

  return (
    <div className="space-y-6">
      <Field
        id={dateId}
        label="Preferred pickup date"
        helper="Choose your preferred date. We will confirm availability with you."
        error={errors.readyDate?.message}
      >
        <input
          id={dateId}
          type="date"
          min={dateBounds.min}
          max={dateBounds.max}
          aria-invalid={!!errors.readyDate}
          aria-describedby={`${dateId}-message`}
          {...register('readyDate')}
          className={inputClass(!!errors.readyDate)}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id={firstId}
          label="First name"
          error={errors.firstName?.message}
        >
          <input
            id={firstId}
            type="text"
            autoComplete="given-name"
            placeholder="First"
            aria-invalid={!!errors.firstName}
            aria-describedby={
              errors.firstName ? `${firstId}-message` : undefined
            }
            maxLength={40}
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
            aria-describedby={errors.lastName ? `${lastId}-message` : undefined}
            maxLength={40}
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
          aria-describedby={`${emailId}-message`}
          maxLength={254}
          {...register('email')}
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field
        id={phoneId}
        label="Phone (optional)"
        helper="For optional text messages, add your number and select the SMS consent box below."
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
              aria-describedby={`${phoneId}-message`}
              name={field.name}
              ref={field.ref}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(formatUSPhone(e.target.value))}
              onBlur={field.onBlur}
              className={inputClass(!!errors.phone)}
            />
          )}
        />
      </Field>

      <div>
        <label
          htmlFor={consentId}
          className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm leading-relaxed text-text-dim"
        >
          <input
            id={consentId}
            type="checkbox"
            {...register('consentTcpa')}
            aria-describedby={`${consentId}-helper`}
            className="mt-1 h-5 w-5 shrink-0 accent-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          />
          <span>
            I agree to receive automated and personalized text messages from
            BladeHaul Auto Transport LLC about my quote request, including
            marketing follow-ups. Message frequency varies. Message and data
            rates may apply. Reply STOP to opt out or HELP for assistance.
            Consent is not required to request a quote or purchase services. See
            our{' '}
            <Link
              href="/terms#sms-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              SMS Terms<span className="sr-only"> (opens in a new tab)</span>
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              Privacy Policy
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
            .
          </span>
        </label>
        <p
          id={`${consentId}-helper`}
          className="mt-1 text-sm leading-relaxed text-text-faint"
        >
          You can get your quote by email without selecting this optional SMS
          consent box.
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-faint">
        We use your details to answer this request. This free quote request does
        not book a shipment or authorize a payment. See our{' '}
        <Link
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-text-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          Privacy Policy
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>{' '}
        and{' '}
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-text-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          Terms
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
        .
      </p>
    </div>
  );
}
