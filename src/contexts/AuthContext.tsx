import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "sonner";
import type {
  User,
  AuthResponse,
  AxiosLikeError,
  AuthContextType,
  AuthProviderProps,
} from "../lib/types";
import { userService } from "../api/userService";

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!localStorage.getItem("token");

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const response = await userService.getUser();

        // Handle different response structures
        const userData =
          response.data?.user || response.data || response.user || response;

        if (userData && typeof userData === "object" && userData._id) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error: unknown) {
      console.error("Auth check failed:", error);

      // Only remove token if it's actually invalid, not on network errors
      const axiosError = error as AxiosLikeError;
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 403
      ) {
        localStorage.removeItem("token");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Helper function to parse JWT token
  const parseJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data }: { data: AuthResponse } = await axiosInstance.post(
        "/auth/login",
        { email, password }
      );

      if (data.token) {
        // Validate token before storing
        const tokenPayload = parseJWT(data.token);
        if (!tokenPayload || tokenPayload.exp * 1000 < Date.now()) {
          throw new Error("Received expired or invalid token");
        }

        localStorage.setItem("token", data.token);

        // get user data from response
        const userData = data.user || (await userService.getUser()).data;

        if (userData) {
          // Ensure userData has the required _id field
          const mappedUserData: User = {
            _id: userData.id,
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
          };
          setUser(mappedUserData);

          // redirection based on the role
          const redirectPath =
            userData.role === "admin"
              ? "/dashboard"
              : `/employee/dashboard/${mappedUserData._id}`;

          // Navigate to the appropriate dashboard
          window.location.href = redirectPath;
        } else {
          throw new Error("Failed to retrieve user data after Login");
        }
      } else {
        throw new Error("No token received from login");
      }

      if (data.user) {
        const mappedUser: User = {
          _id: data.user.id,
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
        };
        setUser(mappedUser);
      } else {
        // fallback: fetch user
        const response = await userService.getUser();

        // Handle different response structures
        const userData =
          response.data?.user || response.data || response.user || response;

        if (userData) {
          setUser(userData);
        } else {
          console.error("No user data in login fallback:", response);
          throw new Error("Failed to get user data after login");
        }
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosLikeError;
      console.error("Login error:", axiosError.response?.data);
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Login failed";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Always clean up local state first
      const token = localStorage.getItem("token");
      localStorage.removeItem("token");
      setUser(null);

      // Try to call logout endpoint, but don't fail if it doesn't work
      if (token) {
        try {
          await axiosInstance.post("/auth/logout");
        } catch (error) {
          console.warn(
            "Server logout failed, but local logout successful:",
            error
          );
        }
      }

      toast.success("Logged out successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosLikeError;
      console.error("Logout error:", axiosError.response?.data);
      // Ensure local cleanup even if server call fails
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Logged out successfully"); // Still show success since local cleanup worked
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      setIsLoading(true);
      await axiosInstance.post("/auth/register", {
        fullName,
        email,
        password,
        confirmPassword,
      });
      toast.success("Registration successful! Please login.");
    } catch (error: unknown) {
      const axiosError = error as AxiosLikeError;
      console.error("Registration error:", axiosError.response?.data);
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Registration failed";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Use consistent endpoint
        const response = await userService.getUser();

        // Handle different response structures
        const userData =
          response.data?.user || response.data || response.user || response;

        if (userData) {
          setUser(userData);
        } else {
          console.error("No user data in refresh:", response);
        }
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosLikeError;
      console.error("Failed to refresh user:", axiosError.response?.data);

      // Only clear user on auth errors, not network errors
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 403
      ) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
