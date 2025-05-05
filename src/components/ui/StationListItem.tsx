
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Banknote, Fuel, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatToRupiah } from '@/pages/MapView';

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
  delay = 0
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/station/${id}`);
  };

  // Improved image handling
  const [imageError, setImageError] = React.useState(false);

  // Use gas station image if the provided URL fails to load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    e.currentTarget.src = "/lovable-uploads/af30f547-2e68-4706-8f5d-4a84088b6f19.png";
  };

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
              <Fuel className="h-10 w-10 text-green-500" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          
          <div className="flex items-center text-green-500 mt-2 gap-2">
            <Banknote className="h-4 w-4" />
            <p className="text-sm">Fuel Price</p>
            <p className="text-right flex-1 font-bold">{formatToRupiah(price)}</p>
          </div>
          
          <div className="flex items-center text-orange-500 mt-1 gap-2">
            <MapPin className="h-4 w-4" />
            <p className="text-sm">Distance</p>
            <p className="text-right flex-1">{distance} km</p>
          </div>
          
          <div className="flex items-center text-yellow-500 mt-1 gap-2">
            <Star className="h-4 w-4" />
            <p className="text-sm">Reviews</p>
            <p className="text-right flex-1">{rating} ({reviewCount} Reviews)</p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleClick}
        className="w-full bg-green-500 text-white py-3 font-medium hover:bg-green-600 transition-colors"
      >
        Select {name}
      </button>
    </motion.div>
  );
};

export default StationListItem;
