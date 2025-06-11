const mongoose = require('mongoose');

const messageAttachmentSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  fileId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    allowNull: false,
    required: true
  },
  fileType: {
    type: String,
    allowNull: false,
    required: true   
  },
  fileSize: {
    type: Number,
    allowNull: false,
    max: 10 * 1024 * 1024,
    required: true
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});

module.exports = mongoose.model('MessageAttachment', messageAttachmentSchema); 