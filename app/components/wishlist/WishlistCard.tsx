"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faPlus,
  faMinus,
  faTrash,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useShop, Product } from "@/app/context/ShopContext";
import { toast } from "react-hot-toast";
import PriceDisplay from "@/app/components/common/PriceDisplay";
import { showProductToast } from "@/app/utils/toastUtils";

interface WishlistCardProps {
  item: Product;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionMode: boolean;
}

export default function WishlistCard({
  item,
  isSelected,
  onToggleSelect,
  selectionMode,
}: WishlistCardProps) {
  // Get cart and wishlist functions from context
  const { addToCart, removeFromCart, removeFromWishlist, isInCart, cart } =
    useShop();

  // Loading states for cart operations
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);

  // Find product in cart to get current quantity - optimized to match by variant_id if available
  const cartItem = cart.find((cartItem) => {
    // First check by variant_id if the item has one (most accurate match)
    if (item.variant_id && cartItem.variant_id === item.variant_id) {
      return true;
    }

    // Fallback to checking by product ID
    if ("Variant" in cartItem && cartItem.Variant?.Product?.id) {
      return cartItem.Variant.Product.id === item.id;
    }
    // Check for legacy server-side cart item structure
    else if (
      "product_id" in cartItem &&
      typeof cartItem.product_id === "string"
    ) {
      return cartItem.product_id === item.id;
    }
    // Otherwise it's a guest cart item (GuestCartItem)
    else if ("Product" in cartItem && cartItem.Product) {
      return cartItem.Product.id === item.id;
    }
    return false;
  });
  const quantity = cartItem?.quantity || 0;

  // State to track if the cart button is being hovered
  const [isCartHovered, setIsCartHovered] = useState(isInCart(item.id));

  // Update isCartHovered when cart changes
  useEffect(() => {
    if (isInCart(item.id)) {
      setIsCartHovered(true);
    }
  }, [cart, item.id, isInCart]);

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event propagation

    if (isAddingToCart) return; // Prevent multiple requests

    setIsAddingToCart(true);

    try {
      await addToCart(item, 1);
      showProductToast(item, "Added to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Helper function to get product data for toast from wishlist item
  const getProductForToast = (): Product => {
    // Always use the wishlist item data to ensure consistency
    return {
      id: item.id,
      name: item.name || item.title,
      title: item.title || item.name,
      imageUrl: item.imageUrl || item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      brand: item.brand,
      variant_id: item.variant_id,
      option_values: item.option_values,
    };
  };

  // Handle increase quantity
  const handleIncreaseQuantity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdatingQuantity) return; // Prevent multiple requests

    setIsUpdatingQuantity(true);

    try {
      await addToCart(item, 1);
      showProductToast(item, "Quantity increased");
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

    if (isUpdatingQuantity || !cartItem) return; // Prevent multiple requests

    setIsUpdatingQuantity(true);

    try {
      const productForToast = getProductForToast();
      // Always remove the item since we don't have a proper update API
      await removeFromCart(cartItem.id);

      // If quantity was more than 1, add back with quantity - 1
      if (quantity > 1) {
        // Add back with reduced quantity
        setTimeout(async () => {
          await addToCart(item, quantity - 1);
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

  // Handle remove from wishlist
  const handleRemoveFromWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event propagation

    removeFromWishlist(item.id);
    toast.success("Removed from wishlist");
  };

  // Get the product URL
  const productUrl = item.url || `/product/${item.id}`;

  return (
    <div
      className={`overflow-hidden flex flex-col relative ${
        isSelected ? "ring-2 ring-blue-00 rounded-lg" : ""
      }`}
    >
      <div className="relative top bg-blue-100 rounded-lg">
        {/* Selection Checkbox - Only show when in selection mode */}
        {selectionMode && (
          <div className="absolute top-2 left-2 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect();
              }}
              className={`w-5 h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center border ${
                isSelected
                  ? "bg-blue-00 border-blue-00"
                  : "bg-white border-gray-300"
              }`}
            >
              {isSelected && (
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-white text-xs"
                />
              )}
            </button>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={handleRemoveFromWishlist}
          className="absolute top-2 right-2 w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center z-10 bg-white"
          aria-label="Remove from wishlist"
        >
          <FontAwesomeIcon
            icon={faTrash}
            className="text-gray-400 hover:text-red-500 text-xs md:text-sm"
          />
        </button>

        {/* Product Image */}
        <Link href={productUrl} className="relative block aspect-square">
          <Image
            src={item.imageUrl || item.image || "/images/common/product.png"}
            alt={item.title || item.name || "Product"}
            fill
            className="object-contain rounded-lg"
          />
        </Link>

        {/* Cart Controls */}
        {isInCart(item.id) ? (
          <>
            {/* Expanded cart controls - only visible on md screens and above */}
            <div
              className="absolute bottom-2 right-2 hidden md:flex items-center bg-blue-00 overflow-hidden rounded-full w-auto"
              onMouseLeave={() => !isInCart(item.id) && setIsCartHovered(false)}
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

        {/* Sale Tag */}
        {item.isSale && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-highlight-30 text-highlight-40 caption-semibold md:body-semibold py-1 px-3 rounded-t-lg">
            Sale
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3">
        {/* Price and Rating */}
        <div className="flex items-start md:items-center justify-between">
          <div className="flex md:flex-row flex-col items-baseline">
            <PriceDisplay
              inrPrice={item.price}
              className="caption-bold md:heading-3 text-highlight-50"
              showLoading={false}
            />
            <span className="flex">
              {item.originalPrice && (
                <PriceDisplay
                  inrPrice={item.originalPrice}
                  className="md:ml-2 caption-bold md:body-medium text-gray-30 line-through"
                  showLoading={false}
                />
              )}
              {item.discount && (
                <span className="md:ml-1 caption-bold md:body-bold text-highlight-40">
                  -{item.discount}%
                </span>
              )}
            </span>
          </div>

          {item.rating && (
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faStar}
                className="text-highlight-50 caption-bold md:body-bold h-2 md:text-sm mr-0.5 md:mr-1"
              />
              <span className="caption-bold md:body-bold text-gray-10">
                {typeof item.rating === "number"
                  ? item.rating.toFixed(1)
                  : item.rating}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={productUrl} className="block">
          <h3 className="md:body-large-bold caption-bold text-black line-clamp-2 hover:text-blue-00 transition-colors">
            {item.title || item.name}
          </h3>
        </Link>

        {/* Brand */}
        {item.brand && (
          <p className="hidden md:block body-medium text-gray-20">
            {item.brand}
          </p>
        )}
      </div>
    </div>
  );
}
