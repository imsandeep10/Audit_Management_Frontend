import SigninForm from "../../components/auth/SigninForm";
import SignupText from "../../components/auth/SignupText";

const Signin = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <SigninForm />
      <SignupText type="signin" />
    </div>
  );
};

export default Signin;
