import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
// import { Suspense, lazy } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./layouts/AppLayout";

import Clients from "./pages/clients/Clients";
import PageNotfound from "./pages/PageNotfound";
import Settings from "./pages/settings/Settings";
import Employees from "./pages/employees/Employees";
import Assignment from "./pages/assignment/Assignment";
import Signin from "./pages/authpage/Signin";
import ForgotPassword from "./pages/ForgotPassword";
import Chat from "./pages/chat/Chat";
import AuthLayout from "./layouts/AuthLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Toaster } from "sonner";
import { ActivityLog } from "./employee/dashboard/ActivityLog";
import Signup from "./pages/authpage/Signup";
import AdminActivity from "./components/activities/adminActivities/adminActivities";
import { EmployeeActivitiesPage } from "./components/activities/employeeActivities/EmployeeActivity";
import EmployeeForm from "./pages/create-employees/EmployeeForm";
import UserDetailPage from "./pages/userDetailPage/UserDetailPage";
import { UploadClientDocument } from "./components/documentUpload/uploadClientDocument";
import ClientForm from "./components/create-client/ClientForm";
import EditClient from "./pages/editClient/EditClient";
import { DocumentsPage } from "./components/documentUpload/viewDocument";
import EmployeeLayout from "./layouts/employeeLayout";
import { EmployeeDashboard } from "./employee/dashboard/employeeDashboard";
import { RoleBasedRedirect } from "./components/common/RoleBasedRedirect";
import { EmployeeAssignedTasks } from "./employee/dashboard/AssignedTasks";
import { AssignedClientDetails } from "./employee/dashboard/AssignedClientDetails";
import { AssignedClientDocument } from "./employee/dashboard/AssignedClientDocument";
import { UploadClientBillsByEmployee } from "./employee/dashboard/UploadClientBillsByEmployee";
import { UploadClientDocumentsByEmployee } from "./employee/dashboard/UploadClientDocumentsByEmployee";

import { EmployeeProfile } from "./employee/dashboard/Profile";
import { ClientDocumentsPage } from "./components/create-client/client-document";
import Report from "./pages/report/report";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Profile } from "./components/profile/UserProfile";
import Assignees from "./pages/assignes/Assignees";
import { UploadClientBills } from "./components/documentUpload/uploadClientBills";
import SplashScreen from "./components/common/SplashScreen";


const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: false, element: <RoleBasedRedirect /> },
      { path: "signin", element: <Signin /> },
      { path: "signup", element: <Signup /> },
      { path: "forgot-password", element: <ForgotPassword /> },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute requiredRole="admin">
        <SplashScreen>
          <AppLayout />
        </SplashScreen>
      </ProtectedRoute>
    ),
    errorElement: <PageNotfound />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "assignment", element: <Assignment /> },

      { path: "employees", element: <Employees /> },
      { path: "createEmployees", element: <EmployeeForm mode="create" /> },
      { path: "assignees", element: <Assignees /> },
      { path: "updateEmployees/:id", element: <EmployeeForm mode="edit" /> },
      { path: "user-detail", element: <UserDetailPage /> },

      { path: "clients", element: <Clients /> },
      { path: "addclients", element: <ClientForm mode="create" /> },
      {
        path: "clients/:id",
        element: <EditClient />,
      },
      { path: "user-detail/:userId", element: <UserDetailPage /> },

      { path: "profile", element: <Profile /> },
      { path: "activityLog", element: <ActivityLog /> },
      { path: "settings", element: <Settings /> },
      { path: "activities", element: <AdminActivity /> },
      {
        path: "employee-activities/:employeeId",
        element: <EmployeeActivitiesPage />,
      },
      {
        path: "upload-client-documents/:clientId",
        element: <UploadClientDocument />,
      },
      {
        path: "clients/:clientId/upload-client-bills",
        element: <UploadClientBills />,
      },
      { path: "clients/:id/documents", element: <ClientDocumentsPage /> },
      { path: "all/documents", element: <DocumentsPage /> },
      { path: "chat", element: <Chat /> },
      { path: "chat/:id", element: <Chat /> },
      { path: "report", element: <Report /> },
    ],
  },

  {
    path: "/employee",
    element: (
      <ProtectedRoute requiredRole="employee">
        <SplashScreen>
          <EmployeeLayout />
        </SplashScreen>
      </ProtectedRoute>
    ),
    errorElement: <PageNotfound />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard/:employeeId", element: <EmployeeDashboard /> },
      { path: "activity-log/:employeeId", element: <ActivityLog /> },
      {
        path: "/employee/clients/:clientId/documents",
        element: <AssignedClientDocument />,
      },
      {
        path: "assigned-tasks/:employeeId",
        element: <EmployeeAssignedTasks />,
      },
      {
        path: "assigned-clients/:employeeId",
        element: <AssignedClientDetails />,
      },
      {
        path: "profile/:employeeId",
        element: <EmployeeProfile />,
      },
      {
        path: "upload-client-documents/:clientId",
        element: <UploadClientDocumentsByEmployee />,
      },
      {
        path: "clients/:clientId/upload-client-bills",
        element: <UploadClientBillsByEmployee />,
      },
      { path: "chat", element: <Chat /> },
      { path: "chat/:id", element: <Chat /> },
    ],
  },

  {
    path: "/client",
    element: <PageNotfound />,
  },

  {
    path: "*",
    element: <PageNotfound />,
  },
]);

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
