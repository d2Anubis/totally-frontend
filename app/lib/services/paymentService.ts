import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";
import Swal from "sweetalert2";

// TypeScript interfaces for new unified flow
export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface BillingAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface CartCheckoutRequest {
  cart_id: string;
  discount_code?: string;
  shipping?: number;
  shipping_address: ShippingAddress;
  billing_address: BillingAddress;
  shipping_carrier?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface OrderDetails {
  subtotal: number;
  tax: number;
  shipping: number;
  discount_amount: number;
  total_amount: number;
  final_amount: number;
}

export interface CartCheckoutResponse {
  order_id: string;
  payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  order_details: OrderDetails;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  payment_id: string;
  order_id: string;
}

export interface VerifyPaymentResponse {
  payment_id: string;
  order_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  payment_status: string;
  order_status: string;
  final_amount: number;
  order_details: OrderDetails;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Initiates unified checkout process - creates order and payment setup
 * Base URL: http://localhost:8000/app/v1/user/orders
 * Endpoint: POST /checkout
 *
 * @param checkoutData - Checkout data containing cart, addresses, and optional discount
 * @returns Promise with the checkout response including Razorpay details if successful, null otherwise
 *
 * Notes:
 * - All amounts are in INR (paisa for Razorpay)
 * - Tax is calculated at 18% GST
 * - Free shipping applies for orders above ₹500, otherwise ₹50 shipping charge
 * - Creates both order and payment records in single transaction
 */
export const initiateCheckout = async (
  checkoutData: CartCheckoutRequest
): Promise<CartCheckoutResponse | null> => {
  try {
    const response = await axiosInstance.post<
      ApiResponse<CartCheckoutResponse>
    >("/user/order/checkout", checkoutData);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      Swal.fire({
        title: "Checkout Failed",
        text: response.data.message || "Failed to initiate checkout",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to initiate checkout";

    Swal.fire({
      title: "Checkout Failed",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Checkout initiation error:", error);
    return null;
  }
};

/**
 * Verifies a completed Razorpay payment and confirms the order
 * Base URL: http://localhost:8000/app/v1/user/payment
 * Endpoint: POST /verify
 *
 * @param paymentData - Payment verification data with Razorpay response details
 * @returns Promise with the verified payment and confirmed order data if successful, null otherwise
 *
 * Notes:
 * - The Razorpay integration uses auto-capture for payments
 * - After successful payment verification:
 *   - Payment status is updated to "captured"
 *   - Order status is updated to "confirmed"
 *   - Cart status is updated to "converted"
 *   - Order timeline entry is created
 *
 * Important Distinction:
 * - Payment: Handles the payment flow with Razorpay and stores transaction details
 * - Order: Handles the actual product order and fulfillment
 * - razorpay_order_id: Razorpay's order ID (format: "order_XXXXXXXXXX")
 * - payment_id: UUID of Payment record in database
 * - order_id: UUID of Order record in database (created during checkout)
 */
export const verifyPayment = async (
  paymentData: VerifyPaymentRequest
): Promise<VerifyPaymentResponse | null> => {
  try {
    const response = await axiosInstance.post<
      ApiResponse<VerifyPaymentResponse>
    >("/user/payment/verify", paymentData);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      Swal.fire({
        title: "Payment Verification Failed",
        text: response.data.message || "Failed to verify payment",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to verify payment";

    Swal.fire({
      title: "Payment Verification Failed",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Verify payment error:", error);
    return null;
  }
};
