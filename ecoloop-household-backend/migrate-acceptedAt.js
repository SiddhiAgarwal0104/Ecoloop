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

const recycleSchema = new mongoose.Schema({}, { strict: false, collection: 'recycles' });
const Recycle = mongoose.model('Recycle', recycleSchema);

async function migrateAcceptedAtField() {
  try {
    console.log('🔄 Starting migration...');
    
    // Find all ACCEPTED records without acceptedAt
    const result = await Recycle.updateMany(
      { 
        status: 'ACCEPTED', 
        acceptedAt: { $exists: false } 
      },
      { 
        $set: { 
          acceptedAt: new Date() 
        } 
      }
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);

    // Verify
    const count = await Recycle.countDocuments({ status: 'ACCEPTED' });
    const withDate = await Recycle.countDocuments({ status: 'ACCEPTED', acceptedAt: { $exists: true } });
    
    console.log(`\n📊 Verification:`);
    console.log(`   - Total ACCEPTED: ${count}`);
    console.log(`   - With acceptedAt: ${withDate}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateAcceptedAtField();
