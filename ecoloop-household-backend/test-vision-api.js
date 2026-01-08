const { detectWasteType } = require('./services/visionApiService');

// Test karne ke liye
const testVisionAPI = async () => {
  console.log('🧪 Testing Google Vision API...');
  console.log('📁 Environment Check:');
  console.log('   - GOOGLE_VISION_ENABLED:', process.env.GOOGLE_VISION_ENABLED);
  console.log('   - GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  
  // Test with a public waste image URL
  const testImageUrl = 'https://images.unsplash.com/photo-1553881081-d282e0a896a2?w=800'; // Plastic waste image
  
  console.log('\n🔍 Testing with image URL:', testImageUrl.substring(0, 50) + '...');
  
  try {
    const result = await detectWasteType(testImageUrl, 'url');
    console.log('\n✅ Test completed');
    console.log('📊 Result:', {
      success: result.success,
      detected: result.classification?.wasteType,
      confidence: result.classification?.confidence,
      error: result.error
    });
    
    if (result.success && result.classification) {
      console.log('\n🎯 Full Classification:');
      console.log(JSON.stringify(result.classification, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

testVisionAPI();
