'use client';

import { useId, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/cn';
import { VEHICLE_CONDITIONS, type QuoteInput } from '@/lib/validation';

const OLDEST_YEAR = 1900;

export default function QuoteStepVehicle() {
  const {
    register,
    formState: { errors },
  } = useFormContext<QuoteInput>();

  const yearId = useId();
  const makeId = useId();
  const modelId = useId();
  const condRunsId = useId();
  const condInopId = useId();

  const years = useMemo(() => {
    const newest = new Date().getFullYear() + 1;
    return Array.from({ length: newest - OLDEST_YEAR + 1 }, (_, i) => newest - i);
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
            placeholder="Toyota"
            aria-invalid={!!errors.vehicleMake}
            {...register('vehicleMake')}
            className={inputClass(!!errors.vehicleMake)}
          />
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

      <fieldset>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint">
          Does it run?
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {VEHICLE_CONDITIONS.map((value) => {
            const id = value === 'runs' ? condRunsId : condInopId;
            const label = value === 'runs' ? 'Runs' : "Doesn't run";
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
                  {...register('vehicleCondition')}
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
  children: React.ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint"
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs font-medium text-orange-dark">
          {error}
        </p>
      )}
    </div>
  );
}
