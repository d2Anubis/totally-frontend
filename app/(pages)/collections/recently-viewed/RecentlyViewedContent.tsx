"use client";

import { useState, useEffect } from "react";
import { CategorySidebar } from "@/app/components/category/CategorySidebar";
import CategoryProductGrid from "@/app/components/category/CategoryProductGrid";
import Pagination from "@/app/components/category/Pagination";
import {
  getRecentlyViewedProducts,
  RecentlyViewedItem,
} from "@/app/lib/services/productService";
import { useAuth } from "@/app/context/AuthContext";

export interface FilterState {
  priceRange: string;
  rating: string;
  isQuickShip: boolean;
  isSale: boolean;
  brands?: string[];
  priceFrom?: string;
  priceTo?: string;
  inStock?: boolean;
  outStock?: boolean;
}

export default function RecentlyViewedContent() {
  const { isLoggedIn } = useAuth();

  // State for products and loading
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<
    RecentlyViewedItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters, sorting, and pagination
  const [filters, setFilters] = useState<FilterState>({
    priceRange: "",
    rating: "",
    isQuickShip: false,
    isSale: false,
    brands: [],
  });
  const [sortOption, setSortOption] = useState("recently-viewed");
  const [currentPage, setCurrentPage] = useState(1);

  const PRODUCTS_PER_PAGE = 12;

  // Fetch recently viewed products from API
  useEffect(() => {
    // Only fetch if user is logged in
    if (!isLoggedIn) {
      setLoading(false);
      setError("Please log in to view your recently viewed products");
      return;
    }

    const fetchRecentlyViewed = async () => {
      try {
        setLoading(true);
        const items = await getRecentlyViewedProducts(100); // Get more items for pagination

        if (items) {
          setRecentlyViewedItems(items);
        } else {
          setRecentlyViewedItems([]);
        }
      } catch (err) {
        setError("Failed to load recently viewed products");
        console.error("Error fetching recently viewed products:", err);
        setRecentlyViewedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [isLoggedIn]);

  // Transform recently viewed items to CategoryProduct format
  const getAllTransformedProducts = () => {
    return recentlyViewedItems.map((item, index) => {
      // The item is already the product data from the new backend format
      const product = item;

      return {
        id: 8000 + index, // Convert to number (use index-based numbering for compatibility)
        apiProductId: product.id, // Store original API product ID for cart functionality
        title: product.title,
        imageUrl: product.imageUrl || "/images/common/product.png", // Use imageUrl directly from backend
        price: product.price || 0, // Backend now returns properly rounded prices
        originalPrice: product.originalPrice, // Use backend's originalPrice calculation
        discount: product.discount || undefined, // Use backend's discount calculation, convert null to undefined
        url: product.url || `/product/${product.slug}/?productid=${product.id}`, // Use backend's URL or fallback
        brand: product.brand || "Unknown Brand", // Use actual brand field
        rating: product.rating || 0, // Use backend rating
        isQuickShip: product.isQuickShip, // Use backend's isQuickShip calculation
        isSale: product.isSale, // Use backend's isSale calculation
        inStock: product.inStock, // Use backend's inStock calculation
        variant_id: product.variant_id || undefined, // Include variant_id from backend, convert null to undefined
        option_values: product.option_values || undefined, // Include option_values for variant selection, convert null to undefined
        categorySlug: "recently-viewed", // Add for compatibility
        subcategories: [], // API doesn't provide this
      };
    });
  };

  // Apply filters to products
  const getFilteredProducts = () => {
    let filteredProducts = getAllTransformedProducts();

    // Apply brand filter
    if (filters.brands && filters.brands.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        filters.brands!.includes(product.brand)
      );
    }

    // Apply price filter
    if (filters.priceFrom || filters.priceTo) {
      const minPrice = filters.priceFrom ? parseInt(filters.priceFrom) : 0;
      const maxPrice = filters.priceTo ? parseInt(filters.priceTo) : Infinity;
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );
    }

    // Apply QuickShip filter
    if (filters.isQuickShip) {
      filteredProducts = filteredProducts.filter(
        (product) => product.isQuickShip
      );
    }

    // Apply Sale filter
    if (filters.isSale) {
      filteredProducts = filteredProducts.filter((product) => product.isSale);
    }

    // Apply availability filter
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(
        (product) => product.isQuickShip // Use isQuickShip which represents stock availability
      );
    }

    if (filters.outStock) {
      filteredProducts = filteredProducts.filter(
        (product) => !product.isQuickShip // Use !isQuickShip which represents out of stock
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case "rating":
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case "recently-viewed":
      default:
        // Keep original order (most recently viewed first)
        break;
    }

    return filteredProducts;
  };

  // Get filtered products count for pagination
  const getFilteredProductsCount = () => {
    return getFilteredProducts().length;
  };

  const totalProducts = getFilteredProductsCount();
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Get paginated products
  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const filteredProducts = getFilteredProducts();
    return filteredProducts.slice(startIndex, endIndex);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort changes
  const handleSortChange = (option: string) => {
    setSortOption(option);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="py-0 md:py-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Loading recently viewed products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state or not logged in
  if (!isLoggedIn) {
    return (
      <div className="py-0 md:py-8">
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              {!isLoggedIn ? (
                <svg
                  className="w-16 h-16 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-16 h-16 mx-auto text-red-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {!isLoggedIn ? "Login Required" : "Error Loading Products"}
            </h3>
            <p className="text-gray-600 mb-6">
              {!isLoggedIn
                ? "Please log in to view your recently viewed products and continue shopping where you left off."
                : error ||
                  "Failed to load recently viewed products. Please try again later."}
            </p>
            {!isLoggedIn ? (
              <a
                href="/login"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Login Now
              </a>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state with a nice message
  if (recentlyViewedItems.length === 0) {
    return (
      <div className="py-0 md:py-8">
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Recently Viewed Products
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring our amazing collection! Products you view will
              appear here for easy access later.
            </p>
            <a
              href="/categories"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-0 md:py-8">
      {/* Recently Viewed Header */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-black">Recently Viewed</h1>
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            👁️ {totalProducts} {totalProducts === 1 ? "Product" : "Products"}
          </span>
        </div>
        <p className="text-gray-600 mt-2">
          Continue shopping from where you left off. Browse through products
          you&apos;ve recently viewed.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Sidebar - Left Column */}
        <div className="lg:w-1/4">
          <CategorySidebar
            products={getAllTransformedProducts()}
            filters={filters}
            onFilterChange={handleFilterChange}
            sortOption={sortOption}
            onSortChange={handleSortChange}
            apiProducts={recentlyViewedItems.map((item) => ({
              id: item.id,
              stock_qty: item.isQuickShip ? 100 : 0, // Use isQuickShip as stock indicator
              brand: item.brand,
              inStock: item.inStock,
            }))}
          />
        </div>

        {/* Main Content - Right Column */}
        <div className="lg:w-3/4">
          {/* Products Grid */}
          <CategoryProductGrid
            products={getPaginatedProducts()}
            filters={filters}
            sortOption={sortOption}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* No products message after filtering */}
          {totalProducts === 0 && recentlyViewedItems.length > 0 && (
            <div className="bg-white p-8 rounded-xl text-center">
              <p className="title-3-semibold text-gray-10">
                No products match your current filters
              </p>
              <p className="small-medium text-gray-10 mt-2">
                Try adjusting your filters to see more recently viewed products
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
