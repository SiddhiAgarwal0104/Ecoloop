// controllers/chatbotController.js
// Handles /api/chatbot/message logic for AI Waste Coach

const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const { buildPrompt } = require('../utils/promptBuilder');
const { callGeminiAPI } = require('../services/geminiService');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Dummy functions for fetching locality, waste history, and nearby items
// Replace with real logic as needed
const { classifyImage } = require('../utils/imageClassifier');
const path = require('path');
const fs = require('fs');

async function getUserLocality(user) {
  return user.locality || 'Unknown locality';
}
async function getWasteHistorySummary(userId) {
  // Summarize user's waste actions (stub)
  return 'No significant waste reduction yet.';
}
async function getNearbyItems(locality) {
  // Fetch lendable/donation items in locality (stub)
  return 'No items available nearby.';
}
async function getImageClassification(req) {
  if (req.file && req.file.path) {
    // Call Python API for image classification
    return await classifyImage(req.file.path);
  }
  return null;
}

exports.handleMessage = async (req, res) => {
  try {
    console.log('📨 Chatbot request received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request file:', req.file);
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Gemini API key not set.' });

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Fetch context
    const locality = await getUserLocality(user);
    const wasteHistory = await getWasteHistorySummary(userId);
    const nearbyItems = await getNearbyItems(locality);
    const imageClassification = await getImageClassification(req);

    // Get last 5 chat messages
    let chatHistoryDoc = await ChatHistory.findOne({ userId });
    let chatHistory = chatHistoryDoc ? chatHistoryDoc.messages : [];

    // Add current user message to history
    chatHistory.push({ sender: 'user', text: req.body.message });
    if (chatHistory.length > 5) chatHistory = chatHistory.slice(-5);

    // Build prompt
    const prompt = buildPrompt({
      user,
      locality,
      wasteHistory,
      nearbyItems,
      chatHistory,
      imageClassification,
    });

    // Call Gemini
    const aiReply = await callGeminiAPI(prompt, apiKey);

    // Save chat history
    if (!chatHistoryDoc) {
      chatHistoryDoc = new ChatHistory({
        userId,
        role: user.role,
        messages: [
          { sender: 'user', text: req.body.message },
          { sender: 'bot', text: aiReply },
        ],
      });
    } else {
      chatHistoryDoc.messages = chatHistory;
      chatHistoryDoc.messages.push({ sender: 'bot', text: aiReply });
      if (chatHistoryDoc.messages.length > 5) chatHistoryDoc.messages = chatHistoryDoc.messages.slice(-5);
    }
    await chatHistoryDoc.save();

    res.json({ reply: aiReply });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ error: 'Chatbot service error.' });
  }
};