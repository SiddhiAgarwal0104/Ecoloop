import React from 'react';
import { TrendingUp, AlertCircle, Users, Award } from 'lucide-react';

const AIInsights = ({ insights }) => {
  if (!insights) {
    return null;
  }

  return (
    <div className="card bg-gradient-to-r from-eco-light to-white border-l-4 border-eco-main">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-eco-main p-2 rounded-lg">
          <TrendingUp className="text-white" size={20} />
        </div>
        <h2 className="text-xl font-bold text-eco-dark">AI-Powered Insights</h2>
      </div>

      {/* High Waste Localities */}
      {insights.summary?.highWasteLocalities?.length > 0 && (
        <div className="mb-4 p-4 bg-orange-50 rounded-xl">
          <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <AlertCircle size={18} />
            High Waste Generation Detected
          </h3>
          {insights.summary.highWasteLocalities.slice(0, 3).map((item, index) => (
            <div key={index} className="mb-2 text-sm">
              <span className="font-medium">{item.locality.name}</span>
              <span className="text-gray-600"> - {item.insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Low Participation */}
      {insights.summary?.lowParticipationLocalities?.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Users size={18} />
            Low Participation Alert
          </h3>
          {insights.summary.lowParticipationLocalities.slice(0, 3).map((item, index) => (
            <div key={index} className="mb-2 text-sm">
              <span className="font-medium">{item.locality.name}</span>
              <span className="text-gray-600"> - {item.participationRate}% participation</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations?.length > 0 && (
        <div className="p-4 bg-green-50 rounded-xl">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <Award size={18} />
            Recommended Actions
          </h3>
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="mb-2 text-sm">
              <span className="font-medium text-eco-main">{rec.category}:</span>
              <span className="text-gray-700"> {rec.action}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsights;