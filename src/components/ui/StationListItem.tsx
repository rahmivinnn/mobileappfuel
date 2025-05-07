
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Banknote, Fuel, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatToCurrency } from '@/utils/currencyUtils';

interface StationListItemProps {
  id: string;
  name: string;
  address: string;
  distance: string;
  price: string | number;
  rating: number;
  reviewCount?: number;
  imageUrl: string;
  delay?: number;
  isOpen?: boolean;
  openStatus?: string;
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
  openStatus
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
      select: "Select"
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
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-green-100">
              <img
                src="/lovable-uploads/64ee380c-0fd5-4d42-a7f3-04aea8d9c56c.png"
                alt="Gas Station"
                className="w-full h-full object-cover"
              />
            </div>
          )}
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

      <button
        onClick={handleClick}
        className="w-full bg-green-500 text-white py-3 font-medium hover:bg-green-600 transition-colors"
      >
        {labels.select} {name}
      </button>
    </motion.div>
  );
};

export default StationListItem;
