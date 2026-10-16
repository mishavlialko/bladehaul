import { z } from 'zod';

// Floor for the vehicle-year field. 1900 (not 1990) is deliberate: the FAQ
// promises we ship classics. Shared with the year <select> in QuoteStepVehicle.
export const OLDEST_YEAR = 1900;
const NEWEST_YEAR = new Date().getFullYear() + 1;

export const TRAILER_TYPES = ['open', 'enclosed'] as const;
export const VEHICLE_CONDITIONS = ['runs', 'inoperable'] as const;
export const QUOTE_SOURCES = ['hero-mini', 'main-form', 'final-cta'] as const;
export const BODY_TYPES = [
  'sedan',
  'suv',
  'pickup',
  'van',
  'coupe',
  'convertible',
  'wagon',
  'hatchback',
  'other',
] as const;
export const BODY_TYPE_LABELS: Record<(typeof BODY_TYPES)[number], string> = {
  sedan: 'Sedan',
  suv: 'SUV / crossover',
  pickup: 'Pickup truck',
  van: 'Van / minivan',
  coupe: 'Coupe',
  convertible: 'Convertible',
  wagon: 'Wagon',
  hatchback: 'Hatchback',
  other: 'Other',
};
// Submitting the form is the consent: the notice below sits next to the submit
// button, and the version identifies its exact wording in every saved request.
// Earlier SMS-checkbox or phone-follow-up consent is never upgraded to this one.
export const QUOTE_CONSENT_VERSION = '2026-10-16-submit-v1';
export const QUOTE_SUBMIT_LABEL = 'Get Quote';
export const QUOTE_CONSENT_NOTICE = `By clicking ${QUOTE_SUBMIT_LABEL}, you agree that BladeHaul Auto Transport may contact you about your request by phone, email, and text message (SMS), including automated messages, at the number provided. Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to opt out.`;
// The form renders the last sentence with links to /privacy and /terms.
export const QUOTE_CONSENT_TEXT = `${QUOTE_CONSENT_NOTICE} See our Privacy Policy and Terms.`;
export const QUOTE_TIME_ZONE = 'America/Chicago';

const zipRegex = /^\d{5}$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Accepts the form's "+1 (312) 555-0142", E.164 and common US spellings, and
// returns E.164. NANP area codes and exchanges never start with 0 or 1.
export function normalizeUSPhone(value: string): string | null {
  if (!/^[\d\s().+-]+$/.test(value)) return null;
  const digits = value.replace(/\D/g, '');
  const national =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(national) ? `+1${national}` : null;
}

export function getQuoteDateBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: QUOTE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  const min = `${part('year')}-${part('month')}-${part('day')}`;
  const maxDate = new Date(`${min}T00:00:00.000Z`);
  maxDate.setUTCDate(maxDate.getUTCDate() + 180);
  return { min, max: maxDate.toISOString().slice(0, 10) };
}

