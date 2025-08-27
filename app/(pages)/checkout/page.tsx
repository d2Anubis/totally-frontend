"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faLock,
  faChevronLeft,
  faPlus,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { useShop } from "@/app/context/ShopContext";
import { useAuth } from "@/app/context/AuthContext";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";
import { useCartAbandonment } from "@/app/hooks/useCartAbandonment";
import CheckoutBanners from "@/app/components/checkout/CheckoutBanners";
import PriceDisplay from "@/app/components/common/PriceDisplay";
import {
  getUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  UserAddress,
  AddAddressRequest,
} from "@/app/lib/services/profileService";
import {
  checkoutCart,
  getShippingRates,
  CheckoutPayload,
  CheckoutResponse,
  ShippingRatesResponse,
  ShippingRatesData,
  getAvailableCarriers,
  isShippingRateError,
  extractCarrierPrice,
} from "@/app/lib/services/orderService";
import {
  verifyPayment,
  VerifyPaymentRequest,
} from "@/app/lib/services/paymentService";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  CartItem as CartItemType,
  getCart,
} from "@/app/lib/services/cartService";

// Declare Razorpay as a global type
declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        open: () => void;
        on: (
          event: string,
          callback: (response: RazorpayErrorResponse) => void
        ) => void;
      };
    };
  }
}

// Define Razorpay options interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
  };
  send_sms_hash?: boolean;
  readonly?: {
    contact?: boolean;
    email?: boolean;
    name?: boolean;
  };
}

// Define Razorpay response interface
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Define Razorpay error response interface
interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, unknown>;
  };
}

// Shipping carriers configuration
const SHIPPING_CARRIERS = {
  aramex: { name: "Aramex International", days: "7-14", id: "aramex" },
  dhl: { name: "DHL Express", days: "4-7", id: "dhl" },
  shipGlobal: { name: "ShipGlobal Direct", days: "7-10", id: "shipGlobal" },
};

