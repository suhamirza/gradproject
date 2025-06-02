// API Configuration for Taskify Backend Services
export const API_CONFIG = {
  BASE_URL: 'http://localhost',
  SERVICES: {
    USER_SERVICE: 'http://localhost:5000/api',
    TASK_SERVICE: 'http://localhost:3001/api', 
    CHAT_SERVICE: 'http://localhost:3003/api',
    NOTIFICATION_SERVICE: 'http://localhost:3002/api'
  },
  ENDPOINTS: {    // User Service Authentication Endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      VERIFY: '/auth/verify-email',
      REFRESH: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      RESEND_VERIFICATION: '/auth/resend-verification-code'
    },
    // Task Service Endpoints  
    TASKS: {
      LISTS: '/lists',
      TASKS: '/tasks',
      ORGANIZATIONS: '/organizations'
    },
    // Chat Service Endpoints
    CHAT: {
      MESSAGES: '/messages',
      CHANNELS: '/channels',
      MEMBERS: '/members'
    },
    // Notification Service Endpoints
    NOTIFICATIONS: {
      GET: '/notifications',
      MARK_READ: '/notifications/read',
      MARK_ALL_READ: '/notifications/read-all'
    }
  }
} as const;

export default API_CONFIG;
