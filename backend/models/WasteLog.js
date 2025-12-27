const mongoose = require('mongoose');

const { Schema } = mongoose;

const impactDefaults = {
  co2SavedKg: 0,
  energySavedKwh: 0,
  landfillReducedKg: 0
};

const wasteLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['plastic', 'wet', 'dry', 'metal', 'glass', 'paper', 'electronic', 'other'],
      default: 'other'
    },
    quantity: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, default: 'kg' }
    },

    wasteDate: { type: Date, default: Date.now },

    location: {
      locality: String,
      city: String,
      pincode: String,
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined
      }
    },

    notes: { type: String },

    image: {
      url: String,
      publicId: String,
      uploadedAt: Date
    },

    aiPrediction: {
      isUsed: { type: Boolean, default: false },
      predictedCategory: String,
      confidence: Number,
      suggestions: { type: Array, default: [] },
      wasModified: { type: Boolean, default: false }
    },

    impact: {
      co2SavedKg: { type: Number, default: impactDefaults.co2SavedKg },
      energySavedKwh: { type: Number, default: impactDefaults.energySavedKwh },
      landfillReducedKg: { type: Number, default: impactDefaults.landfillReducedKg }
    },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Simple impact multipliers (kg waste -> environmental benefits)
// Values are conservative examples for demonstration and can be tuned later.
const IMPACT_FACTORS = {
  plastic: { co2: 0.7, energy: 0.02, landfill: 0.9 },
  metal: { co2: 2.5, energy: 0.1, landfill: 1.0 },
  glass: { co2: 0.9, energy: 0.03, landfill: 0.9 },
  paper: { co2: 0.5, energy: 0.01, landfill: 0.8 },
  electronic: { co2: 5.0, energy: 0.3, landfill: 2.0 },
  wet: { co2: 0.05, energy: 0.0, landfill: 0.6 },
  dry: { co2: 0.1, energy: 0.01, landfill: 0.7 },
  other: { co2: 0.1, energy: 0.01, landfill: 0.5 }
};

// Instance method to calculate impact based on quantity and category
wasteLogSchema.methods.calculateImpact = function () {
  const qty = (this.quantity && this.quantity.value) ? this.quantity.value : 0;
  const cat = this.category || 'other';
  const factor = IMPACT_FACTORS[cat] || IMPACT_FACTORS.other;

  this.impact.co2SavedKg = Number((qty * factor.co2).toFixed(3));
  this.impact.energySavedKwh = Number((qty * factor.energy).toFixed(3));
  this.impact.landfillReducedKg = Number((qty * factor.landfill).toFixed(3));
  return this.impact;
};

// Static: get user stats (totals, averages) in a date range
wasteLogSchema.statics.getUserStats = async function (userId, startDate = null, endDate = null) {
  const match = { isDeleted: false };
  // Accept either string userId or ObjectId
  if (userId) {
    try {
      match.user = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    } catch (err) {
      // fall back to using the raw id to avoid throwing
      match.user = userId;
    }
  }
  if (startDate) match.wasteDate = { $gte: startDate };
  if (endDate) {
    match.wasteDate = match.wasteDate || {};
    match.wasteDate.$lte = endDate;
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: null,
        totalWeightKg: { $sum: '$quantity.value' },
        totalCO2: { $sum: '$impact.co2SavedKg' },
        totalEnergy: { $sum: '$impact.energySavedKwh' },
        count: { $sum: 1 }
      }
    }
  ];

  const res = await this.aggregate(pipeline);
  if (!res || !res[0]) return { totalWeightKg: 0, totalCO2: 0, totalEnergy: 0, count: 0 };
  return {
    totalWeightKg: res[0].totalWeightKg || 0,
    totalCO2: res[0].totalCO2 || 0,
    totalEnergy: res[0].totalEnergy || 0,
    count: res[0].count || 0
  };
};

// Static: community stats by locality
wasteLogSchema.statics.getCommunityStats = async function (locality, startDate = null) {
  const match = { 'location.locality': locality, isDeleted: false };
  if (startDate) match.wasteDate = { $gte: startDate };

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$location.locality',
        totalWeightKg: { $sum: '$quantity.value' },
        totalCO2: { $sum: '$impact.co2SavedKg' },
        count: { $sum: 1 }
      }
    }
  ];

  const res = await this.aggregate(pipeline);
  if (!res || !res[0]) return { totalWeightKg: 0, totalCO2: 0, count: 0 };
  return {
    locality: res[0]._id,
    totalWeightKg: res[0].totalWeightKg || 0,
    totalCO2: res[0].totalCO2 || 0,
    count: res[0].count || 0
  };
};

module.exports = mongoose.model('WasteLog', wasteLogSchema);
