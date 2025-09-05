import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { IoEllipse } from "react-icons/io5";

export const FindingIssue = () => {
  return (
    <Card className="  card-custom">
      <CardContent>
        <h3 className="py-2 font-semibold  text-2xl">Findings And Issues</h3>
        <ul className="flex flex-col justify-center gap-5 font-normal pt-3">
          <li className="flex flex-row items-center gap-3 ">
            <span>
              <IoEllipse className="text-sm" />
            </span>
            <span className="text-lg">Unassigned Clients</span>
          </li>
          <li className="flex flex-row items-center gap-3 ">
            <span>
              <IoEllipse className="text-sm" />
            </span>
            <Link to="/report" className="text-lg">
              Overdue Reports
            </Link>
          </li>
          <li className="flex flex-row items-center gap-3 ">
            <span>
              <IoEllipse className="text-sm" />
            </span>
            <span className="text-lg">Files Access Issues</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
