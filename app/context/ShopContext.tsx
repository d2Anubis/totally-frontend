"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getCartByUser,
  addItemToCart,
  removeItemFromCart,
  CartItem as CartItemType,
  addMultipleItemsToCart,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  setCartItemQuantity,
} from "@/app/lib/services/cartService";
import {
  getWishlistByUser,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  WishlistItem,
} from "@/app/lib/services/wishlistService";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-hot-toast";

// Update Product type to match API response
export type Product = {
  id: string;
  variant_id?: string; // Add variant_id for cart operations
  title?: string;
  name?: string;
  imageUrl?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brand?: string;
  rating?: number;
  url?: string; // Add URL for proper redirection
  page_url?: string; // Add page_url for URL construction
  quantity?: number;
  sku?: string;
  description?: string;
  seller?: string;
  reviewCount?: number;
  isQuickShip?: boolean;
  isSale?: boolean;
  option_values?: { [key: string]: string }; // Add option_values for variant information
  image_urls?: Array<{ url: string; position: number }>; // Add image_urls array
  compare_price?: number; // Add compare_price
  stock_qty?: number; // Add stock_qty
};

// Guest cart item type
export interface GuestCartItem {
  id: string;
  variant_id: string; // Changed from product_id to variant_id
  product_id: string; // Keep product_id for product information
  quantity: number;
  price: number;
  Product: {
    id: string;
    title: string;
    brand?: string; // Add brand information
    page_url?: string; // Add page_url for URL construction
    image_urls: Array<{
      url: string;
      position: number;
    }>;
    price: number;
    compare_price?: number;
    option_values?: Record<string, string>; // Add option_values for variant information
    url?: string; // Add URL for proper redirection
    stock_qty?: number; // Add stock_qty
  };
}

// Union type for cart items
export type CartItemUnion = CartItemType | GuestCartItem;

// Update Cart type to match API response
export interface Cart {
  id: string;
  user_id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  CartItems: CartItemType[];
}

// Update context type
interface ShopContextType {
  cart: CartItemUnion[];
  wishlist: Product[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (
    cartItemId: string,
    newQuantity: number
  ) => Promise<void>;
  increaseQuantity: (cartItemId: string, amount?: number) => Promise<void>;
  decreaseQuantity: (cartItemId: string, amount?: number) => Promise<void>;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  wishlistCount: number;
  loadUserCart: (userId: string) => Promise<void>;
  clearCart: () => void;
  isCartLoading: boolean;
}

// Create the context with default values
const ShopContext = createContext<ShopContextType>({
  cart: [],
  wishlist: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateCartQuantity: async () => {},
  increaseQuantity: async () => {},
  decreaseQuantity: async () => {},
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  isInCart: () => false,
  cartTotal: 0,
  cartCount: 0,
  wishlistCount: 0,
  loadUserCart: async () => {},
  clearCart: () => {},
  isCartLoading: false,
});

// Local storage keys
const GUEST_CART_KEY = "guest_cart";
const GUEST_WISHLIST_KEY = "guest_wishlist";

// Create a provider component
export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItemUnion[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const { user, silentLogout } = useAuth();

  // Helper to generate a unique ID for guest cart items
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Helper to validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Load guest cart from localStorage
  const loadGuestCart = () => {
    try {
      const storedCart = localStorage.getItem(GUEST_CART_KEY);
      if (storedCart) {
        return JSON.parse(storedCart) as GuestCartItem[];
      }
    } catch (error) {
      console.error("Failed to load guest cart from localStorage:", error);
    }
    return [];
  };

  // Save guest cart to localStorage
  const saveGuestCart = (cartItems: GuestCartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save guest cart to localStorage:", error);
    }
  };

  // Load guest wishlist from localStorage
  const loadGuestWishlist = () => {
    try {
      const storedWishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
      if (storedWishlist) {
        return JSON.parse(storedWishlist) as Product[];
      }
    } catch (error) {
      console.error("Failed to load guest wishlist from localStorage:", error);
    }
    return [];
  };

