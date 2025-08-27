import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";
import Swal from "sweetalert2";

// TypeScript interfaces
export interface Tag {
  id: string;
  name: string;
  description?: string;
}

export interface Collection {
  id: string;
  title: string;
  collection_type?: "Manual" | "Smart";
  category_type: string;
}

export interface ImageUrl {
  url: string;
  position: number;
}

export interface Seller {
  id: string;
  firm_name: string;
  email: string;
  phone?: string;
}

export interface VariationOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariantMap {
  product_id: string;
  option_values: { [key: string]: string };
}

export interface VariantInfo {
  common_attributes: {
    title: string;
    description: string;
    short_description: string;
    page_title?: string;
    page_description?: string;
    page_url?: string;
    status: string;
    brand: string;
    type: string;
    physical_product: boolean;
  };
  variation_options: VariationOption[];
  variant_products: Product[];
}

// Simplified Product interface for product cards
export interface Product {
  id: string;
  title: string;
  brand: string;
  type: string;
  status: "draft" | "active" | "inactive";
  page_url?: string;
  has_variant: boolean;
  createdAt: string;
  updatedAt: string;

  // Default variant essential data
  variant_id?: string | null; // Add variant_id for cart operations
  price: number | null;
  compare_price?: number | null;
  stock_qty: number;
  sell_out_of_stock: boolean;
  image_urls: ImageUrl[];

  // Calculated fields from backend
  image_url: string | null;
  discount?: number | null;
  is_sale: boolean;
  in_stock: boolean;
}

export interface ProductDetail extends DetailedProduct {
  // New backend structure fields
  default_image_urls?: ImageUrl[];
  DefaultVariant?: {
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
    weight?: number;
    length?: number;
    breadth?: number;
    height?: number;
    image_urls: ImageUrl[];
    option_values?: { [key: string]: string };
    createdAt: string;
    updatedAt: string;
  };
  Seller?: {
    id: string;
    firm_name: string;
    email: string;
    phone?: string;
  };
  Tags?: {
    id: string;
    name: string;
    description: string;
  }[];
  Collections?: {
    id: string;
    title: string;
    category_type: string;
  }[];
  reviews?: {
    reviews: {
      id: string;
      rating: number;
      title: string;
      comment: string;
      is_verified_purchase: boolean;
      helpful_count: number;
      image_urls: {
        url: string;
        position: number;
      }[];
      createdAt: string;
      user: {
        display_name: string;
      };
    }[];
    statistics: {
      total_reviews: number;
      average_rating: number;
      rating_distribution: {
        [key: string]: number;
      };
    };
    showing_count: number;
  };
}

// Interface for backend response format
interface BackendRecentlyViewedItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number | null;
  imageUrl: string;
  slug: string;
  rating: number;
  isQuickShip: boolean;
  isSale: boolean;
  inStock: boolean;
  url: string;
  variant_id: string | null;
  option_values: { [key: string]: string } | null;
  viewedAt: string;
  recentlyViewedId: string;
}

export interface RecentlyViewedItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number | null;
  imageUrl: string;
  slug: string;
  rating: number;
  isQuickShip: boolean;
  isSale: boolean;
  inStock: boolean;
  url: string;
  variant_id: string | null;
  option_values: { [key: string]: string } | null;
  viewedAt: string;
  recentlyViewedId: string;
}

// Extended interface for detailed product information (single product pages, etc.)
export interface DetailedProduct extends Product {
  serial_no?: string;
  description?: string;
  short_description?: string;
  cost_per_item?: number;
  gst_percent?: number;
  profit?: number;
  margin?: number;
  physical_product?: boolean;
  is_tracking_inventory?: boolean;
  sku?: string;
  barcode?: string;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
  region_of_origin?: string;
  hs_code?: string;
  page_title?: string;
  page_description?: string;
  margin_contribution?: number;
  seller_id?: string;
  variant_id?: string | null;
  option_values?: { [key: string]: string };
  Tags?: Tag[];
  Collections?: Collection[];
  Seller?: Seller;
  variants?: VariantInfo | null;
}

export interface RecentlyViewedProduct extends Product {
  viewedAt: string;
  recentlyViewedId: string;
}

export interface RecentlyViewedResponse {
  recentlyViewed: RecentlyViewedItem[];
}

