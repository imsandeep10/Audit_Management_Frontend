import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import { Trash, Users, Edit } from "lucide-react";
import AddParticipants from "./AddParticipants";
import type { Room } from "../../lib/types";

interface props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  variant: "list" | "chat";
  onDelete?: () => void;
  existingRoom?: Room | null; // For edit mode
}

const ChatDropDown = ({
  isOpen,
  setIsOpen,
  variant,
  onDelete,
  existingRoom = null,
}: props) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [participantModalType, setParticipantModalType] = useState<
    "add" | "edit"
  >("add");

  const handleAddParticipants = () => {
    setParticipantModalType("add");
    setIsPopupOpen(true);
    setIsOpen(false); // Close the dropdown when opening the popup
  };

  const handleEditParticipants = () => {
    setParticipantModalType("edit");
    setIsPopupOpen(true);
    setIsOpen(false); // Close the dropdown when opening the popup
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setIsOpen(false); // Close the dropdown when opening the dialog
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      {variant === "list" ? (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddParticipants}>
              <span className="flex gap-2 items-center">
                <Users className="w-4 h-4" />
                Create Group
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Add Users - for individual chats or creating new groups */}
            {!existingRoom?.isGroup && (
              <DropdownMenuItem onClick={handleAddParticipants}>
                <span className="flex gap-2 items-center">
                  <Users className="w-4 h-4" />
                  Add Users
                </span>
              </DropdownMenuItem>
            )}

            {/* Edit Group - for existing group chats */}
            {existingRoom?.isGroup && (
              <DropdownMenuItem onClick={handleEditParticipants}>
                <span className="flex gap-2 items-center">
                  <Edit className="w-4 h-4" />
                  Edit Group
                </span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={handleDeleteClick}>
              <span className="flex gap-2 items-center text-red-600">
                <Trash className="w-4 h-4" />
                Delete Chat
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Add/Edit Participants Popup - Pass existingRoom properly */}
      <AddParticipants
        isPopupOpen={isPopupOpen}
        setIsPopupOpen={setIsPopupOpen}
        type={participantModalType}
        existingRoom={existingRoom}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsDeleteDialogOpen(false)}
          ></div>

          {/* Dialog */}
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete {existingRoom?.isGroup ? "Group" : "Chat"}
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this{" "}
                {existingRoom?.isGroup ? "group" : "chat"}? This action cannot
                be undone. All messages in this conversation will be permanently
                removed.
                {existingRoom?.isGroup && (
                  <span className="block mt-2 font-medium text-gray-800">
                    Group: {existingRoom.name || "Unnamed Group"}
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Delete {existingRoom?.isGroup ? "Group" : "Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatDropDown;
