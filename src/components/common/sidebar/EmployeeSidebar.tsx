import { Link, useLocation } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import {
  Menu,
  LayoutDashboard,
  ListTodo,
  Users,
  SquareActivity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Separator } from "../../ui/separator";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../../hooks/useAuth";
import SideBarFooter from "./SideBarFooter";

export function EmployeeSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  if(!user?._id){
    return <div>User not found</div>
  }

  const navItems = [
    {
      name: "Dashboard",
      path: `/employee/dashboard/${user?._id}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Tasks",
      path: `/employee/assigned-tasks/${user?._id}`,
      icon: <ListTodo className="h-5 w-5" />,
    },
    {
      name: "Clients",
      path: `/employee/assigned-clients/${user?._id}`,
      icon: <Users className="h-5 w-5" />,
    },
    // {
    //   name: "Profile",
    //   path: `/employee/profile/${user?._id}`,
    //   icon: <User className="h-5 w-5" />,
    // },
    {
      name: "Activity Log",
      path: `/employee/activity-log/${user?._id}`,
      icon: <SquareActivity className="h-5 w-5" />,
    },
  ];

  const isActive = (path: string) => {
    if (path === `/employee/dashboard/${user?._id}`) {
      return location.pathname.startsWith(`/employee/dashboard`);
    }
    return location.pathname === path;
  };

  // Get initials for fallback avatar
  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6 transition-transform hover:scale-110" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0 bg-[#F4F4F5] ">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation menu for employee dashboard
          </SheetDescription>
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="flex items-center gap-2 py-4">
              <Avatar className="transition-all hover:scale-105">
                <AvatarImage
                  src={user?.profileImageId?.url}
                  alt={`${user?.fullName}'s profile`}
                  loading="lazy"
                />
                <AvatarFallback className="bg-[#210EAB] text-white">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="transition-colors hover:text-[#210EAB]">
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.employee?.position || "Employee"}
                </p>
              </div>
            </div>
            <Separator className="bg-gray-300" />
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 px-4 py-5 transition-all duration-300",
                    isActive(item.path)
                      ? "bg-[#210EAB] hover:bg-[#210EAB]/90 text-white"
                      : "hover:bg-gray-200"
                  )}
                >
                  <Link to={item.path}>
                    <span
                      className={cn(
                        "transition-transform duration-200",
                        isActive(item.path)
                          ? "scale-110"
                          : "group-hover:scale-110"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={cn(
                        "text-lg font-semibold transition-all duration-200",
                        isActive(item.path)
                          ? "translate-x-1"
                          : "group-hover:translate-x-1"
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-60 lg:border-r lg:bg-sidebar lg:shadow-2xl card-custom">
        <div className="flex h-full flex-col gap-2 p-4">
          <div className="flex items-center gap-2 py-4 transition-colors hover:text-[#210EAB]">
            <Avatar className="transition-all hover:scale-105">
              <AvatarImage
                src={user?.profileImageId?.url}
                alt={`${user?.fullName}'s profile`}
                loading="lazy"
              />
              <AvatarFallback className="bg-[#210EAB] text-white">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {user?.employee?.position || "Employee"}
              </p>
            </div>
          </div>
          <Separator className="bg-gray-300" />
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant="ghost"
                className={cn(
                  "group w-full justify-start gap-3 px-4 py-5 transition-all duration-300 hover:shadow-md",
                  isActive(item.path)
                    ? "bg-[#210EAB] hover:bg-[#210EAB]/90 text-white rounded-full shadow-md shadow-black/30"
                    : "hover:bg-gray-200 rounded-full"
                )}
              >
                <Link to={item.path}>
                  <span
                    className={cn(
                      "transition-transform duration-200",
                      isActive(item.path)
                        ? "scale-110"
                        : "group-hover:scale-110"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-semibold transition-all duration-200",
                      isActive(item.path)
                        ? "translate-x-1"
                        : "group-hover:translate-x-1"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              </Button>
            ))}
          </nav>

          <SideBarFooter type="employee" />
        </div>
      </div>
    </>
  );
}
