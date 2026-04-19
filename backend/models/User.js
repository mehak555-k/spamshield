import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  profileImage: String,
  accessToken: String,
  refreshToken: String,
  lastSynced: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
