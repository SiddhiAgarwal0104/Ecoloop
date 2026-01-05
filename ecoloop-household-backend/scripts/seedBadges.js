const mongoose = require('mongoose');
const Badge = require('../models/Badge');
require('dotenv').config();

const badges = [
  // ===== DONATION BADGES - Progressive Milestones =====
  {
    name: 'First Steps',
    description: 'Complete your first donation',
    icon: '🌱',
    category: 'DONATION',
    tier: 'BRONZE',
    points: 50,
    requirement: {
      type: 'COUNT',
      value: 1,
      action: 'DONATION'
    }
  },
  {
    name: 'Generous Giver',
    description: 'Complete 5 donations',
    icon: '🌿',
    category: 'DONATION',
    tier: 'SILVER',
    points: 100,
    requirement: {
      type: 'COUNT',
      value: 5,
      action: 'DONATION'
    }
  },
  {
    name: 'Kind Heart',
    description: 'Complete 10 donations',
    icon: '💚', // Changed from 💝 to 💚 (green heart - matches allowed enum)
    category: 'DONATION',
    tier: 'SILVER',
    points: 150,
    requirement: {
      type: 'COUNT',
      value: 10,
      action: 'DONATION'
    }
  },
  {
    name: 'Donation Hero',
    description: 'Complete 20 donations',
    icon: '⭐',
    category: 'DONATION',
    tier: 'GOLD',
    points: 250,
    requirement: {
      type: 'COUNT',
      value: 20,
      action: 'DONATION'
    }
  },
  {
    name: 'Donation Legend',
    description: 'Complete 50 donations',
    icon: '👑',
    category: 'DONATION',
    tier: 'GOLD',
    points: 500,
    requirement: {
      type: 'COUNT',
      value: 50,
      action: 'DONATION'
    }
  },

  // ===== RECYCLE BADGES - Progressive Milestones =====
  {
    name: 'Recycle Starter',
    description: 'Complete your first recycle request',
    icon: '♻️',
    category: 'RECYCLE',
    tier: 'BRONZE',
    points: 50,
    requirement: {
      type: 'COUNT',
      value: 1,
      action: 'RECYCLE'
    }
  },
  {
    name: 'Recycle Enthusiast',
    description: 'Complete 5 recycle requests',
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
    name: 'Eco Warrior',
    description: 'Complete 10 recycle requests',
    icon: '🌳',
    category: 'RECYCLE',
    tier: 'SILVER',
    points: 150,
    requirement: {
      type: 'COUNT',
      value: 10,
      action: 'RECYCLE'
    }
  },
  {
    name: 'Green Guardian',
    description: 'Complete 20 recycle requests',
    icon: '🌟',
    category: 'RECYCLE',
    tier: 'GOLD',
    points: 250,
    requirement: {
      type: 'COUNT',
      value: 20,
      action: 'RECYCLE'
    }
  },
  {
    name: 'Planet Savior',
    description: 'Complete 50 recycle requests',
    icon: '🏆',
    category: 'RECYCLE',
    tier: 'GOLD',
    points: 500,
    requirement: {
      type: 'COUNT',
      value: 50,
      action: 'RECYCLE'
    }
  },

  // ===== STREAK BADGES =====
  {
    name: 'Getting Started',
    description: 'Complete actions for 3 consecutive days',
    icon: '🔥',
    category: 'STREAK',
    tier: 'BRONZE',
    points: 75,
    requirement: {
      type: 'STREAK',
      value: 3,
      action: 'CONSECUTIVE_DAYS'
    }
  },
  {
    name: 'Streak Master',
    description: 'Complete actions for 7 consecutive days',
    icon: '⭐',
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
    name: 'Dedication Champion',
    description: 'Complete actions for 14 consecutive days',
    icon: '💎',
    category: 'STREAK',
    tier: 'SILVER',
    points: 250,
    requirement: {
      type: 'STREAK',
      value: 14,
      action: 'CONSECUTIVE_DAYS'
    }
  },
  {
    name: 'Consistency Star',
    description: 'Complete actions for 30 consecutive days',
    icon: '💎',
    category: 'STREAK',
    tier: 'GOLD',
    points: 500,
    requirement: {
      type: 'STREAK',
      value: 30,
      action: 'CONSECUTIVE_DAYS'
    }
  },

  // ===== MILESTONE BADGES =====
  {
    name: 'Active Contributor',
    description: 'Complete 15 total actions (donations + recycles)',
    icon: '🎯',
    category: 'MILESTONE',
    tier: 'SILVER',
    points: 200,
    requirement: {
      type: 'COUNT',
      value: 15,
      action: 'TOTAL_ACTIONS'
    }
  },
  {
    name: 'Sustainability Champion',
    description: 'Complete 50 total actions (donations + recycles)',
    icon: '🏆',
    category: 'MILESTONE',
    tier: 'GOLD',
    points: 500,
    requirement: {
      type: 'COUNT',
      value: 50,
      action: 'TOTAL_ACTIONS'
    }
  },
  {
    name: 'Super Contributor',
    description: 'Complete 100 total actions',
    icon: '🎖️',
    category: 'MILESTONE',
    tier: 'GOLD',
    points: 1000,
    requirement: {
      type: 'COUNT',
      value: 100,
      action: 'TOTAL_ACTIONS'
    }
  },

  // ===== IMPACT SCORE BADGES =====
  {
    name: 'Impact Maker',
    description: 'Reach 500 impact score',
    icon: '🎯',
    category: 'MILESTONE',
    tier: 'BRONZE',
    points: 100,
    requirement: {
      type: 'COUNT',
      value: 500,
      action: 'TOTAL_IMPACT'
    }
  },
  {
    name: 'Community Leader',
    description: 'Reach 2000 impact score',
    icon: '🌟',
    category: 'MILESTONE',
    tier: 'SILVER',
    points: 250,
    requirement: {
      type: 'COUNT',
      value: 2000,
      action: 'TOTAL_IMPACT'
    }
  },
  {
    name: 'Impact Legend',
    description: 'Reach 5000 impact score',
    icon: '👑',
    category: 'MILESTONE',
    tier: 'GOLD',
    points: 500,
    requirement: {
      type: 'COUNT',
      value: 5000,
      action: 'TOTAL_IMPACT'
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
    console.log(`\n✅ ${createdBadges.length} badges seeded successfully\n`);

    // Display created badges by category
    console.log('📋 DONATION BADGES:');
    createdBadges.filter(b => b.category === 'DONATION').forEach(badge => {
      console.log(`   ${badge.icon} ${badge.name} - ${badge.requirement.value} completions (${badge.tier}) - ${badge.points} pts`);
    });

    console.log('\n📋 RECYCLE BADGES:');
    createdBadges.filter(b => b.category === 'RECYCLE').forEach(badge => {
      console.log(`   ${badge.icon} ${badge.name} - ${badge.requirement.value} completions (${badge.tier}) - ${badge.points} pts`);
    });

    console.log('\n📋 STREAK BADGES:');
    createdBadges.filter(b => b.category === 'STREAK').forEach(badge => {
      console.log(`   ${badge.icon} ${badge.name} - ${badge.requirement.value} days (${badge.tier}) - ${badge.points} pts`);
    });

    console.log('\n📋 MILESTONE BADGES:');
    createdBadges.filter(b => b.category === 'MILESTONE').forEach(badge => {
      console.log(`   ${badge.icon} ${badge.name} - ${badge.requirement.value} ${badge.requirement.action} (${badge.tier}) - ${badge.points} pts`);
    });

    console.log('\n🎉 Badge seeding complete! Run your server to test.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
};

seedBadges();