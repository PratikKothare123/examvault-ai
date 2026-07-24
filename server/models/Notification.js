const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user ID is required'],
    },
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      required: [true, 'Associated paper ID is required'],
    },
    type: {
      type: String,
      enum: ['PAPER_APPROVED', 'PAPER_REJECTED'],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);