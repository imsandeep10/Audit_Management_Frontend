import { FaFile, FaUserFriends } from "react-icons/fa";
import { LuChartNoAxesColumn } from "react-icons/lu";
import { RiProgress5Line } from "react-icons/ri";

export interface CardData {
  id: number;
  title: string;
  count: number;
  icon: React.ElementType;
  iconColor: string;
}


export const cardData: CardData[] = [
  {
    id: 1,
    title: "Employees Assigned",
    count: 22,
    icon: FaUserFriends,
    iconColor: "#0E2258",
  },
  {
    id: 2,
    title: "Team in Progress",
    count: 77,
    icon: RiProgress5Line,
    iconColor: "#210EAB",
  },
  {
    id: 3,
    title: "Active client File",
    count: 14,
    icon: FaFile,
    iconColor: "#F5AC00",
  },
  {
    id: 4,
    title: "Filed Report",
    count: 90,
    icon: LuChartNoAxesColumn,
    iconColor: "#000000",
  },
];
