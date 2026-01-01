/**
 * Seed Test Data Script
 * Updates the first recycler with realistic test data for dashboard display
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recycler = require('./models/Recycler');
const Recycle = require('./models/Recycle');

dotenv.config();

const seedTestData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Find or get the first recycler
    const recycler = await Recycler.findOne();
    if (!recycler) {
      console.log('❌ No recycler found. Please register a recycler first.');
      process.exit(1);
    }

    console.log(`📝 Updating recycler: ${recycler.email}`);

    // Reset recycler to default values
    const testData = {
      totalRequests: 0,
      completedRequests: 0,
      totalWasteCollected: 0,
      rating: 0
    };

    const updatedRecycler = await Recycler.findByIdAndUpdate(
      recycler._id,
      testData,
      { new: true }
    );

    console.log('✅ Recycler reset to default values:');
    console.log(`   Total Requests: ${updatedRecycler.totalRequests}`);
    console.log(`   Completed Requests: ${updatedRecycler.completedRequests}`);
    console.log(`   Completion Rate: ${updatedRecycler.completionRate}%`);
    console.log(`   Total Waste Collected: ${updatedRecycler.totalWasteCollected} KG`);
    console.log(`   Rating: ${updatedRecycler.rating}/5`);

    console.log('\n🎉 Dummy data removed!');
    console.log('📱 Refresh your dashboard to see the reset statistics.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    process.exit(1);
  }
};

seedTestData();
