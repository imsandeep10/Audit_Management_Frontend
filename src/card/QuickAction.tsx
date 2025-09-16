import { Link, useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { IoEllipse } from "react-icons/io5";

const QuickAction = () => {
  const navigate = useNavigate();

  return (
    <Card className=" card-custom">
      <CardContent>
        <h3 className="py-2 font-semibold  text-2xl">Quick Action </h3>
        <ul className="flex flex-col justify-center gap-5 font-normal pt-3">
          <li className="flex flex-row items-center gap-3 ">
            <span>
              <IoEllipse className="text-[#0E2258] text-sm" />
            </span>
            <Link to="/assignees">
              <button className="text-lg bg-transparent hover:bg-[#F0F5FF] text-gray-800 cursor-pointer">
                Assign Employee
              </button>
            </Link>
          </li>
          <li className="flex flex-row items-center gap-3 ">
            <span>
              <IoEllipse className="text-[#0E2258] text-sm" />
            </span>
            <button
              onClick={() => navigate("/settings")}
              className="text-lg bg-transparent hover:bg-[#F0F5FF] text-gray-800 cursor-pointer"
            >
              Change Employee Password
            </button>
          </li>
          <li className="flex flex-row items-center gap-3 ">
            <span>
              <IoEllipse className="text-[#0E2258] text-sm" />
            </span>
            <button
              onClick={() => navigate("/all/documents")}
              className="text-lg bg-transparent hover:bg-[#F0F5FF] text-gray-800 cursor-pointer"
            >
              View Client Files
            </button>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default QuickAction;
