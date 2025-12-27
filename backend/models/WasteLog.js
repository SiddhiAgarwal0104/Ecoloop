const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    localityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locality',
      required: [true, 'Locality ID is required']
    },
    wasteType: {
      type: String,
      enum: ['dry', 'wet', 'e-waste'],
      required: [true, 'Waste type is required']
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0.1, 'Weight must be at least 0.1 kg'],
      max: [1000, 'Weight cannot exceed 1000 kg']
    },
    unit: {
      type: String,
      enum: ['kg', 'grams'],
      default: 'kg'
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    imageUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'collected', 'processed', 'recycled'],
      default: 'pending'
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null
    },
    collectionDate: {
      type: Date,
      default: null
    },
    impactMetrics: {
      co2Saved: {
        type: Number,
        default: 0
      },
      energySaved: {
        type: Number,
        default: 0
      },
      landfillReduced: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
wasteLogSchema.index({ localityId: 1, date: -1 });
wasteLogSchema.index({ userId: 1, date: -1 });
wasteLogSchema.index({ wasteType: 1, date: -1 });
wasteLogSchema.index({ status: 1 });

// Calculate impact metrics before saving
wasteLogSchema.pre('save', function (next) {
  if (this.isModified('weight') || this.isModified('wasteType')) {
    const weightInKg = this.unit === 'grams' ? this.weight / 1000 : this.weight;
    
    // CO2 saved calculations (kg CO2 per kg waste)
    const co2Factors = {
      'dry': 0.8,      // Recycling dry waste saves CO2
      'wet': 0.3,      // Composting reduces methane
      'e-waste': 1.5   // E-waste recycling has high CO2 benefit
    };
    
    // Energy saved calculations (kWh per kg waste)
    const energyFactors = {
      'dry': 1.2,
      'wet': 0.5,
      'e-waste': 2.0
    };
    
    // Landfill reduction (kg per kg waste diverted)
    const landfillFactor = 1.0; // Direct 1:1 ratio
    
    this.impactMetrics.co2Saved = weightInKg * (co2Factors[this.wasteType] || 0);
    this.impactMetrics.energySaved = weightInKg * (energyFactors[this.wasteType] || 0);
    this.impactMetrics.landfillReduced = weightInKg * landfillFactor;
  }
  
  next();
});

// Static method to get aggregated waste data by locality
wasteLogSchema.statics.getLocalityStats = async function (localityId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        localityId: mongoose.Types.ObjectId(localityId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: '$wasteType',
        totalWeight: { $sum: '$weight' },
        totalCO2Saved: { $sum: '$impactMetrics.co2Saved' },
        totalEnergySaved: { $sum: '$impactMetrics.energySaved' },
        totalLandfillReduced: { $sum: '$impactMetrics.landfillReduced' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get overall platform stats
wasteLogSchema.statics.getPlatformStats = async function (startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: null,
        totalWeight: { $sum: '$weight' },
        totalCO2Saved: { $sum: '$impactMetrics.co2Saved' },
        totalEnergySaved: { $sum: '$impactMetrics.energySaved' },
        totalLandfillReduced: { $sum: '$impactMetrics.landfillReduced' },
        totalLogs: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('WasteLog', wasteLogSchema);