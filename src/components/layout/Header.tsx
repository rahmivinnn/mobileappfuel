
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BellIcon, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <div className="flex items-center">
          {showBack ? (
            <motion.button
              onClick={goBack}
              className="mr-2 rounded-full p-1.5 text-foreground/80 hover:bg-muted transition-all duration-300"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.div>
            </motion.button>
          ) : (
            <motion.button
              className="mr-2 rounded-full p-1.5 text-foreground/80 hover:bg-muted transition-all duration-300"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            </motion.button>
          )}
          {title && (
            <motion.h1
              className="text-lg font-medium"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {title}
            </motion.h1>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            className="relative rounded-full p-1.5 text-foreground/80 hover:bg-muted transition-all duration-300"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <BellIcon className="h-5 w-5" />
            <motion.span
              className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-500"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
