
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

  // Gas station image URL - updated to use the new 3D gas station image
  const gasStationIconUrl = "/lovable-uploads/8bb583f1-3cc3-48b8-9f8b-904bfcfe84ef.png";

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

  // Add FuelFriendly agents as markers - adjusted based on current location
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
    }
  ] : [];

  // Add FuelFriendly agents as markers
  const agentMarkers = fuelAgents.map(agent => ({
    position: {
      lat: agent.lat,
      lng: agent.lng
    },
    title: agent.name,
    icon: "/lovable-uploads/1bc06a60-0463-4f47-abde-502bc408852e.png",
    label: "FuelFriendly Agent",
    isAgent: true
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
    // Shops
    {
      lat: mapCenter.lat + 0.007,
      lng: mapCenter.lng + 0.002,
      name: "Mini Market",
      type: "shop"
    },
    // Parking
    {
      lat: mapCenter.lat - 0.002,
      lng: mapCenter.lng + 0.006,
      name: "Public Parking",
      type: "parking"
    },
    // ATM
    {
      lat: mapCenter.lat + 0.001,
      lng: mapCenter.lng - 0.007,
      name: "ATM Center",
      type: "atm"
    },
    // Car Wash
    {
      lat: mapCenter.lat - 0.004,
      lng: mapCenter.lng - 0.005,
      name: "Quick Car Wash",
      type: "carwash"
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
           poi.type === "carwash" ? "Car Wash" : "POI",
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex justify-between items-center px-4 py-2">
          <Avatar className="w-10 h-10 bg-green-500 border-2 border-green-300">
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600">
              <User className="h-5 w-5 text-white" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex justify-center">
            <img
              src="/lovable-uploads/57aff490-f08a-4205-9ae9-496a32e810e6.png"
              alt="FUELFRIENDLY"
              className="h-7"
            />
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Bell className="h-6 w-6" />
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 flex items-center space-x-3 pb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search for nearest gas stations..."
              className="h-12 w-full rounded-full bg-gray-100 dark:bg-gray-800 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            onClick={handleRefreshLocation}
          >
            {isLoadingLocation ?
              <div className="h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> :
              <Filter className="h-5 w-5 text-green-500" />
            }
          </button>
        </div>
      </div>

      {/* Location Indicator */}
      <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-800 dark:text-green-300 mr-2">
            {isLoadingLocation ? 'Loading location...' : locationLabel}
          </span>
          <LocationSelector
            compact={true}
            onLocationSelected={handleLocationSelected}
          />
        </div>
        <button
          onClick={handleRefreshLocation}
          className="text-xs text-green-600 dark:text-green-400 flex items-center"
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <div className="h-3 w-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Refresh
        </button>
      </div>

      {/* Map Style Selector - With 3D buildings toggle */}
      <div className="px-4 pt-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={currentMapStyle === MAP_STYLES.STREETS ? "default" : "outline"}
              className={`rounded-full flex items-center gap-1 px-3 py-1 ${currentMapStyle === MAP_STYLES.STREETS ? "bg-green-500 hover:bg-green-600" : "border-gray-300"}`}
              onClick={() => {
                console.log("Changing to Streets style");
                handleMapStyleChange(MAP_STYLES.STREETS);
              }}
            >
              <Globe className={`h-3.5 w-3.5 ${currentMapStyle === MAP_STYLES.STREETS ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">Streets</span>
            </Button>

            <Button
              size="sm"
              variant={currentMapStyle === MAP_STYLES.SATELLITE ? "default" : "outline"}
              className={`rounded-full flex items-center gap-1 px-3 py-1 ${currentMapStyle === MAP_STYLES.SATELLITE ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-300"}`}
              onClick={() => {
                console.log("Changing to Satellite style");
                handleMapStyleChange(MAP_STYLES.SATELLITE);
              }}
            >
              <Satellite className={`h-3.5 w-3.5 ${currentMapStyle === MAP_STYLES.SATELLITE ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">Satellite</span>
            </Button>

            <Button
              size="sm"
              variant={currentMapStyle === MAP_STYLES.DARK ? "default" : "outline"}
              className={`rounded-full flex items-center gap-1 px-3 py-1 ${currentMapStyle === MAP_STYLES.DARK ? "bg-gray-800 text-white hover:bg-gray-700" : "border-gray-300"}`}
              onClick={() => {
                console.log("Changing to Dark style");
                handleMapStyleChange(MAP_STYLES.DARK);
              }}
            >
              <Moon className={`h-3.5 w-3.5 ${currentMapStyle === MAP_STYLES.DARK ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">Dark</span>
            </Button>

            {/* 3D Buildings Toggle */}
            <Button
              size="sm"
              variant={enable3DBuildings ? "default" : "outline"}
              className={`rounded-full flex items-center gap-1 px-3 py-1 ${enable3DBuildings ? "bg-purple-600 text-white hover:bg-purple-700" : "border-gray-300"}`}
              onClick={() => {
                console.log("Toggling 3D buildings from Index page");
                toggle3DBuildings();
              }}
            >
              <Box className={`h-3.5 w-3.5 ${enable3DBuildings ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              <span className="text-xs font-medium">3D</span>
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshLocation}
            disabled={isLoadingStations}
            className="rounded-full"
          >
            {isLoadingStations ? (
              <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Map Section */}
      <div className="px-4 py-2 relative">
        {isLoadingLocation && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-2xl">
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-xl flex items-center space-x-3 shadow-lg">
              <div className="h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading map...</span>
            </div>
          </div>
        )}

        <div className={`transition-all duration-1000 rounded-2xl overflow-hidden ${mapVisible ? 'opacity-100 shadow-lg scale-100' : 'opacity-0 scale-95'}`}>
          {/* Key added to force re-render when style or 3D buildings change */}
          <Map
            key={`map-${currentMapStyle}-3d-${enable3DBuildings ? 'on' : 'off'}`}
            className="h-56 w-full rounded-2xl overflow-hidden"
            interactive={true}
            showTraffic={showTraffic}
            center={mapCenter}
            zoom={13}
            mapStyle={currentMapStyle}
            markers={allMarkers}
            onStyleChange={handleMapStyleChange}
            onTrafficToggle={(show) => setShowTraffic(show)}
            initialPitch={enable3DBuildings ? 60 : 0}
            initialBearing={30}
            enable3DBuildings={enable3DBuildings}
            onMarkerClick={(index) => {
              // Only navigate to station details if it's a gas station marker
              if (index < markers.length) {
                navigate(`/station/${filteredStations[index].id}`);
              }
            }}
            hideStyleControls={true} // Hide the style controls in the Map component
          />
        </div>
      </div>

      {/* User Location Error Message */}
      {userLocation && userLocation.error && (
        <motion.div
          className="mx-4 my-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">
            Unable to load your registered location. Using default or device location instead.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 dark:border-red-700 text-red-500"
            onClick={handleRefreshLocation}
          >
            Retry
          </Button>
        </motion.div>
      )}

      {/* Stations List */}
      <div className="px-4 pt-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
          <span>
            {isLoadingStations ?
              'Loading Gas Stations...' :
              `${filteredStations.length} Gas Stations in Los Angeles`
            }
          </span>
          <span className="text-sm text-green-500 font-normal">Showing {Math.min(filteredStations.length, maxStationsToShow)} stations</span>
        </h2>

        {filteredStations.length === 0 && !isLoadingStations ? (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <Fuel className="h-10 w-10 mx-auto mb-2 text-orange-500" />
            <p className="text-orange-800 dark:text-orange-300">No gas stations found nearby.</p>
            <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">Try expanding your search or changing location.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoadingStations ? (
              // Loading placeholders
              [...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl h-40"></div>
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

                return (
                  <StationListItem
                    key={station.id}
                    id={station.id}
                    name={station.name}
                    address={station.address}
                    distance={station.distance}
                    price={cheapestFuel ? cheapestFuel.price : "3.29"}
                    rating={station.rating}
                    reviewCount={24}
                    imageUrl={station.imageUrl}
                    delay={index}
                    isOpen={isOpen}
                    openStatus={station.hours && station.hours.is24Hours ?
                      "Open 24/7" :
                      (station.hours ? `${station.hours.open}:00 - ${station.hours.close}:00` : undefined)}
                  />
                );
              })
            )}

            {/* Show load more button if there are more stations to display */}
            {filteredStations.length > maxStationsToShow && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => setMaxStationsToShow(prev => prev + 20)}
                  variant="outline"
                >
                  Load More Stations
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 flex items-center justify-around">
        <div className="flex flex-col items-center text-green-500">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xs mt-1">My Orders</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <MapPin className="h-6 w-6" />
          <span className="text-xs mt-1">Track Order</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
