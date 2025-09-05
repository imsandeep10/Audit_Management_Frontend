import { Link } from "react-router-dom";

const PageNotfound = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20 gap-5  ">
      <h3 className="text-red-700 text-2xl font-semibold">Page Not Found</h3>
      <Link className="text-green-600 text-xl" to={"/dashboard"}>
        Go Back To Home Page
      </Link>
    </div>
  );
};

export default PageNotfound;
