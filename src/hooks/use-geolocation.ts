import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/config/mapbox';
import { toast } from '@/hooks/use-toast';

interface Location {
  country: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Default coordinates for countries - expanded to include more countries
const countryCoordinates: Record<string, {city: string, coordinates: {lat: number, lng: number}}> = {
  // ... keep existing code (countries definitions) 
  
  // Additional countries to reach 195
  'AF': { // Afghanistan
    city: 'Kabul',
    coordinates: { lat: 34.5553, lng: 69.2075 }
  },
  'AL': { // Albania
    city: 'Tirana',
    coordinates: { lat: 41.3275, lng: 19.8187 }
  },
  'DZ': { // Algeria
    city: 'Algiers',
    coordinates: { lat: 36.7538, lng: 3.0588 }
  },
  'AD': { // Andorra
    city: 'Andorra la Vella',
    coordinates: { lat: 42.5063, lng: 1.5218 }
  },
  'AO': { // Angola
    city: 'Luanda',
    coordinates: { lat: -8.8383, lng: 13.2344 }
  },
  'AG': { // Antigua and Barbuda
    city: 'Saint John\'s',
    coordinates: { lat: 17.1175, lng: -61.8456 }
  },
  'AM': { // Armenia
    city: 'Yerevan',
    coordinates: { lat: 40.1792, lng: 44.4991 }
  },
  'AT': { // Austria
    city: 'Vienna',
    coordinates: { lat: 48.2082, lng: 16.3738 }
  },
  'AZ': { // Azerbaijan
    city: 'Baku',
    coordinates: { lat: 40.4093, lng: 49.8671 }
  },
  'BS': { // Bahamas
    city: 'Nassau',
    coordinates: { lat: 25.0343, lng: -77.3963 }
  },
  'BH': { // Bahrain
    city: 'Manama',
    coordinates: { lat: 26.2285, lng: 50.5860 }
  },
  'BD': { // Bangladesh
    city: 'Dhaka',
    coordinates: { lat: 23.8103, lng: 90.4125 }
  },
  'BB': { // Barbados
    city: 'Bridgetown',
    coordinates: { lat: 13.1132, lng: -59.5988 }
  },
  'BY': { // Belarus
    city: 'Minsk',
    coordinates: { lat: 53.9045, lng: 27.5615 }
  },
  'BE': { // Belgium
    city: 'Brussels',
    coordinates: { lat: 50.8503, lng: 4.3517 }
  },
  'BZ': { // Belize
    city: 'Belmopan',
    coordinates: { lat: 17.2514, lng: -88.7690 }
  },
  'BJ': { // Benin
    city: 'Porto-Novo',
    coordinates: { lat: 6.4969, lng: 2.6283 }
  },
  'BT': { // Bhutan
    city: 'Thimphu',
    coordinates: { lat: 27.4728, lng: 89.6390 }
  },
  'BO': { // Bolivia
    city: 'La Paz',
    coordinates: { lat: -16.4897, lng: -68.1193 }
  },
  'BA': { // Bosnia and Herzegovina
    city: 'Sarajevo',
    coordinates: { lat: 43.8563, lng: 18.4131 }
  },
  'BW': { // Botswana
    city: 'Gaborone',
    coordinates: { lat: -24.6282, lng: 25.9231 }
  },
  'BN': { // Brunei
    city: 'Bandar Seri Begawan',
    coordinates: { lat: 4.9031, lng: 114.9398 }
  },
  'BG': { // Bulgaria
    city: 'Sofia',
    coordinates: { lat: 42.6977, lng: 23.3219 }
  },
  'BF': { // Burkina Faso
    city: 'Ouagadougou',
    coordinates: { lat: 12.3714, lng: -1.5197 }
  },
  'BI': { // Burundi
    city: 'Bujumbura',
    coordinates: { lat: -3.3822, lng: 29.3644 }
  },
  'CV': { // Cape Verde
    city: 'Praia',
    coordinates: { lat: 14.9315, lng: -23.5126 }
  },
  'KH': { // Cambodia
    city: 'Phnom Penh',
    coordinates: { lat: 11.5564, lng: 104.9282 }
  },
  'CM': { // Cameroon
    city: 'Yaoundé',
    coordinates: { lat: 3.8480, lng: 11.5021 }
  },
  'CF': { // Central African Republic
    city: 'Bangui',
    coordinates: { lat: 4.3947, lng: 18.5582 }
  },
  'TD': { // Chad
    city: 'N\'Djamena',
    coordinates: { lat: 12.1348, lng: 15.0557 }
  },
  'CL': { // Chile
    city: 'Santiago',
    coordinates: { lat: -33.4489, lng: -70.6693 }
  },
  'CO': { // Colombia
    city: 'Bogotá',
    coordinates: { lat: 4.7110, lng: -74.0721 }
  },
  'KM': { // Comoros
    city: 'Moroni',
    coordinates: { lat: -11.7172, lng: 43.2473 }
  },
  'CG': { // Republic of the Congo
    city: 'Brazzaville',
    coordinates: { lat: -4.2634, lng: 15.2429 }
  },
  'CD': { // Democratic Republic of the Congo
    city: 'Kinshasa',
    coordinates: { lat: -4.4419, lng: 15.2663 }
  },
  'CR': { // Costa Rica
    city: 'San José',
    coordinates: { lat: 9.9281, lng: -84.0907 }
  },
  'CI': { // Côte d'Ivoire
    city: 'Yamoussoukro',
    coordinates: { lat: 6.8276, lng: -5.2893 }
  },
  'HR': { // Croatia
    city: 'Zagreb',
    coordinates: { lat: 45.8150, lng: 15.9819 }
  },
  'CU': { // Cuba
    city: 'Havana',
    coordinates: { lat: 23.1136, lng: -82.3666 }
  },
  'CY': { // Cyprus
    city: 'Nicosia',
    coordinates: { lat: 35.1856, lng: 33.3823 }
  },
  'CZ': { // Czech Republic
    city: 'Prague',
    coordinates: { lat: 50.0755, lng: 14.4378 }
  },
  'DK': { // Denmark
    city: 'Copenhagen',
    coordinates: { lat: 55.6761, lng: 12.5683 }
  },
  'DJ': { // Djibouti
    city: 'Djibouti',
    coordinates: { lat: 11.5886, lng: 43.1452 }
  },
  'DM': { // Dominica
    city: 'Roseau',
    coordinates: { lat: 15.3009, lng: -61.3876 }
  },
  'DO': { // Dominican Republic
    city: 'Santo Domingo',
    coordinates: { lat: 18.4861, lng: -69.9312 }
  },
  'EC': { // Ecuador
    city: 'Quito',
    coordinates: { lat: -0.1807, lng: -78.4678 }
  },
  'EG': { // Egypt
    city: 'Cairo',
    coordinates: { lat: 30.0444, lng: 31.2357 }
  },
  'SV': { // El Salvador
    city: 'San Salvador',
    coordinates: { lat: 13.6929, lng: -89.2182 }
  },
  'GQ': { // Equatorial Guinea
    city: 'Malabo',
    coordinates: { lat: 3.7523, lng: 8.7742 }
  },
  'ER': { // Eritrea
    city: 'Asmara',
    coordinates: { lat: 15.3229, lng: 38.9251 }
  },
  'EE': { // Estonia
    city: 'Tallinn',
    coordinates: { lat: 59.4370, lng: 24.7536 }
  },
  'SZ': { // Eswatini
    city: 'Mbabane',
    coordinates: { lat: -26.3054, lng: 31.1367 }
  },
  'ET': { // Ethiopia
    city: 'Addis Ababa',
    coordinates: { lat: 9.0320, lng: 38.7469 }
  },
  'FJ': { // Fiji
    city: 'Suva',
    coordinates: { lat: -18.1416, lng: 178.4419 }
  },
  'FI': { // Finland
    city: 'Helsinki',
    coordinates: { lat: 60.1699, lng: 24.9384 }
  },
  'GA': { // Gabon
    city: 'Libreville',
    coordinates: { lat: 0.4162, lng: 9.4673 }
  },
  'GM': { // The Gambia
    city: 'Banjul',
    coordinates: { lat: 13.4549, lng: -16.5790 }
  },
  'GE': { // Georgia
    city: 'Tbilisi',
    coordinates: { lat: 41.7151, lng: 44.8271 }
  },
  'GH': { // Ghana
    city: 'Accra',
    coordinates: { lat: 5.6037, lng: -0.1870 }
  },
  'GR': { // Greece
    city: 'Athens',
    coordinates: { lat: 37.9838, lng: 23.7275 }
  },
  'GD': { // Grenada
    city: 'St. George\'s',
    coordinates: { lat: 12.0564, lng: -61.7485 }
  },
  'GT': { // Guatemala
    city: 'Guatemala City',
    coordinates: { lat: 14.6349, lng: -90.5069 }
  },
  'GN': { // Guinea
    city: 'Conakry',
    coordinates: { lat: 9.6412, lng: -13.5784 }
  },
  'GW': { // Guinea-Bissau
    city: 'Bissau',
    coordinates: { lat: 11.8636, lng: -15.5978 }
  },
  'GY': { // Guyana
    city: 'Georgetown',
    coordinates: { lat: 6.8013, lng: -58.1553 }
  },
  'HT': { // Haiti
    city: 'Port-au-Prince',
    coordinates: { lat: 18.5944, lng: -72.3074 }
  },
  'HN': { // Honduras
    city: 'Tegucigalpa',
    coordinates: { lat: 14.0723, lng: -87.1921 }
  },
  'HU': { // Hungary
    city: 'Budapest',
    coordinates: { lat: 47.4979, lng: 19.0402 }
  },
  'IS': { // Iceland
    city: 'Reykjavík',
    coordinates: { lat: 64.1466, lng: -21.9426 }
  },
  'IE': { // Ireland
    city: 'Dublin',
    coordinates: { lat: 53.3498, lng: -6.2603 }
  },
  'IL': { // Israel
    city: 'Jerusalem',
    coordinates: { lat: 31.7683, lng: 35.2137 }
  },
  'JM': { // Jamaica
    city: 'Kingston',
    coordinates: { lat: 18.0179, lng: -76.8099 }
  },
  'JO': { // Jordan
    city: 'Amman',
    coordinates: { lat: 31.9454, lng: 35.9284 }
  },
  'KZ': { // Kazakhstan
    city: 'Nur-Sultan',
    coordinates: { lat: 51.1605, lng: 71.4704 }
  },
  'KE': { // Kenya
    city: 'Nairobi',
    coordinates: { lat: -1.2921, lng: 36.8219 }
  },
  'KI': { // Kiribati
    city: 'South Tarawa',
    coordinates: { lat: 1.3290, lng: 172.9794 }
  },
  'KW': { // Kuwait
    city: 'Kuwait City',
    coordinates: { lat: 29.3759, lng: 47.9774 }
  },
  'KG': { // Kyrgyzstan
    city: 'Bishkek',
    coordinates: { lat: 42.8746, lng: 74.5698 }
  },
  'LA': { // Laos
    city: 'Vientiane',
    coordinates: { lat: 17.9757, lng: 102.6331 }
  },
  'LV': { // Latvia
    city: 'Riga',
    coordinates: { lat: 56.9496, lng: 24.1052 }
  },
  'LB': { // Lebanon
    city: 'Beirut',
    coordinates: { lat: 33.8938, lng: 35.5018 }
  },
  'LS': { // Lesotho
    city: 'Maseru',
    coordinates: { lat: -29.3142, lng: 27.4833 }
  },
  'LR': { // Liberia
    city: 'Monrovia',
    coordinates: { lat: 6.2907, lng: -10.7605 }
  },
  'LY': { // Libya
    city: 'Tripoli',
    coordinates: { lat: 32.8872, lng: 13.1913 }
  },
  'LI': { // Liechtenstein
    city: 'Vaduz',
    coordinates: { lat: 47.1410, lng: 9.5209 }
  },
  'LT': { // Lithuania
    city: 'Vilnius',
    coordinates: { lat: 54.6872, lng: 25.2797 }
  },
  'LU': { // Luxembourg
    city: 'Luxembourg City',
    coordinates: { lat: 49.6116, lng: 6.1319 }
  },
  'MG': { // Madagascar
    city: 'Antananarivo',
    coordinates: { lat: -18.8792, lng: 47.5079 }
  },
  'MW': { // Malawi
    city: 'Lilongwe',
    coordinates: { lat: -13.9626, lng: 33.7741 }
  },
  'MV': { // Maldives
    city: 'Malé',
    coordinates: { lat: 4.1755, lng: 73.5093 }
  },
  'ML': { // Mali
    city: 'Bamako',
    coordinates: { lat: 12.6392, lng: -8.0029 }
  },
  'MT': { // Malta
    city: 'Valletta',
    coordinates: { lat: 35.8989, lng: 14.5146 }
  },
  'MH': { // Marshall Islands
    city: 'Majuro',
    coordinates: { lat: 7.1164, lng: 171.1855 }
  },
  'MR': { // Mauritania
    city: 'Nouakchott',
    coordinates: { lat: 18.0735, lng: -15.9582 }
  },
  'MU': { // Mauritius
    city: 'Port Louis',
    coordinates: { lat: -20.1609, lng: 57.5012 }
  },
  'MD': { // Moldova
    city: 'Chișinău',
    coordinates: { lat: 47.0105, lng: 28.8638 }
  },
  'MC': { // Monaco
    city: 'Monaco',
    coordinates: { lat: 43.7384, lng: 7.4246 }
  },
  'MN': { // Mongolia
    city: 'Ulaanbaatar',
    coordinates: { lat: 47.8864, lng: 106.9057 }
  },
  'ME': { // Montenegro
    city: 'Podgorica',
    coordinates: { lat: 42.4304, lng: 19.2594 }
  },
  'MA': { // Morocco
    city: 'Rabat',
    coordinates: { lat: 33.9716, lng: -6.8498 }
  },
  'MZ': { // Mozambique
    city: 'Maputo',
    coordinates: { lat: -25.9692, lng: 32.5732 }
  },
  'MM': { // Myanmar
    city: 'Naypyidaw',
    coordinates: { lat: 19.7633, lng: 96.0785 }
  },
  'NA': { // Namibia
    city: 'Windhoek',
    coordinates: { lat: -22.5609, lng: 17.0658 }
  },
  'NR': { // Nauru
    city: 'Yaren',
    coordinates: { lat: -0.5477, lng: 166.9209 }
  },
  'NP': { // Nepal
    city: 'Kathmandu',
    coordinates: { lat: 27.7172, lng: 85.3240 }
  },
  'NL': { // Netherlands
    city: 'Amsterdam',
    coordinates: { lat: 52.3676, lng: 4.9041 }
  },
  'NI': { // Nicaragua
    city: 'Managua',
    coordinates: { lat: 12.1149, lng: -86.2362 }
  },
  'NE': { // Niger
    city: 'Niamey',
    coordinates: { lat: 13.5117, lng: 2.1251 }
  },
  'NG': { // Nigeria
    city: 'Abuja',
    coordinates: { lat: 9.0765, lng: 7.3986 }
  },
  'NO': { // Norway
    city: 'Oslo',
    coordinates: { lat: 59.9139, lng: 10.7522 }
  },
  'OM': { // Oman
    city: 'Muscat',
    coordinates: { lat: 23.5880, lng: 58.3829 }
  },
  'PK': { // Pakistan
    city: 'Islamabad',
    coordinates: { lat: 33.6844, lng: 73.0479 }
  },
  'PW': { // Palau
    city: 'Ngerulmud',
    coordinates: { lat: 7.5005, lng: 134.6241 }
  },
  'PS': { // Palestine
    city: 'Ramallah',
    coordinates: { lat: 31.9038, lng: 35.2034 }
  },
  'PA': { // Panama
    city: 'Panama City',
    coordinates: { lat: 8.9936, lng: -79.5199 }
  },
  'PG': { // Papua New Guinea
    city: 'Port Moresby',
    coordinates: { lat: -9.4438, lng: 147.1803 }
  },
  'PY': { // Paraguay
    city: 'Asunción',
    coordinates: { lat: -25.2637, lng: -57.5759 }
  },
  'PE': { // Peru
    city: 'Lima',
    coordinates: { lat: -12.0464, lng: -77.0428 }
  },
  'PL': { // Poland
    city: 'Warsaw',
    coordinates: { lat: 52.2297, lng: 21.0122 }
  },
  'PT': { // Portugal
    city: 'Lisbon',
    coordinates: { lat: 38.7223, lng: -9.1393 }
  },
  'QA': { // Qatar
    city: 'Doha',
    coordinates: { lat: 25.2854, lng: 51.5310 }
  },
  'RO': { // Romania
    city: 'Bucharest',
    coordinates: { lat: 44.4268, lng: 26.1025 }
  },
  'RW': { // Rwanda
    city: 'Kigali',
    coordinates: { lat: -1.9441, lng: 30.0619 }
  },
  'KN': { // Saint Kitts and Nevis
    city: 'Basseterre',
    coordinates: { lat: 17.3026, lng: -62.7177 }
  },
  'LC': { // Saint Lucia
    city: 'Castries',
    coordinates: { lat: 14.0101, lng: -60.9875 }
  },
  'VC': { // Saint Vincent and the Grenadines
    city: 'Kingstown',
    coordinates: { lat: 13.1558, lng: -61.2273 }
  },
  'WS': { // Samoa
    city: 'Apia',
    coordinates: { lat: -13.8333, lng: -171.7667 }
  },
  'SM': { // San Marino
    city: 'San Marino',
    coordinates: { lat: 43.9424, lng: 12.4578 }
  },
  'ST': { // Sao Tome and Principe
    city: 'São Tomé',
    coordinates: { lat: 0.3301, lng: 6.7273 }
  },
  'SA': { // Saudi Arabia
    city: 'Riyadh',
    coordinates: { lat: 24.7136, lng: 46.6753 }
  },
  'SN': { // Senegal
    city: 'Dakar',
    coordinates: { lat: 14.6937, lng: -17.4441 }
  },
  'RS': { // Serbia
    city: 'Belgrade',
    coordinates: { lat: 44.7866, lng: 20.4489 }
  },
  'SC': { // Seychelles
    city: 'Victoria',
    coordinates: { lat: -4.6191, lng: 55.4513 }
  },
  'SL': { // Sierra Leone
    city: 'Freetown',
    coordinates: { lat: 8.4849, lng: -13.2301 }
  },
  'SK': { // Slovakia
    city: 'Bratislava',
    coordinates: { lat: 48.1486, lng: 17.1077 }
  },
  'SI': { // Slovenia
    city: 'Ljubljana',
    coordinates: { lat: 46.0569, lng: 14.5058 }
  },
  'SB': { // Solomon Islands
    city: 'Honiara',
    coordinates: { lat: -9.4438, lng: 159.9498 }
  },
  'SO': { // Somalia
    city: 'Mogadishu',
    coordinates: { lat: 2.0469, lng: 45.3182 }
  },
  'SS': { // South Sudan
    city: 'Juba',
    coordinates: { lat: 4.8594, lng: 31.5713 }
  },
  'LK': { // Sri Lanka
    city: 'Colombo',
    coordinates: { lat: 6.9271, lng: 79.8612 }
  },
  'SD': { // Sudan
    city: 'Khartoum',
    coordinates: { lat: 15.5007, lng: 32.5599 }
  },
  'SR': { // Suriname
    city: 'Paramaribo',
    coordinates: { lat: 5.8520, lng: -55.2038 }
  },
  'SE': { // Sweden
    city: 'Stockholm',
    coordinates: { lat: 59.3293, lng: 18.0686 }
  },
  'CH': { // Switzerland
    city: 'Bern',
    coordinates: { lat: 46.9480, lng: 7.4474 }
  },
  'SY': { // Syria
    city: 'Damascus',
    coordinates: { lat: 33.5138, lng: 36.2765 }
  },
  'TJ': { // Tajikistan
    city: 'Dushanbe',
    coordinates: { lat: 38.5598, lng: 68.7870 }
  },
  'TZ': { // Tanzania
    city: 'Dodoma',
    coordinates: { lat: -6.1630, lng: 35.7516 }
  },
  'TL': { // Timor-Leste
    city: 'Dili',
    coordinates: { lat: -8.5536, lng: 125.5783 }
  },
  'TG': { // Togo
    city: 'Lomé',
    coordinates: { lat: 6.1375, lng: 1.2123 }
  },
  'TO': { // Tonga
    city: 'Nukuʻalofa',
    coordinates: { lat: -21.1393, lng: -175.2048 }
  },
  'TT': { // Trinidad and Tobago
    city: 'Port of Spain',
    coordinates: { lat: 10.6596, lng: -61.5078 }
  },
  'TN': { // Tunisia
    city: 'Tunis',
    coordinates: { lat: 36.8065, lng: 10.1815 }
  },
  'TR': { // Turkey
    city: 'Ankara',
    coordinates: { lat: 39.9334, lng: 32.8597 }
  },
  'TM': { // Turkmenistan
    city: 'Ashgabat',
    coordinates: { lat: 37.9601, lng: 58.3261 }
  },
  'TV': { // Tuvalu
    city: 'Funafuti',
    coordinates: { lat: -8.5211, lng: 179.1983 }
  },
  'UG': { // Uganda
    city: 'Kampala',
    coordinates: { lat: 0.3476, lng: 32.5825 }
  },
  'UA': { // Ukraine
    city: 'Kyiv',
    coordinates: { lat: 50.4501, lng: 30.5234 }
  },
  'UY': { // Uruguay
    city: 'Montevideo',
    coordinates: { lat: -34.9011, lng: -56.1915 }
  },
  'UZ': { // Uzbekistan
    city: 'Tashkent',
    coordinates: { lat: 41.2995, lng: 69.2401 }
  },
  'VU': { // Vanuatu
    city: 'Port Vila',
    coordinates: { lat: -17.7334, lng: 168.3221 }
  },
  'VA': { // Vatican City
    city: 'Vatican City',
    coordinates: { lat: 41.9029, lng: 12.4534 }
  },
  'VE': { // Venezuela
    city: 'Caracas',
    coordinates: { lat: 10.4806, lng: -66.9036 }
  },
  'YE': { // Yemen
    city: 'Sana\'a',
    coordinates: { lat: 15.3694, lng: 44.1910 }
  },
  'ZM': { // Zambia
    city: 'Lusaka',
    coordinates: { lat: -15.3875, lng: 28.3228 }
  },
  'ZW': { // Zimbabwe
    city: 'Harare',
    coordinates: { lat: -17.8252, lng: 31.0335 }
  }
};

export const useGeolocation = () => {
  // Get user's country from localStorage if available
  const storedCountry = localStorage.getItem('userCountry') || '';
  const storedCountryName = localStorage.getItem('userCountryName') || '';
  
  // Initialize with the stored country or default to user's detected location
  const defaultCoords = storedCountry && countryCoordinates[storedCountry] 
    ? countryCoordinates[storedCountry].coordinates 
    : { lat: 0, lng: 0 }; // Default to center of map if no stored country
  
  const [location, setLocation] = useState<Location | null>(storedCountry ? {
    country: storedCountryName,
    city: countryCoordinates[storedCountry]?.city || '',
    coordinates: defaultCoords
  } : null);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getUserLocation = async () => {
    try {
      console.log("Attempting to get user location...");
      
      // If there's a selected country, prioritize that over browser geolocation
      const userCountry = localStorage.getItem('userCountry');
      
      if (userCountry && countryCoordinates[userCountry]) {
        const countryData = countryCoordinates[userCountry];
        const countryName = localStorage.getItem('userCountryName') || userCountry;
        
        console.log(`Using selected country: ${countryName}`);
        
        setLocation({
          country: countryName,
          city: countryData.city,
          coordinates: countryData.coordinates
        });
        
        toast({
          title: "Location set",
          description: `${countryData.city}, ${countryName}`,
        });
        
        setLoading(false);
        return;
      }
      
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }
      
      // Request location with high accuracy and longer timeout (15 seconds)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (err) => {
            // Handle permission denied specifically
            if (err.code === 1) { // 1 = PERMISSION_DENIED
              console.warn("Geolocation permission denied");
              setPermissionDenied(true);
            }
            reject(err);
          }, 
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log("Location obtained successfully:", latitude, longitude);

      // Use Mapbox Geocoding API to get location details
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
        );

