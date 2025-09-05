import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "./ui/button";

export type DeletePopupProps = {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => void;
  isLoading?: boolean;
};

export const DeletePopup: React.FC<DeletePopupProps> = ({
  trigger,
  title = "Are you absolutely sure?",
  onConfirm,
  description = "",
  isLoading = false,
}) => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">cancel</Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
