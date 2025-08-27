import axiosInstance from "../axiosConfig";
import Swal from "sweetalert2";

// Custom error type for authentication failures
interface AuthenticationError extends Error {
  isAuthError: boolean;
  errorType: string;
}

// Interface for API error response
interface ApiErrorResponse {
  message: string;
  error: string;
}

// Helper function to check for authentication errors in API responses
const checkAuthError = (
  responseData: unknown
): responseData is ApiErrorResponse => {
  return (
    responseData !== null &&
    typeof responseData === "object" &&
    "message" in responseData &&
    "error" in responseData &&
    (responseData as ApiErrorResponse).message === "Authentication failed" &&
    ((responseData as ApiErrorResponse).error === "jwt expired" ||
      (responseData as ApiErrorResponse).error === "jwt malformed" ||
      (responseData as ApiErrorResponse).error === "invalid token")
  );
};

// Helper function to throw authentication error
const throwAuthError = (errorType: string): never => {
  const authError = new Error("Authentication failed") as AuthenticationError;
  authError.isAuthError = true;
  authError.errorType = errorType;
  throw authError;
};

// Backend Product interface that matches actual API response
export interface BackendProduct {
  id: string;
  serial_no?: string;
  title: string;
  description: string;
  short_description?: string;
  image_urls: Array<{
    url: string;
    position: number;
  }>;
  price: number;
  compare_price?: number;
  gst_percent?: number;
  cost_per_item?: number;
  profit?: number;
  margin?: number;
  physical_product: boolean;
  is_tracking_inventory: boolean;
  stock_qty: number;
  sell_out_of_stock: boolean;
  sku?: string;
  barcode?: string;
  weight: number;
  length: number;
  breadth: number;
  height: number;
  region_of_origin: string;
  hs_code: string;
  page_title?: string;
  page_description?: string;
  page_url?: string;
  type?: string;
  brand?: string;
  margin_contribution?: number;
  status: "draft" | "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Seller?: {
    id: string;
    firm_name: string;
    email: string;
    phone?: string;
  };
}

// TypeScript interfaces
export interface WishlistItem {
  user_id: string;
  product_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Product: BackendProduct;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Get the user's wishlist
 * @param userId - The ID of the user
 * @returns An array of wishlist items or null if there's an error
 */
export const getWishlistByUser = async (
  userId: string
): Promise<ApiResponse<WishlistItem[]> | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<WishlistItem[]>>(
      `/user/wishlist/get-wishlist/${userId}`
    );

    // Check for authentication errors in the response
    if (checkAuthError(response.data)) {
      throwAuthError(response.data.error);
    }

    if (response.data.success) {
      return response.data;
    } else {
      if (response.data.message) {
        console.error("Wishlist error:", response.data.message);
      }
      return null;
    }
  } catch (error) {
    console.error("Failed to get wishlist:", error);
    // Re-throw authentication errors so they can be handled upstream
    if ((error as AuthenticationError).isAuthError) {
      throw error;
    }
    return null;
  }
};

/**
 * Add a product to the user's wishlist
 * @param userId - The ID of the user
 * @param productId - The ID of the product to add
 * @returns True if successful, false otherwise
 */
export const addToWishlist = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(
      `/user/wishlist/add-wishlist/${userId}`,
      { product_id: productId }
    );

    if (response.data.success) {
      return true;
    } else {
      if (response.data.message) {
        Swal.fire({
          title: "Error",
          text: response.data.message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
      return false;
    }
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    Swal.fire({
      title: "Error",
      text: "Failed to add item to wishlist",
      icon: "error",
      confirmButtonColor: "#00478f",
    });
    return false;
  }
};

/**
 * Remove a product from the user's wishlist
 * @param userId - The ID of the user
 * @param productId - The ID of the product to remove
 * @returns True if successful, false otherwise
 */
export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(
      `/user/wishlist/remove-wishlist/${userId}`,
      { product_id: productId }
    );

    if (response.data.success) {
      return true;
    } else {
      if (response.data.message) {
        Swal.fire({
          title: "Error",
          text: response.data.message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
      return false;
    }
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    Swal.fire({
      title: "Error",
      text: "Failed to remove item from wishlist",
      icon: "error",
      confirmButtonColor: "#00478f",
    });
    return false;
  }
};
