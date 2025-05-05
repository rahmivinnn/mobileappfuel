
// Map country codes to languages
const countryLanguageMap: Record<string, string> = {
  'ID': 'id', // Indonesia: Indonesian
  'MY': 'ms', // Malaysia: Malay
  'SG': 'en', // Singapore: English
  'TH': 'th', // Thailand: Thai
  'PH': 'fil', // Philippines: Filipino
  'VN': 'vi', // Vietnam: Vietnamese
  'US': 'en', // United States: English
  'GB': 'en', // United Kingdom: English
  'AU': 'en', // Australia: English
  'JP': 'ja', // Japan: Japanese
  'CA': 'en', // Canada: English (also French, but using English as default)
  'DE': 'de', // Germany: German
  'FR': 'fr', // France: French
  'IT': 'it', // Italy: Italian
  'ES': 'es', // Spain: Spanish
  'BR': 'pt', // Brazil: Portuguese
  'MX': 'es', // Mexico: Spanish
  'IN': 'hi', // India: Hindi (though multiple languages are spoken)
  'CN': 'zh', // China: Chinese
  'RU': 'ru', // Russia: Russian
  'ZA': 'en', // South Africa: English (also others)
  'AE': 'ar', // UAE: Arabic
};

// Basic translations for common phrases
const translations: Record<string, Record<string, string>> = {
  'en': { // English
    'fuelPrice': 'Fuel Price',
    'distance': 'Distance',
    'selectStation': 'Select Station',
    'status': 'Status',
    'open': 'Open',
    'closed': 'Closed',
    'reviews': 'Reviews',
    'welcomeBack': 'Welcome back',
    'signIn': 'Sign in',
    'signUp': 'Sign up',
    'email': 'Email address',
    'password': 'Password',
    'rememberMe': 'Remember me',
    'forgotPassword': 'Forgot password?',
    'createAccount': 'Create account',
    'logout': 'Log out',
    'settings': 'Settings',
    'profile': 'Profile',
    'language': 'Language',
    'darkMode': 'Dark Mode',
    'notifications': 'Notifications',
    'nearbyStations': 'Nearby Stations',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort'
  },
  'id': { // Indonesian
    'fuelPrice': 'Harga BBM',
    'distance': 'Jarak',
    'selectStation': 'Pilih SPBU',
    'status': 'Status',
    'open': 'Buka',
    'closed': 'Tutup',
    'reviews': 'Ulasan',
    'welcomeBack': 'Selamat datang kembali',
    'signIn': 'Masuk',
    'signUp': 'Daftar',
    'email': 'Alamat email',
    'password': 'Kata sandi',
    'rememberMe': 'Ingat saya',
    'forgotPassword': 'Lupa kata sandi?',
    'createAccount': 'Buat akun',
    'logout': 'Keluar',
    'settings': 'Pengaturan',
    'profile': 'Profil',
    'language': 'Bahasa',
    'darkMode': 'Mode Gelap',
    'notifications': 'Notifikasi',
    'nearbyStations': 'SPBU Terdekat',
    'search': 'Cari',
    'filter': 'Filter',
    'sort': 'Urutkan'
  },
  // Add more languages as needed
};

export interface I18nOptions {
  defaultLanguage?: string;
  fallbackLanguage?: string;
}

export class I18nService {
  private currentLanguage: string;
  private fallbackLanguage: string;
  
  constructor(options?: I18nOptions) {
    // Get language from the user's country in localStorage
    const userCountry = localStorage.getItem('userCountry');
    const detectedLanguage = userCountry ? (countryLanguageMap[userCountry] || 'en') : 'en';
    
    this.currentLanguage = options?.defaultLanguage || detectedLanguage;
    this.fallbackLanguage = options?.fallbackLanguage || 'en';
  }
  
  translate(key: string, language?: string): string {
    // Use specified language, or current language
    const lang = language || this.currentLanguage;
    
    // Try to get translation in the requested language
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    
    // Fall back to default language
    if (translations[this.fallbackLanguage] && translations[this.fallbackLanguage][key]) {
      return translations[this.fallbackLanguage][key];
    }
    
    // Return the key itself as last resort
    return key;
  }
  
  setLanguage(language: string): void {
    this.currentLanguage = language;
    localStorage.setItem('userLanguage', language);
  }
  
  getLanguage(): string {
    return this.currentLanguage;
  }
  
  getAvailableLanguages(): string[] {
    return Object.keys(translations);
  }
}

// Create and export a singleton instance
export const i18n = new I18nService();

// Shorthand function for translations
export const t = (key: string, language?: string): string => {
  return i18n.translate(key, language);
};
