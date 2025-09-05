import { IoPower } from "react-icons/io5";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Button } from "../../ui/button";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext.tsx";
import { MessageSquareMore } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth.ts";
import { useGetRooms } from "../../../api/useRoom";

interface Props {
  type: "admin" | "employee";
}
const SideBarFooter: React.FC<Props> = ({ type }) => {
  const logout = useContext(AuthContext)?.logout;
  const { user } = useAuth();
  const { data: rooms } = useGetRooms();

  // Calculate total unread count from all rooms for this user
  let totalUnreadCount = 0;
  if (rooms && user?._id) {
    totalUnreadCount = rooms.reduce(
      (
        sum: number,
        room: { unreadCount?: { userId: string; count: number }[] }
      ) => {
        if (Array.isArray(room.unreadCount)) {
          const entry = room.unreadCount.find(
            (u: { userId: string; count: number }) => u.userId === user._id
          );
          return sum + (entry?.count || 0);
        }
        return sum;
      },
      0
    );
  }
  return (
    <>
      <div className="flex bg-sidebar flex-row justify-around items-center card-custom pb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout?.();
              }}
              className=" cursor-pointer border border-gray-200 shadow-sm "
            >
              <IoPower className="text-6xl" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex gap-3 cursor-pointer border border-gray-200 shadow-sm "
            >
              <Link
                to={type === "admin" ? "/chat" : `/employee/chat/${user?._id}`}
                className="flex items-center gap-2 relative"
              >
                <MessageSquareMore className="text-6xl" />
                {totalUnreadCount > 0 && (
                  <span className="absolute -top-5 -right-5 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                  </span>
                )}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center space-x-2">
              {/* Unread badge now shown on icon, so this is removed */}
            </div>
            <p>Chat</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

export default SideBarFooter;
