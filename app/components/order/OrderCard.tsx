"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import PriceDisplay from "@/app/components/common/PriceDisplay";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity?: number;
  price?: number;
}

interface OrderCardProps {
  id: string;
  status: string;
  date: string;
  items: OrderItem[];
  totalItems: number;
  total?: number;
  onShowDetails?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  id,
  status,
  date,
  items,
  totalItems,
  total,
  onShowDetails,
}) => {
  // Determine how many items to show and if we need the "+n" card
  const itemsToShow = items.length > 4 ? 3 : 4;
  const remainingItems = items.length > 4 ? items.length - 3 : 0;

  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* Order Header - Status, Date and Track Button */}
      <div className="">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-4 bg-blue-100 px-4 md:px-6 py-3 rounded-t-2xl">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-blue-00">
              {status === "On Its Way" ? (
                <Image
                  src="/images/account/fast-delivery.png"
                  alt="Delivery"
                  width={40}
                  height={40}
                  className="w-auto h-6 md:h-7 lg:h-9"
                />
              ) : (
                <Image
                  src="/images/account/delivered.png"
                  alt="Delivered"
                  width={40}
                  height={40}
                  className="w-auto h-6 md:h-7 lg:h-9"
                />
              )}
            </div>
            <div>
              <p className="text-blue-00 body-bold text-sm md:text-base">{status}</p>
              <p className="text-gray-500 body-semibold text-sm md:text-base">{date}</p>
            </div>
          </div>

          {onShowDetails ? (
            <button
              onClick={onShowDetails}
              className="px-3 md:px-4 py-1.5 md:px-6 md:py-2 bg-blue-00 text-white rounded-md hover:bg-blue-10 transition title-2-semibold text-sm md:text-base"
            >
              Track Order
            </button>
          ) : (
            <Link
              href={`/account/orders/${id}/track`}
              className="px-3 md:px-4 py-1.5 md:px-6 md:py-2 bg-blue-00 text-white rounded-md hover:bg-blue-10 transition title-2-semibold text-sm md:text-base"
            >
              Track Order
            </Link>
          )}
        </div>

        {/* Product Grid - Flexible layout */}
        <div className="px-6 md:px-8 py-4 md:py-6 border-b-2 border-l-2 border-r-2 border-gray-100 rounded-b-2xl">
          {items.length <= 2 ? (
            // For 1-2 items, use horizontal layout with better spacing
            <div className="flex gap-4 md:gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex-1 min-w-0">
                  <div className="relative rounded-xl md:rounded-2xl flex items-center justify-center bg-blue-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="object-cover rounded-xl md:rounded-2xl h-full w-full aspect-square"
                    />
                    {item.quantity && item.quantity > 1 && (
                      <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-blue-00 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-semibold">
                        {item.quantity}
                      </div>
                    )}
                  </div>
                  <p className="body-semibold line-clamp-2 mt-2 text-sm md:text-base">{item.name}</p>
                  {item.price && (
                    <div className="mt-1">
                      <PriceDisplay
                        inrPrice={item.price}
                        className="text-blue-00 body-semibold text-sm"
                        showLoading={false}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // For 3+ items, use grid layout
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {items.slice(0, itemsToShow).map((item) => (
                <div key={item.id} className="rounded-md">
                  <div className="relative rounded-xl md:rounded-2xl flex items-center justify-center bg-blue-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="object-cover rounded-xl md:rounded-2xl h-full w-full aspect-square"
                    />
                    {item.quantity && item.quantity > 1 && (
                      <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-blue-00 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-semibold">
                        {item.quantity}
                      </div>
                    )}
                  </div>
                  <p className="body-semibold line-clamp-2 mt-2 text-sm md:text-base">{item.name}</p>
                  {item.price && (
                    <div className="mt-1">
                      <PriceDisplay
                        inrPrice={item.price}
                        className="text-blue-00 body-semibold text-sm"
                        showLoading={false}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Show +n card if there are more than 4 items */}
              {remainingItems > 0 && (
                <button
                  onClick={onShowDetails}
                  className="bg-gray-50 p-3 md:p-4 rounded-md flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="aspect-square flex items-center justify-center">
                    <div className="text-2xl md:text-3xl font-bold text-blue-00">
                      +{remainingItems}
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Order Footer */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center pt-3 md:pt-4 px-6 md:px-8 pb-4 md:pb-6">
          <div>
            <p className="body-semibold text-sm md:text-base">{totalItems} Items</p>
            <p className="text-gray-600 body-semibold text-sm md:text-base">Order #TI/{id}</p>
            {total && (
              <div className="text-blue-00 body-bold mt-1">
                <PriceDisplay
                  inrPrice={total}
                  className=""
                  showLoading={false}
                />
              </div>
            )}
          </div>
          {onShowDetails ? (
            <button
              onClick={onShowDetails}
              className="px-6 md:px-8 py-1.5 md:py-2 border-2 border-blue-00 text-blue-00 rounded-md body-large-semibold hover:bg-blue-40 transition mt-3 md:mt-0 w-full md:w-auto text-center text-sm md:text-base"
            >
              Order Details
            </button>
          ) : (
            <Link
              href={`/account/orders/${id}`}
              className="px-6 md:px-8 py-1.5 md:py-2 border-2 border-blue-00 text-blue-00 rounded-md body-large-semibold hover:bg-blue-40 transition mt-3 md:mt-0 w-full md:w-auto text-center text-sm md:text-base"
            >
              Order Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
