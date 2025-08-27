import axiosInstance from "../axiosConfig";

// TypeScript interfaces based on the API documentation
export interface SearchSummary {
  total_results: number;
  products_count: number;
  categories_count: number;
  search_term: string;
  available_products: number;
  unavailable_products: number;
}

export interface SearchPagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  availableProducts: number;
  unavailableProducts: number;
}

export interface ProductResult {
  type: "product";
  id: string;
  variant_id?: string; // Added variant_id from backend
  name: string;
  description: string;
  image: string | null;
  price: number;
  compare_price: number | null;
  brand: string;
  product_type: string;
  stock: number;
  sku?: string; // Added sku from backend
  is_quickship?: boolean; // Made optional since not always present
  seller: {
    id: string;
    name: string;
    email: string;
  } | null;
  category_info: {
    sub_category: {
      id: string;
      title: string;
    };
    category: {
      id: string;
      title: string;
    } | null;
  } | null;
  url: string;
}

export interface CategoryResult {
  type: "category";
  id: string;
  name: string;
  description: string;
  image: string | null;
  category_type: "super-category" | "category" | "sub-category";
  parent_category: {
    id: string;
    title: string;
  } | null;
  url: string;
}

export type SearchResult = ProductResult | CategoryResult;

export interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    summary: {
      pagination: SearchPagination;
      total_results: number;
      products_count: number;
      categories_count: number;
      search_term: string;
    };
    filters?: {
      availability: {
        in_stock: number;
        out_of_stock: number;
      };
      brands?: Array<{
        name: string;
        count: number;
      }>;
    };
  };
}

export interface SearchError {
  success: false;
  message: string;
  error?: string;
}

/**
 * Performs universal search across products and categories with pagination
 * @param searchTerm - The search query string
 * @param page - Page number (default: 1)
 * @param limit - Maximum number of results per page (default: 12, max: 50)
 * @returns Promise with search results, summary, and pagination
 */
// Options interface for search filters
export interface SearchOptions {
  page?: number;
  limit?: number;
  // Filter parameters
  brands?: string[];
  priceFrom?: string;
  priceTo?: string;
  inStock?: boolean;
  outStock?: boolean;
  sortBy?: string;
}

export const universalSearch = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 12,
  options: SearchOptions = {}
): Promise<{
  results: SearchResult[];
  products: ProductResult[];
  categories: CategoryResult[];
  summary: SearchSummary | null;
  pagination: SearchPagination | null;
  filters?: {
    availability: {
      in_stock: number;
      out_of_stock: number;
    };
    brands?: Array<{
      name: string;
      count: number;
    }>;
  };
  error?: string;
}> => {
  try {
    if (!searchTerm.trim()) {
      return {
        results: [],
        products: [],
        categories: [],
        summary: null,
        pagination: null,
        filters: undefined,
        error: "Search term is required",
      };
    }

    // Ensure page and limit are within bounds
    const validPage = Math.max(page, 1);
    const validLimit = Math.min(Math.max(limit, 1), 50);

    // Extract filter options
    const {
      brands = [],
      priceFrom,
      priceTo,
      inStock,
      outStock,
      sortBy,
    } = options;

    // Build API parameters
    const params: {
      q: string;
      page: number;
      limit: number;
      brands?: string;
      priceFrom?: string;
      priceTo?: string;
      inStock?: string;
      outStock?: string;
      sortBy?: string;
    } = {
      q: searchTerm.trim(),
      page: validPage,
      limit: validLimit,
    };

    // Add filter parameters
    if (brands && brands.length > 0) {
      params.brands = brands.join(",");
    }

    if (priceFrom !== undefined && priceFrom !== null && priceFrom !== "") {
      params.priceFrom = priceFrom;
    }

    if (priceTo !== undefined && priceTo !== null && priceTo !== "") {
      params.priceTo = priceTo;
    }

    if (inStock !== undefined) {
      params.inStock = inStock.toString();
    }

    if (outStock !== undefined) {
      params.outStock = outStock.toString();
    }

    if (sortBy !== undefined && sortBy !== null && sortBy !== "") {
      params.sortBy = sortBy;
    }

    const response = await axiosInstance.get<SearchResponse>(
      `/user/search/universal`,
      {
        params,
      }
    );

    if (response.data.success) {
      // Backend returns combined results array, need to separate products and categories
      const allResults = response.data.data.results || [];
      const products = allResults.filter(
        (item): item is ProductResult => item.type === "product"
      );
      const categories = allResults.filter(
        (item): item is CategoryResult => item.type === "category"
      );

      // Extract pagination from summary
      const pagination = response.data.data.summary.pagination;

      // Transform summary to match frontend expectations
      const summary: SearchSummary = {
        total_results: response.data.data.summary.total_results,
        products_count: response.data.data.summary.products_count,
        categories_count: response.data.data.summary.categories_count,
        search_term: response.data.data.summary.search_term,
        available_products:
          response.data.data.filters?.availability?.in_stock || 0,
        unavailable_products:
          response.data.data.filters?.availability?.out_of_stock || 0,
      };

      return {
        results: allResults,
        products: products,
        categories: categories,
        summary: summary,
        pagination: pagination,
        filters: response.data.data.filters,
      };
    } else {
      return {
        results: [],
        products: [],
        categories: [],
        summary: null,
        pagination: null,
        filters: undefined,
        error: "Search failed",
      };
    }
  } catch (error: unknown) {
    console.error("Universal search error:", error);

    // Handle specific error responses
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      if (axiosError.response?.data?.message) {
        return {
          results: [],
          products: [],
          categories: [],
          summary: null,
          pagination: null,
          filters: undefined,
          error: axiosError.response.data.message,
        };
      }
    }

    return {
      results: [],
      products: [],
      categories: [],
      summary: null,
      pagination: null,
      filters: undefined,
      error: "An error occurred while searching. Please try again.",
    };
  }
};

