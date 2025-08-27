"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShare,
  faStar,
  faPlus,
  faMinus,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { useShop } from "@/app/context/ShopContext";
import { toast } from "react-hot-toast";
import Link from "next/link";
import PriceDisplay from "@/app/components/common/PriceDisplay";
import { buyNowCheckout } from "@/app/lib/services/orderService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Swal from "sweetalert2";
import { VariationOption } from "@/app/lib/services/productService";
import { showProductToast } from "@/app/utils/toastUtils";

interface ProductInfoProps {
  id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice: number;
  discount: number;
  brand?: string;
  seller: string;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  imageUrl?: string;
  // Variant props
  hasVariant?: boolean;
  variantId?: string; // Add variantId prop
  optionValues?: { [key: string]: string };
  variants?: {
    commonAttributes: {
      title: string;
      description: string;
      shortDescription: string;
      brand: string;
      type: string;
    };
    variationOptions: VariationOption[];
    variantProducts: Array<{
      id: string;
      title: string;
      price: number;
      compare_price?: number;
      sku: string;
      stock_qty: number;
      image_urls: Array<{ url: string; position: number }>;
      option_values: { [key: string]: string };
      variant_id: string;
    }>;
  } | null;
  // Callback for variant changes
  onVariantChange?: (
    variantProduct: {
      id: string;
      title: string;
      price: number;
      compare_price?: number;
      sku: string;
      stock_qty: number;
      image_urls: Array<{ url: string; position: number }>;
      option_values: { [key: string]: string };
      variant_id: string;
    } | null
  ) => void;
}

