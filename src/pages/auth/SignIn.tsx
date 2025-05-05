import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, AtSign, Lock, Eye, EyeOff, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import QrCodeDisplay from '@/components/ui/QrCodeLogin';

interface SignInProps {
  onLogin: (token: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  // Google client ID
  const GOOGLE_CLIENT_ID = '849289854634-s2rpf8ulkdaliogemfbu8qeprkom4rtp.apps.googleusercontent.com';

  // Check if Google API is loaded
  useEffect(() => {
    // Create script element for Google API
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google API script loaded successfully');
        setGoogleLoaded(true);
      };
      script.onerror = (error) => {
        console.error('Error loading Google API script:', error);
        toast({
          title: "Error",
          description: "Failed to load Google Sign-In. Please try again later.",
          variant: "destructive"
        });
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      // Cleanup any Google API related resources
      const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (googleScript) {
        googleScript.remove();
      }
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with animated loading
    setTimeout(() => {
      const token = "mock-auth-token-" + Math.random();
      onLogin(token);
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
      navigate('/');
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    try {
      setIsLoading(true);
      
      // Check if Google API is loaded
      if (!window.google || !window.google.accounts) {
        toast({
          title: "Google API Error",
          description: "Google Sign-In is not available. Please try again later.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Initializing Google Sign In...");

      // Using Google Identity Services for modern OAuth
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          console.log("Google login response received:", response);
          if (response.credential) {
            // Use the Auth Context to handle Google login
            const token = "google-auth-token-" + Math.random();
            
            loginWithGoogle(token)
              .then(() => {
                onLogin(token);
                toast({
                  title: "Welcome back!",
                  description: "Successfully logged in with Google",
                });
                navigate('/');
              })
              .catch(error => {
                console.error('Login with Google error:', error);
                toast({
                  title: "Error",
                  description: "Failed to complete Google authentication. Please try again.",
                  variant: "destructive"
                });
              })
              .finally(() => {
                setIsLoading(false);
              });
          } else {
            setIsLoading(false);
            toast({
              title: "Login Failed",
              description: "Google authentication did not return credentials",
              variant: "destructive"
            });
          }
        },
        context: 'signin',
        auto_select: false
      });

      // Render the button
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("Google One Tap was not displayed or skipped:", notification);
          document.getElementById('google-login-button')?.click();
        }
      });
      
    } catch (error) {
      console.error('Google Sign In Error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Function to trigger manual Google sign-in when button is clicked
  const handleManualGoogleSignIn = () => {
    if (!googleLoaded) return;
    
    console.log("Manual Google sign-in triggered");
    setIsLoading(true);
    
    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          // Fallback to redirect mode
          window.google.accounts.oauth2.initCodeClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: (response) => {
              if (response.code) {
                const token = "google-auth-redirect-" + Math.random();
                loginWithGoogle(token)
                  .then(() => {
                    onLogin(token);
                    navigate('/');
                  })
                  .catch(console.error)
                  .finally(() => setIsLoading(false));
              } else {
                setIsLoading(false);
              }
            }
          }).requestCode();
        } else {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Error triggering Google sign-in:", error);
      setIsLoading(false);
      toast({
        title: "Google Sign-In Error",
        description: "There was an error with Google authentication",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Background animation */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ backgroundPosition: '0% 0%' }}
        animate={{ backgroundPosition: '100% 100%' }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          background: 'radial-gradient(circle at center, rgba(0,230,118,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Header */}
      <div className="pt-6 px-6 z-10">
        <Link to="/welcome" className="inline-flex items-center text-green-500 hover:text-green-400">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Link>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-between z-10 px-6 py-8">
        <motion.div 
          className="w-full max-w-md mx-auto pt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome back
            </motion.h1>
            <motion.p 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Please log in to your account
            </motion.p>
          </div>

          <motion.form 
            onSubmit={handleSignIn}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {!showQrCode ? (
              <>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                <div className="text-right">
                  <Link 
                    to="/forgot-password" 
                    className="text-green-500 hover:text-green-400 text-sm transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium text-base transition-all transform active:scale-95"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                      Signing in...
                    </motion.div>
                  ) : (
                    'Log In'
                  )}
                </Button>

                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-gray-800"></div>
                  <span className="px-4 text-sm text-gray-500">Or continue with</span>
                  <div className="flex-1 h-px bg-gray-800"></div>
                </div>

                <div className="flex flex-col space-y-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    id="google-login-button"
                    className={`w-full h-12 rounded-full border-2 border-green-500 bg-transparent text-white hover:bg-green-500/10 font-medium text-base flex items-center justify-center gap-2 transition-all transform active:scale-95 ${!googleLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleManualGoogleSignIn}
                    disabled={isLoading || !googleLoaded}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    {!googleLoaded ? 'Loading Google Sign-In...' : 'Continue with Google'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-full border-2 border-blue-500 bg-transparent text-white hover:bg-blue-500/10 font-medium text-base flex items-center justify-center gap-2 transition-all transform active:scale-95"
                    onClick={() => setShowQrCode(true)}
                  >
                    <QrCode className="h-5 w-5 text-blue-500" />
                    Sign in with QR code
                  </Button>
                </div>
              </>
            ) : (
              <QrCodeDisplay
                clientId={GOOGLE_CLIENT_ID}
                onClose={() => setShowQrCode(false)}
              />
            )}
          </motion.form>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-500 hover:text-green-400 font-medium">
                Sign up now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
