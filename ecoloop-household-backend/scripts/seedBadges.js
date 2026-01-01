const mongoose = require('mongoose');
const Badge = require('../models/Badge');
require('dotenv').config();

const badges = [
  {
    name: 'First Steps',
    description: 'Created your first donation or recycle request',
    icon: '🌱',
    category: 'DONATION',
    tier: 'BRONZE',
    points: 10,
    requirement: {
      type: 'COUNT',
      value: 1,
      action: 'DONATION'
    }
  },
  {
    name: 'Generous Giver',
    description: 'Completed 5 donations',
    icon: '🌿',
    category: 'DONATION',
    tier: 'SILVER',
    points: 50,
    requirement: {
      type: 'COUNT',
      value: 5,
      action: 'DONATION'
    }
  },
  {
    name: 'Donation Hero',
    description: 'Completed 20 donations',
    icon: '⭐',
    category: 'DONATION',
    tier: 'GOLD',
    points: 150,
    requirement: {
      type: 'COUNT',
      value: 20,
      action: 'DONATION'
    }
  },
  {
    name: 'Recycle Starter',
    description: 'Created your first recycle request',
    icon: '♻️',
    category: 'RECYCLE',
    tier: 'BRONZE',
    points: 10,
    requirement: {
      type: 'COUNT',
      value: 1,
      action: 'RECYCLE'
    }
  },
  {
    name: 'Eco Warrior',
    description: 'Completed 10 recycle requests',
    icon: '🌳',
    category: 'RECYCLE',
    tier: 'SILVER',
    points: 75,
    requirement: {
      type: 'COUNT',
      value: 10,
      action: 'RECYCLE'
    }
  },
  {
    name: 'Recycle Enthusiast',
    description: 'Completed 5 recycles',
    icon: '💚',
    category: 'RECYCLE',
    tier: 'SILVER',
    points: 100,
    requirement: {
      type: 'COUNT',
      value: 5,
      action: 'RECYCLE'
    }
  },
  {
    name: 'Green Guardian',
    description: 'Completed 10 recycles',
    icon: '🌟',
    category: 'RECYCLE',
    tier: 'GOLD',
    points: 200,
    requirement: {
      type: 'COUNT',
      value: 10,
      action: 'RECYCLE'
    }
  },
  {
    name: 'Sustainability Champion',
    description: 'Completed 50 total actions (donations + recycles)',
    icon: '🏆',
    category: 'MILESTONE',
    tier: 'GOLD',
    points: 300,
    requirement: {
      type: 'COUNT',
      value: 50,
      action: 'TOTAL_IMPACT'
    }
  },
  {
    name: 'Community Leader',
    description: 'Earned 1000 total points',
    icon: '👑',
    category: 'MILESTONE',
    tier: 'GOLD',
    points: 500,
    requirement: {
      type: 'COUNT',
      value: 1000,
      action: 'TOTAL_IMPACT'
    }
  },
  {
    name: 'Streak Master',
    description: 'Completed actions for 7 consecutive days',
    icon: '🔥',
    category: 'STREAK',
    tier: 'SILVER',
    points: 150,
    requirement: {
      type: 'STREAK',
      value: 7,
      action: 'CONSECUTIVE_DAYS'
    }
  },
  {
    name: 'Early Adopter',
    description: 'One of the first 100 users',
    icon: '🎖️',
    category: 'SPECIAL',
    tier: 'BRONZE',
    points: 50,
    requirement: {
      type: 'SPECIAL',
      value: 100,
      action: 'TOTAL_IMPACT'
    }
  },
  {
    name: 'Bronze Achiever',
    description: 'Earned your first bronze badge',
    icon: '🥉',
    category: 'MILESTONE',
    tier: 'BRONZE',
    points: 25,
    requirement: {
      type: 'COUNT',
      value: 1,
      action: 'TOTAL_IMPACT'
    }
  },
  {
    name: 'Silver Champion',
    description: 'Earned 5 silver badges',
    icon: '🥈',
    category: 'MILESTONE',
    tier: 'SILVER',
    points: 100,
    requirement: {
      type: 'COUNT',
      value: 5,
      action: 'TOTAL_IMPACT'
    }
  },
  {
    name: 'Gold Legend',
    description: 'Earned 3 gold badges',
    icon: '🥇',
    category: 'MILESTONE',
    tier: 'GOLD',
    points: 200,
    requirement: {
      type: 'COUNT',
      value: 3,
      action: 'TOTAL_IMPACT'
    }
  },
  {
    name: 'Consistency Star',
    description: 'Completed actions for 30 consecutive days',
    icon: '💎',
    category: 'STREAK',
    tier: 'GOLD',
    points: 300,
    requirement: {
      type: 'STREAK',
      value: 30,
      action: 'CONSECUTIVE_DAYS'
    }
  }
];

const seedBadges = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Clear existing badges
    await Badge.deleteMany({});
    console.log('🗑️  Cleared existing badges');

    // Insert new badges
    const createdBadges = await Badge.insertMany(badges);
    console.log(`✅ ${createdBadges.length} badges seeded successfully`);

    // Display created badges
    createdBadges.forEach(badge => {
      console.log(`   ${badge.icon} ${badge.name} (${badge.tier}) - ${badge.points} points`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
};

seedBadges();