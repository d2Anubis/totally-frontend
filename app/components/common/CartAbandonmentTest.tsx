import { useCartAbandonment } from "@/app/hooks/useCartAbandonment";
import { useState } from "react";

interface CartAbandonmentTestProps {
  cartId: string | null;
}

export default function CartAbandonmentTest({
  cartId,
}: CartAbandonmentTestProps) {
  const [isTestMode, setIsTestMode] = useState(false);

  const { startAbandonmentTimer, stopAbandonmentTimer, abandonCart } =
    useCartAbandonment({
      cartId,
      isCheckoutPage: isTestMode,
      onCartAbandoned: () => {
        console.log("🚨 TEST: Cart marked as abandoned!");
        alert("Cart has been marked as abandoned (TEST MODE)");
      },
    });

  if (!cartId) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          No cart ID available for testing
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-sm mb-2">
        Cart Abandonment Test (Dev Only)
      </h3>
      <p className="text-xs text-gray-600 mb-3">Cart ID: {cartId}</p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setIsTestMode(!isTestMode)}
          className={`px-3 py-1 text-xs rounded ${
            isTestMode ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          {isTestMode ? "Test Mode ON" : "Test Mode OFF"}
        </button>

        <button
          onClick={startAbandonmentTimer}
          className="px-3 py-1 text-xs bg-orange-500 text-white rounded"
          disabled={!isTestMode}
        >
          Start Timer
        </button>

        <button
          onClick={stopAbandonmentTimer}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
          disabled={!isTestMode}
        >
          Stop Timer
        </button>

        <button
          onClick={abandonCart}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded"
          disabled={!isTestMode}
        >
          Force Abandon
        </button>
      </div>

      {isTestMode && (
        <p className="text-xs text-orange-600 mt-2">
          ⚠️ Test mode active - cart abandonment logic is running
        </p>
      )}
    </div>
  );
}
