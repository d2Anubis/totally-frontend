"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as faStarSolid,
  faUserCircle,
  faTimes,
  faCamera,
  faTrash,
  faSpinner,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "@/app/context/AuthContext";
import {
  getProductReviews,
  createReview,
  canUserReview,
  formatReviewDate,
  validateReviewData,
  validateReviewImages,
  type ProductReviewsResponse,
  type ReviewPermissionResponse,
  type CreateReviewData,
} from "@/app/lib/services/reviewService";
import { UploadService } from "@/app/lib/services/uploadService";
import ReviewImagePopup from "./ReviewImagePopup";

interface CustomerReviewsProps {
  productId: string;
  rating?: number;
  reviewCount: number;
}

const CustomerReviews = ({ productId }: CustomerReviewsProps) => {
  const { isLoggedIn, user } = useAuth();

  // Review data state
  const [reviewsData, setReviewsData] = useState<ProductReviewsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "rating_high" | "rating_low" | "helpful"
  >("newest");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Review permission state
  const [canReview, setCanReview] = useState<ReviewPermissionResponse | null>(
    null
  );
  const [checkingPermission, setCheckingPermission] = useState(false);

  // Review form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState<CreateReviewData>({
    product_id: productId,
    rating: 5,
    title: "",
    comment: "",
  });

  // Image popup state
  const [imagePopup, setImagePopup] = useState<{
    isOpen: boolean;
    images: Array<{ url: string; position: number }>;
    initialImageIndex: number;
    review: ProductReviewsResponse["reviews"][0] | null;
  }>({
    isOpen: false,
    images: [],
    initialImageIndex: 0,
    review: null,
  });

  // Handle image click to open popup
  const handleImageClick = (
    images: Array<{ url: string; position: number }>,
    imageIndex: number,
    review: ProductReviewsResponse["reviews"][0]
  ) => {
    setImagePopup({
      isOpen: true,
      images,
      initialImageIndex: imageIndex,
      review,
    });
  };

  // Handle closing image popup
  const handleCloseImagePopup = () => {
    setImagePopup({
      isOpen: false,
      images: [],
      initialImageIndex: 0,
      review: null,
    });
  };

  // Update review form title when user changes or modal opens
  useEffect(() => {
    if (user && showReviewModal) {
      const userName = `${user.first_name} ${user.last_name}`.trim();
      setReviewForm((prev) => ({
        ...prev,
        title: userName || "Anonymous User",
      }));
    }
  }, [user, showReviewModal]);
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load reviews data
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductReviews(productId, {
        page: currentPage,
        limit: 10,
        sort: sortBy,
        rating_filter: ratingFilter || undefined,
      });
      setReviewsData(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, currentPage, sortBy, ratingFilter]);

  // Check if user can review
  const checkReviewPermission = useCallback(async () => {
    if (!isLoggedIn) return;

    setCheckingPermission(true);
    try {
      const permission = await canUserReview(productId);
      setCanReview(permission);
    } catch (error) {
      console.error("Failed to check review permission:", error);
    } finally {
      setCheckingPermission(false);
    }
  }, [isLoggedIn, productId]);

  // Load reviews on component mount and when filters change
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Check review permission when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      checkReviewPermission();
    }
  }, [isLoggedIn, checkReviewPermission]);

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (showReviewModal) {
      // Lock body scroll
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px"; // Prevent layout shift from scrollbar
    } else {
      // Unlock body scroll
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    // Cleanup function to ensure scroll is unlocked when component unmounts
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [showReviewModal]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showReviewModal) {
        setShowReviewModal(false);
      }
    };

    if (showReviewModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showReviewModal]);

  // Handle write review button click
  const handleWriteReviewClick = () => {
    console.log("Write review clicked - Debug Info:", {
      isLoggedIn,
      canReview,
      showReviewModal,
      checkingPermission,
    });

    if (!isLoggedIn) {
      console.log("User not logged in, redirecting to auth");
      // Redirect to login with return URL
      const currentUrl = window.location.href;
      window.location.href = `/auth?tab=login&return_url=${encodeURIComponent(
        currentUrl
      )}`;
      return;
    }

    if (canReview === null) {
      console.log("Review permission not loaded yet, checking now...");
      checkReviewPermission();
      // For now, allow the modal to open while we check permission
      setShowReviewModal(true);
      return;
    }

    if (canReview?.canReview) {
      console.log("User can review, opening modal");
      setShowReviewModal(true);
    } else {
      console.log("User cannot review:", canReview?.message);
      // Show why user can't review
      alert(
        canReview?.message || "You cannot review this product at this time."
      );
    }
  };

  // Handle review form submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = validateReviewData(reviewForm);
    const imageValidation = validateReviewImages(reviewImages);

    const allErrors = [...validation.errors, ...imageValidation.errors];

    if (allErrors.length > 0) {
      setFormErrors(allErrors);
      return;
    }

    setSubmittingReview(true);
    setFormErrors([]);

    try {
      const reviewDataWithImages = { ...reviewForm };

      // If there are images, upload them first
      if (reviewImages.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);

        const uploadedImages = await UploadService.uploadReviewImages(
          reviewImages,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        setIsUploading(false);

        if (!uploadedImages) {
          // Error uploading images - the UploadService already shows error message
          return;
        }

        // Add uploaded image URLs to review data
        reviewDataWithImages.image_urls = uploadedImages;
      }

      const newReview = await createReview(reviewDataWithImages);

      if (newReview) {
        // Reset form and close modal
        setShowReviewModal(false);
        const userName = user
          ? `${user.first_name} ${user.last_name}`.trim()
          : "";
        setReviewForm({
          product_id: productId,
          rating: 5,
          title: userName || "Anonymous User",
          comment: "",
        });
        setReviewImages([]);
        setUploadProgress(0);

        // Reload reviews and permission
        loadReviews();
        checkReviewPermission();
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmittingReview(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validation = validateReviewImages(files);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setReviewImages(files);
    setFormErrors([]);
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading && !reviewsData) {
    return (
      <div className="bg-white rounded-2xl p-6 mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 mt-8">
        <h2 className="heading-3 text-blue-00 text-center mb-0 md:mb-8">
          Customer Reviews
        </h2>

        {reviewsData && (
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            {/* Left: Rating Summary */}
            <div className="hidden md:flex flex-col items-start">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={
                      star <= Math.round(reviewsData.statistics.average_rating)
                        ? faStarSolid
                        : faStarRegular
                    }
                    className="text-highlight-50"
                  />
                ))}
                <span className="ml-2 title-1-medium text-blue-00">
                  {reviewsData.statistics.average_rating.toFixed(1)} out of 5
                </span>
              </div>
              <span className="text-blue-00 title-1-medium mt-1">
                Based on {reviewsData.statistics.total_reviews} Reviews
              </span>
            </div>

            {/* Vertical Separator */}
            <span className="hidden md:block mx-4 h-24 w-px bg-gray-40"></span>

            {/* Middle: Rating Breakdown */}
            <div className="w-full md:w-1/2 my-6 md:my-0">
              {[5, 4, 3, 2, 1].map((star) => (
                <div
                  key={star}
                  className="flex items-center justify-center mb-1"
                >
                  {/* Star Icons */}
                  {[1, 2, 3, 4, 5].map((s, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={s <= star ? faStarSolid : faStarRegular}
                      className="text-highlight-50"
                      size="sm"
                    />
                  ))}

                  {/* Progress Bar */}
                  <div className="relative w-1/2 h-2 bg-gray-40 ml-2 rounded-full">
                    <div
                      className="absolute left-0 top-0 h-full bg-highlight-50 rounded-full"
                      style={{
                        width:
                          reviewsData.statistics.total_reviews > 0
                            ? `${
                                (reviewsData.statistics.rating_distribution[
                                  star.toString() as keyof typeof reviewsData.statistics.rating_distribution
                                ] /
                                  reviewsData.statistics.total_reviews) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>

                  {/* Count */}
                  <span className="ml-2 small-medium">
                    {reviewsData.statistics.rating_distribution[
                      star.toString() as keyof typeof reviewsData.statistics.rating_distribution
                    ] || 0}
                  </span>
                </div>
              ))}
            </div>

            {/* Vertical Separator */}
            <span className="hidden md:block mx-4 h-24 w-px bg-gray-40"></span>

            {/* Right: Write Review Button */}
            <div className="flex justify-between items-center w-full md:w-fit">
              <div className="flex md:hidden flex-col items-start">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon
                      key={star}
                      icon={
                        star <=
                        Math.round(reviewsData.statistics.average_rating)
                          ? faStarSolid
                          : faStarRegular
                      }
                      className="text-highlight-50 w-3 h-3"
                    />
                  ))}
                  <span className="ml-2 title-2-medium text-blue-00">
                    {reviewsData.statistics.average_rating.toFixed(1)} out of 5
                  </span>
                </div>
                <span className="text-blue-00 title-2-medium mt-1">
                  Based on {reviewsData.statistics.total_reviews} Reviews
                </span>
              </div>

              <div className="flex flex-col items-end">
                <button
                  onClick={handleWriteReviewClick}
                  className="bg-blue-00 text-white button-large py-2 px-3 rounded-lg whitespace-nowrap w-fit h-fit mb-2"
                  disabled={checkingPermission}
                >
                  {checkingPermission ? "Checking..." : "Write A Review"}
                </button>

                {/* Show permission message only if permission is loaded and can't review */}
                {canReview && !canReview.canReview && (
                  <span className="text-xs text-gray-500 text-center max-w-[120px]">
                    {canReview.reason === "already_reviewed"
                      ? "Already reviewed"
                      : "Purchase required"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        {reviewsData && reviewsData.statistics.total_reviews > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-4 border-t md:border-b md:border-gray-40 py-4">
            <div className="flex items-center gap-4">
              <div className="rating-select border">
                <select
                  value={ratingFilter || ""}
                  onChange={(e) =>
                    setRatingFilter(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className=" rounded-lg px-3 py-2 text-sm appearance-none relative"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className=" h-4 w-4" />
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3">Loading reviews...</span>
            </div>
          ) : reviewsData && reviewsData.reviews.length > 0 ? (
            <>
              {reviewsData.reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col md:flex-row md:items-start gap-4 pb-6 mb-6 border-b border-gray-40 last:border-b-0"
                >
                  {/* User Info */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesomeIcon
                          key={star}
                          icon={
                            star <= review.rating ? faStarSolid : faStarRegular
                          }
                          className="text-highlight-50 mr-1 w-3 h-3 md:w-4 md:h-4"
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="text-blue-00 text-xl md:text-2xl"
                      />
                      <div>
                        <span className="caption-bold md:body-large text-blue-00 block">
                          {review.user?.display_name || "Anonymous"}
                        </span>
                        {review.is_verified_purchase && (
                          <span className="text-xs text-green-600">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h4>
                    {review.comment && (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {review.comment}
                      </p>
                    )}

                    {/* Review Images */}
                    {review.image_urls && review.image_urls.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto">
                        {review.image_urls.map((img, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              handleImageClick(
                                review.image_urls || [],
                                index,
                                review
                              )
                            }
                            className="relative group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                          >
                            <img
                              src={img.url}
                              alt={`Review image ${img.position}`}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0 transition-transform cursor-pointer"
                              loading="lazy"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 transition-all rounded-lg flex items-center justify-center">
                              <span
                                className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity h-full w-full flex items-center justify-center rounded-lg"
                                style={{
                                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                                }}
                              >
                                View
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatReviewDate(review.createdAt)}</span>
                      <span>👍 Helpful ({review.helpful_count})</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {reviewsData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={!reviewsData.pagination.hasPrev}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {reviewsData.pagination.currentPage} of{" "}
                    {reviewsData.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={!reviewsData.pagination.hasNext}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : reviewsData && reviewsData.statistics.total_reviews > 0 ? (
            // Case: Reviews exist but current filter shows none
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No reviews match your current filter. Try adjusting the rating
                filter or sorting options.
              </p>
              <button
                onClick={() => {
                  setRatingFilter(null);
                  setSortBy("newest");
                }}
                className="bg-blue-00 text-white px-6 py-2 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            // Case: No reviews exist at all
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No reviews yet. Be the first to review this product!
              </p>
              {isLoggedIn && canReview?.canReview && (
                <button
                  onClick={handleWriteReviewClick}
                  className="bg-blue-00 text-white px-6 py-2 rounded-lg"
                >
                  Write First Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowReviewModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Write a Review
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>

              {/* Form Errors */}
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <ul className="text-red-700 text-sm space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Review Form */}
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, rating: star }))
                        }
                        className="text-2xl hover:scale-110 transition-transform"
                      >
                        <FontAwesomeIcon
                          icon={
                            star <= reviewForm.rating
                              ? faStarSolid
                              : faStarRegular
                          }
                          className={
                            star <= reviewForm.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hidden Title Field - automatically set to user's name */}
                <input type="hidden" value={reviewForm.title} />

                {/* Comment */}
                <div>
                  <label
                    htmlFor="review-comment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Review *
                  </label>
                  <textarea
                    id="review-comment"
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Share details about your experience with this product"
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Images */}
                <div>
                  <label
                    htmlFor="review-images"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Photos (Optional - Max 5)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      id="review-images"
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/jpg,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="review-images"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={faCamera}
                        className="text-gray-400 text-2xl mb-2"
                      />
                      <span className="text-sm text-gray-600">
                        Click to upload images
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each
                      </span>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {reviewImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {reviewImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mb-4">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                      size="lg"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={submittingReview || isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || isUploading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading
                      ? `Uploading ${Math.round(uploadProgress)}%`
                      : submittingReview
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Popup */}
      {imagePopup.review && (
        <ReviewImagePopup
          isOpen={imagePopup.isOpen}
          onClose={handleCloseImagePopup}
          images={imagePopup.images}
          initialImageIndex={imagePopup.initialImageIndex}
          review={imagePopup.review}
          formatReviewDate={formatReviewDate}
        />
      )}
    </>
  );
};

export default CustomerReviews;
