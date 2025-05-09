
import React from 'react';
import { ArrowLeft, Bell, Menu, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export interface HeaderProps {
  title?: string;
  showBack?: boolean;  // Changed from backButton to showBack
  onBackClick?: () => void;
  showSettings?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  transparent?: boolean;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,  // Changed from backButton to showBack
  onBackClick,
  showSettings = false,
  showNotifications = false,
  showMenu = false,
  transparent = false,
  children,
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.header
      className={`px-4 py-3 flex items-center justify-between w-full ${
        transparent ? 'bg-transparent' : 'bg-white dark:bg-gray-900'
      } ${!transparent && 'border-b border-gray-200 dark:border-gray-800'} z-10`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center flex-1">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        {showMenu && (
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {title && (
          <h1 className="text-lg font-semibold dark:text-white truncate ml-0">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {children}
        
        {showNotifications && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 bg-red-500 rounded-full w-2 h-2"></span>
          </Button>
        )}
        
        {showSettings && (
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
