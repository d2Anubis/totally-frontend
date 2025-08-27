"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { getOrderById, Order } from "@/app/lib/services/orderService";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(15);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real order details from API
  useEffect(() => {
    // Clean up any buy_now_cart_id from localStorage
    if (localStorage.getItem("buy_now_cart_id")) {
      localStorage.removeItem("buy_now_cart_id");
      console.log("Buy Now cart ID removed from localStorage on order success");
    }

    const fetchOrderDetails = async () => {
      const orderId = searchParams?.get("order_id");

      if (!orderId) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const order = await getOrderById(orderId);

        if (order) {
          setOrderDetails(order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto redirect after 15 seconds
      router.push("/account?tab=orders");
    }
  }, [countdown, router]);

  const handleRedirectNow = () => {
    router.push("/account?tab=orders");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-00 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Unable to load order details"}
          </p>
          <Link
            href="/account?tab=orders"
            className="bg-blue-00 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-10 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Icon and Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-00 rounded-full mb-6">
            <FontAwesomeIcon icon={faCheck} className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Order Is completed!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank You. Your Order Has Been received.
          </p>

          {/* Auto-redirect notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              This page will automatically redirect to your orders in{" "}
              <span className="font-bold">{countdown}</span> seconds.
            </p>
            <button
              onClick={handleRedirectNow}
              className="mt-2 text-blue-00 hover:text-blue-10 underline text-sm font-medium"
            >
              Go to Orders Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl border border-blue-00/20 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {orderDetails.status === "processing"
                    ? "On Its Way"
                    : orderDetails.status === "shipped"
                    ? "Shipped"
                    : orderDetails.status === "delivered"
                    ? "Delivered"
                    : "Processing"}
                </h3>
                <p className="text-gray-600 text-sm">
                  #{orderDetails.id.substring(0, 8)}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Date</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(orderDetails.createdAt).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Total</h3>
                <p className="text-gray-600 text-sm">
                  ₹ {parseFloat(orderDetails.total.toString()).toFixed(2)}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Payment Method
                </h3>
                <p className="text-gray-600 text-sm">Net Banking Via UPI</p>
              </div>
            </div>
          </div>

          {/* Detailed Order Breakdown */}
          <div className="bg-white rounded-2xl border border-blue-00/20 p-6">
            <div className="space-y-6">
              {/* Order Details Section */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  Order Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product</span>
                    <span className="text-gray-600">Subtotal</span>
                  </div>
                  {orderDetails.OrderItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-800">
                        {item.Product.title} x{item.quantityRequested}
                      </span>
                      <span className="text-gray-800">
                        ₹{" "}
                        {(
                          parseFloat(item.unitPrice) * item.quantityRequested
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Subtotal Section */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  Sub Total
                </h3>
                {orderDetails.OrderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm mb-2"
                  >
                    <span className="text-gray-600">
                      {item.Product.title} x{item.quantityRequested}
                    </span>
                    <span className="text-gray-800">
                      ₹{" "}
                      {(
                        parseFloat(item.unitPrice) * item.quantityRequested
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-800">
                    ₹ {parseFloat(orderDetails.shipping.toString()).toFixed(2)}
                  </span>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Payment Method Section */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Payment Method
                </h3>
                <p className="text-gray-600 text-sm">Net Banking Via UPI</p>
              </div>

              <hr className="border-gray-200" />

              {/* Final Total */}
              <div className="flex justify-between items-center pt-2">
                <h3 className="font-bold text-lg text-gray-900">Total</h3>
                <span className="font-bold text-lg text-gray-900">
                  ₹ {parseFloat(orderDetails.total.toString()).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/account?tab=orders"
            className="bg-blue-00 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-10 transition-colors text-center"
          >
            View All Orders
          </Link>
          <Link
            href="/"
            className="border border-blue-00 text-blue-00 px-8 py-3 rounded-lg font-medium hover:bg-blue-70 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
