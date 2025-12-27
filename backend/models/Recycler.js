const mongoose = require('mongoose');

const recyclerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Recycler name is required'],
      trim: true,
      unique: true,
      maxlength: [150, 'Name cannot exceed 150 characters']
    },
    businessLicense: {
      type: String,
      required: [true, 'Business license is required'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    address: {
      street: String,
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true,
        match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
      }
    },
    facilityType: {
      type: String,
      enum: ['recycling_plant', 'composting_unit', 'e-waste_facility', 'mixed'],
      required: true
    },
    serviceAreas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locality'
      }
    ],
    materialTypesProcessed: {
      type: [String],
      enum: ['plastic', 'paper', 'metal', 'glass', 'organic', 'electronics', 'batteries', 'mixed'],
      default: []
    },
    capacity: {
      daily: {
        type: Number,
        default: 0,
        min: 0
      },
      monthly: {
        type: Number,
        default: 0,
        min: 0
      },
      unit: {
        type: String,
        enum: ['kg', 'tons'],
        default: 'kg'
      }
    },
    contactPerson: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      designation: String,
      phone: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
      },
      email: String
    },
    performanceMetrics: {
      totalMaterialProcessed: {
        type: Number,
        default: 0
      },
      plasticProcessed: {
        type: Number,
        default: 0
      },
      paperProcessed: {
        type: Number,
        default: 0
      },
      metalProcessed: {
        type: Number,
        default: 0
      },
      organicProcessed: {
        type: Number,
        default: 0
      },
      electronicsProcessed: {
        type: Number,
        default: 0
      },
      totalPickups: {
        type: Number,
        default: 0
      },
      avgProcessingTime: {
        type: Number,
        default: 0
      }
    },
    certifications: [
      {
        name: String,
        issuedBy: String,
        issueDate: Date,
        expiryDate: Date,
        certificateUrl: String
      }
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: {
      type: Date,
      default: null
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    lastActivityDate: {
      type: Date,
      default: Date.now
    },
    partnerNGOs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
recyclerSchema.index({ email: 1 });
recyclerSchema.index({ businessLicense: 1 });
recyclerSchema.index({ 'address.city': 1, 'address.state': 1 });
recyclerSchema.index({ facilityType: 1 });
recyclerSchema.index({ rating: -1 });
recyclerSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for capacity utilization
recyclerSchema.virtual('capacityUtilization').get(function () {
  if (this.capacity.monthly === 0) return 0;
  
  const utilization = (this.performanceMetrics.totalMaterialProcessed / this.capacity.monthly) * 100;
  return Math.min(100, utilization).toFixed(2);
});

// Virtual for efficiency score
recyclerSchema.virtual('efficiencyScore').get(function () {
  const pickups = this.performanceMetrics.totalPickups;
  if (pickups === 0) return 0;
  
  const avgTime = this.performanceMetrics.avgProcessingTime;
  const timeScore = Math.max(0, 100 - (avgTime / 24) * 10); // Penalty for longer processing
  const ratingScore = this.rating * 20;
  
  return ((timeScore * 0.6) + (ratingScore * 0.4)).toFixed(2);
});

// Method to update performance metrics
recyclerSchema.methods.updatePerformanceMetrics = async function (materialType, weight) {
  this.performanceMetrics.totalMaterialProcessed += weight;
  this.performanceMetrics.totalPickups += 1;
  
  // Update specific material type
  const materialMap = {
    'plastic': 'plasticProcessed',
    'paper': 'paperProcessed',
    'metal': 'metalProcessed',
    'organic': 'organicProcessed',
    'electronics': 'electronicsProcessed'
  };
  
  if (materialMap[materialType]) {
    this.performanceMetrics[materialMap[materialType]] += weight;
  }
  
  this.lastActivityDate = Date.now();
  await this.save();
};

// Method to update processing time
recyclerSchema.methods.updateProcessingTime = function (processingTimeInHours) {
  const currentTotal = this.performanceMetrics.avgProcessingTime * this.performanceMetrics.totalPickups;
  const newTotal = currentTotal + processingTimeInHours;
  const newCount = this.performanceMetrics.totalPickups + 1;
  
  this.performanceMetrics.avgProcessingTime = newTotal / newCount;
};

// Method to update rating
recyclerSchema.methods.updateRating = function (newRating) {
  const currentTotal = this.rating * this.totalReviews;
  this.totalReviews += 1;
  this.rating = (currentTotal + newRating) / this.totalReviews;
};

// Static method to get top performing recyclers
recyclerSchema.statics.getTopPerformers = async function (limit = 10) {
  return await this.find({ isActive: true, isVerified: true })
    .sort({ rating: -1, 'performanceMetrics.totalMaterialProcessed': -1 })
    .limit(limit)
    .select('name facilityType rating performanceMetrics capacity contactPerson')
    .populate('serviceAreas', 'name city');
};

// Static method to get recyclers by facility type
recyclerSchema.statics.getByFacilityType = async function (facilityType) {
  return await this.find({ facilityType, isActive: true, isVerified: true })
    .select('name performanceMetrics capacity address contactPerson')
    .sort({ rating: -1 });
};

// Static method to get underutilized recyclers
recyclerSchema.statics.getUnderutilized = async function () {
  const recyclers = await this.find({ 
    isActive: true, 
    isVerified: true,
    'capacity.monthly': { $gt: 0 }
  });
  
  return recyclers.filter(recycler => {
    const utilization = (recycler.performanceMetrics.totalMaterialProcessed / recycler.capacity.monthly) * 100;
    return utilization < 50;
  }).sort((a, b) => {
    const aUtil = (a.performanceMetrics.totalMaterialProcessed / a.capacity.monthly) * 100;
    const bUtil = (b.performanceMetrics.totalMaterialProcessed / b.capacity.monthly) * 100;
    return aUtil - bUtil;
  });
};

// Ensure virtuals are included in JSON
recyclerSchema.set('toJSON', { virtuals: true });
recyclerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Recycler', recyclerSchema);