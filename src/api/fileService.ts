import axiosInstance from "./axiosInstance";

export const fileService = {
    async uploadImage(image: File) {
        const formData = new FormData();
        formData.append("image", image);

        const response = await axiosInstance.post(
            "/files/image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },
};