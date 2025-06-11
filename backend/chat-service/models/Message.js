const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    allowNull: false,
    required: true
  },
  content: {
    type: String,
    allowNull: false,
    maxlength: 1000,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'system', 'image', 'video', 'audio', 'location', 'contact', 'sticker', 'poll', 'link', 'event', 'task', 'note', 'reminder', 'checklist', 'document', 'spreadsheet', 'presentation', 'pdf', 'word', 'excel', 'powerpoint', 'other'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema); 