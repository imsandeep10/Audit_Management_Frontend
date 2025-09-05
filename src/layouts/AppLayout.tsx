import { SearchProvider } from "../contexts/SearchContext";
import TopBar from "../components/common/Nav";
import AppSideBar from "../components/common/sidebar/AppSideBar";
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";

export default function AppLayout() {
  const location = useLocation();
  

  const authRoutes = ["/", "/signin", "/forgot-password"];
  if (authRoutes.includes(location.pathname)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSideBar />
      <div className="flex flex-col h-screen overflow-hidden w-full">
        <SearchProvider>
          <TopBar />
        </SearchProvider>
        <SidebarInset className="flex-1 min-h-0">
          <div className="bg-sidebar h-full">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
