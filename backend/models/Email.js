import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messageId: {
    type: String,
    required: true
  },
  threadId: String,
  subject: String,
  sender: String,
  receiver: String,
  date: Date,
  snippet: String,
  content: String,
  isSpam: {
    type: Boolean,
    default: false
  },
  spamScore: {
    type: Number,
    default: 0
  },
  spamReason: String, // e.g., "Phishing keywords detected", "Unauthorized link"
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Prevent duplicate messages for the same user
emailSchema.index({ user: 1, messageId: 1 }, { unique: true });

// Auto-delete emails older than 7 days (604800 seconds)
emailSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model('Email', emailSchema);
