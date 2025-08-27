"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const openZoomModal = (imageIndex: number) => {
    setModalImageIndex(imageIndex);
    setIsZoomModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const closeZoomModal = () => {
    setIsZoomModalOpen(false);
    // Restore body scroll
    document.body.style.overflow = "auto";
  };

  const goToPrevious = () => {
    setModalImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setModalImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeZoomModal();
    } else if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    }
  };

  // Touch handlers for mobile swipe gestures
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
      goToNext();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious();
    }
  };

  // Cleanup: restore body scroll when component unmounts or modal closes
  useEffect(() => {
    return () => {
      // Ensure body scroll is restored if component unmounts with modal open
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails - Left column */}
      <div className="flex flex-row md:flex-col gap-2 w-full md:w-[70px]">
        {images.slice(0, 4).map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative w-16 h-16 border-2 ${
              selectedImage === index ? "border-blue-00" : "border-gray-40"
            } rounded-lg overflow-hidden`}
          >
            <Image
              src={image}
              alt={`Product thumbnail ${index + 1}`}
              className="object-cover rounded-lg"
              fill
              sizes="64px"
            />
          </button>
        ))}
      </div>

      {/* Main Product Image - Right column */}
      <div className="w-full md:w-[85%] bg-gray-50 rounded-xl">
        <div
          className="relative aspect-square cursor-zoom-in"
          onClick={() => openZoomModal(selectedImage)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openZoomModal(selectedImage);
            }
          }}
        >
          <Image
            src={images[selectedImage]}
            alt={`Product image ${selectedImage + 1}`}
            className="object-contain rounded-lg"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
          />
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeZoomModal}
          onKeyDown={handleKeyDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeZoomModal}
            className="absolute top-2 md:top-4 right-2 md:right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
            aria-label="Close zoom modal"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl md:text-2xl" />
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
              aria-label="Previous image"
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className="text-xl md:text-3xl"
              />
            </button>
          )}

          {/* Main modal image */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[modalImageIndex]}
              alt={`Product image ${modalImageIndex + 1}`}
              className="object-contain"
              fill
              sizes="90vw"
              priority
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
              aria-label="Next image"
            >
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-xl md:text-3xl"
              />
            </button>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
            <span className="text-sm">
              {modalImageIndex + 1} / {images.length}
            </span>
          </div>

          {/* Thumbnail navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 max-w-[90vw] overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageIndex(index);
                  }}
                  className={`relative w-12 h-12 border-2 ${
                    modalImageIndex === index
                      ? "border-white"
                      : "border-gray-400"
                  } rounded-lg overflow-hidden flex-shrink-0`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
