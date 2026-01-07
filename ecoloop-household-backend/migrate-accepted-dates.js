const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recycle = require('./models/Recycle');

dotenv.config();

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

async function migrateAcceptedDates() {
  try {
    console.log('🚀 Starting acceptedAt migration...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all accepted recycles that don't have acceptedAt
    const acceptedRecycles = await Recycle.find({ 
      status: 'ACCEPTED',
      $or: [
        { acceptedAt: { $exists: false } },
        { acceptedAt: null }
      ]
    });

    console.log(`📊 Found ${acceptedRecycles.length} accepted recycles without acceptedAt\n`);

    if (acceptedRecycles.length === 0) {
      console.log('✅ All accepted recycles already have acceptedAt date!');
      process.exit(0);
    }

    // Update each recycle with acceptedAt = updatedAt
    for (const recycle of acceptedRecycles) {
      recycle.acceptedAt = recycle.updatedAt || new Date();
      await recycle.save();
      console.log(`✅ Updated recycle ${recycle._id} - acceptedAt: ${recycle.acceptedAt.toLocaleDateString()}`);
    }

    console.log(`\n🎉 Migration complete! Updated ${acceptedRecycles.length} recycles`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateAcceptedDates();
