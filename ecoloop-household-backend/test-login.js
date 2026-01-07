const mongoose = require('mongoose');
const Recycler = require('./models/Recycler');
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check for existing users
    const users = await Recycler.find({}, { email: 1, name: 1 });
    console.log('\n📊 Existing recyclers:', users);

    // Try to find the specific user
    const user = await Recycler.findOne({ email: 'recycler1@gmail.com' }).select('+password');
    if (user) {
      console.log('\n✅ Found user: recycler1@gmail.com');
      console.log('User details:', {
        id: user._id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password
      });

      // Test password comparison
      const testPassword = 'testrecycler11*';
      const isMatch = await user.comparePassword(testPassword);
      console.log(`\n🔐 Password test (${testPassword}):`, isMatch ? '✅ MATCH' : '❌ NO MATCH');
    } else {
      console.log('\n❌ User recycler1@gmail.com not found');
      console.log('\nPlease register first by going to /register');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
