

/**
 * Utility functions for currency formatting based on country
 */

// Format a number to Indonesian Rupiah
export const formatToRupiah = (number: number | string) => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

// Currency mappings for different countries
const currencyFormats: Record<string, { formatter: (price: number) => string, symbol: string, code: string }> = {
  'ID': {
    formatter: (price) => new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price),
    symbol: 'Rp',
    code: 'IDR'
  },
  'MY': {
    formatter: (price) => new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price),
    symbol: 'RM',
    code: 'MYR'
  },
  'SG': {
    formatter: (price) => new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price),
    symbol: 'S$',
    code: 'SGD'
  },
  'TH': {
    formatter: (price) => new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price),
    symbol: '฿',
    code: 'THB'
  },
  'PH': {
    formatter: (price) => new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price),
    symbol: '₱',
    code: 'PHP'
  },
  'VN': {
    formatter: (price) => new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price),
    symbol: '₫',
    code: 'VND'
  },
  'US': {
    formatter: (price) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price),
    symbol: '$',
    code: 'USD'
  },
  // Add other countries as needed
};

// Format price according to country code
export const formatToCurrency = (price: string | number, countryCode: string = 'US'): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // If we have a specific formatter for this country, use it
  if (currencyFormats[countryCode]) {
    return currencyFormats[countryCode].formatter(numericPrice);
  }
  
  // Default to USD if country code not found
  return currencyFormats['US'].formatter(numericPrice);
};

// Get currency symbol for a country
export const getCurrencySymbol = (countryCode: string = 'US'): string => {
  return currencyFormats[countryCode]?.symbol || '$';
};

// Get currency code for a country
export const getCurrencyCode = (countryCode: string = 'US'): string => {
  return currencyFormats[countryCode]?.code || 'USD';
};

