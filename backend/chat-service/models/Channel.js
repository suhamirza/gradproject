const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  organizationId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['private', 'public'],
    required: true
  },
  ownerId: {
    type: String,
    required: true
  },  
  ownerName: {
    type: String,
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Channel', channelSchema); 