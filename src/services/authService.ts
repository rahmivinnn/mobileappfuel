
import { toast } from '@/hooks/use-toast';

// Role-based authentication types
export type UserRole = 'customer' | 'agent';

export interface CountryCity {
  code: string;
  name: string;
  city: string;
}

export interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  country?: CountryCity;
  faceId?: string;
  needsFaceVerification?: boolean;
  token?: string;
}

// This is a mock implementation - replace with actual backend integration
export const authService = {
  // Store user in localStorage for demo
  storeUser: (userData: UserData): void => {
    localStorage.setItem('user-data', JSON.stringify(userData));
  },
  
  // Get current user
  getCurrentUser: async (): Promise<UserData | null> => {
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
          role: 'customer', // Default role
          needsFaceVerification: true // New users need face verification
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
        // Check if we have a user already stored with this email
        // In a real app, you'd verify the token with Google and get the email
        const existingUserData = localStorage.getItem('user-data');
        let isNewUser = true;
        let mockUser: UserData;
        
        if (existingUserData) {
          const existing = JSON.parse(existingUserData);
          if (existing.email === 'user@gmail.com') { // In real app, check actual email from token
            isNewUser = false;
            mockUser = existing;
          }
        }
        
        if (isNewUser) {
          mockUser = {
            uid: 'google-user-' + Math.random().toString(36).substring(2, 9),
            displayName: 'Google User',
            email: 'user@gmail.com',
            photoURL: 'https://ui-avatars.com/api/?name=Google+User&background=random',
            role: 'customer', // Default role
            needsFaceVerification: true // First time Google users need face verification
          };
        }
        
        authService.storeUser(mockUser);
        resolve(mockUser);
      }, 500);
    });
  },
  
  // Login with Face
  loginWithFace: async (faceId: string): Promise<UserData> => {
    // Mock implementation - replace with actual backend call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userData = localStorage.getItem('user-data');
        if (userData) {
          const user = JSON.parse(userData);
          // Check if the face ID matches (in a real app, this would be done by the face API)
          if (user.faceId === faceId || !user.faceId) {
            // If no faceId is stored yet, we accept and store the new one (first login)
            if (!user.faceId) {
              user.faceId = faceId;
              authService.storeUser(user);
            }
            user.token = 'face-auth-' + Math.random().toString(36).substring(2, 9);
            resolve(user);
          } else {
            reject(new Error("Face verification failed"));
          }
        } else {
          reject(new Error("No user found"));
        }
      }, 800);
    });
  },
  
  // Verify face
  verifyFace: async (faceId: string, email?: string): Promise<boolean> => {
    // Mock implementation - replace with actual face verification API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would send the face data to your face verification API
        // and compare it with stored data or register a new face
        const successRate = 0.85; // 85% success rate for demo
        const success = Math.random() < successRate;
        
        if (success) {
          // If successful and we have user data, update the faceId
          const userData = localStorage.getItem('user-data');
          if (userData) {
            const user = JSON.parse(userData);
            user.faceId = faceId;
            authService.storeUser(user);
          }
        }
        
        resolve(success);
      }, 1200);
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
      setTimeout(async () => {
        const userData = await authService.getCurrentUser();
        if (userData) {
          userData.role = role;
          authService.storeUser(userData);
        }
        resolve();
      }, 500);
    });
  },
  
  // Update user country & city
  updateUserCountry: (uid: string, country: CountryCity): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const userData = await authService.getCurrentUser();
        if (userData) {
          userData.country = country;
          authService.storeUser(userData);
          
          // Also update localStorage for app-wide access
          localStorage.setItem('userCountry', country.code);
          localStorage.setItem('userCountryName', country.name);
        }
        resolve();
      }, 300);
    });
  }
};
