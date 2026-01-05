// const mongoose = require('mongoose');

// const recycleSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   wasteCategory: {
//     type: String,
//     required: [true, 'Waste category is required'],
//     enum: ['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'E_WASTE', 'ORGANIC', 'MIXED'],
//     trim: true
//   },
//   wasteType: {
//     type: String,
//     required: [true, 'Waste type is required'],
//     enum: ['SEGREGATED', 'MIXED'],
//     default: 'SEGREGATED'
//   },
//   quantity: {
//     type: Number,
//     required: [true, 'Quantity is required'],
//     min: [0.1, 'Quantity must be at least 0.1']
//   },
//   unit: {
//     type: String,
//     enum: ['KG', 'PIECES', 'ITEMS', 'BAGS'],
//     default: 'KG'
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   images: [{
//     type: String
//   }],
//   pickupLocation: {
//     address: {
//       type: String,
//       required: [true, 'Pickup address is required'],
//       trim: true
//     },
//     latitude: {
//       type: Number,
//       required: [true, 'Latitude is required']
//     },
//     longitude: {
//       type: Number,
//       required: [true, 'Longitude is required']
//     }
//   },
//   status: {
//     type: String,
//     enum: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'RECYCLED'],
//     default: 'AVAILABLE'
//   },
//   assignedRecycler: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     default: null
//   }
// }, {
//   timestamps: true
// });

// // Index for faster queries
// recycleSchema.index({ userId: 1, status: 1 });
// recycleSchema.index({ status: 1, createdAt: -1 });

// module.exports = mongoose.model('Recycle', recycleSchema);


const mongoose = require('mongoose');

const recycleSchema = new mongoose.Schema(
  {
    // Household who created request
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Waste details
    wasteCategory: {
      type: String,
      enum: ['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'E_WASTE', 'ORGANIC', 'MIXED'],
      required: true
    },

    wasteType: {
      type: String,
      enum: ['SEGREGATED', 'MIXED'],
      default: 'SEGREGATED'
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.1
    },

    unit: {
      type: String,
      enum: ['KG', 'PIECES', 'ITEMS', 'BAGS'],
      default: 'KG'
    },

    description: {
      type: String,
      trim: true
    },

    images: [String],

    // Pickup location
    pickupLocation: {
      address: {
        type: String,
        required: true
      },
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },

    // Recycler assignment
    assignedRecycler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recycler',
      default: null
    },

    // Status lifecycle
    status: {
      type: String,
      enum: ['AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'RECYCLED'],
      default: 'AVAILABLE',
      index: true
    },

    // Timeline
    acceptedAt: Date,
    pickedUpAt: Date,
    recycledAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
recycleSchema.index({ status: 1, createdAt: -1 });
recycleSchema.index({ assignedRecycler: 1, status: 1 });

module.exports = mongoose.model('Recycle', recycleSchema);
