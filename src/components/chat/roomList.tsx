"use client";

import type React from "react";
import { useCallback, useRef, useEffect, useState } from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";
import type { Contact } from "../../lib/types";
import ChatDropDown from "./ChatDropDown";
import { useAuth } from "../../hooks/useAuth";

interface RoomListProps {
  unreadCounts?: Record<string, number>;
  contacts?: Contact[];
  selectedContact: Contact | null;
  roomsLoading: boolean;
  showSidebar: boolean;
  onContactSelect: (contact: Contact, roomId: string) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  threshold?: number; // Distance from bottom to trigger load more
}

const RoomList: React.FC<RoomListProps> = ({
  unreadCounts = {},
  contacts = [],
  selectedContact,
  roomsLoading,
  showSidebar,
  onContactSelect,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  threshold = 100, // pixels from bottom
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const getUnreadCountForContact = (contactId: string): number => {
    if (!unreadCounts || typeof unreadCounts !== "object") {
      return 0;
    }
    return unreadCounts[contactId] || 0;
  };

  // Enhanced intersection observer for better performance
  const lastContactRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (roomsLoading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMore && onLoadMore && !loadingMore) {
            onLoadMore();
          }
        },
        {
          rootMargin: `${threshold}px`,
          threshold: 0.1,
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [roomsLoading, loadingMore, hasMore, onLoadMore, threshold]
  );

  // Scroll position monitoring for better UX
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    setIsNearBottom(distanceFromBottom < threshold);
  }, [threshold]);

  // Enhanced scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Auto-load more when near bottom
  useEffect(() => {
    if (
      isNearBottom &&
      hasMore &&
      onLoadMore &&
      !loadingMore &&
      !roomsLoading
    ) {
      onLoadMore();
    }
  }, [isNearBottom, hasMore, onLoadMore, loadingMore, roomsLoading]);

  const renderContactItem = (contact: Contact, index: number) => {
    const unreadCount = getUnreadCountForContact(contact.id);
    const isLast = index === contacts.length - 1;
    const isSelected = selectedContact?.id === contact.id;

    return (
      <div
        key={contact.id}
        ref={isLast ? lastContactRef : null}
        onClick={() => onContactSelect(contact, contact.id)}
        className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
          isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
        }`}
      >
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-medium text-lg shadow-sm bg-[#D9D9D9]">
            {contact.initial}
          </div>
          {contact.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate text-sm">
              {contact.name}
            </h3>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 truncate mt-1">
            {contact.lastMessage || "No messages yet"}
          </p>
          {contact.lastSeen && (
            <p className="text-xs text-gray-400 mt-1">
              Last seen: {new Date(contact.lastSeen).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        showSidebar ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out absolute md:relative z-10 w-full md:w-80 bg-white border-r border-gray-200 h-7xl flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
        {user && user.role === "admin" && (
          <div className="flex items-center space-x-2">
            <MoreHorizontal
              onClick={() => setIsOpen(!isOpen)}
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
            />
          </div>
        )}
      </div>

      {user && user.role === "admin" && (
        <div className="absolute top-5 right-0">
          <ChatDropDown variant="list" isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      )}

      {/* Room List with enhanced scrolling */}
      <div
        ref={containerRef}
        className="overflow-y-auto flex-1 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E0 #F7FAFC" }}
      >
        {roomsLoading ? (
          <div className="p-4 text-center text-gray-500">
            <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
            <p>Loading Chat...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
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
            <p className="font-medium">No Messages found</p>
            <p className="text-sm mt-1 text-gray-400">
              Start a conversation with an employee
            </p>
          </div>
        ) : (
          <>
            {contacts.map((contact, index) =>
              renderContactItem(contact, index)
            )}

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2" />
                <p className="text-sm">Loading more conversations...</p>
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && contacts.length > 0 && (
              <div className="p-4 text-center text-gray-400 text-sm border-t border-gray-100">
                <p>You've reached the end</p>
                <p className="text-xs mt-1">No more conversations to load</p>
              </div>
            )}

            {/* Empty space at bottom for better scrolling experience */}
            {hasMore && <div className="h-4" />}
          </>
        )}
      </div>
    </div>
  );
};

export default RoomList;
