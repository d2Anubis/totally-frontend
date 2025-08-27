"use client";

import { useState, useEffect } from "react";
import { usePricingStatus } from "./LocationPricingInitializer";
import PriceDisplay, { ProductPrice, TotalPrice } from "./PriceDisplay";
import locationPricingService, {
  PricingContext,
} from "@/app/lib/services/locationPricingService";

export default function LocationPricingDemo() {
  const { isReady, userCurrency, userCountry } = usePricingStatus();
  const [context, setContext] = useState<PricingContext | null>(null);

  useEffect(() => {
    if (isReady) {
      setContext(locationPricingService.getContext());
    }
  }, [isReady]);

  const sampleProducts = [
    { name: "Ayurvedic Tea", inrPrice: 250, originalPrice: 300 },
    { name: "Organic Turmeric", inrPrice: 180 },
    { name: "Yoga Mat", inrPrice: 1200, originalPrice: 1500 },
    { name: "Incense Sticks", inrPrice: 95 },
    { name: "Meditation Cushion", inrPrice: 850 },
  ];

  return (
    <div className="location-pricing-demo p-6 bg-gray-50 rounded-lg my-4">
      <h2 className="text-2xl font-bold mb-4">
        🌍 Location-Based Pricing Demo
      </h2>

      {/* Status Section */}
      <div className="status-section mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Status:</strong>
            <span
              className={`ml-2 px-2 py-1 rounded text-xs ${
                isReady
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {isReady ? "Ready" : "Loading..."}
            </span>
          </div>
          <div>
            <strong>Country:</strong>
            <span className="ml-2">{userCountry}</span>
          </div>
          <div>
            <strong>Currency:</strong>
            <span className="ml-2 font-mono">{userCurrency}</span>
          </div>
        </div>

        {context && (
          <div className="mt-2 text-xs text-gray-500">
            Detected: {new Date(context.detectedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Sample Products */}
      <div className="products-section mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Sample Products (Prices in Your Currency)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleProducts.map((product, index) => (
            <div
              key={index}
              className="product-card p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium mb-2">{product.name}</h4>
              <ProductPrice
                inrPrice={product.inrPrice}
                originalPrice={product.originalPrice}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Cart Total Example */}
      <div className="cart-total-section mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Cart Total Example</h3>
        <div className="flex justify-between items-center">
          <span>Total (5 items):</span>
          <TotalPrice inrTotal={2575} />
        </div>
      </div>

      {/* Individual Price Examples */}
      <div className="price-examples-section">
        <h3 className="text-lg font-semibold mb-4">Price Display Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="example bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">Basic Price</h4>
            <PriceDisplay inrPrice={500} />
          </div>

          <div className="example bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">Price with Original</h4>
            <PriceDisplay inrPrice={500} showOriginal={true} />
          </div>

          <div className="example bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">Large Price</h4>
            <PriceDisplay
              inrPrice={15000}
              className="text-2xl font-bold text-blue-600"
            />
          </div>

          <div className="example bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">Discounted Price</h4>
            <div className="flex items-center space-x-2">
              <PriceDisplay
                inrPrice={800}
                className="text-lg font-bold text-green-600"
              />
              <PriceDisplay
                inrPrice={1000}
                className="text-sm text-gray-500 line-through"
              />
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                20% OFF
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
