import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";
import Swal from "sweetalert2";

// TypeScript interfaces based on API documentation
export interface ReviewUser {
  display_name: string;
}

export interface ReviewImage {
  url: string;
  position: number;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  image_urls?: ReviewImage[];
  createdAt: string;
  updatedAt?: string;
  status?: "pending" | "approved" | "rejected";
  user?: ReviewUser;
  product?: {
    id: string;
    title: string;
    image_url?: string;
  };
}

export interface ReviewStatistics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

export interface ReviewPagination {
  currentPage: number;
  totalPages: number;
  totalReviews: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  statistics: ReviewStatistics;
  pagination: ReviewPagination;
}

export interface UserReviewsResponse {
  reviews: Review[];
  pagination: ReviewPagination;
}

export interface ReviewPermissionResponse {
  canReview: boolean;
  reason?: "already_reviewed" | "not_purchased";
  message: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string;
    comment?: string;
    createdAt: string;
  };
}

export interface CreateReviewData {
  product_id: string;
  rating: number;
  title: string;
  comment?: string;
  image_urls?: Array<{
    key: string;
    originalName: string;
  }>;
}

export interface UpdateReviewData {
  rating: number;
  title: string;
  comment?: string;
  keep_existing_images?: boolean;
  image_urls?: Array<{
    key: string;
    originalName: string;
  }>;
}

export interface ImagePositionUpdate {
  positions: Record<string, number>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface GetProductReviewsParams {
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "rating_high" | "rating_low" | "helpful";
  rating_filter?: number;
}

export interface GetUserReviewsParams {
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "rating_high" | "rating_low";
}

/**
 * Get all approved reviews for a specific product (PUBLIC)
 * @param productId - The UUID of the product
 * @param params - Query parameters for pagination, sorting, and filtering
 * @returns Product reviews data or null if error
 */
export const getProductReviews = async (
  productId: string,
  params: GetProductReviewsParams = {}
): Promise<ProductReviewsResponse | null> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "newest",
      rating_filter = null,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      ...(rating_filter && { rating_filter: rating_filter.toString() }),
    });

    const response = await axiosInstance.get<
      ApiResponse<ProductReviewsResponse>
    >(`/user/reviews/product/${productId}?${queryParams}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error("Failed to fetch product reviews:", response.data.message);
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    console.error(
      "Get product reviews error:",
      axiosError.response?.data?.message || "Failed to fetch product reviews"
    );

    // Don't show error dialog for product reviews as it's a public endpoint
    return null;
  }
};

/**
 * Create a new product review with S3 image URLs (PROTECTED)
 * @param reviewData - Review information including S3 image URLs
 * @returns Created review data or null if error
 */
export const createReview = async (
  reviewData: CreateReviewData
): Promise<Review | null> => {
  try {
    const response = await axiosInstance.post<ApiResponse<Review>>(
      "/user/reviews",
      reviewData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success && response.data.data) {
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Review submitted successfully!",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return response.data.data;
    } else {
      const errorMessage = response.data.message || "Failed to create review";
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
    let errorMessage = "Failed to create review";

    if (axiosError.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError.response?.status === 403) {
      errorMessage = "You can only review products that you have purchased";
    } else if (axiosError.response?.status === 409) {
      errorMessage = "You have already reviewed this product";
    } else if (axiosError.response?.status === 400) {
      errorMessage = axiosError.response.data?.message || "Invalid review data";
    }

    console.error("Create review error:", error);

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    return null;
  }
};

/**
 * Get all reviews submitted by the authenticated user (PROTECTED)
 * @param params - Query parameters for pagination and sorting
 * @returns User reviews data or null if error
 */
export const getUserReviews = async (
  params: GetUserReviewsParams = {}
): Promise<UserReviewsResponse | null> => {
  try {
    const { page = 1, limit = 10, sort = "newest" } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    const response = await axiosInstance.get<ApiResponse<UserReviewsResponse>>(
      `/user/reviews/my-reviews?${queryParams}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error("Failed to fetch user reviews:", response.data.message);
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to fetch your reviews";

    console.error("Get user reviews error:", error);

    if (axiosError.response?.status === 401) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please log in to view your reviews",
        icon: "warning",
        confirmButtonColor: "#00478f",
      });
    } else {
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    }

    return null;
  }
};

/**
 * Update user's own review with S3 image URLs (PROTECTED)
 * @param reviewId - The UUID of the review to update
 * @param reviewData - Updated review information including S3 image URLs
 * @returns Updated review data or null if error
 */
