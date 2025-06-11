const mongoose = require('mongoose');

const messageDeliveryLogSchema = new mongoose.Schema({
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
    allowNull: false,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for message and user
messageDeliveryLogSchema.index({ messageId: 1, userId: 1 });

module.exports = mongoose.model('MessageDeliveryLog', messageDeliveryLogSchema); 