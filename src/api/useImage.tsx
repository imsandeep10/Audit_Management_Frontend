import { useMutation } from "@tanstack/react-query";
import { fileService } from "./fileService";

export const useImageUpload = () => {
  return useMutation({
    mutationFn: (image: File) => fileService.uploadImage(image),

    onError: (error) => {
      console.error("Image upload error:", error);
    },
  });
};
