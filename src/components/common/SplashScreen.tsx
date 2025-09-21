import { useState, useEffect, type ReactNode } from "react";
import Logo from "../../assets/logo.png";

interface SplashScreenProps {
  children: ReactNode;
}

const SplashScreen = ({ children }: SplashScreenProps) => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");

    if (justLoggedIn) {
      setShowSplash(true);
      sessionStorage.removeItem("justLoggedIn");

      setTimeout(() => {
        setShowSplash(false);
      }, 2000);
    }
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A2FC4]">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center">
            <img src={Logo} alt="Logo" className="w-20 h-20" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            M.Khatri & Associates
          </h1>

          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default SplashScreen;
