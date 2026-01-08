const mongoose = require('mongoose');
require('dotenv').config();

const CommunityRequest = require('./models/CommunityRequest');
const User = require('./models/User');

async function debugRequests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users with their city/locality
    const users = await User.find().select('name email city locality location');
    console.log('\n👥 ALL USERS:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}):`, {
        city: user.city,
        locality: user.locality,
        location: user.location,
      });
    });

    // Get all requests
    const requests = await CommunityRequest.find()
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`\n📦 ALL REQUESTS (${requests.length} total):`);
    requests.forEach(req => {
      console.log(`  - "${req.itemName}" by ${req.requesterId?.name || 'Unknown'}:`, {
        status: req.status,
        city: req.city,
        locality: req.locality,
        location: req.location,
        createdAt: req.createdAt,
      });
    });

    // Check if requests have proper location
    const requestsWithoutLocation = requests.filter(r => !r.location || !r.location.latitude);
    console.log(`\n⚠️  Requests without proper location: ${requestsWithoutLocation.length}`);
    requestsWithoutLocation.forEach(req => {
      console.log(`  - "${req.itemName}"`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
}

debugRequests();
