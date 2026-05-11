import { z } from 'zod';

const OLDEST_YEAR = 1990;
const NEWEST_YEAR = new Date().getFullYear() + 1;

export const quoteSchema = z.object({
  pickupZip: z
    .string()
    .regex(/^\d{5}$/, 'Please enter a valid 5-digit ZIP code'),
  deliveryZip: z
    .string()
    .regex(/^\d{5}$/, 'Please enter a valid 5-digit ZIP code'),
  year: z
    .string()
    .regex(/^\d{4}$/, 'Vehicle year is required for accurate pricing')
    .refine((val) => {
      const n = parseInt(val, 10);
      return n >= OLDEST_YEAR && n <= NEWEST_YEAR;
    }, `Year must be between ${OLDEST_YEAR} and ${NEWEST_YEAR}`),
  condition: z.enum(['runs', 'inop'], {
    message: 'Select runs or doesn’t run',
  }),
  trailer: z.enum(['open', 'enclosed'], {
    message: 'Select open or enclosed',
  }),
  readyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a pickup date'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(
      /^\+1 \(\d{3}\) \d{3}-\d{4}$/,
      'Looks like the phone number is missing a digit',
    ),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
