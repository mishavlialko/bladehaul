// Top US ZIP codes commonly seen in B2C car shipping: snowbird origins
// (NE/MW), snowbird destinations (FL/AZ/TX/CA), and major metros. Used
// as a <datalist> hint for the ZIP inputs in the quote form. Users can
// still type any 5-digit ZIP — Zippopotam.us resolves the city for
// anything not in this list.
export type ZipEntry = {
  zip: string;
  city: string;
  state: string;
};

export const TOP_ZIPS: readonly ZipEntry[] = [
  // New York
  { zip: '10001', city: 'New York', state: 'NY' },
  { zip: '10128', city: 'Manhattan', state: 'NY' },
  { zip: '11201', city: 'Brooklyn', state: 'NY' },
  { zip: '11375', city: 'Queens', state: 'NY' },
  { zip: '10301', city: 'Staten Island', state: 'NY' },
  { zip: '14202', city: 'Buffalo', state: 'NY' },
  { zip: '14604', city: 'Rochester', state: 'NY' },
  // New Jersey
  { zip: '07102', city: 'Newark', state: 'NJ' },
  { zip: '07302', city: 'Jersey City', state: 'NJ' },
  // Massachusetts
  { zip: '02108', city: 'Boston', state: 'MA' },
  { zip: '02139', city: 'Cambridge', state: 'MA' },
  { zip: '01103', city: 'Springfield', state: 'MA' },
  // Connecticut
  { zip: '06103', city: 'Hartford', state: 'CT' },
  { zip: '06510', city: 'New Haven', state: 'CT' },
  // Rhode Island
  { zip: '02903', city: 'Providence', state: 'RI' },
  // Pennsylvania
  { zip: '19103', city: 'Philadelphia', state: 'PA' },
  { zip: '15222', city: 'Pittsburgh', state: 'PA' },
  // Washington DC
  { zip: '20001', city: 'Washington', state: 'DC' },
  // Maryland
  { zip: '21201', city: 'Baltimore', state: 'MD' },
  // Virginia
  { zip: '22202', city: 'Arlington', state: 'VA' },
  { zip: '23510', city: 'Norfolk', state: 'VA' },
  { zip: '23219', city: 'Richmond', state: 'VA' },
  { zip: '23451', city: 'Virginia Beach', state: 'VA' },
  // North Carolina
  { zip: '28202', city: 'Charlotte', state: 'NC' },
  { zip: '27601', city: 'Raleigh', state: 'NC' },
  { zip: '27401', city: 'Greensboro', state: 'NC' },
  // South Carolina
  { zip: '29401', city: 'Charleston', state: 'SC' },
  { zip: '29201', city: 'Columbia', state: 'SC' },
  // Georgia
  { zip: '30303', city: 'Atlanta', state: 'GA' },
  { zip: '31401', city: 'Savannah', state: 'GA' },
  // Florida
  { zip: '33101', city: 'Miami', state: 'FL' },
  { zip: '33301', city: 'Fort Lauderdale', state: 'FL' },
  { zip: '33401', city: 'West Palm Beach', state: 'FL' },
  { zip: '33602', city: 'Tampa', state: 'FL' },
  { zip: '32801', city: 'Orlando', state: 'FL' },
  { zip: '32202', city: 'Jacksonville', state: 'FL' },
  { zip: '34102', city: 'Naples', state: 'FL' },
  { zip: '32301', city: 'Tallahassee', state: 'FL' },
  { zip: '32501', city: 'Pensacola', state: 'FL' },
  // Ohio
  { zip: '43215', city: 'Columbus', state: 'OH' },
  { zip: '44113', city: 'Cleveland', state: 'OH' },
  { zip: '45202', city: 'Cincinnati', state: 'OH' },
  // Michigan
  { zip: '48226', city: 'Detroit', state: 'MI' },
  { zip: '49503', city: 'Grand Rapids', state: 'MI' },
  // Indiana
  { zip: '46204', city: 'Indianapolis', state: 'IN' },
  // Illinois
  { zip: '60601', city: 'Chicago', state: 'IL' },
  { zip: '60290', city: 'Chicago', state: 'IL' },
  // Wisconsin
  { zip: '53202', city: 'Milwaukee', state: 'WI' },
  { zip: '53703', city: 'Madison', state: 'WI' },
  // Minnesota
  { zip: '55401', city: 'Minneapolis', state: 'MN' },
  { zip: '55101', city: 'Saint Paul', state: 'MN' },
  // Iowa
  { zip: '50309', city: 'Des Moines', state: 'IA' },
  // Missouri
  { zip: '63101', city: 'Saint Louis', state: 'MO' },
  { zip: '64108', city: 'Kansas City', state: 'MO' },
  // Tennessee
  { zip: '37201', city: 'Nashville', state: 'TN' },
  { zip: '38103', city: 'Memphis', state: 'TN' },
  { zip: '37902', city: 'Knoxville', state: 'TN' },
  // Kentucky
  { zip: '40202', city: 'Louisville', state: 'KY' },
  { zip: '40507', city: 'Lexington', state: 'KY' },
  // Alabama
  { zip: '35203', city: 'Birmingham', state: 'AL' },
  { zip: '36104', city: 'Montgomery', state: 'AL' },
  // Louisiana
  { zip: '70112', city: 'New Orleans', state: 'LA' },
  { zip: '70801', city: 'Baton Rouge', state: 'LA' },
  // Texas
  { zip: '75201', city: 'Dallas', state: 'TX' },
  { zip: '76102', city: 'Fort Worth', state: 'TX' },
  { zip: '77002', city: 'Houston', state: 'TX' },
  { zip: '78205', city: 'San Antonio', state: 'TX' },
  { zip: '78701', city: 'Austin', state: 'TX' },
  { zip: '79901', city: 'El Paso', state: 'TX' },
  { zip: '79401', city: 'Lubbock', state: 'TX' },
  // Oklahoma
  { zip: '73102', city: 'Oklahoma City', state: 'OK' },
  { zip: '74103', city: 'Tulsa', state: 'OK' },
  // Arkansas
  { zip: '72201', city: 'Little Rock', state: 'AR' },
  // Kansas
  { zip: '67202', city: 'Wichita', state: 'KS' },
  // Nebraska
  { zip: '68102', city: 'Omaha', state: 'NE' },
  // Colorado
  { zip: '80202', city: 'Denver', state: 'CO' },
  { zip: '80903', city: 'Colorado Springs', state: 'CO' },
  // New Mexico
  { zip: '87102', city: 'Albuquerque', state: 'NM' },
  // Arizona
  { zip: '85004', city: 'Phoenix', state: 'AZ' },
  { zip: '85701', city: 'Tucson', state: 'AZ' },
  { zip: '85003', city: 'Phoenix', state: 'AZ' },
  { zip: '85251', city: 'Scottsdale', state: 'AZ' },
  // Utah
  { zip: '84101', city: 'Salt Lake City', state: 'UT' },
  // Nevada
  { zip: '89101', city: 'Las Vegas', state: 'NV' },
  { zip: '89501', city: 'Reno', state: 'NV' },
  // California
  { zip: '90001', city: 'Los Angeles', state: 'CA' },
  { zip: '90012', city: 'Los Angeles', state: 'CA' },
  { zip: '90210', city: 'Beverly Hills', state: 'CA' },
  { zip: '90802', city: 'Long Beach', state: 'CA' },
  { zip: '92101', city: 'San Diego', state: 'CA' },
  { zip: '94102', city: 'San Francisco', state: 'CA' },
  { zip: '94601', city: 'Oakland', state: 'CA' },
  { zip: '95110', city: 'San Jose', state: 'CA' },
  { zip: '95814', city: 'Sacramento', state: 'CA' },
  { zip: '93701', city: 'Fresno', state: 'CA' },
  { zip: '91101', city: 'Pasadena', state: 'CA' },
  { zip: '92614', city: 'Irvine', state: 'CA' },
  // Oregon
  { zip: '97201', city: 'Portland', state: 'OR' },
  { zip: '97401', city: 'Eugene', state: 'OR' },
  // Washington
  { zip: '98101', city: 'Seattle', state: 'WA' },
  { zip: '98402', city: 'Tacoma', state: 'WA' },
  { zip: '98660', city: 'Vancouver', state: 'WA' },
  { zip: '99201', city: 'Spokane', state: 'WA' },
  // Hawaii
  { zip: '96813', city: 'Honolulu', state: 'HI' },
  // Alaska
  { zip: '99501', city: 'Anchorage', state: 'AK' },
];
