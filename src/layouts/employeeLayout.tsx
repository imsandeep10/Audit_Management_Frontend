import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "../components/ui/sidebar";
import { EmployeeTopBar } from "../components/common/EmployeeTopBar";
import { EmployeeSidebar } from "../components/common/sidebar/EmployeeSidebar";

const EmployeeLayout = () => {
  const location = useLocation();

  const authRoutes = ["/", "/signin", "/forgot-password"];
  const isAuthPage = authRoutes.includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl w-full space-y-8">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <EmployeeSidebar />
      <div className="flex flex-col w-full h-screen overflow-hidden lg:pl-60">
        <EmployeeTopBar />
        <main className="flex-1 overflow-auto">
          <div className="bg-sidebar h-full max-w-full ">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EmployeeLayout;
