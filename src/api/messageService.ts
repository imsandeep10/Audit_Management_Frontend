import axiosInstance from "./axiosInstance";

export const messageService = {
    async sendMessage({
        content,
        roomId,
    }: {
        content: string;
        roomId: string;
    }) {
        const response = await axiosInstance.post(`message/room/${roomId}`, {
            content,
        });
        return response.data;
    },

    async getMessages(roomId: string, skip: number = 0, limit: number = 20) {


        // Use roomId as query parameter along with skip and limit
        const response = await axiosInstance.get(`/message/room?roomId=${roomId}&skip=${skip}&limit=${limit}`);
        return response.data;
    },
};