/**
 * Helper function to get the navigation URL for a search result
 * @param result - Search result (product or category)
 * @returns Navigation URL string
 */
export const getNavigationUrl = (result: SearchResult): string => {
  if (result.type === "product") {
    // For products, construct URL with slug and productid query parameter
    // if (result.url && result.url.includes("/product/")) {
    //   const createSlug = (title: string): string => {
    //         return title
    //           .toLowerCase()
    //           .replace(/[^a-z0-9]+/g, "-")
    //           .replace(/(^-|-$)/g, "");
    //       };
    //       const slug = createSlug(result.name);
    //       return `/product/${slug}/?productid=${result.id}`;
    //   // If the API provides a properly formatted URL, use it
    //   return result.url;
    // } else {
    //   // Construct URL with slug and productid
    //   const slug = result.name
    //     .toLowerCase()
    //     .replace(/[^a-z0-9]+/g, "-")
    //     .replace(/^-+|-+$/g, "");
    //   return `/product/${slug}?productid=${result.id}`;
    // }
    const slug = result.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `/product/${slug}?productid=${result.id}`;
  } else {
    // For categories, construct proper URLs based on category_type
    // Always use human-readable slugs with proper query parameters
    const createSlug = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/&/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    };

    const slug = createSlug(result.name);

    if (result.category_type === "sub-category") {
      // For subcategories, navigate to SubcategoryContent.tsx
      if (result.parent_category) {
        const parentSlug = createSlug(result.parent_category.title);
        // Use the universal format for sub-categories
        return `/category/${parentSlug}/${slug}?id=${result.id}&type=sub-category`;
      } else {
        // Fallback if no parent category
        return `/category/${slug}?id=${result.id}&type=sub-category`;
      }
    } else if (result.category_type === "category") {
      // For categories, navigate to SubcategoryContent.tsx via /category/[slug]/all
      return `/category/${slug}/all?id=${result.id}&type=category`;
    } else if (result.category_type === "super-category") {
      // For super-categories, navigate to CategoryContent.tsx
      return `/category/${slug}?id=${result.id}&type=super-category`;
    } else {
      // Fallback for any other type, navigate to CategoryContent.tsx
      return `/category/${slug}?id=${result.id}&type=${
        result.category_type || "category"
      }`;
    }
  }
};

/**
 * Helper function to format price with currency
 * @param price - Price number
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = "₹"): string => {
  return `${currency}${price.toLocaleString("en-IN")}`;
};

/**
 * Helper function to calculate discount percentage
 * @param price - Current price
 * @param comparePrice - Original price
 * @returns Discount percentage or null if no discount
 */
export const calculateDiscount = (
  price: number,
  comparePrice: number | null
): number | null => {
  if (!comparePrice || comparePrice <= price) {
    return null;
  }

  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

/**
 * Helper function to get result display image
 * @param result - Search result
 * @returns Image URL or fallback
 */
export const getResultImage = (result: SearchResult): string => {
  if (result.image) {
    return result.image;
  }

  // Fallback images based on type
  if (result.type === "product") {
    return "/images/common/product.png";
  } else {
    return "/images/common/category-banner.png";
  }
};
