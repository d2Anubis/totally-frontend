import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  API_BASE_URL,
  getAuthToken,
  getRefreshToken,
  removeAuthTokens,
} from "./config";

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Helper function to check if an endpoint is public (doesn't require authentication)
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes("/user/product/get-product") ||
    url.includes("/banners") ||
    url.includes("/collections") ||
    url.includes("/categories") ||
    url.includes("/user/product/get-products")
  );
};

// Helper function to check if current page should not trigger login redirect
const isPublicPage = (pathname: string): boolean => {
  return (
    pathname === "/" ||
    pathname === "/home" ||
    pathname.includes("/product/") ||
    pathname.includes("/category/") ||
    pathname.includes("/brand/") ||
    pathname === "/categories"
  );
};

// Process the queue of failed requests with the new token or error
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Create Axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 50000,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    // Only add auth token for endpoints that require authentication
    if (token && !isPublicEndpoint(config.url)) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized errors (token expired)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // Check if this is a login/auth related request - don't auto-redirect
      const isAuthRequest =
        originalRequest.url?.includes("/auth/") ||
        originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/register");

      // Check if user is currently on auth pages - don't auto-redirect
      const isOnAuthPage =
        typeof window !== "undefined" &&
        (window.location.pathname === "/login" ||
          window.location.pathname === "/register" ||
          window.location.pathname === "/auth");

      // If this is an auth request, public endpoint, or user is on auth page, just return the error
      if (
        isAuthRequest ||
        isPublicEndpoint(originalRequest.url) ||
        isOnAuthPage
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If token refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Get the refresh token
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, clear auth and reject
        removeAuthTokens();
        isRefreshing = false;

        // Only redirect to login page if not on public pages or making public endpoint requests
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;

          if (
            !isPublicPage(currentPath) &&
            !isOnAuthPage &&
            !isPublicEndpoint(originalRequest.url)
          ) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }

      try {
        // Call the refresh token endpoint
        const response = await axios.post<{
          success: boolean;
          accessToken: string;
          refreshToken: string;
        }>(`${API_BASE_URL}/user/auth/refresh-token`, { refreshToken });

        if (response.data.success) {
          // Import functions dynamically to avoid circular dependencies
          const { setAuthToken, setRefreshToken } = await import("./config");

          // Store the new tokens
          setAuthToken(response.data.accessToken);
          setRefreshToken(response.data.refreshToken);

          // Update Authorization header for the original request
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${response.data.accessToken}`;

          // Process any queued requests with the new token
          processQueue(null, response.data.accessToken);

          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          // Token refresh failed, clear auth and reject all queued requests
          removeAuthTokens();
          processQueue(new Error("Token refresh failed"), null);

          // Only redirect to login page if not on public pages or making public endpoint requests
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;

            if (
              !isPublicPage(currentPath) &&
              !isOnAuthPage &&
              !isPublicEndpoint(originalRequest.url)
            ) {
              window.location.href = "/login";
            }
          }

          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Token refresh failed, clear auth and reject all queued requests
        removeAuthTokens();
        processQueue(
          refreshError instanceof Error
            ? refreshError
            : new Error("Token refresh failed"),
          null
        );

        // Only redirect to login page if not on public pages or making public endpoint requests
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;

          if (
            !isPublicPage(currentPath) &&
            !isOnAuthPage &&
            !isPublicEndpoint(originalRequest.url)
          ) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Return original error for other types of errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
