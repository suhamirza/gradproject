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
      );      console.log('✅ Sign in successful - Full response:', JSON.stringify(response, null, 2));

      // The response IS the AuthResponse directly
      const authData = response.data || response; // Handle both wrapped and direct response
      console.log('📦 Extracted authData:', JSON.stringify(authData, null, 2));// Store tokens if login successful
      if (authData?.token) {
        console.log('✅ Storing token in localStorage:', authData.token.substring(0, 15) + '...');
        tokenManager.setToken(authData.token);
        if (authData.refreshToken) {
          tokenManager.setRefreshToken(authData.refreshToken);
        }
      } else {
        console.warn('⚠️ No token received from server in authData:', authData);
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
  }  /**
   * Get current user info from token (if stored)
   */  getCurrentUser(): User | null {
    try {
      const token = tokenManager.getToken();
      console.log('🔑 Retrieved token from storage:', token ? `${token.substring(0, 15)}...` : 'null');
      
      if (!token) {
        console.warn('⚠️ No token found in storage');
        return null;
      }

      // Decode JWT token to extract user info
      // JWT structure: header.payload.signature
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid JWT token format');
        return null;
      }
      
      // Decode the payload (base64url encoded)
      const payload = tokenParts[1];
      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      
      console.log('Decoded JWT payload:', decodedPayload);
      console.log('All available JWT claims:', Object.keys(decodedPayload));

      // Check if token is expired
      if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        console.warn('JWT token has expired');
        tokenManager.clearAll();
        return null;
      }
      
      // Extract user information from the payload
      // First, try to find a user ID from common JWT claims
      const userId = decodedPayload.userId || decodedPayload.id || decodedPayload.sub || decodedPayload.user_id || decodedPayload.nameid;
      
      if (userId) {
        console.log('Found user ID in token:', userId);
        
        // Check if the user object is nested in the payload
        const userDataField = decodedPayload.user || decodedPayload.userData || decodedPayload;
        
        // Prioritize unique_name from the token as the username
        // This is the username entered during signup
        const username = decodedPayload.unique_name || userDataField.username || userDataField.preferred_username || '';
        console.log('Username from token (unique_name):', username);
        
        // If we only have the user ID in the token, return a minimal user object
        const extractedUser = {
          id: userId,
          firstName: userDataField.firstName || userDataField.given_name || userDataField.name?.split(' ')[0] || '',
          lastName: userDataField.lastName || userDataField.family_name || (userDataField.name?.split(' ').length > 1 ? userDataField.name?.split(' ')[1] : '') || '',
          username: username,
          email: userDataField.email || '',
          createdAt: userDataField.createdAt || userDataField.created_at || '',
          updatedAt: userDataField.updatedAt || userDataField.updated_at || ''
        };

        console.log('Extracted user from token:', extractedUser);
        return extractedUser;
      }
      
      console.warn('❌ No identifiable user information found in token payload');
      console.log('Available claims:', Object.keys(decodedPayload));

      return null;
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      tokenManager.clearAll();
      return null;
    }
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
