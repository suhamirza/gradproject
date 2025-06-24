const {
  Channel,
  ChannelMember,
  Message,
  MessageAttachment,
  MessageReadReceipt,
  MessageDeliveryLog,
  ChatNotification
} = require('../../models');

// Channel Operations
async function createChannel(organizationId, name, type, ownerId, ownerName) {
  const channel = new Channel({
    organizationId,
    name,
    type,
    ownerId,
    ownerName
  });
  await channel.save();
  
  // Add owner as member
  await addChannelMember(channel._id, ownerId, ownerName);
  return channel;
}

async function getChannel(channelId) {
  return await Channel.findById(channelId);
}

async function updateChannel(channelId, updates) {
  return await Channel.findByIdAndUpdate(channelId, updates, { new: true });
}

async function archiveChannel(channelId) {
  return await Channel.findByIdAndUpdate(channelId, { isArchived: true }, { new: true });
}

async function deleteChannel(channelId) {
  await Promise.all([
    Channel.findByIdAndDelete(channelId),
    ChannelMember.deleteMany({ channelId }),
    Message.deleteMany({ channelId }),
    ChatNotification.deleteMany({ channelId })
  ]);
  return true;
}

// Channel Member Operations
async function addChannelMember(channelId, userId, userName) {
  const member = new ChannelMember({
    channelId,
    userId,
    userName
  });
  return await member.save();
}

async function removeChannelMember(channelId, userId) {
  return await ChannelMember.findOneAndDelete({ channelId, userId });
}

async function getChannelMembers(channelId) {
  return await ChannelMember.find({ channelId, isActive: true });
}

async function updateMemberStatus(channelId, userId, isActive) {
  return await ChannelMember.findOneAndUpdate(
    { channelId, userId },
    { isActive },
    { new: true }
  );
}

// Message Operations
async function sendMessage(channelId, senderId, senderName, content, type = 'text') {
  const message = new Message({
    channelId,
    senderId,
    senderName,
    content,
    type
  });
  await message.save();

  // Create delivery logs for all channel members
  const members = await getChannelMembers(channelId);
  const deliveryLogs = members.map(member => ({
    messageId: message._id,
    userId: member.userId,
    userName: member.userName,
    status: 'pending'
  }));
  await MessageDeliveryLog.insertMany(deliveryLogs);

  // Create notifications for all members except sender
  const notifications = members
    .filter(member => member.userId !== senderId)
    .map(member => ({
      userId: member.userId,
      channelId,
      messageId: message._id,
      type: 'new_message'
    }));
  await ChatNotification.insertMany(notifications);

  return message;
}

async function getMessages(channelId, limit = 50, before = null) {
  const query = { channelId, isDeleted: false };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  return await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function deleteMessage(messageId) {
  return await Message.findByIdAndUpdate(messageId, { isDeleted: true }, { new: true });
}

async function editMessage(messageId, content) {
  return await Message.findByIdAndUpdate(
    messageId,
    { 
      content,
      isEdited: true,
      editedAt: new Date()
    },
    { new: true }
  );
}

// Message Attachment Operations
async function addMessageAttachment(messageId, fileId, fileName, fileType, fileSize) {
  const attachment = new MessageAttachment({
    messageId,
    fileId,
    fileName,
    fileType,
    fileSize
  });
  return await attachment.save();
}

async function getMessageAttachments(messageId) {
  return await MessageAttachment.find({ messageId });
}

// Read Receipt Operations
async function markMessageAsRead(messageId, userId, userName) {
  const receipt = new MessageReadReceipt({
    messageId,
    userId,
    userName
  });
  await receipt.save();

  // Update message status to read for this user
  await MessageDeliveryLog.findOneAndUpdate(
    { messageId, userId },
    { status: 'delivered' }
  );

  // Mark notification as read
  await ChatNotification.findOneAndUpdate(
    { messageId, userId },
    { isRead: true }
  );

  return receipt;
}

async function getMessageReadReceipts(messageId) {
  return await MessageReadReceipt.find({ messageId });
}

// Delivery Log Operations
async function updateMessageDeliveryStatus(messageId, userId, status, error = null) {
  return await MessageDeliveryLog.findOneAndUpdate(
    { messageId, userId },
    { status, error },
    { new: true }
  );
}

async function getMessageDeliveryLogs(messageId) {
  return await MessageDeliveryLog.find({ messageId });
}

// Notification Operations
async function getUnreadNotifications(userId) {
  return await ChatNotification.find({ userId, isRead: false });
}

async function markNotificationAsRead(notificationId) {
  return await ChatNotification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
}

async function markAllNotificationsAsRead(userId, channelId) {
  return await ChatNotification.updateMany(
    { userId, channelId, isRead: false },
    { isRead: true }
  );
}

// Utility Functions
async function getUserChannels(userIdOrName) {
  console.log('🔍 getUserChannels called with:', userIdOrName);
  
  // Try username first (this is what's actually stored)
  let memberships = await ChannelMember.find({ userName: userIdOrName, isActive: true });
  console.log('📋 Found by userName:', memberships.length);
  
  // If not found, try by userId
  if (memberships.length === 0) {
    memberships = await ChannelMember.find({ userId: userIdOrName, isActive: true });
    console.log('📋 Found by userId:', memberships.length);
  }
  
  const channelIds = memberships.map(m => m.channelId);
  const channels = await Channel.find({ _id: { $in: channelIds } });
  console.log('🏠 Returning channels:', channels.length);
  return channels;
}
async function getMessage(messageId) {
  return await Message.findById(messageId);
}

async function getChannelStats(channelId) {
  const [messageCount, memberCount] = await Promise.all([
    Message.countDocuments({ channelId, isDeleted: false }),
    ChannelMember.countDocuments({ channelId, isActive: true })
  ]);
  return { messageCount, memberCount };
}

module.exports = {
  // Channel Operations
  createChannel,
  getChannel,
  updateChannel,
  archiveChannel,
  deleteChannel,

  // Channel Member Operations
  addChannelMember,
  removeChannelMember,
  getChannelMembers,
  updateMemberStatus,

  // Message Operations
  sendMessage,
  getMessage,
  getMessages,
  deleteMessage,
  editMessage,

  // Message Attachment Operations
  addMessageAttachment,
  getMessageAttachments,

  // Read Receipt Operations
  markMessageAsRead,
  getMessageReadReceipts,

  // Delivery Log Operations
  updateMessageDeliveryStatus,
  getMessageDeliveryLogs,

  // Notification Operations
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  // Utility Functions
  getUserChannels,
  getChannelStats
};
