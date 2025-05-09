
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/components/ui/theme-provider';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Welcome = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { toast } = useToast();
  const [showSyncDialog, setShowSyncDialog] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('8 hours 0 minutes');
  const isMobile = useIsMobile();
  const [dialogErrorCount, setDialogErrorCount] = useState(0);
  
  // Simulate sync progress - very slowly
  useEffect(() => {
    if (showSyncDialog) {
      const totalDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          const newProgress = prev + 0.01; // Very small increments
          
          // Update the estimated time remaining
          const progressFraction = newProgress / 100;
          const timeElapsedMs = progressFraction * totalDuration;
          const timeRemainingMs = totalDuration - timeElapsedMs;
          
          const hoursRemaining = Math.floor(timeRemainingMs / (60 * 60 * 1000));
          const minutesRemaining = Math.floor((timeRemainingMs % (60 * 60 * 1000)) / (60 * 1000));
          
          setEstimatedTime(`${hoursRemaining} hours ${minutesRemaining} minutes`);
          
          // We'll never let it complete - simulating a bug
          if (newProgress >= 99.9) {
            return 99.9; // Keep it just under 100% to simulate being stuck
          }
          return newProgress;
        });
      }, 5000); // Update very slowly every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [showSyncDialog, toast]);

  // Function to simulate increasing error attempts when users try to close dialog
  const handleDialogChange = (open: boolean) => {
    // Prevent dialog from closing by ignoring the close request
    if (!open) {
      setDialogErrorCount(prev => prev + 1);
      
      // Show an error toast when user tries to close
      if (dialogErrorCount % 3 === 0) { // Show toast every 3 attempts
        toast({
          title: "System Error",
          description: "Sync operation cannot be cancelled. Please wait for completion.",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <>
      <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'} flex flex-col overflow-hidden max-w-md mx-auto`}>
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
                  disabled={showSyncDialog}
                >
                  Create an Account
                </Button>
                
                <Button 
                  onClick={() => navigate('/signin')}
                  variant="outline" 
                  className={`w-full h-14 rounded-full border-2 border-green-500 ${isDarkMode ? 'bg-transparent text-white hover:bg-green-500/10' : 'bg-transparent text-green-500 hover:bg-green-500/10'} font-medium text-lg`}
                  disabled={showSyncDialog}
                >
                  I already have an account
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

      {/* Sync Data Dialog - Modified to look like a persistent bug */}
      <Dialog 
        open={showSyncDialog} 
        onOpenChange={handleDialogChange}
      >
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center justify-center py-5">
            <div className="mb-3 flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="flex items-center justify-center mr-2"
              >
                <Loader className="w-5 h-5 text-red-500" />
              </motion.div>
              <span className="text-red-500 font-medium">System Process Running</span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Syncing data from server...</h3>
            <p className="text-gray-500 mb-4 text-center">
              This operation appears to be taking longer than expected.
              <br />
              <span className="text-red-500">Error code: 0x8007139F</span>
            </p>
            
            <div className="w-full max-w-xs mb-2 relative">
              <Progress value={syncProgress} className="h-2" />
              {syncProgress > 95 && (
                <div className="absolute top-3 w-full flex justify-center">
                  <span className="text-xs text-red-500">Connection lost. Retrying...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-1">
              {syncProgress.toFixed(1)}% complete
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Estimated time remaining: {estimatedTime}
            </p>

            {/* Error message that appears to be a system issue */}
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-400 font-mono w-full max-w-xs">
              <p>log: network timeout on api.fuelfriendly.com/sync</p>
              <p>log: retry attempt #{Math.floor(syncProgress * 3) + 1}</p>
              <p>status: waiting for response...</p>
              {dialogErrorCount > 0 && (
                <p className="text-red-500">warning: force close attempted ({dialogErrorCount}x)</p>
              )}
            </div>
            
            {/* Button that doesn't actually work - to simulate the bug */}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-xs"
              onClick={(e) => {
                e.preventDefault();
                setDialogErrorCount(prev => prev + 1);
                toast({
                  title: "Operation Locked",
                  description: "Cannot cancel system process. Please wait for completion.",
                  variant: "destructive",
                });
              }}
            >
              Cancel Operation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Welcome;
