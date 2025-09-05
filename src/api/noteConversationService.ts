import axiosInstance from "./axiosInstance";

export interface SubTaskNote {
  _id: string;
  content: string;
  createdAt: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  authorName: string;
  authorRole: "admin" | "employee";
  messageType: "note" | "reply" | "update";
  isEdited?: boolean;
  editedAt?: string;
  replyTo?: string;
}

export interface SubTaskNotesResponse {
  success: boolean;
  message: string;
  notes: SubTaskNote[];
  subTaskId: string;
  taskId: string;
  subTaskTitle: string;
  subTaskStatus: string;
}

export interface AddNoteRequest {
  content: string;
  messageType?: "note" | "reply" | "update";
  replyTo?: string;
}

export interface AddNoteResponse {
  success: boolean;
  message: string;
  note: SubTaskNote;
  subTaskId: string;
  taskId: string;
}

class NoteConversationService {
  // Get all notes for a subtask
  async getSubTaskNotes(taskId: string, subTaskId: string): Promise<SubTaskNotesResponse> {
    try {
      const response = await axiosInstance.get(
        `/task/${taskId}/subtask/${subTaskId}/notes`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch notes");
    }
  }

  // Add a new note to a subtask
  async addSubTaskNote(
    taskId: string,
    subTaskId: string,
    noteData: AddNoteRequest
  ): Promise<AddNoteResponse> {
    try {
      const response = await axiosInstance.post(
        `/task/${taskId}/subtask/${subTaskId}/notes`,
        noteData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add note");
    }
  }

  // Mark notes as read (for future read status tracking)
  async markNotesAsRead(taskId: string, subTaskId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.patch(
        `/task/${taskId}/subtask/${subTaskId}/notes/read`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to mark notes as read");
    }
  }
}

export const noteConversationService = new NoteConversationService();
export default noteConversationService;