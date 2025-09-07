import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CRITICAL: This must be true
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Helper function to check if we're on a login page
const isOnLoginPage = () => {
  return window.location.pathname.includes("/signin") ||
    window.location.pathname.includes("/login") ||
    window.location.pathname.includes("/auth");
};

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't handle auth errors on login/register endpoints
    if (originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if we're already on login page
      if (isOnLoginPage()) {
        return Promise.reject(error);
      }

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use fresh axios instance to avoid infinite loops
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            timeout: 5000,
          }
        );

        if (refreshResponse.data && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;
          localStorage.setItem("token", newToken);

          // Update the original request with new token
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error("No token received from refresh endpoint");
        }
      } catch (refreshError) {

        const axiosRefreshError = refreshError as AxiosError;

        processQueue(
          refreshError instanceof Error
            ? refreshError
            : new Error("Token refresh failed"),
          null
        );

        // Only clear token if it's a definitive auth error (not network issues)
        if (axiosRefreshError.response?.status === 401 ||
          axiosRefreshError.response?.status === 403) {
          localStorage.removeItem("token");

          // Only redirect if not already on login page and it's a real auth failure
          if (!isOnLoginPage()) {
            // Add a small delay to prevent multiple redirects
            setTimeout(() => {
              if (!isOnLoginPage()) {
                window.location.href = "/signin";
              }
            }, 100);
          }
        } else if (axiosRefreshError.response?.status === 404) {
          localStorage.removeItem("token");

          if (!isOnLoginPage()) {
            setTimeout(() => {
              if (!isOnLoginPage()) {
                window.location.href = "/signin";
              }
            }, 100);
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden errors (invalid/expired refresh token)
    if (error.response?.status === 403) {
      localStorage.removeItem("token");

      // Only redirect on 403 if it's not a login page and not a refresh endpoint
      if (!isOnLoginPage() && !originalRequest?.url?.includes('/auth/refresh')) {
        setTimeout(() => {
          if (!isOnLoginPage()) {
            window.location.href = "/signin";
          }
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;