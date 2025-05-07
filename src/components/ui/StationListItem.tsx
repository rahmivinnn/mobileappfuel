
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Banknote, Fuel, User, Clock, Map, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatToCurrency } from '@/utils/currencyUtils';
import { Button } from './button';

interface StationListItemProps {
  id: string;
  name: string;
  address: string;
  distance: string;
  price: string | number;
  rating: number;
  reviewCount?: number;
  imageUrl?: string; // Make optional since we'll use a consistent icon
  delay?: number;
  isOpen?: boolean;
  openStatus?: string;
  estimatedTime?: string; // Add estimated time to reach
  brand?: string; // Add brand for future API integration
  onViewMap?: () => void; // Callback for View on Map button
}

const StationListItem: React.FC<StationListItemProps> = ({
  id,
  name,
  address,
  distance,
  price,
  rating,
  reviewCount = 24,
  imageUrl,
  delay = 0,
  isOpen = true,
  openStatus,
  estimatedTime,
  brand,
  onViewMap
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/station/${id}`);
  };

  // Improved image handling
  const [imageError, setImageError] = React.useState(false);

  // Use Shell Beverly Hills style gas station image if the provided URL fails to load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    e.currentTarget.src = "/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png"; // Shell Beverly Hills style icon
  };

  // Always use US currency format
  const userCountry = 'US';

  // Get translated labels based on the user's country/language
  // For now, using English universally, but could be expanded for localization
  const getLabels = () => {
    const labels = {
      fuelPrice: "Fuel Price",
      distance: "Distance",
      reviews: "Reviews",
      status: "Status",
      select: "Select",
      viewOnMap: "View on Map",
      estimatedTime: "Est. Time"
    };

    return labels;
  };

  const labels = getLabels();
  const displayStatus = openStatus || (isOpen ? "Open" : "Closed");

  return (
    <motion.div
      className="w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden mb-4 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex p-2 gap-3">
        {/* Consistent 3D Gas Station Icon for all stations */}
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
          <div className="flex items-center justify-center w-full h-full relative">
            <img
              src="/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png"
              alt={name}
              className="w-full h-full object-contain p-1"
            />
            {/* Brand badge if available */}
            {brand && (
              <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 text-xs font-bold shadow-sm">
                {brand}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>

          <div className="flex items-center text-green-500 mt-2 gap-2">
            <Banknote className="h-4 w-4" />
            <p className="text-sm">{labels.fuelPrice}</p>
            <p className="text-right flex-1 font-bold">{formatToCurrency(price, userCountry)}</p>
          </div>

          <div className="flex items-center text-orange-500 mt-1 gap-2">
            <MapPin className="h-4 w-4" />
            <p className="text-sm">{labels.distance}</p>
            <p className="text-right flex-1">{distance} km</p>
          </div>

          {/* Show estimated time if available */}
          {estimatedTime && (
            <div className="flex items-center text-purple-500 mt-1 gap-2">
              <Timer className="h-4 w-4" />
              <p className="text-sm">{labels.estimatedTime}</p>
              <p className="text-right flex-1">{estimatedTime}</p>
            </div>
          )}

          <div className="flex items-center text-blue-500 mt-1 gap-2">
            <Clock className="h-4 w-4" />
            <p className="text-sm">{labels.status}</p>
            <p className={`text-right flex-1 ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {displayStatus}
            </p>
          </div>

          <div className="flex items-center text-yellow-500 mt-1 gap-2">
            <Star className="h-4 w-4" />
            <p className="text-sm">{labels.reviews}</p>
            <p className="text-right flex-1">{rating} ({reviewCount} Reviews)</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex w-full">
        <button
          onClick={handleClick}
          className="flex-1 bg-green-500 text-white py-3 font-medium hover:bg-green-600 transition-colors"
        >
          {labels.select} {name}
        </button>

        {onViewMap && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewMap();
            }}
            className="bg-blue-500 text-white py-3 px-4 font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <Map className="h-4 w-4 mr-2" />
            {labels.viewOnMap}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default StationListItem;
