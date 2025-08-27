"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  loginUser,
  registerUser,
  changePassword,
  RegisterUserRequest,
} from "@/app/lib/services/authService";
import { getUserData, removeAuthTokens } from "@/app/lib/config";

// Define the User interface
export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country_code?: string;
  avatar?: string;
  dob?: string;
  gender?: string;
  language?: string;
  address?: {
    line1?: string;
    line2?: string;
    street?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// Define the context type
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  silentLogout: () => void;
  register: (
    userData: RegisterUserRequest
  ) => Promise<{ success: boolean; message: string }>;
  updatePassword: (
    userId: string,
    oldPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  setUserFromStorage: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user in localStorage on initial load
  useEffect(() => {
    setIsLoading(true);
    const storedUser = getUserData();
    if (storedUser) {
      setUser(storedUser as User);
      setIsLoggedIn(true);
      console.log("User loaded from localStorage:", storedUser.email);
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    console.log("Login function called with email:", email);

    const response = await loginUser({ email, password });

    if (response.success) {
      // Update user in state - it's already saved to localStorage in the service
      const userData = getUserData();

      if (userData) {
        setUser(userData as User);
        setIsLoggedIn(true);

        // Show success message with full name
        const fullName = `${userData.first_name} ${userData.last_name}`;

        return { success: true, message: `Welcome back, ${fullName}!` };
      } else {
        console.error("User data not found in localStorage after login");
        return {
          success: false,
          message: "Failed to load user data. Please try again.",
        };
      }
    } else {
      return { success: false, message: response.message };
    }
  };

  // Logout function that clears all storage
  const logout = () => {
    // Clear auth tokens
    removeAuthTokens();

    // Clear local cart and wishlist data
    localStorage.removeItem("guest_cart");
    localStorage.removeItem("guest_wishlist");
    localStorage.removeItem("checkout_redirect");

    // Clear user state
    setUser(null);
    setIsLoggedIn(false);

    // Show success message
    Swal.fire({
      title: "Logged Out",
      text: "You have been successfully logged out",
      icon: "success",
      confirmButtonColor: "#00478f",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  // Silent logout function for auto logout on authentication errors
  const silentLogout = () => {
    // Clear auth tokens
    removeAuthTokens();

    // Clear local cart and wishlist data
    localStorage.removeItem("guest_cart");
    localStorage.removeItem("guest_wishlist");
    localStorage.removeItem("checkout_redirect");

    // Clear user state
    setUser(null);
    setIsLoggedIn(false);

    // Redirect to homepage without showing popup
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  // Register function
  const register = async (
    userData: RegisterUserRequest
  ): Promise<{ success: boolean; message: string }> => {
    console.log("Register function called with email:", userData.email);

    const response = await registerUser(userData);

    if (response.success) {
      // We don't automatically log in after registration
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message };
    }
  };

  // Change password function
  const updatePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const result = await changePassword(userId, {
      oldPassword,
      newPassword,
    });
    return result;
  };

  // Function to update user state from localStorage (for social login)
  const setUserFromStorage = () => {
    const storedUser = getUserData();
    if (storedUser) {
      setUser(storedUser as User);
      setIsLoggedIn(true);
      console.log("User state updated from localStorage:", storedUser.email);
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    silentLogout,
    register,
    updatePassword,
    setUserFromStorage,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
