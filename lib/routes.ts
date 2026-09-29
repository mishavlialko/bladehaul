export const ROUTES = [
  { id: 'R-001', from: 'New York, NY', to: 'Miami, FL' },
  { id: 'R-002', from: 'Los Angeles, CA', to: 'New York, NY' },
  { id: 'R-003', from: 'Chicago, IL', to: 'Orlando, FL' },
  { id: 'R-004', from: 'Dallas, TX', to: 'Los Angeles, CA' },
  { id: 'R-005', from: 'Newark, NJ', to: 'Miami, FL' },
  { id: 'R-006', from: 'Atlanta, GA', to: 'Los Angeles, CA' },
  { id: 'R-007', from: 'Phoenix, AZ', to: 'Seattle, WA' },
  { id: 'R-008', from: 'Columbus, OH', to: 'Orlando, FL' },
  { id: 'R-009', from: 'Detroit, MI', to: 'Phoenix, AZ' },
  { id: 'R-010', from: 'Boston, MA', to: 'Miami, FL' },
] as const;

export type Route = (typeof ROUTES)[number];
export type RouteId = Route['id'];
