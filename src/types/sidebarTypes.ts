import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
}
export interface SidebarSection {
  item: SidebarItem[];
}

export type SidebarList = SidebarSection[];
