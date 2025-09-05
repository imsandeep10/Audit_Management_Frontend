import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { 
  Send, 
  MessageCircle, 
  Reply, 
  User, 
  Crown,
  Clock,
  X
} from "lucide-react";
import { useSubTaskNotes, useAddSubTaskNote } from "../../api/useNoteConversation";
import { useSocket } from "../../contexts/SocketContext";
import { type SubTaskNote } from "../../api/noteConversationService";

interface NoteConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  subTaskId: string;
  subTaskTitle: string;
  currentUserName: string;
}

const NoteConversationDialog: React.FC<NoteConversationDialogProps> = ({
  isOpen,
  onClose,
  taskId,
  subTaskId,
  subTaskTitle,
  currentUserName,
}) => {
  const [newNote, setNewNote] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { socket } = useSocket();
  const { data: notesData, isLoading, refetch } = useSubTaskNotes(
    isOpen ? taskId : "", 
    isOpen ? subTaskId : ""
  );
  const { mutate: addNote, isPending } = useAddSubTaskNote();

  // Auto-scroll to bottom when new notes are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [notesData?.notes]);

  // Socket real-time updates
  useEffect(() => {
    if (socket && isOpen && subTaskId) {
      socket.emit("joinSubTaskNotes", subTaskId);

      const handleNoteUpdate = (data: any) => {
        if (data.subTaskId === subTaskId) {
          refetch();
        }
      };

      const handleTyping = (data: any) => {
        if (data.subTaskId === subTaskId && data.userId !== currentUserName) {
          setIsTyping(data.isTyping);
          if (data.isTyping) {
            setTimeout(() => setIsTyping(false), 3000);
          }
        }
      };

      socket.on("subtask_note_update", handleNoteUpdate);
      socket.on("userSubtaskNoteTyping", handleTyping);

      return () => {
        socket.emit("leaveSubTaskNotes", subTaskId);
        socket.off("subtask_note_update", handleNoteUpdate);
        socket.off("userSubtaskNoteTyping", handleTyping);
      };
    }
  }, [socket, isOpen, subTaskId, currentUserName, refetch]);

  // Handle typing indicators
  const handleTyping = (typing: boolean) => {
    if (socket && subTaskId) {
      socket.emit("subtaskNoteTyping", { subTaskId, isTyping: typing });
    }
  };

  const handleSendNote = () => {
    if (!newNote.trim()) return;

    const noteData = {
      content: newNote.trim(),
      messageType: replyingTo ? ("reply" as const) : ("note" as const),
      ...(replyingTo && { replyTo: replyingTo }),
    };

    addNote(
      { taskId, subTaskId, noteData },
      {
        onSuccess: () => {
          setNewNote("");
          setReplyingTo(null);
          handleTyping(false);
        },
      }
    );
  };

  const handleReply = (noteId: string) => {
    setReplyingTo(noteId);
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendNote();
    }
  };

  const getAuthorIcon = (authorRole: string) => {
    return authorRole === "admin" ? (
      <Crown className="w-3 h-3 text-yellow-600" />
    ) : (
      <User className="w-3 h-3 text-blue-600" />
    );
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const findReplyToNote = (replyToId: string): SubTaskNote | undefined => {
    return notesData?.notes.find((note) => note._id === replyToId);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Notes & Discussion
            <Badge variant="outline" className="ml-2">
              {subTaskTitle}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Notes List */}
        <div 
          ref={scrollAreaRef} 
          className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !notesData?.notes.length ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notes yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {notesData.notes.map((note) => {
                const replyToNote = note.replyTo ? findReplyToNote(note.replyTo) : null;
                const isCurrentUser = note.authorName === currentUserName;

                return (
                  <div
                    key={note._id}
                    className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={`text-xs ${
                        note.authorRole === "admin" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {getAuthorInitials(note.authorName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex-1 ${isCurrentUser ? "text-right" : ""}`}>
                      <div
                        className={`inline-block max-w-[85%] p-3 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {/* Reply indicator */}
                        {replyToNote && (
                          <div className={`text-xs mb-2 p-2 rounded border-l-2 ${
                            isCurrentUser 
                              ? "bg-blue-700 border-blue-300" 
                              : "bg-gray-200 border-gray-400"
                          }`}>
                            <div className="flex items-center gap-1 mb-1">
                              <Reply className="w-3 h-3" />
                              <span className="font-medium">{replyToNote.authorName}</span>
                            </div>
                            <p className="truncate">{replyToNote.content}</p>
                          </div>
                        )}

                        {/* Message content */}
                        <p className="whitespace-pre-wrap">{note.content}</p>
                      </div>

                      {/* Message metadata */}
                      <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                        isCurrentUser ? "justify-end" : ""
                      }`}>
                        <div className="flex items-center gap-1">
                          {getAuthorIcon(note.authorRole)}
                          <span className="font-medium">{note.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatMessageTime(note.createdAt)}</span>
                        </div>
                        {!isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleReply(note._id)}
                          >
                            <Reply className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span>Someone is typing...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 bg-gray-50 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Reply className="w-4 h-4" />
              <span>Replying to {findReplyToNote(replyingTo)?.authorName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            ref={textareaRef}
            value={newNote}
            onChange={(e) => {
              setNewNote(e.target.value);
              handleTyping(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyPress}
            placeholder={replyingTo ? "Type your reply..." : "Add a note..."}
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isPending}
          />
          <Button
            onClick={handleSendNote}
            disabled={!newNote.trim() || isPending}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteConversationDialog;