import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";
import Swal from "sweetalert2";

// TypeScript interfaces
export interface OrderTimeline {
  id: string;
  order_id: string;
  event: string;
  details: string;
  is_automated: boolean;
  createdAt: string;
}

export interface Address {
  first_name?: string;
  last_name?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface ProductImage {
  url: string;
  position: number;
}

export interface OrderProduct {
  id: string;
  title: string;
  description: string;
  seller_id: string;
  default_image_urls: ProductImage[];
}

export interface OrderVariant {
  id: string;
  price: number;
  compare_price: number;
  stock_qty: number;
  sku: string;
  image_urls: ProductImage[];
  option_values: Record<string, string>;
  Product: OrderProduct;
}

export interface OrderCartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  price: string;
  Variant: OrderVariant;
}

export interface OrderCart {
  id: string;
  user_id: string;
  status: string;
  CartItems: OrderCartItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  quantityRequested: number;
  quantityFulfilled: number;
  unitPrice: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Product: OrderProduct;
}

export interface OrderUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  country_code: string;
}

export interface OrderShipment {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  shipped_date: string;
  estimated_delivery: string;
}

export interface Order {
  id: string;
  user_id: string;
  cart_id: string;
  payment_id: string;
  subtotal: number | string;
  shipping: number | string;
  tax: number | string;
  total: number | string;
  shipping_address: Address;
  billing_address: Address;
  tracking_number: string | null;
  shipping_carrier: string | null;
  invoiceCreated: boolean;
  discount_id: string | null;
  discountAmount: number;
  finalAmount: number;
  lastTrackingUpdate: string | null;
  trackingRetryCount: number;
  trackingEventCode: string | null;
  trackingDescription: string | null;
  trackingSignatory: string | null;
  trackingServiceArea: string | null;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "confirmed";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  OrderShipments: OrderShipment[];
  Cart?: OrderCart;
  User: OrderUser;
  OrderTimelines?: OrderTimeline[];
  OrderItems?: OrderItem[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Checkout interfaces
export interface CheckoutPayload {
  cart_id: string;
  discount_code?: string;
  shipping?: number;
  shipping_address: Address;
  billing_address: Address;
  shipping_carrier?: string;
  customer_email?: string;
  customer_phone?: string;
  buy_now?: boolean; // Flag to indicate if this is a Buy Now checkout
}

export interface CheckoutResponse {
  order_id: string;
  payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  order_details: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount_amount: number;
    total_amount: number;
    final_amount: number;
  };
}

// Buy Now interfaces
export interface BuyNowPayload {
  product_id: string;
  quantity: number;
  variant_id?: string;
  selected_options?: { [key: string]: string };
}

export interface BuyNowResponse {
  cart_id: string;
}

// Shipping rates interfaces
export interface ShippingRatesPayload {
  destination_id: string;
}

export interface ShippingCarrierError {
  error: string;
  note?: string;
}

export interface DHLRate {
  amount: number;
  currency: string;
  type: string;
  estimatedDays: string;
  breakdown: {
    baseShippingCharge: number;
    taxAmount: number;
    finalShippingCharge: number;
    markup: string;
  };
}

export interface ShipGlobalService {
  title: string;
  notes: string;
  transit_time: string;
  price: {
    logistic_fee: number;
  };
}

export interface ShipGlobalRate {
  success: boolean;
  billed_weight: number;
  billed_weight_unit: string;
  currency: string;
  services: ShipGlobalService[];
}

export interface ShippingRatesData {
  aramex?: number | ShippingCarrierError;
  dhl?: DHLRate | ShippingCarrierError;
  shipGlobal?: ShipGlobalRate | ShippingCarrierError;
  domestic?: ShippingCarrierError;
}

export interface ShippingRatesResponse {
  rates: ShippingRatesData;
  debug: {
    finalWeight: number;
    finalQuantity: number;
    destination: {
      city: string;
      state: string;
      zip_code: string;
      country_code_iso: string;
    };
  };
}

// Tracking interfaces
export interface TrackingHistoryItem {
  date: string;
  status: string;
  location: string;
  description: string;
}

export interface TrackingResponse {
  trackingNumber: string;
  carrier: string;
  status: string;
  currentLocation: string;
  estimatedDelivery: string;
  trackingHistory: TrackingHistoryItem[];
}

export interface TrackingPayload {
  trackingNumber: string;
  shippingCarrier: string;
}

export interface AddTrackingPayload {
  tracking_number: string;
  shipping_carrier: string;
}

export interface AddTrackingResponse {
  trackingNumber: string;
  carrier: string;
  status: string;
  trackingInfo: Record<string, unknown>;
}

/**
 * Retrieves all orders placed by a specific user
 * @param userId - ID of the user
 * @returns Promise with array of orders if successful, null otherwise
 */
export const getOrdersByUser = async (
  userId: string
): Promise<Order[] | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Order[]>>(
      `/user/order/get-orders/${userId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to fetch orders";

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Get orders error:", error);
    return null;
  }
};

/**
 * Retrieves detailed information about a specific order including its timeline
 * @param orderId - ID of the order
 * @returns Promise with order details if successful, null otherwise
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Order>>(
      `/user/order/get-order/${orderId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to fetch order details";

    // Display error message only if it's not a "not found" error
    if (axiosError.response?.status !== 404) {
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    }

    console.error("Get order details error:", error);
    return null;
  }
};

/**
 * Initiates checkout process for a cart, creates order, and prepares payment
 * @param checkoutData - Checkout payload with cart ID, addresses, and optional parameters
 * @returns Promise with checkout response including payment details if successful, null otherwise
 */
export const checkoutCart = async (
  checkoutData: CheckoutPayload
): Promise<CheckoutResponse | null> => {
  try {
    const response = await axiosInstance.post<ApiResponse<CheckoutResponse>>(
      `/user/order/checkout`,
      checkoutData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      const errorMessage = response.data.message || "Checkout failed";
      Swal.fire({
        title: "Checkout Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Checkout failed. Please try again.";

    Swal.fire({
      title: "Checkout Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Checkout error:", error);
    return null;
  }
};

/**
 * Creates a temporary cart for immediate checkout with a single product (Buy Now functionality)
 * @param buyNowData - Buy now payload with product ID and quantity
 * @returns Promise with cart ID if successful, null otherwise
 */
export const buyNowCheckout = async (
  buyNowData: BuyNowPayload
): Promise<BuyNowResponse | null> => {
  try {
    const response = await axiosInstance.post<ApiResponse<BuyNowResponse>>(
      `/user/order/buynow`,
      buyNowData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      const errorMessage = response.data.message || "Buy now checkout failed";
      Swal.fire({
        title: "Buy Now Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Buy now checkout failed. Please try again.";

    Swal.fire({
      title: "Buy Now Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Buy now checkout error:", error);
    return null;
  }
};

/**
 * Calculates shipping rates from multiple carriers for a specific cart with enhanced error handling
 * @param cartId - ID of the cart to calculate shipping for
 * @param destinationId - Address ID for the shipping destination
 * @returns Promise with shipping rates (including partial errors) if successful, null otherwise
 */
export const getShippingRates = async (
  cartId: string,
  destinationId: string
): Promise<ShippingRatesResponse | null> => {
  try {
    const response = await axiosInstance.post<
      ApiResponse<ShippingRatesResponse>
    >(`/user/order/get-shipping-rates/${cartId}`, {
      destination_id: destinationId,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to calculate shipping rates";

    // Don't show error popup for shipping rates as it's often used in background
    console.error("Shipping rates error:", errorMessage, error);
    return null;
  }
};

/**
 * Tracks a package using tracking number and shipping carrier for a specific order
 * @param orderId - ID of the order to track
 * @param trackingData - Tracking payload with tracking number and carrier
 * @returns Promise with tracking details if successful, null otherwise
 */
export const trackPackage = async (
  orderId: string,
  trackingData: TrackingPayload
): Promise<TrackingResponse | null> => {
  try {
    const response = await axiosInstance.post<ApiResponse<TrackingResponse>>(
      `/user/order/get-tracking/${orderId}`,
      trackingData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      const errorMessage = response.data.message || "Package tracking failed";
      Swal.fire({
        title: "Tracking Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Tracking service temporarily unavailable";

    Swal.fire({
      title: "Tracking Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Package tracking error:", error);
    return null;
  }
};

/**
 * Adds tracking information to an existing order (Admin only)
 * @param orderId - ID of the order to add tracking to
 * @param trackingData - Tracking payload with tracking number and carrier
 * @returns Promise with tracking response if successful, null otherwise
 */
export const addTracking = async (
  orderId: string,
  trackingData: AddTrackingPayload
): Promise<AddTrackingResponse | null> => {
  try {
    const response = await axiosInstance.post<ApiResponse<AddTrackingResponse>>(
      `/admin/order/add-tracking/${orderId}`,
      trackingData
    );

    if (response.data.success && response.data.data) {
      Swal.fire({
        title: "Success",
        text: "Tracking information added successfully",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return response.data.data;
    } else {
      const errorMessage = response.data.message || "Failed to add tracking";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to add tracking information";

    Swal.fire({
      title: "Admin Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Add tracking error:", error);
    return null;
  }
};

/**
 * Helper function to check if shipping rate is an error
 * @param rate - Shipping rate value or error object
 * @returns Boolean indicating if rate is an error
 */
export const isShippingRateError = (
  rate: number | DHLRate | ShipGlobalRate | ShippingCarrierError | undefined
): rate is ShippingCarrierError => {
  return typeof rate === "object" && rate !== null && "error" in rate;
};

/**
 * Helper function to extract price from carrier rate
 * @param rate - Rate data from carrier
 * @returns Price as number or null if error
 */
export const extractCarrierPrice = (
  rate: number | DHLRate | ShipGlobalRate | ShippingCarrierError | undefined
): number | null => {
  if (isShippingRateError(rate)) {
    return null;
  }

  if (typeof rate === "number") {
    return rate;
  }

  if (rate && typeof rate === "object") {
    // Handle DHL rate
    if ("amount" in rate) {
      return rate.amount;
    }

    // Handle ShipGlobal rate - get the cheapest service
    if ("services" in rate && rate.services.length > 0) {
      const cheapestService = rate.services.reduce((prev, current) =>
        prev.price.logistic_fee < current.price.logistic_fee ? prev : current
      );
      return cheapestService.price.logistic_fee;
    }
  }

  return null;
};

/**
 * Helper function to format shipping rates for display
 * @param rates - Shipping rates response
 * @returns Formatted rates with error handling
 */
export const formatShippingRates = (rates: ShippingRatesResponse) => {
  const formatted: {
    [key: string]: { rate?: number; error?: string; available: boolean };
  } = {};

  Object.entries(rates.rates).forEach(([carrier, rate]) => {
    if (isShippingRateError(rate)) {
      formatted[carrier] = {
        error: rate.error,
        available: false,
      };
    } else {
      const price = extractCarrierPrice(rate);
      if (price !== null) {
        formatted[carrier] = {
          rate: price,
          available: true,
        };
      } else {
        formatted[carrier] = {
          error: "Service unavailable",
          available: false,
        };
      }
    }
  });

  return formatted;
};

/**
 * Helper function to get available shipping carriers
 * @param rates - Shipping rates response
 * @returns Array of available carriers with their rates
 */
export const getAvailableCarriers = (rates: ShippingRatesResponse) => {
  const available: { carrier: string; rate: number }[] = [];

  Object.entries(rates.rates).forEach(([carrier, rate]) => {
    const price = extractCarrierPrice(rate);
    // Only include carriers with valid rates > 0 (exclude errors, null, and zero rates)
    if (price !== null && price > 0) {
      available.push({ carrier, rate: price });
    }
  });

  return available.sort((a, b) => a.rate - b.rate); // Sort by rate ascending
};

/**
 * Complete buy now flow - creates temporary cart and proceeds to checkout
 * @param productId - ID of the product to buy
 * @param quantity - Quantity to purchase
 * @param checkoutData - Checkout data including addresses and shipping info
 * @returns Promise with checkout response if successful, null otherwise
 */
export const completeBuyNowFlow = async (
  productId: string,
  quantity: number,
  checkoutData: Omit<CheckoutPayload, "cart_id">
): Promise<CheckoutResponse | null> => {
  try {
    // Step 1: Create temporary cart with the product
    const buyNowResponse = await buyNowCheckout({
      product_id: productId,
      quantity: quantity,
    });

    if (!buyNowResponse) {
      return null;
    }

    // Step 2: Proceed to checkout with the temporary cart
    const checkoutResponse = await checkoutCart({
      ...checkoutData,
      cart_id: buyNowResponse.cart_id,
    });

    return checkoutResponse;
  } catch (error) {
    console.error("Complete buy now flow error:", error);
    return null;
  }
};
