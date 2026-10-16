import type { QuotePayload } from '@/lib/quote-outbox';

// BeRocker Lead source API vehicle types. BeRocker prices passenger cars as
// "Car" (its docs send a Camry that way and its vehicle catalogue returns "Car"
// with body type "Sedan"). Sedans, wagons and hatchbacks therefore use "Car";
// the exact website body type is repeated in the shipper comment.
export const BEROCKER_VEHICLE_TYPES = {
  sedan: 'Car',
  suv: 'SUV',
  pickup: 'Pickup',
  van: 'Van',
  coupe: 'Coupe',
  convertible: 'Convertible',
  wagon: 'Car',
  hatchback: 'Car',
  other: 'Other',
} as const satisfies Record<QuotePayload['bodyType'], string>;

export type BeRockerVehicle = {
  vehicle_model_year: number;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_type: (typeof BEROCKER_VEHICLE_TYPES)[keyof typeof BEROCKER_VEHICLE_TYPES];
  vehicle_inop: boolean;
  vin?: string;
};

// Like the email, this exact body is saved with the request. Retries resend it
// unchanged and never rebuild it from newer mapping code or settings.
export type BeRockerLead = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  origin_postal_code: string;
  destination_postal_code: string;
  ship_date: string;
  transport_type: QuotePayload['trailerType'];
  comment_from_shipper: string;
  secondary_id: string;
  vehicles: BeRockerVehicle[];
};

export type QuoteCrmDelivery = {
  state: 'pending' | 'sending' | 'created' | 'manual_review' | 'skipped';
  lead?: BeRockerLead;
  attempts: number;
  nextAttemptAt: string | null;
  firstAttemptAt?: string;
  lastAttemptAt?: string;
  lease?: { owner: string; until: string };
  leadId?: string;
  bookingLink?: string;
  createdAt?: string;
  attentionReason?: string;
};

export type CrmResult =
  | { kind: 'created'; leadId?: string; bookingLink?: string }
  | { kind: 'temporary' | 'permanent'; code: string };

export interface QuoteCrmProvider {
  createLead(lead: BeRockerLead): Promise<CrmResult>;
}

function clean(value: string | undefined, multiline = false): string {
  const cleaned =
    value?.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '') ?? '';
  return (multiline ? cleaned : cleaned.replace(/\s+/g, ' ')).trim();
}

// The record keeps E.164 (older quotes may hold the form's display format).
// BeRocker accepts any common US format, but its examples and saved leads use
// 10 digits, so the lead carries exactly that.
function usPhone(phone: string | undefined): string | null {
  const digits = phone?.replace(/\D/g, '') ?? '';
  const national =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(national) ? national : null;
}

// Shared by the CRM comment and the notification email.
export function attributionLines(quote: QuotePayload): string[] {
  const utm = Object.entries(quote.utm ?? {})
    .map(([tag, value]) => [tag, clean(value)])
    .filter(([, value]) => value)
    .map(([tag, value]) => `${tag}=${value}`)
    .join(', ');
  return [
    `Landing page: ${clean(quote.landingPage) || 'Not recorded'}`,
    `UTM: ${utm || 'None'}`,
  ];
}

function vehicle(quote: QuotePayload): BeRockerVehicle {
  const vin = clean(quote.vin);
  return {
    vehicle_model_year: Number(quote.vehicleYear),
    vehicle_make: clean(quote.vehicleMake),
    vehicle_model: clean(quote.vehicleModel),
    vehicle_type: BEROCKER_VEHICLE_TYPES[quote.bodyType],
    vehicle_inop: quote.vehicleCondition === 'inoperable',
    ...(vin ? { vin } : {}),
  };
}

export function buildBeRockerLead(
  quote: QuotePayload,
  quoteId: string,
  receivedAt: string,
): BeRockerLead | null {
  // BeRocker requires a phone. The form requires one, but a quote saved before
  // that change may lack it and then skips the CRM step.
  const phone = usPhone(quote.phone);
  if (!phone) return null;
  return {
    first_name: clean(quote.firstName),
    last_name: clean(quote.lastName),
    phone,
    email: quote.email.trim().toLowerCase(),
    origin_postal_code: quote.pickupZip,
    destination_postal_code: quote.deliveryZip,
    ship_date: quote.readyDate,
    transport_type: quote.trailerType,
    comment_from_shipper: [
      `Contact consent by submitting the quote form (phone, email, SMS, including automated messages): ${quote.consentTcpa === true ? 'Yes' : 'No'}`,
      `Consent notice version: ${quote.consentVersion}`,
      `Consent recorded at (UTC, server receipt): ${receivedAt}`,
      `Source: bladehaul.com quote form (${quote.source ?? 'main-form'})`,
      ...attributionLines(quote),
      `Website request ID: ${quoteId}`,
      `Website body type: ${quote.bodyType}`,
      '',
      'Customer notes:',
      clean(quote.additionalDetails, true) || 'None',
    ].join('\n'),
    secondary_id: quoteId,
    vehicles: [vehicle(quote)],
  };
}
