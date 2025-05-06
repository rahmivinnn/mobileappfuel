
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

// Sample countries data - in a real app this would come from an API
const countries = [
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" }
];

// Sample cities by country - in a real app this would come from an API
const citiesByCountry: Record<string, string[]> = {
  "ID": ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"],
  "MY": ["Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh"],
  "SG": ["Singapore"],
  "TH": ["Bangkok", "Chiang Mai", "Phuket", "Pattaya"],
  "US": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  "GB": ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool"],
  "JP": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"],
  "AU": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"]
};

const LocationSelector = ({ compact = false }: { compact?: boolean }) => {
  const { theme } = useTheme();
  const { userLocation, updateLocation } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Set initial values when userLocation changes
  useEffect(() => {
    if (userLocation) {
      const countryCode = countries.find(c => c.name === userLocation.country)?.code || "ID";
      setSelectedCountry(countryCode);
      setSelectedCity(userLocation.city);
      setAvailableCities(citiesByCountry[countryCode] || []);
    } else {
      // Default to Indonesia/Jakarta
      setSelectedCountry("ID");
      setAvailableCities(citiesByCountry["ID"] || []);
      setSelectedCity("Jakarta");
    }
  }, [userLocation]);

  // Update available cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      setAvailableCities(citiesByCountry[selectedCountry] || []);
      if (availableCities.length > 0 && !availableCities.includes(selectedCity)) {
        setSelectedCity(availableCities[0]);
      }
    }
  }, [selectedCountry]);

  // Filter cities based on search query
  const filteredCities = searchQuery
    ? availableCities.filter(city => 
        city.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableCities;

  const handleSaveLocation = () => {
    const countryName = countries.find(c => c.code === selectedCountry)?.name || "Indonesia";
    updateLocation(selectedCity, countryName);
    setOpen(false);
  };

  // Get country name from code
  const getCountryName = (code: string) => {
    return countries.find(c => c.code === code)?.name || code;
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
                {userLocation ? `${userLocation.city}, ${userLocation.country}` : "Select Location"}
              </span>
              <span className="sm:hidden">
                {userLocation ? userLocation.city : "Location"}
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
          {/* Country selection */}
          <div className="grid gap-2">
            <label htmlFor="country" className="text-sm font-medium">
              Country
            </label>
            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
            >
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search for city */}
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
          
          {/* City selection */}
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
                  onClick={() => setSelectedCity(city)}
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
                No cities found. Try another search term.
              </div>
            )}
          </div>
          
          {/* Current selection summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md mt-2">
            <span className="text-sm font-medium">Current selection: </span>
            <span className="text-green-600 dark:text-green-400">
              {selectedCity}, {getCountryName(selectedCountry)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLocation}
            className="bg-green-500 hover:bg-green-600"
          >
            Update Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
