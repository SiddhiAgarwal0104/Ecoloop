const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');

// Initialize Vision API client
let client = null;
let initError = null;

const initializeVisionClient = () => {
  if (client) {
    return client;
  }

  try {
    const credentialsPath = path.join(__dirname, '../config/google-vision-credentials.json');
    console.log('🔑 Credentials path:', credentialsPath);
    console.log('📁 Credentials file exists:', fs.existsSync(credentialsPath));

    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Credentials file not found at ${credentialsPath}`);
    }

    client = new vision.ImageAnnotatorClient({
      keyFilename: credentialsPath,
    });

    console.log('✅ Vision API client initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Vision API initialization error:', error.message);
    initError = error;
    return null;
  }
};

/**
 * Detect waste type from image using Google Vision API
 * @param {string} imageUrl - URL of the image or base64 encoded image
 * @param {string} imageType - 'url' or 'base64'
 * @returns {Promise<object>} Detection result with waste classification
 */
const detectWasteType = async (imageUrl, imageType = 'url') => {
  try {
    console.log('🤖 Starting waste detection...');
    console.log('📸 Image URL:', imageUrl.substring(0, 50) + '...');
    console.log('🔍 Image type:', imageType);

    const visionClient = initializeVisionClient();

    if (!visionClient) {
      throw new Error('Vision API client could not be initialized: ' + (initError?.message || 'Unknown error'));
    }

    let request;

    if (imageType === 'base64') {
      // For base64 encoded images
      request = {
        image: {
          content: imageUrl,
        },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          { type: 'TEXT_DETECTION' },
        ],
      };
    } else {
      // For image URLs
      request = {
        image: {
          source: {
            imageUri: imageUrl,
          },
        },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          { type: 'TEXT_DETECTION' },
        ],
      };
    }

    console.log('📤 Sending request to Google Vision API...');
    const response = await visionClient.annotateImage(request);
    const detections = response[0];

    console.log('✅ Vision API response received');
    console.log('📊 Labels found:', detections.labelAnnotations?.length || 0);
    console.log('🎯 Objects found:', detections.localizedObjectAnnotations?.length || 0);

    // Process and classify waste type
    const wasteClassification = classifyWaste(detections);

    console.log('✅ Waste classification completed:', wasteClassification.wasteType);

    return {
      success: true,
      classification: wasteClassification,
      confidence: wasteClassification.confidence,
      labels: detections.labelAnnotations || [],
      objects: detections.localizedObjectAnnotations || [],
      rawResponse: detections,
    };
  } catch (error) {
    console.error('❌ Vision API Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message,
      classification: null,
    };
  }
};

/**
 * Classify waste into categories
 * @param {object} detections - Google Vision API detection response
 * @returns {object} Classified waste information
 */
const classifyWaste = (detections) => {
  const labels = detections.labelAnnotations || [];
  const objects = detections.localizedObjectAnnotations || [];

  // Define waste categories and related keywords
  const wasteCategories = {
    ORGANIC: {
      keywords: ['food', 'fruit', 'vegetable', 'organic', 'banana', 'apple', 'orange', 'peeling', 'leaf', 'leaves', 'plant', 'compost', 'waste'],
      recyclable: true,
    },
    PLASTIC: {
      keywords: ['plastic', 'bottle', 'bag', 'container', 'wrapper', 'plastic bag', 'cup', 'foam', 'styrofoam', 'plastic wrap'],
      recyclable: true,
    },
    METAL: {
      keywords: ['metal', 'aluminum', 'can', 'tin', 'steel', 'iron', 'copper', 'wire'],
      recyclable: true,
    },
    PAPER: {
      keywords: ['paper', 'cardboard', 'newspaper', 'magazine', 'box', 'envelope', 'tissue'],
      recyclable: true,
    },
    GLASS: {
      keywords: ['glass', 'bottle', 'jar', 'window pane', 'crystal'],
      recyclable: true,
    },
    E_WASTE: {
      keywords: ['electronic', 'computer', 'phone', 'circuit', 'wire', 'device', 'gadget', 'battery', 'charger', 'screen', 'monitor', 'keyboard'],
      recyclable: true,
    },
    HAZARDOUS: {
      keywords: ['chemical', 'toxic', 'dangerous', 'hazard', 'paint', 'oil', 'solvent', 'pesticide'],
      recyclable: false,
    },
    UNKNOWN: {
      keywords: [],
      recyclable: false,
    },
  };

  // Get all detected labels (both objects and labels)
  const detectedItems = [];
  
  // Add object labels
  objects.forEach((obj) => {
    detectedItems.push({
      name: obj.name,
      confidence: obj.confidence,
      type: 'object',
    });
  });

  // Add image labels
  labels.forEach((label) => {
    detectedItems.push({
      name: label.description,
      confidence: label.score,
      type: 'label',
    });
  });

  // Score each waste category based on detected items
  const categoryScores = {};

  for (const [category, data] of Object.entries(wasteCategories)) {
    let score = 0;
    let matchedKeywords = [];

    detectedItems.forEach((item) => {
      const itemNameLower = item.name.toLowerCase();

      data.keywords.forEach((keyword) => {
        if (itemNameLower.includes(keyword.toLowerCase())) {
          score += item.confidence;
          if (!matchedKeywords.includes(item.name)) {
            matchedKeywords.push(item.name);
          }
        }
      });
    });

    categoryScores[category] = {
      score,
      matchedKeywords,
    };
  }

  // Find the category with highest score
  let bestCategory = 'UNKNOWN';
  let bestScore = 0;

  for (const [category, data] of Object.entries(categoryScores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestCategory = category;
    }
  }

  const selectedCategory = wasteCategories[bestCategory];

  return {
    wasteType: bestCategory,
    confidence: Math.min(bestScore, 1), // Normalize to 0-1
    recyclable: selectedCategory.recyclable,
    detectedItems: detectedItems.slice(0, 5), // Top 5 detected items
    categoryScores: categoryScores,
    description: getWasteDescription(bestCategory),
    tips: getRecyclingTips(bestCategory),
  };
};

/**
 * Get human-readable description for waste type
 */
const getWasteDescription = (wasteType) => {
  const descriptions = {
    ORGANIC: 'Organic/Biodegradable waste - can be composted',
    PLASTIC: 'Plastic waste - can be recycled into new products',
    METAL: 'Metal waste - highly recyclable and valuable',
    PAPER: 'Paper/Cardboard waste - can be recycled',
    GLASS: 'Glass waste - 100% recyclable',
    E_WASTE: 'Electronic waste - requires special recycling',
    HAZARDOUS: 'Hazardous waste - requires special handling',
    UNKNOWN: 'Unknown waste type - needs manual inspection',
  };
  return descriptions[wasteType] || 'Unknown waste type';
};

/**
 * Get recycling tips for waste type
 */
const getRecyclingTips = (wasteType) => {
  const tips = {
    ORGANIC: [
      'Separate from other waste',
      'Can be used for composting',
      'Reduces landfill waste',
      'Creates nutrient-rich soil',
    ],
    PLASTIC: [
      'Check recycling number (1-7)',
      'Rinse before recycling',
      'Remove caps and labels',
      'Flatten to save space',
    ],
    METAL: [
      'Crush to save space',
      'Remove any plastic components',
      'Rinse if contaminated',
      'Highly valued by recyclers',
    ],
    PAPER: [
      'Keep dry and clean',
      'Flatten to save space',
      'Remove plastic windows',
      'Shred sensitive documents',
    ],
    GLASS: [
      'Separate by color if possible',
      'Remove labels',
      'Keep lids separate',
      'No broken glass in bins',
    ],
    E_WASTE: [
      'Never mix with general waste',
      'Find specialized e-waste recyclers',
      'May contain valuable metals',
      'Requires safe data destruction',
    ],
    HAZARDOUS: [
      'Store safely away from children',
      'Contact hazardous waste facilities',
      'Follow disposal regulations',
      'Never mix with other waste',
    ],
    UNKNOWN: ['Please inspect manually', 'Contact local waste management', 'Take to waste disposal center'],
  };
  return tips[wasteType] || [];
};

module.exports = {
  detectWasteType,
  classifyWaste,
  getWasteDescription,
  getRecyclingTips,
  initializeVisionClient,
};
