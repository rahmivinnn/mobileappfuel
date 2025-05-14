
// Define user roles
export type UserRole = 'USER' | 'AGENT' | 'ADMIN';

// Define country and city type
export interface CountryCity {
  code: string;
  name: string;
}

// Define user data structure
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  city?: string;
  country?: string;
  token?: string;
}

// Authentication service
class AuthService {
  // Simplified authentication with mock data
  async getCurrentUser(): Promise<UserData | null> {
    try {
      // In a real app, this would validate the token with the backend
      const token = localStorage.getItem('auth-token');
      if (!token) return null;
      
      // For demo purposes, return a mock user
      return {
        uid: 'user123',
        email: 'user@example.com',
        displayName: 'Demo User',
        role: 'USER',
        city: localStorage.getItem('userCity') || 'Jakarta',
        country: localStorage.getItem('userCountryName') || 'Indonesia'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async loginWithGoogle(token: string): Promise<UserData> {
    // Mock implementation - would validate with backend in real app
    return {
      uid: 'google123',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: '/lovable-uploads/8a188651-80ec-4a90-8d5c-de0df713b6c7.png',
      role: 'USER',
      city: localStorage.getItem('userCity') || 'Jakarta',
      country: localStorage.getItem('userCountryName') || 'Indonesia',
      token
    };
  }

  async updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    // Mock implementation - would update with backend in real app
    console.log(`Updated role for ${uid} to ${newRole}`);
  }

  logout(): void {
    localStorage.removeItem('auth-token');
    // Clear any other user-related data
  }
}

export const authService = new AuthService();
