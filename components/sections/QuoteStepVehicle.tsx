'use client';

import { useId, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Field, inputClass } from '@/components/sections/QuoteField';
import { cn } from '@/lib/cn';
import { VEHICLE_MAKES } from '@/lib/makes';
import {
  OLDEST_YEAR,
  VEHICLE_CONDITIONS,
  type QuoteInput,
} from '@/lib/validation';

export default function QuoteStepVehicle() {
  const {
    register,
    formState: { errors },
  } = useFormContext<QuoteInput>();

  const yearId = useId();
  const makeId = useId();
  const makesListId = useId();
  const modelId = useId();
  const vinId = useId();
  const condRunsId = useId();
  const condInopId = useId();

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

        <Field id={makeId} label="Make" error={errors.vehicleMake?.message}>
          <input
            id={makeId}
            type="text"
            autoComplete="off"
            list={makesListId}
            placeholder="Toyota"
            aria-invalid={!!errors.vehicleMake}
            {...register('vehicleMake')}
            className={inputClass(!!errors.vehicleMake)}
          />
          <datalist id={makesListId}>
            {VEHICLE_MAKES.map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
        </Field>

        <Field id={modelId} label="Model" error={errors.vehicleModel?.message}>
          <input
            id={modelId}
            type="text"
            autoComplete="off"
            placeholder="Camry"
            aria-invalid={!!errors.vehicleModel}
            {...register('vehicleModel')}
            className={inputClass(!!errors.vehicleModel)}
          />
        </Field>
      </div>

      <Field
        id={vinId}
        label="VIN (optional)"
        helper="Speeds up carrier matching. Skip if you do not have it handy."
        error={errors.vin?.message}
      >
        <input
          id={vinId}
          type="text"
          autoComplete="off"
          placeholder="17-character vehicle ID"
          maxLength={17}
          aria-invalid={!!errors.vin}
          {...register('vin', {
            onChange: (e) => {
              e.target.value = e.target.value
                .toUpperCase()
                .replace(/[^A-HJ-NPR-Z0-9]/g, '')
                .slice(0, 17);
            },
          })}
          className={inputClass(!!errors.vin)}
        />
      </Field>

      <fieldset>
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
                className="group flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium text-text-dim transition-all duration-200 ease-out-quart hover:text-text has-[:checked]:bg-white has-[:checked]:text-text has-[:checked]:shadow-sm has-[:checked]:ring-1 has-[:checked]:ring-text/5"
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
        <p className="mt-2 text-xs text-text-faint">
          Inoperable cars need a winch. Pricing is different.
        </p>
        {errors.vehicleCondition && (
          <p role="alert" className="mt-2 text-xs font-medium text-orange-dark">
            {errors.vehicleCondition.message}
          </p>
        )}
      </fieldset>
    </div>
  );
}
