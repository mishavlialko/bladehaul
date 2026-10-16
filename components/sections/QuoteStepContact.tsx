'use client';

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
        helper="Add your number if you would like a call or text about this request."
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

      <p className="text-sm leading-relaxed text-text-faint">
        We use your details to answer this request. This free quote request does
        not book a shipment or authorize a payment.
      </p>
    </div>
  );
}
