
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Shield, Check, ArrowUp, ArrowDown, ArrowRight, Smile, EyeOff, AlertCircle } from 'lucide-react';

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
  const [showPreparationScreen, setShowPreparationScreen] = useState(true);
  const [verificationStep, setVerificationStep] = useState(1);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceInFrame, setFaceInFrame] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [brightness, setBrightness] = useState('good'); // 'low', 'good', 'high'
  const [showGuides, setShowGuides] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<ImageData | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Define all possible challenges for liveness detection with more detailed instructions
  const possibleChallenges = [
    { 
      instruction: 'Look straight at the camera', 
      detailedInstruction: 'Position your face in the center and look directly into the camera',
      delay: 4000,
      icon: <Camera className="h-5 w-5 text-green-500" />,
      livenessCheck: 'face_detection',
      verificationText: 'Making sure your face is visible...'
    },
    { 
      instruction: 'Turn your head to the right', 
      detailedInstruction: 'Slowly turn your head to the right side while keeping your eyes on the screen',
      delay: 4000,
      icon: <ArrowRight className="h-5 w-5 text-green-500" />,
      livenessCheck: 'head_movement',
      verificationText: 'Checking head movement...'
    },
    { 
      instruction: 'Turn your head to the left', 
      detailedInstruction: 'Slowly turn your head to the left side while keeping your eyes on the screen',
      delay: 4000,
      icon: <ArrowLeft className="h-5 w-5 text-green-500" />,
      livenessCheck: 'head_movement',
      verificationText: 'Checking head movement...'
    },
    { 
      instruction: 'Look up slightly', 
      detailedInstruction: 'Tilt your head slightly upward while keeping your face visible',
      delay: 4000,
      icon: <ArrowUp className="h-5 w-5 text-green-500" />,
      livenessCheck: 'head_movement',
      verificationText: 'Checking head position...'
    },
    { 
      instruction: 'Look down slightly', 
      detailedInstruction: 'Tilt your head slightly downward while keeping your face visible',
      delay: 4000,
      icon: <ArrowDown className="h-5 w-5 text-green-500" />,
      livenessCheck: 'head_movement',
      verificationText: 'Checking head position...'
    },
    {
      instruction: 'Blink your eyes slowly',
      detailedInstruction: 'Blink your eyes naturally 2-3 times while looking at the camera',
      delay: 4000,
      icon: <EyeOff className="h-5 w-5 text-green-500" />,
      livenessCheck: 'blink_detection',
      verificationText: 'Detecting eye movement...'
    },
    {
      instruction: 'Smile at the camera',
      detailedInstruction: 'Give a natural smile while looking directly at the camera',
      delay: 4000,
      icon: <Smile className="h-5 w-5 text-green-500" />,
      livenessCheck: 'expression_change',
      verificationText: 'Analyzing facial expression...'
    }
  ];
  
  // Preparation steps with detailed instructions
  const preparationSteps = [
    {
      title: "Find Good Lighting",
      description: "Make sure your face is well-lit from the front. Avoid shadows or bright backlighting.",
      icon: <AlertCircle className="h-6 w-6 text-green-500" />
    },
    {
      title: "Position Your Face",
      description: "Center your face in the frame and ensure your full face is visible.",
      icon: <Camera className="h-6 w-6 text-green-500" />
    },
    {
      title: "Remove Obstructions",
      description: "Remove glasses, masks, or anything covering your face.",
      icon: <EyeOff className="h-6 w-6 text-green-500" />
    },
    {
      title: "Stay Still",
      description: "Hold your device steady and minimize background movement.",
      icon: <Shield className="h-6 w-6 text-green-500" />
    }
  ];

  // Start camera with enhanced error handling
  const startCamera = async () => {
    setShowPreparationScreen(false);
    
    try {
      // Try to get higher resolution if possible for better verification
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          aspectRatio: { ideal: 4/3 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setInstructions('Position your face in the oval guide');
        
        // Start checking for face visibility after camera initialization
        setTimeout(() => {
          checkFaceVisibility();
          // Generate random challenges for liveness testing
          generateRandomChallenges();
          // Start face detection and movement analysis
          startFaceAnalysis();
        }, 1000);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(true);
      
      // If camera access fails, give user option to retry
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          startCamera();
        }, 2000);
      }
    }
  };
  
  // Check if face is visible and properly positioned
  const checkFaceVisibility = () => {
    if (!cameraActive || cameraError) return;
    
    // Simulated face detection - in a real app, use a face detection library
    // This simulates detecting if a face is in the frame after 2 seconds
    setTimeout(() => {
      setFaceInFrame(true);
      
      // Start countdown after face is detected
      startCountdown();
    }, 2000);
  };
  
  // Start countdown before verification
  const startCountdown = () => {
    setShowCountdown(true);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          // Start the verification sequence after countdown
          startVerificationSequence();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Generate random set of challenges for liveness detection
  const generateRandomChallenges = () => {
    // Always include face detection as first challenge
    const firstChallenge = possibleChallenges[0];
    
    // Randomly select 3-4 more challenges
    const otherChallenges = [...possibleChallenges.slice(1)]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const selectedChallenges = [firstChallenge, ...otherChallenges];
    setRandomChallenges(selectedChallenges);
    
    // Extract liveness checks from the challenges
    const checks = selectedChallenges.map(challenge => challenge.livenessCheck);
    setLivenessChecks(checks);
  };
  
  // Analyze face movements and changes between frames with enhanced detection
  const startFaceAnalysis = () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    const updateCanvasSize = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      } else {
        canvas.width = 640;
        canvas.height = 480;
      }
    };
    
    // Wait for video metadata to load before setting canvas size
    video.addEventListener('loadedmetadata', updateCanvasSize);
    
    // Regularly check for brightness conditions
    const checkLightingConditions = (imageData: ImageData) => {
      const data = imageData.data;
      let totalBrightness = 0;
      
      // Sample pixels to calculate average brightness
      for (let i = 0; i < data.length; i += 40) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Calculate luminance
        totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
      }
      
      const averageBrightness = totalBrightness / (data.length / 40);
      
      if (averageBrightness < 50) {
        setBrightness('low');
      } else if (averageBrightness > 200) {
        setBrightness('high');
      } else {
        setBrightness('good');
      }
    };
    
    const analyzeFrame = () => {
      if (!video.paused && !video.ended && video.readyState >= 2) {
        // Ensure canvas dimensions are set
        if (canvas.width === 0) updateCanvasSize();
        
        // Draw current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for analysis
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Check lighting conditions
        checkLightingConditions(imageData);
        
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
          setFaceDetected(true);
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
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
      }
    };
    
    // Start frame analysis
    analyzeFrame();
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      video.removeEventListener('loadedmetadata', updateCanvasSize);
    };
  };
  
  // Detect movement between frames (enhanced algorithm)
  const detectMovement = (prevFrame: ImageData, currentFrame: ImageData) => {
    const data1 = prevFrame.data;
    const data2 = currentFrame.data;
    let diff = 0;
    const sampleSize = 30; // Lower value = more samples = more accurate but slower
    
    // Sample pixels at intervals (for performance)
    for (let i = 0; i < data1.length; i += sampleSize) {
      // Compare RGB values
      diff += Math.abs(data1[i] - data2[i]); // R
      diff += Math.abs(data1[i+1] - data2[i+1]); // G
      diff += Math.abs(data1[i+2] - data2[i+2]); // B
    }
    
    return diff / (data1.length / sampleSize) * 500; // Normalized difference score
  };
  
  // Detect blinking (enhanced algorithm)
  const detectBlink = (prevFrame: ImageData, currentFrame: ImageData) => {
    // In a real implementation, this would use facial landmarks
    // Here we use a more focused region in the upper third of the frame
    const data1 = prevFrame.data;
    const data2 = currentFrame.data;
    let diff = 0;
    
    // Focus on the middle horizontal third and upper vertical third of the image
    // where eyes are typically located
    const width = Math.sqrt(data1.length / 4); // Assuming 4 channels (RGBA)
    const upperThirdStart = Math.floor(width * width * 4 * (1/6));
    const upperThirdEnd = Math.floor(width * width * 4 * (2/6));
    
    for (let i = upperThirdStart; i < upperThirdEnd; i += 50) {
      if (i < data1.length) {
        diff += Math.abs(data1[i] - data2[i]);
      }
    }
    
    return diff / ((upperThirdEnd - upperThirdStart) / 50) * 2000; // Normalized difference score
  };
  
  // Stop camera stream and cleanup resources
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
    
    // Cancel any animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  // Capture frame from video with enhanced processing
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      setProcessingImage(true);
      
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
        // For demo purposes, we'll just simulate progress and store the image
        const capturedImage = canvas.toDataURL('image/jpeg');
        setCapturedImages(prev => [...prev, capturedImage]);
        setCaptureCount(prev => prev + 1);
        
        setTimeout(() => {
          setProcessingImage(false);
        }, 500);
        
        // Return the data URL of the captured frame
        return capturedImage;
      }
    }
    
    // If camera is not active, still increment capture count to progress
    if (cameraError) {
      setCaptureCount(prev => prev + 1);
    }
    return null;
  };
  
  // Verification sequence with multiple poses and enhanced feedback
  const startVerificationSequence = () => {
    setIsSubmitting(true);
    setCurrentPoseIndex(0);
    setVerificationStep(1);
    
    processPose(0);
  };
  
  // Process each pose with time delays and visual feedback
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
    setVerificationStep(index + 1);
    
    // Capture frame after a brief moment for user to follow instruction
    setTimeout(() => {
      const capturedImage = captureFrame();
      if (capturedImage) {
        console.log(`Captured frame for pose: ${randomChallenges[index].instruction}`);
      } else if (cameraError) {
        console.log(`Simulating capture for pose: ${randomChallenges[index].instruction}`);
      }
      
      // Move to the next pose after a delay
      setTimeout(() => {
        processPose(index + 1);
      }, 1500);
      
    }, randomChallenges[index].delay);
  };
  
  // Successfully complete the verification process
  const completeVerification = () => {
    stopCamera();
    setIsSubmitting(false);
    setIsCompleted(true);
    
    // Navigate after a delay
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };
  
  // Handle verification failure with retry option
  const failVerification = () => {
    stopCamera();
    setIsSubmitting(false);
  };
  
  // Allow user to skip verification
  const skipVerification = () => {
    stopCamera();
    navigate('/');
  };
  
  // Retry the verification process
  const retryVerification = () => {
    setLivenessScore(0);
    setCaptureCount(0);
    setCurrentPoseIndex(-1);
    setMovementDetected(false);
    setBlinkDetected(false);
    setCapturedImages([]);
    setVerificationStep(1);
    setIsSubmitting(false);
    setShowPreparationScreen(true);
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
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mb-4"
            >
              <img 
                src="/lovable-uploads/af30f547-2e68-4706-8f5d-4a84088b6f19.png" 
                alt="FuelFriendly Logo" 
                className="h-32"
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
            ) : showPreparationScreen ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white text-center mb-2">Face Verification</h2>
                <p className="text-gray-300 text-center mb-6">
                  Before we start, please prepare for the verification process:
                </p>
                
                <div className="space-y-4 w-full mb-6">
                  {preparationSteps.map((step, index) => (
                    <div key={index} className="flex items-start p-3 bg-gray-700/50 rounded-lg">
                      <div className="mr-3 mt-0.5 flex-shrink-0">
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{step.title}</h3>
                        <p className="text-xs text-gray-300">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={startCamera}
                  className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium"
                >
                  I'm Ready
                </Button>
                
                <Button
                  variant="outline"
                  onClick={skipVerification}
                  className="w-full mt-3 h-12 rounded-full border-2 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 font-medium"
                >
                  Skip for Now
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
                  {cameraActive ? instructions : (cameraError ? 'Camera access denied. Please check your browser permissions.' : 'For security purposes, we need to verify your identity using your camera.')}
                </p>
                
                {cameraActive && (
                  <div className="relative mb-6">
                    <div className="relative rounded-lg overflow-hidden">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full rounded-lg border-2 border-green-500"
                      />
                      
                      {/* Enhanced face guide overlay: concentric circles */}
                      {showGuides && !showCountdown && !processingImage && currentPoseIndex === -1 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* Outer circle */}
                          <div className="w-4/5 h-4/5 border-2 border-dashed border-green-500 rounded-full opacity-70 animate-pulse"></div>
                          {/* Middle circle */}
                          <div className="absolute w-3/4 h-3/4 border-2 border-dashed border-green-500 rounded-full opacity-50"></div>
                          {/* Inner circle */}
                          <div className="absolute w-2/3 h-2/3 border-2 border-dotted border-green-500 rounded-full opacity-80"></div>
                          {/* Center point */}
                          <div className="absolute w-2 h-2 bg-green-500 rounded-full"></div>
                          
                          {/* Position guidelines */}
                          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-green-500 rounded-full"></div>
                          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-green-500 rounded-full"></div>
                          <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                          <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                          
                          {/* Text instruction */}
                          <div className="absolute bottom-8 left-0 right-0 text-center">
                            <p className="text-white text-sm font-medium bg-black/50 py-1 px-3 rounded-full inline-block">
                              Position your face in the circles
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Countdown overlay with circular progress */}
                      {showCountdown && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="relative">
                            {/* Circular countdown animation */}
                            <svg className="w-24 h-24" viewBox="0 0 100 100">
                              <circle 
                                cx="50" cy="50" r="45" 
                                fill="none" 
                                stroke="#374151" 
                                strokeWidth="8"
                              />
                              <circle 
                                cx="50" cy="50" r="45" 
                                fill="none" 
                                stroke="#10B981" 
                                strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * (countdown / 3))}
                                transform="rotate(-90 50 50)"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-5xl text-white font-bold">{countdown}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Processing overlay with animation */}
                      {processingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <div className="text-center">
                            <div className="w-16 h-16 relative mx-auto mb-3">
                              <div className="animate-spin absolute inset-0 h-full w-full border-4 border-t-transparent border-green-500 rounded-full"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Camera className="h-6 w-6 text-green-500" />
                              </div>
                            </div>
                            <div className="text-white text-lg font-medium">Processing...</div>
                            <div className="text-gray-300 text-sm mt-1">Please don't move</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Brightness warning with icon */}
                      {brightness !== 'good' && (
                        <div className="absolute top-2 left-0 right-0 flex items-center justify-center">
                          <div className="bg-black/70 px-3 py-1 rounded-full flex items-center">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-xs text-white">
                              {brightness === 'low' ? 'Low light detected. Please move to a brighter area.' : 'Too bright. Reduce direct light on your face.'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced challenge instruction overlay with animation */}
                      {currentPoseIndex >= 0 && currentPoseIndex < randomChallenges.length && (
                        <div className="absolute inset-0 flex flex-col items-center">
                          {/* Instruction header */}
                          <div className="absolute top-4 left-0 right-0 flex items-center justify-center">
                            <div className="bg-black/80 px-4 py-2 rounded-full flex items-center gap-2 border border-green-500/30 animate-pulse-slow">
                              {randomChallenges[currentPoseIndex].icon}
                              <span className="text-white font-medium">{instructions}</span>
                            </div>
                          </div>
                          
                          {/* Visual guide for head movement */}
                          {randomChallenges[currentPoseIndex]?.instruction.includes('right') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {/* Right arrow guide */}
                              <div className="absolute right-4 flex flex-col items-center">
                                <div className="h-24 w-12 border-2 border-green-500 rounded-lg border-dashed opacity-70 animate-pulse"></div>
                                <ArrowRight className="h-8 w-8 text-green-500 mt-2 animate-bounce-subtle" />
                                <span className="text-white text-xs mt-1">Turn right</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Visual guide for head movement */}
                          {randomChallenges[currentPoseIndex]?.instruction.includes('left') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {/* Left arrow guide */}
                              <div className="absolute left-4 flex flex-col items-center">
                                <div className="h-24 w-12 border-2 border-green-500 rounded-lg border-dashed opacity-70 animate-pulse"></div>
                                <ArrowLeft className="h-8 w-8 text-green-500 mt-2 animate-bounce-subtle" />
                                <span className="text-white text-xs mt-1">Turn left</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Visual guide for head movement */}
                          {randomChallenges[currentPoseIndex]?.instruction.includes('up') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {/* Up arrow guide */}
                              <div className="absolute top-4 flex flex-col items-center">
                                <ArrowUp className="h-8 w-8 text-green-500 mb-2 animate-bounce-subtle" />
                                <div className="h-12 w-24 border-2 border-green-500 rounded-lg border-dashed opacity-70 animate-pulse"></div>
                                <span className="text-white text-xs mt-1">Look up</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Visual guide for head movement */}
                          {randomChallenges[currentPoseIndex]?.instruction.includes('down') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {/* Down arrow guide */}
                              <div className="absolute bottom-16 flex flex-col items-center">
                                <span className="text-white text-xs mb-1">Look down</span>
                                <div className="h-12 w-24 border-2 border-green-500 rounded-lg border-dashed opacity-70 animate-pulse"></div>
                                <ArrowDown className="h-8 w-8 text-green-500 mt-2 animate-bounce-subtle" />
                              </div>
                            </div>
                          )}
                          
                          {/* Blink guide */}
                          {randomChallenges[currentPoseIndex]?.instruction.includes('Blink') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <EyeOff className="h-10 w-10 text-green-500 animate-pulse" />
                                <span className="text-white text-xs mt-2">Blink slowly</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Smile guide */}
                          {randomChallenges[currentPoseIndex]?.instruction.includes('Smile') && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <Smile className="h-10 w-10 text-green-500 animate-pulse" />
                                <span className="text-white text-xs mt-2">Smile naturally</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Enhanced capture counter with visual progress */}
                      {captureCount > 0 && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-black/60 backdrop-blur-sm rounded-full p-1 flex items-center">
                            <div className="text-xs text-white font-medium mr-1">
                              {captureCount}/{randomChallenges.length}
                            </div>
                            <div className="h-5 w-5 bg-green-500/20 rounded-full flex items-center justify-center">
                              <Camera className="h-3 w-3 text-green-500" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Progress steps with enhanced visuals */}
                      {randomChallenges.length > 0 && (
                        <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-white">Step {verificationStep} of {randomChallenges.length}</span>
                            <span className="text-xs text-white">Liveness: {livenessScore}%</span>
                          </div>
                          <div className="bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 h-full transition-all duration-300"
                              style={{ width: `${((verificationStep) / randomChallenges.length) * 100}%` }}
                            />
                          </div>
                          
                          {/* Step indicators */}
                          <div className="flex justify-between mt-2">
                            {Array.from({ length: randomChallenges.length }).map((_, idx) => (
                              <div 
                                key={idx} 
                                className={`w-2.5 h-2.5 rounded-full ${idx < verificationStep ? 'bg-green-500' : 'bg-gray-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Hidden canvas for image processing */}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
                
                {/* Camera error state with retry button */}
                {cameraError && (
                  <div className="mb-6 text-center">
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                      <p className="text-white mb-4">Unable to access your camera. Please check your device's camera permissions.</p>
                      <Button
                        onClick={() => {
                          setRetryCount(0);
                          setCameraError(false);
                          startCamera();
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white w-full"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
                
                {isSubmitting && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
                    <span className="text-gray-300">Processing verification...</span>
                  </div>
                )}
                
                {!isSubmitting && cameraActive && (
                  <Button
                    variant="outline"
                    onClick={retryVerification}
                    className="w-full mt-3 h-12 rounded-full border-2 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 font-medium"
                  >
                    Restart Verification
                  </Button>
                )}
                
                {!cameraActive && !isSubmitting && !cameraError && (
                  <Button 
                    onClick={startCamera}
                    className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium"
                  >
                    Start Live Verification
                  </Button>
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
