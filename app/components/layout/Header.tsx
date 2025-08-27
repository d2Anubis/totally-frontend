"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import navigationData from "../../data/navigation.json";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  universalSearch,
  SearchResult,
  SearchSummary,
  getNavigationUrl as getSearchNavigationUrl,
  formatPrice,
  calculateDiscount,
  getResultImage,
} from "../../lib/services/searchService";
import {
  getCustomNavigation,
  CustomNavigationTree,
  NavigationNode,
  getNavigationUrl,
  getSubcategoryUrl,
} from "../../lib/services/navigationService";
import {
  SUPPORTED_CURRENCIES,
  isValidCurrency,
} from "../../lib/services/currencyService";
import {
  setPricingContext,
  getPricingContext,
} from "../../lib/services/locationPricingService";
import {
  saveSelectedCurrencyData,
  getSelectedCurrencyData,
} from "../../lib/services/currencyService";

// Helper function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

// Country to currency mapping with flag-icons country codes
const COUNTRY_CURRENCY_MAP = [
  { code: "IN", name: "India", currency: "INR", flag: "in" },
  { code: "US", name: "United States", currency: "USD", flag: "us" },
  { code: "CA", name: "Canada", currency: "CAD", flag: "ca" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "gb" },
  { code: "DE", name: "Germany", currency: "EUR", flag: "de" },
  { code: "FR", name: "France", currency: "EUR", flag: "fr" },
  { code: "IT", name: "Italy", currency: "EUR", flag: "it" },
  { code: "ES", name: "Spain", currency: "EUR", flag: "es" },
  { code: "NL", name: "Netherlands", currency: "EUR", flag: "nl" },
  { code: "CH", name: "Switzerland", currency: "CHF", flag: "ch" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", flag: "ae" },
  { code: "JP", name: "Japan", currency: "JPY", flag: "jp" },
  { code: "AU", name: "Australia", currency: "AUD", flag: "au" },
  { code: "NZ", name: "New Zealand", currency: "NZD", flag: "nz" },
];

const Header = () => {
  const { header } = navigationData;
  const { cartCount, wishlistCount } = useShop();
  const { isLoggedIn, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  // Currency state
  const [selectedCountry, setSelectedCountry] = useState<
    (typeof COUNTRY_CURRENCY_MAP)[0] | null
  >(null);
  const [tempSelectedCountry, setTempSelectedCountry] = useState<
    (typeof COUNTRY_CURRENCY_MAP)[0] | null
  >(null); // For mobile selection before continue
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false); // For screens >= 1200px
  const [currencyInitialized, setCurrencyInitialized] = useState(false);

  // API data state
  const [customNavigationData, setCustomNavigationData] =
    useState<CustomNavigationTree | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Detect if it's desktop or mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
      setShowSearchDropdown(window.innerWidth >= 1200); // xl breakpoint for search dropdown
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Initialize currency based on device type
  useEffect(() => {
    const initializeCurrency = async () => {
      // First check if we have saved currency data (for both desktop and mobile)
      const savedCurrencyData = getSelectedCurrencyData();
      if (savedCurrencyData) {
        const savedCountry = COUNTRY_CURRENCY_MAP.find(
          (country) => country.currency === savedCurrencyData.currency
        );
        if (savedCountry) {
          setSelectedCountry(savedCountry);
          setCurrencyInitialized(true);
          return;
        }
      }

      if (isDesktop) {
        // Desktop: Use IP-based detection (already handled by LocationPricingInitializer)
        try {
          const context = getPricingContext();

          if (context && context.userCurrency) {
            // Find the country that matches the detected currency
            const detectedCountry = COUNTRY_CURRENCY_MAP.find(
              (country) => country.currency === context.userCurrency
            );
            if (detectedCountry) {
              setSelectedCountry(detectedCountry);
              setCurrencyInitialized(true);
              return;
            }
          }
        } catch (error) {
          console.error("Failed to get pricing context:", error);
        }
      } else {
        // Mobile: Check localStorage for saved preference
        const savedCountry = localStorage.getItem("selected_country");

        if (savedCountry) {
          try {
            const country = JSON.parse(savedCountry);
            setSelectedCountry(country);
            // Set the pricing context for mobile
            setPricingContext(country.name, country.currency);
            setCurrencyInitialized(true);
            return;
          } catch (error) {
            console.error("Failed to parse saved country:", error);
          }
        }
      }

      // Fallback to India if no valid country found
      const indiaCountry = COUNTRY_CURRENCY_MAP[0]; // India
      setSelectedCountry(indiaCountry);
      setCurrencyInitialized(true);
    };

    initializeCurrency();
  }, [isDesktop]);

  // Handle country selection in mobile dropdown (temporary selection)
  const handleCountrySelect = async (
    country: (typeof COUNTRY_CURRENCY_MAP)[0]
  ) => {
    // Check if the currency is supported
    if (!isValidCurrency(country.currency)) {
      // Find USD country (United States)
      const usdCountry = COUNTRY_CURRENCY_MAP.find((c) => c.currency === "USD");
      if (usdCountry) {
        country = usdCountry;
      }
    }

    if (isDesktop) {
      // Desktop: Apply immediately and close dropdown
      setSelectedCountry(country);
      setShowCurrencyDropdown(false);

      // Update pricing context
      setPricingContext(country.name, country.currency);

      // Save currency conversion data to localStorage
      await saveSelectedCurrencyData(country.currency);

      // Force refresh of all PriceDisplay components
      window.dispatchEvent(
        new CustomEvent("currencyChanged", {
          detail: {
            currency: country.currency,
            country: country.code,
          },
        })
      );

      // Reload page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } else {
      // Mobile: Store temporarily, wait for continue button
      setTempSelectedCountry(country);
    }
  };

  // Handle continue button click (mobile only)
  const handleContinueClick = async () => {
    if (!tempSelectedCountry) return;

    try {
      // Apply the selection
      setSelectedCountry(tempSelectedCountry);

      // Save preference to localStorage
      localStorage.setItem(
        "selected_country",
        JSON.stringify(tempSelectedCountry)
      );

      // Update pricing context
      setPricingContext(tempSelectedCountry.name, tempSelectedCountry.currency);

      // Save currency conversion data to localStorage
      await saveSelectedCurrencyData(tempSelectedCountry.currency);

      // Force refresh of all PriceDisplay components by dispatching a custom event
      window.dispatchEvent(
        new CustomEvent("currencyChanged", {
          detail: {
            currency: tempSelectedCountry.currency,
            country: tempSelectedCountry.code,
          },
        })
      );

      // Close dropdown and reset temp selection
      setShowCurrencyDropdown(false);
      setTempSelectedCountry(null);

      // Reload page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } catch (error) {
      console.error("Failed to apply currency selection:", error);
    }
  };

  // Filter countries to only show those with supported currencies
  const supportedCountries = COUNTRY_CURRENCY_MAP.filter((country) =>
    SUPPORTED_CURRENCIES.includes(country.currency)
  );

  // Filter countries based on search query
  const filteredCountries = supportedCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
      country.currency.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  // Search dropdown state
  const [selectedSearchOption, setSelectedSearchOption] =
    useState("Everywhere");

  // Universal search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSummary, setSearchSummary] = useState<SearchSummary | null>(
    null
  );
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Touch gesture tracking for mobile search
  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Fetch custom navigation data on component mount
  useEffect(() => {
    const fetchNavigationData = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCustomNavigation();
        if (data && data.success) {
          console.log("Custom navigation data received:", data);
          console.log("Total navigation nodes:", data.data?.length || 0);

          // Log navigation structure
          const navigationStructure = data.data?.map((node) => ({
            title: node.title,
            type: node.category_type,
            childrenCount: node.children?.length || 0,
          }));
          console.log("Navigation structure:", navigationStructure);

          setCustomNavigationData(data);
          console.log("Custom navigation data loaded successfully");
        } else {
          console.warn("No custom navigation data returned from API");
          setCustomNavigationData({ success: false, data: [] });
        }
      } catch (error) {
        console.error("Error fetching custom navigation data:", error);
        // Set empty data structure to prevent crashes
        setCustomNavigationData({ success: false, data: [] });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchNavigationData();
  }, []);

  // Helper function to get super categories from custom navigation data
  const getSuperCategories = (): NavigationNode[] => {
    if (!customNavigationData?.data) return [];

    // Filter for super-category level nodes
    const superCategories = customNavigationData.data.filter(
      (node) => node.category_type === "super-category"
    );

    return superCategories;
  };

  // Helper function to get categories for a super category
  const getCategoriesForSuperCategory = (
    superCategoryId: string
  ): NavigationNode[] => {
    if (!customNavigationData?.data) return [];

    const superCategory = customNavigationData.data.find(
      (node) => node.id === superCategoryId
    );
    if (!superCategory || !superCategory.children) return [];

    // Return only the first 4 categories to avoid layout overlap
    return superCategory.children.slice(0, 4);
  };

  // Use the navigation URL functions from the service
  const getCategoryUrl = (node: NavigationNode): string => {
    return getNavigationUrl(node);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close account dropdown when clicking outside
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }

      // Close currency dropdown when clicking outside
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyDropdown(false);
      }

      // Desktop search dropdown - only close when clicking outside on desktop
      if (window.innerWidth >= 768) {
        if (
          searchRef.current &&
          !searchRef.current.contains(event.target as Node)
        ) {
          setShowSearchResults(false);
        }
      }
      // Mobile search - NEVER close on click outside, only via clear button
    };

    const handleTouchStart = (event: TouchEvent) => {
      // For mobile devices, check if we're in the mobile search area
      if (window.innerWidth < 768) {
        const mobileSearchContainer = mobileSearchRef.current;
        if (
          mobileSearchContainer &&
          mobileSearchContainer.contains(event.target as Node)
        ) {
          // If touch is within mobile search area, don't close anything
          return;
        }
      }

      // Close account dropdown when touching outside
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }

      // Close currency dropdown when touching outside
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyDropdown(false);
      }

      // Mobile search - NEVER auto-close on touch outside
      // Only manual close via clear button is allowed
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleTouchStart);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // Debounced search functionality
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setSearchSummary(null);
      // Only auto-close on empty query for desktop, not mobile during typing
      if (window.innerWidth >= 768) {
        setShowSearchResults(false);
      }
      return;
    }

    if (searchQuery.trim().length < 2) {
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // For header dropdown, limit to 8-10 results total for preview
        const result = await universalSearch(searchQuery.trim(), 1, 10);
        setSearchResults(result.results);
        setSearchSummary(result.summary);
        setShowSearchResults(result.results.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setSearchSummary(null);
        // Only auto-close on error for desktop
        if (window.innerWidth >= 768) {
          setShowSearchResults(false);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    // Close mobile menu when navigating to a new page
    setMobileMenuOpen(false);
  }, [pathname]);

  // Reset touch state when search dropdown closes
  useEffect(() => {
    if (!showSearchResults) {
      setTouchStart(null);
      setIsScrolling(false);
    }
  }, [showSearchResults]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  // Filter navigation items based on login status
  const filteredNavigation = header.userNavigation.filter((item) => {
    if (!isLoggedIn && (item.title === "Wishlist" || item.title === "Order")) {
      return false;
    }
    return true;
  });

  // Helper function to check if a tab is active
  const isOrdersTabActive = () => {
    return pathname === "/account" && searchParams?.get("tab") === "orders";
  };

  const isAccountActive = () => {
    return (
      (pathname === "/account" && searchParams?.get("tab") !== "orders") ||
      pathname === "/login"
    );
  };

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Handle search result click
  const handleSearchResultClick = (
    result: SearchResult,
    e?: React.MouseEvent
  ) => {
    console.log("Search result clicked (general handler):", result);
    console.log("Result type:", result.type);
    console.log("Result ID:", result.id);
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const url = getSearchNavigationUrl(result);
    console.log("Generated URL (general handler):", url);
    setShowSearchResults(false);
    setSearchQuery("");
    console.log("Navigating to (general handler):", url);
    router.push(url);
  };

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Always redirect to search page when Enter is pressed
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  // Mobile-specific search close function - only allow explicit closes
  const closeMobileSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchSummary(null);
    setSearchQuery("");
  };

  // Touch gesture helpers for mobile search
  const handleSearchResultTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
    setIsScrolling(false);
    e.stopPropagation();
  };

  const handleSearchResultTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // If there's significant movement, consider it scrolling
    if (deltaX > 10 || deltaY > 10) {
      setIsScrolling(true);
    }

    e.stopPropagation();
  };

  const handleSearchResultTouchEnd = (
    e: React.TouchEvent,
    result: SearchResult
  ) => {
    const touchDuration = Date.now() - (touchStart?.time || 0);

    // Only navigate if:
    // 1. Not scrolling
    // 2. Touch duration is reasonable (not too long)
    // 3. Touch start was captured
    if (!isScrolling && touchStart && touchDuration < 500) {
      console.log("Mobile search result touched (intentional tap):", result);
      e.preventDefault();
      e.stopPropagation();
      const url = getSearchNavigationUrl(result);
      console.log("Generated URL (touch):", url);
      setShowSearchResults(false);
      setSearchQuery("");
      console.log("Navigating to (touch):", url);
      router.push(url);
    }

    // Reset touch state
    setTouchStart(null);
    setIsScrolling(false);
    e.stopPropagation();
  };

  // Touch handlers for "Show more results" button
  const handleShowMoreTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
    setIsScrolling(false);
    e.stopPropagation();
  };

  const handleShowMoreTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - (touchStart?.time || 0);

    // Only navigate if it's an intentional tap
    if (!isScrolling && touchStart && touchDuration < 500) {
      console.log(
        'Mobile "Show more results" button touched (intentional tap)'
      );
      e.preventDefault();
      e.stopPropagation();
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      console.log("Navigating to search page (touch):", searchUrl);
      router.push(searchUrl);
      setShowSearchResults(false);
      setSearchQuery("");
    }

    // Reset touch state
    setTouchStart(null);
    setIsScrolling(false);
    e.stopPropagation();
  };

  return (
    <>
      <header className="bg-white rounded-b-2xl w-full mb-3 ">
        {/* Top header section */}
        <div className="mx-auto px-4 py-3">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden">
            {/* Mobile menu button */}
            <button
              className="flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>

            {/* Logo centered on mobile */}
            <Link href="/" className="flex items-center justify-center">
              <Image
                src={header.logoUrl}
                alt="Totally Indian"
                width={120}
                height={40}
                className="object-contain h-9 translate-x-[5px]"
              />
            </Link>

            {/* Currency and flag on right */}
            <div
              className="flex items-center justify-end relative"
              ref={currencyDropdownRef}
            >
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="bg-gray-50 rounded-full p-2 h-[30px] w-[30px] flex items-center justify-center aspect-square"
              >
                {currencyInitialized && selectedCountry ? (
                  <span
                    className={`fi fi-${selectedCountry.flag} w-[22px] h-[22px] rounded-full object-cover aspect-square`}
                    style={{ backgroundSize: "cover" }}
                  ></span>
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full bg-gray-200 animate-pulse"></div>
                )}
              </button>

              {showCurrencyDropdown && (
                <>
                  {/* Desktop Dropdown */}
                  {isDesktop && (
                    <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-md py-2 z-50 min-w-[180px]">
                      {supportedCountries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => handleCountrySelect(country)}
                          className={`w-full flex items-center px-4 py-2 hover:bg-gray-50 text-left ${
                            selectedCountry?.code === country.code
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <span
                            className={`fi fi-${country.flag} w-4 h-4 rounded-full mr-2`}
                            style={{ backgroundSize: "cover" }}
                          ></span>
                          <span className="text-xs font-medium">
                            {country.currency}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {country.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mobile Full Screen Popup */}
                  {!isDesktop && (
                    <div className="fixed inset-0 bg-white z-[9999] flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-70 bg-white">
                        <h2 className="heading-3-semibold text-black">
                          Select Your Country
                        </h2>
                        <button
                          onClick={() => {
                            setShowCurrencyDropdown(false);
                            setCountrySearchQuery("");
                            setTempSelectedCountry(null);
                          }}
                          className="p-2 hover:bg-blue-70 rounded-full transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-gray-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="p-4 border-b border-gray-70 bg-white">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by country or currency..."
                            value={countrySearchQuery}
                            onChange={(e) =>
                              setCountrySearchQuery(e.target.value)
                            }
                            className="w-full input-field body text-blue-00 placeholder:text-gray-30"
                          />
                          <svg
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Country List */}
                      <div className="flex-1 overflow-y-auto p-4 bg-blue-70">
                        <div className="space-y-2">
                          {filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              onClick={() => handleCountrySelect(country)}
                              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center space-x-3 bg-white ${
                                (tempSelectedCountry || selectedCountry)
                                  ?.code === country.code
                                  ? "border-blue-00 bg-blue-40"
                                  : "border-gray-60 hover:border-blue-10 hover:bg-blue-90"
                              }`}
                            >
                              <div className="relative w-6 h-6 flex-shrink-0">
                                <span
                                  className={`fi fi-${country.flag} absolute inset-0 rounded-full`}
                                  style={{
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                  }}
                                ></span>
                              </div>
                              <div className="flex-1">
                                <div className="body-semibold text-black">
                                  {country.name}
                                </div>
                                <div className="caption text-gray-10">
                                  {country.currency}
                                </div>
                              </div>
                              {(tempSelectedCountry || selectedCountry)
                                ?.code === country.code && (
                                <div className="text-blue-00 flex-shrink-0">
                                  <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Continue Button */}
                      <div className="p-4 border-t border-gray-70 bg-white">
                        <button
                          onClick={handleContinueClick}
                          disabled={!tempSelectedCountry}
                          className="w-full bg-blue-00 text-white py-3 px-4 rounded-lg button hover:bg-blue-10 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div
            ref={mobileSearchRef}
            className="mt-3 mb-1 md:hidden relative"
            data-mobile-search-container
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="border-2 border-blue-00 rounded-[10px] overflow-hidden">
                <div className="flex h-10 bg-white">
                  <div className="flex-1 flex items-center px-3">
                    <Image
                      src="/images/header/search-dark.png"
                      alt="Search"
                      width={16}
                      height={16}
                      className="object-contain mr-2"
                    />
                    <input
                      type="text"
                      placeholder={header.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (searchQuery.trim()) {
                            router.push(
                              `/search?q=${encodeURIComponent(
                                searchQuery.trim()
                              )}`
                            );
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }
                        }
                      }}
                      onFocus={(e) => {
                        // Prevent any focus-related closing on mobile
                        e.stopPropagation();
                      }}
                      onBlur={(e) => {
                        // Prevent blur from closing on mobile - only allow explicit close
                        e.stopPropagation();
                      }}
                      className="w-full h-full body-medium focus:outline-none text-black bg-white"
                    />
                    {/* Clear button */}
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileSearch();
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-3 flex items-center justify-center"
                  >
                    <Image
                      src="/images/header/search-dark.png"
                      alt="Search"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </button>
                </div>
              </div>
            </form>

            {/* Mobile Search Results Dropdown */}
            {showSearchResults && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
                data-mobile-search-dropdown
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onScroll={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                tabIndex={-1}
                style={{
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                  touchAction: "pan-y", // Allow vertical scrolling only
                }}
              >
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-00 mx-auto"></div>
                    <p className="mt-2 text-sm">Searching...</p>
                  </div>
                ) : (
                  <>
                    {searchSummary && (
                      <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-600">
                          Found {searchSummary.total_results} results for &quot;
                          {searchSummary.search_term}&quot;
                        </p>
                      </div>
                    )}

                    {searchResults.slice(0, 6).map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={(e) => {
                          console.log(
                            "Mobile search result clicked (onClick):",
                            result
                          );
                          console.log("Result type:", result.type);
                          console.log("Result ID:", result.id);
                          e.preventDefault();
                          e.stopPropagation();
                          const url = getSearchNavigationUrl(result);
                          console.log("Generated URL:", url);
                          setShowSearchResults(false);
                          setSearchQuery("");
                          console.log("Navigating to:", url);
                          router.push(url);
                        }}
                        onTouchStart={(e) => handleSearchResultTouchStart(e)}
                        onTouchMove={(e) => handleSearchResultTouchMove(e)}
                        onTouchEnd={(e) =>
                          handleSearchResultTouchEnd(e, result)
                        }
                        className="p-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 touch-manipulation select-none"
                        style={{
                          WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
                          pointerEvents: "auto",
                          touchAction: "pan-y", // Allow vertical scrolling
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Image
                              src={getResultImage(result)}
                              alt={result.name}
                              width={40}
                              height={40}
                              className="w-12 h-12 object-cover aspect-square rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {result.type === "product" ? (
                                <>
                                  {formatPrice(result.price)}
                                  {result.compare_price &&
                                    calculateDiscount(
                                      result.price,
                                      result.compare_price
                                    ) && (
                                      <span className="ml-2 text-green-600">
                                        {calculateDiscount(
                                          result.price,
                                          result.compare_price
                                        )}
                                        % off
                                      </span>
                                    )}
                                </>
                              ) : result.description &&
                                stripHtmlTags(result.description).length >
                                  50 ? (
                                `${stripHtmlTags(result.description).substring(
                                  0,
                                  50
                                )}...`
                              ) : (
                                stripHtmlTags(result.description || "")
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show More Button */}
                    {searchSummary && searchSummary.total_results > 6 && (
                      <div className="p-3 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            console.log(
                              'Mobile "Show more results" button clicked (onClick)'
                            );
                            console.log("Search query:", searchQuery.trim());
                            console.log(
                              "Total results:",
                              searchSummary.total_results
                            );
                            e.preventDefault();
                            e.stopPropagation();
                            const searchUrl = `/search?q=${encodeURIComponent(
                              searchQuery.trim()
                            )}`;
                            console.log(
                              "Navigating to search page:",
                              searchUrl
                            );
                            router.push(searchUrl);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                          onTouchStart={(e) => handleShowMoreTouchStart(e)}
                          onTouchMove={(e) => handleSearchResultTouchMove(e)}
                          onTouchEnd={(e) => handleShowMoreTouchEnd(e)}
                          className="w-full text-center text-blue-600 hover:text-blue-800 active:text-blue-900 font-medium text-sm py-2 touch-manipulation select-none"
                          style={{
                            WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
                            pointerEvents: "auto",
                            touchAction: "pan-y", // Allow vertical scrolling
                          }}
                        >
                          Show more results ({searchSummary.total_results - 6}{" "}
                          more)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center mr-4">
              <Image
                src={header.logoUrl}
                alt="Totally Indian"
                width={120}
                height={40}
                className="object-contain h-9"
              />
            </Link>

            {/* Catalog Button */}
            {/* <button className="bg-blue-00 text-white rounded-md button h-10 px-4 mr-2 flex items-center">
              <div className="flex items-center justify-center">
                <Image
                  src={header.catalogIcon}
                  alt="Catalog"
                  width={16}
                  height={16}
                  className="object-contain mr-2"
                />
              </div>
              <span className="title-2-semibold">Catalog</span>
            </button> */}

            {/* Search Bar */}
            <div className="flex-1 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="border border-gray-40 px-[3px] py-0.5 bg-blue-00 rounded-[10px]">
                  <div className="flex h-10 rounded-l-[10px] overflow-hidden bg-white">
                    {/* Custom Dropdown - Only show on screens >= 1200px */}
                    {showSearchDropdown && (
                      <div className="relative">
                        <select
                          className="h-8 bg-blue-130 pl-3 pr-10 text-gray-10 body-medium appearance-none rounded-[8px] m-1 cursor-pointer focus:outline-none"
                          value={selectedSearchOption}
                          onChange={(e) =>
                            setSelectedSearchOption(e.target.value)
                          }
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                            backgroundPosition: "right 0.5rem center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                          }}
                        >
                          <option value="Everywhere">Everywhere</option>
                          {header.searchOptions.slice(1).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="bg-blue-00 flex-1">
                      <input
                        type="text"
                        placeholder={header.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) =>
                          handleSearchInputChange(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                              router.push(
                                `/search?q=${encodeURIComponent(
                                  searchQuery.trim()
                                )}`
                              );
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }
                          }
                        }}
                        className={`w-full h-full px-4 body-medium focus:outline-none text-black bg-white ${
                          showSearchDropdown
                            ? "rounded-r-[8px]"
                            : "rounded-[8px]"
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-00 px-4 flex items-center justify-center"
                    >
                      <Image
                        src={header.searchIcon}
                        alt="Search"
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </button>
                  </div>
                </div>
              </form>

              {/* Desktop Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-6 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-00 mx-auto"></div>
                      <p className="mt-3 text-sm">Searching...</p>
                    </div>
                  ) : (
                    <>
                      {searchSummary && (
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm text-gray-600">
                            Found {searchSummary.total_results} results for
                            &quot;
                            {searchSummary.search_term}&quot;
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {searchResults.slice(0, 6).map((result) => (
                          <div
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleSearchResultClick(result)}
                            className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <Image
                                  src={getResultImage(result)}
                                  alt={result.name}
                                  width={60}
                                  height={60}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {result.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {stripHtmlTags(result.description)}
                                </p>
                                <div className="flex items-center mt-2">
                                  {result.type === "product" ? (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {formatPrice(result.price)}
                                      </span>
                                      {result.compare_price &&
                                        calculateDiscount(
                                          result.price,
                                          result.compare_price
                                        ) && (
                                          <span className="text-xs text-green-600 font-medium">
                                            {calculateDiscount(
                                              result.price,
                                              result.compare_price
                                            )}
                                            % off
                                          </span>
                                        )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-500">
                                      {result.parent_category ? (
                                        <span>
                                          in {result.parent_category.title}
                                        </span>
                                      ) : (
                                        <span className="capitalize">
                                          {result.category_type}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Show More Button */}
                      {searchSummary && searchSummary.total_results > 6 && (
                        <div className="p-4 border-t border-gray-200">
                          <button
                            onClick={() => {
                              router.push(
                                `/search?q=${encodeURIComponent(
                                  searchQuery.trim()
                                )}`
                              );
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }}
                            className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Show more results ({searchSummary.total_results - 6}{" "}
                            more)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User Navigation */}
            <div className="flex items-center ml-auto relative">
              {filteredNavigation.map((item) => {
                // Replace Login with Account when user is logged in
                if (item.title === "Login" && isLoggedIn) {
                  return (
                    <div key="account" className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex flex-col items-center text-center px-5"
                      >
                        <div className="relative flex justify-center">
                          <Image
                            src={item.icon}
                            alt="Account"
                            width={24}
                            height={24}
                            className="object-contain h-4 w-auto"
                          />
                        </div>
                        <span className="body-semibold text-gray-10 mt-1">
                          Account
                        </span>
                      </button>

                      {showDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md z-50 overflow-hidden shadow-md">
                          <div className="py-2 px-4 border-b border-gray-200">
                            <p className="body-large-semibold text-blue-00 truncate">
                              {user?.first_name} {user?.last_name}
                            </p>
                            <p className="body-large-regular text-gray-30 truncate">
                              {user?.email}
                            </p>
                          </div>
                          <Link
                            href="/account"
                            className="block px-4 py-2 text-gray-10 body-large-medium hover:bg-blue-70"
                            onClick={() => setShowDropdown(false)}
                          >
                            My Account
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            className="block px-4 py-2 text-gray-10 body-large-medium hover:bg-blue-70"
                            onClick={() => setShowDropdown(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            href="/account?tab=password"
                            className="block px-4 py-2 text-gray-10 body-large-medium hover:bg-blue-70"
                            onClick={() => setShowDropdown(false)}
                          >
                            Change Password
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-red-500 body-large-semibold hover:bg-red-50"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    className="flex flex-col items-center text-center px-5"
                  >
                    <div className="relative flex justify-center">
                      {item.title === "Cart" && cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-highlight text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                      {item.title === "Wishlist" &&
                        isLoggedIn &&
                        wishlistCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-highlight-50 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {wishlistCount > 99 ? "99+" : wishlistCount}
                          </span>
                        )}
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={24}
                        height={24}
                        className="object-contain h-4 w-auto"
                      />
                    </div>
                    <span className="body-semibold text-gray-10 mt-1">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white px-4 py-3 animate-fadeIn">
            {/* Main Categories in mobile menu */}
            <div className="flex flex-col space-y-3 mb-4">
              {loadingCategories ? (
                <div className="py-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-00 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading categories...
                  </p>
                </div>
              ) : (
                getSuperCategories().map((superCategory) => (
                  <Link
                    key={superCategory.id}
                    href={getCategoryUrl(superCategory)}
                    className="py-2 px-3 body-medium text-black hover:text-blue-00 border-b border-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {superCategory.title}
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* Navigation Categories - Hidden on mobile, visible on medium screens and up */}
        <nav className="hidden md:block relative">
          <div className="px-4">
            <div className="flex items-center justify-between">
              {/* Main Categories */}
              <div className="flex space-x-8">
                {loadingCategories ? (
                  <div className="py-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-00 mr-2"></div>
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  getSuperCategories().map((superCategory) => (
                    <div
                      key={superCategory.id}
                      className="py-3 group"
                      onMouseEnter={() => handleCategoryHover(superCategory.id)}
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      <Link
                        href={getCategoryUrl(superCategory)}
                        className="body-medium text-black hover:text-blue-00 flex items-center"
                      >
                        {superCategory.title}
                        <i className="fas fa-chevron-down ml-2 text-[10px]"></i>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Mega Menu */}
            {activeCategory && !loadingCategories && (
              <div
                className="w-full bg-white z-50"
                onMouseEnter={() => setActiveCategory(activeCategory)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <span className="w-full h-[2px] bg-gray-200 inline-block"></span>
                <div className="mx-auto py-4">
                  <div className="flex justify-between">
                    {/* Categories section */}
                    <div className="flex flex-wrap gap-y-6 justify-between w-full lg:w-3/4 pr-4">
                      {getCategoriesForSuperCategory(activeCategory).map(
                        (category) => (
                          <div
                            key={category.id}
                            className="w-full md:w-1/2 lg:w-1/4"
                          >
                            <h3 className="title-2-semibold text-gray-800 mb-3">
                              <Link
                                href={getCategoryUrl(category)}
                                className="hover:text-blue-00"
                              >
                                {category.title}
                              </Link>
                            </h3>
                            <ul className="space-y-2">
                              {category.children?.map((subCategory) => (
                                <li key={subCategory.id}>
                                  <Link
                                    href={getSubcategoryUrl(
                                      category,
                                      subCategory
                                    )}
                                    className="body-medium text-gray-600 hover:text-blue-00"
                                  >
                                    {subCategory.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>

                    {/* Banner area */}
                    {(() => {
                      const activeSuperCategory = getSuperCategories().find(
                        (cat) => cat.id === activeCategory
                      );
                      return (
                        activeSuperCategory?.image_url && (
                          <div className="hidden lg:block lg:w-1/4 h-full ml-auto">
                            <div className="h-full overflow-hidden rounded-lg flex">
                              <Image
                                src={activeSuperCategory.image_url}
                                alt={activeSuperCategory.title}
                                width={400}
                                height={300}
                                className="w-full h-auto object-contain"
                              />
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 z-[1000] md:hidden py-1.5">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className={`flex flex-col items-center py-2 px-1 flex-1 ${
              pathname === "/" ? "text-blue-00" : "text-gray-10"
            }`}
          >
            <Image
              alt="home icon"
              src={
                pathname === "/"
                  ? "/images/header/navigation/home-active.png"
                  : "/images/header/navigation/home.png"
              }
              height={10}
              width={10}
              className="h-5 w-5"
            />
          </Link>
          <Link
            href="/categories"
            className={`flex flex-col items-center py-2 px-1 flex-1 ${
              pathname === "/categories" ? "text-blue-00" : "text-gray-10"
            }`}
          >
            <Image
              alt="category icon"
              src={
                pathname === "/categories"
                  ? "/images/header/navigation/category-active.png"
                  : "/images/header/navigation/category.png"
              }
              height={10}
              width={10}
              className="h-5 w-5"
            />
          </Link>

          <Link
            href="/cart"
            className={`flex flex-col items-center py-2 px-1 flex-1 ${
              pathname === "/cart" ? "text-blue-00" : "text-gray-10"
            }`}
          >
            <div className="relative">
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-highlight text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <Image
                alt="shop icon"
                src={
                  pathname === "/cart"
                    ? "/images/header/navigation/shop.png"
                    : "/images/header/navigation/shop.png"
                }
                height={10}
                width={10}
                className="h-5 w-5"
              />
            </div>
          </Link>

          <Link
            href="/account?tab=orders"
            className={`flex flex-col items-center py-2 px-1 flex-1 ${
              isOrdersTabActive() ? "text-blue-00" : "text-gray-10"
            }`}
          >
            <Image
              alt="orders icon"
              src={
                isOrdersTabActive()
                  ? "/images/header/navigation/orders-active.png"
                  : "/images/header/navigation/orders.png"
              }
              height={10}
              width={10}
              className="h-5 w-5"
            />
          </Link>

          <div
            onClick={() => {
              // Check if user is logged in using AuthContext
              if (isLoggedIn) {
                router.push("/account");
              } else {
                router.push("/login");
              }
            }}
            className={`flex flex-col items-center py-2 px-1 flex-1 cursor-pointer ${
              isAccountActive() ? "text-blue-00" : "text-gray-10"
            }`}
          >
            <Image
              alt="account icon"
              src={
                isAccountActive()
                  ? "/images/header/navigation/account-active.png"
                  : "/images/header/navigation/account.png"
              }
              height={10}
              width={10}
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>

      {/* Add bottom padding to content for mobile to account for fixed navbar */}
      <style jsx global>{`
        @media (max-width: 767px) {
          body {
            padding-bottom: 60px !important;
          }

          footer {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
