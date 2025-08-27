"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import CategoryCard from "./CategoryCard";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getSuperCategoriesWithProducts,
  SuperCategoryWithProducts,
} from "@/app/lib/services/collectionService";

const CategoryGrid = () => {
  // Create a ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State for super categories data
  const [superCategories, setSuperCategories] = useState<
    SuperCategoryWithProducts[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for scroll button availability
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Auto-scroll settings
  const AUTO_SCROLL_INTERVAL = 3000; // Scroll every 3 seconds
  const SCROLL_AMOUNT = 300; // Scroll amount in pixels
  const RESUME_DELAY = 5000; // Resume auto-scroll 5 seconds after user interaction

  // Function to check scroll position and update button states
  const updateScrollButtonStates = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < maxScrollLeft - 1); // -1 for small rounding differences
    }
  }, []);

  // Navigation functions
  const scrollLeft = () => {
    if (scrollContainerRef.current && canScrollLeft) {
      scrollContainerRef.current.scrollBy({
        left: -SCROLL_AMOUNT,
        behavior: "smooth",
      });
      handleUserInteraction();
      // Update button states after scroll animation
      setTimeout(updateScrollButtonStates, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && canScrollRight) {
      scrollContainerRef.current.scrollBy({
        left: SCROLL_AMOUNT,
        behavior: "smooth",
      });
      handleUserInteraction();
      // Update button states after scroll animation
      setTimeout(updateScrollButtonStates, 300);
    }
  };

  // Handle auto-scrolling
  const startAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    autoScrollIntervalRef.current = setInterval(() => {
      if (!isAutoScrollPaused && scrollContainerRef.current) {
        // Get current scroll position and maximum scroll
        const container = scrollContainerRef.current;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (container.scrollLeft >= maxScrollLeft - 20) {
          // Reset to the beginning when reaching the end
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Continue scrolling right
          container.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
        }

        // Update button states after auto-scroll
        setTimeout(updateScrollButtonStates, 300);
      }
    }, AUTO_SCROLL_INTERVAL);
  }, [isAutoScrollPaused, updateScrollButtonStates]);

  // Handle user interaction
  const handleUserInteraction = () => {
    setIsAutoScrollPaused(true);

    if (userInteractionTimerRef.current) {
      clearTimeout(userInteractionTimerRef.current);
    }

    userInteractionTimerRef.current = setTimeout(() => {
      setIsAutoScrollPaused(false);
    }, RESUME_DELAY);
  };

  // Fetch super categories data
  useEffect(() => {
    const fetchSuperCategories = async () => {
      try {
        setLoading(true);
        const data = await getSuperCategoriesWithProducts();
        if (data) {
          setSuperCategories(data);
        }
      } catch (err) {
        setError("Failed to load super categories");
        console.error("Error fetching super categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuperCategories();
  }, []);

  // Update button states when categories load or container resizes
  useEffect(() => {
    if (!loading && superCategories.length > 0) {
      // Initial button state update
      setTimeout(updateScrollButtonStates, 100);

      // Add scroll event listener to update button states on manual scroll
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener("scroll", updateScrollButtonStates);

        // Add resize observer to handle window resize
        const resizeObserver = new ResizeObserver(updateScrollButtonStates);
        resizeObserver.observe(container);

        return () => {
          container.removeEventListener("scroll", updateScrollButtonStates);
          resizeObserver.disconnect();
        };
      }
    }
  }, [loading, superCategories, updateScrollButtonStates]);

  // Setup auto-scroll when component mounts
  useEffect(() => {
    startAutoScroll();

    // Cleanup on unmount
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      if (userInteractionTimerRef.current) {
        clearTimeout(userInteractionTimerRef.current);
      }
    };
  }, [startAutoScroll]);

  // Show loading state
  if (loading) {
    return (
      <div className="mb-8 bg-white rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="w-full title-2 text-center md:text-left md:title-1-semibold">
            Shop by Category
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-8 bg-white rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="w-full title-2 text-center md:text-left md:title-1-semibold">
            Shop by Category
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="w-full title-2 text-center md:text-left md:title-1-semibold">
          Shop by Category
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${
              canScrollLeft
                ? "border-black hover:bg-gray-50 text-black"
                : "border-gray-300 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              height={12}
              className="text-xs"
            />
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${
              canScrollRight
                ? "border-black hover:bg-gray-50 text-black"
                : "border-gray-300 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            <FontAwesomeIcon
              icon={faArrowRight}
              height={12}
              className="text-xs"
            />
          </button>
        </div>
      </div>

      {/* Mobile Grid View - Show 6 super categories in a 3x2 grid */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {superCategories.slice(0, 6).map((superCategory) => (
          <div key={superCategory.id} className="flex-shrink-0">
            <CategoryCard category={superCategory} />
          </div>
        ))}
      </div>

      {/* Desktop Scrollable View */}
      <div className="relative hidden md:block">
        <div
          ref={scrollContainerRef}
          className="flex space-x-5 overflow-x-auto pb-4 scrollbar-hide"
          onMouseEnter={() => setIsAutoScrollPaused(true)}
          onMouseLeave={() =>
            setTimeout(() => setIsAutoScrollPaused(false), 1000)
          }
          onTouchStart={() => handleUserInteraction()}
        >
          {superCategories.map((superCategory) => (
            <div
              key={superCategory.id}
              className="flex-shrink-0 w-[calc(20%-16px)]"
              style={{ minWidth: "180px" }}
            >
              <CategoryCard category={superCategory} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
