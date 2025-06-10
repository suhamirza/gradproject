import { API_CONFIG } from '../config/api';
import { apiClients, apiCall, tokenManager } from './httpClient';
import type { 
  SignUpRequest, 
  SignInRequest, 
  AuthResponse, 
  User,
  VerifyEmailResponse
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

      // The backend returns AuthResponse directly, not wrapped in ApiResponse
      const response = await apiCall<any>(
        apiClients.userService,
        'POST',
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      console.log('✅ Registration successful:', response);

      // The response IS the AuthResponse directly
      const authData = response.data || response; // Handle both wrapped and direct response

      // If registration successful and tokens provided, store them
      if (authData?.token) {
        tokenManager.setToken(authData.token);
        if (authData.refreshToken) {
          tokenManager.setRefreshToken(authData.refreshToken);
        }
      }

      return {
        success: true,
        message: 'Registration successful!',
        data: {
          token: authData.token,
          refreshToken: authData.refreshToken,
          verificationCode: authData.verificationCode,
          expiration: authData.expiration,
          user: authData.user
        }
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
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {    try {
      console.log('🔐 Attempting to sign in user:', credentials.username);

      // The backend returns AuthResponse directly, not wrapped in ApiResponse
      const response = await apiCall<any>(
        apiClients.userService,
        'POST',
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      console.log('✅ Sign in successful:', response);

      // The response IS the AuthResponse directly
      const authData = response.data || response; // Handle both wrapped and direct response

      // Store tokens if login successful
      if (authData?.token) {
        tokenManager.setToken(authData.token);
        if (authData.refreshToken) {
          tokenManager.setRefreshToken(authData.refreshToken);
        }
      }

      return {
        success: true,
        message: 'Sign in successful!',
        data: {
          token: authData.token,
          refreshToken: authData.refreshToken,
          verificationCode: authData.verificationCode,
          expiration: authData.expiration,
          user: authData.user
        }
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

  /**
   * Verify email with verification code
   */
  async verifyEmail(userId: string, verificationCode: string): Promise<VerifyEmailResponse> {
    try {
      console.log('🔍 Attempting to verify email for user:', userId);

      const response = await apiCall<any>(
        apiClients.userService,
        'POST',
        API_CONFIG.ENDPOINTS.AUTH.VERIFY,
        {
          userId,
          verificationCode
        }
      );

      console.log('✅ Email verification successful:', response);

      return {
        success: response.success || true,
        message: response.message || 'Email verified successfully!'
      };

    } catch (error: any) {
      console.error('❌ Email verification failed:', error);
      
      return {
        success: false,
        message: error.message || 'Verification failed. Please check your code and try again.'
      };
    }
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Resending verification code to:', email);

      const response = await apiCall<any>(
        apiClients.userService,
        'POST',
        API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION,
        { email }
      );

      console.log('✅ Verification code resent:', response);

      return {
        success: response.success || true,
        message: response.message || 'Verification code sent successfully!'
      };

    } catch (error: any) {
      console.error('❌ Failed to resend verification code:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to resend verification code. Please try again.'
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
