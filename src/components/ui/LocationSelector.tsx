
import React, { useState, useEffect } from "react";
import { Search, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ui/theme-provider";
import { toast } from "@/hooks/use-toast";
import { geocodeLocation } from "@/services/geocodingService";
import { useGeolocation } from "@/hooks/use-geolocation";

// Import all countries from the useGeolocation hook
import { countryCoordinates } from "@/hooks/use-geolocation";

// Define countries data using the country codes from the `useGeolocation` hook
const COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cape Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Republic of the Congo" },
  { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "The Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
];

// Generate sample cities for each country based on their coordinates
const citiesByCountry: Record<string, string[]> = {};

// Populate cities for each country (in a real app, this would come from an API)
COUNTRIES.forEach(country => {
  const countryData = countryCoordinates[country.code];
  if (countryData) {
    citiesByCountry[country.code] = [countryData.city];
  } else {
    citiesByCountry[country.code] = ["Capital"];
  }
});

interface LocationSelectorProps {
  compact?: boolean;
  onLocationSelected?: (city: string, country: string, coordinates: {lat: number, lng: number}) => void;
}

const LocationSelector = ({ 
  compact = false, 
  onLocationSelected 
}: LocationSelectorProps) => {
  const { theme } = useTheme();
  const { userLocation, updateLocation } = useAuth();
  const { location, setCountry } = useGeolocation();
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  // Set initial values when userLocation changes
  useEffect(() => {
    if (userLocation) {
      // Find country code matching the country name
      const countryCode = COUNTRIES.find(c => c.name === userLocation.country)?.code || "";
      if (countryCode) {
        setSelectedCountry(countryCode);
        setSelectedCity(userLocation.city);
        setAvailableCities(citiesByCountry[countryCode] || []);
      }
    } else if (location) {
      // Use the device location
      const countryCode = COUNTRIES.find(c => c.name === location.country)?.code || "ID";
      setSelectedCountry(countryCode);
      setSelectedCity(location.city);
      setAvailableCities(citiesByCountry[countryCode] || []);
    } else {
      // Default to user's stored country or Indonesia
      const storedCountry = localStorage.getItem('userCountry') || "ID";
      setSelectedCountry(storedCountry);
      setAvailableCities(citiesByCountry[storedCountry] || []);
      setSelectedCity(citiesByCountry[storedCountry]?.[0] || "");
    }
  }, [userLocation, location]);

  // Update available cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      setAvailableCities(citiesByCountry[selectedCountry] || []);
      if (citiesByCountry[selectedCountry]?.length > 0) {
        setSelectedCity(citiesByCountry[selectedCountry][0]);
      }
    }
  }, [selectedCountry]);

  // Filter countries based on search query
  const filteredCountries = countrySearchQuery
    ? COUNTRIES.filter(country => 
        country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()))
    : COUNTRIES;

  // Filter cities based on search query
  const filteredCities = searchQuery
    ? availableCities.filter(city => 
        city.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableCities;

  const handleSaveLocation = async () => {
    setIsLoading(true);
    const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || "Unknown";
    
    try {
      // Get coordinates for the selected location
      const countryData = countryCoordinates[selectedCountry];
      
      if (countryData) {
        // Use the setCountry function from useGeolocation for consistency
        setCountry(selectedCountry, countryName);
        
        // Update location in AuthContext
        await updateLocation(selectedCity || countryData.city, countryName);
        
        // Callback for immediate map update
        if (onLocationSelected) {
          onLocationSelected(
            selectedCity || countryData.city, 
            countryName, 
            countryData.coordinates
          );
        }
        
        toast({
          title: "Location Updated",
          description: `Your location has been set to ${selectedCity || countryData.city}, ${countryName}`,
        });
      } else {
        throw new Error("Country data not found");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Error",
        description: "Could not update location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  // Get country name from code
  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code;
  };

  // Display location
  const displayLocation = () => {
    if (userLocation) {
      return `${userLocation.city}, ${userLocation.country}`;
    }
    if (location) {
      return `${location.city}, ${location.country}`;
    }
    return "Select Location";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={`flex items-center gap-2 ${
            compact ? 'h-8 text-xs px-3' : ''
          } border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800`}
        >
          {compact ? (
            <MapPin className="h-3 w-3 text-green-500" />
          ) : (
            <>
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline">
                {displayLocation()}
              </span>
              <span className="sm:hidden">
                {userLocation ? userLocation.city : (location ? location.city : "Location")}
              </span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-500" />
            Select Your Location
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Country search */}
          <div className="grid gap-2">
            <label htmlFor="country-search" className="text-sm font-medium">
              Country
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="country-search"
                placeholder="Search for a country..."
                className="pl-10"
                value={countrySearchQuery}
                onChange={(e) => setCountrySearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Country selection */}
          <div className="grid gap-2 max-h-40 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  className={`
                    p-2 rounded-md cursor-pointer flex items-center gap-2
                    ${
                      selectedCountry === country.code
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                  onClick={() => {
                    setSelectedCountry(country.code);
                    setCountrySearchQuery(""); // Clear search after selection
                  }}
                >
                  {selectedCountry === country.code && (
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  )}
                  <span className={selectedCountry === country.code ? "ml-0" : "ml-4"}>
                    {country.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-2 text-muted-foreground">
                No countries found. Try another search term.
              </div>
            )}
          </div>
          
          {/* City selection */}
          {selectedCountry && (
            <>
              <div className="grid gap-2">
                <label htmlFor="city-search" className="text-sm font-medium">
                  City
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="city-search"
                    placeholder="Search for a city..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <div
                      key={city}
                      className={`
                        p-2 rounded-md cursor-pointer flex items-center gap-2
                        ${
                          selectedCity === city
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                      onClick={() => {
                        setSelectedCity(city);
                      }}
                    >
                      {selectedCity === city && (
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                      <span className={selectedCity === city ? "ml-0" : "ml-4"}>
                        {city}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-muted-foreground">
                    No cities found. Try another search term or select capital city.
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Current selection summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md mt-2">
            <span className="text-sm font-medium">Current selection: </span>
            <span className="text-green-600 dark:text-green-400">
              {selectedCity || (countryCoordinates[selectedCountry]?.city || "Capital")}, {getCountryName(selectedCountry)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLocation}
            className="bg-green-500 hover:bg-green-600"
            disabled={isLoading || !selectedCountry}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Location"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
