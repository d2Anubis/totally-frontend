"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategorySidebar } from "@/app/components/category/CategorySidebar";
import CategoryProductGrid from "@/app/components/category/CategoryProductGrid";
import Pagination from "@/app/components/category/Pagination";
import { getCategoryBySlug, Subcategory } from "@/app/data/categories";
import { getProductsBySubcategory } from "@/app/data/categoryProducts";
import {
  getProductsByAnyCategory,
  UnifiedCategoryResponse,
} from "@/app/lib/services/collectionService";

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

interface SubcategoryContentProps {
  categorySlug: string;
  subcategorySlug: string;
}

export default function SubcategoryContent({
  categorySlug,
  subcategorySlug,
}: SubcategoryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get subcategory data from API using query parameters
  const subcategoryId = searchParams?.get("id") || null;
  const subcategoryName = searchParams?.get("subcategory") || null;
  const categoryType = searchParams?.get("type") as
    | "super-category"
    | "category"
    | "sub-category"
    | null;

  // Check if this is being used as a category page (from super category navigation)
  const isActingAsCategoryPage =
    categoryType === "category" && subcategorySlug === "all";

  // Fallback to slug-based data if no query params (for backward compatibility)
  const category = getCategoryBySlug(categorySlug);
  const subcategory = category?.subcategories?.find(
    (sub: Subcategory) => sub.slug === subcategorySlug
  );
  const allProducts = getProductsBySubcategory(categorySlug, subcategorySlug);

  // State for API data
  const [apiData, setApiData] = useState<UnifiedCategoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for filters, sorting, and pagination
  const [filters, setFilters] = useState<FilterState>({
    priceRange: "",
    rating: "",
    isQuickShip: false,
    isSale: false,
    brands: [],
  });
  const [sortOption, setSortOption] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [stockCounts, setStockCounts] = useState<{
    inStock: number;
    outOfStock: number;
  }>({ inStock: 0, outOfStock: 0 });

  const PRODUCTS_PER_PAGE = 20;

  // Fetch data from API
  const fetchSubcategoryData = useCallback(
    async (
      page: number = 1,
      currentFilters: FilterState = filters,
      currentSort: string = sortOption,
      isFilterOperation: boolean = false
    ) => {
      if (!subcategoryId) return;

      try {
        if (isFilterOperation) {
          setFilterLoading(true);
        } else {
          setLoading(true);
        }
        console.log("Fetching subcategory data with:", {
          subcategoryId,
          categoryType,
          subcategoryName,
          categorySlug,
          subcategorySlug,
          page,
          isActingAsCategoryPage,
          filters: currentFilters,
          sortBy: currentSort,
        });

        // Use the correct type for API call
        const apiType = isActingAsCategoryPage
          ? "category"
          : categoryType || "sub-category";

        const data = await getProductsByAnyCategory(subcategoryId, {
          page,
          limit: PRODUCTS_PER_PAGE,
          type: apiType,
          // Pass filter parameters to backend
          brands: currentFilters.brands,
          priceFrom: currentFilters.priceFrom,
          priceTo: currentFilters.priceTo,
          inStock: currentFilters.inStock,
          outStock: currentFilters.outStock,
          sortBy: currentSort,
        });

        console.log("Subcategory API response:", data);

        if (data) {
          setApiData(data);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalProducts(data.pagination?.totalProducts || 0);

          // Set stock counts from filters data for sidebar
          if (data.filters?.availability) {
            setStockCounts({
              inStock: data.filters.availability.in_stock || 0,
              outOfStock: data.filters.availability.out_of_stock || 0,
            });
          } else {
            setStockCounts({ inStock: 0, outOfStock: 0 });
          }
        } else {
          console.warn("No data returned from subcategory API");
          setStockCounts({ inStock: 0, outOfStock: 0 });
        }
      } catch (err) {
        setError("Failed to load subcategory data");
        console.error("Error fetching subcategory data:", err);
        setStockCounts({ inStock: 0, outOfStock: 0 });
      } finally {
        if (isFilterOperation) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }
      }
    },
    [
      subcategoryId,
      categoryType,
      isActingAsCategoryPage,
      categorySlug,
      subcategoryName,
      subcategorySlug,
      filters,
      sortOption,
    ]
  ); // Dependencies for useCallback

  // Initial fetch
  useEffect(() => {
    fetchSubcategoryData(currentPage);
  }, [fetchSubcategoryData, currentPage]);

  // Transform API products to common format - no client-side filtering needed since backend handles it
  const getTransformedProducts = () => {
    if (apiData && apiData.products) {
      return apiData.products.map((product) => {
        // Handle null prices by providing fallbacks
        const safePrice = product.price || 0;

        // Cast to any to access backend-provided properties
        const productData = product as any;
        const safeOriginalPrice = productData.originalPrice || 0;

        return {
          id: parseInt(product.id) || Math.random(),
          title: product.title || "Untitled Product",
          imageUrl: productData.imageUrl || "/images/product-404.png", // Backend provides imageUrl directly
          price: safePrice, // Use safe price (never null)
          originalPrice:
            safeOriginalPrice > safePrice ? safeOriginalPrice : undefined,
          discount: productData.discount || undefined, // Backend provides calculated discount
          url: productData.url || `/product/${product.id}`,
          apiProductId: product.id,
          brand: product.brand || "Unknown Brand",
          rating: productData.rating || 0, // Backend provides rating, default to 0
          isQuickShip: productData.isQuickShip || false,
          isSale: productData.isSale || false, // Backend provides isSale
          categorySlug: categorySlug,
          subcategories: [],
          variant_id:
            (product as { variant_id?: string }).variant_id || undefined, // Include variant_id from backend
          option_values:
            (product as { option_values?: { [key: string]: string } })
              .option_values || undefined, // Include option_values for variant selection
        };
      });
    }

    return [];
  };

  // Handle filter changes - now triggers backend API call with filter loading
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchSubcategoryData(1, newFilters, sortOption, true); // Pass isFilterOperation=true
  };

  // Handle sort changes - now triggers backend API call with filter loading
  const handleSortChange = (option: string) => {
    setSortOption(option);
    setCurrentPage(1); // Reset to first page when sort changes
    fetchSubcategoryData(1, filters, option, true); // Pass isFilterOperation=true
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Redirect to category if subcategory not found (only for local data)
  useEffect(() => {
    if (!subcategoryId && !subcategory && !isActingAsCategoryPage) {
      router.push(`/category/${categorySlug}`);
    }
  }, [
    subcategoryId,
    subcategory,
    router,
    categorySlug,
    isActingAsCategoryPage,
  ]);

  // Show loading state
  if (loading) {
    return (
      <div className="py-0 md:py-8">
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">
            Loading {isActingAsCategoryPage ? "category" : "subcategory"}...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-0 md:py-8">
        <div className="flex items-center justify-center py-16">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Show loading or null while redirecting (only for local data)
  if (!subcategoryId && !subcategory && !isActingAsCategoryPage) {
    return null;
  }

  // Get display name - prefer API data, fallback to local data
  const displayName =
    apiData?.category?.title ||
    subcategoryName ||
    subcategory?.name ||
    (isActingAsCategoryPage ? "Category" : "Subcategory");

  return (
    <div className="">
      {/* Category/Subcategory Title */}
      <div className="flex items-center bg-white rounded-xl p-4 mb-6">
        <span className="text-black title-2 heading-2-semibold">
          {displayName}
        </span>
        <span className="ml-4 text-gray-500">({totalProducts} products)</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Sidebar - Left Column */}
        <div className="lg:w-1/4">
          <CategorySidebar
            products={getTransformedProducts()}
            filters={filters}
            onFilterChange={handleFilterChange}
            sortOption={sortOption}
            onSortChange={handleSortChange}
            apiProducts={apiData ? apiData.products : undefined}
            stockCounts={stockCounts}
            availableBrands={apiData?.filters?.brands || []}
          />
        </div>

        {/* Main Content - Right Column */}
        <div className="lg:w-3/4">
          {/* Products Grid */}
          <CategoryProductGrid
            products={getTransformedProducts()}
            filters={filters}
            sortOption={sortOption}
            loading={filterLoading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
