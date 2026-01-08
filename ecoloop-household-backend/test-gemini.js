const axios = require('axios');

async function testGemini() {
  try {
    const apiKey = 'AIzaSyDVn0vfvXc6F-tIQsOVUEIiwEDT41eKl1o';
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    console.log('Testing Gemini API...');
    console.log('URL:', url);
    
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: 'Hello, test message' }] }],
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('✅ Success!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response:', error.request);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testGemini();
