import {
  PlusSquare,
  User,
  BarChart3,
  SquareActivity,
  MessageCircleWarning,
  Files,
} from "lucide-react";
import { Home, Users, Settings } from "lucide-react";

export const sideBarList = [
  {
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    items: [
      {
        title: "Assignment",
        url: "/assignment",
        icon: PlusSquare,
      },
    ],
  },
  {
    items: [
      {
        title: "Employees",
        url: "/employees",
        icon: Users,
      },
    ],
  },
  {
    items: [
      {
        title: "Clients",
        url: "/clients",
        icon: User,
      },
    ],
  },
  {
    items: [
      {
        title: "Documents",
        url: "/all/documents",
        icon: Files,
      },
    ],
  },
  {
    items: [
      {
        title: "Profile",
        url: "/profile",
        icon: BarChart3,
      },
    ],
  },
  {
    items: [
      {
        title: "Activity Logs",
        url: "/Activities",
        icon: SquareActivity,
      },
    ],
  },
  {
    items: [
      {
        title: "Report",
        url: "/report",
        icon: MessageCircleWarning,
      },
    ],
  },
  {
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];
