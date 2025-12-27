const mongoose = require('mongoose');
const { Schema } = mongoose;

const lendItemSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'general' },
  condition: { type: String, default: 'good' },
  quantity: { type: Number, default: 1 },
  availableQuantity: { type: Number, default: 1 },
  listingType: { type: String, enum: ['lend', 'donate', 'both'], default: 'lend' },
  location: {
    locality: String,
    city: String,
    pincode: String,
    coordinates: { type: [Number], default: undefined }
  },
  images: [{ url: String, publicId: String }],
  status: { type: String, enum: ['available', 'reserved', 'cancelled'], default: 'available' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Stubbed simple matching function
lendItemSchema.methods.findMatches = async function () {
  // In a real app this would find matching NGOs/recyclers/local households.
  // For now, it's a no-op to satisfy controller behavior.
  return [];
};

module.exports = mongoose.model('LendItem', lendItemSchema);
