
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/components/ui/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

// Add global style to disable scrolling
const globalStyle = document.createElement('style');
globalStyle.innerHTML = `
  body {
    overflow: hidden;
  }
  ::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(globalStyle);

const Welcome = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const isMobile = useIsMobile();
  
  // Function to skip the welcome screen and go directly to home
  const goToHome = () => {
    navigate('/');
    toast({
      title: "Welcome to FuelFriendly",
      description: "Find the nearest gas stations and fuel services",
    });
  };
  
  return (
    <>
      <div 
        className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'} flex flex-col overflow-hidden max-w-md mx-auto`} 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Top wave - adjusted for portrait mode */}
        <div className="absolute top-0 left-0 w-full h-[15%] bg-green-500 rounded-b-[50%] z-0" />
        
        {/* Bottom green section with hexagon pattern - adjusted for portrait mode */}
        <div className="absolute bottom-0 left-0 w-full h-[15%] bg-green-500 z-0">
          <div className="absolute bottom-0 left-0 w-full h-full opacity-30">
            <img 
              src="/lovable-uploads/0c368b73-df56-4e77-94c3-14691cdc22b7.png" 
              alt="Hexagon Pattern" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-between z-10 px-6 py-16">
          {/* Theme toggle in top right corner */}
          <div className="absolute top-6 right-6 z-20">
            <ThemeToggle />
          </div>
          
          <div className="w-full max-w-md mx-auto">
            {/* Logo and brand section */}
            <motion.div 
              className="flex flex-col items-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo circle */}
              <motion.div 
                className="w-32 h-32 rounded-full border-2 border-green-500 flex items-center justify-center mb-6 bg-white/10 backdrop-blur-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              >
                <img 
                  src="/lovable-uploads/44c35d38-14ee-46b9-8302-0944a264f34e.png" 
                  alt="FuelFriendly Logo" 
                  className="w-20 h-20"
                />
              </motion.div>
              
              {/* Brand name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <img 
                  src="/lovable-uploads/2b80eff8-6efd-4f15-9213-ed9fe4e0cba9.png" 
                  alt="FUELFRIENDLY" 
                  className="h-8"
                />
              </motion.div>
            </motion.div>
            
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="text-center">
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Welcome to FuelFriendly</h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>Your smart fueling companion</p>
              </div>
              
              <div className="space-y-4 max-w-md mx-auto">
                <Button 
                  onClick={() => navigate('/signup')}
                  className="w-full h-14 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium text-lg"
                >
                  Create an Account
                </Button>
                
                <Button 
                  onClick={() => navigate('/signin')}
                  variant="outline" 
                  className={`w-full h-14 rounded-full border-2 border-green-500 ${isDarkMode ? 'bg-transparent text-white hover:bg-green-500/10' : 'bg-transparent text-green-500 hover:bg-green-500/10'} font-medium text-lg`}
                >
                  I already have an account
                </Button>

                <Button 
                  onClick={goToHome}
                  variant="ghost" 
                  className={`w-full h-10 ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'} font-medium`}
                >
                  Skip and explore the app
                </Button>
              </div>
              
              <div className="text-center">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  By continuing, you agree to our{' '}
                  <Link to="/terms" className="text-green-500 hover:text-green-400">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-green-500 hover:text-green-400">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
