import { API_CONFIG } from '../config/api';
import { apiClients, apiCall, tokenManager } from './httpClient';
import type { 
  SignUpRequest, 
  SignInRequest, 
  AuthResponse, 
  User,
  ApiResponse 
} from '../types/api';

class AuthService {
  
  /**
   * Register a new user
   */
  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      console.log('🚀 Attempting to register user:', { 
        email: userData.email, 
        username: userData.username 
      });

      const response = await apiCall<AuthResponse['data']>(
        apiClients.userService,
        'POST',
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      console.log('✅ Registration successful:', response);

      // If registration successful and tokens provided, store them
      if (response.success && response.data?.token) {
        tokenManager.setToken(response.data.token);
        if (response.data.refreshToken) {
          tokenManager.setRefreshToken(response.data.refreshToken);
        }
      }

      return {
        success: response.success,
        message: response.message || 'Registration successful!',
        data: response.data
      };

    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.',
        data: undefined
      };
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting to sign in user:', credentials.email);

      const response = await apiCall<AuthResponse['data']>(
        apiClients.userService,
        'POST',
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      console.log('✅ Sign in successful:', response);

      // Store tokens if login successful
      if (response.success && response.data?.token) {
        tokenManager.setToken(response.data.token);
        if (response.data.refreshToken) {
          tokenManager.setRefreshToken(response.data.refreshToken);
        }
      }

      return {
        success: response.success,
        message: response.message || 'Sign in successful!',
        data: response.data
      };

    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      
      return {
        success: false,
        message: error.message || 'Sign in failed. Please check your credentials.',
        data: undefined
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiCall(
        apiClients.userService,
        'POST',
        API_CONFIG.ENDPOINTS.AUTH.LOGOUT
      );
    } catch (error) {
      console.warn('Logout endpoint call failed:', error);
    } finally {
      // Always clear local tokens
      tokenManager.clearAll();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = tokenManager.getToken();
    return !!token;
  }

  /**
   * Get current user info from token (if stored)
   */
  getCurrentUser(): User | null {
    // This would typically decode the JWT token
    // For now, return null - we'll implement this later
    return null;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await apiCall<{ token: string; refreshToken?: string }>(
        apiClients.userService,
        'POST',
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      if (response.success && response.data?.token) {
        tokenManager.setToken(response.data.token);
        if (response.data.refreshToken) {
          tokenManager.setRefreshToken(response.data.refreshToken);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      tokenManager.clearAll();
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
