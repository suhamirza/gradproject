const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const {
  createChannel,
  getChannel,
  updateChannel,
  archiveChannel,
  deleteChannel,
  addChannelMember,
  removeChannelMember,
  getChannelMembers,
  updateMemberStatus,
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
  addMessageAttachment,
  getMessageAttachments,
  markMessageAsRead,
  getMessageReadReceipts,
  updateMessageDeliveryStatus,
  getMessageDeliveryLogs,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserChannels,
  getChannelStats
} = require('./services/chatservice/chatservice');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;
const MONGO_CONNECTION = process.env.MONGO_CONNECTION || 'mongodb://localhost:27017/ChatDB';

// Connect to MongoDB
mongoose.connect(MONGO_CONNECTION)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Store connected users and their socket IDs
const connectedUsers = new Map();
const authMiddleware = require('./middleware/authMiddleware');

// Socket.IO middleware for JWT validation
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('🔐 Socket auth attempt, token present:', !!token);
  
  if (!token) {
    console.error('❌ Authentication error: No token provided');
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    console.log('🔍 Attempting to verify JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verified successfully');
    console.log('📋 Token payload:', {
      nameid: decoded.nameid,
      unique_name: decoded.unique_name,
      organizationId: decoded.organizationId,
      allClaims: Object.keys(decoded)
    });
    
    socket.user = {
      id: decoded.nameid,
      username: decoded.unique_name,
      organizationId: decoded.organizationId
    };
    console.log('👤 Socket user set:', socket.user);
    next();
  } catch (error) {
    console.error('❌ JWT verification failed:', error.message);
    console.error('🔍 JWT_SECRET present:', !!process.env.JWT_SECRET);
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Debug: Listen for all events
  socket.onAny((eventName, ...args) => {
    console.log(`🎯 Socket event received: ${eventName}`, args);
  });

  // Add event debugging - log all events received
  socket.onAny((eventName, ...args) => {
    console.log(`🎯 Event received: ${eventName}`, args);
  });

  // Handle user joining
  socket.on('join', async () => {
    try {
      const userId = socket.user.id;
      const organizationId = socket.user.organizationId;
      const username = socket.user.username;

      // Store user connection
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.organizationId = organizationId;
      socket.username = username;

      // Get user's channels
      const channels = await getUserChannels(userId);

      // Join socket rooms for each channel
      channels.forEach(channel => {
        socket.join(channel._id.toString());
      });

      // Send channel list to user
      socket.emit('channels', channels);

      // Notify others in the organization
      socket.to(organizationId).emit('userOnline', { userId });
    } catch (error) {
      console.error('Error in join:', error);
      socket.emit('error', { message: 'Failed to join' });
    }
  });
  // Handle joining a specific channel
  socket.on('joinChannel', async ({ channelId }) => {
    console.log('🏠 joinChannel event received:', { channelId, userId: socket.user.id });
    try {
      const userId = socket.user.id;

      const channel = await getChannel(channelId);
      if (!channel) {
        return socket.emit('error', { message: 'Channel not found' });
      }

      // Check if user is a member
      const members = await getChannelMembers(channelId);
      const isMember = members.some(member => member.userId === userId);

      if (!isMember) {
        return socket.emit('error', { message: 'Not a member of this channel' });
      }

      // Join the channel room
      socket.join(channelId);

      // Get recent messages and read receipts
      const messages = await getMessages(channelId);
      const readReceipts = await getMessageReadReceipts(messages.map(m => m._id));

      socket.emit('channelMessages', {
        channelId,
        messages,
        readReceipts
      });
    } catch (error) {
      console.error('Error in joinChannel:', error);
      socket.emit('error', { message: 'Failed to join channel' });
    }
  });
  // Handle chat messages
  socket.on('message', async (data) => {
    console.log('📨 Message event received:', data);
    console.log('👤 From user:', socket.user);
    try {
      const { channelId, content, type = 'text' } = data;
      const userId = socket.user.id;
      const username = socket.user.username;
      
      // Send message using chat service
      const message = await sendMessage(
        channelId,
        userId,
        username,
        content,
        type
      );

      // Broadcast message to channel
      io.to(channelId).emit('message', {
        ...message.toObject(),
        deliveryStatus: 'delivered'
      });
    } catch (error) {
      console.error('Error in message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle message read
  socket.on('messageRead', async ({ messageId }) => {
    try {
      const userId = socket.user.id;
      const username = socket.user.username;

      // Mark message as read using chat service
      await markMessageAsRead(messageId, userId, username);

      // Notify sender
      const message = await getMessage(messageId);
      const senderSocketId = connectedUsers.get(message.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageStatus', {
          messageId,
          status: 'read',
          readBy: userId
        });
      }
    } catch (error) {
      console.error('Error in messageRead:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      io.to(socket.organizationId).emit('userOffline', { userId: socket.userId });
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Get user's channels
app.get('/channels', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const channels = await getUserChannels(userId);
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get channel messages
app.get('/channels/:channelId/messages', authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const messages = await getMessages(channelId, limit, page);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create new channel
app.post('/channels', authMiddleware, async (req, res) => {
  try {
    const { name, type, organizationId } = req.body;
    const ownerId = req.user.id;
    const ownerName = req.user.username;
    const channel = await createChannel(organizationId, name, type, ownerId, ownerName);
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Add member to channel
app.post('/channels/:channelId/members', authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId, userName } = req.body;

    const member = await addChannelMember(channelId, userId, userName);

    // Notify channel members
    io.to(channelId).emit('memberJoined', {
      channelId,
      userId
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from channel
app.delete('/channels/:channelId/members/:userId', authMiddleware, async (req, res) => {
  try {
    const { channelId, userId } = req.params;
    await removeChannelMember(channelId, userId);
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get channel members
app.get('/channels/:channelId/members', authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const members = await getChannelMembers(channelId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get unread notifications
app.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await getUnreadNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/notifications/:notificationId', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await markNotificationAsRead(notificationId);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get channel stats
app.get('/channels/:channelId/stats', authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const stats = await getChannelStats(channelId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channel stats' });
  }
});

server.listen(PORT, () => {
  console.log(`Chat Service listening on port ${PORT}`);
});