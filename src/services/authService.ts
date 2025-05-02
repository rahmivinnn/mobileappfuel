
import { toast } from '@/hooks/use-toast';

// Role-based authentication types
export type UserRole = 'customer' | 'agent';

export interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
}

// This is a mock implementation - replace with actual backend integration
export const authService = {
  // Store user in localStorage for demo
  storeUser: (userData: UserData): void => {
    localStorage.setItem('user-data', JSON.stringify(userData));
  },
  
  // Get current user
  getCurrentUser: (): UserData | null => {
    const userData = localStorage.getItem('user-data');
    return userData ? JSON.parse(userData) : null;
  },
  
  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return localStorage.getItem('auth-token') !== null;
  },
  
  // Get user token
  getToken: (): string | null => {
    return localStorage.getItem('auth-token');
  },
  
  // Login with email/password
  loginWithEmailPassword: async (email: string, password: string): Promise<UserData> => {
    // Mock implementation - replace with actual backend call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: UserData = {
          uid: 'mock-user-' + Math.random().toString(36).substring(2, 9),
          displayName: email.split('@')[0],
          email: email,
          photoURL: null,
          role: 'customer' // Default role
        };
        
        authService.storeUser(mockUser);
        resolve(mockUser);
      }, 1000);
    });
  },
  
  // Login with Google
  loginWithGoogle: async (token: string): Promise<UserData> => {
    // Mock implementation - replace with actual backend call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: UserData = {
          uid: 'google-user-' + Math.random().toString(36).substring(2, 9),
          displayName: 'Google User',
          email: 'user@gmail.com',
          photoURL: 'https://ui-avatars.com/api/?name=Google+User&background=random',
          role: 'customer' // Default role
        };
        
        authService.storeUser(mockUser);
        resolve(mockUser);
      }, 500);
    });
  },
  
  // Logout
  logout: (): void => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  },
  
  // Update user role
  updateUserRole: (uid: string, role: UserRole): Promise<void> => {
    // Mock implementation - replace with actual backend call
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = authService.getCurrentUser();
        if (userData) {
          userData.role = role;
          authService.storeUser(userData);
        }
        resolve();
      }, 500);
    });
  }
};
