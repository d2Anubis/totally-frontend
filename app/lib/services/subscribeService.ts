import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";
import Swal from "sweetalert2";

// TypeScript interfaces
export interface SubscribeRequest {
  email: string;
  source?: string; // Optional: homepage, footer, popup, etc.
}

export interface UnsubscribeRequest {
  email: string;
}

export interface SubscriptionStatusResponse {
  email: string;
  subscribed: boolean;
  status: "active" | "unsubscribed";
  subscribed_at: string | null;
  unsubscribed_at: string | null;
}

export interface SubscribeResponse {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  subscribed_at: string;
  source?: string;
  is_new_subscription: boolean;
}

export interface UnsubscribeResponse {
  email: string;
  unsubscribed_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Newsletter Subscription Service
export class NewsletterService {
  // Subscribe to newsletter
  static async subscribe(
    email: string,
    source: string = "website"
  ): Promise<SubscribeResponse | null> {
    try {
      const response = await axiosInstance.post<ApiResponse<SubscribeResponse>>(
        "/public/newsletter/subscribe",
        {
          email,
          source,
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to subscribe");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to subscribe to newsletter";

      // Don't show SweetAlert here, let the calling component handle it
      console.error("Newsletter subscription error:", error);
      throw new Error(errorMessage);
    }
  }

  // Unsubscribe from newsletter
  static async unsubscribe(email: string): Promise<UnsubscribeResponse | null> {
    try {
      const response = await axiosInstance.post<
        ApiResponse<UnsubscribeResponse>
      >("/public/newsletter/unsubscribe", {
        email,
      });

      if (response.data.success && response.data.data) {
        Swal.fire({
          title: "Unsubscribed Successfully",
          text:
            response.data.message ||
            "You have been unsubscribed from our newsletter.",
          icon: "success",
          confirmButtonColor: "#00478f",
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to unsubscribe");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to unsubscribe from newsletter";

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });

      console.error("Newsletter unsubscribe error:", error);
      return null;
    }
  }

  // Check subscription status
  static async checkStatus(
    email: string
  ): Promise<SubscriptionStatusResponse | null> {
    try {
      const response = await axiosInstance.get<
        ApiResponse<SubscriptionStatusResponse>
      >(`/public/newsletter/status?email=${encodeURIComponent(email)}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return null;
      }
    } catch (error: unknown) {
      console.error("Newsletter status check error:", error);
      return null;
    }
  }

  // Helper method for form validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to handle subscription with user feedback
  static async subscribeWithFeedback(
    email: string,
    source: string = "website"
  ): Promise<boolean> {
    try {
      // Validate email first
      if (!this.validateEmail(email)) {
        Swal.fire({
          title: "Invalid Email",
          text: "Please provide a valid email address.",
          icon: "error",
          confirmButtonColor: "#00478f",
        });
        return false;
      }

      const result = await this.subscribe(email, source);

      if (result) {
        // Show success message
        Swal.fire({
          title: "Successfully Subscribed!",
          text: result.is_new_subscription
            ? "Thank you for subscribing to our newsletter! You'll receive our latest updates soon."
            : "Welcome back! Your subscription has been reactivated.",
          icon: "success",
          confirmButtonColor: "#00478f",
          timer: 5000,
          timerProgressBar: true,
        });
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to subscribe";

      // Handle specific error cases
      if (errorMessage.includes("already subscribed")) {
        Swal.fire({
          title: "Already Subscribed",
          text: "This email is already subscribed to our newsletter.",
          icon: "info",
          confirmButtonColor: "#00478f",
        });
      } else {
        Swal.fire({
          title: "Subscription Failed",
          text: errorMessage,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }

      return false;
    }
  }
}

// Export default instance for convenience
export const newsletterService = NewsletterService;