export default function ProductInfo({
  id,
  name,
  sku,
  price,
  originalPrice,
  discount,
  brand,
  seller,
  rating,
  reviewCount,
  shortDescription,
  imageUrl,
  hasVariant = false,
  variantId,
  optionValues = {},
  variants = null,
  onVariantChange,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // State for variant selection
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>(optionValues || {});
  const [isLoadingVariant, setIsLoadingVariant] = useState(false);

  // Define the variant product type
  type VariantProduct = {
    id: string;
    title: string;
    price: number;
    compare_price?: number;
    sku: string;
    stock_qty: number;
    image_urls: Array<{ url: string; position: number }>;
    option_values: { [key: string]: string };
    variant_id: string;
  };

  // State for the currently selected variant product
  const [selectedVariantProduct, setSelectedVariantProduct] =
    useState<VariantProduct | null>(
      variants && variants.variantProducts
        ? variants.variantProducts.find((p) => p.id === id) || null
        : null
    );

  // State for managing button loading states
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Current product details (use variant details if available)
  const currentProduct = selectedVariantProduct || {
    id,
    title: name,
    price,
    compare_price: originalPrice,
    sku,
    stock_qty: 999, // Default high stock for non-variant products
    image_urls: imageUrl ? [{ url: imageUrl, position: 0 }] : [],
    option_values: {},
    variant_id: "",
  };

  // Validation functions
  const validateVariantSelection = (): {
    isValid: boolean;
    missingOptions: string[];
    errorMessage: string;
  } => {
    if (!hasVariant || !variants) {
      return { isValid: true, missingOptions: [], errorMessage: "" };
    }

    const missingOptions: string[] = [];
    const requiredOptions = variants.variationOptions.map((opt) => opt.name);

    // Check if all required options are selected
    for (const option of requiredOptions) {
      if (!selectedOptions[option]) {
        missingOptions.push(option);
      }
    }

    if (missingOptions.length > 0) {
      return {
        isValid: false,
        missingOptions,
        errorMessage: `Please select: ${missingOptions.join(", ")}`,
      };
    }

    // Check if the selected combination is valid (product exists)
    const hasValidCombination = variants.variantProducts.some((product) => {
      return Object.entries(selectedOptions).every(
        ([key, value]) => product.option_values[key] === value
      );
    });

    if (!hasValidCombination) {
      return {
        isValid: false,
        missingOptions: [],
        errorMessage: "Selected combination is not available",
      };
    }

    return { isValid: true, missingOptions: [], errorMessage: "" };
  };

  const showVariantError = (errorMessage: string) => {
    Swal.fire({
      title: "Invalid Selection",
      text: errorMessage,
      icon: "warning",
      confirmButtonColor: "#00478f",
      confirmButtonText: "OK",
    });
  };

  // Get cart and wishlist functions from context
  const { addToCart, isInWishlist, addToWishlist, removeFromWishlist } =
    useShop();
  const { isLoggedIn } = useAuth();

  // Custom toast notification with product details

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Helper function to check if an option value is available based on currently selected options
  const isOptionValueAvailable = (optionName: string, optionValue: string) => {
    if (
      !variants ||
      !variants.variantProducts ||
      variants.variantProducts.length === 0
    ) {
      return true;
    }

    // Get the index of the current option in the variation options array
    const currentOptionIndex = variants.variationOptions.findIndex(
      (opt) => opt.name === optionName
    );

    // If this is the first option, all values are always available
    if (currentOptionIndex === 0) {
      return true;
    }

    // Create a new options object with the current selection
    const currentSelections = { ...selectedOptions };

    // For options before the current one, use the selected values
    // For the current option, use the potential value
    currentSelections[optionName] = optionValue;

    // Check if there's any product that matches this combination of selected options so far
    return variants.variantProducts.some((product) => {
      // Only check options up to the current one in the variation options array
      for (let i = 0; i <= currentOptionIndex; i++) {
        const optName = variants.variationOptions[i].name;
        // If this option is selected and doesn't match the product, return false
        if (
          currentSelections[optName] &&
          product.option_values[optName] !== currentSelections[optName]
        ) {
          return false;
        }
      }
      return true;
    });
  };

  // Handle option selection for variants
  const handleOptionChange = async (optionName: string, value: string) => {
    // Create new selected options object
    const newSelectedOptions = { ...selectedOptions };

    // Set the current option
    newSelectedOptions[optionName] = value;

    // Find the index of the current option
    const currentOptionIndex =
      variants?.variationOptions.findIndex((opt) => opt.name === optionName) ??
      -1;

    // If this is not the last option and we're changing an earlier option,
    // check if subsequent selections are still valid and reset them if not
    if (
      variants &&
      currentOptionIndex >= 0 &&
      currentOptionIndex < variants.variationOptions.length - 1
    ) {
      // Loop through all subsequent options
      for (
        let i = currentOptionIndex + 1;
        i < variants.variationOptions.length;
        i++
      ) {
        const nextOptionName = variants.variationOptions[i].name;
        const nextOptionValue = selectedOptions[nextOptionName];

        // If we have a selection for this next option, check if it's still valid
        if (nextOptionValue) {
          // Create a test selection with current options up to this point
          const testSelection = { ...newSelectedOptions };

          // Check if the combination exists in any variant product
          const isValidCombination = variants.variantProducts.some(
            (product) => {
              // Check if all current selections match plus the next option
              for (const [key, val] of Object.entries(testSelection)) {
                if (product.option_values[key] !== val) {
                  return false;
                }
              }
              // Check if the next option value is compatible
              return product.option_values[nextOptionName] === nextOptionValue;
            }
          );

          // If the combination is no longer valid, reset this option
          if (!isValidCombination) {
            delete newSelectedOptions[nextOptionName];
          }
        }
      }
    }

    // Update the selected options
    setSelectedOptions(newSelectedOptions);

    // Find matching variant product
    if (variants) {
      // Check if this is the last variation option
      const currentOptionIndex = variants.variationOptions.findIndex(
        (opt) => opt.name === optionName
      );
      const isLastOption =
        currentOptionIndex === variants.variationOptions.length - 1;

      // Check if we have selected values for all variation options
      const hasAllOptionsSelected = variants.variationOptions.every(
        (option) => newSelectedOptions[option.name] !== undefined
      );

      // Only proceed to find a matching variant and make API call if this is the last option
      // or if all options have been selected
      if (isLastOption || hasAllOptionsSelected) {
        const matchingVariant = variants.variantProducts.find((product) => {
          // Check if all selected options match this product's option_values
          for (const [key, value] of Object.entries(newSelectedOptions)) {
            if (product.option_values[key] !== value) {
              return false;
            }
          }

          // For this to be a full match, we need to have selected the same number of options
          return (
            Object.keys(newSelectedOptions).length ===
            Object.keys(product.option_values).length
          );
        });

        if (matchingVariant) {
          setIsLoadingVariant(true);
          setSelectedVariantProduct(matchingVariant);

          // Don't change the URL product ID - keep the original product ID
          // Only update the variant information as URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          urlParams.set("variant_id", matchingVariant.variant_id);

          // Add selected options as URL parameters for bookmarking
          Object.entries(newSelectedOptions).forEach(([key, value]) => {
            urlParams.set(`option_${key.toLowerCase()}`, value);
          });

          const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
          window.history.pushState({ path: newUrl }, "", newUrl);

          try {
            // Call the onVariantChange callback if provided
            if (onVariantChange) {
              onVariantChange(matchingVariant);
            }

            // Update product details smoothly without refetching
            // The product details are already available in the matchingVariant object
            console.log("Variant selected:", {
              id: matchingVariant.id,
              title: matchingVariant.title,
              price: matchingVariant.price,
              sku: matchingVariant.sku,
              stock: matchingVariant.stock_qty,
            });

            // Removed toast notification on variant selection as requested
          } catch (error) {
            console.error("Error updating variant:", error);
            toast.error("Error updating product variant. Please try again.");
          } finally {
            setIsLoadingVariant(false);
          }
        } else {
          // No matching variant found, reset the selected variant product
          setSelectedVariantProduct(null);

          // Call onVariantChange with null to indicate no valid variant
          if (onVariantChange) {
            onVariantChange(null);
          }
        }
      } else {
        // If we haven't selected all options yet, or if we changed an earlier option,
        // reset the selected variant product to prevent showing outdated information
        setSelectedVariantProduct(null);
      }
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Product link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link to clipboard");
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (isAddingToCart) return; // Prevent multiple requests

    // Validate variant selection first
    const validation = validateVariantSelection();
    if (!validation.isValid) {
      showVariantError(validation.errorMessage);
      return;
    }

    setIsAddingToCart(true);

    try {
      // Use current product data (which includes variant data if selected)
      const productToAdd = {
        id: currentProduct.id,
        name: currentProduct.title,
        title: currentProduct.title,
        imageUrl:
          currentProduct.image_urls[0]?.url ||
          imageUrl ||
          "/images/product-placeholder.jpg",
        price: currentProduct.price,
        originalPrice: currentProduct.compare_price || currentProduct.price,
        discount: currentProduct.compare_price
          ? Math.round(
              ((currentProduct.compare_price - currentProduct.price) /
                currentProduct.compare_price) *
                100
            )
          : 0,
        brand: brand || "",
        sku: currentProduct.sku,
        seller: seller || "",
        // Always include variant_id for all products
        // For products with variants, use the selected variant's ID
        // For products without variants, use the product's ID as variant_id
        variant_id:
          hasVariant && selectedVariantProduct
            ? selectedVariantProduct.variant_id
            : variantId || currentProduct.id, // Fall back to product ID for non-variant products
        // Add option_values for variant information to be displayed in toast
        option_values:
          hasVariant &&
          selectedVariantProduct &&
          Object.keys(selectedOptions).length > 0
            ? { ...selectedOptions }
            : {},
        // Add URL information for guest cart redirection
        url: typeof window !== "undefined" ? window.location.pathname : "",
        page_url: typeof window !== "undefined" ? window.location.href : "",
      };

      await addToCart(productToAdd, quantity);
      showProductToast(productToAdd, "Added to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    const product = {
      id: id,
      name,
      title: name, // Add title for compatibility
      imageUrl: imageUrl || "/images/product-placeholder.jpg",
      price,
      originalPrice,
      discount,
      brand,
      sku,
      seller,
    };

    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(product);
    }
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    if (isBuyingNow) return; // Prevent multiple requests

    // Validate variant selection first
    const validation = validateVariantSelection();
    if (!validation.isValid) {
      showVariantError(validation.errorMessage);
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn) {
      // Show login popup
      const result = await Swal.fire({
        title: "Login Required",
        text: "Please log in to use the Buy Now feature",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#00478f",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // Save current URL with product info for return after login
        const returnUrl = `${window.location.pathname}${window.location.search}`;
        console.log("ProductInfo buy now: saving return URL:", returnUrl);
        localStorage.setItem("return_url", returnUrl);
        localStorage.setItem(
          "buy_now_pending",
          JSON.stringify({
            product_id: currentProduct.id,
            quantity: quantity,
            product_name: currentProduct.title,
            variant_info: hasVariant
              ? {
                  selectedOptions,
                  variantId: selectedVariantProduct?.variant_id,
                }
              : null,
          })
        );

        // Redirect to login page
        router.push("/auth?tab=login");
      }
      return;
    }

    setIsBuyingNow(true);

    try {
      // For products with variants, use the selected variant's ID
      // For products without variants, use the variant_id from props
      // This ensures variant_id is always sent to the API
      const response = await buyNowCheckout({
        product_id: currentProduct.id,
        quantity: quantity,
        variant_id:
          hasVariant && selectedVariantProduct
            ? selectedVariantProduct.variant_id
            : variantId || currentProduct.id, // Use variantId prop first, then fall back
        ...(hasVariant &&
        selectedVariantProduct &&
        Object.keys(selectedOptions).length > 0
          ? { selected_options: selectedOptions }
          : {}),
      });

      if (response) {
        toast.success("Redirecting to checkout...");
        // Store the temporary cart_id in localStorage to clean up later if needed
        localStorage.setItem("buy_now_cart_id", response.cart_id);
        // Redirect to checkout page with the temporary cart
        router.push(`/checkout?cart_id=${response.cart_id}&buy_now=true`);
      }
    } catch (error) {
      console.error("Failed to initiate buy now:", error);
      toast.error("Failed to initiate buy now");
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Get sku from selectedVariantProduct if available
  const currentSku = selectedVariantProduct ? selectedVariantProduct.sku : sku;

  return (
    <div className="space-y-6">
      {/* Desktop Product Info */}
      <div className="hidden md:block">
        {/* Product title and SKU */}
        <div className="flex justify-between items-start">
          <h1 className="display-3 text-blue-00">{name}</h1>
          <button
            onClick={handleAddToWishlist}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors h-10 w-10 flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={isInWishlist(id) ? faHeart : faHeartRegular}
              className={`text-xl ${
                isInWishlist(id) ? "text-red-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        {/* Price section */}
        <div className="flex items-center justify-between gap-3">
          <div className="left">
            <PriceDisplay
              inrPrice={
                selectedVariantProduct ? selectedVariantProduct.price : price
              }
              className="display-3 text-highlight-50"
            />
            {(selectedVariantProduct
              ? selectedVariantProduct.compare_price &&
                selectedVariantProduct.compare_price >
                  selectedVariantProduct.price
              : originalPrice > price) && (
              <>
                <PriceDisplay
                  inrPrice={
                    selectedVariantProduct?.compare_price || originalPrice
                  }
                  className="text-gray-20 title-1-medium line-through ml-1.5"
                />
                <span className="text-highlight-40 title-1 ml-0.5">
                  -{discount}%
                </span>
              </>
            )}
          </div>
          <span className="title-1-semibold text-black">
            SKU No. {currentSku}
          </span>
        </div>

        {/* Rating and Share section */}
        <div className="flex items-center justify-between mt-4">
          <div className="left flex items-center gap-2">
            <Link
              href={
                brand
                  ? `/brand/${brand.toLowerCase().replace(/\s+/g, "-")}`
                  : "#"
              }
              className="bg-blue-70 flex items-center gap-2 rounded-lg px-3 h-10"
            >
              <Image
                src="/images/brand/store.png"
                alt="Brand"
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="title-1-semibold text-blue-00">
                {brand || seller}
              </span>
            </Link>
          </div>

          <div className="right flex items-center gap-3">
            {reviewCount > 0 && (
              <div className="rating flex items-center gap-1 justify-center bg-blue-70 rounded-lg px-3 h-10">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-highlight-50 text-lg"
                />

                <span className="heading-5 text-blue-00">{rating}</span>
                <span className="heading-3-semibold text-blue-00">
                  ({reviewCount})
                </span>
              </div>
            )}
            <div className="share flex items-center gap-1 justify-center bg-blue-70 rounded-lg px-3 h-10">
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-full h-full"
              >
                <FontAwesomeIcon
                  icon={faShare}
                  className="text-gray-90 text-lg"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="body-large text-gray-90 mt-2">{shortDescription}</p>

        {/* Variants - Only show if has variant options */}
        {hasVariant &&
          variants &&
          variants.variationOptions &&
          variants.variationOptions.length > 0 && (
            <div className="space-y-4 mt-4">
              {isLoadingVariant && (
                <div className="w-full py-2 bg-blue-50 text-blue-00 rounded-md flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-00 border-t-transparent mr-2"></div>
                  <span className="body-medium">
                    Loading variant information...
                  </span>
                </div>
              )}
              {variants.variationOptions.map((option, index) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="title-1-semibold text-black">
                      {option.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      const isAvailable = isOptionValueAvailable(
                        option.name,
                        value
                      );
                      // Disable if previous options haven't been selected
                      const isPreviousSelected =
                        index === 0 ||
                        variants.variationOptions
                          .slice(0, index)
                          .every((prevOpt) => selectedOptions[prevOpt.name]);

                      return (
                        <button
                          key={value}
                          onClick={() =>
                            isPreviousSelected
                              ? handleOptionChange(option.name, value)
                              : null
                          }
                          className={`px-4 py-2 title-1-semibold rounded-md 
                          ${isSelected ? "border-blue-00" : ""}
                          ${
                            isPreviousSelected
                              ? isAvailable
                                ? "bg-blue-70 text-blue-00 border-[1.8px] border-transparent"
                                : "bg-white text-gray-500 border-[1.8px] border-dashed border-gray-400"
                              : "bg-gray-100 text-gray-400 border-[1.8px] border-transparent cursor-not-allowed"
                          }`}
                          disabled={!isPreviousSelected}
                          title={
                            !isPreviousSelected
                              ? "Please select previous options first"
                              : !isAvailable
                              ? "This combination is not available"
                              : ""
                          }
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Quantity */}
        <h3 className="title-1-semibold text-black mt-4">Quantity</h3>
        {/* Buttons */}
        <div className="flex gap-4 mt-3">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="counter flex items-center justify-between px-4 py-0.5 border-2 rounded-lg w-32">
                <button
                  onClick={decrementQuantity}
                  className="p-0 flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-blue-00" />
                </button>
                <span className="heading-4 text-blue-00">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="p-0 flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-blue-00" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isLoadingVariant}
            className={`flex-1 bg-transparent border-2 border-blue-00 text-blue-00 body-large-semibold py-2 px-5 rounded-md flex items-center justify-center gap-2 ${
              isAddingToCart || isLoadingVariant
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-00 border-t-transparent"></div>
                ADDING...
              </>
            ) : isLoadingVariant ? (
              "LOADING VARIANT..."
            ) : (
              "ADD TO CART"
            )}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isBuyingNow || isLoadingVariant}
            className={`flex-1 bg-blue-00 text-white body-large-semibold py-2 px-5 rounded-md flex items-center justify-center gap-2 ${
              isBuyingNow || isLoadingVariant
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isBuyingNow ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                PROCESSING...
              </>
            ) : isLoadingVariant ? (
              "LOADING VARIANT..."
            ) : (
              "BUY NOW"
            )}
          </button>
        </div>
        {/* Only show "Unavailable" when a combination is unavailable */}
        {hasVariant &&
          variants &&
          variants.variationOptions.every((opt) => selectedOptions[opt.name]) &&
          !selectedVariantProduct && (
            <span className="body-large-semibold text-red-500 mt-4">
              Unavailable
            </span>
          )}
      </div>

      {/* Mobile Product Info */}
      <div className="md:hidden space-y-4">
        {/* Product title */}
        <h1 className="heading-2 md:display-3 text-blue-00">{name}</h1>

        {/* Price section */}
        <div className="flex items-center gap-3">
          <PriceDisplay
            inrPrice={
              selectedVariantProduct ? selectedVariantProduct.price : price
            }
            className="heading-2-semibold md:display-3 text-highlight-50"
          />
          {(selectedVariantProduct
            ? selectedVariantProduct.compare_price &&
              selectedVariantProduct.compare_price >
                selectedVariantProduct.price
            : originalPrice > price) && (
            <>
              <PriceDisplay
                inrPrice={
                  selectedVariantProduct?.compare_price || originalPrice
                }
                className="text-gray-20 body-bold md:title-1-medium line-through"
              />
              <span className="text-highlight-40 heading-5 md:title-1">
                -{discount}%
              </span>
            </>
          )}
        </div>

        {/* Rating */}
        {reviewCount && reviewCount > 0 ? (
          <div className="rating w-fit flex items-center gap-1 justify-center bg-blue-70 rounded-lg px-3 h-10 my-2.5">
            <FontAwesomeIcon
              icon={faStar}
              className="text-highlight-50 text-lg"
            />

            <span className="heading-5 text-blue-00">{rating}</span>
            <span className="heading-3-semibold text-blue-00">
              ({reviewCount})
            </span>
          </div>
        ) : null}

        <span className="body-bold md:title-1-semibold text-black">
          SKU No. : {currentSku}
        </span>

        {/* Description */}
        <p className="body-medium md:body-large text-gray-90 mt-2">
          <span dangerouslySetInnerHTML={{ __html: shortDescription }} />
        </p>

        {/* Store information */}
        <div className="flex justify-between gap-5 mt-5">
          <div className="card flex items-center gap-2">
            <Image
              src="/images/brand/store.png"
              alt="Store"
              width={100}
              height={100}
              className="rounded-xl w-10 h-10"
            />
            <div className="info flex flex-col">
              <span className="body md:body-large text-gray-80">Visit</span>
              <span className="text-blue-00 body-bold md:body-large-bold">
                {seller}
              </span>
            </div>
          </div>
          <div className="card flex items-center gap-2">
            <Image
              src="/images/brand/store.png"
              alt="Store"
              width={100}
              height={100}
              className="rounded-xl w-10 h-10"
            />
            <div className="info flex flex-col">
              <span className="body md:body-large text-gray-80">Sold by</span>
              <span className="text-blue-00 body-bold md:body-large-bold">
                {seller}
              </span>
            </div>
          </div>
        </div>

        {/* Variants - Only show if has variant options */}
        {hasVariant &&
          variants &&
          variants.variationOptions &&
          variants.variationOptions.length > 0 && (
            <div className="space-y-4 mt-4">
              {isLoadingVariant && (
                <div className="w-full py-2 bg-blue-50 text-blue-00 rounded-md flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-00 border-t-transparent mr-2"></div>
                  <span className="body-medium">
                    Loading variant information...
                  </span>
                </div>
              )}
              {variants.variationOptions.map((option, index) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="body-bold md:title-1-semibold text-black">
                      {option.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      const isAvailable = isOptionValueAvailable(
                        option.name,
                        value
                      );
                      // Disable if previous options haven't been selected
                      const isPreviousSelected =
                        index === 0 ||
                        variants.variationOptions
                          .slice(0, index)
                          .every((prevOpt) => selectedOptions[prevOpt.name]);

                      return (
                        <button
                          key={value}
                          onClick={() =>
                            isPreviousSelected
                              ? handleOptionChange(option.name, value)
                              : null
                          }
                          className={`px-3 py-1.5 body-semibold md:title-1-semibold rounded-md 
                          ${isSelected ? "border-blue-00" : ""}
                          ${
                            isPreviousSelected
                              ? isAvailable
                                ? "bg-blue-70 text-blue-00 border-[1.5px] border-transparent"
                                : "bg-white text-gray-500 border-[1.5px] border-dashed border-gray-400"
                              : "bg-gray-100 text-gray-400 border-[1.5px] border-transparent cursor-not-allowed"
                          }`}
                          disabled={!isPreviousSelected}
                          title={
                            !isPreviousSelected
                              ? "Please select previous options first"
                              : !isAvailable
                              ? "This combination is not available"
                              : ""
                          }
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Quantity */}
        <h3 className="body-bold md:title-1-semibold text-black">Quantity</h3>
        <div className="w-full flex items-center justify-between gap-2">
          <div className="space-y-2">
            <div className="counter flex items-center justify-between px-4 border-2 rounded-lg w-32">
              <button
                onClick={decrementQuantity}
                className="p-0 flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                <FontAwesomeIcon icon={faMinus} className="text-blue-00" />
              </button>
              <span className="heading-4 text-blue-00">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="p-0 flex items-center justify-center"
                aria-label="Increase quantity"
              >
                <FontAwesomeIcon icon={faPlus} className="text-blue-00" />
              </button>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isLoadingVariant}
            className={` bg-transparent border-2 border-blue-00 text-blue-00 body-large-semibold py-2 px-5 rounded-md flex items-center justify-center gap-2 w-full ${
              isAddingToCart || isLoadingVariant
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-00 border-t-transparent"></div>
                ADDING...
              </>
            ) : isLoadingVariant ? (
              "LOADING VARIANT..."
            ) : (
              "ADD TO CART"
            )}
          </button>
        </div>

        {/* Buttons */}
        <div className="mt-5">
          <button
            onClick={handleBuyNow}
            disabled={isBuyingNow || isLoadingVariant}
            className={`w-full bg-blue-00 text-white body-large-semibold py-2 px-5 rounded-md mt-2 flex items-center justify-center gap-2 ${
              isBuyingNow || isLoadingVariant
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isBuyingNow ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                PROCESSING...
              </>
            ) : isLoadingVariant ? (
              "LOADING VARIANT..."
            ) : (
              "BUY NOW"
            )}
          </button>
        </div>
        {/* Only show "Unavailable" when a combination is unavailable */}
        {hasVariant &&
          variants &&
          variants.variationOptions.every((opt) => selectedOptions[opt.name]) &&
          !selectedVariantProduct && (
            <span className="body-medium-semibold text-red-500 mt-4">
              Unavailable
            </span>
          )}
      </div>
    </div>
  );
}
