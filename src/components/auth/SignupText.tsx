// import { Link } from "react-router-dom";
// import { Button } from "../ui/button";
import type { props } from "../../lib/types";
export default function SignupText({ type }: props) {
  return (
    <div className="hidden   md:flex flex-col justify-center items-center h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8 w-1/2">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          {type === "signin" ? "Welcome Back!" : "Come Join US!"}
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed text-sm font-medium">
          We are excited to have you here. If you haven't made account then Sign
          up here. Join our community and take the first step toward a better
          experience. Signing up gives you access to exclusive features,
          personalized content, and seamless interaction across all your
          devices.
        </p>
        {/* <div className="flex items-center justify-center space-x-2  bg-[#AFC3EB80]/50 rounded-md p-2 ">
          <span className="text-gray-600 font-semibold">
            Already have an account?
          </span>
          <Button
            variant="outline"
            className="p-0 text-blue-600 hover:text-blue-800 font-medium underline-none bg-transparent outline-none border-none hover:bg-transparent  shadow-none"
          >
            <Link to={type === "signin" ? "/signup" : "/"}>
              {type === "signin" ? "Sign Up" : "Sign In"}
            </Link>
          </Button>
        </div> */}
      </div>
    </div>
  );
}
