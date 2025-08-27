"use client";

import { useState, useEffect } from "react";
import { CategorySidebar } from "@/app/components/category/CategorySidebar";
import CategoryProductGrid from "@/app/components/category/CategoryProductGrid";
import Pagination from "@/app/components/category/Pagination";
import {
  getAllProducts,
  Product as ApiProduct,
} from "@/app/lib/services/productService";

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

export default function NewArrivalsContent() {
  // State for products and loading
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
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
  const [sortOption, setSortOption] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);

  const PRODUCTS_PER_PAGE = 12;

  // Fetch all products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiResponse = await getAllProducts();

        if (apiResponse && apiResponse.products) {
          // Filter for active products and sort by creation date (newest first)
          const activeProducts = apiResponse.products
            .filter((product: ApiProduct) => product.status === "active")
            .sort(
              (a: ApiProduct, b: ApiProduct) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

          setAllProducts(activeProducts);
        }
      } catch (err) {
        setError("Failed to load new arrivals");
        console.error("Error fetching new arrivals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Transform API products to CategoryProduct format (same as CategoryContent)
  const getAllTransformedProducts = () => {
    return allProducts.map((product, index) => ({
      id: 9000 + index, // Convert to number (use index-based numbering for compatibility)
      title: product.title,
      imageUrl:
        product.image_urls && product.image_urls.length > 0
          ? product.image_urls[0].url
          : "/images/common/product.png", // Use first image or fallback to placeholder
      price: product.price,
      originalPrice:
        product.compare_price && product.compare_price > product.price
          ? product.compare_price
          : undefined, // Only show original price if it's actually higher
      discount:
        product.compare_price && product.compare_price > product.price
          ? Math.round(
              ((product.compare_price - product.price) /
                product.compare_price) *
                100
            )
          : undefined, // Only calculate discount if compare_price is actually higher
      url: (() => {
        // Create slug from product title
        const createSlug = (title: string): string => {
          return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        };
        const slug = product.page_url || createSlug(product.title);
        return `/product/${slug}/?productid=${product.id}`;
      })(), // Use slug in URL path and productid in query
      brand: product.brand || "Unknown Brand", // Use actual brand field
      rating: product.rating || 0, // API doesn't provide this, using placeholder
      isQuickShip: product.stock_qty > 0, // Use stock availability
      isSale: !!(
        product.compare_price && product.compare_price > product.price
      ), // Only mark as sale if there's actually a discount
      categorySlug: "new-arrivals", // Add for compatibility
      subcategories: [], // API doesn't provide this
      variant_id: product.variant_id || undefined, // Include variant_id from backend
    }));
  };

  // Apply filters to products (same logic as CategoryContent)
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
      filteredProducts = filteredProducts.filter((product) => {
        const apiProduct = allProducts.find(
          (p) =>
            `/product/${p.id}` === product.url ||
            `/product/${p.page_url}` === product.url
        );
        return apiProduct ? apiProduct.stock_qty > 0 : true;
      });
    }

    if (filters.outStock) {
      filteredProducts = filteredProducts.filter((product) => {
        const apiProduct = allProducts.find(
          (p) =>
            `/product/${p.id}` === product.url ||
            `/product/${p.page_url}` === product.url
        );
        return apiProduct ? apiProduct.stock_qty === 0 : false;
      });
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
      case "name-asc":
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Keep original order (newest first for new arrivals)
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

  // Handle filter changes (same as CategoryContent)
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
          <p className="text-gray-500">Loading new arrivals...</p>
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

  return (
    <div className="py-0 md:py-8">
      {/* New Arrivals Header (matching category page style) */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-black">New Arrivals</h1>
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            ✨ Latest
          </span>
        </div>
        <p className="text-gray-600 mt-2">
          Discover our latest collection of authentic Indian products, carefully
          curated just for you.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Sidebar - Left Column (exactly like CategoryContent) */}
        <div className="lg:w-1/4">
          <CategorySidebar
            products={getAllTransformedProducts()}
            filters={filters}
            onFilterChange={handleFilterChange}
            sortOption={sortOption}
            onSortChange={handleSortChange}
            apiProducts={allProducts}
          />
        </div>

        {/* Main Content - Right Column (exactly like CategoryContent) */}
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

          {/* No products message (exactly like CategoryContent) */}
          {totalProducts === 0 && (
            <div className="bg-white p-8 rounded-xl text-center">
              <p className="title-3-semibold text-gray-10">
                No products found in this collection
              </p>
              <p className="small-medium text-gray-10 mt-2">
                Please check back later for new arrivals
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
