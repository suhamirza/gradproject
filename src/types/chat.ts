// Chat service types - Backend Compatible

export interface Message {
  _id?: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  status: string;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

export interface ChannelMember {
  _id?: string;
  channelId: string;
  userId: string;
  userName: string;
  isActive: boolean;
  joinedAt: string;
}

export interface Chat {
  _id: string;
  organizationId: string;
  name: string;
  type: 'private' | 'public';
  ownerId: string;
  ownerName: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  // Frontend calculated fields (populated by API calls)
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  messages?: Message[];
  members?: ChannelMember[];
}

export interface MessageAttachment {
  _id?: string;
  messageId: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface MessageReadReceipt {
  _id?: string;
  messageId: string;
  userId: string;
  userName: string;
  readAt: string;
}

export interface MessageDeliveryLog {
  _id?: string;
  messageId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'delivered' | 'failed';
  deliveredAt?: string;
  error?: string;
}

export interface ChatNotification {
  _id?: string;
  userId: string;
  channelId: string;
  messageId: string;
  type: 'new_message' | 'mention' | 'channel_added';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface GetChatsResponse {
  chats: Chat[];
  success: boolean;
  error?: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  success: boolean;
  error?: string;
}

export interface SendMessageResponse {
  message: Message;
  success: boolean;
  error?: string;
}

export interface CreateChannelResponse {
  channel: Chat;
  success: boolean;
  error?: string;
}

// Socket.IO event data types
export interface SocketMessageData {
  channelId: string;
  message: Message;
}

export interface SocketJoinData {
  channelId: string;
}

export interface SocketMessageReadData {
  messageId: string;
  channelId: string;
}

export interface SocketUserJoinedData {
  channelId: string;
  userId: string;
  userName: string;
}
