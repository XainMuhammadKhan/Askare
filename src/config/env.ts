/**
 * App-wide configuration.
 * Change API_BASE_URL here to switch between the live and local backend.
 * Do NOT add "/api" — every endpoint path already starts with it.
 */
export const ENV = {
  API_BASE_URL: 'https://apis.brescialionst10.com',
  // API_BASE_URL: 'http://localhost:3000',

  /** Pakistan Standard Time offset used to display dates (UTC+5). */
  TIMEZONE: 'Asia/Karachi',
  CURRENCY: 'PKR',
} as const;
