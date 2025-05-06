
import React, { useState, useEffect } from 'react';
import { Search, Filter, Bell, User, Home, ShoppingBag, MapPin, Settings, Fuel, RefreshCw, AlertCircle } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import Map from '@/components/ui/Map';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { allStations } from "@/data/dummyData";
import { MAPBOX_STYLE, MAP_STYLES } from '@/config/mapbox';
import { useGeolocation } from '@/hooks/use-geolocation';
import StationListItem from '@/components/ui/StationListItem';
import { formatToRupiah } from './MapView';
import { useAuth } from '@/contexts/AuthContext';
import { filterStationsByDistance, DEFAULT_COORDINATES } from '@/services/geocodingService';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import LocationSelector from '@/components/ui/LocationSelector';

const Index = () => {
  const { userLocation, refreshUserLocation } = useAuth();
  const { location, refreshLocation } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const [showTraffic, setShowTraffic] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES.STREETS);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const navigate = useNavigate();
  
  // Track location changes to update map and stations
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);
  const [stationsWithDistance, setStationsWithDistance] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  // Use user's saved location or device location
  useEffect(() => {
    const initializeLocation = async () => {
      setIsLoadingLocation(true);
      
      // Check if we have user location from registration first
      if (userLocation && !userLocation.isLoading && userLocation.coordinates) {
        console.log("Using user's registered location:", userLocation);
        setMapCenter(userLocation.coordinates);
        
        // Filter stations based on user location
        const filteredStations = filterStationsByDistance(
          allStations,
          userLocation.coordinates
        );
        setStationsWithDistance(filteredStations);
        setIsLoadingLocation(false);
      } 
      // Fallback to device geolocation if available
      else if (location && location.coordinates) {
        console.log("Using device geolocation:", location);
        setMapCenter(location.coordinates);
        
        // Filter stations based on device location
        const filteredStations = filterStationsByDistance(
          allStations,
          location.coordinates
        );
        setStationsWithDistance(filteredStations);
        setIsLoadingLocation(false);
      } 
      // Otherwise, use default location (Jakarta)
      else {
        console.log("Using default location (Jakarta)");
        setMapCenter(DEFAULT_COORDINATES);
        
        // Filter stations based on default location
        const filteredStations = filterStationsByDistance(
          allStations,
          DEFAULT_COORDINATES
        );
        setStationsWithDistance(filteredStations);
        
        toast({
          title: "Using default location",
          description: "We couldn't determine your location. Showing Jakarta, Indonesia.",
        });
        
        setIsLoadingLocation(false);
      }
    };
    
    initializeLocation();
  }, [userLocation, location]);

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
  const handleRefreshLocation = () => {
    setIsLoadingLocation(true);
    
    // Try to refresh user's registered location first
    if (userLocation) {
      refreshUserLocation().then(() => {
        setIsLoadingLocation(false);
      }).catch(err => {
        console.error("Failed to refresh user location:", err);
        // Fallback to device location
        refreshLocation();
      });
    } else {
      // If no user location, just refresh device location
      refreshLocation();
    }
  };

  // Gas station image URL
  const gasStationIconUrl = "/lovable-uploads/e7264ee5-ed98-4679-91b4-8f12d183784b.png";

  // Convert stations to map markers - limit to nearest 5
  const markers = filteredStations.slice(0, 5).map(station => ({
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

  // Combine regular markers with agent markers
  const allMarkers = [...markers, ...agentMarkers];

  // Location label from user's registration or device
  const locationLabel = userLocation ? 
    `${userLocation.city}, ${userLocation.country}` : 
    (location ? `${location.city}, ${location.country}` : 'Unknown Location');

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
          <LocationSelector compact={true} />
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
          <Map
            className="h-56 w-full rounded-2xl overflow-hidden"
            interactive={true}
            showTraffic={showTraffic}
            center={mapCenter}
            zoom={13}
            mapStyle={currentMapStyle}
            markers={allMarkers}
            onStyleChange={(style) => setCurrentMapStyle(style)}
            onTrafficToggle={(show) => setShowTraffic(show)}
            initialPitch={60}
            initialBearing={30}
            enable3DBuildings={true}
            onMarkerClick={(index) => {
              // Only navigate to station details if it's a gas station marker
              if (index < markers.length) {
                navigate(`/station/${filteredStations[index].id}`);
              }
            }}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {isLoadingLocation ? 
            'Loading Gas Stations...' : 
            `Nearest Gas Stations in ${userLocation?.city || location?.city || 'your area'}`
          }
        </h2>

        {filteredStations.length === 0 && !isLoadingLocation ? (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <Fuel className="h-10 w-10 mx-auto mb-2 text-orange-500" />
            <p className="text-orange-800 dark:text-orange-300">No gas stations found nearby.</p>
            <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">Try expanding your search or changing location.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoadingLocation ? (
              // Loading placeholders
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl h-40"></div>
              ))
            ) : (
              // Actual station list
              filteredStations.slice(0, 8).map((station, index) => {
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
                    address={`${station.address}, ${userLocation?.city || location?.city || 'Unknown Location'}`}
                    distance={station.distance}
                    price={cheapestFuel ? cheapestFuel.price : "3.29"}
                    rating={station.rating}
                    reviewCount={24}
                    imageUrl={station.imageUrl}
                    delay={index}
                    isOpen={isOpen}
                    openStatus={station.hours ? 
                      `${station.hours.open}:00 - ${station.hours.close}:00` : undefined}
                  />
                );
              })
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
