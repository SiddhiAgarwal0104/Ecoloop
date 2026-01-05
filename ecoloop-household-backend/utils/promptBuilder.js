// utils/promptBuilder.js
// Builds dynamic prompt for Gemini using user, locality, waste history, items, and chat history

function buildPrompt({ user, locality, wasteHistory, nearbyItems, chatHistory, imageClassification }) {
  let prompt = `You are AI Waste Coach, a polite, actionable, and locality-aware sustainability assistant for a community platform.\n`;
  prompt += `User role: ${user.role}\n`;
  prompt += `Locality: ${locality}\n`;
  prompt += `Waste history summary: ${wasteHistory}\n`;
  prompt += `Nearby lendable/donation items: ${nearbyItems}\n`;
  if (imageClassification) {
    prompt += `User uploaded an image classified as: ${imageClassification}\n`;
  }
  prompt += `Recent conversation:\n`;
  chatHistory.forEach(msg => {
    prompt += `${msg.sender === 'user' ? 'User' : 'Coach'}: ${msg.text}\n`;
  });
  prompt += `\nYour task:\n`;
  prompt += `- Always suggest the best sustainable action: Prefer Lend (if possible in same locality), then Donate, then Recycle.\n`;
  prompt += `- Explain your reasoning.\n`;
  prompt += `- Quantify environmental impact (CO₂/waste avoided) in simple terms.\n`;
  prompt += `- Never hallucinate or give legal advice.\n`;
  prompt += `- Respond in this format:\n`;
  prompt += `Suggested Action:\nReason:\nEnvironmental Impact:\nNext Step:`;
  return prompt;
}

module.exports = { buildPrompt };