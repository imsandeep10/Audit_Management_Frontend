import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, User, ChevronDown } from "lucide-react";
import { NotificationDropdown } from "../notifications/NotificationDropdown";

export function EmployeeTopBar() {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 right-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - can add title or logo here if needed */}
        <div></div>
       
        {/* Right side - Notifications and profile */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <NotificationDropdown />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.fullName || "/avatars/employee.png"} alt="Employee" />
                  <AvatarFallback>
                    {user?.fullName?.split(' ').map(n => n[0]).join('') || 'EM'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex items-center gap-1">
                  {user?.fullName || 'Employee'}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm font-medium">
                {user?.email || 'employee@example.com'}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/employee/dashboard/${user?._id}`} className="w-full cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
             
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}