
import * as React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = React.useState(0);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  React.useEffect(() => {
    // Handle splash screen timing with animated progress
    const duration = 5000; // 5 seconds total
    const interval = 50; // Update every 50ms
    const step = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const nextValue = prev + step;
        if (nextValue >= 100) {
          clearInterval(timer);
          setTimeout(() => onFinish(), 200);
          return 100;
        }
        return nextValue;
      });
    }, interval);
    
    return () => {
      clearInterval(timer);
    };
  }, [onFinish]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-green-500 overflow-hidden">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      
      {/* Animated hexagon patterns - adjusted to be closer to edges */}
      <div className="absolute top-0 left-0 w-full h-1/5">
        <motion.div
          className="w-full h-full relative overflow-hidden"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.img 
            src="/lovable-uploads/b9b9af0d-f75b-4949-89ca-178f3f449be9.png" 
            alt="Hexagon Pattern" 
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 1, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
      
      {/* Bottom animated hexagon pattern - adjusted to be closer to edge */}
      <div className="absolute bottom-0 left-0 w-full h-1/5">
        <motion.div
          className="w-full h-full relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.img 
            src="/lovable-uploads/0c368b73-df56-4e77-94c3-14691cdc22b7.png" 
            alt="Hexagon Pattern" 
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.05, 1], rotate: [0, -1, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
      
      {/* Particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              opacity: [null, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      {/* Centered animations with elements moving from top and bottom */}
      <div className="z-10 flex flex-col items-center justify-center">
        {/* Container for both circle and flame to coordinate animations */}
        <div className="relative mb-6">
          {/* Circle animation */}
          <motion.div 
            className="w-24 h-24 rounded-full border-2 border-white bg-white/10 flex items-center justify-center relative backdrop-blur-sm"
            initial={{ y: -300, opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
          >
            {/* Circular pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/50"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          
          {/* Logo animation */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
            initial={{ y: 300, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1], 
                rotate: [0, 5, -5, 0],
                y: [0, -2, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="/lovable-uploads/44c35d38-14ee-46b9-8302-0944a264f34e.png"
                alt="FuelFriendly Logo"
                className={`h-12 w-12 ${isDarkMode ? 'invert' : ''}`}
              />
            </motion.div>
          </motion.div>
        </div>
        
        {/* FUELFRIENDLY text that appears after animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <motion.img 
            src="/lovable-uploads/2b80eff8-6efd-4f15-9213-ed9fe4e0cba9.png" 
            alt="FUELFRIENDLY" 
            className={`h-6 ${isDarkMode ? 'invert' : ''}`}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        
        {/* Progress bar */}
        <motion.div 
          className="mt-10 w-48 h-1 bg-white/20 rounded-full overflow-hidden"
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.3 }}
        >
          <motion.div 
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
        
        {/* Loading text */}
        <motion.p 
          className="mt-4 text-xs text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Loading experience...
        </motion.p>
      </div>
    </div>
  );
};

export default SplashScreen;
