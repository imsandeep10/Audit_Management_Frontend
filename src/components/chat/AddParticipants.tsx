import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Users, Edit } from "lucide-react";
import { useGetAllEmployees } from "../../api/useEmployee";
import type { Employee, Room } from "../../lib/types";
import {
  useCreateGroup,
  useGetRoomsById,
  useUpdateGroup,
} from "../../api/useRoom";
import { useSearchParams } from "react-router-dom";

interface ParticipantsProps {
  isPopupOpen: boolean;
  setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  type: "add" | "edit";
  existingRoom?: Room | null;
}

interface AvailableUser {
  id: string;
  name: string;
  email: string;
}

// Define interfaces for the different user object structures we might encounter
interface UserWithStringId {
  _id?: string;
  id?: string;
  fullName?: string;
  email?: string;
}

interface UserWithNestedUser {
  user?: UserWithStringId;
}

// Helper function to extract user ID from various formats
const getUserId = (user: unknown): string => {
  if (typeof user === "string") return user;
  if (user && typeof user === "object") {
    // Type guard for objects with _id or id properties
    const userWithStringId = user as UserWithStringId;
    if (typeof userWithStringId._id === "string") {
      return userWithStringId._id;
    }
    if (typeof userWithStringId.id === "string") {
      return userWithStringId.id;
    }
    const userWithNested = user as UserWithNestedUser;
    if (userWithNested.user) {
      return userWithNested.user._id || userWithNested.user.id || "";
    }
  }
  return "";
};

