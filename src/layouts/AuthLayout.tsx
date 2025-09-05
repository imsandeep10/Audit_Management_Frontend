import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className=" bg-gray-50 flex items-center justify-center">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
