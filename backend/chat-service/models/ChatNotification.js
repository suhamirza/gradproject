const mongoose = require('mongoose');

const chatNotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  type: {
    type: String,
    enum: ['new_message', 'mention'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for user and channel
chatNotificationSchema.index({ userId: 1, channelId: 1 });

module.exports = mongoose.model('ChatNotification', chatNotificationSchema); 