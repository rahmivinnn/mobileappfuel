
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Welcome: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Top green wave */}
      <div className="absolute top-0 left-0 w-full h-1/4 bg-green-500 rounded-b-[50%] z-0" />
      
      {/* Bottom green section with hexagon pattern */}
      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-green-500 z-0">
        <div className="absolute bottom-0 left-0 w-full h-full opacity-30">
          <img 
            src="/lovable-uploads/0c368b73-df56-4e77-94c3-14691cdc22b7.png" 
            alt="Hexagon Pattern" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Content container */}
      <div className="flex-1 flex flex-col items-center justify-between z-10 px-6 py-12">
        <div />
        
        {/* Logo and brand section */}
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo circle */}
          <motion.div 
            className="w-24 h-24 rounded-full border-2 border-green-500 flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          >
            <img 
              src="/lovable-uploads/44c35d38-14ee-46b9-8302-0944a264f34e.png" 
              alt="FuelFriendly Logo" 
              className="w-16 h-16"
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
              className="h-6"
            />
          </motion.div>
        </motion.div>
        
        {/* Buttons container */}
        <motion.div 
          className="w-full max-w-xs space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Log In button */}
          <Link to="/sign-in" className="block w-full">
            <Button 
              className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium text-base"
            >
              Log In
            </Button>
          </Link>
          
          {/* Sign Up button */}
          <Link to="/sign-up" className="block w-full">
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-full border-2 border-green-500 bg-transparent text-green-500 hover:bg-green-500/10 font-medium text-base"
            >
              Sign up
            </Button>
          </Link>
          
          {/* Or divider */}
          <div className="flex items-center justify-center my-2">
            <span className="text-gray-400 text-sm">Or</span>
          </div>
          
          {/* Google button */}
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-full border-2 border-green-500 bg-transparent text-white hover:bg-green-500/10 font-medium text-base flex items-center justify-center gap-2"
            onClick={() => {
              // Google login logic would go here
              console.log('Google login clicked');
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Continue with Google
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
