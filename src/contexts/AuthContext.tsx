
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserData, UserRole } from '@/services/authService';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (token: string) => void;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  updateUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (token: string) => {
    localStorage.setItem('auth-token', token);
  };

  const loginWithGoogle = async (token: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem('auth-token', token);
      const userData = await authService.loginWithGoogle(token);
      setUser(userData);
    } catch (error) {
      console.error("Error during Google login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
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
    login,
    loginWithGoogle,
    logout,
    updateUserRole,
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
