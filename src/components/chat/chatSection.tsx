// ChatSection.tsx - Updated with Admin-only More Horizontal Menu
import React, { useState } from "react";
import { ArrowLeft, Send, Loader2, MoreHorizontal } from "lucide-react";
import type { Contact, Message, Room } from "../../lib/types";
import { Button } from "../ui/button";
import ChatDropDown from "./ChatDropDown";
import { useDeleteRoom } from "../../api/useRoom";
import { useAuth } from "../../hooks/useAuth";

interface ChatSectionProps {
  selectedContact: Contact | null;
  messages: Message[];
  message: string;
  showSidebar: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onBackToContacts: () => void;
  onSendMessage: () => void;
  onMessageChange: (message: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onLoadMoreMessages: () => void;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  currentRoom?: Room | null; // Add current room data
}

const ChatSection: React.FC<ChatSectionProps> = ({
  selectedContact,
  messages,
  message,
  showSidebar,
  messagesEndRef,
  onBackToContacts,
  onSendMessage,
  onMessageChange,
  onKeyPress,
  onLoadMoreMessages,
  isLoadingMore,
  hasMoreMessages,
  currentRoom = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteRoom } = useDeleteRoom();
  const { user } = useAuth();
  const roomId = selectedContact?.id;

  // Check if current user is admin
  const isAdmin = user?.role === "admin";

  const renderMessage = (msg: Message, index: number) => {
    const isMyMessage = msg.sender === "me";
    const showSenderName =
      selectedContact?.isGroup && !isMyMessage && msg.sender !== "other";
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showSenderAvatar =
      selectedContact?.isGroup &&
      (!prevMessage || prevMessage.sender !== msg.sender);

    return (
      <div
        key={msg.id}
        className={`flex mb-3 ${isMyMessage ? "justify-end" : "justify-start"}`}
      >
        {selectedContact?.isGroup && !isMyMessage && (
          <div className="flex-shrink-0 mr-3">
            {showSenderAvatar ? (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                {typeof msg.sender === "string" && msg.sender !== "other"
                  ? msg.sender.charAt(0).toUpperCase()
                  : "?"}
              </div>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>
        )}

        <div className={`max-w-xs lg:max-w-md ${isMyMessage ? "ml-auto" : ""}`}>
          {/* Sender name for group chats */}
          {showSenderName && (
            <div className="text-xs font-medium text-gray-600 mb-1 px-1">
              {typeof msg.sender === "string" ? msg.sender : "Unknown Sender"}
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`px-3 py-2 rounded-lg break-words ${
              isMyMessage
                ? "bg-blue-500 text-white rounded-br-sm"
                : "bg-gray-200 text-gray-800 rounded-bl-sm"
            }`}
          >
            <div>{msg.content}</div>
            <div
              className={`text-xs mt-1 ${
                isMyMessage ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {typeof msg.createdAt === "string"
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : msg.createdAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedContact) {
    return (
      <div
        className={`flex-1 flex items-center justify-center bg-gray-50 ${
          showSidebar ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="text-center text-gray-500">
          <div className="mb-4">
            <svg
              className="w-20 h-20 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-sm">Choose a contact to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Render dropdown only for admins */}
      {isAdmin && roomId && (
        <div className="absolute right-0 top-10 z-20">
          <ChatDropDown
            onDelete={() => deleteRoom(roomId)}
            variant="chat"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            existingRoom={currentRoom}
          />
        </div>
      )}

      <div
        className={`flex-1 flex flex-col bg-white ${
          showSidebar ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Chat header - Fixed height */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center bg-white shadow-sm">
          <button
            onClick={onBackToContacts}
            className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
              {selectedContact.initial}
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 flex items-center">
                {selectedContact.name}
                {selectedContact.isGroup && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Group
                  </span>
                )}
              </h2>

              {/* Show participant count for groups */}
              {selectedContact.isGroup && currentRoom && (
                <p className="text-xs text-gray-500 mt-1">
                  {currentRoom.participants?.length || 0} participant
                  {(currentRoom.participants?.length || 0) !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Show more horizontal menu only for admins */}
            {isAdmin && (
              <div>
                <Button
                  onClick={() => setIsOpen(!isOpen)}
                  variant="ghost"
                  size="sm"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages area - Takes remaining space with minimal padding */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            {/* Load more messages button */}
            {hasMoreMessages && (
              <div className="text-center mb-4">
                <button
                  onClick={onLoadMoreMessages}
                  disabled={isLoadingMore}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center justify-center mx-auto"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load more messages"
                  )}
                </button>
              </div>
            )}

            {/* Messages */}
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No messages yet</p>
                <p className="text-sm mt-1">
                  Send a message to start the conversation
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => renderMessage(msg, index))}
              </div>
            )}
          </div>

          {/* Scroll anchor - minimal space */}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Message input - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder={`Message ${selectedContact.name}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={onSendMessage}
              disabled={!message.trim()}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSection;
