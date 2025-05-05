
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Banknote, Fuel, User } from 'lucide-react';
import { motion } from 'framer-motion';

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

// Currency mappings for different countries
const currencyFormats: Record<string, (price: string | number) => string> = {
  'ID': (price) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  },
  'MY': (price) => `RM ${Number(price).toFixed(2)}`,
  'SG': (price) => `S$ ${Number(price).toFixed(2)}`,
  'TH': (price) => `฿ ${Number(price).toFixed(2)}`,
  'PH': (price) => `₱ ${Number(price).toFixed(2)}`,
  'VN': (price) => `₫ ${Number(price).toLocaleString()}`,
  'US': (price) => `$ ${Number(price).toFixed(2)}`,
  'GB': (price) => `£ ${Number(price).toFixed(2)}`,
  'AU': (price) => `A$ ${Number(price).toFixed(2)}`,
  'JP': (price) => `¥ ${Number(price).toLocaleString()}`,
  'CA': (price) => `C$ ${Number(price).toFixed(2)}`,
  'DE': (price) => `€ ${Number(price).toFixed(2)}`,
  'FR': (price) => `€ ${Number(price).toFixed(2)}`,
  'IT': (price) => `€ ${Number(price).toFixed(2)}`,
  'ES': (price) => `€ ${Number(price).toFixed(2)}`,
  'BR': (price) => `R$ ${Number(price).toFixed(2)}`,
  'MX': (price) => `MX$ ${Number(price).toFixed(2)}`,
  'IN': (price) => `₹ ${Number(price).toFixed(2)}`,
  'CN': (price) => `¥ ${Number(price).toLocaleString()}`,
  'RU': (price) => `₽ ${Number(price).toLocaleString()}`,
  'ZA': (price) => `R ${Number(price).toFixed(2)}`,
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
    e.currentTarget.src = "/lovable-uploads/f01d03f8-3174-4828-bdcd-196b636f0b6f.png";
  };
  
  // Get user's country from localStorage to determine currency format
  const userCountry = localStorage.getItem('userCountry') || 'ID';
  
  // Format price according to country currency
  const formatPrice = (price: string | number): string => {
    const formatter = currencyFormats[userCountry] || currencyFormats['ID']; // Default to IDR
    return formatter(price);
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
              <img 
                src="/lovable-uploads/f01d03f8-3174-4828-bdcd-196b636f0b6f.png"
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
            <p className="text-sm">Fuel Price</p>
            <p className="text-right flex-1 font-bold">{formatPrice(price)}</p>
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
