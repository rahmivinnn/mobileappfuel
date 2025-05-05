
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, Shield, Check } from 'lucide-react';

const FaceVerification: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [instructions, setInstructions] = useState('Get ready for face verification');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Start camera when requested
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setInstructions('Position your face in the frame');
        
        // Start the verification sequence after camera is initialized
        setTimeout(() => startVerificationSequence(), 2000);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to verify your identity",
        variant: "destructive"
      });
    }
  };
  
  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  // Capture frame from video
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Here you would normally send this image to a backend for processing
        // For demo purposes, we'll just simulate progress
        setCaptureCount(prev => prev + 1);
        
        // Return the data URL of the captured frame
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };
  
  // Verification sequence with multiple poses
  const startVerificationSequence = () => {
    const poses = [
      { instruction: 'Look straight at the camera', delay: 3000 },
      { instruction: 'Slowly turn your head to the right', delay: 3000 },
      { instruction: 'Now turn your head to the left', delay: 3000 },
      { instruction: 'Blink a few times', delay: 3000 }
    ];
    
    setIsSubmitting(true);
    
    // Process each pose with delays
    poses.forEach((pose, index) => {
      setTimeout(() => {
        setInstructions(pose.instruction);
        
        // Capture frame after a brief moment
        setTimeout(() => {
          const capturedImage = captureFrame();
          if (capturedImage) {
            console.log(`Captured frame for pose: ${pose.instruction}`);
            // Here you would send the image to your verification service
          }
          
          // If this is the last pose, complete the verification
          if (index === poses.length - 1) {
            completeVerification();
          }
        }, 2000);
      }, pose.delay * index);
    });
  };
  
  const completeVerification = () => {
    stopCamera();
    setIsSubmitting(false);
    setIsCompleted(true);
    toast({
      title: "Verification submitted",
      description: "Your verification request has been submitted successfully."
    });
    
    // Navigate after a delay
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };
  
  const skipVerification = () => {
    stopCamera();
    navigate('/');
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
                  onClick={() => navigate('/')}
                  className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium"
                >
                  Continue to App
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white text-center mb-2">Face Verification</h2>
                <p className="text-gray-300 text-center mb-4">
                  {cameraActive ? instructions : 'For security purposes, we need to verify your identity using your camera.'}
                </p>
                
                {cameraActive && (
                  <div className="relative mb-6">
                    <div className="relative">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full rounded-lg border-2 border-green-500"
                      />
                      <div className="absolute inset-0 border-4 border-green-500 rounded-lg opacity-50 pointer-events-none"></div>
                      {captureCount > 0 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          {captureCount}/4
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
                
                {!cameraActive && !isSubmitting && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                      <Shield className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-white">Live Verification</h3>
                        <p className="text-xs text-gray-300">We'll guide you through a series of facial movements to verify your identity.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                      <Camera className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-white">Camera Required</h3>
                        <p className="text-xs text-gray-300">Please allow camera access when prompted. This is secure and private.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!cameraActive && !isSubmitting && (
                  <Button 
                    onClick={startCamera}
                    className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium"
                  >
                    Start Live Verification
                  </Button>
                )}
                
                {isSubmitting && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
                    <span className="text-gray-300">Processing...</span>
                  </div>
                )}
                
                {!isSubmitting && (
                  <Button
                    variant="outline"
                    onClick={skipVerification}
                    className="w-full mt-3 h-12 rounded-full border-2 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 font-medium"
                  >
                    Skip for Now
                  </Button>
                )}
                
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
