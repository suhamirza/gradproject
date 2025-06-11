const mongoose = require('mongoose');

const messageReadReceiptSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for message and user
messageReadReceiptSchema.index({ messageId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('MessageReadReceipt', messageReadReceiptSchema); 