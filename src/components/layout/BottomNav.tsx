
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, MapPin, Settings } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-black/90 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-md">
        <div className="flex h-16 items-center justify-between">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 ${isActive ? 'text-green-500' : 'text-gray-500'} transition-colors hover:text-green-500`
            }
            end
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </NavLink>
          
          <NavLink 
            to="/orders" 
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 ${isActive ? 'text-green-500' : 'text-gray-500'} transition-colors hover:text-green-500`
            }
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs">My Orders</span>
          </NavLink>
          
          <NavLink 
            to="/track" 
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 ${isActive ? 'text-green-500' : 'text-gray-500'} transition-colors hover:text-green-500`
            }
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Track</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex flex-col items-center space-y-1 ${isActive ? 'text-green-500' : 'text-gray-500'} transition-colors hover:text-green-500`
            }
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;

