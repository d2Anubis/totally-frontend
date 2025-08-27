"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faPlus,
  faHeart as fasHeart,
  faMinus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import { useShop, Product } from "@/app/context/ShopContext";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import PriceDisplay from "@/app/components/common/PriceDisplay";
import { showProductToast } from "@/app/utils/toastUtils";

interface ProductCardProps {
  id: string;
  title: string;
  imageUrl: string;
  price: number | null;
  originalPrice?: number | null;
  discount?: number | null;
  url: string;
  brand: string;
  rating: number;
  isQuickShip?: boolean;
  isSale?: boolean;
  variant_id?: string; // Add variant_id for cart operations
  option_values?: { [key: string]: string }; // Add option_values for variant information
}

export default function ProductCard({
  id,
  title,
  imageUrl,
  price,
  originalPrice,
  discount,
  url,
  brand,
  rating,
  isSale = false,
  variant_id,
  option_values,
}: ProductCardProps) {
  // Handle cases where price is null
  const displayPrice = price ?? 0;
  const hasValidPrice = price !== null && price > 0;
  const displayOriginalPrice =
    originalPrice && originalPrice > displayPrice ? originalPrice : undefined;
  const displayDiscount = discount && discount > 0 ? discount : undefined;

  // Get cart and wishlist functions from context
  const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    isInWishlist,
    addToWishlist,
    isInCart,
    cart,
    removeFromWishlist,
  } = useShop();

  // Get authentication status
  const { isLoggedIn } = useAuth();

  // State to track if the cart button is being hovered
  const [isCartHovered, setIsCartHovered] = useState(isInCart(id));

  // Loading states for cart operations
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);

  // Find product in cart to get current quantity - optimized to match by variant_id first, then product id
  const cartItem = cart.find((item) => {
    // First check by variant_id if we have one (most accurate match)
    if (variant_id && item.variant_id === variant_id) {
      return true;
    }

    // Fallback to checking by product ID for non-variant products
    if ("Variant" in item && item.Variant?.Product?.id) {
      return item.Variant.Product.id === id;
    }
    // Check for legacy server-side cart item structure
    else if ("product_id" in item && typeof item.product_id === "string") {
      return item.product_id === id;
    }
    // Otherwise it's a guest cart item (GuestCartItem)
    else if ("Product" in item && item.Product) {
      return item.Product.id === id;
    }
    return false;
  });
  const quantity = cartItem?.quantity || 0;

  // Update isCartHovered when cart changes
  useEffect(() => {
    if (isInCart(id)) {
      setIsCartHovered(true);
    }
  }, [cart, id, isInCart]);

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation(); // Stop event propagation

    if (isAddingToCart) {
      console.log("Add to cart already in progress, ignoring click");
      return; // Prevent multiple requests
    }

    console.log("Starting add to cart process for product:", id);
    setIsAddingToCart(true);

    try {
      const product = getProductForToast();

      console.log("Calling addToCart with product:", product);
      await addToCart(product, 1);
      console.log("addToCart completed successfully");
      showProductToast(product, "Added to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      console.log("Setting isAddingToCart to false");
      setIsAddingToCart(false);
    }
  };

  // Helper function to get product data for toast from current component props
  const getProductForToast = (): Product => {
    // Always use the component props to ensure consistency
    return {
      id,
      name: title,
      title: title,
      imageUrl,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      discount: displayDiscount,
      brand,
      variant_id: variant_id, // Include variant_id for proper cart operations
      url: url, // Include the URL for proper redirection
      // Extract page_url from the URL (remove query parameters and /product/ prefix)
      page_url: url.includes("?")
        ? url.split("?")[0].replace("/product/", "")
        : url.replace("/product/", ""),
      option_values: option_values || undefined, // Pass variant information
    };
  };

  // Handle increase quantity
  const handleIncreaseQuantity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasValidPrice) {
      return;
    }

    if (isUpdatingQuantity) return; // Prevent multiple requests

    setIsUpdatingQuantity(true);

    try {
      if (cartItem) {
        await increaseQuantity(cartItem.id);
        const product = getProductForToast();
        console.log("Increasing quantity for product:", product);
        showProductToast(product, "Quantity increased");
      }
    } catch (error) {
      console.error("Failed to increase quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  // Handle decrease quantity
  const handleDecreaseQuantity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasValidPrice) {
      return;
    }

    if (isUpdatingQuantity || !cartItem) return; // Prevent multiple requests

    setIsUpdatingQuantity(true);

    try {
      const productForToast = getProductForToast();
      // Always remove the item since we don't have a proper update API
      await removeFromCart(cartItem.id);

      // If quantity was more than 1, add back with quantity - 1
      if (quantity > 1) {
        const product = getProductForToast();

        // Add back with reduced quantity
        setTimeout(async () => {
          await addToCart(product, quantity - 1);
        }, 100); // Small delay to ensure remove completes first

        showProductToast(productForToast, "Quantity decreased");
      } else {
        showProductToast(productForToast, "Removed from cart");
      }
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  // Handle remove from cart
  const handleRemoveFromCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdatingQuantity || !cartItem) return; // Prevent multiple requests

    setIsUpdatingQuantity(true);

    try {
      const productForToast = getProductForToast();
      await removeFromCart(cartItem.id);
      showProductToast(productForToast, "Removed from cart");
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      toast.error("Failed to remove from cart");
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      // Import dynamically to avoid server-side issues
      import("sweetalert2")
        .then((Swal) => {
          Swal.default
            .fire({
              title: "Save to Wishlist",
              text: "Please log in to add items to your wishlist",
              icon: "info",
              showCancelButton: true,
              confirmButtonColor: "#00478f",
              cancelButtonColor: "#d33",
              confirmButtonText: "Login Now",
              cancelButtonText: "Later",
            })
            .then((result) => {
              if (result.isConfirmed) {
                // Include return_url in the redirection
                const currentUrl = window.location.href;
                window.location.href = `/auth?tab=login&return_url=${encodeURIComponent(
                  currentUrl
                )}`;
              }
            });
        })
        .catch(() => {
          // Fallback if Swal fails to load
          const confirmLogin = window.confirm(
            "Please log in to add items to your wishlist. Go to login page?"
          );
          if (confirmLogin) {
            const currentUrl = window.location.href;
            window.location.href = `/auth?tab=login&return_url=${encodeURIComponent(
              currentUrl
            )}`;
          }
        });
      return;
    }

    const productToAdd = {
      id: id.toString(),
      title,
      price: price || 0,
      imageUrl,
      originalPrice: originalPrice || undefined,
    };

    // Toggle wishlist state based on current status
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(productToAdd);
    }
  };

  return (
    <div className="overflow-hidden flex flex-col relative">
      <div className="relative top bg-blue-100 rounded-lg">
        {/* Quick Ship Label */}
        {/* {isQuickShip && (
          <div className="absolute z-10 top-0 left-1/2 -translate-x-1/2 bg-highlight-10 text-highlight-20 caption-semibold md:body-semibold py-1 px-3 rounded-b-lg">
            QuickShip
          </div>
        )} */}

        {/* Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          className="hidden absolute top-2 right-2 w-5 h-5 md:w-7 md:h-7 rounded-full md:flex items-center justify-center z-10 bg-white"
          aria-label="Add to wishlist"
        >
          <FontAwesomeIcon
            icon={isInWishlist(id) ? fasHeart : farHeart}
            className={`${
              isInWishlist(id)
                ? "text-red-500"
                : "text-black hover:text-blue-00"
            } text-sm md:text-md`}
          />
        </button>

        {/* Product Image */}
        <Link href={url} className="relative block aspect-square">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain rounded-lg"
          />
        </Link>

        {/* Cart Controls */}
        {isInCart(id) ? (
          <>
            {/* Expanded cart controls - only visible on md screens and above */}
            <div
              className="absolute bottom-2 right-2 hidden md:flex items-center bg-blue-00 overflow-hidden rounded-full w-auto"
              onMouseLeave={() => !isInCart(id) && setIsCartHovered(false)}
            >
              {quantity === 1 ? (
                <button
                  onClick={handleRemoveFromCart}
                  disabled={isUpdatingQuantity}
                  className={`w-7 h-7 flex items-center justify-center text-white hover:bg-blue-10 transition-colors duration-200 ${
                    isUpdatingQuantity ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Remove from cart"
                >
                  {isUpdatingQuantity ? (
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                  ) : (
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDecreaseQuantity}
                  disabled={isUpdatingQuantity}
                  className={`w-7 h-7 flex items-center justify-center text-white hover:bg-blue-10 transition-colors duration-200 ${
                    isUpdatingQuantity ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Decrease quantity"
                >
                  {isUpdatingQuantity ? (
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                  ) : (
                    <FontAwesomeIcon icon={faMinus} className="h-3 w-3" />
                  )}
                </button>
              )}
              <span className="body-bold text-white text-center px-0.5">
                {quantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                disabled={isUpdatingQuantity}
                className={`w-7 h-7 flex items-center justify-center text-white hover:bg-blue-10 transition-colors duration-200 ${
                  isUpdatingQuantity ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Increase quantity"
              >
                {isUpdatingQuantity ? (
                  <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                ) : (
                  <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                )}
              </button>
            </div>

            {/* Simple add button for mobile - only visible on screens smaller than md */}
            <button
              onClick={handleIncreaseQuantity}
              disabled={isUpdatingQuantity}
              className={`absolute bottom-1 right-1 md:hidden w-5 h-5 rounded-full flex items-center justify-center bg-blue-00 ${
                isUpdatingQuantity ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Increase quantity"
            >
              {isUpdatingQuantity ? (
                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
              ) : (
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 text-white" />
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
            className={`absolute bottom-1 right-1 md:bottom-2 md:right-2 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out ${
              isAddingToCart
                ? "bg-blue-00 opacity-50 cursor-not-allowed"
                : isCartHovered
                ? "bg-blue-10 transform scale-110"
                : "bg-blue-00"
            }`}
            aria-label="Add to cart"
          >
            {isAddingToCart ? (
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
            ) : (
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3 text-white" />
            )}
          </button>
        )}

        {isSale && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-highlight-30 text-highlight-40 caption-semibold md:body-semibold py-1 px-3 rounded-t-lg">
            Sale
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3">
        {/* Price and Rating */}
        <div className="flex items-start md:items-center justify-between mb-0 md:mb-1">
          <div className="flex md:flex-row flex-col items-baseline">
            <PriceDisplay
              inrPrice={price}
              className="caption-bold md:heading-3 text-highlight-50"
              showLoading={false}
            />
            {discount && discount > 0 && (
              <span className="flex">
                {originalPrice && (
                  <PriceDisplay
                    inrPrice={originalPrice}
                    className="md:ml-2 caption-bold md:body-medium text-gray-30 line-through"
                    showLoading={false}
                  />
                )}
                {discount && (
                  <span className="md:ml-1 caption-bold md:body-bold text-highlight-40">
                    -{discount}%
                  </span>
                )}
              </span>
            )}
          </div>
          {rating > 0 && (
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faStar}
                className="text-highlight-50 h-3 mr-0.5 md:mr-1"
              />
              <span className="caption-bold md:body-bold text-gray-10">
                {rating}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={url} className="block">
          <h3 className="md:body-large-bold caption-bold text-black line-clamp-2 hover:text-blue-00 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Brand */}
        <p className="hidden md:block body-medium text-gray-20">{brand}</p>
      </div>
    </div>
  );
}
