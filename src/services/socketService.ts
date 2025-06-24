import { io, Socket } from 'socket.io-client';
import { tokenManager } from './httpClient';
import type { SocketMessageData, SocketMessageReadData } from '../types/chat';

const CHAT_SERVICE_URL = 'http://localhost:3003';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  /**
   * Initialize socket connection with authentication
   */
  connect(userId: string, organizationId?: string): Socket | null {
    if (this.socket && this.isConnected) {
      return this.socket;
    }    const token = tokenManager.getToken();
    if (!token) {
      console.error('No auth token available for socket connection');
      return null;
    }

    console.log('🔌 Connecting socket with:', { userId, organizationId });// Debug: decode token to see what we're sending
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
        console.log('🔍 Token payload being sent to socket:', {
          nameid: payload.nameid,
          unique_name: payload.unique_name,
          organizationId: payload.organizationId,
          userId: payload.userId,
          id: payload.id,
          sub: payload.sub,
          allClaims: Object.keys(payload)
        });
        
        // If the token doesn't have the expected claims, let's try to work around it
        if (!payload.nameid && (payload.userId || payload.id || payload.sub)) {
          console.warn('⚠️ Token missing nameid claim, backend may reject connection');
        }
        if (!payload.unique_name && payload.username) {
          console.warn('⚠️ Token missing unique_name claim, backend may reject connection');  
        }
      }
    } catch (e) {
      console.error('Failed to decode token for debugging:', e);
    }    try {
      this.socket = io(CHAT_SERVICE_URL, {
        auth: {
          token: token,
          organizationId: organizationId
        },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected to chat service');
        this.isConnected = true;
        
        // Join user's personal room for notifications
        this.socket?.emit('join', { userId });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        this.isConnected = false;
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      return null;
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket disconnected');
    }
  }  /**
   * Join a specific channel
   */
  joinChannel(channelId: string): void {
    if (this.socket && this.isConnected) {
      console.log('🏠 Emitting joinChannel event:', { channelId });
      console.log('🔌 Socket connected:', this.socket.connected);
      this.socket.emit('joinChannel', { channelId });
      console.log(`📥 Joined channel: ${channelId}`);
    } else {
      console.error('❌ Cannot join channel - socket not connected');
      console.log('🔌 Socket exists:', !!this.socket);
      console.log('🔌 Socket connected:', this.socket?.connected);
      console.log('🔗 isConnected flag:', this.isConnected);
    }
  }

  /**
   * Leave a specific channel
   */
  leaveChannel(channelId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveChannel', { channelId });
      console.log(`📤 Left channel: ${channelId}`);
    }
  }
  /**
   * Send a message to a channel
   */
  sendMessage(channelId: string, content: string, type: string = 'text'): void {
    if (this.socket && this.isConnected) {
      console.log('📤 Emitting message event:', { channelId, content, type });
      console.log('🔌 Socket connected:', this.socket.connected);
      console.log('🔗 isConnected flag:', this.isConnected);
      this.socket.emit('message', {
        channelId,
        content,
        type
      });
      console.log(`💬 Message sent to channel ${channelId}:`, content);
    } else {
      console.error('❌ Cannot send message - socket not connected');
      console.log('🔌 Socket exists:', !!this.socket);
      console.log('🔌 Socket connected:', this.socket?.connected);
      console.log('🔗 isConnected flag:', this.isConnected);
    }
  }

  /**
   * Mark a message as read
   */
  markMessageAsRead(messageId: string, channelId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('messageRead', {
        messageId,
        channelId
      });
      console.log(`✅ Marked message as read: ${messageId}`);
    }
  }

  /**
   * Listen for new messages
   */
  onMessage(callback: (data: SocketMessageData) => void): void {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }

  /**
   * Listen for message read receipts
   */
  onMessageRead(callback: (data: SocketMessageReadData) => void): void {
    if (this.socket) {
      this.socket.on('messageRead', callback);
    }
  }

  /**
   * Listen for user joined channel
   */
  onUserJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('userJoined', callback);
    }
  }

  /**
   * Listen for user left channel
   */
  onUserLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('userLeft', callback);
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
  /**
   * Check if socket is connected
   */
  isSocketConnected(): boolean {
    const connected = this.isConnected && this.socket?.connected === true;
    console.log('🔍 Socket connection check:', {
      isConnected: this.isConnected,
      socketConnected: this.socket?.connected,
      result: connected
    });
    return connected;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
