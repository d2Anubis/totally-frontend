import axiosInstance from "../axiosConfig";
import { setAuthToken, setRefreshToken, setUserData } from "../config";
import { AxiosError } from "axios";

// TypeScript interfaces
export interface RegisterUserRequest {
  first_name: string;
  last_name: string;
  language: string;
  email: string;
  country_code: string;
  phone: string;
  password: string;
  dob?: string; // ISO date format, optional
  gender?: "male" | "female" | "other"; // optional, default: male
  is_marketing_emails?: boolean; // optional, default: false
  is_marketing_sms?: boolean; // optional, default: false
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserResponse {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone: string;
  language: string;
  dob: string;
  gender: string;
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
  avatar: string;
  access_token: string;
  refresh_token: string;
  address?: {
    line1?: string;
    line2?: string;
    street?: string;
    city?: string;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = UserResponse> {
  success: boolean;
  message: string;
  data?: T;
}

// Register a new user
export const registerUser = async (
  userData: RegisterUserRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(
      "/user/auth/register",
      userData
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Registration successful!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Registration failed",
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "An error occurred during registration";

    console.error("Registration error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Login user
export const loginUser = async (
  credentials: LoginRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<UserResponse>>(
      "/user/auth/login",
      credentials
    );

    if (response.data.success) {
      // The API returns tokens and user data inside the data object
      if (response.data.data) {
        const userData = response.data.data;

        // Store tokens from the data object
        if (userData.access_token) {
          setAuthToken(userData.access_token);
        }

        if (userData.refresh_token) {
          setRefreshToken(userData.refresh_token);
        }

        // Store user information
        setUserData({
          id: userData.id || 0, // Default ID if not provided
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          country_code: userData.country_code,
          language: userData.language,
          dob: userData.dob,
          gender: userData.gender,
          is_marketing_emails: userData.is_marketing_emails,
          is_marketing_sms: userData.is_marketing_sms,
          avatar: userData.avatar || "/images/common/profile.jpeg",
          address: {
            line1: userData.address?.line1,
            line2: userData.address?.line2,
            street: userData.address?.street,
            city: userData.address?.city,
          },
        });
      }
      return {
        success: true,
        message: response.data.message || "Login successful!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "An error occurred during login";

    console.error("Login error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Google Authentication
export const handleGoogleLogin = async (
  googleToken: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<UserResponse>>(
      "/user/auth/google/token",
      {
        token: googleToken,
      }
    );

    if (response.data.success && response.data.data) {
      const userData = response.data.data;

      // Store tokens
      if (userData.access_token) {
        setAuthToken(userData.access_token);
      }

      if (userData.refresh_token) {
        setRefreshToken(userData.refresh_token);
      }

      // Store user information
      setUserData({
        id: userData.id || 0,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || "",
        country_code: userData.country_code || "",
        language: userData.language || "en",
        dob: userData.dob || "",
        gender: userData.gender || "other",
        is_marketing_emails: userData.is_marketing_emails || false,
        is_marketing_sms: userData.is_marketing_sms || false,
        avatar: userData.avatar || "/images/common/profile.jpeg",
        address: {
          line1: userData.address?.line1,
          line2: userData.address?.line2,
          street: userData.address?.street,
          city: userData.address?.city,
        },
      });

      return {
        success: true,
        message: "Google authentication successful",
      };
    } else {
      const errorMessage =
        response.data.message || "Failed to authenticate with Google";

      return {
        success: false,
        message: errorMessage,
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "An error occurred during Google authentication";

    console.error("Google login error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Facebook Authentication
export const handleFacebookLogin = async (
  facebookToken: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<UserResponse>>(
      "/user/auth/facebook/token",
      {
        token: facebookToken,
      }
    );

    if (response.data.success && response.data.data) {
      const userData = response.data.data;

      // Store tokens
      if (userData.access_token) {
        setAuthToken(userData.access_token);
      }

      if (userData.refresh_token) {
        setRefreshToken(userData.refresh_token);
      }

      // Store user information
      setUserData({
        id: userData.id || 0,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || "",
        country_code: userData.country_code || "",
        language: userData.language || "en",
        dob: userData.dob || "",
        gender: userData.gender || "other",
        is_marketing_emails: userData.is_marketing_emails || false,
        is_marketing_sms: userData.is_marketing_sms || false,
        avatar: userData.avatar || "/images/common/profile.jpeg",
        address: {
          line1: userData.address?.line1,
          line2: userData.address?.line2,
          street: userData.address?.street,
          city: userData.address?.city,
        },
      });

      return {
        success: true,
        message: "Facebook authentication successful",
      };
    } else {
      const errorMessage =
        response.data.message || "Failed to authenticate with Facebook";

      return {
        success: false,
        message: errorMessage,
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "An error occurred during Facebook authentication";

    console.error("Facebook login error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Change password
export const changePassword = async (
  userId: string,
  passwordData: ChangePasswordRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(
      `/user/auth/change-password/${userId}`,
      passwordData
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Password changed successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to change password",
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "An error occurred while changing password";

    console.error("Change password error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Refresh token
export const refreshToken = async (
  refreshTokenStr: string
): Promise<{ success: boolean; message: string; data?: TokenResponse }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<TokenResponse>>(
      "/user/auth/refresh-token",
      {
        refreshToken: refreshTokenStr,
      }
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;

      // Store new tokens
      setAuthToken(accessToken);
      setRefreshToken(refreshToken);

      return {
        success: true,
        message: "Tokens refreshed successfully",
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to refresh token",
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "An error occurred while refreshing token";

    console.error("Refresh token error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Forgot password
export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(
      "/user/auth/forgot-password",
      { email }
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Reset link sent to your email!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to send reset link",
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "An error occurred while sending reset link";

    console.error("Forgot password error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Reset password
export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(
      "/user/auth/reset-password",
      { resetToken, newPassword }
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Password reset successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to reset password",
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "An error occurred while resetting password";

    console.error("Reset password error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};
