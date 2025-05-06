
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ui/theme-provider';

enum VerificationStep {
  Instructions,
  Camera,
  Processing,
  Success,
  Failure
}

// Mock facial recognition API
const mockFaceRecognition = async (imageData: string): Promise<{success: boolean, faceId?: string, error?: string}> => {
  // In a real app, you would send the image data to your facial recognition API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock a 90% success rate for demo purposes
      const success = Math.random() > 0.1;
      
      if (success) {
        resolve({
          success: true,
          faceId: `face_${Math.random().toString(36).substring(2, 9)}`
        });
      } else {
        resolve({
          success: false,
          error: "Could not detect a face. Please try again with better lighting."
        });
      }
    }, 2000);
  });
};

const FaceVerification: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<VerificationStep>(VerificationStep.Instructions);
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const navigate = useNavigate();
  const { verifyFaceLogin } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Set up camera stream
  const setupCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setStep(VerificationStep.Camera);
      // Start a 3-second countdown
      setCountdown(3);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Please allow camera access to continue with face verification.",
        variant: "destructive"
      });
    }
  }, []);
  
  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Handle countdown
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Take picture when countdown reaches 0
      captureImage();
    }
  }, [countdown]);

  // Capture image from video
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const data = canvas.toDataURL('image/jpeg');
    setImageData(data);
    
    // Stop camera
    if (video.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
    
    // Proceed to processing step
    setStep(VerificationStep.Processing);
    processImage(data);
  }, []);

  // Process the captured image
  const processImage = useCallback(async (data: string) => {
    try {
      // Call facial recognition API
      const result = await mockFaceRecognition(data);
      
      if (result.success && result.faceId) {
        // Verify with backend
        const verified = await verifyFaceLogin(result.faceId);
        
        if (verified) {
          setStep(VerificationStep.Success);
          
          toast({
            title: "Verification Successful",
            description: "Your face has been verified.",
          });
          
          // Navigate to home after 2 seconds
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError("Face verification failed. Please try again.");
          setStep(VerificationStep.Failure);
        }
      } else {
        setError(result.error || "Face verification failed. Please try again.");
        setStep(VerificationStep.Failure);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError("An error occurred during face verification. Please try again.");
      setStep(VerificationStep.Failure);
    }
  }, [navigate, verifyFaceLogin]);

  // Try again after failure
  const handleRetry = () => {
    setError(null);
    setImageData(null);
    setStep(VerificationStep.Instructions);
  };

  // Skip verification for now (will be required later)
  const handleSkip = () => {
    toast({
      title: "Verification Skipped",
      description: "You can complete face verification later in settings.",
    });
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'} flex flex-col`}>
      {/* Header */}
      <div className="pt-6 px-6 z-10">
        <Link to="/" className={`inline-flex items-center ${isDarkMode ? 'text-green-500 hover:text-green-400' : 'text-green-600 hover:text-green-700'}`}>
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Link>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Face Verification</h1>
            
            {step === VerificationStep.Instructions && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                We need to verify your identity. Please make sure you're in a well-lit area with your face clearly visible.
              </p>
            )}
            
            {step === VerificationStep.Camera && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Position your face within the frame.
                {countdown !== null && countdown > 0 && (
                  <span className="block text-2xl font-bold mt-2">{countdown}</span>
                )}
              </p>
            )}
            
            {step === VerificationStep.Processing && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Processing your image...
              </p>
            )}
            
            {step === VerificationStep.Success && (
              <p className="text-green-500 mb-6">
                Verification successful! Redirecting...
              </p>
            )}
            
            {step === VerificationStep.Failure && (
              <p className="text-red-500 mb-6">
                {error || "Verification failed. Please try again."}
              </p>
            )}
          </motion.div>

          <motion.div
            className="w-full flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Camera view */}
            {(step === VerificationStep.Camera) && (
              <motion.div 
                className="relative w-64 h-64 mb-8 rounded-full overflow-hidden border-4 border-green-500"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <video 
                  ref={videoRef}
                  className="absolute w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Face outline overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-white rounded-full opacity-70" />
                </div>
                
                {/* Countdown overlay */}
                {countdown !== null && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold shadow-text">
                      {countdown}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Captured image */}
            {imageData && (step === VerificationStep.Processing || step === VerificationStep.Success || step === VerificationStep.Failure) && (
              <motion.div 
                className={`w-64 h-64 mb-8 rounded-full overflow-hidden border-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={imageData} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Instructions view */}
            {step === VerificationStep.Instructions && (
              <motion.div 
                className={`w-64 h-64 mb-8 rounded-full overflow-hidden border-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Camera className={`w-24 h-24 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </motion.div>
            )}
            
            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Action buttons */}
            <div className="flex flex-col gap-4 w-full mt-6">
              {step === VerificationStep.Instructions && (
                <Button
                  onClick={setupCamera}
                  className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Start Verification
                </Button>
              )}
              
              {step === VerificationStep.Processing && (
                <Button
                  disabled
                  className={`w-full h-12 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} text-white`}
                >
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </Button>
              )}
              
              {step === VerificationStep.Success && (
                <Button
                  className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white"
                  disabled
                >
                  <Check className="mr-2 h-5 w-5" />
                  Verification Complete
                </Button>
              )}
              
              {step === VerificationStep.Failure && (
                <>
                  <Button
                    onClick={handleRetry}
                    className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className={`w-full h-12 rounded-full ${isDarkMode ? 'text-gray-400 border-gray-700 hover:bg-gray-800' : 'text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                  >
                    Skip for Now
                  </Button>
                </>
              )}
              
              {(step === VerificationStep.Instructions || step === VerificationStep.Camera) && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className={`w-full h-12 rounded-full ${isDarkMode ? 'text-gray-400 border-gray-700 hover:bg-gray-800' : 'text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                >
                  Skip for Now
                </Button>
              )}
            </div>
            
            {step === VerificationStep.Instructions && (
              <motion.div
                className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex items-start">
                  <AlertTriangle className="text-yellow-500 w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                    We use facial recognition for security purposes only. Your face data is encrypted and stored securely. We never share this data with third parties.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FaceVerification;
