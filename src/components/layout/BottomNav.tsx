import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, MapPin, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-black/90 backdrop-blur-md w-full max-w-[100vw] overflow-hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="w-full px-2 max-w-[100vw]">
        <div className="flex h-14 items-center justify-between">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 ${isActive ? 'text-green-500' : 'text-gray-500'} transition-all duration-300 hover:text-green-500`
            }
            end
          >
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center space-y-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  animate={{ y: isActive ? -3 : 0, scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Home className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-500'}`} />
                </motion.div>
                <span className={`text-xs ${isActive ? 'text-green-500' : 'text-gray-500'}`}>Home</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 bg-green-500 rounded-full"
                    layoutId="bottomNavIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 ${isActive ? 'text-green-500' : 'text-gray-500'} transition-all duration-300 hover:text-green-500`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center space-y-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  animate={{ y: isActive ? -3 : 0, scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <ShoppingBag className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-500'}`} />
                </motion.div>
                <span className={`text-xs ${isActive ? 'text-green-500' : 'text-gray-500'}`}>My Orders</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 bg-green-500 rounded-full"
                    layoutId="bottomNavIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>

          <NavLink
            to="/track"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 ${isActive ? 'text-green-500' : 'text-gray-500'} transition-all duration-300 hover:text-green-500`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center space-y-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  animate={{ y: isActive ? -3 : 0, scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <MapPin className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-500'}`} />
                </motion.div>
                <span className={`text-xs ${isActive ? 'text-green-500' : 'text-gray-500'}`}>Track</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 bg-green-500 rounded-full"
                    layoutId="bottomNavIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 ${isActive ? 'text-green-500' : 'text-gray-500'} transition-all duration-300 hover:text-green-500`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center space-y-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  animate={{ y: isActive ? -3 : 0, scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Settings className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-500'}`} />
                </motion.div>
                <span className={`text-xs ${isActive ? 'text-green-500' : 'text-gray-500'}`}>Settings</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 bg-green-500 rounded-full"
                    layoutId="bottomNavIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNav;
