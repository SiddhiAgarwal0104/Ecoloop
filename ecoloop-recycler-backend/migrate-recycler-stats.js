const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoloop')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Schema for Recycler
const recyclerSchema = new mongoose.Schema({}, { strict: false, collection: 'recyclers' });
const Recycler = mongoose.model('Recycler', recyclerSchema);

// Schema for Recycle
const recycleSchema = new mongoose.Schema({}, { strict: false, collection: 'recycles' });
const Recycle = mongoose.model('Recycle', recycleSchema);

async function migrateRecyclerStats() {
  try {
    console.log('🔄 Starting recycler stats migration...\n');
    
    // Get all recyclers
    const recyclers = await Recycler.find({});
    console.log(`📊 Found ${recyclers.length} recyclers to update\n`);

    for (const recycler of recyclers) {
      const recyclerId = recycler._id;
      console.log(`\n🔍 Processing recycler: ${recycler.name || 'Unknown'} (${recyclerId})`);

      // Count total accepted requests
      const totalRequests = await Recycle.countDocuments({ assignedRecycler: recyclerId });
      
      // Count completed requests (RECYCLED status)
      const completedRequests = await Recycle.countDocuments({ 
        assignedRecycler: recyclerId, 
        status: 'RECYCLED' 
      });

      // Calculate total waste collected
      const wasteData = await Recycle.aggregate([
        { $match: { assignedRecycler: new mongoose.Types.ObjectId(recyclerId) } },
        {
          $group: {
            _id: null,
            totalWaste: { $sum: '$quantity' }
          }
        }
      ]);

      const totalWasteCollected = wasteData.length > 0 ? wasteData[0].totalWaste : 0;

      // Calculate completion rate
      const completionRate = totalRequests > 0 
        ? Math.round((completedRequests / totalRequests) * 100) 
        : 0;

      console.log(`   - Total Requests: ${totalRequests}`);
      console.log(`   - Completed Requests: ${completedRequests}`);
      console.log(`   - Total Waste Collected: ${totalWasteCollected} KG`);
      console.log(`   - Completion Rate: ${completionRate}%`);

      // Update recycler with real stats
      await Recycler.findByIdAndUpdate(
        recyclerId,
        {
          $set: {
            totalRequests,
            completedRequests,
            totalWasteCollected,
            completionRate,
            rating: completedRequests > 0 ? 4.5 : 0, // Only set rating if they've completed requests
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      console.log(`   ✅ Updated successfully`);
    }

    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateRecyclerStats();