function isCalendarDate(value: string) {
  if (!isoDateRegex.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

const vehicleYearSchema = z
  .string()
  .regex(/^\d{4}$/, 'Pick the year')
  .refine((value) => {
    const year = Number(value);
    return year >= OLDEST_YEAR && year <= NEWEST_YEAR;
  }, `Year must be between ${OLDEST_YEAR} and ${NEWEST_YEAR}`);

const vinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .max(30, 'Vehicle ID is too long')
  .optional();

const vehicleIdentitySchema = z.object({
  vehicleYear: vehicleYearSchema,
  vin: vinSchema,
});

// Attribution (lib/quote-attribution.ts) never blocks a request: an unusable
// value is dropped, not refused.
const utmTagSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .optional()
  .catch(undefined);
const attributionSchema = {
  landingPage: z
    .string()
    .max(200)
    .regex(/^\/[^\s?#]*$/)
    .optional()
    .catch(undefined),
  utm: z
    .object({
      source: utmTagSchema,
      medium: utmTagSchema,
      campaign: utmTagSchema,
      term: utmTagSchema,
      content: utmTagSchema,
    })
    .optional()
    .catch(undefined),
};

export const quoteSchema = z
  .object({
    requestId: z.uuidv4('Please send the request again'),
    pickupZip: z.string().trim().regex(zipRegex, 'Enter a 5-digit ZIP code'),
    deliveryZip: z.string().trim().regex(zipRegex, 'Enter a 5-digit ZIP code'),
    trailerType: z.enum(TRAILER_TYPES, { message: 'Pick open or enclosed' }),
    vehicleYear: vehicleYearSchema,
    vehicleMake: z
      .string()
      .trim()
      .min(2, 'Pick or type a make')
      .max(40, 'Make name is too long'),
    vehicleModel: z
      .string()
      .trim()
      .min(1, 'Type the model')
      .max(60, 'Model name is too long'),
    bodyType: z.enum(BODY_TYPES, { message: 'Pick the body type' }),
    vehicleCondition: z.enum(VEHICLE_CONDITIONS, {
      message: 'Tell us if it runs',
    }),
    vin: vinSchema,
    additionalDetails: z
      .string()
      .trim()
      .max(2000, 'Keep additional details to 2,000 characters')
      .optional(),
    readyDate: z
      .string()
      .refine(isCalendarDate, 'Pick a valid pickup date')
      .refine((value) => {
        if (!isCalendarDate(value)) return true;
        const { min, max } = getQuoteDateBounds();
        return value >= min && value <= max;
      }, 'Choose a date from today through the next 180 days (Central Time)'),
    firstName: z.string().trim().min(1, 'Enter a first name').max(40),
    lastName: z.string().trim().min(1, 'Enter a last name').max(40),
    email: z
      .string()
      .trim()
      .max(254, 'Email address is too long')
      .email('That email looks off, check the spelling'),
    // Required: BeRocker cannot create a lead without it. Client and server
    // both submit/store E.164, so re-parsing a normalized value is a no-op.
    phone: z
      .string()
      .trim()
      .min(1, { message: 'Enter a phone number', abort: true })
      .max(30, { message: 'Phone number is too long', abort: true })
      .refine(
        (value) => normalizeUSPhone(value) !== null,
        'Enter a 10-digit US phone number',
      )
      .transform((value) => normalizeUSPhone(value) ?? value),
    consentTcpa: z.literal(true, {
      message: 'Refresh the page to see the current consent notice',
    }),
    consentVersion: z.literal(QUOTE_CONSENT_VERSION, {
      message: 'Refresh the page to see the current consent notice',
    }),
    source: z.enum(QUOTE_SOURCES),
    ...attributionSchema,
    website: z.string().max(200).optional(),
  })
  .refine(
    ({ vehicleYear, vin }) => {
      if (!vin) return true;
      return Number(vehicleYear) < 1981
        ? /^[A-Z0-9][A-Z0-9-]{0,29}$/.test(vin)
        : /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
    },
    {
      path: ['vin'],
      message:
        'For 1981 or newer, enter 17 characters without I, O or Q. Earlier vehicle IDs may use letters, numbers and hyphens.',
      // Validate the visible Vehicle step even before contact fields exist.
      when: (payload) => vehicleIdentitySchema.safeParse(payload.value).success,
    },
  );

export type QuoteInput = z.infer<typeof quoteSchema>;

// Step-specific field lists for RHF.trigger() per-step validation.
export const STEP_FIELDS = {
  route: ['pickupZip', 'deliveryZip', 'trailerType'],
  vehicle: [
    'vehicleYear',
    'vehicleMake',
    'vehicleModel',
    'bodyType',
    'vehicleCondition',
    'vin',
    'additionalDetails',
  ],
  contact: ['readyDate', 'firstName', 'lastName', 'email', 'phone'],
} as const satisfies Record<string, readonly (keyof QuoteInput)[]>;
