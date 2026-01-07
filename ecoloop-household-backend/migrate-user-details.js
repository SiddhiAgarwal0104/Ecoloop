const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recycle = require('./models/Recycle');

dotenv.config();

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

async function migrateUserDetails() {
  try {
    console.log('🚀 Starting migration...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all recycles that don't have userName
    const recipesWithoutUserName = await Recycle.find({ 
      $or: [
        { userName: { $exists: false } },
        { userName: '' },
        { userName: null }
      ]
    });

    console.log(`📊 Found ${recipesWithoutUserName.length} recycles without userName\n`);

    if (recipesWithoutUserName.length === 0) {
      console.log('✅ All recycles already have user details!');
      process.exit(0);
    }

    // Update each recycle with a generic userName (since we can't fetch from household)
    for (const recycle of recipesWithoutUserName) {
      recycle.userName = 'Waste Donor';
      recycle.userPhone = recycle.userPhone || '';
      await recycle.save();
      console.log(`✅ Updated recycle ${recycle._id}`);
    }

    console.log(`\n🎉 Migration complete! Updated ${recipesWithoutUserName.length} recycles`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateUserDetails();
