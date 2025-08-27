import axios from "@/app/lib/axiosConfig";
import { getAuthToken } from "@/app/lib/config";

// Custom error type for authentication failures
interface AuthenticationError extends Error {
  isAuthError: boolean;
  errorType: string;
}

// TypeScript interfaces
export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string; // Changed from product_id to variant_id
  quantity: number;
  price: string | number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  Variant: {
    id: string;
    price: number;
    compare_price?: number;
    cost_per_item?: number;
    physical_product: boolean;
    is_tracking_inventory: boolean;
    stock_qty: number;
    sell_out_of_stock: boolean;
    sku: string;
    barcode?: string;
    weight: number;
    length: number;
    breadth: number;
    height: number;
    image_urls: Array<{
      url: string;
      position: number;
    }>;
    option_values?: Record<string, string>;
    product_id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
    Product: {
      id: string;
      title: string;
      description: string;
      short_description?: string;
      default_image_urls?: Array<{
        url: string;
        position: number;
      }>;
      region_of_origin: string;
      hs_code: string;
      page_title?: string;
      page_description?: string;
      page_url?: string;
      type?: string;
      brand?: string;
      margin_contribution?: number;
      seller_id: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: null | string;
    };
  };
}

export interface Cart {
  id: string;
  user_id: string;
  status: string;
  total_price?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  CartItems: CartItem[];
}

export interface AddToCartRequest {
  variant_id: string; // Changed from product_id to variant_id
  quantity: number;
}

// For adding multiple items at once
export interface AddMultipleItemsRequest {
  products: AddToCartRequest[];
}

// For updating cart item quantity
export interface UpdateCartItemRequest {
  quantity: number;
  variant_id: string; // Changed from product_id to variant_id
}

// Response for cart item quantity update
export interface UpdateCartItemResponse {
  cart_item_id: string;
  product_id: string;
  old_quantity: number;
  new_quantity: number;
  quantity_change: number;
  updated_cart_total: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
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

// Get cart by ID
export const getCart = async (cartId: string): Promise<Cart | null> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return null;
    }

    console.log(`Fetching cart with ID: ${cartId}`); // Debug log
    const response = await axios.get(`/user/cart/get-cart/${cartId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Cart API response:", response.data); // Debug log

    if (response.data.success) {
      console.log("Cart data from API:", response.data.data); // Debug log
      return response.data.data;
    }
    console.log("Cart API returned success=false:", response.data.message); // Debug log
    return null;
  } catch (error) {
    console.error("Failed to get cart:", error);
    return null;
  }
};

// Get cart items by cart ID
export const getCartItems = async (
  cartId: string
): Promise<CartItem[] | null> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return null;
    }

    const response = await axios.get(`/user/cart/get-cartitems/${cartId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to get cart items:", error);
    return null;
  }
};

// Add item to cart
export const addItemToCart = async (
  userId: string,
  itemData: AddToCartRequest
): Promise<boolean> => {
  try {
    console.log("addItemToCart called with:", { userId, itemData });

    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return false;
    }

    console.log("Making API call to add item to cart...");
    const response = await axios.post(
      `/user/cart/add-item/${userId}`,
      itemData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Check for authentication errors in the response
    if (checkAuthError(response.data)) {
      throwAuthError(response.data.error);
    }

    console.log("API response for add item to cart:", response.data);
    return response.data.success;
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    // Re-throw authentication errors so they can be handled upstream
    if ((error as AuthenticationError).isAuthError) {
      throw error;
    }
    return false;
  }
};

// Add multiple items to cart at once
export const addMultipleItemsToCart = async (
  userId: string,
  items: AddMultipleItemsRequest
): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return false;
    }

    const response = await axios.post(
      `/user/cart/add-multiple-items/${userId}`,
      items,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.success;
  } catch (error) {
    console.error("Failed to add multiple items to cart:", error);
    return false;
  }
};

// Update cart item quantity (increase/decrease)
export const updateCartItemQuantity = async (
  cartItemId: string,
  variantId: string, // Changed from productId to variantId
  quantityChange: number
): Promise<ApiResponse<UpdateCartItemResponse> | null> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return {
        success: false,
        message: "No authentication token found",
      };
    }

    const response = await axios.put(
      `/user/cart/update-item/${cartItemId}`,
      {
        quantity: quantityChange,
        variant_id: variantId, // Changed from product_id to variant_id
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error: unknown) {
    console.error("Failed to update cart item quantity:", error);

    // Handle specific error responses
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (axiosError.response?.status === 404) {
        return {
          success: false,
          message: "Cart item not found",
        };
      }

      if (axiosError.response?.status === 400) {
        return {
          success: false,
          message:
            axiosError.response?.data?.message || "Invalid request parameters",
        };
      }

      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to update cart item quantity",
      };
    }

    return {
      success: false,
      message: "Failed to update cart item quantity",
    };
  }
};

