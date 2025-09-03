"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import OrderCard from "../order/OrderCard";
import { getOrdersByUser, Order } from "@/app/lib/services/orderService";
import { useAuth } from "@/app/context/AuthContext";
import PriceDisplay from "@/app/components/common/PriceDisplay";

// Placeholder image for products without images
const PLACEHOLDER_IMAGE = "/images/common/new_arrival.png";

// Helper function to format shipping carrier names
const formatShippingCarrier = (carrier: string | null): string => {
  if (!carrier) return "Standard Shipping";

  // Map of carrier codes to display names
  const carrierMap: { [key: string]: string } = {
    dhl: "DHL Express",
    aramex: "Aramex International",
    shipglobal: "ShipGlobal Direct",
    fedex: "FedEx",
    ups: "UPS",
    usps: "USPS",
    bluedart: "Blue Dart",
  };

  // Return mapped name or format the carrier code
  return (
    carrierMap[carrier.toLowerCase()] ||
    carrier.charAt(0).toUpperCase() + carrier.slice(1).toLowerCase()
  );
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.id) {
        setLoading(true);
        const fetchedOrders = await getOrdersByUser(String(user.id));
        if (fetchedOrders) {
          setOrders(fetchedOrders);
        }
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Transform API orders to UI format
  const transformedOrders = orders.map((order) => {
    // Extract cart items from the order
    const cartItems = order.Cart?.CartItems || [];

    // Transform cart items to UI format
    const items = cartItems.map((cartItem) => {
      // Get the first image URL from the variant image_urls array, fallback to product default images
      const imageUrl =
        cartItem.Variant?.image_urls &&
        cartItem.Variant.image_urls.length > 0 &&
        cartItem.Variant.image_urls[0]?.url
          ? cartItem.Variant.image_urls[0].url
          : cartItem.Variant?.Product?.default_image_urls &&
            cartItem.Variant.Product.default_image_urls.length > 0 &&
            cartItem.Variant.Product.default_image_urls[0]?.url
          ? cartItem.Variant.Product.default_image_urls[0].url
          : PLACEHOLDER_IMAGE;

      return {
        id: cartItem.id,
        name: cartItem.Variant?.Product?.title || "Product",
        image: imageUrl,
        quantity: cartItem.quantity,
        price: Number(cartItem.price),
      };
    });

    // Format date for display
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Map order status to display status
    let displayStatus = "Processing";
    switch (order.status) {
      case "processing":
        displayStatus = "Processing";
        break;
      case "shipped":
        displayStatus = "On Its Way";
        break;
      case "delivered":
        displayStatus = "Delivered";
        break;
      case "cancelled":
        displayStatus = "Cancelled";
        break;
      case "pending":
        displayStatus = "Pending";
        break;
      default:
        displayStatus = "Processing";
    }

    // Calculate total items count
    const totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    return {
      id: `#TI/${order.id.substring(0, 8)}`, // First 8 chars of UUID for display
      status: displayStatus,
      date: formattedDate,
      items: items,
      totalItems: totalItems,
      total: Number(order.total),
      originalOrder: order, // Keep original order data for reference if needed
    };
  });

  if (loading) {
    return (
      <div className="main-container px-4 flex justify-center items-center py-8">
        <div className="w-12 h-12 border-4 border-blue-00 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="main-container px-4 py-8 text-center">
        <h3 className="heading-3">You haven&apos;t placed any orders yet.</h3>
      </div>
    );
  }

  // Function to handle showing order details
  const handleShowOrderDetails = (order: { originalOrder: Order }) => {
    setSelectedOrder(order.originalOrder);
    setShowDetails(true);
  };

  // Function to go back to orders list
  const handleBackToOrders = () => {
    setShowDetails(false);
    setSelectedOrder(null);
  };

  // Render order details view
  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    const cartItems = selectedOrder.Cart?.CartItems || [];
    const subtotal = Number(selectedOrder.subtotal);
    const shipping = Number(selectedOrder.shipping);
    const tax = Number(selectedOrder.tax);
    const total = Number(selectedOrder.total);

    // Format date for display
    const orderDate = new Date(selectedOrder.createdAt);
    const formattedDate = orderDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Map order status to display status and tracking info
    let displayStatus = "Processing";
    let trackingMessage = "Your order is being processed.";

    switch (selectedOrder.status) {
      case "processing":
        displayStatus = "Processing";
        trackingMessage = "Your order is being processed.";
        break;
      case "shipped":
        displayStatus = "On Its Way";
        trackingMessage = "This shipment is on its way.";
        break;
      case "delivered":
        displayStatus = "Delivered";
        trackingMessage = "Your order has been delivered.";
        break;
      case "cancelled":
        displayStatus = "Cancelled";
        trackingMessage = "Your order has been cancelled.";
        break;
      case "pending":
        displayStatus = "Pending";
        trackingMessage = "Your order is pending confirmation.";
        break;
      default:
        displayStatus = "Processing";
        trackingMessage = "Your order is being processed.";
    }

    return (
      <div className="main-container px-4 py-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBackToOrders}
            className="flex items-center gap-2 text-blue-00 hover:text-blue-10 transition"
          >
            <svg
              className="w-5 h-5"
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
          <div>
            <h2 className="heading-2 text-gray-900">
              Order #TI/{selectedOrder.id.substring(0, 8)}
            </h2>
            <p className="body-semibold text-gray-600">
              Confirmed On {formattedDate}
            </p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tracking Info */}
          <div className="lg:col-span-2">
            {/* Shipping Tracking Info */}
            <div className="bg-white rounded-2xl p-6 border border-blue-00 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="body-bold text-gray-900 mb-1">
                    {formatShippingCarrier(selectedOrder.shipping_carrier)}
                    {selectedOrder.tracking_number
                      ? ` ${selectedOrder.tracking_number}`
                      : selectedOrder.status === "shipped" ||
                        selectedOrder.status === "delivered"
                      ? " - Tracking info coming soon"
                      : ""}
                  </p>
                </div>
                <button className="text-blue-00 body-semibold hover:underline">
                  Show Details
                </button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <Image
                  src="/images/account/fast-delivery.png"
                  alt="Delivery"
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span className="body-bold text-blue-00">{displayStatus}</span>
              </div>

              <div className="body-semibold text-gray-600 mb-2">
                {formattedDate}
              </div>
              <div className="body-semibold text-gray-600">
                {trackingMessage}
              </div>
            </div>
            {/* Address Information - Single Container */}
            <div className="bg-white rounded-2xl border border-blue-00 p-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div>
                  <h3 className="heading-3 mb-3">Contact information</h3>
                  <div className="space-y-1 body-semibold text-gray-700">
                    <p>
                      {selectedOrder.shipping_address.first_name}{" "}
                      {selectedOrder.shipping_address.last_name}
                    </p>
                    <p>{selectedOrder.User?.email}</p>
                    <p>
                      {selectedOrder.User?.country_code}{" "}
                      {selectedOrder.User?.phone}
                    </p>
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <h3 className="heading-3 mb-3">Billing address</h3>
                  <div className="body-semibold text-gray-700 space-y-1">
                    <p>
                      {selectedOrder.billing_address.first_name}{" "}
                      {selectedOrder.billing_address.last_name}
                    </p>
                    <p>{selectedOrder.billing_address.address_line_1}</p>
                    {selectedOrder.billing_address.address_line_2 && (
                      <p>{selectedOrder.billing_address.address_line_2}</p>
                    )}
                    <p>
                      {selectedOrder.billing_address.city},{" "}
                      {selectedOrder.billing_address.state}{" "}
                      {selectedOrder.billing_address.zip_code}
                    </p>
                    <p>{selectedOrder.billing_address.country}</p>
                    <p>
                      {selectedOrder.User?.country_code}{" "}
                      {selectedOrder.User?.phone}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="heading-3 mb-3">Shipping address</h3>
                  <div className="body-semibold text-gray-700 space-y-1">
                    <p>
                      {selectedOrder.shipping_address.first_name}{" "}
                      {selectedOrder.shipping_address.last_name}
                    </p>
                    <p>{selectedOrder.shipping_address.address_line_1}</p>
                    {selectedOrder.shipping_address.address_line_2 && (
                      <p>{selectedOrder.shipping_address.address_line_2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_address.city},{" "}
                      {selectedOrder.shipping_address.state}{" "}
                      {selectedOrder.shipping_address.zip_code}
                    </p>
                    <p>{selectedOrder.shipping_address.country}</p>
                    <p>
                      {selectedOrder.User?.country_code}{" "}
                      {selectedOrder.User?.phone}
                    </p>
                  </div>
                </div>

                {/* Shipping Method */}
                <div>
                  <h3 className="heading-3 mb-3">Shipping method</h3>
                  <p className="body-semibold text-gray-700">
                    {formatShippingCarrier(selectedOrder.shipping_carrier)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product List and Summary */}
          <div className="bg-white rounded-2xl border border-blue-00 p-6">
            {/* Product List - Vertical Layout */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => {
                const imageUrl =
                  item.Variant?.image_urls &&
                  item.Variant.image_urls.length > 0 &&
                  item.Variant.image_urls[0]?.url
                    ? item.Variant.image_urls[0].url
                    : item.Variant?.Product?.default_image_urls &&
                      item.Variant.Product.default_image_urls.length > 0 &&
                      item.Variant.Product.default_image_urls[0]?.url
                    ? item.Variant.Product.default_image_urls[0].url
                    : PLACEHOLDER_IMAGE;

                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.Variant?.Product?.title || "Product"}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex flex-1 w-full justify-between">
                      <h4 className="title-1-semibold text-gray-900 mb-1">
                        {item.Variant?.Product?.title || "Product"}
                      </h4>
                      <div className="body-semibold text-gray-900 flex items-center gap-1">
                        <span>{item.quantity} x</span>
                        <PriceDisplay
                          inrPrice={Number(item.price)}
                          className=""
                          showLoading={false}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Separator Line */}
            <div className="border-t border-blue-00 opacity-30 mb-6"></div>

            {/* Order Summary */}
            <div className="space-y-3">
              <div className="flex justify-between body-semibold">
                <span>Subtotal</span>
                <PriceDisplay
                  inrPrice={subtotal}
                  className=""
                  showLoading={false}
                />
              </div>
              <div className="flex justify-between body-semibold">
                <span>Shipping</span>
                <PriceDisplay
                  inrPrice={shipping}
                  className=""
                  showLoading={false}
                />
              </div>
              <div className="flex justify-between heading-3 pt-3 border-t border-gray-200">
                <span>Total</span>
                <PriceDisplay
                  inrPrice={total}
                  className=""
                  showLoading={false}
                />
              </div>
              <div className="body-small text-gray-600 flex items-center gap-1">
                <span>Including</span>
                <PriceDisplay inrPrice={tax} className="" showLoading={false} />
                <span>in taxes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show order details if selected
  if (showDetails) {
    return renderOrderDetails();
  }

  return (
    <div className="main-container px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        {transformedOrders.map((order, index) => (
          <OrderCard
            key={index}
            id={order.id}
            status={order.status}
            date={order.date}
            items={order.items}
            totalItems={order.totalItems}
            total={order.total}
            onShowDetails={() => handleShowOrderDetails(order)}
          />
        ))}
      </div>
    </div>
  );
}
