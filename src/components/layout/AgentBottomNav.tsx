
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, Users, DollarSign, Settings, 
  MessageCircle, Bell 
} from 'lucide-react';

const AgentBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  const navItems = [
    { icon: <Home className="h-6 w-6" />, label: 'Dashboard', path: '/agent/dashboard' },
    { icon: <Users className="h-6 w-6" />, label: 'Customers', path: '/agent/customers' },
    { icon: <DollarSign className="h-6 w-6" />, label: 'Earnings', path: '/agent/earnings' },
    { icon: <MessageCircle className="h-6 w-6" />, label: 'Chat', path: '/chat' },
    { icon: <Settings className="h-6 w-6" />, label: 'Profile', path: '/agent/profile' },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/agent/dashboard' && path === '/agent/dashboard') {
      return true;
    }
    if (itemPath !== '/agent/dashboard' && path.startsWith(itemPath)) {
      return true;
    }
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-50">
      <div className="flex h-full max-w-md mx-auto">
        {navItems.map((item, index) => (
          <div 
            key={item.path}
            className="flex-1 flex flex-col items-center justify-center relative cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            {isActive(item.path) && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-green-500"
                layoutId="agent-nav-indicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            <div 
              className={`text-${isActive(item.path) ? 'green-500' : 'foreground/60'} flex flex-col items-center`}
            >
              {React.cloneElement(item.icon, { 
                className: `h-5 w-5 ${isActive(item.path) ? 'text-green-500' : 'text-foreground/60'}`
              })}
              <span className="text-[10px] mt-1">{item.label}</span>
            </div>
            
            {(item.label === 'Chat') && (
              <motion.div 
                className="absolute top-3 right-4 h-2 w-2 rounded-full bg-green-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentBottomNav;