export default function CheckoutPage() {
  // Router for redirects
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract buy_now and cart_id directly from URL parameters
  const buyNowParam = searchParams?.get("buy_now") || null;
  const cartIdParam = searchParams?.get("cart_id") || null;
  const isBuyNow = buyNowParam === "true";

  // Auth context
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  // State for temporary buy now cart
  const [buyNowCart, setBuyNowCart] = useState<CartItemType[]>([]);

  // Get cart data from ShopContext
  const { cart, loadUserCart, clearCart } = useShop();

  // Function to determine which cart to use (regular or buy now)
  const activeCart = isBuyNow && buyNowCart.length > 0 ? buyNowCart : cart;

  // Get cart ID for abandonment tracking - always use cartIdParam when in buy now mode
  const cartId =
    isBuyNow && cartIdParam
      ? cartIdParam
      : activeCart && activeCart.length > 0 && "cart_id" in activeCart[0]
      ? activeCart[0].cart_id
      : null;

  // Cart abandonment hook
  const { resetAbandonmentState } = useCartAbandonment({
    cartId,
    isCheckoutPage: true,
    onCartAbandoned: () => {
      console.log("Cart marked as abandoned due to inactivity or page close");
      // Optionally show a toast or redirect user
    },
  });

  // State
  const [country, setCountry] = useState("India");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [phone, setPhone] = useState("");

  // Location selector state
  const [sameForBilling, setSameForBilling] = useState(true);
  const [shippingOption, setShippingOption] = useState("shipGlobal");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Shipping rates state
  const [shippingRates, setShippingRates] =
    useState<ShippingRatesResponse | null>(null);
  const [shippingRatesLoading, setShippingRatesLoading] = useState(false);
  const [shippingRatesError, setShippingRatesError] = useState<string | null>(
    null
  );

  // Address management state
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );
  const [addressLoading, setAddressLoading] = useState(false);

  // Billing address state
  const [selectedBillingAddressId, setSelectedBillingAddressId] =
    useState<string>("");

  // New address form state
  const [newAddress, setNewAddress] = useState<AddAddressRequest>({
    address_name: "",
    is_default: false,
    country: "India",
    country_code: "+91",
    country_code_iso: "IN",
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    company: "",
    city: "",
    state: "",
    zip_code: "",
  });

  // Address modal location state
  const [modalCountry, setModalCountry] = useState<ICountry | null>(null);
  const [modalState, setModalState] = useState<IState | null>(null);
  const [modalCity, setModalCity] = useState<ICity | null>(null);

  // Location data for modal dropdowns
  const [modalCountries, setModalCountries] = useState<ICountry[]>([]);
  const [modalStates, setModalStates] = useState<IState[]>([]);
  const [modalCities, setModalCities] = useState<ICity[]>([]);

  // Section expanded state
  const [shippingExpanded, setShippingExpanded] = useState(true);
  const [couponExpanded, setCouponExpanded] = useState(false);

  // Fetch shipping rates function - defined early to avoid dependency issues
  const fetchShippingRates = useCallback(
    async (addressId?: string) => {
      // For buy now mode, use cartIdParam as cart ID
      const cartIdToUse =
        isBuyNow && cartIdParam
          ? cartIdParam
          : (
              activeCart.find((item) => "cart_id" in item) as CartItemType & {
                cart_id: string;
              }
            )?.cart_id;

      if (!cartIdToUse) {
        console.log("No cart ID available for shipping rates");
        return;
      }

      // For authenticated users, use address ID
      if (isAuthenticated && addressId) {
        setShippingRatesLoading(true);
        setShippingRatesError(null);

        try {
          console.log(
            "Fetching shipping rates for cart:",
            cartIdToUse,
            "address:",
            addressId
          );

          const rates = await getShippingRates(cartIdToUse, addressId);
          console.log("Received shipping rates:", rates);

          if (rates) {
            setShippingRates(rates);

            // Auto-select first available shipping option (sorted by price)
            // getAvailableCarriers already filters out carriers with 0 rates or errors
            const availableCarriers = getAvailableCarriers(rates);

            if (availableCarriers.length > 0) {
              setShippingOption(availableCarriers[0].carrier);
              console.log(
                "Auto-selected shipping carrier:",
                availableCarriers[0].carrier,
                "Rate:",
                availableCarriers[0].rate
              );
            } else {
              console.log("No valid shipping carriers available");
              setShippingRatesError(
                "No shipping options available for your address."
              );
            }
          } else {
            setShippingRatesError(
              "Unable to calculate shipping rates. Please try again."
            );
          }
        } catch (error) {
          console.error("Error fetching shipping rates:", error);
          setShippingRatesError(
            "Failed to load shipping rates. Please try again."
          );
        } finally {
          setShippingRatesLoading(false);
        }
      } else {
        // For guest users, we need to create a temporary address first
        // or show default rates message
        setShippingRatesError(
          "Please login or add an address to see shipping rates."
        );
      }
    },
    [activeCart, isAuthenticated, isBuyNow, cartIdParam]
  );

  // Load countries for modal on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setModalCountries(allCountries);
  }, []);

  // Load states when modal country changes
  useEffect(() => {
    if (modalCountry) {
      const countryStates = State.getStatesOfCountry(modalCountry.isoCode);
      setModalStates(countryStates);
    } else {
      setModalStates([]);
    }
    setModalCities([]);
  }, [modalCountry]);

  // Load cities when modal state changes
  useEffect(() => {
    if (modalCountry && modalState) {
      const stateCities = City.getCitiesOfState(
        modalCountry.isoCode,
        modalState.isoCode
      );
      setModalCities(stateCities);
    } else {
      setModalCities([]);
    }
  }, [modalCountry, modalState]);

  // Fetch user profile and addresses when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && user?.id) {
        setLoading(true);

        // Fetch user profile
        const profile = await getUserProfile(String(user.id));
        if (profile) {
          setEmail(profile.email);
          setFirstName(profile.first_name);
          setLastName(profile.last_name);
          setPhone(profile.phone || "");
        }

        // Fetch user addresses
        const addresses = await getUserAddresses(String(user.id));
        if (addresses && addresses.length > 0) {
          setUserAddresses(addresses);

          // Find default address or use first one
          const defaultAddress =
            addresses.find((addr) => addr.is_default) || addresses[0];
          setSelectedAddressId(defaultAddress.id);

          // Set form fields with selected address
          setAddress(defaultAddress.address_line_1);
          setCity(defaultAddress.city);
          setState(defaultAddress.state);
          setPinCode(defaultAddress.zip_code);
          setCountry(defaultAddress.country);
          setFirstName(defaultAddress.first_name);
          setLastName(defaultAddress.last_name);

          // Set billing address to same as shipping if same for billing is checked
          if (sameForBilling) {
            setSelectedBillingAddressId(defaultAddress.id);
          }

          // Fetch shipping rates for the default address
          fetchShippingRates(defaultAddress.id);
        }

        setLoading(false);
      } else {
        // Reset form if not authenticated
        setEmail("");
        setFirstName("");
        setLastName("");
        setPhone("");
        setAddress("");
        setCity("");
        setState("");
        setPinCode("");
        setUserAddresses([]);
        setSelectedAddressId("");
        setLoading(false);

        // For guest users, shipping rates will be shown during checkout
        // after they provide shipping address details
      }
    };

    fetchUserData();
  }, [isAuthenticated, user?.id, fetchShippingRates, sameForBilling]);

  // Check authentication status and redirect if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated && activeCart.length > 0) {
      // Clear shipping rates when user becomes unauthenticated
      setShippingRates(null);
      setShippingRatesError("Please fill in shipping address to see rates.");

      // Remove automatic redirect - let user browse checkout page
      // They will be prompted to login when they try to place order
    }
  }, [isAuthenticated, isLoading, activeCart]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showAddressModal) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px"; // Prevent layout shift from scrollbar
    } else {
      // Restore scrolling
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAddressModal]);

  // Calculate order summary
  const getShippingPrice = () => {
    if (!shippingRates || !shippingOption) return 0;

    const rate = shippingRates.rates[shippingOption as keyof ShippingRatesData];
    return extractCarrierPrice(rate) || 0;
  };

  const shipping = getShippingPrice();

  // Calculate the actual price total (after discounts)
  const discountedSubtotal = activeCart.reduce((total, item) => {
    return total + Number(item.price) * item.quantity;
  }, 0);

  // Calculate the original price total (before any discounts)
  const subtotal = activeCart.reduce((total, item) => {
    // Handle both server cart items (with Variant) and guest cart items (with Product)
    let originalPrice;

    if ("Variant" in item && item.Variant) {
      // Server-side cart item: pricing is in Variant
      originalPrice =
        Number(item.Variant.compare_price) || Number(item.Variant.price);
    } else if ("Product" in item && item.Product) {
      // Guest cart item: pricing is in Product
      originalPrice =
        Number(item.Product.compare_price) || Number(item.Product.price);
    } else {
      // Fallback: use item price directly if no product structure found
      originalPrice = Number(item.price);
    }

    return total + originalPrice * item.quantity;
  }, 0);

  // Calculate product discount (difference between original and discounted prices)
  const productDiscount = Math.max(0, subtotal - discountedSubtotal);

  // Total is discounted subtotal plus shipping
  const total = discountedSubtotal + shipping;

  // Load buy now cart data immediately if in buy now mode
  useEffect(() => {
    const loadBuyNowCart = async () => {
      if (isBuyNow && cartIdParam) {
        try {
          setLoading(true);
          console.log(`Loading buy now cart with ID: ${cartIdParam}`);
          const cartData = await getCart(cartIdParam);

          console.log("Cart data received:", cartData); // Debug log

          if (cartData) {
            console.log(
              "Cart data exists, checking CartItems:",
              cartData.CartItems
            ); // Debug log

            if (cartData.CartItems && cartData.CartItems.length > 0) {
              setBuyNowCart(cartData.CartItems);
              console.log("Buy Now cart loaded:", cartData.CartItems);
              // Note: Shipping rates will be fetched by separate useEffect
            } else {
              console.error(
                "Cart data found but no CartItems or empty CartItems:",
                cartData
              );
              throw new Error("Buy now cart is empty or has no items");
            }
          } else {
            console.error("No cart data received from API");
            throw new Error("Failed to load buy now cart data from server");
          }
        } catch (error) {
          console.error("Error loading buy now cart:", error);
          toast.error("Failed to load buy now cart. Please try again.");
          setBuyNowCart([]); // Clear buy now cart on error
        } finally {
          setLoading(false);
        }
      }
    };

    loadBuyNowCart();
  }, [isBuyNow, cartIdParam]); // Only depend on the essential buy now parameters

  // Separate effect for auto-fetching shipping rates for buy now cart
  useEffect(() => {
    if (
      isBuyNow &&
      buyNowCart.length > 0 &&
      isAuthenticated &&
      userAddresses.length > 0 &&
      selectedAddressId
    ) {
      console.log("Auto-fetching shipping rates for loaded buy now cart");
      fetchShippingRates(selectedAddressId);
    }
  }, [
    isBuyNow,
    buyNowCart.length,
    isAuthenticated,
    userAddresses.length,
    selectedAddressId,
    fetchShippingRates,
  ]);

  // Auto-fetch shipping rates when regular cart or address selection changes
  useEffect(() => {
    // Only for regular cart (not buy now), fetch shipping rates when cart and address are available
    if (
      !isBuyNow &&
      !loading &&
      isAuthenticated &&
      activeCart.length > 0 &&
      selectedAddressId
    ) {
      const cartItem = activeCart.find((item) => "cart_id" in item);
      if (cartItem && "cart_id" in cartItem) {
        console.log("Auto-fetching shipping rates for regular cart");
        fetchShippingRates(selectedAddressId);
      }
    }
  }, [
    isBuyNow,
    loading,
    isAuthenticated,
    activeCart,
    selectedAddressId,
    fetchShippingRates,
  ]);

  // Apply coupon function
  const applyCoupon = () => {
    if (couponCode) {
      // Apply coupon logic would go here
      console.log(`Applying coupon: ${couponCode}`);
      console.log("Current calculations:", {
        subtotal,
        discountedSubtotal,
        productDiscount,
        shipping,
        total,
      });
    }
  };

  // Address management functions
  const handleAddressSelect = (addressId: string) => {
    const selectedAddr = userAddresses.find((addr) => addr.id === addressId);
    if (selectedAddr) {
      setSelectedAddressId(addressId);
      setAddress(selectedAddr.address_line_1);
      setCity(selectedAddr.city);
      setState(selectedAddr.state);
      setPinCode(selectedAddr.zip_code);
      setCountry(selectedAddr.country);
      setFirstName(selectedAddr.first_name);
      setLastName(selectedAddr.last_name);

      // If same address for billing is checked, also set billing address
      if (sameForBilling) {
        setSelectedBillingAddressId(addressId);
      }

      // Fetch shipping rates for the selected address
      fetchShippingRates(addressId);
    }
  };

  // Handle billing address selection
  const handleBillingAddressSelect = (addressId: string) => {
    setSelectedBillingAddressId(addressId);
  };

  // Modal location selector handlers
  const handleModalCountryChange = (country: ICountry | null) => {
    setModalCountry(country);
    setModalState(null);
    setModalCity(null);
    setNewAddress({
      ...newAddress,
      country: country?.name || "",
      country_code: country?.phonecode ? `+${country.phonecode}` : "",
      country_code_iso: country?.isoCode || "",
      state: "",
      city: "",
    });
  };

  const handleModalStateChange = (state: IState | null) => {
    setModalState(state);
    setModalCity(null);
    setNewAddress({
      ...newAddress,
      state: state?.name || "",
      city: "",
    });
  };

  const handleModalCityChange = (city: ICity | null) => {
    setModalCity(city);
    setNewAddress({
      ...newAddress,
      city: city?.name || "",
    });
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setNewAddress({
      address_name: "",
      is_default: false,
      country: "India",
      country_code: "+91",
      country_code_iso: "IN",
      first_name: firstName,
      last_name: lastName,
      address_line_1: "",
      address_line_2: "",
      company: "",
      city: "",
      state: "",
      zip_code: "",
    });

    // Reset modal location states
    setModalCountry(null);
    setModalState(null);
    setModalCity(null);

    setShowAddressModal(true);
  };

  const handleEditAddress = async (address: UserAddress) => {
    setEditingAddress(address);
    setNewAddress({
      address_name: address.address_name,
      is_default: address.is_default,
      country: address.country,
      country_code: address.country_code || "+91",
      country_code_iso: address.country_code_iso || "IN",
      first_name: address.first_name,
      last_name: address.last_name,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || "",
      company: address.company,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
    });

    // Find and set the country, state, and city objects for the modal
    const allCountries = Country.getAllCountries();
    const foundCountry = allCountries.find((c) => c.name === address.country);

    if (foundCountry) {
      setModalCountry(foundCountry);

      const countryStates = State.getStatesOfCountry(foundCountry.isoCode);
      const foundState = countryStates.find((s) => s.name === address.state);

      if (foundState) {
        setModalState(foundState);

        const stateCities = City.getCitiesOfState(
          foundCountry.isoCode,
          foundState.isoCode
        );
        const foundCity = stateCities.find((c) => c.name === address.city);

        if (foundCity) {
          setModalCity(foundCity);
        }
      }
    }

    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!user?.id) return;

    setAddressLoading(true);

    try {
      let success = false;

      if (editingAddress) {
        // Update existing address
        success = await updateUserAddress(editingAddress.id, newAddress);
      } else {
        // Add new address
        success = await addUserAddress(String(user.id), newAddress);
      }

      if (success) {
        // Refresh addresses list
        const addresses = await getUserAddresses(String(user.id));
        if (addresses) {
          setUserAddresses(addresses);

          // If this was a new address and it's the first one, select it
          if (!editingAddress && addresses.length === 1) {
            setSelectedAddressId(addresses[0].id);
            handleAddressSelect(addresses[0].id);
            // Ensure shipping rates are fetched for new address
            fetchShippingRates(addresses[0].id);
          }
          // If this was a new address but not the first one, auto-select it
          else if (!editingAddress && addresses.length > 1) {
            const newAddress = addresses[addresses.length - 1]; // Last added address
            setSelectedAddressId(newAddress.id);
            handleAddressSelect(newAddress.id);
            // Ensure shipping rates are fetched for new address
            fetchShippingRates(newAddress.id);
          }
          // If updating and this address was selected, refresh the form
          else if (editingAddress && selectedAddressId === editingAddress.id) {
            const updatedAddress = addresses.find(
              (addr) => addr.id === editingAddress.id
            );
            if (updatedAddress) {
              handleAddressSelect(updatedAddress.id);
              // fetchShippingRates will be called inside handleAddressSelect
            }
          }
        }

        setShowAddressModal(false);
        setEditingAddress(null);
      }
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user?.id) return;

    const result = await Swal.fire({
      title: "Delete Address?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const success = await deleteUserAddress(addressId);

      if (success) {
        // Refresh addresses list
        const addresses = await getUserAddresses(String(user.id));
        if (addresses) {
          setUserAddresses(addresses);

          // If deleted address was selected, select another one
          if (selectedAddressId === addressId) {
            if (addresses.length > 0) {
              const newSelected =
                addresses.find((addr) => addr.is_default) || addresses[0];
              setSelectedAddressId(newSelected.id);
              handleAddressSelect(newSelected.id);
            } else {
              setSelectedAddressId("");
              // Clear form
              setAddress("");
              setCity("");
              setState("");
              setPinCode("");
              setCountry("India");
            }
          }
        } else {
          setUserAddresses([]);
          setSelectedAddressId("");
        }
      }
    }
  };

  // Function to check if Razorpay script is loaded
  const isRazorpayLoaded = (): boolean => {
    return typeof window !== "undefined" && !!window.Razorpay;
  };

  // Function to wait for Razorpay script to load
  const waitForRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isRazorpayLoaded()) {
        resolve(true);
        return;
      }

      // Check every 100ms for up to 10 seconds
      let attempts = 0;
      const maxAttempts = 100;

      const checkInterval = setInterval(() => {
        attempts++;

        if (isRazorpayLoaded()) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  };

  // Handle payment cancellation
  const handlePaymentCancellation = () => {
    // Show confirmation dialog
    Swal.fire({
      title: "Payment Not Completed",
      text: "Your payment was not completed. Would you like to try again?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00478f",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Try Again",
      cancelButtonText: "Cancel Order",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // User wants to retry payment
        handlePayment();
      } else {
        // User wants to cancel the order
        // Clean up buy_now_pending data if present
        if (isBuyNow) {
          localStorage.removeItem("buy_now_pending");
          localStorage.removeItem("buy_now_cart_id");
          console.log(
            "Buy Now data cleared from localStorage due to cancellation"
          );
        }

        Swal.fire({
          title: "Order Cancelled",
          text: "Your order has been cancelled. You can continue shopping or try again later.",
          icon: "info",
          confirmButtonColor: "#00478f",
          confirmButtonText: "Continue Shopping",
        }).then(() => {
          // Redirect to cart or shopping page
          router.push("/cart");
        });
      }
    });
  };

  // Function to handle payment
  const handlePayment = async () => {
    // Check if user is authenticated first
    if (!user?.id || !isAuthenticated) {
      // Show login modal for guest users
      Swal.fire({
        title: "Login Required",
        text: "You need to be logged in to complete your purchase",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#00478f",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          const currentUrl = window.location.href;
          console.log("Checkout: saving checkout_redirect URL:", currentUrl);
          localStorage.setItem("checkout_redirect", currentUrl);

          // Verify it was saved
          const savedUrl = localStorage.getItem("checkout_redirect");
          console.log("Checkout: verified saved URL:", savedUrl);

          router.push("/auth?tab=login");
        }
        // If cancelled, user stays on checkout page
      });
      return;
    }

    // Check if Razorpay is loaded before proceeding
    if (!isRazorpayLoaded()) {
      console.log("Razorpay not loaded, waiting for it to load...");

      // Show loading message
      Swal.fire({
        title: "Loading Payment Gateway",
        text: "Please wait while we load the payment system...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const razorpayLoaded = await waitForRazorpay();

      if (!razorpayLoaded) {
        Swal.fire({
          title: "Payment Gateway Error",
          text: "Failed to load payment gateway. Please refresh the page and try again.",
          icon: "error",
          confirmButtonColor: "#00478f",
        });
        return;
      }

      // Close loading message
      Swal.close();
    }

    // Validation for authenticated users only
    if (!email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (userAddresses.length === 0) {
      toast.error("Please add a shipping address");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    // Get selected address for validation
    const selectedAddress = userAddresses.find(
      (addr) => addr.id === selectedAddressId
    );
    if (!selectedAddress) {
      toast.error("Selected address not found. Please select a valid address");
      return;
    }

    // Check if cart is empty or doesn't have cart_id (which guest carts won't have)
    if (!activeCart || activeCart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Check if shipping rates are available
    if (!shippingRates) {
      toast.error("Please complete your shipping address to see shipping options");
      return;
    }

    // Check if any shipping carriers are available (not all have errors)
    const availableCarriers = Object.keys(SHIPPING_CARRIERS).filter(
      (carrierId) => {
        const rate = shippingRates.rates[carrierId as keyof ShippingRatesData];
        return !isShippingRateError(rate);
      }
    );

    if (availableCarriers.length === 0) {
      toast.error("All shipping methods are currently unavailable. Please contact support at contact@totallyindian.com or WhatsApp at 7061548071");
      return;
    }

    // Check if a shipping option is selected
    if (!shippingOption) {
      toast.error("Please select a shipping method to continue");
      return;
    }

    // Validate that the selected shipping option is valid (not an error)
    const selectedRate = shippingRates.rates[shippingOption as keyof ShippingRatesData];
    if (isShippingRateError(selectedRate)) {
      toast.error("Selected shipping method is unavailable. Please choose another option.");
      return;
    }

    // For guest users, we need to first migrate cart to server
    // This is handled in ShopContext when logging in

    // Determine which cart ID to use - use cartIdParam if available (for Buy Now flow)
    let cartIdToUse: string;

    if (isBuyNow && cartIdParam) {
      // Use the cart ID from the URL for Buy Now flow
      cartIdToUse = cartIdParam;
      console.log("Using Buy Now cart ID for checkout:", cartIdParam);
    } else {
      // Find a cart item with cart_id (guest carts won't have this)
      const cartItem = activeCart.find((item) => "cart_id" in item);
      if (!cartItem || !("cart_id" in cartItem)) {
        toast.error("There was a problem with your cart. Please try again.");
        return;
      }
      cartIdToUse = cartItem.cart_id;
    }

    try {
      setProcessingPayment(true);

      // Get shipping address data
      let shippingAddress;
      if (isAuthenticated && selectedAddressId) {
        // For authenticated users, use selected address
        const selectedAddress = userAddresses.find(
          (addr) => addr.id === selectedAddressId
        );
        if (!selectedAddress) {
          toast.error(
            "Selected address not found. Please select a valid address"
          );
          setProcessingPayment(false);
          return;
        }
        shippingAddress = {
          address_line_1: selectedAddress.address_line_1,
          address_line_2: selectedAddress.address_line_2 || undefined,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip_code: selectedAddress.zip_code,
          country: selectedAddress.country,
        };
      } else {
        // For guest users, use form fields
        shippingAddress = {
          address_line_1: address,
          city: city,
          state: state,
          zip_code: pinCode,
          country: country,
        };
      }

      // Get billing address info
      let billingAddress;
      if (sameForBilling) {
        // Use shipping address for billing
        billingAddress = shippingAddress;
      } else if (selectedBillingAddressId) {
        // Use selected billing address
        const selectedBillingAddr = userAddresses.find(
          (addr) => addr.id === selectedBillingAddressId
        );
        if (selectedBillingAddr) {
          billingAddress = {
            address_line_1: selectedBillingAddr.address_line_1,
            address_line_2: selectedBillingAddr.address_line_2 || undefined,
            city: selectedBillingAddr.city,
            state: selectedBillingAddr.state,
            zip_code: selectedBillingAddr.zip_code,
            country: selectedBillingAddr.country,
          };
        } else {
          // Fallback to shipping address
          billingAddress = shippingAddress;
        }
      } else {
        // Fallback to shipping address
        billingAddress = shippingAddress;
      }

      // Prepare checkout data using new unified flow
      const checkoutData: CheckoutPayload = {
        cart_id: cartIdToUse,
        customer_email: email,
        customer_phone: phone,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        discount_code: couponCode || undefined,
        shipping: shipping,
        shipping_carrier: shippingOption || undefined,
        buy_now: isBuyNow, // Include buy_now flag when in Buy Now mode
      };

      const checkoutResponse = await checkoutCart(checkoutData);

      if (!checkoutResponse) {
        toast.error("Failed to initiate checkout");
        setProcessingPayment(false);
        return;
      }

      const options: RazorpayOptions = {
        key: checkoutResponse.key_id,
        amount: checkoutResponse.amount,
        currency: checkoutResponse.currency,
        name: "Totally Indian",
        description: "Purchase from Totally Indian",
        image: "/images/logo.png",
        order_id: checkoutResponse.razorpay_order_id,
        handler: function (response) {
          handlePaymentSuccess(response, checkoutResponse);
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone,
        },
        notes: {
          address: shippingAddress.address_line_1,
          shipping_address: `${shippingAddress.address_line_1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip_code}`,
          billing_address: sameForBilling
            ? `${shippingAddress.address_line_1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip_code}`
            : `${billingAddress.address_line_1}, ${billingAddress.city}, ${billingAddress.state} ${billingAddress.zip_code}`,
        },
        theme: {
          color: "#00478f",
        },
        modal: {
          ondismiss: function () {
            handlePaymentCancellation();
          },
          escape: true,
          animation: true,
        },
      };

      // Initialize Razorpay - now we know it's loaded
      const paymentObject = new window.Razorpay(options);

      // Handle payment failures
      paymentObject.on(
        "payment.failed",
        function (response: RazorpayErrorResponse) {
          console.error("Payment failed:", response.error);
          toast.error(`Payment failed: ${response.error.description}`);
          setProcessingPayment(false);
        }
      );

      // Open Razorpay payment form
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Something went wrong with the payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (
    response: RazorpayResponse,
    checkoutResponse: CheckoutResponse
  ) => {
    try {
      // Show loading popup that can't be dismissed
      Swal.fire({
        title: "Verifying Payment",
        html: "Please wait while we verify your payment...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Prepare verify payment request using new simplified format
      const verifyData: VerifyPaymentRequest = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        payment_id: checkoutResponse.payment_id,
        order_id: checkoutResponse.order_id,
      };

      // Verify the payment with the backend
      const verificationResult = await verifyPayment(verifyData);

      // Close the loading popup
      Swal.close();

      if (verificationResult) {
        // Reset cart abandonment state since payment was successful
        resetAbandonmentState();

        // Clear cart after successful payment (only for regular checkout, not buy now)
        if (!isBuyNow && user?.id) {
          try {
            console.log("Clearing cart after successful payment...");
            // First clear the local cart state immediately
            clearCart();
            // Then reload user cart to get the updated (empty) cart from backend
            // The backend should have already created a new cart after successful payment
            await loadUserCart(String(user.id));
            console.log("Cart cleared successfully after payment");
          } catch (error) {
            console.error("Error clearing cart after payment:", error);
            // Even if reloading fails, we've cleared the local state
            // Don't show error to user as payment was successful
          }
        }

        // Clear any buy_now_pending data if present
        if (isBuyNow) {
          localStorage.removeItem("buy_now_pending");
          localStorage.removeItem("buy_now_cart_id");
          console.log("Buy Now data cleared from localStorage");
        }

        // Redirect to order success page with order details
        const successUrl = `/order-success?order_id=${
          checkoutResponse.order_id
        }&total=${(checkoutResponse.amount / 100).toFixed(2)}`;
        router.push(successUrl);
      } else {
        Swal.fire({
          title: "Payment Verification Failed",
          text: "Please contact support with your payment details.",
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    } catch (error) {
      // Close loading popup and show error
      Swal.close();

      console.error("Payment verification error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to verify payment. Please contact support.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Clean up buy now cart ID when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Only clean up if we're in buy now mode and the payment wasn't completed
      // (successful payments are already cleaned up in handlePaymentSuccess)
      if (isBuyNow && !processingPayment && cartIdParam) {
        localStorage.removeItem("buy_now_cart_id");
        console.log("Buy Now cart ID removed from localStorage on page exit");
      }
    };
  }, [isBuyNow, processingPayment, cartIdParam]);

  return (
    <div className="py-0 md:py-6">
      <h1 className="text-center md:text-left  title-2 md:heading-2-semibold mb-4 md:mb-8 bg-white rounded-lg p-4">
        {isBuyNow ? "Buy Now Checkout" : "Checkout"}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-[200px]">
          <p className="text-lg">Loading checkout information...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 mb-6">
            {/* Contact Information */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="title-2 md:heading-3">Contact Information</h2>
                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      const currentUrl = window.location.href;
                      console.log(
                        "Checkout header login: saving checkout_redirect URL:",
                        currentUrl
                      );
                      localStorage.setItem("checkout_redirect", currentUrl);

                      // Verify it was saved
                      const savedUrl =
                        localStorage.getItem("checkout_redirect");
                      console.log(
                        "Checkout header login: verified saved URL:",
                        savedUrl
                      );

                      router.push("/auth?tab=login");
                    }}
                    className="title-2 md:heading-3 text-blue-00 hover:text-blue-10 transition-colors cursor-pointer"
                  >
                    Log in
                  </button>
                )}
              </div>
              {isAuthenticated ? (
                <>
                  <p className="body-semibold md:title-2-semibold text-gray-10 mb-4">
                    We&apos;ll use this email to send you details and updates
                    about your order.
                  </p>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field body-semibold md:title-2-semibold mb-2 w-full max-w-md"
                    readOnly={isAuthenticated}
                  />
                  <div className="flex items-center">
                    <label
                      htmlFor="guest-checkout"
                      className="body-semibold md:title-2-semibold text-gray-10"
                    >
                      You are logged in as {email}
                    </label>
                  </div>
                </>
              ) : (
                <div className="border rounded-lg p-4 bg-blue-70">
                  <p className="body-semibold md:title-2-semibold text-gray-80">
                    Please log in to proceed with checkout.
                  </p>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="border-t border-blue-50 pt-8 mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="title-2 md:heading-3">Shipping Address</h2>
                {isAuthenticated && userAddresses.length > 0 && (
                  <button
                    onClick={handleAddNewAddress}
                    className="flex items-center gap-2 text-blue-00 hover:text-blue-10 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                    <span className="caption-semibold">Add New Address</span>
                  </button>
                )}
              </div>

              <p className="body-semibold md:title-2-semibold text-gray-80 mb-4">
                {isAuthenticated
                  ? userAddresses.length > 0
                    ? "Select a saved address or add a new one."
                    : "Add your first shipping address."
                  : "Enter the address where you want your order delivered."}
              </p>

              {/* Saved Addresses List for Authenticated Users */}
              {isAuthenticated && userAddresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="body-large-semibold text-gray-10 mb-3">
                    Saved Addresses
                  </h3>
                  <div className="space-y-3">
                    {userAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-blue-00 bg-blue-70"
                            : "border-gray-40 hover:border-gray-60"
                        }`}
                        onClick={() => handleAddressSelect(addr.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="body-semibold text-gray-10">
                                {addr.address_name}
                              </span>
                              {addr.is_default && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="small-medium text-gray-80">
                              {addr.first_name} {addr.last_name}
                            </p>
                            <p className="small-medium text-gray-80">
                              {addr.address_line_1}
                              {addr.address_line_2 &&
                                `, ${addr.address_line_2}`}
                            </p>
                            <p className="small-medium text-gray-80">
                              {addr.city}, {addr.state} {addr.zip_code}
                            </p>
                            <p className="small-medium text-gray-80">
                              {addr.country}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleEditAddress(addr);
                              }}
                              className="p-1 text-gray-60 hover:text-blue-00 transition-colors"
                            >
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="h-3 w-3"
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr.id);
                              }}
                              className="p-1 text-gray-60 hover:text-red-500 transition-colors"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="h-3 w-3"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Address Button for Authenticated Users with No Addresses */}
              {isAuthenticated && userAddresses.length === 0 && (
                <div className="mb-6">
                  <button
                    onClick={handleAddNewAddress}
                    className="w-full border-2 border-dashed border-gray-40 rounded-lg p-6 text-center hover:border-blue-00 hover:bg-blue-70 transition-all"
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="h-5 w-5 text-gray-60 mb-2"
                    />
                    <p className="body-semibold text-gray-60">
                      Add Your First Address
                    </p>
                  </button>
                </div>
              )}

              {/* Login Prompt - Show for guest users */}
              {!isAuthenticated && (
                <div className="border-2 border-dashed border-gray-40 rounded-lg p-8 text-center">
                  <p className="body-large-semibold text-gray-80 mb-4">
                    Please log in to add a shipping address and complete your
                    purchase.
                  </p>
                  <button
                    onClick={() => {
                      const currentUrl = window.location.href;
                      console.log(
                        "Checkout button: saving checkout_redirect URL:",
                        currentUrl
                      );
                      localStorage.setItem("checkout_redirect", currentUrl);

                      // Verify it was saved
                      const savedUrl =
                        localStorage.getItem("checkout_redirect");
                      console.log(
                        "Checkout button: verified saved URL:",
                        savedUrl
                      );

                      router.push("/auth?tab=login");
                    }}
                    className="bg-blue-00 text-white py-3 px-8 rounded-md title-2-semibold hover:bg-blue-10 transition-colors"
                  >
                    Login to Continue
                  </button>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="same-address"
                  checked={sameForBilling}
                  onChange={() => {
                    setSameForBilling(!sameForBilling);
                    // If checking the box, set billing address to shipping address
                    if (!sameForBilling && selectedAddressId) {
                      setSelectedBillingAddressId(selectedAddressId);
                    }
                  }}
                  className="mr-2"
                />
                <label
                  htmlFor="same-address"
                  className="body-semibold md:title-2-semibold text-gray-80"
                >
                  Use same address for billing
                </label>
              </div>
            </div>

            {/* Billing Address Section - Show when not using same address for billing */}
            {!sameForBilling && isAuthenticated && userAddresses.length > 0 && (
              <div className="border-t border-blue-50 pt-8 mb-8">
                <h2 className="title-2 md:heading-3 mb-2">Billing Address</h2>
                <p className="body-semibold md:title-2-semibold text-gray-80 mb-4">
                  Select a billing address.
                </p>

                {/* Billing Address List */}
                <div className="space-y-3">
                  {userAddresses.map((addr) => (
                    <div
                      key={`billing-${addr.id}`}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedBillingAddressId === addr.id
                          ? "border-blue-00 bg-blue-70"
                          : "border-gray-40 hover:border-gray-60"
                      }`}
                      onClick={() => handleBillingAddressSelect(addr.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="body-semibold text-gray-10">
                              {addr.address_name}
                            </span>
                            {addr.is_default && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="small-medium text-gray-80">
                            {addr.first_name} {addr.last_name}
                          </p>
                          <p className="small-medium text-gray-80">
                            {addr.address_line_1}
                            {addr.address_line_2 && `, ${addr.address_line_2}`}
                          </p>
                          <p className="small-medium text-gray-80">
                            {addr.city}, {addr.state} {addr.zip_code}
                          </p>
                          <p className="small-medium text-gray-80">
                            {addr.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Options */}
            <div className="mb-8">
              <div
                className="flex justify-between items-center mb-2 cursor-pointer"
                onClick={() => setShippingExpanded(!shippingExpanded)}
              >
                <h2 className="title-2 md:heading-3">Shipping Options</h2>
                <FontAwesomeIcon
                  icon={shippingExpanded ? faChevronUp : faChevronDown}
                  className="text-blue-00 transform transition-transform duration-300"
                />
              </div>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  shippingExpanded
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {shippingRatesLoading ? (
                  <div className="border rounded-md px-4 py-3 mb-2 bg-blue-70 text-center">
                    <span className="caption-semibold md:title-2-semibold text-gray-10">
                      Loading shipping rates...
                    </span>
                  </div>
                ) : shippingRatesError ? (
                  <div className="border rounded-md px-4 py-3 mb-2 bg-red-50 border-red-200 text-center">
                    <span className="caption-semibold md:title-2-semibold text-red-600">
                      {shippingRatesError}
                    </span>
                  </div>
                ) : shippingRates ? (
                  (() => {
                    // Filter out carriers with errors and count total carriers
                    const availableCarriers = Object.entries(SHIPPING_CARRIERS).filter(
                      ([carrierId]) => {
                        const rate = shippingRates.rates[carrierId as keyof ShippingRatesData];
                        return !isShippingRateError(rate);
                      }
                    );

                    const totalCarriers = Object.keys(SHIPPING_CARRIERS).length;
                    const availableCarriersCount = availableCarriers.length;

                    // If all carriers have errors, show support message
                    if (availableCarriersCount === 0) {
                      return (
                        <div className="border rounded-md px-4 py-3 mb-2 bg-red-50 border-red-200 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="caption-semibold md:title-2-semibold text-red-600">
                              Unable to calculate shipping rates
                            </span>
                            <span className="caption-medium text-red-500 text-center">
                              Please contact our support at{" "}
                              <a 
                                href="mailto:contact@totallyindian.com" 
                                className="underline hover:text-red-700"
                              >
                                contact@totallyindian.com
                              </a>{" "}
                              or WhatsApp at{" "}
                              <a 
                                href="https://wa.me/7061548071" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="underline hover:text-red-700"
                              >
                                7061548071
                              </a>
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Show only available carriers
                    return availableCarriers.map(([carrierId, carrier]) => {
                      const rate = shippingRates.rates[carrierId as keyof ShippingRatesData];
                      const price = extractCarrierPrice(rate) || 0;

                      return (
                        <div
                          key={carrierId}
                          onClick={() => setShippingOption(carrierId)}
                          className={`border rounded-md px-4 py-3 mb-2 cursor-pointer transition-all duration-300 ${
                            shippingOption === carrierId
                              ? "border-blue-00 bg-blue-70"
                              : "border-gray-200 bg-white hover:border-blue-00 hover:bg-blue-70"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="caption-semibold md:title-2-semibold text-blue-00">
                                {carrier.name}
                              </span>
                              <span className="caption-semibold md:title-2-semibold text-gray-10 ml-2">
                                (
                                {rate &&
                                typeof rate === "object" &&
                                "estimatedDays" in rate
                                  ? rate.estimatedDays + " Days"
                                  : rate &&
                                    typeof rate === "object" &&
                                    "services" in rate &&
                                    rate.services.length > 0
                                  ? rate.services[0].transit_time
                                  : carrier.days + " Business Days"}
                                )
                              </span>
                            </div>
                            <PriceDisplay
                              inrPrice={price}
                              className="caption-semibold md:title-2-semibold text-blue-00"
                            />
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="border rounded-md px-4 py-3 mb-2 bg-blue-70 text-center">
                    <span className="caption-semibold md:title-2-semibold text-gray-10">
                      {isAuthenticated
                        ? "Select an address to see shipping options"
                        : "Complete shipping address to see rates"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Options */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="title-2 md:heading-3">Payment Options</h2>
                <div className="flex items-center justify-center bg-blue-70 rounded-md px-4 py-2 gap-0.5">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="h-2.5 w-2.5 text-gray-80 mr-1"
                  />
                  <span className="caption-semibold md:title-2-semibold text-gray-80">
                    Secure And Encrypted
                  </span>
                </div>
              </div>

              <div className="border rounded-md p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-blue-70 transition-colors">
                <div className="flex items-center">
                  <Image
                    src="/images/payment/razorpay.png"
                    alt="Razorpay"
                    width={80}
                    height={24}
                    className="mr-3 h-4 md:h-6 w-auto"
                  />
                  <span className="caption-semibold md:title-2-semibold text-gray-10">
                    Pay using Credit/Debit card, UPI, or Net Banking
                  </span>
                </div>
                <div className="hidden h-4 w-4 md:h-5 md:w-5 rounded-full border border-blue-00 md:flex items-center justify-center">
                  <div className="h-2 w-2 md:w-3 md:h-3 rounded-full bg-blue-00"></div>
                </div>
              </div>

              <p className="caption-semibold md:title-2-semibold text-gray-80 mt-2">
                By proceeding with your purchase you agree to our Terms &
                Conditions, Privacy Policy and Refund Policy.
              </p>
            </div>

            {/* Shipping Status Indicator */}
            <div className="mt-4 p-3 rounded-md border">
              {!shippingRates ? (
                <div className="flex items-center text-orange-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="caption-semibold">Complete your shipping address to see shipping options</span>
                </div>
              ) : (() => {
                // Check if all shipping carriers have errors
                const availableCarriers = Object.keys(SHIPPING_CARRIERS).filter(
                  (carrierId) => {
                    const rate = shippingRates.rates[carrierId as keyof ShippingRatesData];
                    return !isShippingRateError(rate);
                  }
                );
                
                if (availableCarriers.length === 0) {
                  return (
                    <div className="flex items-center text-red-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="caption-semibold">All shipping methods unavailable. Please contact support.</span>
                    </div>
                  );
                }
                
                if (!shippingOption) {
                  return (
                    <div className="flex items-center text-orange-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="caption-semibold">Select a shipping method to continue</span>
                    </div>
                  );
                }
                
                if (isShippingRateError(shippingRates?.rates[shippingOption as keyof ShippingRatesData])) {
                  return (
                    <div className="flex items-center text-red-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="caption-semibold">Selected shipping method is unavailable. Please choose another option.</span>
                    </div>
                  );
                }
                
                return (
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="caption-semibold">Shipping configured successfully! Ready to checkout.</span>
                  </div>
                );
              })()}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <Link
                href="/cart"
                className="border border-blue-00 text-blue-00 py-2.5 md:py-3 px-3 rounded-md flex items-center caption-bold md:title-2-semibold hover:bg-blue-70 transition-colors duration-300"
              >
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="h-3 w-3 md:h-4 md:w-4 mr-1"
                />
                Return To Cart
              </Link>
              <button
                onClick={handlePayment}
                disabled={
                  processingPayment || 
                  !shippingRates || 
                  !shippingOption || 
                  isShippingRateError(shippingRates?.rates[shippingOption as keyof ShippingRatesData]) ||
                  (() => {
                    // Check if all shipping carriers have errors
                    if (!shippingRates) return false;
                    const availableCarriers = Object.keys(SHIPPING_CARRIERS).filter(
                      (carrierId) => {
                        const rate = shippingRates.rates[carrierId as keyof ShippingRatesData];
                        return !isShippingRateError(rate);
                      }
                    );
                    return availableCarriers.length === 0;
                  })()
                }
                className={`py-3 px-12 rounded-md caption-bold md:title-2-semibold transition-colors duration-300 ${
                  processingPayment || 
                  !shippingRates || 
                  !shippingOption || 
                  isShippingRateError(shippingRates?.rates[shippingOption as keyof ShippingRatesData]) ||
                  (() => {
                    // Check if all shipping carriers have errors
                    if (!shippingRates) return false;
                    const availableCarriers = Object.keys(SHIPPING_CARRIERS).filter(
                      (carrierId) => {
                        const rate = shippingRates.rates[carrierId as keyof ShippingRatesData];
                        return !isShippingRateError(rate);
                      }
                    );
                    return availableCarriers.length === 0;
                  })()
                    ? "bg-gray-400 text-white opacity-70 cursor-not-allowed"
                    : "bg-blue-00 text-white hover:bg-blue-10"
                }`}
              >
                {processingPayment 
                  ? "Processing..." 
                  : !shippingRates 
                    ? "Complete Address" 
                    : (() => {
                        // Check if all shipping carriers have errors
                        if (shippingRates) {
                          const availableCarriers = Object.keys(SHIPPING_CARRIERS).filter(
                            (carrierId) => {
                              const rate = shippingRates.rates[carrierId as keyof ShippingRatesData];
                              return !isShippingRateError(rate);
                            }
                          );
                          if (availableCarriers.length === 0) {
                            return "Contact Support";
                          }
                        }
                        return !shippingOption ? "Select Shipping" : "Place Order";
                      })()
                }
              </button>
            </div>
          </div>

          {/* Right Column - Cart Totals */}
          <div>
            <div className="bg-white rounded-xl mb-6 p-6">
              <h2 className="heading-3 mb-4 text-gray-10">Cart Totals</h2>

              {/* Coupon Section */}
              <div className="mb-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setCouponExpanded(!couponExpanded)}
                >
                  <h3 className="body-large-semibold">Add a coupon</h3>
                  <FontAwesomeIcon
                    icon={couponExpanded ? faChevronUp : faChevronDown}
                    className="text-blue-00 transform transition-transform duration-300"
                  />
                </div>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out mt-3 ${
                    couponExpanded
                      ? "max-h-[100px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow input-field"
                    />
                    <button
                      onClick={applyCoupon}
                      className="bg-blue-00 text-white py-2.5 px-4 rounded-md small-semibold hover:bg-blue-10 transition-colors duration-300"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-blue-50 pt-4 space-y-3">
                <div className="flex justify-between">
                  <p className="heading-3-medium text-gray-10">Subtotal</p>
                  <PriceDisplay
                    inrPrice={subtotal}
                    className="heading-3-medium"
                    showLoading={false}
                  />
                </div>

                {productDiscount > 0 && (
                  <div className="flex justify-between">
                    <p className="heading-3-medium text-highlight-40">
                      Product Discount
                    </p>
                    <p className="heading-3-medium text-highlight-40">
                      -{" "}
                      <PriceDisplay
                        inrPrice={productDiscount}
                        className=""
                        showLoading={false}
                      />
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <p className="heading-3-medium text-gray-10">Shipping</p>
                  <PriceDisplay
                    inrPrice={shipping}
                    className="heading-3-medium"
                  />
                </div>

                <div className="flex justify-between font-semibold text-lg border-t text-blue-00 border-blue-50 pt-3">
                  <p>Total</p>
                  <PriceDisplay inrPrice={total} className="" />
                </div>
              </div>
            </div>

            {/* Product Banners */}
            <CheckoutBanners />
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 w-full h-full overflow-hidden"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddressModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="heading-3">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-60 hover:text-gray-80 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Address Name (e.g., Home, Office)"
                  value={newAddress.address_name}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address_name: e.target.value,
                    })
                  }
                  className="w-full input-field body-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newAddress.first_name}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, first_name: e.target.value })
                  }
                  className="w-full input-field body-semibold"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newAddress.last_name}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, last_name: e.target.value })
                  }
                  className="w-full input-field body-semibold"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={newAddress.address_line_1}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address_line_1: e.target.value,
                    })
                  }
                  className="w-full input-field body-semibold"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={newAddress.address_line_2}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address_line_2: e.target.value,
                    })
                  }
                  className="w-full input-field body-semibold"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Company (Optional)"
                  value={newAddress.company}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, company: e.target.value })
                  }
                  className="w-full input-field body-semibold"
                />
              </div>

              {/* Country and State in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={modalCountry?.isoCode || ""}
                    onChange={(e) => {
                      const countryCode = e.target.value;
                      const country =
                        modalCountries.find((c) => c.isoCode === countryCode) ||
                        null;
                      handleModalCountryChange(country);
                    }}
                    className="w-full input-field body-semibold appearance-none"
                    required
                  >
                    <option value="">Country/Region</option>
                    {modalCountries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-40 pointer-events-none"
                  />
                </div>

                <div className="relative">
                  <select
                    value={modalState?.isoCode || ""}
                    onChange={(e) => {
                      const stateCode = e.target.value;
                      const state =
                        modalStates.find((s) => s.isoCode === stateCode) ||
                        null;
                      handleModalStateChange(state);
                    }}
                    className="w-full input-field body-semibold appearance-none"
                    disabled={!modalCountry}
                    required
                  >
                    <option value="">Select A State</option>
                    {modalStates.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-40 pointer-events-none"
                  />
                </div>
              </div>

              {/* City and ZIP Code in second row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={modalCity?.name || ""}
                    onChange={(e) => {
                      const cityName = e.target.value;
                      const city =
                        modalCities.find((c) => c.name === cityName) || null;
                      handleModalCityChange(city);
                    }}
                    className="w-full input-field body-semibold appearance-none"
                    disabled={!modalState}
                    required
                  >
                    <option value="">Select A City</option>
                    {modalCities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-40 pointer-events-none"
                  />
                </div>

                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={newAddress.zip_code}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, zip_code: e.target.value })
                  }
                  className="w-full input-field body-semibold"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-default"
                  checked={newAddress.is_default}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      is_default: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label
                  htmlFor="is-default"
                  className="body-semibold text-gray-80"
                >
                  Set as default address
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 border border-gray-40 rounded-md body-semibold text-gray-80 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={
                  addressLoading ||
                  !newAddress.address_name ||
                  !newAddress.address_line_1 ||
                  !newAddress.city ||
                  !newAddress.state ||
                  !newAddress.zip_code
                }
                className={`px-6 py-2 bg-blue-00 text-white rounded-md body-semibold hover:bg-blue-10 transition-colors ${
                  addressLoading ||
                  !newAddress.address_name ||
                  !newAddress.address_line_1 ||
                  !newAddress.city ||
                  !newAddress.state ||
                  !newAddress.zip_code
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {addressLoading
                  ? "Saving..."
                  : editingAddress
                  ? "Update Address"
                  : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
