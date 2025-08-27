"use client";

import ProductCard from "../home/ProductCard";
import Link from "next/link";

interface ProductGridProps {
  products: {
    id: number;
    title: string;
    imageUrl: string;
    price: number;
    originalPrice: number;
    discount: number;
    brand: string;
    rating: number;
    url: string;
    isQuickShip?: boolean;
    isSale?: boolean;
  }[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div>
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            imageUrl={product.imageUrl}
            price={product.price}
            originalPrice={product.originalPrice}
            discount={product.discount}
            url={product.url}
            brand={product.brand}
            rating={product.rating}
            isQuickShip={product.isQuickShip}
            isSale={product.isSale}
          />
        ))}
      </div>

      {/* View All Link */}
      {products.length > 16 && (
        <div className="text-center mt-8">
          <Link
            href="#"
            className="inline-block py-2 px-6 bg-blue-00 text-white button rounded-lg"
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
