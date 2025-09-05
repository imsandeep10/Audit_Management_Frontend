import axiosInstance from "./axiosInstance";

export const userService = {
  async getUser() {
    const response = await axiosInstance.get("/user/getuser");
    return response.data;
  },
  async getUserById(userId: string) {
    const response = await axiosInstance.get(`/user/getuserbyid/${userId}`);
    return response.data;
  },
  async deleteUser(userId: string) {
    const response = await axiosInstance.delete(`/user/delete/${userId}`);
    return response.data;
  },
  async getAdmins() {
    const response = await axiosInstance.get(`/user/getadmins`);
    return response.data;
  },
  async updateAdmin(userId: string) {
    const response = await axiosInstance.patch(`/user/updateUser/${userId}`);
    return response.data;
  },
};
