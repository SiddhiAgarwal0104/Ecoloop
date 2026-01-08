// services/geminiService.js
// Handles communication with Google Gemini API for AI Waste Coach

const axios = require('axios');

async function callGeminiAPI(prompt, apiKey) {
  try {
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');
    
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Gemini API response:', JSON.stringify(response.data, null, 2));
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text || text.trim() === '') {
      throw new Error('Empty response from Gemini API');
    }
    return text.trim();
  } catch (error) {
    console.error('❌ Gemini API error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      // Check for specific error messages
      if (error.response.status === 403) {
        console.error('🔑 API KEY ISSUE: Please regenerate your Gemini API key from Google Cloud Console');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Fallback: Return a helpful default response
    console.log('Using fallback response due to API unavailability');
    return `🌿 **AI Waste Coach** is temporarily unavailable, but here's what I suggest:\n\n**Suggested Action:** Check your waste items\n**Reason:** Better waste management starts with understanding what you have\n**Environmental Impact:** Proper sorting can reduce landfill waste by 30-50%\n**Next Step:** Visit the Donate or Recycle sections to list your items!`;
  }
}

module.exports = { callGeminiAPI };