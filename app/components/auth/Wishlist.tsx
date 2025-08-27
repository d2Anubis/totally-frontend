"use client";

import { useState } from "react";
import Link from "next/link";
import ProductSection from "@/app/components/common/ProductSection";
import PriceDisplay from "@/app/components/common/PriceDisplay";
import { useShop } from "@/app/context/ShopContext";
import { toast } from "react-hot-toast";
import WishlistCard from "@/app/components/wishlist/WishlistCard";

export default function Wishlist() {
  const { wishlist, addToCart, removeFromWishlist } = useShop();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Calculate total savings
  const calculateTotalSavings = () => {
    return wishlist.reduce((total, item) => {
      if (item.originalPrice && item.price) {
        return total + (item.originalPrice - item.price);
      }
      return total;
    }, 0);
  };

  const calculateSelectedSavings = () => {
    return wishlist
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => {
        if (item.originalPrice && item.price) {
          return total + (item.originalPrice - item.price);
        }
        return total;
      }, 0);
  };

  const totalValue = wishlist.reduce((total, item) => total + item.price, 0);
  const totalSavings = calculateTotalSavings();
  const selectedSavings = calculateSelectedSavings();

  // New bulk operation handlers
  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => {
      addToCart(item, 1);
    });
    // Clear the wishlist after moving all items to cart
    wishlist.forEach((item) => {
      removeFromWishlist(item.id);
    });
    toast.success("All items moved to cart!");
  };

  const handleClearWishlist = () => {
    wishlist.forEach((item) => {
      removeFromWishlist(item.id);
    });
    toast.success("Wishlist cleared!");
  };

  // Selection mode handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.map((item) => item.id));
    }
  };

  const handleMoveSelectedToCart = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }

    wishlist
      .filter((item) => selectedItems.includes(item.id))
      .forEach((item) => {
        addToCart(item, 1);
        removeFromWishlist(item.id);
      });

    setSelectedItems([]);
    toast.success(`${selectedItems.length} item(s) moved to cart!`);
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }

    selectedItems.forEach((id) => {
      removeFromWishlist(id);
    });

    setSelectedItems([]);
    toast.success(`${selectedItems.length} item(s) removed from wishlist!`);
  };

  // Sample recommended products - would typically come from API
  const recommendedProducts = [
    {
      id: "1",
      title: "Ashwagandha Extract Tablets",
      imageUrl: "/images/common/new_arrival.png",
      price: 499,
      originalPrice: 799,
      discount: 38,
      brand: "Himalaya",
      rating: 4.5,
      isQuickShip: true,
      url: "/product/1",
      isSale: false,
    },
    {
      id: "2",
      title: "Chyawanprash",
      imageUrl: "/images/common/new_arrival.png",
      price: 349,
      originalPrice: 499,
      discount: 30,
      brand: "Dabur",
      rating: 4.8,
      url: "/product/2",
      isSale: true,
    },
    {
      id: "3",
      title: "Tulsi Extract Capsules",
      imageUrl: "/images/common/new_arrival.png",
      price: 279,
      originalPrice: 399,
      discount: 30,
      brand: "Organic India",
      rating: 4.2,
      isQuickShip: true,
      url: "/product/3",
      isSale: false,
    },
    {
      id: "4",
      title: "Amla Juice",
      imageUrl: "/images/common/new_arrival.png",
      price: 199,
      originalPrice: 299,
      discount: 33,
      brand: "Patanjali",
      rating: 4.3,
      url: "/product/4",
      isSale: true,
    },
  ];

  return (
    <div className="py-3 md:py-6">
      <h1 className="heading-2-semibold mb-4 md:mb-8 bg-white rounded-lg p-3 md:p-4">
        My Wishlist
      </h1>

      {wishlist.length > 0 ? (
        <>
          {/* Savings Summary Card */}
          <div className="bg-white rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="heading-3 text-gray-10">Wishlist Summary</h2>
                <p className="body-large text-gray-30 mt-1">
                  {selectionMode && selectedItems.length > 0
                    ? `${selectedItems.length} items selected`
                    : `${wishlist.length} items in your wishlist`}
                </p>
              </div>
              <div className="text-right">
                <p className="body-large text-gray-30">Total Value</p>
                <PriceDisplay
                  inrPrice={
                    selectionMode && selectedItems.length > 0
                      ? wishlist
                          .filter((item) => selectedItems.includes(item.id))
                          .reduce((sum, item) => sum + item.price, 0)
                      : totalValue
                  }
                  className="title-1-semibold text-blue-00"
                />
              </div>
            </div>

            {(totalSavings > 0 || (selectionMode && selectedSavings > 0)) && (
              <div className="mt-4 bg-highlight-60 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="small-semibold text-highlight-40">
                      {selectionMode && selectedItems.length > 0
                        ? "You're saving on selected items"
                        : "You're saving on all items"}
                    </h3>
                  </div>
                  <div>
                    <PriceDisplay
                      inrPrice={
                        selectionMode && selectedItems.length > 0
                          ? selectedSavings
                          : totalSavings
                      }
                      className="title-3-semibold text-highlight-40"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <p className="body-medium md:title-1-medium text-gray-10">
                  {wishlist.length} items in your wishlist
                </p>
                <button
                  onClick={toggleSelectionMode}
                  className="text-blue-00 underline body-medium md:title-1-medium text-left"
                >
                  {selectionMode ? "Cancel Selection" : "Select Items"}
                </button>
              </div>

              {selectionMode ? (
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="bg-blue-70 text-blue-00 py-2 px-4 rounded-md body-semibold hover:bg-blue-80 transition-colors duration-300 w-full md:w-auto"
                  >
                    {selectedItems.length === wishlist.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <button
                    onClick={handleMoveSelectedToCart}
                    disabled={selectedItems.length === 0}
                    className={`py-2 px-4 rounded-md body-semibold transition-colors duration-300 w-full md:w-auto ${
                      selectedItems.length === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-00 text-white hover:bg-blue-10"
                    }`}
                  >
                    <span className="md:hidden">
                      Move to Cart ({selectedItems.length})
                    </span>
                    <span className="hidden md:inline">
                      Move Selected to Cart ({selectedItems.length})
                    </span>
                  </button>
                  <button
                    onClick={handleRemoveSelected}
                    disabled={selectedItems.length === 0}
                    className={`py-2 px-4 rounded-md body-semibold transition-colors duration-300 w-full md:w-auto ${
                      selectedItems.length === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-red-500 border border-red-500 hover:bg-red-50"
                    }`}
                  >
                    <span className="md:hidden">
                      Remove ({selectedItems.length})
                    </span>
                    <span className="hidden md:inline">Remove Selected</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                  <button
                    onClick={handleMoveAllToCart}
                    className="bg-blue-00 text-white py-2 px-4 rounded-md body-semibold hover:bg-blue-10 transition-colors duration-300 w-full md:w-auto"
                  >
                    Move All to Cart
                  </button>
                  <button
                    onClick={handleClearWishlist}
                    className="bg-white text-red-500 border border-red-500 py-2 px-4 rounded-md body-semibold hover:bg-red-50 transition-colors duration-300 w-full md:w-auto"
                  >
                    Clear Wishlist
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {wishlist.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  selectionMode={selectionMode}
                  isSelected={selectedItems.includes(item.id)}
                  onToggleSelect={() => toggleItemSelection(item.id)}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 md:py-12 bg-white rounded-lg px-4">
          <h2 className="title-1-semibold text-gray-900 mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven&apos;t added any products to your wishlist yet.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-00 text-white font-medium px-6 py-3 rounded-md hover:bg-blue-10 transition"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {wishlist.length > 0 && (
        <ProductSection
          title="You may also like"
          products={recommendedProducts}
          categoryUrl="/recommended"
          className="mt-6 md:mt-12 bg-white rounded-2xl px-3 md:px-6 py-4 md:py-6"
        />
      )}
    </div>
  );
}
