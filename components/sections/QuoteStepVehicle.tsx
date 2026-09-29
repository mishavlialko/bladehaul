'use client';

import { useId, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Field, inputClass } from '@/components/sections/QuoteField';
import VehicleMakeCombobox from '@/components/sections/VehicleMakeCombobox';
import { cn } from '@/lib/cn';
import {
  OLDEST_YEAR,
  BODY_TYPES,
  BODY_TYPE_LABELS,
  VEHICLE_CONDITIONS,
  type QuoteInput,
} from '@/lib/validation';

export default function QuoteStepVehicle() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<QuoteInput>();

  const yearId = useId();
  const makeId = useId();
  const modelId = useId();
  const vinId = useId();
  const bodyId = useId();
  const detailsId = useId();
  const condRunsId = useId();
  const condInopId = useId();
  const vehicleYear = useWatch({ control, name: 'vehicleYear' });
  const isClassic =
    Number(vehicleYear) >= OLDEST_YEAR && Number(vehicleYear) < 1981;

  const years = useMemo(() => {
    const newest = new Date().getFullYear() + 1;
    return Array.from(
      { length: newest - OLDEST_YEAR + 1 },
      (_, i) => newest - i,
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-3">
        <Field id={yearId} label="Year" error={errors.vehicleYear?.message}>
          <select
            id={yearId}
            aria-invalid={!!errors.vehicleYear}
            aria-describedby={
              errors.vehicleYear ? `${yearId}-message` : undefined
            }
            {...register('vehicleYear')}
            className={cn(inputClass(!!errors.vehicleYear), 'pr-10')}
          >
            <option value="" disabled>
              Year
            </option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id={makeId}
          label="Make"
          helper="Can't find it? Type any make."
          error={errors.vehicleMake?.message}
        >
          <VehicleMakeCombobox id={makeId} hasError={!!errors.vehicleMake} />
        </Field>

        <Field id={modelId} label="Model" error={errors.vehicleModel?.message}>
          <input
            id={modelId}
            type="text"
            autoComplete="off"
            placeholder="Camry"
            aria-invalid={!!errors.vehicleModel}
            aria-describedby={
              errors.vehicleModel ? `${modelId}-message` : undefined
            }
            maxLength={60}
            {...register('vehicleModel')}
            className={inputClass(!!errors.vehicleModel)}
          />
        </Field>
      </div>

      <Field id={bodyId} label="Body type" error={errors.bodyType?.message}>
        <select
          id={bodyId}
          aria-invalid={!!errors.bodyType}
          aria-describedby={errors.bodyType ? `${bodyId}-message` : undefined}
          {...register('bodyType')}
          className={cn(inputClass(!!errors.bodyType), 'pr-10')}
        >
          <option value="" disabled>
            Select body type
          </option>
          {BODY_TYPES.map((value) => (
            <option key={value} value={value}>
              {BODY_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id={vinId}
        label={isClassic ? 'Vehicle ID / VIN (optional)' : 'VIN (optional)'}
        helper={
          isClassic
            ? 'Earlier vehicles may have a shorter ID. Skip if you do not have it handy.'
            : 'Helps identify your vehicle. Skip if you do not have it handy.'
        }
        error={errors.vin?.message}
      >
        <input
          id={vinId}
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder={
            isClassic
              ? 'Vehicle identification number'
              : '17-character vehicle ID'
          }
          maxLength={isClassic ? 30 : 17}
          aria-invalid={!!errors.vin}
          aria-describedby={`${vinId}-message`}
          {...register('vin', {
            setValueAs: (value: string) => value.trim().toUpperCase(),
          })}
          className={inputClass(!!errors.vin)}
        />
      </Field>

      <fieldset
        aria-describedby={
          errors.vehicleCondition
            ? `${condRunsId}-error`
            : `${condRunsId}-helper`
        }
      >
        <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint">
          Does it run?
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-line-soft p-1 ring-1 ring-line">
          {VEHICLE_CONDITIONS.map((value) => {
            const id = value === 'runs' ? condRunsId : condInopId;
            const label = value === 'runs' ? 'Runs' : "Doesn't run";
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
                  {...register('vehicleCondition')}
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
        <p id={`${condRunsId}-helper`} className="mt-2 text-sm text-text-faint">
          Inoperable cars need a winch. Pricing is different.
        </p>
        {errors.vehicleCondition && (
          <p
            id={`${condRunsId}-error`}
            role="alert"
            className="mt-2 text-sm font-medium text-orange-dark"
          >
            {errors.vehicleCondition.message}
          </p>
        )}
      </fieldset>

      <Field
        id={detailsId}
        label="Additional details (optional)"
        helper="Share modifications, access restrictions or other details that affect the shipment. Up to 2,000 characters."
        error={errors.additionalDetails?.message}
      >
        <textarea
          id={detailsId}
          rows={4}
          maxLength={2000}
          aria-invalid={!!errors.additionalDetails}
          aria-describedby={`${detailsId}-message`}
          {...register('additionalDetails')}
          className={cn(
            inputClass(!!errors.additionalDetails),
            'h-auto min-h-28 resize-y py-3',
          )}
        />
      </Field>
    </div>
  );
}
