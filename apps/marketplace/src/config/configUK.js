// UK-specific configuration for DIY Tool Share marketplace

// Country and region settings
export const UK_COUNTRY_CODE = 'GB';
export const UK_CURRENCY = 'GBP';
export const UK_TIMEZONE = 'Europe/London';
export const UK_LOCALE = 'en-GB';

// Phone and postal code settings
export const UK_PHONE_COUNTRY_CODE = '+44';
export const UK_POSTAL_CODE_PATTERN = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

// Address format
export const UK_ADDRESS_FORMAT = {
  country: 'United Kingdom',
  countryCode: 'GB',
  currency: 'GBP',
  timezone: 'Europe/London'
};

// Bank account configuration for UK
export const UK_BANK_CONFIG = {
  sortCode: true,
  accountNumber: true,
  accountNumberLength: 8
};

// Map defaults for UK
export const UK_MAP_DEFAULTS = {
  defaultCenter: {
    lat: 51.5074,
    lng: -0.1278
  },
  defaultZoom: 6,
  countryLimit: ['GB']
};

// Search restrictions for UK
export const UK_SEARCH_RESTRICTIONS = {
  countryLimit: ['GB'],
  language: ['en'],
  defaultLocations: [
    'London, UK',
    'Manchester, UK',
    'Birmingham, UK',
    'Leeds, UK',
    'Liverpool, UK',
    'Edinburgh, UK'
  ]
};

// Registration restrictions for UK
export const UK_REGISTRATION_RESTRICTIONS = {
  allowedCountries: ['GB'],
  defaultCountry: 'GB',
  phoneCountryCode: '+44'
};

// Payment restrictions for UK
export const UK_PAYMENT_RESTRICTIONS = {
  supportedCountries: ['GB'],
  defaultCurrency: 'GBP',
  stripeSupportedCountries: ['GB']
};

// Legal requirements for UK
export const UK_LEGAL_REQUIREMENTS = {
  gdprCompliant: true,
  cookieConsent: true,
  termsOfService: true,
  privacyPolicy: true
};

// Business hours for UK
export const UK_BUSINESS_HOURS = {
  timezone: 'Europe/London',
  defaultOpenTime: '09:00',
  defaultCloseTime: '17:00',
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
};

// Tax configuration for UK
export const UK_TAX_CONFIG = {
  vatRate: 20,
  vatNumberRequired: false,
  taxIncluded: true
};

// Shipping configuration for UK
export const UK_SHIPPING_CONFIG = {
  domesticShipping: true,
  internationalShipping: false,
  defaultShippingCountry: 'GB'
};

// Default export for the entire UK configuration
export default {
  UK_COUNTRY_CODE,
  UK_CURRENCY,
  UK_TIMEZONE,
  UK_LOCALE,
  UK_PHONE_COUNTRY_CODE,
  UK_POSTAL_CODE_PATTERN,
  UK_ADDRESS_FORMAT,
  UK_BANK_CONFIG,
  UK_MAP_DEFAULTS,
  UK_SEARCH_RESTRICTIONS,
  UK_REGISTRATION_RESTRICTIONS,
  UK_PAYMENT_RESTRICTIONS,
  UK_LEGAL_REQUIREMENTS,
  UK_BUSINESS_HOURS,
  UK_TAX_CONFIG,
  UK_SHIPPING_CONFIG
};