export const updateReview = async (
  reviewId: string,
  reviewData: UpdateReviewData
): Promise<Review | null> => {
  try {
    const response = await axiosInstance.put<ApiResponse<Review>>(
      `/user/reviews/${reviewId}`,
      reviewData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success && response.data.data) {
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Review updated successfully!",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return response.data.data;
    } else {
      const errorMessage = response.data.message || "Failed to update review";
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
    let errorMessage = "Failed to update review";

    if (axiosError.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError.response?.status === 404) {
      errorMessage =
        "Review not found or you do not have permission to update it";
    } else if (axiosError.response?.status === 400) {
      errorMessage = axiosError.response.data?.message || "Invalid review data";
    }

    console.error("Update review error:", error);

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    return null;
  }
};

/**
 * Delete user's own review (PROTECTED)
 * @param reviewId - The UUID of the review to delete
 * @returns True if successful, false otherwise
 */
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete<ApiResponse>(
      `/user/reviews/${reviewId}`
    );

    if (response.data.success) {
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Review deleted successfully!",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return true;
    } else {
      const errorMessage = response.data.message || "Failed to delete review";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return false;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    let errorMessage = "Failed to delete review";

    if (axiosError.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError.response?.status === 404) {
      errorMessage =
        "Review not found or you do not have permission to delete it";
    }

    console.error("Delete review error:", error);

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    return false;
  }
};

/**
 * Check if authenticated user can review a specific product (PROTECTED)
 * @param productId - The UUID of the product
 * @returns Review permission data or null if error
 */
export const canUserReview = async (
  productId: string
): Promise<ReviewPermissionResponse | null> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<ReviewPermissionResponse>
    >(`/user/reviews/can-review/${productId}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error(
        "Failed to check review permission:",
        response.data.message
      );
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;

    console.error(
      "Check review permission error:",
      axiosError.response?.data?.message || "Failed to check review permission"
    );

    if (axiosError.response?.status === 401) {
      return {
        canReview: false,
        reason: "not_purchased",
        message: "Please log in to review products",
      };
    } else if (axiosError.response?.status === 404) {
      Swal.fire({
        title: "Error",
        text: "Product not found",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    }

    return null;
  }
};

/**
 * Update the display order/positions of review images (PROTECTED)
 * @param reviewId - The UUID of the review
 * @param positions - Object mapping image URLs to their new positions
 * @returns Updated review data or null if error
 */
export const updateReviewImagePositions = async (
  reviewId: string,
  positions: Record<string, number>
): Promise<{ review_id: string; image_urls: ReviewImage[] } | null> => {
  try {
    const payload: ImagePositionUpdate = { positions };

    const response = await axiosInstance.post<
      ApiResponse<{ review_id: string; image_urls: ReviewImage[] }>
    >(`/user/reviews/update-image-positions/${reviewId}`, payload);

    if (response.data.success && response.data.data) {
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Image positions updated successfully!",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return response.data.data;
    } else {
      const errorMessage =
        response.data.message || "Failed to update image positions";
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
    let errorMessage = "Failed to update image positions";

    if (axiosError.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError.response?.status === 400) {
      errorMessage =
        axiosError.response.data?.message || "Invalid image position data";
    } else if (axiosError.response?.status === 404) {
      errorMessage =
        "Review not found or you do not have permission to update it";
    }

    console.error("Update image positions error:", error);

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    return null;
  }
};

/**
 * Utility function to format review rating for display
 * @param rating - Rating number (1-5)
 * @returns String of star characters
 */
export const formatRatingStars = (rating: number): string => {
  return "★".repeat(Math.max(0, Math.min(5, Math.floor(rating))));
};

/**
 * Utility function to format review date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatReviewDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    console.error("Invalid date format:", dateString);
    return "Invalid date";
  }
};

/**
 * Utility function to validate review form data
 * @param reviewData - Review data to validate
 * @returns Validation result with errors
 */
export const validateReviewData = (
  reviewData: CreateReviewData | UpdateReviewData
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }

  if (!reviewData.title || reviewData.title.trim().length === 0) {
    errors.push("Review title is required");
  } else if (reviewData.title.length > 200) {
    errors.push("Review title must be 200 characters or less");
  }

  if (
    "product_id" in reviewData &&
    (!reviewData.product_id || reviewData.product_id.trim().length === 0)
  ) {
    errors.push("Product ID is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Re-export image validation from upload service for convenience
export { UploadService as UploadService } from "./uploadService";

/**
 * Allowed image types for reviews (excluding webp for compatibility)
 */
export const ALLOWED_REVIEW_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

/**
 * Utility function to validate image files before upload
 * @param files - Array of File objects
 * @returns Validation result with errors
 */
export const validateReviewImages = (
  files: File[]
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (files.length > 5) {
    errors.push("Maximum 5 images allowed per review");
  }

  // Check if files are of supported image types
  const unsupportedFiles = files.filter(
    (file) => !ALLOWED_REVIEW_IMAGE_TYPES.includes(file.type)
  );
  if (unsupportedFiles.length > 0) {
    errors.push(
      `Only PNG, JPG, JPEG, and GIF files are allowed. Unsupported files: ${unsupportedFiles
        .map((f) => f.name)
        .join(", ")}`
    );
  }

  const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024); // 10MB limit
  if (oversizedFiles.length > 0) {
    errors.push(
      `File size must be less than 10MB. Large files: ${oversizedFiles
        .map((f) => f.name)
        .join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
