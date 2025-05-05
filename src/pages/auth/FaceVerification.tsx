
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, FaceRecognition, Shield, Check } from 'lucide-react';

const FaceVerification: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleStartVerification = () => {
    setIsSubmitting(true);
    // Simulate verification process
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      toast({
        title: "Verification submitted",
        description: "Your verification request has been submitted successfully."
      });
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    }, 1500);
  };

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
      
      {/* Header */}
      <div className="pt-6 px-6 z-10">
        <Link to="/signup" className="inline-flex items-center text-green-500 hover:text-green-400">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Link>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-between z-10 px-6 py-8">
        <div className="w-full pt-6">
          {/* Logo and brand section */}
          <motion.div 
            className="flex flex-col items-center mb-10"
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto flex flex-col items-center"
        >
          <div className="bg-gray-800/70 backdrop-blur-md rounded-xl p-6 w-full max-w-md mb-6">
            {isCompleted ? (
              <div className="text-center flex flex-col items-center py-4">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Verification Submitted</h2>
                <p className="text-gray-300 mb-6">
                  Your verification request has been received. We'll verify your identity within 24 hours.
                </p>
                <Button 
                  onClick={() => navigate('/home')}
                  className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium"
                >
                  Continue to App
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FaceRecognition className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white text-center mb-2">Face Verification</h2>
                <p className="text-gray-300 text-center mb-6">
                  For security purposes, we need to verify your identity. This helps ensure the safety of all our users.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                    <Shield className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-white">Verification Process</h3>
                      <p className="text-xs text-gray-300">We'll verify your identity within 24 hours after submission.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                    <FaceRecognition className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-white">Secure & Private</h3>
                      <p className="text-xs text-gray-300">Your data is encrypted and will only be used for verification.</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleStartVerification}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Processing...
                    </>
                  ) : (
                    "Start Verification"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/home')}
                  className="w-full mt-3 h-12 rounded-full border-2 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 font-medium"
                >
                  Skip for Now
                </Button>
                <p className="text-xs text-gray-400 text-center mt-4">
                  Skipping verification will limit some app features
                </p>
              </>
            )}
          </div>
        </motion.div>
        
        <div className="w-full text-center">
          <p className="text-gray-400 text-xs">
            Powered by secure verification technology
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaceVerification;
