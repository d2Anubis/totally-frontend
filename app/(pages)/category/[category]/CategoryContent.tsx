"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryHeader from "@/app/components/category/CategoryHeader";
import { CategorySidebar } from "@/app/components/category/CategorySidebar";
import CategoryProductGrid from "@/app/components/category/CategoryProductGrid";
import Pagination from "@/app/components/category/Pagination";
import { getCategoryBySlug } from "@/app/data/categories";
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

interface CategoryContentProps {
  categorySlug: string;
  categoryType?: "category" | "super-category"; // Add type parameter
}

export default function CategoryContent({
  categorySlug,
  categoryType = "category", // Default to category for backward compatibility
}: CategoryContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get query parameters
  const categoryId = searchParams?.get("id");
  const categoryName = searchParams?.get("category");
  const trending = searchParams?.get("trending") === "true";

  // State for API data (using unified API)
  const [apiData, setApiData] = useState<UnifiedCategoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stockCounts, setStockCounts] = useState<{
    inStock: number;
    outOfStock: number;
  }>({ inStock: 0, outOfStock: 0 });

  // Filters and pagination state
  const [filters, setFilters] = useState<FilterState>({
    priceRange: "",
    rating: "",
    isQuickShip: false,
    isSale: false,
  });
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fallback to static data (for backward compatibility)
  const category = getCategoryBySlug(categorySlug);

  // Fetch category data from API
  const fetchCategoryData = useCallback(
    async (
      page: number = 1,
      currentFilters: FilterState = filters,
      currentSort: string = sortOption,
      isFilterOperation: boolean = false
    ) => {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      try {
        if (isFilterOperation) {
          setFilterLoading(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Use the unified API with type parameter and filter parameters
        const data = await getProductsByAnyCategory(categoryId, {
          page,
          limit: 20,
          trending,
          type: categoryType,
          // Pass filter parameters to backend
          brands: currentFilters.brands,
          priceFrom: currentFilters.priceFrom,
          priceTo: currentFilters.priceTo,
          inStock: currentFilters.inStock,
          outStock: currentFilters.outStock,
          sortBy: currentSort,
        });

        if (data) {
          setApiData(data);
          setTotalProducts(data.pagination.totalProducts);
          setTotalPages(data.pagination.totalPages);

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
          setError("Failed to load category data");
          setStockCounts({ inStock: 0, outOfStock: 0 });
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError("Failed to load category data");
        setStockCounts({ inStock: 0, outOfStock: 0 });
      } finally {
        if (isFilterOperation) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }
      }
    },
    [categoryId, trending, categoryType, filters, sortOption]
  ); // Dependencies for useCallback

  // Initial fetch and refetch when page changes or dependencies change
  useEffect(() => {
    fetchCategoryData(currentPage);
  }, [fetchCategoryData, currentPage]); // Add fetchCategoryData to dependencies

  // Update page title when API data loads
  useEffect(() => {
    if (apiData?.category?.title) {
      const typeLabel =
        categoryType === "super-category" ? "Super Category" : "Category";
      const title = trending
        ? `${apiData.category.title} - Trending - Totally Indian`
        : `${apiData.category.title} - Totally Indian`;
      document.title = title;
    } else if (categoryName) {
      const title = trending
        ? `${categoryName} - Trending - Totally Indian`
        : `${categoryName} - Totally Indian`;
      document.title = title;
    } else if (category) {
      document.title = `${category.name} - Totally Indian`;
    }
  }, [apiData, categoryName, trending, category, categoryType]);

  // Redirect to home if no category data found (after loading is complete)
  useEffect(() => {
    if (!loading && !apiData && !categoryId && !category) {
      router.push("/");
    }
  }, [loading, apiData, categoryId, category, router]);

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
    fetchCategoryData(1, newFilters, sortOption, true); // Pass isFilterOperation=true
  };

  // Handle sort changes - now triggers backend API call with filter loading
  const handleSortChange = (option: string) => {
    setSortOption(option);
    setCurrentPage(1); // Reset to first page when sort changes
    fetchCategoryData(1, filters, option, true); // Pass isFilterOperation=true
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="py-0 md:py-8">
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">Loading category...</p>
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

  // Use API category data if available, otherwise fallback to slug data
  const categoryData = apiData?.category || category;
  const categoryTitle =
    categoryName ||
    (categoryData && "title" in categoryData
      ? categoryData.title
      : categoryData?.name) ||
    "Category";

  return (
    <div className="py-0 md:py-8">
      {/* Category Header Section - Show for both regular categories and super categories */}

      {/* API Category Header (if using API data) */}
      {apiData && (
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="title-1 md:text-3xl font-bold text-black">
              {categoryTitle}
            </h1>
            {trending && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                🔥 Trending
              </span>
            )}
            <span className="text-gray-500">({totalProducts} products)</span>
          </div>
          {apiData.category.description && (
            <p
              className="text-gray-600 md:mt-2"
              dangerouslySetInnerHTML={{ __html: apiData.category.description }}
            />
          )}
        </div>
      )}
      {(category || apiData) && (
        <CategoryHeader
          category={
            category || {
              id: parseInt(apiData?.category?.id || "0") || 0,
              name: categoryTitle,
              slug: categorySlug,
              description: apiData?.category?.description || "",
              imageUrl: apiData?.category?.image_url || "",
              subcategories: [],
            }
          }
          relatedCategories={apiData?.relatedCategories || []}
          categoryType={categoryType}
          categorySlug={categorySlug}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Sidebar - Left Column */}
        <div className="lg:w-1/4">
          <CategorySidebar
            products={getTransformedProducts()}
            filters={filters}
            onFilterChange={handleFilterChange}
            sortOption={sortOption}
            onSortChange={handleSortChange}
            apiProducts={apiData?.products}
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
