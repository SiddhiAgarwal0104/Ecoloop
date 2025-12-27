const WasteLog = require('../models/WasteLog');
const Locality = require('../models/Locality');
const { subMonths, format } = require('date-fns');

/**
 * AI Insights Service
 * Analyzes waste data and generates actionable insights
 * This integrates AI-powered analytics within admin dashboards
 */

/**
 * Detect high-waste localities that need intervention
 */
const detectHighWasteLocalities = async () => {
  try {
    const lastMonth = subMonths(new Date(), 1);
    
    // Get localities with unusually high waste generation
    const highWasteData = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: '$localityId',
          totalWaste: { $sum: '$weight' },
          avgWastePerLog: { $avg: '$weight' },
          logCount: { $sum: 1 }
        }
      },
      {
        $match: {
          avgWastePerLog: { $gt: 10 } // Average waste per log > 10kg
        }
      },
      {
        $sort: { totalWaste: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'localities',
          localField: '_id',
          foreignField: '_id',
          as: 'localityDetails'
        }
      },
      {
        $unwind: '$localityDetails'
      }
    ]);

    return highWasteData.map(item => ({
      locality: {
        id: item._id,
        name: item.localityDetails.name,
        city: item.localityDetails.city
      },
      totalWaste: parseFloat(item.totalWaste.toFixed(2)),
      avgWastePerLog: parseFloat(item.avgWastePerLog.toFixed(2)),
      logCount: item.logCount,
      insight: `High waste generation detected. Consider waste reduction campaigns.`,
      priority: 'high'
    }));
  } catch (error) {
    console.error('Detect high waste localities error:', error);
    return [];
  }
};

/**
 * Detect localities with low participation rates
 */
const detectLowParticipationLocalities = async () => {
  try {
    const lowParticipation = await Locality.find({
      isActive: true,
      totalHouseholds: { $gt: 0 },
      participationRate: { $lt: 30 } // Less than 30% participation
    })
      .select('name city state participationRate totalHouseholds activeUsers')
      .sort({ participationRate: 1 })
      .limit(5);

    return lowParticipation.map(locality => ({
      locality: {
        id: locality._id,
        name: locality.name,
        city: locality.city
      },
      participationRate: parseFloat(locality.participationRate.toFixed(2)),
      activeUsers: locality.activeUsers,
      totalHouseholds: locality.totalHouseholds,
      insight: `Only ${locality.participationRate.toFixed(0)}% participation. Increase awareness campaigns.`,
      priority: 'medium',
      suggestion: 'Consider door-to-door awareness programs or incentive schemes'
    }));
  } catch (error) {
    console.error('Detect low participation error:', error);
    return [];
  }
};

/**
 * Analyze waste type trends and anomalies
 */
const analyzeWasteTrends = async () => {
  try {
    const lastMonth = subMonths(new Date(), 1);
    const previousMonth = subMonths(new Date(), 2);

    // Current month data
    const currentData = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: '$wasteType',
          totalWeight: { $sum: '$weight' }
        }
      }
    ]);

    // Previous month data
    const previousData = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: previousMonth, $lt: lastMonth }
        }
      },
      {
        $group: {
          _id: '$wasteType',
          totalWeight: { $sum: '$weight' }
        }
      }
    ]);

    const trends = [];

    currentData.forEach(current => {
      const previous = previousData.find(p => p._id === current._id);
      
      if (previous) {
        const changePercent = ((current.totalWeight - previous.totalWeight) / previous.totalWeight) * 100;
        
        if (Math.abs(changePercent) > 20) { // Significant change (>20%)
          trends.push({
            wasteType: current._id,
            change: parseFloat(changePercent.toFixed(2)),
            currentWeight: parseFloat(current.totalWeight.toFixed(2)),
            previousWeight: parseFloat(previous.totalWeight.toFixed(2)),
            insight: changePercent > 0 
              ? `${current._id} waste increased by ${changePercent.toFixed(0)}%. Investigate causes.`
              : `${current._id} waste decreased by ${Math.abs(changePercent).toFixed(0)}%. Good progress!`,
            priority: Math.abs(changePercent) > 50 ? 'high' : 'medium'
          });
        }
      }
    });

    return trends;
  } catch (error) {
    console.error('Analyze waste trends error:', error);
    return [];
  }
};

