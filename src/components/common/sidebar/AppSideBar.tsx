import { Link, useLocation } from "react-router-dom";
import { cn } from "../../../lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import { sideBarList } from "../../../constant/sidebarList";
import SideBarFooter from "./SideBarFooter";

import type { menuItem, menuSection } from "../../../lib/types";
import Logo from "../../../assets/logo.png";


const AppsideBar = () => {
  const location = useLocation();
  const isActive = (url: string) => {
    return location.pathname === url;
  };
  return (
    <Sidebar collapsible="icon" className="shadow-2xl">
      <div className="px-10 flex flex-col items-center font-semibold h-18 max-w-full card-custom pt-5  ">
        <img
          src={Logo}
          alt="ams-logo"
          className="h-full object-cover w-20"
        />
      </div>
      <SidebarContent className="card-custom pt-5 md:overflow-hidden ">
        {sideBarList.map((section: menuSection) => (
          <SidebarGroup key={section.items[0].title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item: menuItem) => (
                  <SidebarMenuItem key={item?.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item?.url}
                        data-active={isActive(item.url)}
                        className={cn(
                          "flex items-center gap-2 px-4  transition-all  font-medium ",
                          isActive(item?.url)
                            ? "bg-[#210EAB] hover:bg-[#F4F4F5]   text-white rounded-full scale-y-110 shadow-md shadow-black/50"
                            : " "
                        )}
                      >
                        <item.icon />
                        <span className="text-lg font-semibold ">
                          {item?.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SideBarFooter type="admin" />
    </Sidebar>
  );
};

export default AppsideBar;