const AddParticipants = ({
  isPopupOpen,
  setIsPopupOpen,
  type,
  existingRoom = null,
}: ParticipantsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { mutate: createGroup, isPending: isCreating } = useCreateGroup();
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();
  const { data: employees } = useGetAllEmployees();

  // Fetch room data if we're in edit mode and have a roomId but no existingRoom
  const { data: roomData } = useGetRoomsById(
    roomId && type === "edit" && !existingRoom ? roomId : ""
  );

  const isPending = isCreating || isUpdating;
  const isEditMode = type === "edit";

  // Use either passed existingRoom or fetched roomData
  const currentRoom = existingRoom || roomData?.data;
  // Initialize form data when popup opens or data changes
  useEffect(() => {
    console.log("Effect triggered:", {
      isPopupOpen,
      isEditMode,
      currentRoom: currentRoom?.name,
      participants: currentRoom?.participants?.length,
    });

    if (isPopupOpen) {
      if (isEditMode && currentRoom) {
        // Set group name
        const roomName = currentRoom.name || "";
        setGroupName(roomName);

        // Extract participant IDs properly
        const participantIds: string[] = [];
        if (
          currentRoom.participants &&
          Array.isArray(currentRoom.participants)
        ) {
          currentRoom.participants.forEach((participant: unknown) => {
            const userId = getUserId(participant);
            if (userId) {
              participantIds.push(userId);
            }
          });
        }

        setSelectedUsers(participantIds);
      } else if (!isEditMode) {
        // Reset form for add mode
        setGroupName("");
        setSelectedUsers([]);
      }

      // Always reset search when popup opens
      setSearchTerm("");
    }
  }, [isPopupOpen, isEditMode, currentRoom]);

  // Convert API employees into a simpler format and filter out the owner
  const availableUsers: AvailableUser[] = React.useMemo(() => {
    if (!employees?.data?.employees) return [];

    return employees.data.employees
      .map((emp: Employee): AvailableUser | null => {
        const userId = getUserId(emp.user);
        if (!userId) return null;

        return {
          id: userId,
          name:
            typeof emp.user === "object" && emp.user !== null
              ? (emp.user as UserWithStringId).fullName || "Unnamed"
              : "Unnamed",
          email:
            typeof emp.user === "object" && emp.user !== null
              ? (emp.user as UserWithStringId).email || ""
              : "",
        };
      })
      .filter((user: AvailableUser | null): user is AvailableUser => {
        if (!user) return false;

        // Filter out the owner from the available users list
        if (isEditMode && currentRoom?.owner) {
          const ownerId = getUserId(currentRoom.owner);
          return user.id !== ownerId;
        }
        return true;
      });
  }, [employees, isEditMode, currentRoom?.owner]);

  const filteredUsers: AvailableUser[] = React.useMemo(() => {
    return availableUsers.filter(
      (user: AvailableUser) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableUsers, searchTerm]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSelection = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      return newSelection;
    });
  };

  const handleSubmit = () => {
    if (selectedUsers.length === 0 || !groupName.trim()) {
      return;
    }

   

    if (isEditMode && (currentRoom?._id || roomId)) {
      // Update existing group - use employeeIds as expected by API
      const updateData = {
        employeeIds: selectedUsers, // API expects employeeIds for both create and update
        name: groupName.trim(),
      };

      const targetRoomId = currentRoom?._id || roomId;
      if (!targetRoomId) {
        console.error("No room ID available for update");
        return;
      }

      updateGroup(
        { roomId: targetRoomId, data: updateData },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: (error) => {
            console.error("Update failed:", error);
          },
        }
      );
    } else {
      // Create new group - use employeeIds for creation
      const createData = {
        employeeIds: selectedUsers, // Creation uses employeeIds
        name: groupName.trim(),
      };

      createGroup(createData, {
        onSuccess: () => {
          handleClose();
        },
        onError: (error) => {
          console.error("Create failed:", error);
        },
      });
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchTerm("");
    setGroupName("");
    setIsPopupOpen(false);
  };

  // Get currently selected participants for display (in edit mode)
  const currentParticipants =
    isEditMode && currentRoom ? currentRoom.participants?.length || 0 : 0;

  // Check if there are changes in edit mode
  const hasChanges = (): boolean => {
    if (!isEditMode || !currentRoom) return true;

    const originalName = currentRoom.name || "";
    const currentName = groupName.trim();

    // Extract original participant IDs
    const originalParticipantIds: string[] = [];
    if (currentRoom.participants && Array.isArray(currentRoom.participants)) {
      currentRoom.participants.forEach((participant: unknown) => {
        const userId = getUserId(participant);
        if (userId) {
          originalParticipantIds.push(userId);
        }
      });
    }

    const currentParticipantIds = [...selectedUsers].sort();
    originalParticipantIds.sort();

    const nameChanged = currentName !== originalName;
    const participantsChanged =
      JSON.stringify(originalParticipantIds) !==
      JSON.stringify(currentParticipantIds);

    return nameChanged || participantsChanged;
  };

  const changeDetected = hasChanges();

  return (
    <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit className="h-5 w-5" />
                Update Group
              </>
            ) : (
              <>
                <Users className="h-5 w-5" />
                Create Group
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the group "${
                  currentRoom?.name || "Unnamed Group"
                }" by modifying participants and name.`
              : "Create a new group by selecting users and giving it a name."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name Input */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder={
                isEditMode ? "Update group name..." : "Enter your group name..."
              }
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
              }}
            />
            {isEditMode && currentRoom?.name && (
              <p className="text-xs text-gray-500">
                Original name: "{currentRoom.name}"
              </p>
            )}
          </div>

          {/* Current Participants Info (Edit mode only) */}
          {isEditMode && currentRoom && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                Current Group: {currentRoom.name || "Unnamed Group"}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {currentParticipants} participant
                {currentParticipants !== 1 ? "s" : ""} currently in this group
              </p>
            </div>
          )}

          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <Input
              id="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredUsers.map((user: AvailableUser) => {
              const isSelected = selectedUsers.includes(user.id);

              // Check if this user was originally a participant
              const wasOriginalParticipant =
                isEditMode && currentRoom?.participants
                  ? currentRoom.participants.some((participant: unknown) => {
                      const participantId = getUserId(participant);
                      return participantId === user.id;
                    })
                  : false;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => handleUserToggle(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        isSelected ? "bg-blue-500" : "bg-gray-400"
                      }`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        {user.name}
                        {wasOriginalParticipant && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            Current Member
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {isSelected ? (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && searchTerm && (
              <p className="text-sm text-gray-500 text-center py-4">
                No users found matching "{searchTerm}"
              </p>
            )}

            {filteredUsers.length === 0 && !searchTerm && (
              <p className="text-sm text-gray-500 text-center py-4">
                No users available
              </p>
            )}
          </div>

          {/* Selected Count */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600">
                {selectedUsers.length} user
                {selectedUsers.length !== 1 ? "s" : ""} selected
              </p>
              {isEditMode && (
                <p className="text-blue-600">
                  {changeDetected ? "Changes detected" : "No changes"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              selectedUsers.length === 0 ||
              !groupName.trim() ||
              isPending ||
              (isEditMode && !changeDetected)
            }
          >
            {isPending
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? `Update Group ${
                  selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""
                }`
              : `Create Group ${
                  selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""
                }`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddParticipants;