/**
 * Calculate predicted impact for next month based on trends
 */
const predictNextMonthImpact = async () => {
  try {
    const last3Months = subMonths(new Date(), 3);

    const monthlyData = await WasteLog.aggregate([
      {
        $match: {
          date: { $gte: last3Months }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalWaste: { $sum: '$weight' },
          totalCO2: { $sum: '$impactMetrics.co2Saved' },
          totalEnergy: { $sum: '$impactMetrics.energySaved' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    if (monthlyData.length < 2) {
      return null;
    }

    // Simple linear prediction based on average growth
    const avgWaste = monthlyData.reduce((sum, m) => sum + m.totalWaste, 0) / monthlyData.length;
    const avgCO2 = monthlyData.reduce((sum, m) => sum + m.totalCO2, 0) / monthlyData.length;
    const avgEnergy = monthlyData.reduce((sum, m) => sum + m.totalEnergy, 0) / monthlyData.length;

    // Calculate growth rate
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];
    const growthRate = ((lastMonth.totalWaste - firstMonth.totalWaste) / firstMonth.totalWaste) / monthlyData.length;

    const predictedWaste = avgWaste * (1 + growthRate);
    const predictedCO2 = avgCO2 * (1 + growthRate);
    const predictedEnergy = avgEnergy * (1 + growthRate);

    return {
      predictedWaste: parseFloat(predictedWaste.toFixed(2)),
      predictedCO2Saved: parseFloat(predictedCO2.toFixed(2)),
      predictedEnergySaved: parseFloat(predictedEnergy.toFixed(2)),
      growthRate: parseFloat((growthRate * 100).toFixed(2)),
      confidence: 'medium',
      insight: growthRate > 0 
        ? `Waste logging is trending up by ${(growthRate * 100).toFixed(1)}%. Platform adoption is growing!`
        : `Waste logging is stable. Focus on expanding to new localities.`
    };
  } catch (error) {
    console.error('Predict next month impact error:', error);
    return null;
  }
};

/**
 * Generate monthly AI insights summary
 */
const generateMonthlyInsights = async () => {
  try {
    const [
      highWaste,
      lowParticipation,
      wasteTrends,
      prediction
    ] = await Promise.all([
      detectHighWasteLocalities(),
      detectLowParticipationLocalities(),
      analyzeWasteTrends(),
      predictNextMonthImpact()
    ]);

    return {
      generatedAt: new Date(),
      summary: {
        highWasteLocalities: highWaste,
        lowParticipationLocalities: lowParticipation,
        wasteTrends: wasteTrends,
        nextMonthPrediction: prediction
      },
      recommendations: generateRecommendations(highWaste, lowParticipation, wasteTrends)
    };
  } catch (error) {
    console.error('Generate monthly insights error:', error);
    throw error;
  }
};

/**
 * Generate actionable recommendations based on insights
 */
const generateRecommendations = (highWaste, lowParticipation, wasteTrends) => {
  const recommendations = [];

  if (highWaste.length > 0) {
    recommendations.push({
      category: 'Waste Reduction',
      priority: 'high',
      action: 'Launch waste reduction campaigns in high-waste localities',
      localities: highWaste.map(h => h.locality.name).join(', ')
    });
  }

  if (lowParticipation.length > 0) {
    recommendations.push({
      category: 'User Engagement',
      priority: 'medium',
      action: 'Increase awareness and engagement in low-participation localities',
      localities: lowParticipation.map(l => l.locality.name).join(', ')
    });
  }

  if (wasteTrends.some(t => t.wasteType === 'e-waste' && t.change > 20)) {
    recommendations.push({
      category: 'E-Waste Management',
      priority: 'high',
      action: 'E-waste is increasing. Ensure adequate recycler capacity.'
    });
  }

  return recommendations;
};

module.exports = {
  detectHighWasteLocalities,
  detectLowParticipationLocalities,
  analyzeWasteTrends,
  predictNextMonthImpact,
  generateMonthlyInsights
};