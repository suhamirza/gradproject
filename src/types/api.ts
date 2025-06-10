// API Request and Response Types

// ============= AUTH TYPES =============

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    verificationCode?: string;
    expiration: string;
    user: User;
  };
}

export interface VerifyEmailRequest {
  userId: string;
  verificationCode: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ============= API RESPONSE TYPES =============

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: string[];
}

// ============= TASK TYPES =============

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  listId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  title: string;
  description?: string;
  visibility: 'private' | 'public';
  members: string[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

// ============= CHAT TYPES =============

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'group' | 'private';
  members: string[];
  createdAt: string;
  updatedAt: string;
}

// ============= NOTIFICATION TYPES =============

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  userId: string;
  createdAt: string;
}

export default {};
