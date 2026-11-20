/**
 * CASH-FLOW — Currency Conversion Module
 * Integrates Frankfurter API with caching, fallback rates, and non-destructive display conversion.
 */

const BASE_CURRENCY = 'INR';

// Fallback reference rates in case Frankfurter API is offline or unreachable
const FALLBACK_RATES = {
  INR: 1.0,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095
};

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

const CURRENCY_LOCALES = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB'
};

// In-memory cache for fetched rates during current session
const ratesCache = new Map();

/**
 * Format a numeric amount in a specified currency using Intl.NumberFormat
 * @param {number} amount
 * @param {string} currencyCode
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = 'INR') {
  const code = (currencyCode || BASE_CURRENCY).toUpperCase();
  const numeric = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const locale = CURRENCY_LOCALES[code] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numeric);
  } catch (error) {
    // Fallback if Intl format fails
    const sym = CURRENCY_SYMBOLS[code] || code + ' ';
    return `${sym}${numeric.toFixed(2)}`;
  }
}

/**
 * Get currency symbol
 * @param {string} currencyCode
 * @returns {string}
 */
export function getCurrencySymbol(currencyCode = 'INR') {
  return CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Convert an amount from base currency (INR) to target display currency
 * @param {number} amountBase Amount in base currency
 * @param {string} targetCurrency Target currency code
 * @param {Object} rates Dictionary of exchange rates relative to INR
 * @returns {number} Converted value
 */
export function convertFromBase(amountBase, targetCurrency = 'INR', rates = {}) {
  const target = (targetCurrency || BASE_CURRENCY).toUpperCase();
  if (target === BASE_CURRENCY) {
    return Number(amountBase) || 0;
  }

  const rate = rates[target] || FALLBACK_RATES[target] || 1;
  return (Number(amountBase) || 0) * rate;
}

/**
 * Fetch latest exchange rates from Frankfurter API
 * Endpoint: https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP
 * @returns {Promise<{ rates: Object, date: string, isFallback: boolean }>}
 */
export async function fetchExchangeRates() {
  const cacheKey = `rates_${BASE_CURRENCY}_${new Date().toISOString().slice(0, 10)}`;

  // Return from session cache if available
  if (ratesCache.has(cacheKey)) {
    return ratesCache.get(cacheKey);
  }

  const targetCurrencies = ['USD', 'EUR', 'GBP'].join(',');
  const url = `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${targetCurrencies}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Frankfurter API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = {
      rates: {
        [BASE_CURRENCY]: 1.0,
        ...data.rates
      },
      date: data.date,
      isFallback: false
    };

    ratesCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('[Currency] Frankfurter API request failed, using offline fallback rates:', error);

    const fallbackResult = {
      rates: { ...FALLBACK_RATES },
      date: new Date().toISOString().slice(0, 10),
      isFallback: true,
      error: error.message
    };

    return fallbackResult;
  }
}

export default {
  BASE_CURRENCY,
  formatCurrency,
  getCurrencySymbol,
  convertFromBase,
  fetchExchangeRates
};

