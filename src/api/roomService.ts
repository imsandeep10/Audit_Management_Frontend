import axiosInstance from "./axiosInstance";
export interface CreateGroupRequest {
    employeeIds: string[];
    name: string;
}

export interface CreateGroupResponse {
    message: string;
    room: {
        _id: string;
        name: string;
        owner: string;
        participants: string[];
        isGroup: boolean;
        unreadCount: Array<{ userId: string; count: number }>;
        readStatus: Array<{ userId: string; lastReadAt: Date; isRead: boolean }>;
        createdAt: Date;
        updatedAt: Date;
    };
}


export const roomService = {
    async createRoom(data: { employeeId: string }) {
        const response = await axiosInstance.post(
            "/message/create-room",
            data
        );
        return response.data;
    },
    async createGroup(data: CreateGroupRequest): Promise<CreateGroupResponse> {
        const response = await axiosInstance.post<CreateGroupResponse>(
            "/message/create-group",
            data
        );
        return response.data;
    },

    async getRooms() {
        const response = await axiosInstance.get("/message/rooms");
        return response.data;
    },

    async getRoomsPaginated(page: number = 1, limit: number = 20) {
        const response = await axiosInstance.get(`/message/rooms?page=${page}&limit=${limit}`);
        return response.data;
    },

    async markAsRead(roomId: string) {
        const response = await axiosInstance.put(`/message/${roomId}/mark-read`);
        return response.data;
    },
    async deleteRoom(roomId: string) {
        const response = await axiosInstance.delete(`/message/delete/${roomId}`);
        return response.data;
    },
    async updateGroup(roomId: string, data: CreateGroupRequest) {
        const response = await axiosInstance.put(`/message/update/${roomId}`, data);
        return response.data;
    },

    async getRoomById(roomId: string) {
        const response = await axiosInstance.get(`/message/room/${roomId}`);
        return response.data;
    },
};

