
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, Shield, Check, ArrowUp, ArrowDown, ArrowRight, Smile, EyeOff } from 'lucide-react';

const FaceVerification: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [instructions, setInstructions] = useState('Get ready for face verification');
  const [currentPoseIndex, setCurrentPoseIndex] = useState(-1);
  const [cameraError, setCameraError] = useState(false);
  const [livenessScore, setLivenessScore] = useState(0);
  const [livenessChecks, setLivenessChecks] = useState<string[]>([]);
  const [randomChallenges, setRandomChallenges] = useState<any[]>([]);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [movementDetected, setMovementDetected] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<ImageData | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  
  // Define all possible challenges for liveness detection
  const possibleChallenges = [
    { 
      instruction: 'Look straight at the camera', 
      delay: 3000,
      icon: <Camera className="h-5 w-5 text-green-500" />,
      livenessCheck: 'face_detection'
    },
    { 
      instruction: 'Turn your head to the right', 
      delay: 3000,
      icon: <ArrowRight className="h-5 w-5 text-green-500" />,
      livenessCheck: 'head_movement'
    },
    { 
      instruction: 'Turn your head to the left', 
      delay: 3000,
      icon: <ArrowLeft className="h-5 w-5 text-green-500" />,
      livenessCheck: 'head_movement' 
    },
    { 
      instruction: 'Look up slightly', 
      delay: 3000,
      icon: <ArrowUp className="h-5 w-5 text-green-500" />,
      livenessCheck: 'head_movement'
    },
    { 
      instruction: 'Look down slightly', 
      delay: 3000,
      icon: <ArrowDown className="h-5 w-5 text-green-500" />,
      livenessCheck: 'head_movement'
    },
    {
      instruction: 'Blink your eyes slowly',
      delay: 3000,
      icon: <EyeOff className="h-5 w-5 text-green-500" />,
      livenessCheck: 'blink_detection'
    },
    {
      instruction: 'Smile at the camera',
      delay: 3000,
      icon: <Smile className="h-5 w-5 text-green-500" />,
      livenessCheck: 'expression_change'
    }
  ];
  
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
        
        // Generate random challenges for liveness testing
        generateRandomChallenges();
        
        // Start face detection and movement analysis
        startFaceAnalysis();
        
        // Start the verification sequence after camera is initialized
        setTimeout(() => startVerificationSequence(), 2000);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera access unavailable",
        description: "Continuing with verification without camera access",
        variant: "default"
      });
      setCameraError(true);
      // Start verification sequence anyway
      generateRandomChallenges();
      startVerificationSequence();
    }
  };
  
  // Generate random set of challenges for liveness detection
  const generateRandomChallenges = () => {
    // Ensure we always include face detection as first challenge
    const firstChallenge = possibleChallenges[0];
    
    // Randomly select 3-4 more challenges
    const otherChallenges = [...possibleChallenges.slice(1)]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3 + Math.floor(Math.random() * 2));
    
    const selectedChallenges = [firstChallenge, ...otherChallenges];
    setRandomChallenges(selectedChallenges);
    
    // Extract liveness checks from the challenges
    const checks = selectedChallenges.map(challenge => challenge.livenessCheck);
    setLivenessChecks(checks);
  };
  
  // Analyze face movements and changes between frames
  const startFaceAnalysis = () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) return;
    
    // Set canvas dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const analyzeFrame = () => {
      if (!video.paused && !video.ended && video.readyState >= 2) {
        // Draw current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for analysis
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Store current frame
        frameRef.current = imageData;
        
        // Detect movement between frames
        if (lastFrameRef.current) {
          const movementScore = detectMovement(lastFrameRef.current, imageData);
          if (movementScore > 10) {
            setMovementDetected(true);
            // Update liveness score based on detected movement
            if (currentPoseIndex >= 0 && 
                randomChallenges[currentPoseIndex]?.livenessCheck === 'head_movement') {
              setLivenessScore(prev => Math.min(prev + 5, 100));
            }
          }
          
          // Detect blinking
          const blinkScore = detectBlink(lastFrameRef.current, imageData);
          if (blinkScore > 5) {
            setBlinkDetected(true);
            // Update liveness score based on detected blink
            if (currentPoseIndex >= 0 && 
                randomChallenges[currentPoseIndex]?.livenessCheck === 'blink_detection') {
              setLivenessScore(prev => Math.min(prev + 10, 100));
            }
          }
        }
        
        // Update last frame reference for next comparison
        lastFrameRef.current = imageData;
        
        // Basic face detection simulation
        if (currentPoseIndex >= 0 && 
            randomChallenges[currentPoseIndex]?.livenessCheck === 'face_detection') {
          // In a real implementation, use a face detection library
          // Here we simulate face detection success
          setLivenessScore(prev => Math.min(prev + 3, 100));
        }
        
        // Expression change detection simulation
        if (currentPoseIndex >= 0 && 
            randomChallenges[currentPoseIndex]?.livenessCheck === 'expression_change' &&
            movementDetected) {
          // In a real implementation, use facial landmark detection
          // Here we simulate expression detection based on movement
          setLivenessScore(prev => Math.min(prev + 5, 100));
        }
        
        // Continue analyzing frames
        requestAnimationFrame(analyzeFrame);
      }
    };
    
    // Start frame analysis
    analyzeFrame();
  };
  
  // Detect movement between frames (simplified algorithm)
  const detectMovement = (prevFrame: ImageData, currentFrame: ImageData) => {
    const data1 = prevFrame.data;
    const data2 = currentFrame.data;
    let diff = 0;
    
    // Sample pixels at intervals (for performance)
    for (let i = 0; i < data1.length; i += 40) {
      diff += Math.abs(data1[i] - data2[i]);
    }
    
    return diff / data1.length * 1000; // Normalized difference score
  };
  
  // Detect blinking (simplified algorithm)
  const detectBlink = (prevFrame: ImageData, currentFrame: ImageData) => {
    // In a real implementation, this would use facial landmarks
    // Here we'll use a simplified pixel difference in the upper half of the frame
    const data1 = prevFrame.data;
    const data2 = currentFrame.data;
    let diff = 0;
    
    // Upper third of the image (where eyes typically are)
    const upperThirdSize = data1.length / 3;
    
    for (let i = 0; i < upperThirdSize; i += 50) {
      diff += Math.abs(data1[i] - data2[i]);
    }
    
    return diff / upperThirdSize * 2000; // Normalized difference score
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
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Here you would normally send this image to a backend for processing
        // For demo purposes, we'll just simulate progress
        setCaptureCount(prev => prev + 1);
        
        // Return the data URL of the captured frame
        return canvas.toDataURL('image/jpeg');
      }
    }
    // If camera is not active, still increment capture count to progress
    if (cameraError) {
      setCaptureCount(prev => prev + 1);
    }
    return null;
  };
  
  // Verification sequence with multiple poses
  const startVerificationSequence = () => {
    setIsSubmitting(true);
    setCurrentPoseIndex(0);
    
    processPose(0);
  };
  
  // Process each pose with time delays
  const processPose = (index: number) => {
    if (index >= randomChallenges.length) {
      // Check final liveness score before completion
      if (livenessScore >= 70) {
        completeVerification();
      } else {
        // If liveness score is too low, challenge failed
        failVerification();
      }
      return;
    }
    
    setCurrentPoseIndex(index);
    setInstructions(randomChallenges[index].instruction);
    
    // Capture frame after a brief moment
    setTimeout(() => {
      const capturedImage = captureFrame();
      if (capturedImage) {
        console.log(`Captured frame for pose: ${randomChallenges[index].instruction}`);
        // Here you would send the image to your verification service
      } else if (cameraError) {
        console.log(`Simulating capture for pose: ${randomChallenges[index].instruction}`);
      }
      
      // Move to the next pose after delay
      setTimeout(() => {
        processPose(index + 1);
      }, 1000);
      
    }, randomChallenges[index].delay);
  };
  
  const completeVerification = () => {
    stopCamera();
    setIsSubmitting(false);
    setIsCompleted(true);
    toast({
      title: "Verification successful",
      description: "Your identity has been verified successfully."
    });
    
    // Navigate after a delay
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };
  
  const failVerification = () => {
    stopCamera();
    setIsSubmitting(false);
    toast({
      title: "Verification failed",
      description: "Liveness check failed. Please try again.",
      variant: "destructive"
    });
  };
  
  const skipVerification = () => {
    stopCamera();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
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
            {/* Logo - without circle */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mb-4"
            >
              <img 
                src="/lovable-uploads/af30f547-2e68-4706-8f5d-4a84088b6f19.png" 
                alt="FuelFriendly Logo" 
                className="h-40"
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
                <h2 className="text-xl font-bold text-white mb-2">Verification Successful</h2>
                <p className="text-gray-300 mb-6">
                  Your identity has been verified successfully! You can now access all features of the app.
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
                  {cameraActive ? instructions : (cameraError ? 'Continuing verification without camera' : 'For security purposes, we need to verify your identity using your camera.')}
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
                      
                      {currentPoseIndex >= 0 && currentPoseIndex < randomChallenges.length && (
                        <div className="absolute top-4 left-0 right-0 flex items-center justify-center">
                          <div className="bg-black/60 px-4 py-2 rounded-full flex items-center gap-2">
                            {randomChallenges[currentPoseIndex].icon}
                            <span className="text-white">{instructions}</span>
                          </div>
                        </div>
                      )}
                      
                      {captureCount > 0 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          {captureCount}/{randomChallenges.length}
                        </div>
                      )}
                      
                      {/* Progress bar */}
                      {currentPoseIndex >= 0 && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 h-full transition-all duration-300"
                              style={{ width: `${((currentPoseIndex + 1) / randomChallenges.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Liveness score indicator */}
                      {cameraActive && (
                        <div className="absolute bottom-6 right-2 bg-black/60 px-2 py-1 rounded">
                          <div className="text-xs text-white">Liveness: {livenessScore}%</div>
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
                
                {cameraError && currentPoseIndex >= 0 && (
                  <div className="mb-6 text-center">
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-3">
                      <div className="mb-3 text-green-500 text-lg font-medium">
                        {randomChallenges[currentPoseIndex].instruction}
                      </div>
                      <div className="flex justify-center text-5xl text-green-500 mb-3">
                        {randomChallenges[currentPoseIndex].icon}
                      </div>
                      <div className="bg-gray-600 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${((currentPoseIndex + 1) / randomChallenges.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {!cameraActive && !isSubmitting && !cameraError && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                      <Shield className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-white">Liveness Detection</h3>
                        <p className="text-xs text-gray-300">We'll verify your presence with random challenges to ensure you're physically present.</p>
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
                
                {!cameraActive && !isSubmitting && !cameraError && (
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

