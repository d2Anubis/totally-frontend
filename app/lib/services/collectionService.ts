import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";
import Swal from "sweetalert2";

// TypeScript interfaces - Updated for new API structure
export interface Category {
  id: string; // UUID
  title: string;
  description: string;
  image_url: string;
  caption: string;
  products: Product[];
}

export interface CategoryWithProducts {
  id: string;
  title: string;
  description: string;
  image_url: string;
  caption: string;
  products: Product[]; // Max 6 products
}

// Super Category with Products interface
export interface SuperCategoryWithProducts {
  id: string;
  title: string;
  description: string;
  image_url: string;
  caption: string;
  products: Product[]; // Max 6 products
}

// New unified category info interface
export interface CategoryInfo {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category_type: "super-category" | "category" | "sub-category";
  collection_type?: "Manual" | "Smart";
  parent_category?: {
    id: string;
    title: string;
  } | null;
  super_category?: {
    id: string;
    title: string;
  } | null;
}

// Related categories interface
export interface RelatedCategory {
  id: string;
  title: string;
  collection_type?: "Manual" | "Smart";
}

export interface SmartCollectionConditions {
  price_min?: number;
  price_max?: number;
  category?: string;
  tags?: string[];
  availability?: boolean;
  [key: string]: unknown; // Allow additional dynamic conditions
}

// Legacy SubCategory interface (kept for backward compatibility)
export interface SubCategory {
  id: string; // UUID
  title: string;
  description: string;
  image_url: string;
  collection_type: "Manual" | "Smart";
  conditions: SmartCollectionConditions | null; // JSON conditions for smart collections
  Category: {
    id: string;
    title: string;
  };
}

// Simplified Product interface for collection service - matches backend optimization
export interface Product {
  id: string;
  title: string;
  brand: string;
  type: string;
  status: "draft" | "active" | "inactive";
  page_url?: string;
  createdAt: string;
  updatedAt: string;

  // Default variant essential data
  variant_id: string | null; // Add variant_id for cart operations
  price: number | null;
  compare_price?: number | null;
  stock_qty: number;
  sell_out_of_stock: boolean;
  image_urls: { url: string; position: number }[];

  // Calculated fields from backend
  image_url: string | null;
  discount?: number | null;
  is_sale: boolean;
  in_stock: boolean;
}

