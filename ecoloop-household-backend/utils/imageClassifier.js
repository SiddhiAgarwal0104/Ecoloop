// utils/imageClassifier.js
// Calls local Python API to classify uploaded image

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function classifyImage(imagePath) {
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    const response = await axios.post('http://localhost:5000/predict', form, {
      headers: form.getHeaders(),
    });
    return response.data.classification || null;
  } catch (error) {
    console.error('Image classification error:', error.response?.data || error.message);
    return null;
  }
}

module.exports = { classifyImage };