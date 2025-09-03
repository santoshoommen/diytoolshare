// See: https://en.wikipedia.org/wiki/ISO_4217
// See: https://stripe.com/docs/currencies
// UK-focused marketplace with international currency support
export const stripeSupportedCurrencies = [
  'GBP', // Primary currency for UK marketplace
  'USD',
  'EUR',
  'CAD',
  'AUD',
];

// Note: This template is designed to support currencies with subunit divisors of 100 or smaller.
export const subUnitDivisors = {
  GBP: 100, // Primary currency for UK marketplace
  USD: 100,
  EUR: 100,
  CAD: 100,
  AUD: 100,
};

/**
 * Currency formatting options.
 * See: https://github.com/yahoo/react-intl/wiki/API#formatnumber
 *
 * @param {string} currency
 */
export const currencyFormatting = (currency, options) => {
  const { enforceSupportedCurrencies = true } = options || {};
  if (enforceSupportedCurrencies && !subUnitDivisors[currency]) {
    const currencies = Object.keys(subUnitDivisors);
    throw new Error(
      `Configuration missing for currency: ${currency}. Supported currencies: ${currencies.join(
        ', '
      )}.`
    );
  }

  return subUnitDivisors[currency] === 1
    ? {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol',
        useGrouping: true,
        // If the currency is not using subunits (like JPY), remove fractions.
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    : {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol',
        useGrouping: true,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      };
};
