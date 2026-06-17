// Currency formatting + locale detection

export interface CurrencyOption {
  code: string;
  label: string;
  locale: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'INR', label: 'Indian Rupee', locale: 'en-IN', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', locale: 'en-US', symbol: '$' },
  { code: 'EUR', label: 'Euro', locale: 'de-DE', symbol: '€' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB', symbol: '£' },
  { code: 'AED', label: 'UAE Dirham', locale: 'ar-AE', symbol: 'د.إ' },
  { code: 'JPY', label: 'Japanese Yen', locale: 'ja-JP', symbol: '¥' },
  { code: 'AUD', label: 'Australian Dollar', locale: 'en-AU', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', locale: 'en-CA', symbol: 'C$' },
  { code: 'SGD', label: 'Singapore Dollar', locale: 'en-SG', symbol: 'S$' },
];

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string): CurrencyOption {
  return BY_CODE.get(code) ?? CURRENCIES[1]; // default USD
}

export function currencySymbol(code: string): string {
  return getCurrency(code).symbol;
}

/** Format cents into a localized currency string. */
export function formatMoney(
  cents: number,
  code: string,
  opts?: { whole?: boolean }
): string {
  const cur = getCurrency(code);
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency',
      currency: cur.code,
      minimumFractionDigits: opts?.whole ? 0 : 2,
      maximumFractionDigits: opts?.whole ? 0 : 2,
    }).format(cents / 100);
  } catch {
    return `${cur.symbol}${(cents / 100).toFixed(opts?.whole ? 0 : 2)}`;
  }
}

/** Detect the user's likely currency from timezone / browser locale. */
export function detectCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Kolkata|Calcutta/i.test(tz)) return 'INR';
    if (/Dubai/i.test(tz)) return 'AED';
    if (/Tokyo/i.test(tz)) return 'JPY';
    if (/Singapore/i.test(tz)) return 'SGD';
    if (/London/i.test(tz)) return 'GBP';
    if (/Sydney|Melbourne/i.test(tz)) return 'AUD';
    if (/Toronto|Vancouver/i.test(tz)) return 'CAD';
    if (/Paris|Berlin|Madrid|Rome|Amsterdam/i.test(tz)) return 'EUR';

    const lang = navigator.language || '';
    if (/-IN$/i.test(lang)) return 'INR';
    if (/-GB$/i.test(lang)) return 'GBP';
    if (/-JP$/i.test(lang)) return 'JPY';
    if (/-(DE|FR|ES|IT|NL)$/i.test(lang)) return 'EUR';
  } catch {
    // ignore
  }
  return 'USD';
}