export interface Collection {
  id: string;
  title: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

// New unified response interface
export interface UnifiedCategoryResponse {
  category: CategoryInfo;
  products: Product[];
  relatedCategories: RelatedCategory[];
  pagination: Pagination;
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
}

// Legacy response interfaces (kept for backward compatibility)
export interface CategoryProductsResponse {
  category: {
    id: string;
    title: string;
    description: string;
    image_url: string;
  };
  products: Product[];
  pagination: Pagination;
}

export interface SubCategoryProductsResponse {
  subCategory: SubCategory;
  products: Product[];
  pagination: Pagination;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Options interface for the new unified API
export interface CategoryProductsOptions {
  type?: "super-category" | "category" | "sub-category";
  page?: number;
  limit?: number;
  trending?: boolean;
  // Filter parameters
  brands?: string[];
  priceFrom?: string;
  priceTo?: string;
  inStock?: boolean;
  outStock?: boolean;
  sortBy?: string;
}

// API Function Types
export type GetCategoriesWithProducts = (
  trending?: boolean
) => Promise<CategoryWithProducts[]>;
export type GetSuperCategoriesWithProducts = (
  trending?: boolean
) => Promise<SuperCategoryWithProducts[]>;
export type GetProductsByAnyCategory = (
  categoryId: string,
  options?: CategoryProductsOptions
) => Promise<UnifiedCategoryResponse>;

// 1. GET ALL CATEGORIES WITH PRODUCTS (unchanged)
export const getCategoriesWithProducts = async (
  trending: boolean = false
): Promise<CategoryWithProducts[] | null> => {
  try {
    const params = trending ? { trending: "true" } : {};

    const response = await axiosInstance.get<
      ApiResponse<CategoryWithProducts[]>
    >("/user/category/categories-with-products", {
      params,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error(
        "Failed to fetch categories with products:",
        response.data.message
      );
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to fetch categories with products";

    console.error("Get categories with products error:", error);

    // Show error to user only if it's not a trending request with no results
    if (!(trending && axiosError.response?.status === 404)) {
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

// 1.1. GET ALL SUPER CATEGORIES WITH PRODUCTS (new)
export const getSuperCategoriesWithProducts = async (
  trending: boolean = false
): Promise<SuperCategoryWithProducts[] | null> => {
  try {
    const params = trending ? { trending: "true" } : {};

    const response = await axiosInstance.get<
      ApiResponse<SuperCategoryWithProducts[]>
    >("/user/category/super-categories-with-products", {
      params,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error(
        "Failed to fetch super categories with products:",
        response.data.message
      );
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to fetch super categories with products";

    console.error("Get super categories with products error:", error);

    // Show error to user only if it's not a trending request with no results
    if (!(trending && axiosError.response?.status === 404)) {
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

// 2. NEW UNIFIED GET PRODUCTS BY ANY CATEGORY (replaces old separate functions)
export const getProductsByAnyCategory = async (
  categoryId: string,
  options: CategoryProductsOptions = {}
): Promise<UnifiedCategoryResponse | null> => {
  try {
    const {
      type = null, // auto-detect if not provided
      page = 1,
      limit = 20,
      trending = false,
      brands = [],
      priceFrom,
      priceTo,
      inStock,
      outStock,
      sortBy,
    } = options;

    // Validate limit
    const validLimit = Math.min(Math.max(limit, 1), 50);

    const params: {
      page: number;
      limit: number;
      trending?: string;
      type?: string;
      brands?: string;
      priceFrom?: string;
      priceTo?: string;
      inStock?: string;
      outStock?: string;
      sortBy?: string;
    } = {
      page: Math.max(page, 1),
      limit: validLimit,
    };

    if (trending) {
      params.trending = "true";
    }

    if (type) {
      params.type = type;
    }

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

    const response = await axiosInstance.get<
      ApiResponse<UnifiedCategoryResponse>
    >(`/user/category/${categoryId}/products`, {
      params,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error(
        "Failed to fetch products by category:",
        response.data.message
      );
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to fetch products by category";

    console.error("Get products by category error:", error);

    // Show error to user only if it's not a 404 (category not found) and not a trending request with no results
    if (
      axiosError.response?.status !== 404 &&
      !(options.trending && axiosError.response?.status === 404)
    ) {
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

// 3. LEGACY FUNCTIONS (backward compatibility) - now using unified API internally
export const getProductsByCategory = async (
  categoryId: string,
  page: number = 1,
  limit: number = 20,
  trending: boolean = false
): Promise<CategoryProductsResponse | null> => {
  try {
    const unifiedResponse = await getProductsByAnyCategory(categoryId, {
      type: "category",
      page,
      limit,
      trending,
    });

    if (unifiedResponse) {
      // Transform to legacy format
      return {
        category: {
          id: unifiedResponse.category.id,
          title: unifiedResponse.category.title,
          description: unifiedResponse.category.description,
          image_url: unifiedResponse.category.image_url,
        },
        products: unifiedResponse.products,
        pagination: unifiedResponse.pagination,
      };
    }

    return null;
  } catch (error) {
    console.error("Get products by category (legacy) error:", error);
    return null;
  }
};

export const getProductsBySubCategory = async (
  subCategoryId: string,
  page: number = 1,
  limit: number = 20,
  trending: boolean = false
): Promise<SubCategoryProductsResponse | null> => {
  try {
    const unifiedResponse = await getProductsByAnyCategory(subCategoryId, {
      type: "sub-category",
      page,
      limit,
      trending,
    });

    if (unifiedResponse) {
      // Transform to legacy format
      const subCategory: SubCategory = {
        id: unifiedResponse.category.id,
        title: unifiedResponse.category.title,
        description: unifiedResponse.category.description,
        image_url: unifiedResponse.category.image_url,
        collection_type: unifiedResponse.category.collection_type || "Manual",
        conditions: null, // Not provided in new API
        Category: unifiedResponse.category.parent_category || {
          id: "",
          title: "",
        },
      };

      return {
        subCategory,
        products: unifiedResponse.products,
        pagination: unifiedResponse.pagination,
      };
    }

    return null;
  } catch (error) {
    console.error("Get products by sub-category (legacy) error:", error);
    return null;
  }
};

// HELPER FUNCTIONS FOR FRONTEND INTEGRATION

// Get category by ID (using new unified API)
export const getCategoryById = async (
  categoryId: string
): Promise<CategoryInfo | null> => {
  const response = await getProductsByAnyCategory(categoryId, { limit: 1 });
  return response?.category || null;
};

// Get sub-category by ID (legacy compatibility)
export const getSubCategoryById = async (
  subCategoryId: string
): Promise<SubCategory | null> => {
  const response = await getProductsBySubCategory(subCategoryId, 1, 1);
  return response?.subCategory || null;
};

// Search products within a category (now using unified API)
export const searchProductsInCategory = async (
  categoryId: string,
  searchTerm: string,
  page: number = 1,
  limit: number = 20,
  categoryType?: "super-category" | "category" | "sub-category"
): Promise<UnifiedCategoryResponse | null> => {
  try {
    const response = await getProductsByAnyCategory(categoryId, {
      type: categoryType,
      page,
      limit,
    });

    if (response && searchTerm) {
      // Filter products by search term (frontend filtering)
      const filteredProducts = response.products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.type.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        ...response,
        products: filteredProducts,
        pagination: {
          ...response.pagination,
          totalProducts: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit),
        },
      };
    }

    return response;
  } catch (error) {
    console.error("Search products in category error:", error);
    return null;
  }
};

// Get products with price filter (now using unified API)
export const getProductsWithPriceFilter = async (
  categoryId: string,
  minPrice: number,
  maxPrice: number,
  page: number = 1,
  limit: number = 20,
  categoryType?: "super-category" | "category" | "sub-category"
): Promise<UnifiedCategoryResponse | null> => {
  try {
    const response = await getProductsByAnyCategory(categoryId, {
      type: categoryType,
      page,
      limit,
    });

    if (response) {
      // Filter products by price range (frontend filtering)
      const filteredProducts = response.products.filter(
        (product) =>
          product.price !== null &&
          product.price >= minPrice &&
          product.price <= maxPrice
      );

      return {
        ...response,
        products: filteredProducts,
        pagination: {
          ...response.pagination,
          totalProducts: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit),
        },
      };
    }

    return response;
  } catch (error) {
    console.error("Get products with price filter error:", error);
    return null;
  }
};

// Sort products by various criteria
export const sortProducts = (
  products: Product[],
  sortBy:
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc"
    | "stock_asc"
    | "stock_desc"
): Product[] => {
  const sortedProducts = [...products];

  switch (sortBy) {
    case "price_asc":
      return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price_desc":
      return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "name_asc":
      return sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    case "name_desc":
      return sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
    case "stock_asc":
      return sortedProducts.sort((a, b) => a.stock_qty - b.stock_qty);
    case "stock_desc":
      return sortedProducts.sort((a, b) => b.stock_qty - a.stock_qty);
    default:
      return sortedProducts;
  }
};

// Check if product is in stock
export const isProductInStock = (product: Product): boolean => {
  return product.stock_qty > 0;
};

// Get available products only
export const getAvailableProducts = (products: Product[]): Product[] => {
  return products.filter((product) => isProductInStock(product));
};

// Format product price with currency
export const formatPrice = (
  price: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(price);
};

// Get product collection names - Note: Collection data not available in optimized product cards
export const getProductCollections = (product: Product): string[] => {
  // Collection data is not included in optimized product responses for performance
  return [];
};

// TRENDING PRODUCTS CONVENIENCE FUNCTIONS

// Get only trending categories with products
export const getTrendingCategoriesWithProducts = async (): Promise<
  CategoryWithProducts[] | null
> => {
  return getCategoriesWithProducts(true);
};

// Get products from a trending category (now using unified API)
export const getTrendingProductsByCategory = async (
  categoryId: string,
  page: number = 1,
  limit: number = 20
): Promise<UnifiedCategoryResponse | null> => {
  return getProductsByAnyCategory(categoryId, {
    type: "category",
    page,
    limit,
    trending: true,
  });
};

// Get products from a trending sub-category (now using unified API)
export const getTrendingProductsBySubCategory = async (
  subCategoryId: string,
  page: number = 1,
  limit: number = 20
): Promise<UnifiedCategoryResponse | null> => {
  return getProductsByAnyCategory(subCategoryId, {
    type: "sub-category",
    page,
    limit,
    trending: true,
  });
};

// NEW CONVENIENCE FUNCTIONS FOR UNIFIED API

// Get super-category products
export const getProductsBySuperCategory = async (
  superCategoryId: string,
  page: number = 1,
  limit: number = 20,
  trending: boolean = false
): Promise<UnifiedCategoryResponse | null> => {
  return getProductsByAnyCategory(superCategoryId, {
    type: "super-category",
    page,
    limit,
    trending,
  });
};

// Auto-detect category type and get products
export const getProductsWithAutoDetection = async (
  categoryId: string,
  page: number = 1,
  limit: number = 20,
  trending: boolean = false
): Promise<UnifiedCategoryResponse | null> => {
  return getProductsByAnyCategory(categoryId, {
    // Don't specify type - let API auto-detect
    page,
    limit,
    trending,
  });
};

// ================================================================
// NEW HIERARCHICAL CATEGORY TREE APIs
// ================================================================

// Interfaces for hierarchical tree structures
export interface CategoryTreeNode {
  id: string;
  title: string;
  description: string;
  image_url: string;
  caption: string;
  category_type: "super-category" | "category" | "sub-category";
  collection_type?: "Manual" | "Smart" | null;
  categories?: CategoryTreeNode[];
  subCategories?: CategoryTreeNode[];
  products?: Product[];
}

export interface HierarchicalTreeOptions {
  startLevel?: "super-category" | "category" | "sub-category";
  depth?: number;
  parentId?: string;
  trending?: boolean;
}

export interface HierarchicalTreeWithProductsOptions
  extends HierarchicalTreeOptions {
  productLimit?: number;
}

export interface HierarchicalTreeResponse {
  startLevel: string;
  depth: number;
  parentId: string | null;
  trending: boolean;
  tree: CategoryTreeNode[];
}

export interface HierarchicalTreeWithProductsResponse
  extends HierarchicalTreeResponse {
  productLimit: number;
}

// 1. NAVBAR/NAVIGATION API - HIERARCHICAL CATEGORY TREE (NO PRODUCTS)
export const getHierarchicalCategoryTree = async (
  options: HierarchicalTreeOptions = {}
): Promise<HierarchicalTreeResponse | null> => {
  try {
    const {
      startLevel = "super-category",
      depth = 3,
      parentId,
      trending = false,
    } = options;

    // Validate parameters
    const validStartLevels = ["super-category", "category", "sub-category"];
    if (!validStartLevels.includes(startLevel)) {
      throw new Error(
        "Invalid startLevel. Must be: super-category, category, or sub-category"
      );
    }

    if (depth < 1 || depth > 4) {
      throw new Error("Invalid depth. Must be a number between 1 and 4");
    }

    const params: Record<string, string> = {
      startLevel,
      depth: depth.toString(),
    };

    if (parentId) {
      params.parentId = parentId;
    }

    if (trending) {
      params.trending = "true";
    }

    const response = await axiosInstance.get<
      ApiResponse<HierarchicalTreeResponse>
    >("/user/category/hierarchy-tree", {
      params,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error(
        "Failed to fetch hierarchical category tree:",
        response.data.message
      );
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to fetch hierarchical category tree";

    console.error("Get hierarchical category tree error:", error);

    // Show error to user only if it's not a 404 (no categories found)
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

// 2. FULL DATA API - HIERARCHICAL CATEGORY TREE WITH PRODUCTS
export const getHierarchicalCategoryTreeWithProducts = async (
  options: HierarchicalTreeWithProductsOptions = {}
): Promise<HierarchicalTreeWithProductsResponse | null> => {
  try {
    const {
      startLevel = "super-category",
      depth = 4,
      parentId,
      trending = false,
      productLimit = 6,
    } = options;

    // Validate parameters
    const validStartLevels = ["super-category", "category", "sub-category"];
    if (!validStartLevels.includes(startLevel)) {
      throw new Error(
        "Invalid startLevel. Must be: super-category, category, or sub-category"
      );
    }

    if (depth < 1 || depth > 4) {
      throw new Error("Invalid depth. Must be a number between 1 and 4");
    }

    if (productLimit < 1 || productLimit > 50) {
      throw new Error(
        "Invalid productLimit. Must be a number between 1 and 50"
      );
    }

    const params: Record<string, string> = {
      startLevel,
      depth: depth.toString(),
      productLimit: productLimit.toString(),
    };

    if (parentId) {
      params.parentId = parentId;
    }

    if (trending) {
      params.trending = "true";
    }

    const response = await axiosInstance.get<
      ApiResponse<HierarchicalTreeWithProductsResponse>
    >("/user/category/hierarchy-tree-with-products", {
      params,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error(
        "Failed to fetch hierarchical category tree with products:",
        response.data.message
      );
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to fetch hierarchical category tree with products";

    console.error("Get hierarchical category tree with products error:", error);

    // Show error to user only if it's not a 404 (no categories found)
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

// ================================================================
// START EXPLORING SECTION API
// ================================================================

// Interface for Start Exploring section
export interface StartExploringCategory {
  id: string;
  title: string;
  description: string;
  image_url: string;
  categories: {
    id: string;
    title: string;
    description: string;
    image_url: string;
  }[];
}

export interface StartExploringResponse {
  superCategories: StartExploringCategory[];
}

// Get data for Start Exploring section (6 super categories with 4 categories each)
export const getStartExploringData =
  async (): Promise<StartExploringResponse | null> => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<StartExploringResponse>
      >("/public/start-exploring");

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.error(
          "Failed to fetch start exploring data:",
          response.data.message
        );
        return null;
      }
    } catch (error) {
      console.error("Get start exploring data error:", error);
      return null;
    }
  };

// ================================================================
// CONVENIENCE FUNCTIONS FOR HIERARCHICAL TREE APIs
// ================================================================

// Get navbar data with default settings
export const getNavbarHierarchy =
  async (): Promise<HierarchicalTreeResponse | null> => {
    return getHierarchicalCategoryTree({
      startLevel: "super-category",
      depth: 3,
      trending: false,
    });
  };

// Get simplified navbar (categories and subcategories only)
export const getSimplifiedNavbar =
  async (): Promise<HierarchicalTreeResponse | null> => {
    return getHierarchicalCategoryTree({
      startLevel: "category",
      depth: 2,
      trending: false,
    });
  };

// Get trending navbar sections
export const getTrendingNavbar = async (
  depth: number = 2
): Promise<HierarchicalTreeResponse | null> => {
  return getHierarchicalCategoryTree({
    startLevel: "super-category",
    depth,
    trending: true,
  });
};

// Get category page with products
export const getCategoryPageData = async (
  categoryId: string,
  productLimit: number = 6
): Promise<HierarchicalTreeWithProductsResponse | null> => {
  return getHierarchicalCategoryTreeWithProducts({
    startLevel: "category",
    parentId: categoryId,
    depth: 3,
    productLimit,
  });
};

// Get super-category page with all products
export const getSuperCategoryPageData = async (
  superCategoryId: string,
  productLimit: number = 6
): Promise<HierarchicalTreeWithProductsResponse | null> => {
  return getHierarchicalCategoryTreeWithProducts({
    startLevel: "super-category",
    parentId: superCategoryId,
    depth: 4,
    productLimit,
  });
};

// Get trending products showcase
export const getTrendingProductsShowcase = async (
  productLimit: number = 4
): Promise<HierarchicalTreeWithProductsResponse | null> => {
  return getHierarchicalCategoryTreeWithProducts({
    trending: true,
    productLimit,
    depth: 4,
  });
};

// Get breadcrumb data from any level
export const getBreadcrumbData = async (
  categoryId: string,
  categoryType: "super-category" | "category" | "sub-category"
): Promise<HierarchicalTreeResponse | null> => {
  return getHierarchicalCategoryTree({
    startLevel: categoryType,
    parentId: categoryId,
    depth: 1,
  });
};

// Get mobile sidebar data (simplified structure)
export const getMobileSidebarData =
  async (): Promise<HierarchicalTreeResponse | null> => {
    return getHierarchicalCategoryTree({
      startLevel: "category",
      depth: 2,
      trending: false,
    });
  };

// ================================================================
// UTILITY FUNCTIONS FOR HIERARCHICAL TREE DATA
// ================================================================

// Find a specific category in the tree
export const findCategoryInTree = (
  tree: CategoryTreeNode[],
  categoryId: string
): CategoryTreeNode | null => {
  for (const node of tree) {
    if (node.id === categoryId) {
      return node;
    }

    // Search in categories
    if (node.categories) {
      const found = findCategoryInTree(node.categories, categoryId);
      if (found) return found;
    }

    // Search in subCategories
    if (node.subCategories) {
      const found = findCategoryInTree(node.subCategories, categoryId);
      if (found) return found;
    }
  }

  return null;
};

// Get all products from a tree node
export const getAllProductsFromTree = (tree: CategoryTreeNode[]): Product[] => {
  const products: Product[] = [];

  const extractProducts = (nodes: CategoryTreeNode[]) => {
    for (const node of nodes) {
      if (node.products) {
        products.push(...node.products);
      }

      if (node.categories) {
        extractProducts(node.categories);
      }

      if (node.subCategories) {
        extractProducts(node.subCategories);
      }
    }
  };

  extractProducts(tree);
  return products;
};

// Get category path (breadcrumb) from tree
export const getCategoryPath = (
  tree: CategoryTreeNode[],
  targetCategoryId: string
): CategoryTreeNode[] => {
  const path: CategoryTreeNode[] = [];

  const findPath = (
    nodes: CategoryTreeNode[],
    currentPath: CategoryTreeNode[]
  ): boolean => {
    for (const node of nodes) {
      const newPath = [...currentPath, node];

      if (node.id === targetCategoryId) {
        path.push(...newPath);
        return true;
      }

      if (node.categories && findPath(node.categories, newPath)) {
        return true;
      }

      if (node.subCategories && findPath(node.subCategories, newPath)) {
        return true;
      }
    }

    return false;
  };

  findPath(tree, []);
  return path;
};

// Count total categories in tree
export const countCategoriesInTree = (
  tree: CategoryTreeNode[]
): {
  superCategories: number;
  categories: number;
  subCategories: number;
  totalProducts: number;
} => {
  let superCategories = 0;
  let categories = 0;
  let subCategories = 0;
  let totalProducts = 0;

  const countNodes = (nodes: CategoryTreeNode[]) => {
    for (const node of nodes) {
      switch (node.category_type) {
        case "super-category":
          superCategories++;
          break;
        case "category":
          categories++;
          break;
        case "sub-category":
          subCategories++;
          break;
      }

      if (node.products) {
        totalProducts += node.products.length;
      }

      if (node.categories) {
        countNodes(node.categories);
      }

      if (node.subCategories) {
        countNodes(node.subCategories);
      }
    }
  };

  countNodes(tree);

  return {
    superCategories,
    categories,
    subCategories,
    totalProducts,
  };
};

// ================================================================
// NEW FEATURED CATEGORIES API
// ================================================================

// Interface for featured categories response
export interface FeaturedCategory {
  id: string;
  title: string;
  description: string;
  image_url: string;
  caption: string;
  category_type: "category";
  collection_type: "Manual" | "Smart";
  subCategories: FeaturedSubCategory[];
}

export interface FeaturedSubCategory {
  id: string;
  title: string;
  description: string;
  image_url: string;
  caption: string;
  category_type: "sub-category";
  collection_type: "Manual" | "Smart";
}

export interface FeaturedCategoriesResponse {
  trending: boolean;
  totalCategories: number;
  categories: FeaturedCategory[];
}

// GET FEATURED CATEGORIES - NEW API
export const getFeaturedCategories = async (
  trending: boolean = false
): Promise<FeaturedCategoriesResponse | null> => {
  try {
    const params = trending ? { trending: "true" } : {};

    const response = await axiosInstance.get<
      ApiResponse<FeaturedCategoriesResponse>
    >("/user/category/featured-categories", {
      params,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error(
        "Failed to fetch featured categories:",
        response.data.message
      );
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Failed to fetch featured categories";

    console.error("Get featured categories error:", error);

    // Show error to user only if it's not a trending request with no results
    if (!(trending && axiosError.response?.status === 404)) {
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

// CONVENIENCE FUNCTIONS FOR FEATURED CATEGORIES

// Get featured categories for homepage/explore sections
export const getHomepageFeaturedCategories =
  async (): Promise<FeaturedCategoriesResponse | null> => {
    return getFeaturedCategories(false);
  };

// Get trending featured categories
export const getTrendingFeaturedCategories =
  async (): Promise<FeaturedCategoriesResponse | null> => {
    return getFeaturedCategories(true);
  };
