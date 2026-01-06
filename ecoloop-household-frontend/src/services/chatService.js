// import api from './api';

// /**
//  * Get all chat rooms for the current user
//  */
// export const getChatRooms = async () => {
//   try {
//     const response = await api.get('/community/chat/rooms');
//     return response.data.data || [];
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Get chat room by request ID
//  */
// export const getChatRoomByRequest = async (requestId) => {
//   try {
//     const response = await api.get(`/community/chat/room/${requestId}`);
//     return response.data.data || {};
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Get messages from a specific chat room
//  */
// export const getChatMessages = async (chatRoomId) => {
//   try {
//     const response = await api.get(`/community/chat/${chatRoomId}/messages`);
//     return response.data.data || [];
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Send a text message in a chat room
//  */
// export const sendMessage = async (chatRoomId, content) => {
//   const response = await api.post(
//     `/community/chat/${chatRoomId}/message`,
//     {
//       content,      
//       type: 'text', 
//     }
//   );
//   return response.data.data;
// };


// /**
//  * Send an image message in a chat room
//  */
// export const sendImageMessage = async (chatRoomId, imageFile) => {
//   try {
//     const formData = new FormData();
//     formData.append('image', imageFile);
    
//     const response = await api.post(
//       `/community/chat/${chatRoomId}/image`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );
//     return response.data.data || {};
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Confirm lending arrangement
//  */
// export const confirmLend = async (chatRoomId) => {
//   try {
//     const response = await api.post(
//       `/community/chat/${chatRoomId}/confirm-lend`
//     );
//     return response.data.data || {};
//   } catch (error) {
//     throw error;
//   }
// };

// /**
//  * Confirm borrowing arrangement
//  */
// export const confirmBorrow = async (chatRoomId) => {
//   try {
//     const response = await api.post(
//       `/community/chat/${chatRoomId}/confirm-borrow`
//     );
//     return response.data.data || {};
//   } catch (error) {
//     throw error;
//   }
// };

import api from './api';

/**
 * Get all chat rooms for the current user
 */
export const getChatRooms = async () => {
  const response = await api.get('/community/chat/rooms');
  return response.data.data;
};

/**
 * ✅ Get (or create) chat room by request ID
 * USED when clicking:
 * - NEGOTIATING badge
 * - In Negotiation button
 */
export const getChatRoomByRequest = async (requestId) => {
  const response = await api.get(
    `/community/chat/room/${requestId}`
  );
  return response.data.data;
};

/**
 * Get chat room by chatRoomId
 */
export const getChatRoomById = async (chatRoomId) => {
  const res = await api.get(
    `/community/chat/room-by-id/${chatRoomId}`
  );
  return res.data.data;
};

/**
 * Get messages from a specific chat room
 */
export const getChatMessages = async (chatRoomId) => {
  const response = await api.get(
    `/community/chat/${chatRoomId}/messages`
  );
  return response.data.data;
};

/**
 * ✅ Send a text message
 */
export const sendMessage = async (chatRoomId, content) => {
  const response = await api.post(
    `/community/chat/${chatRoomId}/message`,
    {
      content,
      type: 'text',
    }
  );
  return response.data.data;
};

/**
 * ✅ Send an image message
 */
export const sendImageMessage = async (chatRoomId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post(
    `/community/chat/${chatRoomId}/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

/**
 * Confirm lending
 */
export const confirmLend = async (chatRoomId) => {
  const response = await api.post(
    `/community/chat/${chatRoomId}/confirm-lend`
  );
  return response.data.data;
};

/**
 * Confirm borrowing
 */
export const confirmBorrow = async (chatRoomId) => {
  const response = await api.post(
    `/community/chat/${chatRoomId}/confirm-borrow`
  );
  return response.data.data;
};
