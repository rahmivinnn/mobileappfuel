
/**
 * Format a number or string to Rupiah (Indonesian currency)
 * @param number The number or string to format
 * @returns Formatted string in Rupiah
 */
export const formatToRupiah = (number: string | number): string => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

/**
 * Format a number to currency based on country code
 * @param amount The number to format
 * @param countryCode The ISO country code
 * @returns Formatted string in local currency
 */
export const formatToCurrency = (amount: number | string, countryCode: string = 'ID'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Map country codes to currency codes
  const countryCurrencyMap: Record<string, string> = {
    'ID': 'IDR', // Indonesia
    'MY': 'MYR', // Malaysia
    'SG': 'SGD', // Singapore
    'TH': 'THB', // Thailand
    'PH': 'PHP', // Philippines
    'VN': 'VND', // Vietnam
    'US': 'USD', // United States
    'GB': 'GBP', // United Kingdom
    'AU': 'AUD', // Australia
    'JP': 'JPY', // Japan
    'CA': 'CAD', // Canada
    'DE': 'EUR', // Germany
    'FR': 'EUR', // France
    'IT': 'EUR', // Italy
    'ES': 'EUR', // Spain
    'BR': 'BRL', // Brazil
    'MX': 'MXN', // Mexico
    'IN': 'INR', // India
    'CN': 'CNY', // China
    'RU': 'RUB', // Russia
    'ZA': 'ZAR', // South Africa
    'AE': 'AED', // UAE
    'AR': 'ARS', // Argentina
    'CL': 'CLP', // Chile
    'CO': 'COP', // Colombia
    'CR': 'CRC', // Costa Rica
    'EG': 'EGP', // Egypt
    'HK': 'HKD', // Hong Kong
    'IL': 'ILS', // Israel
    'KR': 'KRW', // South Korea
    'NZ': 'NZD', // New Zealand
    'NO': 'NOK', // Norway
    'SE': 'SEK', // Sweden
    'CH': 'CHF', // Switzerland
    'TR': 'TRY', // Turkey
  };
  
  // Map country codes to locales
  const countryLocaleMap: Record<string, string> = {
    'ID': 'id-ID',
    'MY': 'ms-MY',
    'SG': 'en-SG',
    'TH': 'th-TH',
    'PH': 'fil-PH',
    'VN': 'vi-VN',
    'US': 'en-US',
    'GB': 'en-GB',
    'AU': 'en-AU',
    'JP': 'ja-JP',
    'CA': 'en-CA',
    'DE': 'de-DE',
    'FR': 'fr-FR',
    'IT': 'it-IT',
    'ES': 'es-ES',
    'BR': 'pt-BR',
    'MX': 'es-MX',
    'IN': 'hi-IN',
    'CN': 'zh-CN',
    'RU': 'ru-RU',
    'ZA': 'en-ZA',
    'AE': 'ar-AE',
    'AR': 'es-AR',
    'CL': 'es-CL',
    'CO': 'es-CO',
    'CR': 'es-CR',
    'EG': 'ar-EG',
    'HK': 'zh-HK',
    'IL': 'he-IL',
    'KR': 'ko-KR',
    'NZ': 'en-NZ',
    'NO': 'no-NO',
    'SE': 'sv-SE',
    'CH': 'de-CH',
    'TR': 'tr-TR',
  };
  
  // Determine decimal places for currencies
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'COP'];
  const currency = countryCurrencyMap[countryCode] || 'USD';
  const locale = countryLocaleMap[countryCode] || 'en-US';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: zeroDecimalCurrencies.includes(currency) ? 0 : 2,
      maximumFractionDigits: zeroDecimalCurrencies.includes(currency) ? 0 : 2
    }).format(num);
  } catch (error) {
    // Fallback if Intl is not supported or has issues
    console.error("Error formatting currency:", error);
    return `${currency} ${num.toLocaleString()}`;
  }
};
