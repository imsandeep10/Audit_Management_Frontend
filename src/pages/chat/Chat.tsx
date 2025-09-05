// Updated Chat component - Fixed type errors and participant handling
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Contact, Message, Room } from "../../lib/types";
import RoomList from "../../components/chat/roomList";
import io from "socket.io-client";
import ChatSection from "../../components/chat/chatSection";
import { useInfiniteMessages, useSendMessage } from "../../api/useChat";
import { useInfiniteRooms, useReadMessage } from "../../api/useRoom";
import type { User } from "../../types/activity";

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // Add ref to store current rooms data
  const roomsRef = useRef<Room[]>([]);

  const limit = 20;
  const {
    data: roomsPages,
    isLoading: roomsLoading,
    hasNextPage: hasMoreRooms,
    isFetchingNextPage: loadingMoreRooms,
    fetchNextPage: fetchNextRoomsPage,
  } = useInfiniteRooms(limit);

  const {
    data: pages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
    refetch: refetchMessages,
  } = useInfiniteMessages(roomId || "", limit);

  const { user } = useAuth();
  const { mutate: markAsRead } = useReadMessage();
  const navigate = useNavigate();
  const { mutate: sendMessage } = useSendMessage();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [realTimeMessages, setRealTimeMessages] = useState<Message[]>([]);
  const [roomUnreadCounts, setRoomUnreadCounts] = useState<
    Record<string, number>
  >({});

  // Helper function to extract ID from participant
  // Define interface for participant object structure
  interface ParticipantObject {
    _id?: string;
    id?: string;
    user?: string | { _id?: string; id?: string };
  }

  const getParticipantId = useCallback(
    (participant: string | object): string => {
      if (typeof participant === "string") return participant;

      const p = participant as ParticipantObject;
      if (p._id) return p._id;
      if (p.id) return p.id;
      if (p.user) {
        if (typeof p.user === "string") return p.user;
        return p.user?._id || p.user?.id || "";
      }
      return "";
    },
    []
  );

  // Flatten rooms pages to a single array
  const rooms: Room[] = useMemo(() => {
    const flat = (roomsPages?.pages || []).flatMap((page) => page.rooms || []);
    return flat;
  }, [roomsPages]);

  // Get current room data
  const currentRoom = useMemo(() => {
    if (!roomId || !rooms.length) return null;
    return rooms.find((room: Room) => room._id === roomId) || null;
  }, [roomId, rooms]);

  // Update rooms ref whenever rooms change
  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  // Flatten pages to a single array
  const apiMessages: Message[] = useMemo(() => {
    const flat = (pages?.pages || []).flat();
    return flat as Message[];
  }, [pages]);

  // Initialize unread counts from rooms data
  useEffect(() => {
    if (rooms && user?._id) {
      const initialUnreadCounts: Record<string, number> = {};
      rooms.forEach((room: Room) => {
        const userUnreadEntry = room.unreadCount?.find(
          (entry) => entry.userId === user._id
        );
        initialUnreadCounts[room._id] = userUnreadEntry?.count || 0;
      });
      setRoomUnreadCounts(initialUnreadCounts);
    }
  }, [rooms, user?._id]);

  // Clear real-time messages when switching rooms
  useEffect(() => {
    setRealTimeMessages([]);

    if (roomId) {
      refetchMessages();
    }
  }, [roomId, refetchMessages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
        {
          transports: ["websocket", "polling"],
          timeout: 20000,
          forceNew: true,
        }
      );

      socketRef.current.on("connect", () => {});

      socketRef.current.on("disconnect", () => {});
    }

    const socket = socketRef.current;

    // Handle new messages
    const handleNewMessage = (data: {
      message: Message;
      roomId: string;
      sender: User;
    }) => {
      const currentRoomId = new URLSearchParams(window.location.search).get(
        "roomId"
      );

      if (data.roomId === currentRoomId) {
        // Use the populated sender data from backend
        const senderObj = data.sender || data.message.sender;
        const senderId = getParticipantId(senderObj);

        const isMyMessage = senderId === user?._id;

        // Use roomsRef.current to get the latest room data
        const currentRoom = roomsRef.current.find(
          (room) => room._id === data.roomId
        );
        const isGroupChat = currentRoom?.isGroup || false;

        let senderName = "other";
        if (isMyMessage) {
          senderName = "me";
        } else if (isGroupChat && senderObj && typeof senderObj === "object") {
          // Extract sender name from populated data
          senderName =
            (senderObj as User).fullName ||
            (senderObj as User).email ||
            "Unknown";
        } else if (isGroupChat) {
          senderName = "Unknown";
        }

        const newMessage: Message = {
          id: data.message.id || data.message._id || `realtime-${Date.now()}`,
          _id: data.message._id || data.message.id || `realtime-${Date.now()}`,
          content: data.message.content,
          sender: senderName,
          createdAt: new Date(data.message.createdAt),
          isGroup: isGroupChat,
        };

        setRealTimeMessages((prev) => {
          const exists = prev.some(
            (msg) =>
              msg.id === newMessage.id ||
              (msg.content === newMessage.content &&
                Math.abs(
                  new Date(msg.createdAt).getTime() -
                    new Date(newMessage.createdAt).getTime()
                ) < 1000)
          );

          if (exists) {
            return prev;
          }

          return [...prev, newMessage];
        });
      }

      if (data.roomId !== currentRoomId) {
        setRoomUnreadCounts((prev) => ({
          ...prev,
          [data.roomId]: (prev[data.roomId] || 0) + 1,
        }));
      }
    };

    const handleUnreadUpdate = (data: {
      roomId: string;
      unreadCount: number;
    }) => {
      setRoomUnreadCounts((prev) => ({
        ...prev,
        [data.roomId]: data.unreadCount,
      }));
    };

    const handleMessageRead = (data: { roomId: string; userId: string }) => {
      if (data.userId === user?._id) {
        setRoomUnreadCounts((prev) => ({
          ...prev,
          [data.roomId]: 0,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("unreadCountUpdate", handleUnreadUpdate);
    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("unreadCountUpdate", handleUnreadUpdate);
      socket.off("messageRead", handleMessageRead);
    };
  }, [user?._id, getParticipantId]);

  // Join/leave room when roomId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (roomId) {
      socket.emit("joinRoom", roomId);
    }

    return () => {
      if (roomId) {
        socket.emit("leaveRoom", roomId);
      }
    };
  }, [roomId]);

  // Mark messages as read
  const markMessagesRead = useCallback(() => {
    if (roomId) {
      setRoomUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
      markAsRead({ roomId });
    }
  }, [roomId, markAsRead]);

  useEffect(() => {
    if (roomId) {
      markMessagesRead();
    }
  }, [roomId, markMessagesRead]);

  const handleLoadMoreMessages = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLoadMoreRooms = useCallback(() => {
    if (!hasMoreRooms || loadingMoreRooms) return;
    fetchNextRoomsPage();
  }, [hasMoreRooms, loadingMoreRooms, fetchNextRoomsPage]);

  // Transform user rooms data to contacts format with proper group name handling
  const contacts: Contact[] = useMemo(() => {
    if (!rooms || !user?._id) return [];

    return rooms.map((room: Room) => {
      // Handle group chat name display
      if (room.isGroup) {
        return {
          id: room._id,
          name: room.name || "Group Chat",
          initial: (room.name || "Group Chat").charAt(0).toUpperCase(),
          isOnline: false,
          lastMessage: room.lastMessage?.content || "No messages yet",
          lastSeen: new Date(room.lastActivity).toLocaleDateString(),
          isGroup: true,
        };
      }

      // Handle individual chat
      const otherParticipant = room.participants.find(
        (p) => getParticipantId(p) !== user._id
      );
      const participantName = otherParticipant
        ? (typeof otherParticipant === "object" &&
          "fullName" in otherParticipant
            ? otherParticipant.fullName
            : (otherParticipant as User)?.email) || "Unknown"
        : "Unknown";

      return {
        id: room._id,
        name: participantName,
        initial: participantName.charAt(0).toUpperCase(),
        isOnline: false,
        lastMessage: room.lastMessage?.content || "No messages yet",
        lastSeen: new Date(room.lastActivity).toLocaleDateString(),
        isGroup: false,
      };
    });
  }, [rooms, user?._id, getParticipantId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Combine API messages with real-time messages
  const allMessages = useMemo(() => {
    const transformedApiMessages: Message[] = apiMessages.map(
      (msg: Message) => {
        const senderObj = msg.sender;
        const senderId = getParticipantId(senderObj);

        const isMyMessage = senderId === user?._id;

        // Use roomsRef to get current room data
        const currentRoom = roomsRef.current.find(
          (room) => room._id === roomId
        );
        const isGroupChat = currentRoom?.isGroup || false;

        let senderName = "other";
        if (isMyMessage) {
          senderName = "me";
        } else if (isGroupChat && typeof senderObj === "object" && senderObj) {
          senderName =
            (senderObj as User).fullName ||
            (senderObj as User).email ||
            "Unknown";
        } else if (isGroupChat) {
          senderName = "Unknown";
        }

        return {
          id:
            msg.id ||
            msg._id ||
            `api-${Math.random().toString(36).substr(2, 9)}`,
          _id:
            msg._id ||
            msg.id ||
            `api-${Math.random().toString(36).substr(2, 9)}`,
          content: msg.content,
          sender: senderName,
          createdAt: new Date(msg.createdAt),
          isGroup: isGroupChat,
        };
      }
    );

    const apiMessageIds = new Set(transformedApiMessages.map((msg) => msg.id));
    const apiMessageContents = new Set(
      transformedApiMessages.map(
        (msg) => `${msg.content}-${new Date(msg.createdAt).getTime()}`
      )
    );

    const uniqueRealTimeMessages = realTimeMessages.filter((msg) => {
      const contentKey = `${msg.content}-${new Date(msg.createdAt).getTime()}`;
      return !apiMessageIds.has(msg.id) && !apiMessageContents.has(contentKey);
    });

    const combined = [
      ...transformedApiMessages,
      ...uniqueRealTimeMessages,
    ].sort((a, b) => {
      const dateA =
        typeof a.createdAt === "string" ? new Date(a.createdAt) : a.createdAt;
      const dateB =
        typeof b.createdAt === "string" ? new Date(b.createdAt) : b.createdAt;
      return dateA.getTime() - dateB.getTime();
    });

    return combined;
  }, [apiMessages, realTimeMessages, user?._id, roomId, getParticipantId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (status === "success" && (pages?.pages?.length || 0) <= 1) {
      scrollToBottom();
    }
  }, [status, pages?.pages?.length, scrollToBottom]);

  useEffect(() => {
    if (realTimeMessages.length > 0) {
      scrollToBottom();
    }
  }, [realTimeMessages.length, scrollToBottom]);

  // Auto-select room based on roomId from URL
  useEffect(() => {
    if (roomId && contacts.length > 0) {
      const targetContact = contacts.find((contact) => contact.id === roomId);
      if (targetContact) {
        setSelectedContact(targetContact);
        if (window.innerWidth < 768) {
          setShowSidebar(false);
        }
      }
    }
  }, [roomId, contacts]);

  const handleSendMessage = () => {
    if (!message.trim() || !roomId || !socketRef.current) return;

    sendMessage({
      content: message,
      roomId: roomId,
    });

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Consistent navigation handling
  const handleContactSelect = (contact: Contact, roomId: string) => {
    setSelectedContact(contact);

    // Determine the correct navigation path based on user role
    const chatPath =
      user?.role === "admin" ? "/chat" : `/employee/chat/${user?._id}`;
    navigate(`${chatPath}?roomId=${roomId}`);

    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleBackToContacts = () => {
    setShowSidebar(true);
    setSelectedContact(null);

    // Navigate back to appropriate chat page
    const chatPath =
      user?.role === "admin" ? "/chat" : `/employee/chat/${user?._id}`;
    navigate(chatPath);
  };

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex h-full bg-gray-100 relative">
      <RoomList
        unreadCounts={roomUnreadCounts}
        contacts={contacts}
        selectedContact={selectedContact}
        roomsLoading={roomsLoading}
        showSidebar={showSidebar}
        onContactSelect={handleContactSelect}
        hasMore={hasMoreRooms}
        loadingMore={loadingMoreRooms}
        onLoadMore={handleLoadMoreRooms}
      />

      <ChatSection
        selectedContact={selectedContact}
        messages={allMessages}
        message={message}
        showSidebar={showSidebar}
        messagesEndRef={messagesEndRef}
        onBackToContacts={handleBackToContacts}
        onSendMessage={handleSendMessage}
        onMessageChange={setMessage}
        onKeyPress={handleKeyPress}
        onLoadMoreMessages={handleLoadMoreMessages}
        isLoadingMore={isFetchingNextPage}
        hasMoreMessages={!!hasNextPage}
        currentRoom={currentRoom} // Pass current room data
      />

      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default Chat;
