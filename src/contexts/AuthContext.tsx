
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserData, UserRole } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { geocodeLocation } from '@/services/geocodingService';

interface LocationData {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  userLocation: LocationData | null;
  refreshUserLocation: () => Promise<void>;
  login: (token: string) => void;
  loginWithGoogle: (token: string) => Promise<void>;
  loginWithFace: (faceId: string) => Promise<void>;
  logout: () => void;
  updateUserRole: (role: UserRole) => Promise<void>;
  verifyFaceLogin: (faceId: string, email?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const navigate = useNavigate();

  // Function to fetch and set user location data
  const fetchUserLocation = async (user: UserData | null) => {
    if (!user || !user.city || !user.country) {
      return null;
    }

    setUserLocation(prev => prev ? { ...prev, isLoading: true, error: null } : {
      city: user.city,
      country: user.country,
      coordinates: { lat: 0, lng: 0 },
      isLoading: true,
      error: null
    });

    try {
      const coordinates = await geocodeLocation(user.city, user.country);
      
      setUserLocation({
        city: user.city,
        country: user.country,
        coordinates,
        isLoading: false,
        error: null
      });

      // Store coordinates in localStorage for quick access
      localStorage.setItem('userCoordinates', JSON.stringify(coordinates));
      return coordinates;
    } catch (error) {
      console.error("Error fetching user location:", error);
      setUserLocation(prev => prev ? { ...prev, isLoading: false, error: String(error) } : null);
      return null;
    }
  };

  // Refresh user location (can be called from other components)
  const refreshUserLocation = async () => {
    await fetchUserLocation(user);
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        // Check for existing token
        const token = localStorage.getItem('auth-token');
        if (token) {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            
            // If user has a country selected, ensure it's set in localStorage
            if (currentUser.country) {
              localStorage.setItem('userCountry', currentUser.country.code);
              localStorage.setItem('userCountryName', currentUser.country.name);
              
              // Fetch coordinates for the user's location
              fetchUserLocation(currentUser);
            }
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    
    // Try auto Google login if available
    // This is a simplified example - in production you would use the Google Identity Services library
    const attemptGoogleAutoLogin = async () => {
      try {
        if (window.google && window.google.accounts) {
          console.log("Attempting auto Google login...");
          // The actual implementation would initialize Google's Identity Services
          // and check for an existing session
        }
      } catch (error) {
        console.error("Error during Google auto login:", error);
      }
    };
    
    attemptGoogleAutoLogin();
  }, [navigate]);

  const login = (token: string) => {
    localStorage.setItem('auth-token', token);
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
  };

  const loginWithGoogle = async (token: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem('auth-token', token);
      const userData = await authService.loginWithGoogle(token);
      setUser(userData);
      
      // If this is the user's first login with Google, redirect to face verification
      if (userData.needsFaceVerification) {
        navigate('/face-verification');
      } else {
        navigate('/');
        
        // Fetch location data for the user
        if (userData.city && userData.country) {
          fetchUserLocation(userData);
        }
      }
      
      toast({
        title: "Google login successful",
        description: "Welcome to FuelFriendly!",
      });
    } catch (error) {
      console.error("Error during Google login:", error);
      toast({
        title: "Login failed",
        description: "Could not log in with Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loginWithFace = async (faceId: string) => {
    setIsLoading(true);
    try {
      const userData = await authService.loginWithFace(faceId);
      if (userData) {
        localStorage.setItem('auth-token', userData.token);
        setUser(userData);
        navigate('/');
        
        // Fetch location data for the user
        if (userData.city && userData.country) {
          fetchUserLocation(userData);
        }
        
        toast({
          title: "Face login successful",
          description: "Welcome back!",
        });
      }
    } catch (error) {
      console.error("Error during face login:", error);
      toast({
        title: "Login failed",
        description: "Face verification failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyFaceLogin = async (faceId: string, email?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authService.verifyFace(faceId, email);
      return result;
    } catch (error) {
      console.error("Error during face verification:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserLocation(null);
    localStorage.removeItem('userCoordinates');
    navigate('/welcome');
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await authService.updateUserRole(user.uid, role);
      setUser({ ...user, role });
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isLoggedIn: !!user,
    userLocation,
    refreshUserLocation,
    login,
    loginWithGoogle,
    loginWithFace,
    logout,
    updateUserRole,
    verifyFaceLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
