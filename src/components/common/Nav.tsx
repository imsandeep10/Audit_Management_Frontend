import { Menu, Search, ChevronRight, MessageSquareMore, X } from "lucide-react";
import { PlusSquare, User, Activity, Files } from "lucide-react";
import { Home, Users, Settings } from "lucide-react";
import { LuChartNoAxesColumn } from "react-icons/lu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { IoPower } from "react-icons/io5";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../contexts/SearchContext";
import SearchResult from "../search/SearchResults";
import { getInitials } from "../../utils/date-format";
import { NotificationDropdown } from "../notifications/NotificationDropdown";

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Assignment",
    url: "/assignment",
    icon: PlusSquare,
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: User,
  },
  {
    title: "Documents",
    url: "/all/documents",
    icon: Files,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: LuChartNoAxesColumn,
  },
  {
    title: "ActiviyLog",
    url: "/activityLog",
    icon: Activity,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  // const [activeItem, setActiveItem] = useState("/dashboard");
  const { searchTerm, setSearchTerm } = useSearch();
  const { user } = useAuth();
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleItemClick = () => {
    setIsOpen(false);
  };
  const logout = useContext(AuthContext)?.logout;

  const location = useLocation();
  const activeItem = location.pathname;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 py-1 bg-background border-b card-custom">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="p-6 pb-4">
                <SheetTitle className="text-left text-xl font-bold">
                  AMS
                </SheetTitle>
              </SheetHeader>

              <Separator />

              <nav className="flex-1 px-4 py-4">
                <ul className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.url;

                    return (
                      <li key={item.url}>
                        <button
                          onClick={() => handleItemClick()}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? "bg-[#210EAB] text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <Link to={item.url}>
                              <span>{item.title}</span>
                            </Link>
                          </div>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <Separator />

              <div className="p-4 flex justify-around items-center">
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex gap-3 cursor-pointer border border-gray-200 shadow-sm "
                >
                  <Link to="/chat" className="flex items-center gap-2">
                    <MessageSquareMore className="text-6xl" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold">
            {sidebarItems.find((item) => item.url === activeItem)?.title || ""}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 p-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-2 top-2 "
                  onClick={() => setSearchTerm("")}
                >
                  {" "}
                  <X className="w-5 h-5" />
                </button>
              )}

              <Input
                type="text"
                value={searchTerm}
                placeholder="Search..."
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(true);
                }}
                className="pl-10 pr-8"
                onFocus={() => setShowSearchResults(true)}
              />

              {searchTerm && showSearchResults && (
                <div
                  className="fixed inset-0 flex items-start justify-center pt-20 z-50 bg-blend-darken bg-opacity-50"
                  onClick={() => setShowSearchResults(false)}
                >
                  <div
                    className="relative w-full max-w-2xl mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="overflow-hidden rounded-lg shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setShowSearchResults(false);
                        }}
                        className="absolute right-10 top-7 z-30 text-gray-800 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <SearchResult
                        onResultClick={() => setShowSearchResults(false)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <NotificationDropdown />
          <Link to="/profile">
            <Avatar className="h-10 w-10 bg-gray-300 shadow-2xl">
              <AvatarImage src={user?.profileImageId?.url} alt="Avatar" />
              <AvatarFallback>
                {getInitials(user?.fullName || "")}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </div>
  );
}
