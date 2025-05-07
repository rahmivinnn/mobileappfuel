import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/ui/Map';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { allStations } from '@/data/dummyData';
import { motion, AnimatePresence } from 'framer-motion';
import { MAPBOX_STYLE, MAP_STYLES } from '@/config/mapbox';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle, User, RefreshCw, Globe, Layers, Box } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { filterStationsByDistance, DEFAULT_COORDINATES } from '@/services/geocodingService';
import { toast } from '@/hooks/use-toast';
import LocationSelector from '@/components/ui/LocationSelector';
import { formatToCurrency } from '@/utils/currencyUtils';

// Helper function for dollar formatting (we're now using the utility function instead)
export const formatToRupiah = (number: number | string) => {
  return formatToCurrency(number, 'US');
};

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const { userLocation, refreshUserLocation } = useAuth();
  const { location, loading: locationLoading, error: locationError, permissionDenied, refreshLocation } = useGeolocation();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentMapStyle, setCurrentMapStyle] = useState(MAPBOX_STYLE);
  const [stationsWithDistance, setStationsWithDistance] = useState(allStations);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);
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
      );
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
  }, []);

  // Handle location selection from LocationSelector
  const handleLocationSelected = useCallback(async (city: string, country: string, coordinates: {lat: number, lng: number}) => {
    setMapCenter(coordinates);
    await updateStationsForCoordinates(coordinates);

    toast({
      title: "Map Updated",
      description: `Showing gas stations near ${city}, ${country}`,
    });
  }, [updateStationsForCoordinates]);

  // Initialize location based on user profile or device
  useEffect(() => {
    const initializeLocation = async () => {
      setIsLoadingLocation(true);

      // Check if we have user location from registration first
      if (userLocation && !userLocation.isLoading && userLocation.coordinates) {
        console.log("MapView: Using user's registered location:", userLocation);
        setMapCenter(userLocation.coordinates);
        await updateStationsForCoordinates(userLocation.coordinates);
        setIsLoadingLocation(false);
      }
      // Fallback to device geolocation if available
      else if (location && location.coordinates) {
        console.log("MapView: Using device geolocation:", location);
        setMapCenter(location.coordinates);
        await updateStationsForCoordinates(location.coordinates);
        setIsLoadingLocation(false);
      }
      // Otherwise, use default location (Jakarta)
      else {
        console.log("MapView: Using default location (Jakarta)");
        setMapCenter(DEFAULT_COORDINATES);
        await updateStationsForCoordinates(DEFAULT_COORDINATES);

        toast({
          title: "Using default location",
          description: "We couldn't determine your location. Showing Jakarta, Indonesia.",
        });

        setIsLoadingLocation(false);
      }
    };

    initializeLocation();
  }, [userLocation, location, updateStationsForCoordinates]);

  // Handle refresh button click
  const handleRefreshLocation = async () => {
    setIsLoadingLocation(true);
    setIsLoadingStations(true);

    try {
      // Try to refresh user's registered location first
      if (userLocation) {
        await refreshUserLocation();
        if (userLocation.coordinates) {
          setMapCenter(userLocation.coordinates);
          await updateStationsForCoordinates(userLocation.coordinates);
        }
      } else {
        // If no user location, just refresh device location
        await refreshLocation();
        if (location && location.coordinates) {
          setMapCenter(location.coordinates);
          await updateStationsForCoordinates(location.coordinates);
        } else {
          // If all fails, use default coordinates
          setMapCenter(DEFAULT_COORDINATES);
          await updateStationsForCoordinates(DEFAULT_COORDINATES);
        }
      }

      toast({
        title: "Location refreshed",
        description: "Showing updated nearby stations",
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

  // Sort stations by distance
  const sortedStations = [...stationsWithDistance].sort((a, b) =>
    parseFloat(a.distance) - parseFloat(b.distance)
  );

  // Gas station image URL - updated to use the Shell Beverly Hills style icon
  const gasStationIconUrl = "/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png";

  // Convert stations to map markers
  const markers = sortedStations.slice(0, 10).map(station => ({
    position: {
      lat: station.position.lat,
      lng: station.position.lng
    },
    title: station.name,
    icon: gasStationIconUrl,
    label: "Gas Station"
  }));

  // Add FuelFriendly agents as markers - based on current location with more agents
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
      lat: mapCenter.lat + 0.007,
      lng: mapCenter.lng - 0.009,
      name: "Agent Mike"
    },
    {
      lat: mapCenter.lat - 0.004,
      lng: mapCenter.lng - 0.006,
      name: "Agent Lisa"
    },
    {
      lat: mapCenter.lat + 0.009,
      lng: mapCenter.lng + 0.003,
      name: "Agent David"
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

  // Combine regular markers with agent markers
  const allMarkers = [...markers, ...agentMarkers];

  const handleMarkerClick = (index: number) => {
    // Only navigate to station details if it's a gas station marker
    if (index < markers.length) {
      const stationId = sortedStations[index].id;
      setSelectedStationId(stationId);
      navigate(`/station/${stationId}`);
    } else {
      // Handle agent marker click if needed
      console.log("Agent clicked:", agentMarkers[index - markers.length].title);
    }
  };

  // Handle map style change
  const handleStyleChange = (style: string) => {
    setCurrentMapStyle(style);
  };

  // Handle traffic toggle
  const handleTrafficToggle = (show: boolean) => {
    setShowTraffic(show);
  };

  // Toggle 3D buildings
  const toggle3DBuildings = () => {
    setEnable3DBuildings(prev => !prev);
    toast({
      title: enable3DBuildings ? "3D Buildings Disabled" : "3D Buildings Enabled",
      description: enable3DBuildings ? "Switched to 2D view" : "Showing buildings in 3D",
    });
  };

  // Location label from user's registration or device
  const locationLabel = userLocation ?
    `${userLocation.city}, ${userLocation.country}` :
    (location ? `${location.city}, ${location.country}` : 'Unknown Location');

  return (
    <div className="min-h-screen bg-background">
      <Header title="Temukan SPBU" showBack={true} />

      {/* Map Style and 3D Controls */}
      <div className="mx-4 my-2 flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={currentMapStyle === MAP_STYLES.STREETS ? "default" : "outline"}
            className={currentMapStyle === MAP_STYLES.STREETS ? "bg-green-500 hover:bg-green-600" : ""}
            onClick={() => handleStyleChange(MAP_STYLES.STREETS)}
          >
            <Globe className="h-3 w-3 mr-1" />
            Streets
          </Button>
          <Button
            size="sm"
            variant={currentMapStyle === MAP_STYLES.SATELLITE ? "default" : "outline"}
            className={currentMapStyle === MAP_STYLES.SATELLITE ? "bg-green-500 hover:bg-green-600" : ""}
            onClick={() => handleStyleChange(MAP_STYLES.SATELLITE)}
          >
            <Globe className="h-3 w-3 mr-1" />
            Satellite
          </Button>
          <Button
            size="sm"
            variant={currentMapStyle === MAP_STYLES.DARK ? "default" : "outline"}
            className={currentMapStyle === MAP_STYLES.DARK ? "bg-green-500 hover:bg-green-600" : ""}
            onClick={() => handleStyleChange(MAP_STYLES.DARK)}
          >
            <Globe className="h-3 w-3 mr-1" />
            Dark
          </Button>

          {/* 3D Buildings Toggle */}
          <Button
            size="sm"
            variant={enable3DBuildings ? "default" : "outline"}
            className={enable3DBuildings ? "bg-purple-500 hover:bg-purple-600" : ""}
            onClick={toggle3DBuildings}
          >
            <Box className="h-3 w-3 mr-1" />
            3D Buildings
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <LocationSelector
            compact={true}
            onLocationSelected={handleLocationSelected}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshLocation}
            disabled={isLoadingLocation || isLoadingStations}
          >
            {(isLoadingLocation || isLoadingStations) ? (
              <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Location indicator */}
      <div className="m-4 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="text-green-500 h-4 w-4 mr-2" />
          <p className="text-sm text-green-800 dark:text-green-300">
            {isLoadingLocation ? 'Loading location...' : locationLabel}
          </p>
        </div>
        <div className="text-xs text-green-600 dark:text-green-400">
          {isLoadingStations ? (
            <div className="flex items-center">
              <div className="h-3 w-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-1" />
              <span>Loading stations...</span>
            </div>
          ) : (
            <span>{sortedStations.length} stations found</span>
          )}
        </div>
      </div>

      {permissionDenied && (
        <motion.div
          className="m-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center space-x-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="text-red-500 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">Location permission denied. Please enable location services for better results.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500 text-red-500 hover:bg-red-500/20"
            onClick={handleRefreshLocation}
          >
            Retry
          </Button>
        </motion.div>
      )}

      <motion.div
        className="h-[calc(100vh-8rem)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Map
          className="w-full h-full"
          zoom={13}
          center={mapCenter}
          markers={allMarkers}
          onMarkerClick={handleMarkerClick}
          showBackButton={true}
          interactive={true}
          showTraffic={showTraffic}
          mapStyle={currentMapStyle}
          onStyleChange={handleStyleChange}
          onTrafficToggle={handleTrafficToggle}
          enable3DBuildings={enable3DBuildings}
          initialPitch={enable3DBuildings ? 60 : 0}
        />

        {(isLoadingLocation || isLoadingStations) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-sm">
              {isLoadingLocation ? 'Finding your location...' : 'Loading gas stations...'}
            </span>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedStationId && (
          <motion.div
            className="absolute bottom-20 left-4 right-4 bg-white dark:bg-black/80 backdrop-blur-md rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-black dark:text-white font-semibold">
                  {sortedStations.find(s => s.id === selectedStationId)?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {sortedStations.find(s => s.id === selectedStationId)?.distance} km away
                </p>
              </div>
              <motion.button
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/station/${selectedStationId}`)}
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default MapView;
