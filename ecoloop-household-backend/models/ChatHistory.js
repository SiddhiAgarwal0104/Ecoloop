// models/ChatHistory.js
// Stores last 5 messages for each user for context-aware AI

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  role: { type: String, required: true },
  messages: { type: [messageSchema], default: [] }, // Only last 5
  updatedAt: { type: Date, default: Date.now },
});

chatHistorySchema.pre('save', function (next) {
  if (this.messages.length > 5) {
    this.messages = this.messages.slice(-5);
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);