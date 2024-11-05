import mongoose from 'mongoose';  // Use import for Mongoose
import { metadataSchema } from './Item.js'; 

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  items: [metadataSchema],
});

// Export the model using export default
export default mongoose.model('User', UserSchema);