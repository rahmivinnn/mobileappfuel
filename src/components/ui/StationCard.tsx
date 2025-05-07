
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Banknote, Fuel, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatToCurrency } from '@/utils/currencyUtils';

interface StationCardProps {
  id: string;
  name: string;
  address: string;
  distance: string;
  price?: string;
  rating: number;
  image?: string;
  imageUrl?: string;
  openStatus?: string;
  isOpen?: boolean;
}

const StationCard: React.FC<StationCardProps> = ({
  id,
  name,
  address,
  distance,
  price,
  rating,
  image,
  imageUrl,
  openStatus,
  isOpen = true
}) => {
  const navigate = useNavigate();

  // Use the provided image or default to the Shell Beverly Hills style gas station image
  const displayImage = imageUrl || image || "/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png";
  const displayStatus = openStatus || (isOpen ? "Open" : "Closed");

  // Get the lowest price from the first fuel type if price is not provided
  const displayPrice = price || "3.50";  // Default price in USD if not provided

  // Always use US country for currency display
  const userCountry = 'US';

  const handleStationClick = () => {
    navigate(`/station/${id}`);
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png";
  };

  // Determine language based on country for labels
  const getLabels = () => {
    const labels = {
      fuelPrice: "Fuel Price",
      distance: "Distance",
      select: "Select Station"
    };

    return labels;
  };

  const labels = getLabels();

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-800 flex flex-col"
      onClick={handleStationClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
            <Star className="text-yellow-500 w-3 h-3 mr-1" />
            <span className="text-xs text-yellow-700 dark:text-yellow-400">{rating}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <Banknote className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700 dark:text-green-400">{labels.fuelPrice}</span>
            <span className="ml-auto font-bold text-gray-900 dark:text-white">{formatToCurrency(displayPrice, userCountry)}</span>
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{labels.distance}</span>
            <span className="ml-auto text-gray-700 dark:text-gray-300">{distance} km</span>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <span className={`ml-auto ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {displayStatus}
            </span>
          </div>
        </div>

        {displayImage && (
          <div className="mt-3 h-24 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={displayImage}
              alt={name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
        )}
      </div>

      <button
        className="mt-auto w-full bg-green-500 text-white py-2 font-medium hover:bg-green-600 transition-colors"
      >
        {labels.select}
      </button>
    </motion.div>
  );
};

export default StationCard;
