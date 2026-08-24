import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String },
  street: { type: String },
  city: { type: String },
  postalCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // Optional for OAuth accounts
  role: { type: String, default: 'customer' },
  provider: { type: String, enum: ['email', 'google', 'apple', 'github', 'system'], default: 'email' },
  avatar: { type: String },
  points: { type: Number, default: 200 },
  isDemo: { type: Boolean, default: false },
  phone: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [addressSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);

