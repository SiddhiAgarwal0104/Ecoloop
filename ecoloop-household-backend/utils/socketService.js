// utils/socketService.js
// ✅ Re-exports from config/socket so all legacy imports keep working
// Any file doing require('../utils/socketService') will now get the real instance

const { initSocket, getIO, sendToUser } = require('../config/socket');

module.exports = { initSocket, getIO, sendToUser };