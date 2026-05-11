import { z } from 'zod';

const OLDEST_YEAR = 1900;
const NEWEST_YEAR = new Date().getFullYear() + 1;

export const TRAILER_TYPES = ['open', 'enclosed'] as const;
export const VEHICLE_CONDITIONS = ['runs', 'inoperable'] as const;
export const QUOTE_SOURCES = ['hero-mini', 'main-form', 'final-cta'] as const;

const zipRegex = /^\d{5}$/;
const phoneRegex = /^\+1 \(\d{3}\) \d{3}-\d{4}$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const quoteSchema = z.object({
  pickupZip: z.string().regex(zipRegex, 'Enter a 5-digit ZIP code'),
  deliveryZip: z.string().regex(zipRegex, 'Enter a 5-digit ZIP code'),
  trailerType: z.enum(TRAILER_TYPES, { message: 'Pick open or enclosed' }),
  vehicleYear: z
    .string()
    .regex(/^\d{4}$/, 'Pick the year')
    .refine((val) => {
      const n = parseInt(val, 10);
      return n >= OLDEST_YEAR && n <= NEWEST_YEAR;
    }, `Year must be between ${OLDEST_YEAR} and ${NEWEST_YEAR}`),
  vehicleMake: z
    .string()
    .min(2, 'Pick or type a make')
    .max(40, 'Make name is too long'),
  vehicleModel: z
    .string()
    .min(1, 'Type the model')
    .max(60, 'Model name is too long'),
  vehicleCondition: z.enum(VEHICLE_CONDITIONS, {
    message: 'Tell us if it runs',
  }),
  readyDate: z.string().regex(isoDateRegex, 'Pick a pickup date'),
  firstName: z.string().min(1, 'Enter a first name').max(40),
  lastName: z.string().min(1, 'Enter a last name').max(40),
  email: z.string().email('That email looks off, check the spelling'),
  // Phone is OPTIONAL. Empty string is allowed; if provided, must match US +1 mask.
  phone: z
    .string()
    .regex(phoneRegex, 'Phone needs 10 digits')
    .optional()
    .or(z.literal('')),
  consentTcpa: z.boolean().optional(),
  source: z.enum(QUOTE_SOURCES).optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

// Step-specific field lists for RHF.trigger() per-step validation.
export const STEP_FIELDS = {
  route: ['pickupZip', 'deliveryZip', 'trailerType'],
  vehicle: ['vehicleYear', 'vehicleMake', 'vehicleModel', 'vehicleCondition'],
  contact: ['readyDate', 'firstName', 'lastName', 'email', 'phone'],
} as const satisfies Record<string, readonly (keyof QuoteInput)[]>;
