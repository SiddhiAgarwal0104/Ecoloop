const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Locality name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    totalHouseholds: {
      type: Number,
      default: 0,
      min: [0, 'Total households cannot be negative']
    },
    activeUsers: {
      type: Number,
      default: 0,
      min: [0, 'Active users cannot be negative']
    },
    wasteStats: {
      totalWasteLogged: {
        type: Number,
        default: 0
      },
      dryWaste: {
        type: Number,
        default: 0
      },
      wetWaste: {
        type: Number,
        default: 0
      },
      eWaste: {
        type: Number,
        default: 0
      }
    },
    impactMetrics: {
      totalCO2Saved: {
        type: Number,
        default: 0
      },
      totalEnergySaved: {
        type: Number,
        default: 0
      },
      totalLandfillReduced: {
        type: Number,
        default: 0
      }
    },
    participationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    assignedNGOs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO'
      }
    ],
    assignedRecyclers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recycler'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    lastActivityDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for location-based queries
localitySchema.index({ city: 1, state: 1 });
localitySchema.index({ pincode: 1 });
localitySchema.index({ participationRate: -1 });

// Virtual for participation percentage
localitySchema.virtual('participationPercentage').get(function () {
  if (this.totalHouseholds === 0) return 0;
  return ((this.activeUsers / this.totalHouseholds) * 100).toFixed(2);
});

// Method to update participation rate
localitySchema.methods.updateParticipationRate = function () {
  if (this.totalHouseholds > 0) {
    this.participationRate = (this.activeUsers / this.totalHouseholds) * 100;
  } else {
    this.participationRate = 0;
  }
};

// Method to update waste stats from waste logs
localitySchema.methods.updateWasteStats = async function () {
  const WasteLog = mongoose.model('WasteLog');
  
  const stats = await WasteLog.aggregate([
    {
      $match: { localityId: this._id }
    },
    {
      $group: {
        _id: '$wasteType',
        totalWeight: { $sum: '$weight' },
        totalCO2: { $sum: '$impactMetrics.co2Saved' },
        totalEnergy: { $sum: '$impactMetrics.energySaved' },
        totalLandfill: { $sum: '$impactMetrics.landfillReduced' }
      }
    }
  ]);

  // Reset stats
  this.wasteStats.totalWasteLogged = 0;
  this.wasteStats.dryWaste = 0;
  this.wasteStats.wetWaste = 0;
  this.wasteStats.eWaste = 0;
  this.impactMetrics.totalCO2Saved = 0;
  this.impactMetrics.totalEnergySaved = 0;
  this.impactMetrics.totalLandfillReduced = 0;

  // Update with aggregated data
  stats.forEach((stat) => {
    this.wasteStats.totalWasteLogged += stat.totalWeight;
    
    if (stat._id === 'dry') {
      this.wasteStats.dryWaste = stat.totalWeight;
    } else if (stat._id === 'wet') {
      this.wasteStats.wetWaste = stat.totalWeight;
    } else if (stat._id === 'e-waste') {
      this.wasteStats.eWaste = stat.totalWeight;
    }
    
    this.impactMetrics.totalCO2Saved += stat.totalCO2;
    this.impactMetrics.totalEnergySaved += stat.totalEnergy;
    this.impactMetrics.totalLandfillReduced += stat.totalLandfill;
  });

  this.lastActivityDate = Date.now();
  await this.save();
};

// Static method to get top performing localities
localitySchema.statics.getTopPerformers = async function (limit = 10) {
  return await this.find({ isActive: true })
    .sort({ participationRate: -1, 'wasteStats.totalWasteLogged': -1 })
    .limit(limit)
    .select('name city state participationRate wasteStats impactMetrics');
};

// Static method to get low performing localities
localitySchema.statics.getLowPerformers = async function (limit = 10) {
  return await this.find({ isActive: true, totalHouseholds: { $gt: 0 } })
    .sort({ participationRate: 1 })
    .limit(limit)
    .select('name city state participationRate totalHouseholds activeUsers');
};

// Ensure virtuals are included in JSON
localitySchema.set('toJSON', { virtuals: true });
localitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Locality', localitySchema);