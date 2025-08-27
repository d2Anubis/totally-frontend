"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CategoryProduct } from "@/app/data/categoryProducts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faTimes,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { userBannerService, Banner } from "@/app/lib/services/bannerService";
import PriceDisplay from "@/app/components/common/PriceDisplay";

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

const adsBanner = [
  {
    id: 1,
    image: "/images/category/ads-5.png",
    alt: "Ads one",
  },
  {
    id: 2,
    image: "/images/category/ads-2.png",
    alt: "Ads Two",
  },
  {
    id: 3,
    image: "/images/category/ads-5.png",
    alt: "Ads Three",
  },
];

interface CategorySidebarProps {
  products: CategoryProduct[];
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
  sortOption: string;
  onSortChange: (option: string) => void;
  apiProducts?: Array<{
    id: string;
    stock_qty: number;
    brand?: string;
    inStock?: boolean;
  }>;
  stockCounts?: {
    inStock: number;
    outOfStock: number;
  };
  availableBrands?: Array<{
    name: string;
    count: number;
  }>;
}

export const CategorySidebar = ({
  products,
  onFilterChange,
  filters,
  sortOption,
  onSortChange,
  apiProducts,
  stockCounts,
  availableBrands = [],
}: CategorySidebarProps) => {
  // Track expanded/collapsed state of each section
  const [expandedSections, setExpandedSections] = useState({
    sortBy: true,
    brands: true,
    price: true,
    availability: true,
    ads: true,
  });

  // Track which popup is open (for mobile)
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // State for category banners
  const [categoryBanners, setCategoryBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get unique brands from backend data (preferred) or calculate from current products
  const brandCounts: Record<string, number> = {};

  if (availableBrands && availableBrands.length > 0) {
    // Use brands from backend with their actual counts
    availableBrands.forEach((brand) => {
      brandCounts[brand.name] = brand.count;
    });
  } else {
    // Fallback to calculating from current products
    products.forEach((product) => {
      if (brandCounts[product.brand]) {
        brandCounts[product.brand]++;
      } else {
        brandCounts[product.brand] = 1;
      }
    });
  }

  // Use provided stock counts if available, otherwise calculate from current products
  const inStockCount = stockCounts
    ? stockCounts.inStock
    : apiProducts
    ? apiProducts.filter((product) => product.inStock).length
    : products.filter((product) => product.inStock).length;
  const outStockCount = stockCounts
    ? stockCounts.outOfStock
    : apiProducts
    ? apiProducts.filter((product) => !product.inStock).length
    : products.length - inStockCount;

  // Get highest price for range - add a small buffer to avoid edge cases
  const highestPrice =
    Math.max(...products.map((product) => product.price), 0) + 100;

  // State for price range slider
  const [priceRange, setPriceRange] = useState({
    from: filters.priceFrom ? parseInt(filters.priceFrom) : 0,
    to: filters.priceTo ? parseInt(filters.priceTo) : highestPrice,
  });

  // State for brands and availability
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    filters.brands || []
  );
  const [availability, setAvailability] = useState({
    inStock: filters.inStock || false,
    outStock: filters.outStock || false,
  });

  const [showMoreBrands, setShowMoreBrands] = useState(false);

  // The brands to display (limit to 5 if not showing more)
  const brandsToDisplay = showMoreBrands
    ? Object.keys(brandCounts)
    : Object.keys(brandCounts).slice(0, 5);

  // Fetch category banners from API
  useEffect(() => {
    const fetchCategoryBanners = async () => {
      try {
        setBannersLoading(true);
        // Fetch all category banner sections
        const [bannerOne, bannerTwo, bannerThree] = await Promise.all([
          userBannerService.getCategoryBannerOne(),
          userBannerService.getCategoryBannerTwo(),
          userBannerService.getCategoryBannerThree(),
        ]);

        const allBanners: Banner[] = [];

        // Collect active banners from all sections
        if (bannerOne.success) {
          allBanners.push(
            ...bannerOne.data.banners.filter((banner) => banner.is_active)
          );
        }
        if (bannerTwo.success) {
          allBanners.push(
            ...bannerTwo.data.banners.filter((banner) => banner.is_active)
          );
        }
        if (bannerThree.success) {
          allBanners.push(
            ...bannerThree.data.banners.filter((banner) => banner.is_active)
          );
        }

        setCategoryBanners(allBanners);
      } catch (err) {
        console.error("Error fetching category banners:", err);
        // Check if it's an authentication error
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            console.log(
              "Category banner API requires authentication, using fallback banners"
            );
          }
        }
        setCategoryBanners([]); // Fallback to empty array (will use default banners)
      } finally {
        setBannersLoading(false);
      }
    };

    fetchCategoryBanners();
  }, []);

  // Update states when filters change externally
  useEffect(() => {
    setSelectedBrands(filters.brands || []);
    setPriceRange({
      from: filters.priceFrom ? parseInt(filters.priceFrom) : 0,
      to: filters.priceTo ? parseInt(filters.priceTo) : highestPrice,
    });
    setAvailability({
      inStock: filters.inStock || false,
      outStock: filters.outStock || false,
    });
  }, [filters, highestPrice]);

  // Force re-render when currency changes
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleCurrencyChange = () => {
      forceUpdate({});
    };

    // Listen for currency change events
    window.addEventListener("currencyChanged", handleCurrencyChange);
    window.addEventListener("locationPricingReady", handleCurrencyChange);

    return () => {
      window.removeEventListener("currencyChanged", handleCurrencyChange);
      window.removeEventListener("locationPricingReady", handleCurrencyChange);
    };
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setActivePopup(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle opening popup
  const handleOpenPopup = (popupName: string) => {
    setActivePopup(activePopup === popupName ? null : popupName);
  };

  // Handle brand filter change
  const handleBrandChange = (brand: string) => {
    const updatedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];

    setSelectedBrands(updatedBrands);

    // Update main filters with new brands
    onFilterChange({
      ...filters,
      brands: updatedBrands,
    });
  };

  // Handle price slider change
  const handlePriceFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPriceRange({
      ...priceRange,
      from: value > priceRange.to ? priceRange.to : value,
    });
  };

  const handlePriceToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPriceRange({
      ...priceRange,
      to: value < priceRange.from ? priceRange.from : value,
    });
  };

  // Apply price filter when slider is released
  const handlePriceBlur = () => {
    onFilterChange({
      ...filters,
      priceFrom: priceRange.from.toString(),
      priceTo: priceRange.to.toString(),
    });
  };

  // Handle availability change
  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    const updatedAvailability = {
      ...availability,
      [name]: checked,
    };

    setAvailability(updatedAvailability);

    onFilterChange({
      ...filters,
      [name]: checked,
    });
  };

  return (
    <>
      {/* Mobile Filter Buttons */}
      <div className="md:hidden w-full overflow-x-auto scrollbar-hide mb-3">
        <div className="flex space-x-2 py-2 px-2">
          <button
            onClick={() => handleOpenPopup("sortBy")}
            className={`whitespace-nowrap flex items-center justify-center border-2 rounded-lg border-blue-00 px-2 py-1`}
          >
            <FontAwesomeIcon icon={faArrowUp} className="text-blue-00" />
            <FontAwesomeIcon icon={faArrowDown} className="text-blue-00" />
          </button>

          <button
            onClick={() => handleOpenPopup("brands")}
            className={`whitespace-nowrap flex items-center justify-center border rounded-lg bg-blue-00 px-4 py-2 ${
              activePopup === "brands"
                ? "border-blue-00 text-white"
                : "border-blue-00 text-white"
            }`}
          >
            <span>Brands</span>
            {selectedBrands.length > 0 && (
              <span className="ml-1 bg-blue-00 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {selectedBrands.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleOpenPopup("price")}
            className={`whitespace-nowrap flex items-center justify-center border rounded-lg bg-blue-00 px-4 py-2 ${
              activePopup === "brands"
                ? "border-blue-00 text-white"
                : "border-blue-00 text-white"
            }`}
          >
            <span>Price</span>
            {(priceRange.from > 0 || priceRange.to < highestPrice) && (
              <span className="ml-1 bg-blue-00 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                1
              </span>
            )}
          </button>

          <button
            onClick={() => handleOpenPopup("availability")}
            className={`whitespace-nowrap flex items-center justify-center border rounded-lg bg-blue-00 px-4 py-2 ${
              activePopup === "brands"
                ? "border-blue-00 text-white"
                : "border-blue-00 text-white"
            }`}
          >
            <span>Availability</span>
            {(availability.inStock || availability.outStock) && (
              <span className="ml-1 bg-blue-00 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                1
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Filter Popups */}
      {activePopup && (
        <div
          className="md:hidden fixed bottom-[49px] inset-0 z-50 flex items-end"
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <div
            ref={popupRef}
            className="bg-white w-full rounded-t-2xl px-4 py-3 transform transition-transform duration-300 ease-in-out"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="title-1-semibold text-blue-00">
                {activePopup === "sortBy" && "Sort By"}
                {activePopup === "brands" && "Brands"}
                {activePopup === "price" && "Price Range"}
                {activePopup === "availability" && "Availability"}
              </h3>
              <button onClick={() => setActivePopup(null)} className="p-1">
                <FontAwesomeIcon icon={faTimes} className="text-gray-10" />
              </button>
            </div>

            {/* Sort By Options */}
            {activePopup === "sortBy" && (
              <div className="space-y-3">
                {[
                  "popularity",
                  "price-asc",
                  "price-desc",
                  "discount",
                  "rating",
                  "name-asc",
                  "name-desc",
                ].map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="radio"
                      id={`sort-${option}`}
                      name="sort-option"
                      checked={sortOption === option}
                      onChange={() => onSortChange(option)}
                      className="w-4 h-4 text-blue-00 border-gray-40 rounded-full"
                    />
                    <label
                      htmlFor={`sort-${option}`}
                      className="ml-2 body-large-medium text-gray-10"
                    >
                      {option === "popularity" && "Popularity"}
                      {option === "price-asc" && "Price: Low to High"}
                      {option === "price-desc" && "Price: High to Low"}
                      {option === "discount" && "Discount: High to Low"}
                      {option === "rating" && "Rating: High to Low"}
                      {option === "name-asc" && "A to Z"}
                      {option === "name-desc" && "Z to A"}
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => setActivePopup(null)}
                  className="w-full py-2 mt-4 bg-blue-00 text-white rounded-lg body-large-semibold"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Brand Options */}
            {activePopup === "brands" && (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                {Object.keys(brandCounts).map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`mobile-brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="w-4 h-4 text-blue-00 border-gray-40 rounded"
                    />
                    <label
                      htmlFor={`mobile-brand-${brand}`}
                      className="ml-2 body-large-medium text-gray-10"
                    >
                      {brand} ({brandCounts[brand]})
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => setActivePopup(null)}
                  className="w-full py-2 mt-4 bg-blue-00 text-white rounded-lg body-large-semibold"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Price Range */}
            {activePopup === "price" && (
              <div className="mt-4 mb-2">
                <div className="flex justify-between mb-1">
                  <span className="small text-gray-10">
                    <PriceDisplay
                      inrPrice={Math.round(priceRange.from)}
                      className=""
                      showLoading={false}
                    />
                  </span>
                  <span className="small text-gray-10">
                    <PriceDisplay
                      inrPrice={Math.round(priceRange.to)}
                      className=""
                      showLoading={false}
                    />
                  </span>
                </div>

                {/* Price Range Container */}
                <div className="price-range-container h-6">
                  {/* Slider Track */}
                  <div className="price-range-track"></div>

                  {/* Active Range Indicator */}
                  <div
                    className="price-range-progress"
                    style={{
                      left: `${(priceRange.from / highestPrice) * 100}%`,
                      width: `${
                        ((priceRange.to - priceRange.from) / highestPrice) * 100
                      }%`,
                    }}
                  ></div>

                  {/* Min Price Slider */}
                  <input
                    type="range"
                    min={0}
                    max={highestPrice}
                    value={priceRange.from}
                    onChange={handlePriceFromChange}
                    onMouseUp={handlePriceBlur}
                    onTouchEnd={handlePriceBlur}
                    className="price-range-input"
                  />

                  {/* Max Price Slider */}
                  <input
                    type="range"
                    min={0}
                    max={highestPrice}
                    value={priceRange.to}
                    onChange={handlePriceToChange}
                    onMouseUp={handlePriceBlur}
                    onTouchEnd={handlePriceBlur}
                    className="price-range-input"
                  />
                </div>

                {/* Price input fields */}
                <div className="grid grid-cols-2 justify-between gap-4 w-full">
                  <div className="flex flex-col">
                    <label className="body-medium text-gray-10 mb-1">
                      From
                    </label>
                    <input
                      type="number"
                      value={priceRange.from}
                      onChange={handlePriceFromChange}
                      onBlur={handlePriceBlur}
                      className="border border-gray-40 rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="body-medium text-gray-10 mb-1">To</label>
                    <input
                      type="number"
                      value={priceRange.to}
                      onChange={handlePriceToChange}
                      onBlur={handlePriceBlur}
                      className="border border-gray-40 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setActivePopup(null)}
                  className="w-full py-2 mt-5 bg-blue-00 text-white rounded-lg body-large-semibold"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Availability */}
            {activePopup === "availability" && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mobile-inStock"
                    name="inStock"
                    checked={availability.inStock}
                    onChange={handleAvailabilityChange}
                    className="w-4 h-4 text-blue-00 border-gray-40 rounded"
                  />
                  <label
                    htmlFor="mobile-inStock"
                    className="ml-2 body-large-medium text-gray-10"
                  >
                    In Stock (94)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mobile-outStock"
                    name="outStock"
                    checked={availability.outStock}
                    onChange={handleAvailabilityChange}
                    className="w-4 h-4 text-blue-00 border-gray-40 rounded"
                  />
                  <label
                    htmlFor="mobile-outStock"
                    className="ml-2 body-large-medium text-gray-10"
                  >
                    Out Stock (1)
                  </label>
                </div>
                <button
                  onClick={() => setActivePopup(null)}
                  className="w-full py-2 mt-4 bg-blue-00 text-white rounded-lg body-large-semibold"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-full bg-white rounded-xl px-4">
        {/* Filter Header */}
        <div className="border-b border-blue-00 py-3">
          <h3 className="text-blue-00 title-1-semibold">Filter :</h3>
        </div>

        {/* Sort Options - Added to Sidebar */}
        <div className="py-3 border-b border-blue-00">
          <div className="flex items-center justify-between mb-2">
            <h3 className="title-1-semibold text-blue-00">Sort By</h3>
            <button
              className="text-blue-00 transition-transform duration-200"
              onClick={() => toggleSection("sortBy")}
              aria-label={
                expandedSections.sortBy
                  ? "Collapse sort options"
                  : "Expand sort options"
              }
            >
              <FontAwesomeIcon
                icon={expandedSections.sortBy ? faChevronUp : faChevronDown}
                className="h-3 w-3"
              />
            </button>
          </div>
          {expandedSections.sortBy && (
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full border border-gray-40 rounded px-2 py-1.5 small text-gray-10 focus:outline-none appearance-none"
              >
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Discount: High to Low</option>
                <option value="rating">Rating: High to Low</option>
                <option value="name-asc">A to Z</option>
                <option value="name-desc">Z to A</option>
              </select>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-00 w-3 h-3"
              />
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="py-3 border-b border-gray-40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="title-1-semibold text-blue-00">Brands</h3>
            <button
              className="text-blue-00 transition-transform duration-200"
              onClick={() => toggleSection("brands")}
              aria-label={
                expandedSections.brands
                  ? "Collapse brand filters"
                  : "Expand brand filters"
              }
            >
              <FontAwesomeIcon
                icon={expandedSections.brands ? faChevronUp : faChevronDown}
                className="h-3 w-3"
              />
            </button>
          </div>
          {expandedSections.brands && (
            <div className="space-y-2.5">
              {brandsToDisplay.map((brand) => (
                <div key={brand} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="w-4 h-4 text-blue-00 border-gray-40 rounded"
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="ml-2 body-large-medium text-gray-10"
                  >
                    {brand} ({brandCounts[brand]})
                  </label>
                </div>
              ))}
              {Object.keys(brandCounts).length > 5 && (
                <button
                  onClick={() => setShowMoreBrands(!showMoreBrands)}
                  className="body-large-medium text-blue-00 flex items-center mt-1"
                >
                  <span className="mr-1">+</span>
                  {showMoreBrands ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Price Filter - Updated with sliders using global classes */}
        <div className="py-3 border-b border-blue-00">
          <div className="flex items-center justify-between mb-2">
            <h3 className="title-1-semibold text-blue-00">Price</h3>
            <button
              className="text-blue-00 transition-transform duration-200"
              onClick={() => toggleSection("price")}
              aria-label={
                expandedSections.price
                  ? "Collapse price filter"
                  : "Expand price filter"
              }
            >
              <FontAwesomeIcon
                icon={expandedSections.price ? faChevronUp : faChevronDown}
                className="h-3 w-3"
              />
            </button>
          </div>

          {expandedSections.price && (
            <div className="mt-4 mb-2">
              <div className="flex justify-between mb-1">
                <span className="small text-gray-10">
                  <PriceDisplay
                    inrPrice={Math.round(priceRange.from)}
                    className=""
                    showLoading={false}
                  />
                </span>
                <span className="small text-gray-10">
                  <PriceDisplay
                    inrPrice={Math.round(priceRange.to)}
                    className=""
                    showLoading={false}
                  />
                </span>
              </div>

              {/* Price Range Container using global classes */}
              <div className="price-range-container h-12">
                {/* Slider Track */}
                <div className="price-range-track"></div>

                {/* Active Range Indicator */}
                <div
                  className="price-range-progress"
                  style={{
                    left: `${(priceRange.from / highestPrice) * 100}%`,
                    width: `${
                      ((priceRange.to - priceRange.from) / highestPrice) * 100
                    }%`,
                  }}
                ></div>

                {/* Min Price Slider */}
                <input
                  type="range"
                  min={0}
                  max={highestPrice}
                  value={priceRange.from}
                  onChange={handlePriceFromChange}
                  onMouseUp={handlePriceBlur}
                  onTouchEnd={handlePriceBlur}
                  className="price-range-input"
                />

                {/* Max Price Slider */}
                <input
                  type="range"
                  min={0}
                  max={highestPrice}
                  value={priceRange.to}
                  onChange={handlePriceToChange}
                  onMouseUp={handlePriceBlur}
                  onTouchEnd={handlePriceBlur}
                  className="price-range-input"
                />
              </div>

              {/* Price display */}
              <p className="small text-gray-10 mt-6 text-center">
                Price Range:{" "}
                <PriceDisplay
                  inrPrice={Math.round(priceRange.from)}
                  className=""
                  showLoading={false}
                />{" "}
                -{" "}
                <PriceDisplay
                  inrPrice={Math.round(priceRange.to)}
                  className=""
                  showLoading={false}
                />
              </p>
            </div>
          )}
        </div>

        {/* Availability Section */}
        <div className="py-3 border-b border-blue-00">
          <div className="flex items-center justify-between mb-2">
            <h3 className="title-1-semibold text-blue-00 mt-10">
              Availability
            </h3>
            <button
              className="text-blue-00 transition-transform duration-200"
              onClick={() => toggleSection("availability")}
              aria-label={
                expandedSections.availability
                  ? "Collapse availability options"
                  : "Expand availability options"
              }
            >
              <FontAwesomeIcon
                icon={
                  expandedSections.availability ? faChevronUp : faChevronDown
                }
                className="h-3 w-3"
              />
            </button>
          </div>
          {expandedSections.availability && (
            <div className="space-y-2.5">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  name="inStock"
                  checked={availability.inStock}
                  onChange={handleAvailabilityChange}
                  className="w-4 h-4 text-blue-00 border-gray-40 rounded"
                />
                <label
                  htmlFor="inStock"
                  className="ml-2 body-large-medium text-gray-10"
                >
                  In Stock ({inStockCount})
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="outStock"
                  name="outStock"
                  checked={availability.outStock}
                  onChange={handleAvailabilityChange}
                  className="w-4 h-4 text-blue-00 border-gray-40 rounded"
                />
                <label
                  htmlFor="outStock"
                  className="ml-2 body-large-medium text-gray-10"
                >
                  Out of Stock ({outStockCount})
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Promotional Banners */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <h3 className="title-1-semibold text-blue-00">Promotions</h3>
            <button
              className="text-blue-00 transition-transform duration-200"
              onClick={() => toggleSection("ads")}
              aria-label={
                expandedSections.ads
                  ? "Collapse promotions"
                  : "Expand promotions"
              }
            >
              <FontAwesomeIcon
                icon={expandedSections.ads ? faChevronUp : faChevronDown}
                className="h-3 w-3"
              />
            </button>
          </div>
          {expandedSections.ads && (
            <div className="pt-2">
              {bannersLoading ? (
                // Loading state
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div
                      key={`loading-${index}`}
                      className="w-full h-[150px] bg-gray-200 animate-pulse rounded-lg"
                    >
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-sm">Loading...</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : categoryBanners.length > 0 ? (
                // API banners
                categoryBanners.flatMap((banner) =>
                  banner.images.desktop.map((desktopImage, index) => {
                    // Handle banner click
                    const handleBannerClick = () => {
                      if (banner.url) {
                        // Check if it's an external URL
                        if (
                          banner.url.startsWith("http://") ||
                          banner.url.startsWith("https://")
                        ) {
                          window.open(
                            banner.url,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        } else {
                          // Internal route - use window.location
                          window.location.href = banner.url;
                        }
                      }
                    };

                    return (
                      <div
                        key={`${banner.id}-${index}`}
                        className="rounded-lg overflow-hidden mb-4"
                      >
                        <div
                          className={`w-full h-auto ${
                            banner.url ? "cursor-pointer" : ""
                          }`}
                          onClick={banner.url ? handleBannerClick : undefined}
                        >
                          <picture>
                            <source
                              media="(max-width: 768px)"
                              srcSet={
                                banner.images.mobile[index] ||
                                banner.images.mobile[0] ||
                                desktopImage
                              }
                            />
                            <Image
                              src={desktopImage}
                              alt={banner.title}
                              width={120}
                              height={1000}
                              className="w-full h-auto object-cover"
                              onError={(e) => {
                                console.error(
                                  "Category banner image failed to load:",
                                  e.currentTarget.src
                                );
                                // Fallback to default image
                                e.currentTarget.src =
                                  "/images/category/ads-5.png";
                              }}
                            />
                          </picture>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                // Fallback to default banners
                adsBanner.map((ad) => (
                  <div key={ad.id} className="rounded-lg overflow-hidden mb-4">
                    <Image
                      src={ad.image}
                      alt={ad.alt}
                      width={120}
                      height={100}
                      className="w-full h-[150px] object-cover"
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};