  // Save guest wishlist to localStorage
  const saveGuestWishlist = (wishlistItems: Product[]) => {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error("Failed to save guest wishlist to localStorage:", error);
    }
  };

  // Track if we've already synced for this user session
  const [hasSyncedForUser, setHasSyncedForUser] = useState<string | null>(null);

  // Automatically load cart and wishlist when user changes
  useEffect(() => {
    if (user?.id) {
      const userId = String(user.id);

      // Only sync guest data if we haven't already synced for this user in this session
      if (hasSyncedForUser !== userId) {
        console.log(
          "User logged in for first time, syncing guest data and loading server data"
        );

        // When user logs in, sync guest cart to server first, then load server data
        const syncGuestDataToServer = async () => {
          setIsCartLoading(true);

          try {
            // Check if there's guest cart data to sync
            const guestCart = loadGuestCart();
            if (guestCart.length > 0) {
              console.log(
                `Syncing ${guestCart.length} guest cart items to server`
              );

              // Add guest cart items to user's cart using bulk API
              // Filter out items with invalid variant IDs and ensure variant_id is string
              const validItems = guestCart.filter((item) => {
                if (!item.variant_id || item.quantity <= 0) {
                  console.warn("Skipping invalid cart item:", item);
                  return false;
                }
                // Check if variant_id is a valid UUID
                const variantIdStr = String(item.variant_id);
                if (!isValidUUID(variantIdStr)) {
                  console.warn(
                    `Skipping item with invalid UUID variant_id: ${variantIdStr}`
                  );
                  return false;
                }
                return true;
              });

              if (validItems.length > 0) {
                console.log(
                  `Found ${validItems.length} valid items to sync out of ${guestCart.length} total`
                );

                const bulkItems = {
                  products: validItems.map((item) => ({
                    variant_id: String(item.variant_id), // Changed from product_id to variant_id
                    quantity: item.quantity,
                  })),
                };

                try {
                  const success = await addMultipleItemsToCart(
                    userId,
                    bulkItems
                  );

                  if (success) {
                    console.log("Successfully synced guest cart to server");

                    // Show notification if some items were skipped
                    const skippedCount = guestCart.length - validItems.length;
                    if (skippedCount > 0) {
                      toast(
                        `${skippedCount} item(s) couldn't be added to your cart due to invalid product IDs`,
                        {
                          icon: "⚠️",
                        }
                      );
                    } else {
                      toast.success("Your cart has been restored");
                    }

                    // Clear the guest cart after syncing
                    localStorage.removeItem(GUEST_CART_KEY);
                  } else {
                    console.error("Failed to sync guest cart to server");
                    toast.error(
                      "Failed to restore your cart. Please try again."
                    );

                    // Don't clear guest cart if sync failed - user can try again
                  }
                } catch (syncError) {
                  console.error("Error during guest cart sync:", syncError);
                  toast.error("Failed to restore your cart. Please try again.");

                  // Don't clear guest cart if sync failed - user can try again
                }
              } else {
                console.log("No valid items to sync from guest cart");

                // Notify user if all items were invalid
                if (guestCart.length > 0) {
                  toast(
                    "Your guest cart contained invalid items that couldn't be restored",
                    {
                      icon: "⚠️",
                    }
                  );
                }

                // Still clear the guest cart if all items were invalid
                localStorage.removeItem(GUEST_CART_KEY);
              }
            }

            // Now load the server cart data
            await loadUserCart(userId);

            // Also sync guest wishlist if any
            await loadUserWishlist(userId);

            // Mark this user as synced for this session
            setHasSyncedForUser(userId);
          } catch (error) {
            console.error("Error syncing guest data to server:", error);
          } finally {
            setIsCartLoading(false);
          }
        };

        syncGuestDataToServer();
      } else {
        // User already synced, just load the cart data
        console.log("User already synced, loading cart data");
        loadUserCart(userId);
      }
    } else {
      // User is logged out or not authenticated
      console.log("No user logged in, loading guest cart and wishlist data");

      // Reset sync tracking when user logs out
      setHasSyncedForUser(null);

      // Load guest cart and wishlist if user is not logged in
      setCart(loadGuestCart());
      setWishlist(loadGuestWishlist());
      setIsCartLoading(false);
    }
  }, [user]);

  // Initialize wishlist from localStorage on component mount
  useEffect(() => {
    // Only load from localStorage if:
    // 1. User is not logged in (no API fetching will occur)
    // 2. Wishlist is currently empty (no conflicts)
    if (!user && wishlist.length === 0) {
      const guestWishlistData = loadGuestWishlist();
      if (guestWishlistData.length > 0) {
        console.log(
          "Initializing wishlist from localStorage:",
          guestWishlistData.length,
          "items"
        );
        setWishlist(guestWishlistData);
      }
    }
  }, [user, wishlist.length]);

  // Load user's cart
  const loadUserCart = async (userId: string) => {
    if (!userId) return;
    try {
      console.log("loadUserCart called for userId:", userId);
      setIsCartLoading(true);
      const response = await getCartByUser(userId);

      if (response?.data) {
        // Update to use CartItems from the response
        console.log("Setting cart with CartItems:", response.data.CartItems);
        setCart(response.data.CartItems || []);
      } else {
        // If no cart exists for user, set empty cart
        console.log("No cart data found, setting empty cart");
        setCart([]);
      }
    } catch (error) {
      console.error("Failed to load user cart:", error);

      // Check if this is an authentication error
      if ((error as { isAuthError?: boolean }).isAuthError) {
        console.log("Authentication error detected, performing silent logout");
        silentLogout();
        return;
      }

      setCart([]);
    } finally {
      setIsCartLoading(false);
    }
  };

  // Load user's wishlist
  const loadUserWishlist = async (userId: string) => {
    if (!userId) return;
    try {
      // First, get wishlist from API
      const response = await getWishlistByUser(userId);
      if (response?.data && response.data.length > 0) {
        // Convert WishlistItems to Product format for the state
        const products: Product[] = response.data.map((item: WishlistItem) => {
          const backendProduct = item.Product;

          // Get the primary image URL
          const primaryImage =
            backendProduct.image_urls && backendProduct.image_urls.length > 0
              ? backendProduct.image_urls.find((img) => img.position === 1)
                  ?.url || backendProduct.image_urls[0]?.url
              : "";

          // Calculate discount
          const discount =
            backendProduct.compare_price &&
            backendProduct.price &&
            backendProduct.compare_price > backendProduct.price
              ? Math.round(
                  ((backendProduct.compare_price - backendProduct.price) /
                    backendProduct.compare_price) *
                    100
                )
              : undefined;

          return {
            id: backendProduct.id,
            title: backendProduct.title,
            name: backendProduct.title,
            price: Number(backendProduct.price),
            imageUrl: primaryImage,
            image: primaryImage,
            originalPrice: backendProduct.compare_price
              ? Number(backendProduct.compare_price)
              : undefined,
            brand: backendProduct.brand || "Brand",
            discount,
            sku: backendProduct.sku,
            description:
              backendProduct.description || backendProduct.short_description,
            url: backendProduct.page_url
              ? `/product/${backendProduct.page_url}`
              : `/product/${backendProduct.id}`,
            isQuickShip: backendProduct.stock_qty > 0,
            isSale:
              backendProduct.compare_price && backendProduct.price
                ? backendProduct.price < backendProduct.compare_price
                : false,
            rating: 4.0 + Math.random() * 1.0, // Demo rating
            reviewCount: Math.floor(Math.random() * 500) + 10, // Demo review count
            seller: backendProduct.Seller?.firm_name || undefined,
          };
        });

        // Update state first
        setWishlist(products);

        // Then save to localStorage for consistency (no need to trigger effects)
        saveGuestWishlist(products);

        // Check if there's a guest wishlist to merge (if not already merged)
        const guestWishlist = loadGuestWishlist();
        if (guestWishlist.length > 0) {
          console.log(
            `Found ${guestWishlist.length} items in guest wishlist to sync`
          );

          // Add guest wishlist items to user's wishlist one by one
          for (const product of guestWishlist) {
            try {
              await apiAddToWishlist(userId, product.id);
            } catch (error) {
              console.error(
                `Failed to sync guest wishlist item ${product.id}:`,
                error
              );
            }
          }

          // Clear the guest wishlist after attempting to merge
          localStorage.removeItem(GUEST_WISHLIST_KEY);
          console.log("Guest wishlist cleared after sync attempt");

          // Fetch updated wishlist once at the end (avoid multiple calls)
          try {
            const updatedResponse = await getWishlistByUser(userId);
            if (updatedResponse?.data && updatedResponse.data.length > 0) {
              const updatedProducts: Product[] = updatedResponse.data.map(
                (item: WishlistItem) => {
                  // Same mapping logic as above
                  const backendProduct = item.Product;
                  const primaryImage =
                    backendProduct.image_urls &&
                    backendProduct.image_urls.length > 0
                      ? backendProduct.image_urls.find(
                          (img) => img.position === 1
                        )?.url || backendProduct.image_urls[0]?.url
                      : "";

                  const discount =
                    backendProduct.compare_price &&
                    backendProduct.price &&
                    backendProduct.compare_price > backendProduct.price
                      ? Math.round(
                          ((backendProduct.compare_price -
                            backendProduct.price) /
                            backendProduct.compare_price) *
                            100
                        )
                      : undefined;

                  return {
                    id: backendProduct.id,
                    title: backendProduct.title,
                    name: backendProduct.title,
                    price: Number(backendProduct.price),
                    imageUrl: primaryImage,
                    image: primaryImage,
                    originalPrice: backendProduct.compare_price
                      ? Number(backendProduct.compare_price)
                      : undefined,
                    brand: backendProduct.brand || "Brand",
                    discount,
                    sku: backendProduct.sku,
                    description:
                      backendProduct.description ||
                      backendProduct.short_description,
                    url: backendProduct.page_url
                      ? `/product/${backendProduct.page_url}`
                      : `/product/${backendProduct.id}`,
                    isQuickShip: backendProduct.stock_qty > 0,
                    isSale:
                      backendProduct.compare_price && backendProduct.price
                        ? backendProduct.price < backendProduct.compare_price
                        : false,
                    rating: 4.0 + Math.random() * 1.0,
                    reviewCount: Math.floor(Math.random() * 500) + 10,
                    seller: backendProduct.Seller?.firm_name || undefined,
                  };
                }
              );

              // Update state and localStorage with final data
              setWishlist(updatedProducts);
              saveGuestWishlist(updatedProducts);
            }
          } catch (error) {
            console.error("Failed to get updated wishlist after sync:", error);
          }
        }
      } else {
        // If no wishlist or empty, set empty array and clear localStorage
        setWishlist([]);
        saveGuestWishlist([]);
      }
    } catch (error) {
      console.error("Failed to load user wishlist:", error);

      // Check if this is an authentication error
      if ((error as { isAuthError?: boolean }).isAuthError) {
        console.log(
          "Authentication error detected while loading wishlist, performing silent logout"
        );
        silentLogout();
        return;
      }

      setWishlist([]);
    }
  };

  // Update cart calculations when cart changes
  useEffect(() => {
    const total = cart.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    setCartTotal(total);
    setCartCount(count);
  }, [cart]);

  // Update wishlist count
  useEffect(() => {
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  // Add a product to the cart
  const addToCart = async (product: Product, quantity: number) => {
    console.log("Adding to cart:", { product, quantity, userId: user?.id });

    if (!product?.id) {
      console.error("Product ID is missing. Cannot add to cart.", product);
      toast.error("Product ID is missing. Cannot add to cart.");
      return;
    }

    // Check if we have variant_id, if not, use product.id as fallback
    const variantId = product.variant_id || product.id;
    if (!variantId) {
      console.error("Variant ID is missing. Cannot add to cart.", product);
      toast.error("Product variant is missing. Cannot add to cart.");
      return;
    }

    // If we're using product.id as fallback, log a warning to help with debugging
    if (!product.variant_id && product.id) {
      console.warn(
        "Using product.id as variant_id fallback for product:",
        product.id,
        "Make sure the ProductInfo component is passing the correct variant_id prop."
      );
    }

    if (user?.id) {
      // For logged-in users, use the API
      try {
        const userId = String(user.id);
        console.log("Calling addItemToCart with:", {
          userId,
          variant_id: variantId,
          quantity,
        });

        const success = await addItemToCart(userId, {
          variant_id: variantId, // Changed from product_id to variant_id
          quantity: quantity,
        });

        if (success) {
          // Immediately load the updated cart
          await loadUserCart(userId);
          console.log("Successfully added to cart and reloaded cart");
        } else {
          console.error("API returned false for add to cart");
          toast.error("Failed to add item to cart");
        }
      } catch (error) {
        console.error("Failed to add item to cart:", error);

        // Check if this is an authentication error
        if ((error as { isAuthError?: boolean }).isAuthError) {
          console.log(
            "Authentication error detected while adding to cart, performing silent logout"
          );
          silentLogout();
          return;
        }

        toast.error("Failed to add item to cart");
      }
    } else {
      // For guests, use localStorage
      const guestCart = loadGuestCart();

      // Check if product already exists in cart (check by variant_id)
      const existingItemIndex = guestCart.findIndex(
        (item) => item.variant_id === (product.variant_id || product.id)
      );

      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        guestCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        const newItem: GuestCartItem = {
          id: generateUniqueId(),
          variant_id: product.variant_id || product.id, // Use variant_id if available, fallback to product.id
          product_id: product.id,
          quantity: quantity,
          price: product.price,
          Product: {
            id: product.id,
            title: product.title || product.name || "Product",
            brand: product.brand,
            page_url: product.page_url,
            image_urls:
              product.image_urls && product.image_urls.length > 0
                ? product.image_urls
                : product.imageUrl || product.image
                ? [
                    {
                      url: product.imageUrl || product.image || "",
                      position: 1,
                    },
                  ]
                : [],
            price: product.price,
            compare_price: product.originalPrice || product.compare_price,
            option_values: product.option_values, // Add variant option values
            url: product.url, // Add the product URL for proper redirection
            stock_qty: product.stock_qty,
          },
        };
        guestCart.push(newItem);
      }

      // Save updated cart to localStorage and update state
      saveGuestCart(guestCart);
      setCart(guestCart);
      console.log("Successfully added to guest cart");
    }
  };

  // Check if a product is in the cart
  const isInCart = (productId: string) => {
    return cart.some((item) => {
      // Check if this is a server-side cart item (CartItemType) with Variant structure
      if ("Variant" in item && item.Variant?.Product?.id) {
        return item.Variant.Product.id === productId;
      }
      // Check for legacy server-side cart item structure
      else if ("product_id" in item && typeof item.product_id === "string") {
        return item.product_id === productId;
      }
      // Otherwise it's a guest cart item (GuestCartItem)
      else if ("Product" in item && item.Product) {
        return item.Product.id === productId;
      }
      return false;
    });
  };

  // Remove a product from the cart
  const removeFromCart = async (cartItemId: string) => {
    if (user?.id) {
      // For logged-in users, use the API
      try {
        const success = await removeItemFromCart(cartItemId);
        if (success && user?.id) {
          // Reload the entire cart after removing item
          await loadUserCart(String(user.id));
          console.log("Successfully removed from cart and reloaded cart");
        } else {
          console.error("API returned false for remove from cart");
          toast.error("Failed to remove item from cart");
        }
      } catch (error) {
        console.error("Failed to remove item from cart:", error);
        toast.error("Failed to remove item from cart");
      }
    } else {
      // For guests, use localStorage
      const guestCart = loadGuestCart();
      const updatedCart = guestCart.filter((item) => item.id !== cartItemId);
      saveGuestCart(updatedCart);
      setCart(updatedCart);
      console.log("Successfully removed from guest cart");
    }
  };

  // Update the quantity of a product in the cart to an exact value
  const updateCartQuantity = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      // If quantity is less than 1, remove the item
      await removeFromCart(cartItemId);
      return;
    }

    if (user?.id) {
      // For logged-in users, use the new updateCartItemQuantity API
      try {
        // Find the cart item to get its variant_id and current quantity
        const cartItem = cart.find((item) => item.id === cartItemId);
        if (!cartItem) return;

        let currentQuantity: number;

        // Check which type of cart item we have and get variant_id
        let variantId: string;
        if (
          "product_id" in cartItem &&
          typeof cartItem.product_id === "string"
        ) {
          // Server-side cart item - we need to get variant_id from the cart item
          // For now, we'll use product_id as fallback since server cart items don't have variant_id yet
          variantId = cartItem.product_id;
          currentQuantity = cartItem.quantity;
        } else if ("variant_id" in cartItem && cartItem.variant_id) {
          // Guest cart item
          variantId = cartItem.variant_id;
          currentQuantity = cartItem.quantity;
        } else {
          console.error(
            "Unable to determine variant ID for cart item:",
            cartItem
          );
          return;
        }

        // Use the new setCartItemQuantity helper which calculates the difference
        const result = await setCartItemQuantity(
          cartItemId,
          variantId,
          newQuantity,
          currentQuantity
        );

        if (result?.success) {
          // Reload the cart to get the updated state
          const userId = String(user.id);
          await loadUserCart(userId);

          if (result.message) {
            console.log(result.message);
          }
        } else {
          console.error("Failed to update cart quantity:", result?.message);
          toast.error(result?.message || "Failed to update cart quantity");
        }
      } catch (error) {
        console.error("Failed to update cart quantity:", error);
        toast.error("Failed to update cart quantity");

        // If failed, reload cart to reset to server state
        if (user?.id) {
          loadUserCart(String(user.id));
        }
      }
    } else {
      // For guests, use localStorage
      const guestCart = loadGuestCart();
      const updatedCart = guestCart.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      saveGuestCart(updatedCart);
      setCart(updatedCart);
    }
  };

  // Increase quantity by a specific amount (default 1)
  const increaseQuantity = async (cartItemId: string, amount: number = 1) => {
    if (user?.id) {
      try {
        // Find the cart item to get its variant_id
        const cartItem = cart.find((item) => item.id === cartItemId);
        if (!cartItem) return;

        // Check which type of cart item we have and get variant_id
        let variantId: string;
        if (
          "product_id" in cartItem &&
          typeof cartItem.product_id === "string"
        ) {
          // Server-side cart item - use product_id as fallback
          variantId = cartItem.product_id;
        } else if ("variant_id" in cartItem && cartItem.variant_id) {
          // Guest cart item
          variantId = cartItem.variant_id;
        } else {
          console.error(
            "Unable to determine variant ID for cart item:",
            cartItem
          );
          return;
        }

        const result = await increaseCartItemQuantity(
          cartItemId,
          variantId,
          amount
        );

        if (result?.success) {
          // Reload the cart to get the updated state
          const userId = String(user.id);
          await loadUserCart(userId);
        } else {
          console.error("Failed to increase cart quantity:", result?.message);
          toast.error(result?.message || "Failed to increase cart quantity");
        }
      } catch (error) {
        console.error("Failed to increase cart quantity:", error);
        toast.error("Failed to increase cart quantity");
      }
    } else {
      // For guests, use current logic
      const cartItem = cart.find((item) => item.id === cartItemId);
      if (cartItem) {
        await updateCartQuantity(cartItemId, cartItem.quantity + amount);
      }
    }
  };

  // Decrease quantity by a specific amount (default 1)
  const decreaseQuantity = async (cartItemId: string, amount: number = 1) => {
    if (user?.id) {
      try {
        // Find the cart item to get its variant_id
        const cartItem = cart.find((item) => item.id === cartItemId);
        if (!cartItem) return;

        // Check which type of cart item we have and get variant_id
        let variantId: string;
        if (
          "product_id" in cartItem &&
          typeof cartItem.product_id === "string"
        ) {
          // Server-side cart item - use product_id as fallback
          variantId = cartItem.product_id;
        } else if ("variant_id" in cartItem && cartItem.variant_id) {
          // Guest cart item
          variantId = cartItem.variant_id;
        } else {
          console.error(
            "Unable to determine variant ID for cart item:",
            cartItem
          );
          return;
        }

        const result = await decreaseCartItemQuantity(
          cartItemId,
          variantId,
          amount
        );

        if (result?.success) {
          // Reload the cart to get the updated state
          const userId = String(user.id);
          await loadUserCart(userId);
        } else {
          console.error("Failed to decrease cart quantity:", result?.message);
          toast.error(result?.message || "Failed to decrease cart quantity");
        }
      } catch (error) {
        console.error("Failed to decrease cart quantity:", error);
        toast.error("Failed to decrease cart quantity");
      }
    } else {
      // For guests, use current logic
      const cartItem = cart.find((item) => item.id === cartItemId);
      if (cartItem) {
        const newQuantity = Math.max(0, cartItem.quantity - amount);
        if (newQuantity === 0) {
          await removeFromCart(cartItemId);
        } else {
          await updateCartQuantity(cartItemId, newQuantity);
        }
      }
    }
  };

  // Add a product to the wishlist
  const addToWishlist = async (product: Product) => {
    if (user?.id) {
      try {
        const userId = String(user.id);

        // Check if the product is already in the wishlist
        const isAlreadyInWishlist = wishlist.some(
          (item) => item.id === product.id
        );

        if (isAlreadyInWishlist) {
          // If product is already in wishlist, remove it
          console.log("Product already in wishlist, removing:", product.id);
          const success = await apiRemoveFromWishlist(userId, product.id);

          if (success) {
            // Update the local state first
            const updatedWishlist = wishlist.filter(
              (item) => item.id !== product.id
            );
            setWishlist(updatedWishlist);

            // Then update localStorage
            saveGuestWishlist(updatedWishlist);

            // Show success message
            toast.success("Removed from wishlist");
          }
        } else {
          // If product is not in wishlist, add it
          console.log("Product not in wishlist, adding:", product.id);
          const success = await apiAddToWishlist(userId, product.id);

          if (success) {
            // Update the local state first
            const updatedWishlist = [...wishlist, product];
            setWishlist(updatedWishlist);

            // Then update localStorage
            saveGuestWishlist(updatedWishlist);
          }
        }
      } catch (error) {
        console.error("Failed to update wishlist:", error);
        toast.error("Failed to update wishlist");
      }
    } else {
      // For guests, show login prompt instead of silently adding to localStorage
      import("sweetalert2")
        .then((Swal) => {
          Swal.default
            .fire({
              title: "Login Required",
              text: "Please login to save items to your wishlist",
              icon: "info",
              showCancelButton: true,
              confirmButtonColor: "#00478f",
              cancelButtonColor: "#d33",
              confirmButtonText: "Login Now",
              cancelButtonText: "Continue Shopping",
            })
            .then((result) => {
              if (result.isConfirmed) {
                // Save current page to return to after login
                const currentUrl = window.location.href;
                console.log("Wishlist: saving return URL:", currentUrl);
                localStorage.setItem("return_url", currentUrl);
                // Redirect to login page
                window.location.href = "/auth?tab=login";
              }
            });
        })
        .catch((err) => {
          // Fallback if sweetalert2 fails to load
          alert("Please login to save items to your wishlist");
          console.error("Error loading Swal:", err);
        });
    }
  };

  // Remove a product from the wishlist
  const removeFromWishlist = async (productId: string) => {
    if (user?.id) {
      try {
        const userId = String(user.id);
        const success = await apiRemoveFromWishlist(userId, productId);

        if (success) {
          // Update the local state
          const updatedWishlist = wishlist.filter(
            (item) => item.id !== productId
          );
          setWishlist(updatedWishlist);

          // Update localStorage for consistency
          saveGuestWishlist(updatedWishlist);

          console.log("Product removed from wishlist:", productId);
        }
      } catch (error) {
        console.error("Failed to remove from wishlist:", error);
      }
    } else {
      // For guests, use localStorage
      const guestWishlist = loadGuestWishlist();
      const updatedWishlist = guestWishlist.filter(
        (item) => item.id !== productId
      );
      saveGuestWishlist(updatedWishlist);
      setWishlist(updatedWishlist);
      console.log("Product removed from guest wishlist:", productId);
    }
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Clear cart function - useful after successful payment
  const clearCart = () => {
    console.log("Clearing cart state");
    setCart([]);
    // Also clear guest cart from localStorage if user is not logged in
    if (!user) {
      saveGuestCart([]);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        increaseQuantity,
        decreaseQuantity,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isInCart,
        cartTotal,
        cartCount,
        wishlistCount,
        loadUserCart,
        clearCart,
        isCartLoading,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// Create a custom hook to use the context
export const useShop = () => useContext(ShopContext);
