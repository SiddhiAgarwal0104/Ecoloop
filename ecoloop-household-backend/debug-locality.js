const mongoose = require('mongoose');
const User = require('./models/User');
const UserStats = require('./models/UserStats');
require('dotenv').config();

async function debugLocality() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with "check post" locality
    const checkPostUsers = await User.find({
      locality: {
        $regex: '^check post$',
        $options: 'i'
      }
    }).select('_id name email locality');

    console.log('\n📍 Users with "check post" locality:');
    console.log(JSON.stringify(checkPostUsers, null, 2));

    // Find all users (to see what localities exist)
    const allUsers = await User.find({}).select('name locality').limit(10);
    console.log('\n📋 Sample of all users:');
    console.log(JSON.stringify(allUsers, null, 2));

    // Check UserStats for check post users
    if (checkPostUsers.length > 0) {
      const userIds = checkPostUsers.map(u => u._id);
      const stats = await UserStats.find({ userId: { $in: userIds } })
        .populate('userId', 'name locality')
        .select('userId totalPoints level');
      
      console.log('\n🏆 UserStats for check post users:');
      console.log(JSON.stringify(stats, null, 2));
    }

    // Count total users
    const totalUsers = await User.countDocuments();
    console.log('\n📊 Total users in database:', totalUsers);

    // Count users per locality
    const localityGroups = await User.aggregate([
      {
        $group: {
          _id: { $toLower: '$locality' },
          count: { $sum: 1 },
          users: { $push: '$name' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Users by locality:');
    console.log(JSON.stringify(localityGroups, null, 2));

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
  }
}

debugLocality();
