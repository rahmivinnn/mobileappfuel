import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SignInProps {
  onLogin: (token: string) => void;
}

// Mock Google SDK initialization
const initializeGoogleSDK = () => {
  // This is a simulation. In a real app, you'd load the Google Identity Services script 
  // and initialize it with your client ID.
  console.log("Google SDK initialized");
  
  return {
    accounts: {
      id: {
        initialize: (config: any) => {
          console.log("Google ID initialized with:", config);
        },
        renderButton: (element: HTMLElement, config: any) => {
          console.log("Google Sign-In button would be rendered");
          // In a real app, this would render the Google Sign-In button
        },
        prompt: (callback: (notification: any) => void) => {
          // Simulate Google sign-in
          setTimeout(() => {
            callback({
              isNotDisplayed: () => false,
              isSkippedMoment: () => false,
              isDismissedMoment: () => false,
              getNotDisplayedReason: () => null,
              getSkippedReason: () => null,
              getDismissedReason: () => null,
            });
          }, 1000);
        }
      }
    }
  };
};

const SignIn: React.FC<SignInProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    // Initialize Google Sign-In in a real app
    // The mock version doesn't do anything but log a message
    const googleSDK = initializeGoogleSDK();
    
    if (googleSDK && googleSDK.accounts && googleSDK.accounts.id) {
      googleSDK.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with actual client ID in production
        callback: handleGoogleCallback
      });

      // Render Google Sign-In button
      const googleButton = document.getElementById('googleSignInButton');
      if (googleButton) {
        googleSDK.accounts.id.renderButton(googleButton, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: '100%'
        });
      }
      
      // In a real app, enable auto-prompt for seamless login
      // googleSDK.accounts.id.prompt(handlePromptCallback);
    }
  }, []);

  const handleGoogleCallback = async (response: any) => {
    if (response && response.credential) {
      try {
        await loginWithGoogle(response.credential);
      } catch (error) {
        console.error('Google sign-in error:', error);
        toast({
          title: "Login Failed",
          description: "Could not login with Google. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const token = "mock-auth-token-" + Math.random();
      onLogin(token);

      if (rememberMe) {
        localStorage.setItem('saved-email', email);
      } else {
        localStorage.removeItem('saved-email');
      }
      
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simplified implementation for demo purposes
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Generate a mock token
      const token = "google-auth-token-" + Math.random();
      
      // Use the loginWithGoogle function from auth context
      await loginWithGoogle(token);
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login Failed",
        description: "Could not sign in with Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Try to load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('saved-email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

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
        <Link to="/welcome" className="inline-flex items-center text-green-500 hover:text-green-400">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Link>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <Input
                type="email"
                placeholder="Email address"
                className="h-12 pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <Input
                type="password"
                placeholder="Password"
                className="h-12 pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-gray-600 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                />
                <label htmlFor="remember" className="text-sm text-gray-400">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-green-500 hover:text-green-400">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-800"></div>
            <span className="px-4 text-sm text-gray-500">Or continue with</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 rounded-full border-2 border-green-500 bg-transparent text-white hover:bg-green-500/10 font-medium text-base flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
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
          
          <div className="mt-4 w-full flex justify-center">
            <div id="googleSignInButton"></div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-500 hover:text-green-400 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
