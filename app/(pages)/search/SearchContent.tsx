"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { CategorySidebar } from "@/app/components/category/CategorySidebar";
import CategoryProductGrid from "@/app/components/category/CategoryProductGrid";
import Pagination from "@/app/components/category/Pagination";
import {
  universalSearch,
  SearchResult,
  SearchSummary,
  CategoryResult,
  ProductResult,
  getNavigationUrl,
  getResultImage,
  SearchOptions,
} from "@/app/lib/services/searchService";

// Helper function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

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

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("q") || "";

  // State for search results
  const [searchProducts, setSearchProducts] = useState<SearchResult[]>([]);
  const [searchCategories, setSearchCategories] = useState<SearchResult[]>([]);
  const [searchSummary, setSearchSummary] = useState<SearchSummary | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stockCounts, setStockCounts] = useState<{
    inStock: number;
    outOfStock: number;
  }>({ inStock: 0, outOfStock: 0 });
  const [searchResultFilters, setSearchResultFilters] = useState<{
    brands?: Array<{
      name: string;
      count: number;
    }>;
  }>({});

  // State for filters, sorting, and pagination
  const [filters, setFilters] = useState<FilterState>({
    priceRange: "",
    rating: "",
    isQuickShip: false,
    isSale: false,
    brands: [],
  });
  const [sortOption, setSortOption] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);

  const PRODUCTS_PER_PAGE = 12;

  // Fetch search results when query, page, filters, or sort changes
  const fetchResults = useCallback(
    async (isFilterOperation: boolean = false) => {
      if (!searchQuery.trim()) {
        router.push("/");
        return;
      }

      try {
        if (isFilterOperation) {
          setFilterLoading(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Prepare search options with filters
        const searchOptions: SearchOptions = {
          brands: filters.brands || [],
          priceFrom: filters.priceFrom,
          priceTo: filters.priceTo,
          inStock: filters.inStock,
          outStock: filters.outStock,
          sortBy: sortOption === "relevance" ? undefined : sortOption,
        };

        const result = await universalSearch(
          searchQuery.trim(),
          currentPage,
          PRODUCTS_PER_PAGE,
          searchOptions
        );

        if (result.error) {
          setError(result.error);
          setSearchProducts([]);
          setSearchCategories([]);
          setSearchSummary(null);
          setTotalPages(1);
          setStockCounts({ inStock: 0, outOfStock: 0 });
        } else {
          console.log("Search results received:", result);
          setSearchProducts(result.products || []);
          setSearchCategories(result.categories || []);
          setSearchSummary(result.summary);

          console.log("Products in results:", result.products?.length || 0);
          console.log("Categories in results:", result.categories?.length || 0);
          console.log("API Summary:", result.summary);

          // Use pagination data from new API structure
          if (result.pagination) {
            setTotalPages(result.pagination.totalPages);
          } else {
            // Fallback
            const totalProductsFromSummary =
              result.summary?.products_count || 0;
            setTotalPages(
              Math.ceil(totalProductsFromSummary / PRODUCTS_PER_PAGE)
            );
          }

          // Set stock counts from filters data for sidebar
          if (result.filters?.availability) {
            setStockCounts({
              inStock: result.filters.availability.in_stock || 0,
              outOfStock: result.filters.availability.out_of_stock || 0,
            });
          }

          // Store filters for sidebar brands
          setSearchResultFilters({
            brands: result.filters?.brands || [],
          });
        }
      } catch (err) {
        setError("Failed to load search results");
        console.error("Error fetching search results:", err);
        setSearchProducts([]);
        setSearchCategories([]);
        setSearchSummary(null);
        setTotalPages(1);
        setStockCounts({ inStock: 0, outOfStock: 0 });
      } finally {
        if (isFilterOperation) {
          setFilterLoading(false);
        } else {
          setLoading(false);
        }
      }
    },
    [searchQuery, currentPage, router, filters, sortOption]
  );

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Transform search products to common format for compatibility with existing components
  const getTransformedProducts = () => {
    return searchProducts.map((result) => {
      // Cast to ProductResult since searchProducts only contains products
      const productResult = result as ProductResult;

      return {
        id: Math.floor(Math.random() * 100000), // Use random number for interface compatibility
        title: productResult.name,
        imageUrl: productResult.image || "/images/common/product.png",
        price: productResult.price || 0,
        originalPrice:
          productResult.compare_price &&
          productResult.compare_price > productResult.price
            ? productResult.compare_price
            : undefined,
        discount:
          productResult.compare_price &&
          productResult.compare_price > productResult.price
            ? Math.round(
                ((productResult.compare_price - productResult.price) /
                  productResult.compare_price) *
                  100
              )
            : undefined,
        url: getNavigationUrl(productResult),
        apiProductId: productResult.id, // Use the actual product ID for cart operations
        brand: productResult.brand || "Unknown Brand",
        rating: 0, // Default rating since it's not in ProductResult interface
        isQuickShip: productResult.is_quickship || productResult.stock > 0,
        isSale: !!(
          productResult.compare_price &&
          productResult.compare_price > productResult.price
        ),
        categorySlug: "search-results",
        subcategories: [],
        variant_id: productResult.variant_id, // Use the variant_id from backend
      };
    });
  };

  // Handle filter changes - now refetch with filters (backend filtering) with filter loading
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchResults(true); // Pass isFilterOperation=true
  };

  // Handle sort changes - now refetch with sorting (backend filtering) with filter loading
  const handleSortChange = (option: string) => {
    setSortOption(option);
    setCurrentPage(1); // Reset to first page when sort changes
    fetchResults(true); // Pass isFilterOperation=true
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-00 mr-3"></div>
          <p className="text-gray-500">Searching...</p>
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

  // Show no query state
  if (!searchQuery.trim()) {
    return (
      <div className="py-0 md:py-8">
        <div className="flex items-center justify-center py-16">
          <p className="text-gray-500">Please enter a search term</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-0 md:py-8">
      {/* Search Results Header - Similar to Category Header */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="title-1 md:text-3xl font-bold text-black">
            Search Results
          </h1>
        </div>
        {searchSummary && (
          <div className="md:mt-2">
            <p className="text-gray-600">
              Found{" "}
              {searchSummary.products_count + searchSummary.categories_count}{" "}
              results for &quot;
              {searchSummary.search_term}&quot;
            </p>
          </div>
        )}
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
            apiProducts={searchProducts.map((r) => {
              const productResult = r as SearchResult & {
                variant_id?: string;
              };
              return {
                id: productResult.variant_id || r.id, // Use variant_id if available, fallback to product ID
                stock_qty: r.type === "product" ? r.stock : 0,
                brand: r.type === "product" ? r.brand : undefined,
                inStock: r.type === "product" ? r.stock > 0 : false,
              };
            })}
            stockCounts={stockCounts}
            availableBrands={searchResultFilters.brands || []}
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

          {/* Categories Section - Only show if there are categories */}
          {searchCategories.length > 0 && (
            <div className="bg-white p-4 md:p-6 rounded-xl mt-6">
              <h2 className="text-xl font-semibold text-black mb-4">
                Related Categories ({searchCategories.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchCategories.map((category) => {
                  // Cast to CategoryResult to access category-specific properties
                  const categoryResult = category as CategoryResult;
                  return (
                    <div
                      key={category.id}
                      onClick={() => {
                        const url = getNavigationUrl(category);
                        router.push(url);
                      }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Image
                            src={getResultImage(category)}
                            alt={category.name}
                            width={48}
                            height={48}
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-black truncate">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {stripHtmlTags(category.description)}
                            </p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-blue-600 capitalize">
                              {categoryResult.category_type.replace("-", " ")}
                            </span>
                            {categoryResult.parent_category && (
                              <span className="text-xs text-gray-400 ml-2">
                                in {categoryResult.parent_category.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* No results message - Only show if no products AND no categories found */}
          {/* CategoryProductGrid already handles the "No products found" case, so we only need to handle the case where there are no results at all */}
        </div>
      </div>
    </div>
  );
}
