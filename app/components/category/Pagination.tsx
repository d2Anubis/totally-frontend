"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Generate page numbers to display - responsive based on screen size
  const getPageNumbers = (isMobile: boolean = false) => {
    const pageNumbers = [];
    const adjacentCount = isMobile ? 1 : 2; // Show 1 page on each side for mobile, 2 for desktop
    const maxPages = isMobile ? 3 : 5; // Show max 3 pages on mobile, 5 on desktop

    if (totalPages <= maxPages) {
      // Show all pages if there are maxPages or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculate start and end pages
      let startPage = Math.max(1, currentPage - adjacentCount);
      let endPage = Math.min(totalPages, currentPage + adjacentCount);

      // Adjust if we're near the beginning or end
      if (currentPage <= adjacentCount + 1) {
        endPage = Math.min(totalPages, maxPages);
      } else if (currentPage >= totalPages - adjacentCount) {
        startPage = Math.max(1, totalPages - (maxPages - 1));
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // Desktop pagination logic
  const desktopPageNumbers = getPageNumbers(false);
  const showFirstPage = currentPage > 3 && totalPages > 5;
  const showLastPage = currentPage < totalPages - 2 && totalPages > 5;
  const showFirstEllipsis = showFirstPage && desktopPageNumbers[0] > 2;
  const showLastEllipsis =
    showLastPage && desktopPageNumbers[desktopPageNumbers.length - 1] < totalPages - 1;

  // Mobile pagination logic
  const mobilePageNumbers = getPageNumbers(true);

  return (
    <nav className="flex justify-center mt-8">
      {/* Desktop Pagination */}
      <div className="hidden md:flex gap-2 items-center">
        {/* First Page Button */}
        {showFirstPage && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-4 py-2 rounded small-medium bg-white border border-gray-40 text-gray-10 hover:border-blue-00 hover:text-blue-00"
            >
              1
            </button>
            {showFirstEllipsis && (
              <span className="px-2 py-2 text-gray-10">...</span>
            )}
          </>
        )}

        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded small-medium ${
            currentPage === 1
              ? "bg-gray-40 text-gray-30 cursor-not-allowed"
              : "bg-white border border-gray-40 text-gray-10 hover:border-blue-00 hover:text-blue-00"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {desktopPageNumbers.map((page: number) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded small-medium ${
              currentPage === page
                ? "bg-blue-00 text-white"
                : "bg-white border border-gray-40 text-gray-10 hover:border-blue-00 hover:text-blue-00"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded small-medium ${
            currentPage === totalPages
              ? "bg-gray-40 text-gray-30 cursor-not-allowed"
              : "bg-white border border-gray-40 text-gray-10 hover:border-blue-00 hover:text-blue-00"
          }`}
        >
          Next
        </button>

        {/* Last Page Button */}
        {showLastPage && (
          <>
            {showLastEllipsis && (
              <span className="px-2 py-2 text-gray-10">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-4 py-2 rounded small-medium bg-white border border-gray-40 text-gray-10 hover:border-blue-00 hover:text-blue-00"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Mobile Pagination */}
      <div className="flex md:hidden gap-2 items-center">
        {/* Previous Button with Chevron */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded small-medium ${
            currentPage === 1
              ? "bg-gray-40 text-gray-30 cursor-not-allowed"
              : "bg-white border border-gray-40 text-gray-10 hover:border-blue-00 hover:text-blue-00"
          }`}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page Numbers (Mobile - only 2 adjacent) */}
        {mobilePageNumbers.map((page: number) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded small-medium ${
              currentPage === page
                ? "bg-blue-00 text-white"
                : "bg-white border border-gray-40 text-gray-10 hover:border-blue-00 hover:text-blue-00"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button with Chevron */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded small-medium ${
            currentPage === totalPages
              ? "bg-gray-40 text-gray-30 cursor-not-allowed"
              : "bg-white border border-gray-40 text-gray-10 hover:border-blue-00 hover:text-blue-00"
          }`}
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
