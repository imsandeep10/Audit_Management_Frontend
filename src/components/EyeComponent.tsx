import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const EyeComponent = ({ text }: {text: string}) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  if (!text) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-gray-500 italic">No password available</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={togglePassword}
        aria-label={showPassword ? "Hide Password" : "Show Password"}
        className="p-1"
      >
        {showPassword ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>
      <p className="text-xl  min-w-[100px]">
        {showPassword
          ? text
          : Array.from({ length: text.length || 8 }).map((_, i) => (
              <span key={i}>&bull;</span> // • bullet for each character
            ))}
      </p>
    </div>
  );
};

export default EyeComponent;
