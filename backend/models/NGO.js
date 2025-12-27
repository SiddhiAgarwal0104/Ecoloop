const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'NGO name is required'],
      trim: true,
      unique: true,
      maxlength: [150, 'Name cannot exceed 150 characters']
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
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
    serviceAreas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locality'
      }
    ],
    wasteTypesHandled: {
      type: [String],
      enum: ['dry', 'wet', 'e-waste'],
      default: ['dry', 'wet']
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
      totalCollections: {
        type: Number,
        default: 0
      },
      totalWasteCollected: {
        type: Number,
        default: 0
      },
      onTimeCollections: {
        type: Number,
        default: 0
      },
      delayedCollections: {
        type: Number,
        default: 0
      },
      avgResponseTime: {
        type: Number,
        default: 0
      }
    },
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
    documents: [
      {
        docType: {
          type: String,
          enum: ['registration_certificate', 'tax_document', 'license', 'other']
        },
        fileUrl: String,
        uploadDate: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
ngoSchema.index({ email: 1 });
ngoSchema.index({ registrationNumber: 1 });
ngoSchema.index({ 'address.city': 1, 'address.state': 1 });
ngoSchema.index({ rating: -1 });
ngoSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for performance score
ngoSchema.virtual('performanceScore').get(function () {
  const total = this.performanceMetrics.totalCollections;
  if (total === 0) return 0;
  
  const onTimeRate = (this.performanceMetrics.onTimeCollections / total) * 100;
  const weightedScore = (onTimeRate * 0.7) + (this.rating * 20 * 0.3);
  
  return Math.min(100, weightedScore).toFixed(2);
});

// Method to update performance metrics
ngoSchema.methods.updatePerformanceMetrics = async function () {
  const WasteLog = mongoose.model('WasteLog');
  
  const collections = await WasteLog.aggregate([
    {
      $match: { collectedBy: this._id }
    },
    {
      $group: {
        _id: null,
        totalCollections: { $sum: 1 },
        totalWeight: { $sum: '$weight' }
      }
    }
  ]);

  if (collections.length > 0) {
    this.performanceMetrics.totalCollections = collections[0].totalCollections;
    this.performanceMetrics.totalWasteCollected = collections[0].totalWeight;
    this.lastActivityDate = Date.now();
    await this.save();
  }
};

// Method to calculate average response time
ngoSchema.methods.updateResponseTime = function (responseTimeInHours) {
  const currentTotal = this.performanceMetrics.avgResponseTime * this.performanceMetrics.totalCollections;
  const newTotal = currentTotal + responseTimeInHours;
  const newCount = this.performanceMetrics.totalCollections + 1;
  
  this.performanceMetrics.avgResponseTime = newTotal / newCount;
};

// Method to update rating
ngoSchema.methods.updateRating = function (newRating) {
  const currentTotal = this.rating * this.totalReviews;
  this.totalReviews += 1;
  this.rating = (currentTotal + newRating) / this.totalReviews;
};

// Static method to get top performing NGOs
ngoSchema.statics.getTopPerformers = async function (limit = 10) {
  return await this.find({ isActive: true, isVerified: true })
    .sort({ rating: -1, 'performanceMetrics.totalCollections': -1 })
    .limit(limit)
    .select('name rating performanceMetrics contactPerson serviceAreas')
    .populate('serviceAreas', 'name city');
};

// Static method to get NGOs needing attention
ngoSchema.statics.getNeedsAttention = async function () {
  return await this.find({
    isActive: true,
    $or: [
      { rating: { $lt: 3 } },
      { 'performanceMetrics.delayedCollections': { $gt: 5 } },
      { 'performanceMetrics.avgResponseTime': { $gt: 48 } }
    ]
  })
    .select('name rating performanceMetrics contactPerson')
    .sort({ rating: 1 });
};

// Ensure virtuals are included in JSON
ngoSchema.set('toJSON', { virtuals: true });
ngoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('NGO', ngoSchema);