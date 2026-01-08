import React from 'react';
import { formatRelativeTime } from '../../utils/dateFormatter';

const MessageList = ({ messages, currentUserId }) => {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.senderId._id === currentUserId;

        return (
          <div
            key={message._id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md ${
                isOwnMessage
                  ? 'bg-eco-main text-white'
                  : 'bg-white text-gray-900'
              } rounded-2xl p-4 shadow-md`}
            >
              {/* Sender Name (only for other's messages) */}
              {!isOwnMessage && (
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  {message.senderId.name}
                </p>
              )}

              {/* Message Content */}
              {message.type === 'text' ? (
                <p className="text-sm break-words">{message.content}</p>
              ) : (
                <img
                  src={message.content}
                  alt="Sent image"
                  className="rounded-lg max-w-full"
                />
              )}

              {/* Timestamp */}
              <p
                className={`text-xs mt-2 ${
                  isOwnMessage ? 'text-green-100' : 'text-gray-500'
                }`}
              >
                {formatRelativeTime(message.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;