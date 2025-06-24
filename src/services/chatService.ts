import { tokenManager } from './httpClient';
import type { 
  Chat, 
  Message, 
  ChannelMember
} from '../types/chat';

const CHAT_SERVICE_URL = 'http://localhost:3003'; // Chat service port

class ChatService {
  /**
   * Get all channels for the current user's organization
   */
  async getChannels(): Promise<Chat[]> {
    try {
      const token = tokenManager.getToken();      // Just get all channels for now, filter by organization on frontend if needed
      const response = await fetch(`${CHAT_SERVICE_URL}/channels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch channels: ${response.statusText}`);
      }

      const data = await response.json();      const channels = data.channels || data;
      
      // Don't filter by organizationId - return all channels for the user
      // if (organizationId && Array.isArray(channels)) {
      //   return channels.filter(channel => channel.organizationId === organizationId);
      // }
      
      return channels;
    } catch (error) {
      console.error('Error fetching channels:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * Get messages for a specific channel
   */
  async getMessages(channelId: string, limit: number = 50, before?: string): Promise<Message[]> {
    try {
      const token = tokenManager.getToken();
      let url = `${CHAT_SERVICE_URL}/channels/${channelId}/messages?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Create a new channel
   */
  async createChannel(organizationId: string | undefined, name: string, type: 'private' | 'public', members: string[]): Promise<Chat> {
    try {
      const token = tokenManager.getToken();
      const response = await fetch(`${CHAT_SERVICE_URL}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },        body: JSON.stringify({
          organizationId: organizationId || null,
          name,
          type,
          members
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create channel: ${response.statusText}`);
      }

      const data = await response.json();
      return data.channel || data;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  }

  /**
   * Add member to channel
   */  async addChannelMember(channelId: string, userId: string, userName: string): Promise<ChannelMember> {
    try {
      const token = tokenManager.getToken();
      const response = await fetch(`${CHAT_SERVICE_URL}/channels/${channelId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          userName
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add member: ${response.statusText}`);
      }

      const data = await response.json();
      return data.member || data;
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  /**
   * Remove member from channel
   */  async removeChannelMember(channelId: string, userId: string): Promise<void> {
    try {
      const token = tokenManager.getToken();
      const response = await fetch(`${CHAT_SERVICE_URL}/channels/${channelId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to remove member: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Get channel members
   */  async getChannelMembers(channelId: string): Promise<ChannelMember[]> {
    try {
      const token = tokenManager.getToken();
      const response = await fetch(`${CHAT_SERVICE_URL}/channels/${channelId}/members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`);
      }

      const data = await response.json();
      return data.members || data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const token = tokenManager.getToken();
      const response = await fetch(`${CHAT_SERVICE_URL}/api/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to mark message as read: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }  }

  /**
   * Send a message to a channel via REST API (fallback)
   */
  async sendMessage(messageData: { channelId: string; content: string; type: string }): Promise<Message> {
    try {
      const token = tokenManager.getToken();
      const response = await fetch(`${CHAT_SERVICE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message || data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  /**
   * Get unread notifications count for user
   */
  async getUnreadCount(userId: string, channelId?: string): Promise<number> {
    try {
      const token = tokenManager.getToken();
      let url = `${CHAT_SERVICE_URL}/api/notifications/unread?userId=${userId}`;
      if (channelId) {
        url += `&channelId=${channelId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Return 0 instead of throwing error if endpoint doesn't exist
        console.warn('Unread count endpoint not available');
        return 0;
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0; // Graceful fallback
    }
  }

  /**
   * Add a member to a channel
   */  async addMember(channelId: string, memberName: string): Promise<void> {
    try {
      const token = tokenManager.getToken();
      const response = await fetch(`${CHAT_SERVICE_URL}/channels/${channelId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberName })
      });

      if (!response.ok) {
        throw new Error(`Failed to add member: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  /**
   * Remove a member from a channel
   */  async removeMember(channelId: string, memberName: string): Promise<void> {
    try {
      const token = tokenManager.getToken();
      const response = await fetch(`${CHAT_SERVICE_URL}/channels/${channelId}/members/${memberName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to remove member: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