export interface RecentlyViewedApiResponse {
  products: RecentlyViewedItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
  };
}

export interface ProductsPagination {
  total: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}

export interface ProductsFilters {
  search: string | null;
  category: string | null;
  brand: string | null;
  type: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  status: string | null;
  sort: string;
  inStock: boolean | null;
}

export interface ProductsResponse {
  products: Product[];
  pagination: ProductsPagination;
  filters?: ProductsFilters;
}

export interface CollectionProductsResponse {
  products: Product[];
  collection: {
    id: string;
    title: string;
    description: string;
    category_type: string;
  };
  pagination: ProductsPagination;
}

export interface TrackViewResponse {
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: "active" | "inactive" | "draft";
  sort?:
    | "newest"
    | "oldest"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc";
  inStock?: boolean;
}

// Get a single product by ID
export const getProduct = async (
  productId: string | number,
  include_reviews: boolean = true,
  reviews_limit: number = 5
): Promise<ProductDetail | null> => {
  try {
    const queryParams = new URLSearchParams({
      include_reviews: include_reviews.toString(),
      reviews_limit: reviews_limit.toString(),
    });

    const response = await axiosInstance.get<ApiResponse<ProductDetail>>(
      `/user/product/get-product/${productId}?${queryParams.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      if (response.data.message) {
        console.error("Product fetch error:", response.data.message);
      }
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to fetch product";

    console.error("Get product error:", error);

    // Only show error dialog if it's not a 404 (product not found)
    if (axiosError.response?.status !== 404) {
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

// Get product by ID with slug for URL display
export const getProductByIdWithSlug = async (
  productId: string | number,
  include_reviews: boolean = true,
  reviews_limit: number = 5
): Promise<ProductDetail | null> => {
  try {
    const queryParams = new URLSearchParams({
      include_reviews: include_reviews.toString(),
      reviews_limit: reviews_limit.toString(),
    });

    const response = await axiosInstance.get<ApiResponse<ProductDetail>>(
      `/user/product/get-product/${productId}?${queryParams.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      if (response.data.message) {
        console.error("Product fetch error:", response.data.message);
      }
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to fetch product";

    console.error("Get product error:", error);

    // Only show error dialog if it's not a 404 (product not found)
    if (axiosError.response?.status !== 404) {
      console.error("Product not found:", errorMessage);
    }

    return null;
  }
};

// Get all products with filtering and pagination
export const getAllProducts = async (
  params: GetProductsParams = {}
): Promise<ProductsResponse | null> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      type,
      minPrice,
      maxPrice,
      status,
      sort = "newest",
      inStock,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: Math.min(Math.max(limit, 1), 100).toString(),
      sort,
    });

    // Add optional parameters
    if (search) queryParams.append("search", search);
    if (category) queryParams.append("category", category);
    if (brand) queryParams.append("brand", brand);
    if (type) queryParams.append("type", type);
    if (minPrice !== undefined)
      queryParams.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined)
      queryParams.append("maxPrice", maxPrice.toString());
    if (status) queryParams.append("status", status);
    if (inStock !== undefined)
      queryParams.append("inStock", inStock.toString());

    const response = await axiosInstance.get<ApiResponse<ProductsResponse>>(
      `/user/product/get-products?${queryParams.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      if (response.data.message) {
        console.error("Products fetch error:", response.data.message);
      }
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to fetch products";

    console.error("Get all products error:", error);

    // Only show error dialog if it's not a 404 (no products found)
    if (axiosError.response?.status !== 404) {
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

// Get products by collection ID
export const getProductsByCollection = async (
  collectionId: string,
  page: number = 1,
  limit: number = 20
): Promise<CollectionProductsResponse | null> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await axiosInstance.get<
      ApiResponse<CollectionProductsResponse>
    >(
      `/user/product/get-productsbycollection/${collectionId}?${queryParams.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      if (response.data.message) {
        console.error(
          "Products by collection fetch error:",
          response.data.message
        );
      }
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to fetch products by collection";

    console.error("Get products by collection error:", error);

    if (axiosError.response?.status !== 404) {
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

// RECENTLY VIEWED PRODUCTS FUNCTIONS

// Track product view
export const trackProductView = async (productId: string): Promise<boolean> => {
  try {
    console.log(`Tracking product view for product ID: ${productId}`);

    const response = await axiosInstance.get<ApiResponse<TrackViewResponse>>(
      `/user/product/track-view/${productId}`
    );

    if (response.data.success) {
      console.log(`Successfully tracked product view for ID: ${productId}`);
      return true;
    } else {
      console.error("Failed to track product view:", response.data.message);
      return false;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to track product view";

    console.error("Track product view error:", error);
    console.error("Error status:", axiosError.response?.status);
    console.error("Error message:", errorMessage);

    // Don't show error to user for tracking as it's a background operation
    // Also don't warn for 401 errors as they're expected for non-authenticated users
    if (
      axiosError.response?.status !== 404 &&
      axiosError.response?.status !== 401
    ) {
      console.warn("Product view tracking failed:", errorMessage);
    } else {
      console.log(
        `Track view skipped for product ${productId}: ${axiosError.response?.status} error`
      );
    }

    return false;
  }
};

// Get recently viewed products
export const getRecentlyViewedProducts = async (
  limit: number = 10
): Promise<RecentlyViewedItem[] | null> => {
  try {
    // Validate limit
    const validLimit = Math.min(Math.max(limit, 1), 50);

    const response = await axiosInstance.get<
      ApiResponse<RecentlyViewedApiResponse>
    >("/user/product/recently-viewed", {
      params: {
        limit: validLimit,
      },
    });

    if (response.data.success && response.data.data) {
      // The API now returns the product data directly with all necessary fields
      const recentlyViewedItems: RecentlyViewedItem[] =
        response.data.data.products.map(
          (product: BackendRecentlyViewedItem) => ({
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            imageUrl: product.imageUrl,
            slug: product.slug,
            rating: product.rating,
            isQuickShip: product.isQuickShip,
            isSale: product.isSale,
            inStock: product.inStock,
            url: product.url,
            variant_id: product.variant_id,
            option_values: product.option_values,
            viewedAt: product.viewedAt,
            recentlyViewedId: product.recentlyViewedId,
          })
        );

      return recentlyViewedItems;
    } else {
      console.error(
        "Failed to fetch recently viewed products:",
        response.data.message
      );
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to fetch recently viewed products";

    console.error("Get recently viewed products error:", error);

    // Don't show error to user if they're not authenticated (expected behavior)
    if (axiosError.response?.status !== 401) {
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

// Remove specific product from recently viewed
export const removeFromRecentlyViewed = async (
  productId: string,
  silent: boolean = false
): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete<ApiResponse>(
      `/user/product/recently-viewed/${productId}`
    );

    if (response.data.success) {
      if (!silent) {
        Swal.fire({
          title: "Success",
          text: "Product removed from recently viewed",
          icon: "success",
          confirmButtonColor: "#00478f",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      return true;
    } else {
      console.error(
        "Failed to remove product from recently viewed:",
        response.data.message
      );
      return false;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to remove product from recently viewed";

    console.error("Remove from recently viewed error:", error);

    // Only show error to user if not in silent mode
    if (!silent) {
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    }

    return false;
  }
};

// Clear all recently viewed products
export const clearAllRecentlyViewed = async (): Promise<boolean> => {
  try {
    // Show confirmation dialog first
    const result = await Swal.fire({
      title: "Clear All Recently Viewed?",
      text: "This action cannot be undone. All your recently viewed products will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#00478f",
      confirmButtonText: "Yes, clear all",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return false;
    }

    const response = await axiosInstance.delete<ApiResponse>(
      "/user/product/recently-viewed/clear"
    );

    if (response.data.success) {
      Swal.fire({
        title: "Success",
        text: "All recently viewed products cleared",
        icon: "success",
        confirmButtonColor: "#00478f",
        timer: 3000,
        showConfirmButton: false,
      });

      return true;
    } else {
      console.error(
        "Failed to clear recently viewed products:",
        response.data.message
      );
      return false;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to clear recently viewed products";

    console.error("Clear all recently viewed error:", error);

    // Show error to user
    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    return false;
  }
};

// Get recently viewed products count (helper function for badges)
export const getRecentlyViewedCount = async (): Promise<number> => {
  try {
    const recentlyViewed = await getRecentlyViewedProducts(50); // Get more to count
    return recentlyViewed ? recentlyViewed.length : 0;
  } catch (error) {
    console.warn("Failed to get recently viewed count:", error);
    return 0;
  }
};
