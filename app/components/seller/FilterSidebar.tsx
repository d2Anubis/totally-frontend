"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import PriceDisplay from "@/app/components/common/PriceDisplay";
import { usePricingStatus } from "@/app/components/common/LocationPricingInitializer";

interface FilterSidebarProps {
  filterOptions: {
    brands: { name: string; count: number }[];
    highestPrice: number;
    availability: { name: string; count: number }[];
  };
  selectedBrands: string[];
  priceRange: { min: string; max: string };
  availability: string[];
  onBrandChange: (brand: string) => void;
  onPriceChange: (type: "min" | "max", value: string) => void;
  onAvailabilityChange: (option: string) => void;
}

const FilterSidebar = ({
  filterOptions,
  selectedBrands,
  priceRange,
  availability: selectedAvailability,
  onBrandChange,
  onPriceChange,
  onAvailabilityChange,
}: FilterSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    price: true,
    availability: true,
  });

  // Get pricing status to know when currency is ready
  const { isReady } = usePricingStatus();

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-4">
      <h2 className="title-3 mb-4">Filter :</h2>

      {/* Brands Filter */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection("brands")}
        >
          <h3 className="title-4-semibold">Brands</h3>
          <FontAwesomeIcon
            icon={expandedSections.brands ? faChevronUp : faChevronDown}
            className="text-gray-30"
          />
        </div>

        {expandedSections.brands && (
          <div className="space-y-2">
            {filterOptions.brands.map((brand) => (
              <div key={brand.name} className="flex items-center">
                <input
                  type="checkbox"
                  id={`brand-${brand.name}`}
                  className="mr-2 h-4 w-4 accent-blue-00"
                  checked={selectedBrands.includes(brand.name)}
                  onChange={() => onBrandChange(brand.name)}
                />
                <label
                  htmlFor={`brand-${brand.name}`}
                  className="small-medium text-gray-10 flex-1 cursor-pointer"
                >
                  {brand.name}
                </label>
                <span className="xsmall text-gray-20">({brand.count})</span>
              </div>
            ))}
            {filterOptions.brands.length > 4 && (
              <button className="text-blue-00 small-medium mt-2">
                Show more
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection("price")}
        >
          <h3 className="title-4-semibold">Price</h3>
          <FontAwesomeIcon
            icon={expandedSections.price ? faChevronUp : faChevronDown}
            className="text-gray-30"
          />
        </div>

        {expandedSections.price && (
          <div>
            <p className="small-medium text-gray-10 mb-2">
              The highest price is{" "}
              {!isReady ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <PriceDisplay
                  inrPrice={filterOptions.highestPrice}
                  className="font-semibold"
                  showLoading={true}
                />
              )}
            </p>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                placeholder="From"
                className="flex-1 border border-gray-40 rounded p-2 small-medium"
                value={priceRange.min}
                onChange={(e) => onPriceChange("min", e.target.value)}
              />
              <span className="text-gray-30">to</span>
              <input
                type="number"
                placeholder="To"
                className="flex-1 border border-gray-40 rounded p-2 small-medium"
                value={priceRange.max}
                onChange={(e) => onPriceChange("max", e.target.value)}
              />
            </div>

            {/* Price Range Display */}
            <div className="mt-3">
              <p className="small-medium text-gray-10 text-center">
                Price Range:{" "}
                {!isReady ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    <PriceDisplay
                      inrPrice={Number(priceRange.min) || 0}
                      className="font-semibold"
                      showLoading={false}
                    />
                    {" - "}
                    <PriceDisplay
                      inrPrice={
                        Number(priceRange.max) || filterOptions.highestPrice
                      }
                      className="font-semibold"
                      showLoading={false}
                    />
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection("availability")}
        >
          <h3 className="title-4-semibold">Availability</h3>
          <FontAwesomeIcon
            icon={expandedSections.availability ? faChevronUp : faChevronDown}
            className="text-gray-30"
          />
        </div>

        {expandedSections.availability && (
          <div className="space-y-2">
            {filterOptions.availability.map((option) => (
              <div key={option.name} className="flex items-center">
                <input
                  type="checkbox"
                  id={`availability-${option.name}`}
                  className="mr-2 h-4 w-4 accent-blue-00"
                  checked={selectedAvailability.includes(option.name)}
                  onChange={() => onAvailabilityChange(option.name)}
                />
                <label
                  htmlFor={`availability-${option.name}`}
                  className="small-medium text-gray-10 flex-1 cursor-pointer"
                >
                  {option.name}
                </label>
                <span className="xsmall text-gray-20">({option.count})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