        if (!response.ok) {
          throw new Error(`Geocoding API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
          throw new Error("No location data found");
        }
        
        const features = data.features;
        
        // Find country in context
        const countryFeature = features.find((f: any) => f.place_type.includes('country')) || 
                              features[0].context?.find((ctx: any) => ctx.id.startsWith('country'));
        const cityFeature = features.find((f: any) => f.place_type.includes('place')) ||
                            features[0].context?.find((ctx: any) => ctx.id.startsWith('place'));

        // Get country code from the country feature
        const countryCode = countryFeature?.short_code?.toUpperCase() || '';
        const country = countryFeature?.text || 'Unknown';
        const city = cityFeature?.text || 'Unknown';

        console.log("Location details:", { country, city, countryCode });
        
        // If we got a country code, store it
        if (countryCode) {
          localStorage.setItem('userCountry', countryCode);
          localStorage.setItem('userCountryName', country);
        }

        setLocation({
          country,
          city,
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        });
        
        toast({
          title: "Location detected",
          description: `${city}, ${country}`,
        });
      } catch (geocodeError) {
        console.error("Geocoding error:", geocodeError);
        // Still set coordinates even if geocoding fails
        setLocation({
          country: 'Unknown',
          city: 'Unknown',
          coordinates: {
            lat: latitude,
            lng: longitude
          }
        });
      }
    } catch (err: any) {
      console.error("Geolocation error:", err);
      setError(err.message || "Failed to get location");
      
      // Show specific message for permission denied
      if (permissionDenied) {
        toast({
          title: "Location Permission Denied",
          description: "Using your default country location.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Location Error",
          description: "Using your default country location.",
          variant: "destructive"
        });
      }
      
      // Use the user's selected country or default to current IP location
      const userCountry = localStorage.getItem('userCountry');
      const countryName = localStorage.getItem('userCountryName');
      
      if (userCountry && countryCoordinates[userCountry]) {
        const defaultData = countryCoordinates[userCountry];
        
        setLocation({
          country: countryName || 'Unknown',
          city: defaultData.city,
          coordinates: defaultData.coordinates
        });
      } else {
        // Try to get location based on IP address using fetch
        try {
          fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
              const countryCode = data.country_code;
              if (countryCode && countryCoordinates[countryCode]) {
                // Store the country info
                localStorage.setItem('userCountry', countryCode);
                localStorage.setItem('userCountryName', data.country_name);
                
                // Set location based on IP detection
                setLocation({
                  country: data.country_name,
                  city: countryCoordinates[countryCode].city,
                  coordinates: countryCoordinates[countryCode].coordinates
                });
                
                toast({
                  title: "Location detected from IP",
                  description: `${countryCoordinates[countryCode].city}, ${data.country_name}`,
                });
              } else {
                // Default to a central position
                setLocation({
                  country: 'Global',
                  city: 'World',
                  coordinates: { lat: 0, lng: 0 }
                });
              }
            })
            .catch(error => {
              console.error("IP detection failed:", error);
              // Default to a central position
              setLocation({
                country: 'Global',
                city: 'World',
                coordinates: { lat: 0, lng: 0 }
              });
            });
        } catch (ipError) {
          console.error("IP detection error:", ipError);
          // Default to a central position
          setLocation({
            country: 'Global',
            city: 'World',
            coordinates: { lat: 0, lng: 0 }
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, [permissionDenied]);

  // Function to manually retry getting location
  const refreshLocation = () => {
    setLoading(true);
    setError(null);
    getUserLocation();
  };

  // Function to manually set country
  const setCountry = (countryCode: string, countryName: string) => {
    if (countryCoordinates[countryCode]) {
      const countryData = countryCoordinates[countryCode];
      
      localStorage.setItem('userCountry', countryCode);
      localStorage.setItem('userCountryName', countryName);
      
      setLocation({
        country: countryName,
        city: countryData.city,
        coordinates: countryData.coordinates
      });
      
      toast({
        title: "Location updated",
        description: `${countryData.city}, ${countryName}`,
      });
      
      return true;
    }
    return false;
  };

  return { 
    location, 
    error, 
    loading, 
    permissionDenied, 
    refreshLocation,
    setCountry
  };
};
