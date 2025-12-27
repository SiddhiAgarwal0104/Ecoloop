// scripts/seed.js
// Run: node scripts/seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './.env' });

const connectDB = require('../config/db');
const User = require('../models/User');
const WasteLog = require('../models/WasteLog');
const Notification = require('../models/Notification');

async function seed() {
  await connectDB();

  console.log('Clearing existing test data (users with email containing "@test.local")');
  await User.deleteMany({ email: /@test.local$/ });
  await WasteLog.deleteMany({ 'user': { $exists: true } });
  await Notification.deleteMany({ title: /Test Notification/ });

  const pw = await bcrypt.hash('password123', 10);

  const user = await User.create({
    name: 'Test User',
    email: 'test.user@test.local',
    password: pw,
    role: 'household',
    address: { locality: 'Testville', city: 'TestCity', pincode: '123456' }
  });

  console.log('Created user:', user.email);

  const logs = [
    { user: user._id, category: 'plastic', quantity: { value: 2 }, notes: 'Bottles', location: user.address },
    { user: user._id, category: 'paper', quantity: { value: 1 }, notes: 'Newspapers', location: user.address },
    { user: user._id, category: 'wet', quantity: { value: 3 }, notes: 'Kitchen waste', location: user.address }
  ];

  for (const l of logs) {
    const wl = new WasteLog(l);
    wl.calculateImpact();
    await wl.save();
    console.log('Seeded waste log:', wl.category, wl.quantity.value);
  }

  await Notification.create({ user: user._id, title: 'Test Notification 1', message: 'Welcome to EcoLoop (test)', type: 'info' });
  await Notification.create({ user: null, title: 'Test Notification 2', message: 'Global announcement (test)', type: 'info' });

  console.log('Seed data created.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});