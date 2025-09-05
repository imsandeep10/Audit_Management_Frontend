import SignupForm from "../../components/auth/SignupForm";
import SignupText from "../../components/auth/SignupText";

const Signup = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <SignupText type="signup" />
      <SignupForm />
    </div>
  );
};

export default Signup;
