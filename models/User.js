import mongoose from 'mongoose';  // Use import for Mongoose

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export the model using export default
export default mongoose.model('User', UserSchema);