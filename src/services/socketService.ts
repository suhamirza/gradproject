import { io, Socket } from 'socket.io-client';
import { tokenManager } from './httpClient';
import type { SocketMessageData, SocketMessageReadData } from '../types/chat';

const CHAT_SERVICE_URL = 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  /**
   * Initialize socket connection with authentication
   */
  connect(userId: string): Socket | null {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const token = tokenManager.getToken();
    if (!token) {
      console.error('No auth token available for socket connection');
      return null;
    }

    try {
      this.socket = io(CHAT_SERVICE_URL, {
        auth: {
          token: token
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
  }

  /**
   * Join a specific channel
   */
  joinChannel(channelId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinChannel', { channelId });
      console.log(`📥 Joined channel: ${channelId}`);
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
      this.socket.emit('message', {
        channelId,
        content,
        type
      });
      console.log(`💬 Message sent to channel ${channelId}:`, content);
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
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
