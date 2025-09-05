import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import noteConversationService, {
  type SubTaskNotesResponse,
  type AddNoteRequest,
  type AddNoteResponse,
} from "../api/noteConversationService";

// Hook to get subtask notes
export const useSubTaskNotes = (taskId: string, subTaskId: string) => {
  return useQuery<SubTaskNotesResponse>({
    queryKey: ["subtask-notes", taskId, subTaskId],
    queryFn: async () => {
      try {
        return await noteConversationService.getSubTaskNotes(taskId, subTaskId);
      } catch (error: any) {
        // Don't let note fetch errors cascade to auth failures
        console.warn("Failed to fetch notes:", error.message);
        // Return empty structure to prevent dialog from crashing
        return {
          success: true,
          message: "No notes available",
          notes: [],
          subTaskId,
          taskId,
          subTaskTitle: "Unknown",
          subTaskStatus: "unknown"
        };
      }
    },
    enabled: !!(taskId && subTaskId),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on failure
  });
};

// Hook to add a new note
export const useAddSubTaskNote = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AddNoteResponse,
    Error,
    { taskId: string; subTaskId: string; noteData: AddNoteRequest }
  >({
    mutationFn: ({ taskId, subTaskId, noteData }) =>
      noteConversationService.addSubTaskNote(taskId, subTaskId, noteData),
    onSuccess: (_, variables) => {
      toast.success("Note added successfully");
      
      // Invalidate and refetch the notes for this subtask
      queryClient.invalidateQueries({
        queryKey: ["subtask-notes", variables.taskId, variables.subTaskId],
      });
      
      // Also invalidate the main tasks query to update the task list
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
      
      // Invalidate employee tasks if this is an employee's task
      queryClient.invalidateQueries({
        queryKey: ["employee-tasks"],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add note");
    },
  });
};

// Hook to mark notes as read
export const useMarkNotesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { taskId: string; subTaskId: string }
  >({
    mutationFn: ({ taskId, subTaskId }) =>
      noteConversationService.markNotesAsRead(taskId, subTaskId),
    onSuccess: (_, variables) => {
      // Optionally update local cache or trigger any read status UI updates
      queryClient.setQueryData(
        ["subtask-notes", variables.taskId, variables.subTaskId],
        (oldData: SubTaskNotesResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              // Could add read status to notes here if implemented
            };
          }
          return oldData;
        }
      );
    },
    onError: (error) => {
      console.error("Failed to mark notes as read:", error.message);
    },
  });
};

// Hook to get real-time updates for subtask notes
export const useSubTaskNotesRealTime = (
  taskId: string,
  subTaskId: string,
  socket: any
) => {
  const queryClient = useQueryClient();

  // Join subtask notes room when hook is used
  React.useEffect(() => {
    if (socket && subTaskId) {
      socket.emit("joinSubTaskNotes", subTaskId);

      // Listen for new notes
      const handleNewNote = (data: any) => {
        if (data.subTaskId === subTaskId) {
          queryClient.invalidateQueries({
            queryKey: ["subtask-notes", taskId, subTaskId],
          });
          
          // Show toast notification for new notes from other users
          toast.info(`New note added by ${data.note.authorName}`);
        }
      };

      // Listen for typing indicators
      const handleTyping = (data: any) => {
        if (data.subTaskId === subTaskId) {
          // Handle typing indicator UI updates
          // This could be implemented with a separate state management
        }
      };

      socket.on("subtask_note_update", handleNewNote);
      socket.on("userSubtaskNoteTyping", handleTyping);

      return () => {
        socket.emit("leaveSubTaskNotes", subTaskId);
        socket.off("subtask_note_update", handleNewNote);
        socket.off("userSubtaskNoteTyping", handleTyping);
      };
    }
  }, [socket, subTaskId, taskId, queryClient]);
};

export default {
  useSubTaskNotes,
  useAddSubTaskNote,
  useMarkNotesAsRead,
  useSubTaskNotesRealTime,
};