// Remove item from cart
export const removeItemFromCart = async (
  cartItemId: string
): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return false;
    }

    const response = await axios.post(
      `/user/cart/remove-item/${cartItemId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.success;
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    return false;
  }
};

// Get user's active cart with items
export const getCartByUser = async (
  userId: string
): Promise<ApiResponse<Cart> | null> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return null;
    }

    const response = await axios.get(`/user/cart/get-user-cart/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check for authentication errors in the response
    if (checkAuthError(response.data)) {
      throwAuthError(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error("Failed to get user's cart:", error);
    // Re-throw authentication errors so they can be handled upstream
    if ((error as AuthenticationError).isAuthError) {
      throw error;
    }
    return null;
  }
};

// Create a cart for a user
export const createCart = async (userId: string): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return false;
    }

    const response = await axios.post(
      `/user/cart/create-cart/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.success;
  } catch (error) {
    console.error("Failed to create cart:", error);
    return false;
  }
};

// Update cart status
export const updateCartStatus = async (
  cartId: string,
  status: "active" | "abandoned" | "checked_out" | "expired"
): Promise<ApiResponse<null>> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return {
        success: false,
        message: "No authentication token found",
      };
    }

    const response = await axios.put(
      `/user/cart/update-status/${cartId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: response.data.success,
      message: response.data.message || "Cart status updated successfully!",
    };
  } catch (error: unknown) {
    console.error("Failed to update cart status:", error);

    // Handle specific error responses
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (axiosError.response?.status === 404) {
        return {
          success: false,
          message: "Cart not found!",
        };
      }

      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to update cart status",
      };
    }

    return {
      success: false,
      message: "Failed to update cart status",
    };
  }
};

// Discard a cart (mark as abandoned and create a new one)
export const discardCart = async (cartId: string): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      return false;
    }

    const response = await axios.get(`/user/cart/discard-cart/${cartId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.success;
  } catch (error) {
    console.error("Failed to discard cart:", error);
    return false;
  }
};

// Helper function to mark cart as abandoned
export const markCartAsAbandoned = async (
  cartId: string
): Promise<ApiResponse<null>> => {
  return updateCartStatus(cartId, "abandoned");
};

// Helper function to mark cart as checked out
export const markCartAsCheckedOut = async (
  cartId: string
): Promise<ApiResponse<null>> => {
  return updateCartStatus(cartId, "checked_out");
};

// Helper function to mark cart as expired
export const markCartAsExpired = async (
  cartId: string
): Promise<ApiResponse<null>> => {
  return updateCartStatus(cartId, "expired");
};

// Helper function to increase cart item quantity
export const increaseCartItemQuantity = async (
  cartItemId: string,
  variantId: string, // Changed from productId to variantId
  amount: number = 1
): Promise<ApiResponse<UpdateCartItemResponse> | null> => {
  return updateCartItemQuantity(cartItemId, variantId, Math.abs(amount));
};

// Helper function to decrease cart item quantity
export const decreaseCartItemQuantity = async (
  cartItemId: string,
  variantId: string, // Changed from productId to variantId
  amount: number = 1
): Promise<ApiResponse<UpdateCartItemResponse> | null> => {
  return updateCartItemQuantity(cartItemId, variantId, -Math.abs(amount));
};

// Helper function to set exact cart item quantity
export const setCartItemQuantity = async (
  cartItemId: string,
  variantId: string, // Changed from productId to variantId
  newQuantity: number,
  currentQuantity: number
): Promise<ApiResponse<UpdateCartItemResponse> | null> => {
  const quantityChange = newQuantity - currentQuantity;
  return updateCartItemQuantity(cartItemId, variantId, quantityChange);
};

// Calculate cart total from cart items
export const calculateCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => {
    const itemPrice =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return total + itemPrice * item.quantity;
  }, 0);
};

// Get cart item count
export const getCartItemCount = (cart: Cart | null): number => {
  if (!cart || !cart.CartItems) return 0;
  return cart.CartItems.reduce((count, item) => count + item.quantity, 0);
};

// Check if product exists in cart
export const isProductInCart = (
  cart: Cart | null,
  productId: string
): boolean => {
  if (!cart || !cart.CartItems) return false;
  return cart.CartItems.some((item) => item.Variant?.Product?.id === productId);
};

// Get cart item by product ID
export const getCartItemByProductId = (
  cart: Cart | null,
  productId: string
): CartItem | null => {
  if (!cart || !cart.CartItems) return null;
  return cart.CartItems.find((item) => item.Variant?.Product?.id === productId) || null;
};
