import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Bell, User, Home, ShoppingBag, MapPin, Settings, Fuel, RefreshCw, AlertCircle, Layers, Globe, Satellite, Moon, Box } from 'lucide-react';
import Map from '@/components/ui/Map';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allStations } from "@/data/dummyData";
import { MAPBOX_TOKEN, MAP_STYLES } from '@/config/mapbox';
import { useGeolocation } from '@/hooks/use-geolocation';
import StationListItem from '@/components/ui/StationListItem';
import { formatToCurrency } from '@/utils/currencyUtils';
import { useAuth } from '@/contexts/AuthContext';
import { filterStationsByDistance, DEFAULT_COORDINATES, US_COORDINATES, geocodeLocation, calculateDistance } from '@/services/geocodingService';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import LocationSelector from '@/components/ui/LocationSelector';

// Add global style to disable horizontal scrolling
const globalStyle = document.createElement('style');
globalStyle.innerHTML = `
  body {
    overflow-x: hidden;
    max-width: 100vw;
  }
  ::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(globalStyle);

const Index = () => {
  const { userLocation, refreshUserLocation, updateLocation } = useAuth();
  const { location, refreshLocation } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const [showTraffic, setShowTraffic] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES.STREETS);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const navigate = useNavigate();

  // Track location changes to update map and stations
  const [mapCenter, setMapCenter] = useState(US_COORDINATES); // Default to LA
  const [stationsWithDistance, setStationsWithDistance] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [maxStationsToShow, setMaxStationsToShow] = useState(50); // Show 50 stations
  const [enable3DBuildings, setEnable3DBuildings] = useState(true);

  // Function to update stations based on coordinates
  const updateStationsForCoordinates = useCallback(async (coordinates: {lat: number, lng: number}) => {
    setIsLoadingStations(true);
    try {
      // In a real app, this would be an API call to get stations near coordinates
      // For now, we'll use the filterStationsByDistance function with our dummy data
      const filteredStations = filterStationsByDistance(
        allStations,
        coordinates
      ).slice(0, maxStationsToShow);
      setStationsWithDistance(filteredStations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      toast({
        title: "Error fetching stations",
        description: "Could not get nearby gas stations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStations(false);
    }
  }, [maxStationsToShow]);

  // Handle location selection from LocationSelector
  const handleLocationSelected = useCallback(async (city: string, country: string, coordinates: {lat: number, lng: number}) => {
    setMapCenter(coordinates);
    await updateStationsForCoordinates(coordinates);

    // If city is Los Angeles, make sure it's associated with United States
    if (city.toLowerCase() === "los angeles") {
      updateLocation("Los Angeles", "United States");
    }
  }, [updateStationsForCoordinates, updateLocation]);

  // Use Los Angeles as default location
  useEffect(() => {
    const initializeLocation = async () => {
      setIsLoadingLocation(true);

      // First try to use Los Angeles as default
      try {
        console.log("Setting default location to Los Angeles, United States");
        setMapCenter(US_COORDINATES);
        await updateStationsForCoordinates(US_COORDINATES);

        // Update user's location in Auth context to Los Angeles if not already set
        if (!userLocation || userLocation.city !== "Los Angeles") {
          updateLocation("Los Angeles", "United States");
        }

        setIsLoadingLocation(false);
      } catch (error) {
        console.error("Error setting Los Angeles location:", error);

        // Fall back to user's registered location if available
        if (userLocation && !userLocation.isLoading && userLocation.coordinates) {
          console.log("Using user's registered location:", userLocation);
          setMapCenter(userLocation.coordinates);
          await updateStationsForCoordinates(userLocation.coordinates);
        }
        // Otherwise fall back to device geolocation
        else if (location && location.coordinates) {
          console.log("Using device geolocation:", location);
          setMapCenter(location.coordinates);
          await updateStationsForCoordinates(location.coordinates);
        }

        setIsLoadingLocation(false);
      }
    };

    initializeLocation();
  }, []);

  // Filter stations by search query
  const filteredStations = stationsWithDistance
    .filter(station =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Show map with delay for smoother UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSeeAll = () => {
    navigate('/map');
  };

  // Handle refresh button click
  const handleRefreshLocation = async () => {
    setIsLoadingLocation(true);
    setIsLoadingStations(true);

    try {
      // Default to Los Angeles
      setMapCenter(US_COORDINATES);
      await updateStationsForCoordinates(US_COORDINATES);

      toast({
        title: "Location refreshed",
        description: "Showing updated nearby stations in Los Angeles",
      });
    } catch (error) {
      console.error("Error refreshing location:", error);
      toast({
        title: "Error refreshing location",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLocation(false);
      setIsLoadingStations(false);
    }
  };

  // Gas station image URL - updated to use the Shell Beverly Hills style icon
  const gasStationIconUrl = "/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png";

  // Toggle 3D buildings with enhanced feedback
  const toggle3DBuildings = () => {
    // Toggle state with callback to ensure we use the latest state
    setEnable3DBuildings(prev => {
      const newState = !prev;

      // Show toast notification based on new state
      toast({
        title: newState ? "3D Buildings Enabled" : "3D Buildings Disabled",
        description: newState ? "Showing buildings in 3D view" : "Switched to 2D map view",
        duration: 2000
      });

      return newState;
    });
  };

  // Convert stations to map markers - show all 50 for better visibility
  const markers = filteredStations.slice(0, 50).map(station => ({
    position: {
      lat: station.position.lat,
      lng: station.position.lng
    },
    title: station.name,
    icon: gasStationIconUrl,
    label: "Gas Station"
  }));

  // Add FuelFriendly agents as markers - adjusted based on current location and increased count
  const fuelAgents = mapCenter ? [
    {
      lat: mapCenter.lat + 0.005,
      lng: mapCenter.lng + 0.005,
      name: "Agent John"
    },
    {
      lat: mapCenter.lat - 0.008,
      lng: mapCenter.lng + 0.007,
      name: "Agent Sarah"
    },
    {
      lat: mapCenter.lat - 0.003,
      lng: mapCenter.lng - 0.006,
      name: "Agent Mike"
    },
    {
      lat: mapCenter.lat + 0.009,
      lng: mapCenter.lng - 0.004,
      name: "Agent Lisa"
    },
    {
      lat: mapCenter.lat + 0.002,
      lng: mapCenter.lng + 0.003,
      name: "Agent David"
    },
    {
      lat: mapCenter.lat - 0.006,
      lng: mapCenter.lng - 0.002,
      name: "Agent Emma"
    },
    {
      lat: mapCenter.lat + 0.007,
      lng: mapCenter.lng - 0.007,
      name: "Agent James"
    },
    {
      lat: mapCenter.lat - 0.004,
      lng: mapCenter.lng + 0.009,
      name: "Agent Olivia"
    }
  ] : [];

  // Add FuelFriendly agents as markers with explicit isAgent flag
  const agentMarkers = fuelAgents.map(agent => ({
    position: {
      lat: agent.lat,
      lng: agent.lng
    },
    title: agent.name,
    label: "Fuel Agent",
    isAgent: true // This flag is critical for the marker to be rendered as an agent
  }));

  // Add various points of interest to make the map more interactive
  const pointsOfInterest = mapCenter ? [
    // Restaurants
    {
      lat: mapCenter.lat + 0.003,
      lng: mapCenter.lng - 0.004,
      name: "Cafe Deluxe",
      type: "restaurant"
    },
    {
      lat: mapCenter.lat - 0.006,
      lng: mapCenter.lng - 0.003,
      name: "Burger Express",
      type: "restaurant"
    },
    {
      lat: mapCenter.lat + 0.006,
      lng: mapCenter.lng + 0.008,
      name: "Pizza Palace",
      type: "restaurant"
    },
    // Shops
    {
      lat: mapCenter.lat + 0.007,
      lng: mapCenter.lng + 0.002,
      name: "Mini Market",
      type: "shop"
    },
    {
      lat: mapCenter.lat - 0.005,
      lng: mapCenter.lng + 0.004,
      name: "Convenience Store",
      type: "shop"
    },
    // Parking
    {
      lat: mapCenter.lat - 0.002,
      lng: mapCenter.lng + 0.006,
      name: "Public Parking",
      type: "parking"
    },
    {
      lat: mapCenter.lat + 0.004,
      lng: mapCenter.lng - 0.008,
      name: "Garage Parking",
      type: "parking"
    },
    // ATM
    {
      lat: mapCenter.lat + 0.001,
      lng: mapCenter.lng - 0.007,
      name: "ATM Center",
      type: "atm"
    },
    {
      lat: mapCenter.lat - 0.007,
      lng: mapCenter.lng + 0.001,
      name: "Bank ATM",
      type: "atm"
    },
    // Car Wash
    {
      lat: mapCenter.lat - 0.004,
      lng: mapCenter.lng - 0.005,
      name: "Quick Car Wash",
      type: "carwash"
    },
    // Hotels
    {
      lat: mapCenter.lat + 0.008,
      lng: mapCenter.lng - 0.002,
      name: "Grand Hotel",
      type: "hotel"
    },
    // Hospitals
    {
      lat: mapCenter.lat - 0.009,
      lng: mapCenter.lng - 0.001,
      name: "City Hospital",
      type: "hospital"
    },
    // EV Charging
    {
      lat: mapCenter.lat + 0.002,
      lng: mapCenter.lng + 0.009,
      name: "EV Charging Station",
      type: "charging"
    }
  ] : [];

  // Convert POIs to markers
  const poiMarkers = pointsOfInterest.map(poi => ({
    position: {
      lat: poi.lat,
      lng: poi.lng
    },
    title: poi.name,
    label: poi.type === "restaurant" ? "Restaurant" :
           poi.type === "shop" ? "Shop" :
           poi.type === "parking" ? "Parking" :
           poi.type === "atm" ? "ATM" :
           poi.type === "carwash" ? "Car Wash" :
           poi.type === "hotel" ? "Hotel" :
           poi.type === "hospital" ? "Hospital" :
           poi.type === "charging" ? "EV Charging" : "POI",
    poiType: poi.type
  }));

  // Combine all markers
  const allMarkers = [...markers, ...agentMarkers, ...poiMarkers];

  // Location label from user's registration or device
  const locationLabel = userLocation ?
    `${userLocation.city}, ${userLocation.country}` :
    (location ? `${location.city}, ${location.country}` : 'Los Angeles, United States');

  // Handle map style change with improved logging
  const handleMapStyleChange = (style: string) => {
    console.log("handleMapStyleChange called with style:", style);

    // Update the state with the new style
    setCurrentMapStyle(style);

    // Show toast notification for style change
    toast({
      title: "Map Style Changed",
      description: style.includes('satellite') ?
        "Switched to satellite view" :
        (style.includes('dark') ? "Switched to dark mode" : "Switched to streets view"),
      duration: 2000
    });

    console.log("Map style updated to:", style);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 max-w-[100vw] overflow-hidden">
      {/* Fixed Header - Android 14 Style - Optimized for portrait */}
      <div className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40 w-full">
        <div className="flex justify-between items-center px-3 py-1.5 h-12">
          <Avatar className="w-7 h-7 bg-green-500 border-2 border-green-300">
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600">
              <User className="h-3.5 w-3.5 text-white" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex justify-center">
            {/* Updated logo with proper TypeScript error handling */}
            <img
              src="/lovable-uploads/57aff490-f08a-4205-9ae9-496a32e810e6.png"
              alt="FUELFRIENDLY"
              className="h-5"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                console.error("Failed to load logo image");
                const imgElement = e.target as HTMLImageElement;
                imgElement.onerror = null; // Prevent infinite loop
                imgElement.src = "/lovable-uploads/2b80eff8-6efd-4f15-9213-ed9fe4e0cba9.png"; // Fallback to another logo
              }}
            />
          </div>

          <div className="flex items-center gap-1">
            <div className="rounded-full w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <ThemeToggle />
            </div>
            <button className="rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Search - Even More Compact Android 14 Style */}
        <div className="px-3 py-1 flex items-center gap-1.5 pb-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
              <Search className="h-3 w-3 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search for nearest gas stations..."
              className="h-8 w-full rounded-full bg-gray-100 dark:bg-gray-800 pl-7 pr-2.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            onClick={handleRefreshLocation}
          >
            {isLoadingLocation ?
              <div className="h-3 w-3 border-1.5 border-green-500 border-t-transparent rounded-full animate-spin" /> :
              <Filter className="h-3 w-3 text-green-500" />
            }
          </button>
        </div>
      </div>

      {/* Scrollable Content Area - Set max height and add overflow-y-auto */}
      <div className="content-area overflow-y-auto overflow-x-hidden pb-16">
        {/* Location Indicator - Even More Compact Android 14 Style */}
        <div className="px-3 py-1 bg-green-50 dark:bg-green-900/30 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3 text-green-500" />
            <span className="text-[10px] text-green-800 dark:text-green-300 truncate max-w-[120px]">
              {isLoadingLocation ? 'Loading...' : locationLabel}
            </span>
            <LocationSelector
              compact={true}
              onLocationSelected={handleLocationSelected}
            />
          </div>
          <button
            onClick={handleRefreshLocation}
            className="text-[9px] text-green-600 dark:text-green-400 flex items-center px-1.5 py-0.5 rounded-full hover:bg-green-100 dark:hover:bg-green-800/30"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <div className="h-2 w-2 border-1 border-green-500 border-t-transparent rounded-full animate-spin mr-0.5" />
            ) : (
              <RefreshCw className="h-2 w-2 mr-0.5" />
            )}
            Refresh
          </button>
        </div>

        {/* Map Style Selector - Android 14 Style - More Compact */}
        <div className="px-3 pt-1 pb-0.5">
          <div className="flex justify-between items-center">
            <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
              <Button
                size="sm"
                variant={currentMapStyle === MAP_STYLES.STREETS ? "default" : "outline"}
                className={`rounded-full flex items-center gap-0.5 px-1.5 py-0 h-6 min-w-0 ${currentMapStyle === MAP_STYLES.STREETS ? "bg-green-500 hover:bg-green-600" : "border-gray-200 dark:border-gray-700"}`}
                onClick={() => handleMapStyleChange(MAP_STYLES.STREETS)}
              >
                <Globe className={`h-2.5 w-2.5 ${currentMapStyle === MAP_STYLES.STREETS ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
                <span className="text-[9px] font-medium">Streets</span>
              </Button>

              <Button
                size="sm"
                variant={currentMapStyle === MAP_STYLES.SATELLITE ? "default" : "outline"}
                className={`rounded-full flex items-center gap-0.5 px-1.5 py-0 h-6 min-w-0 ${currentMapStyle === MAP_STYLES.SATELLITE ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-200 dark:border-gray-700"}`}
                onClick={() => handleMapStyleChange(MAP_STYLES.SATELLITE)}
              >
                <Satellite className={`h-2.5 w-2.5 ${currentMapStyle === MAP_STYLES.SATELLITE ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
                <span className="text-[9px] font-medium">Satellite</span>
              </Button>

              <Button
                size="sm"
                variant={currentMapStyle === MAP_STYLES.DARK ? "default" : "outline"}
                className={`rounded-full flex items-center gap-0.5 px-1.5 py-0 h-6 min-w-0 ${currentMapStyle === MAP_STYLES.DARK ? "bg-gray-800 text-white hover:bg-gray-700" : "border-gray-200 dark:border-gray-700"}`}
                onClick={() => handleMapStyleChange(MAP_STYLES.DARK)}
              >
                <Moon className={`h-2.5 w-2.5 ${currentMapStyle === MAP_STYLES.DARK ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
                <span className="text-[9px] font-medium">Dark</span>
              </Button>

              {/* 3D Buildings Toggle */}
              <Button
                size="sm"
                variant={enable3DBuildings ? "default" : "outline"}
                className={`rounded-full flex items-center gap-0.5 px-1.5 py-0 h-6 min-w-0 ${enable3DBuildings ? "bg-purple-600 text-white hover:bg-purple-700" : "border-gray-200 dark:border-gray-700"}`}
                onClick={() => toggle3DBuildings()}
              >
                <Box className={`h-2.5 w-2.5 ${enable3DBuildings ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
                <span className="text-[9px] font-medium">3D</span>
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshLocation}
              disabled={isLoadingStations}
              className="rounded-full h-6 px-1.5 min-w-0 border-gray-200 dark:border-gray-700"
            >
              {isLoadingStations ? (
                <div className="h-2 w-2 border-1 border-current border-t-transparent rounded-full animate-spin mr-0.5" />
              ) : (
                <RefreshCw className="h-2 w-2 mr-0.5" />
              )}
              <span className="text-[9px]">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Map Section - Optimized for portrait mode */}
        <div className="px-3 py-1 relative map-section">
          {/* Enhanced Map Demo Link - More compact */}
          <div className="absolute top-1.5 right-1.5 z-10">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 dark:bg-gray-800/90 border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full shadow-sm h-6 px-1.5"
              onClick={() => navigate('/enhanced-map')}
            >
              <Layers className="h-2.5 w-2.5 mr-0.5" />
              <span className="text-[9px]">Enhanced</span>
            </Button>
          </div>
          {isLoadingLocation && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-lg">
              <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                <div className="h-3.5 w-3.5 border-1.5 border-green-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-medium">Loading map...</span>
              </div>
            </div>
          )}

          <div className={`transition-all duration-300 rounded-lg overflow-hidden ${mapVisible ? 'opacity-100 shadow-sm scale-100' : 'opacity-0 scale-95'}`}>
            {/* Key added to force re-render when style or 3D buildings change */}
            <Map
              key={`map-${currentMapStyle}-3d-${enable3DBuildings ? 'on' : 'off'}`}
              className="h-52 w-full rounded-lg overflow-hidden" // Reduced height for better fit in portrait
              interactive={true}
              showTraffic={showTraffic}
              center={mapCenter}
              zoom={13}
              mapStyle={currentMapStyle}
              markers={allMarkers}
              onStyleChange={handleMapStyleChange}
              onTrafficToggle={(show) => setShowTraffic(show)}
              initialPitch={enable3DBuildings ? 35 : 0} // Further reduced pitch for better portrait view
              initialBearing={15} // Further reduced bearing for better portrait view
              enable3DBuildings={enable3DBuildings}
              onMarkerClick={(index) => {
                // Only navigate to station details if it's a gas station marker
                if (index < markers.length) {
                  navigate(`/station/${filteredStations[index].id}`);
                }
              }}
              hideStyleControls={true} // Hide the style controls in the Map component
            />

            {/* Floating action buttons for map - Ultra compact */}
            <div className="absolute bottom-10 right-4 flex flex-col gap-1 z-10">
              <button
                className="bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700"
                onClick={() => {
                  // Animate map refresh
                  const map = document.querySelector('.mapboxgl-map') as HTMLElement;
                  if (map) {
                    map.style.transform = 'scale(1.01)';
                    setTimeout(() => {
                      map.style.transform = 'scale(1)';
                    }, 200);
                  }
                  handleRefreshLocation();
                }}
              >
                <div className="h-2.5 w-2.5 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* User Location Error Message - Even More compact */}
        {userLocation && userLocation.error && (
          <motion.div
            className="mx-3 my-1 p-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
            <p className="text-[10px] text-red-700 dark:text-red-300 flex-1">
              Unable to load location. Using default.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 dark:border-red-700 text-red-500 h-5 text-[9px] px-1.5 min-w-0"
              onClick={handleRefreshLocation}
            >
              Retry
            </Button>
          </motion.div>
        )}

        {/* Stations List - Android 14 Style - Ultra Compact */}
        <div className="px-3 pt-1 pb-20"> {/* Added bottom padding to prevent content being hidden by nav */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              {isLoadingStations ?
                'Loading Stations...' :
                `${filteredStations.length} Gas Stations`
              }
            </h2>
            <span className="text-[7px] text-green-500 font-normal">Showing {Math.min(filteredStations.length, maxStationsToShow)}</span>
          </div>

          {filteredStations.length === 0 && !isLoadingStations ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-1.5 text-center">
              <Fuel className="h-4 w-4 mx-auto mb-0.5 text-orange-500" />
              <p className="text-orange-800 dark:text-orange-300 text-[9px]">No gas stations found nearby.</p>
              <p className="text-orange-600 dark:text-orange-400 text-[7px] mt-0.5">Try expanding your search or changing location.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {isLoadingStations ? (
                // Loading placeholders
                [...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-16"></div>
                ))
              ) : (
                // Actual station list - show all 50 stations
                filteredStations.slice(0, maxStationsToShow).map((station, index) => {
                  const cheapestFuel = station.fuels && station.fuels.length > 0
                    ? station.fuels.reduce((min, fuel) =>
                        parseFloat(fuel.price) < parseFloat(min.price) ? fuel : min,
                        station.fuels[0])
                    : null;

                  // Use station open status based on time if available
                  const currentHour = new Date().getHours();
                  const isOpen = station.hours ?
                    currentHour >= station.hours.open && currentHour < station.hours.close :
                    true;

                  // Calculate estimated time (assuming average speed of 30 km/h in city)
                  const distanceInKm = parseFloat(station.distance);
                  const estimatedMinutes = Math.round(distanceInKm / 30 * 60);
                  const estimatedTime = estimatedMinutes < 60
                    ? `${estimatedMinutes} min`
                    : `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`;

                  // Extract brand from name (e.g., "Shell Beverly Hills" -> "Shell")
                  const brand = station.name.split(' ')[0];

                  return (
                    <StationListItem
                      key={station.id}
                      id={station.id}
                      name={station.name}
                      address={station.address}
                      distance={station.distance}
                      price={cheapestFuel ? cheapestFuel.price : "3.29"}
                      rating={station.rating}
                      reviewCount={station.reviewCount || 24}
                      delay={index * 0.01} // Minimal delay for faster loading
                      isOpen={isOpen}
                      openStatus={station.hours && station.hours.is24Hours ?
                        "Open 24/7" :
                        (station.hours ? `${station.hours.open}:00 - ${station.hours.close}:00` : undefined)}
                      estimatedTime={estimatedTime}
                      brand={brand}
                      onViewMap={() => {
                        // Center map on this station
                        setMapCenter({
                          lat: station.position.lat,
                          lng: station.position.lng
                        });

                        // Scroll to map section
                        const mapSection = document.querySelector('.map-section');
                        if (mapSection) {
                          mapSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    />
                  );
                })
              )}

              {/* Show load more button if there are more stations to display */}
              {filteredStations.length > maxStationsToShow && (
                <div className="flex justify-center py-1">
                  <Button
                    onClick={() => setMaxStationsToShow(prev => prev + 20)}
                    variant="outline"
                    className="h-5 text-[7px] py-0 px-2"
                  >
                    Load More Stations
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div> {/* End of content-area */}

      {/* Bottom Nav - Fixed Position - Optimized for portrait */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-14 flex items-center justify-around px-0 z-50">
        <div className="flex flex-col items-center text-green-500 w-1/4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 dark:bg-green-900/20">
            <Home className="h-4 w-4" />
          </div>
          <span className="text-[9px] mt-0.5">Home</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 w-1/4" onClick={() => navigate('/orders')}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/50">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <span className="text-[9px] mt-0.5">Orders</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 w-1/4" onClick={() => navigate('/track')}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/50">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="text-[9px] mt-0.5">Track</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 w-1/4" onClick={() => navigate('/settings')}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/50">
            <Settings className="h-4 w-4" />
          </div>
          <span className="text-[9px] mt-0.5">Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
