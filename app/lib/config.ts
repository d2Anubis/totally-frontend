// API Configuration
// export const API_BASE_URL = "http://localhost:8000/app/v1";
export const API_BASE_URL =
 "https://vgc7uy3145.execute-api.ap-south-1.amazonaws.com/default/totallybackendtest/app/v1";
export const RECAPTCHA_SITE_KEY = "6LcD_qUrAAAAAGlc5qNWV_8vLgqXbyE0YlUy4IP-";

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "129462007478-52ofll5jtnfc82a87ip8gtqj968dllo6.apps.googleusercontent.com"; // Replace with your actual Google Client ID

// Facebook OAuth Configuration
export const FACEBOOK_APP_ID = "726838539765328"; // Replace with your actual Facebook App ID

// Cart Configuration
export const CART_ABANDONMENT_TIMEOUT_MINUTES = 1; // Time in minutes before marking cart as abandoned

// Upload Configuration
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_REVIEW_IMAGES = 5;
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Debug Configuration
export const UPLOAD_DEBUG_MODE = true; // Set to false in production

// Google Analytics Configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || "G-JXNVJJYQ61"; // Your actual GA4 Measurement ID
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX"; // Replace with your actual GTM Container ID

// User data interface
export interface UserData {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  country_code?: string;
  language?: string;
  dob?: string;
  is_marketing_emails?: boolean;
  is_marketing_sms?: boolean;
  address?: {
    line1?: string;
    line2?: string;
    street?: string;
    city?: string;
  };
}

// Authentication token management
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  }
  return null;
};

export const setRefreshToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("refresh_token", token);
  }
};

export const removeAuthTokens = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }
};

export const setUserData = (userData: UserData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(userData));
  }
};

export const getUserData = (): UserData | null => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData) as UserData;
      } catch (error) {
        console.error("Failed to parse user data:", error);
        return null;
      }
    }
  }
  return null;
};
