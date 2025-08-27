"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
  faStar as faStarSolid,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

interface ReviewImageData {
  url: string;
  position: number;
}

interface ReviewData {
  id: string;
  title: string;
  comment?: string;
  rating: number;
  user?: {
    display_name?: string;
  };
  is_verified_purchase: boolean;
  createdAt: string;
  image_urls?: ReviewImageData[];
  helpful_count: number;
}

interface ReviewImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: ReviewImageData[];
  initialImageIndex: number;
  review: ReviewData;
  formatReviewDate: (date: string) => string;
}

const ReviewImagePopup = ({
  isOpen,
  onClose,
  images,
  initialImageIndex,
  review,
  formatReviewDate,
}: ReviewImagePopupProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset to initial image when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialImageIndex);
    }
  }, [isOpen, initialImageIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : images.length - 1
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentImageIndex((prev) =>
            prev < images.length - 1 ? prev + 1 : 0
          );
          break;
      }
    },
    [isOpen, onClose, images.length]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      goToNextImage();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevImage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faUserCircle} className="text-white text-xl" />
          <div>
            <span className="text-white font-medium">
              {review.user?.display_name || "Anonymous"}
            </span>
            {review.is_verified_purchase && (
              <span className="ml-2 text-xs text-green-400">
                ✓ Verified Purchase
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Image counter */}
          <span className="text-white text-sm">
            {currentImageIndex + 1} of {images.length}
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevImage}
              className="absolute left-4 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Previous image"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="lg" />
            </button>

            <button
              onClick={goToNextImage}
              className="absolute right-4 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Next image"
            >
              <FontAwesomeIcon icon={faChevronRight} size="lg" />
            </button>
          </>
        )}

        {/* Current Image */}
        <div
          className="max-w-full max-h-full p-4"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={images[currentImageIndex]?.url}
            alt={`Review image ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Click outside to close */}
        <div
          className="absolute inset-0 -z-10"
          onClick={onClose}
          aria-label="Close popup"
        />
      </div>

      {/* Bottom Review Information */}
      <div className="bg-black bg-opacity-75 p-4 max-h-48 overflow-y-auto">
        {/* Rating */}
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={star <= review.rating ? faStarSolid : faStarRegular}
              className="text-yellow-400 mr-1 w-4 h-4"
            />
          ))}
          <span className="text-white ml-2 text-sm">
            {formatReviewDate(review.createdAt)}
          </span>
        </div>

        {/* Review Title */}
        {review.title && (
          <h4 className="text-white font-semibold mb-2">{review.title}</h4>
        )}

        {/* Review Comment */}
        {review.comment && (
          <p className="text-gray-300 text-sm leading-relaxed mb-2">
            {review.comment}
          </p>
        )}

        {/* Helpful count */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">
            👍 Helpful ({review.helpful_count})
          </span>

          {/* Image thumbnails for navigation */}
          {images.length > 1 && (
            <div className="flex space-x-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-8 h-8 rounded overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewImagePopup;
