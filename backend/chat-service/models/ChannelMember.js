const mongoose = require('mongoose');

const channelMemberSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: {
    createdAt: 'joinedAt',
    updatedAt: false
  }
});

// Compound index for channel and user
channelMemberSchema.index({ channelId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ChannelMember', channelMemberSchema); 