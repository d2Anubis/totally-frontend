"use client";

import Link from "next/link";
import ProductCard from "../home/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

// Define type for the product
export type Product = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  url: string;
  brand: string;
  rating: number;
  isQuickShip?: boolean;
  isSale?: boolean;
  variant_id?: string; // Add variant_id for cart operations
  option_values?: { [key: string]: string }; // Add option_values for variant information
};

interface ProductSectionProps {
  title: string;
  products: Product[];
  categoryUrl: string;
  className?: string;
}

const ProductSection = ({
  title,
  products,
  categoryUrl,
  className = "mb-8 bg-white rounded-2xl px-3 md:px-6 py-3 md:py-6",
}: ProductSectionProps) => {
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="title-2 text-center w-full md:text-left md:title-1-semibold">
          {title}
        </h2>
        <Link
          href={categoryUrl}
          className="hidden md:flex items-center body-large-semibold text-blue-00 hover:underline bg-blue-110 rounded-lg px-4 py-1 whitespace-nowrap"
        >
          View All
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </Link>
      </div>

      {/* Mobile view - Only first 4 products */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {products.slice(0, 6).map((product) => (
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
            variant_id={product.variant_id}
            option_values={product.option_values}
          />
        ))}
      </div>

      {/* Desktop view - All products */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
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
            variant_id={product.variant_id}
            option_values={product.option_values}
          />
        ))}
      </div>

      {/* Mobile "See all Products" button */}
      {products.length > 4 && (
        <Link
          href={categoryUrl}
          className="mt-4 w-full text-blue-00 bg-blue-100 body-large-bold flex md:hidden justify-center items-center rounded-lg py-2"
        >
          <div className="stack relative flex mr-2">
            <Image
              src="/images/common/see_all.png"
              height={20}
              width={20}
              alt="see all"
              className="object-cover rounded-full border-2 border-blue-00 w-8 h-8"
            />
            <Image
              src="/images/common/see_all.png"
              height={20}
              width={20}
              alt="see all"
              className="object-cover rounded-full border-2 border-blue-00 w-8 h-8 -ml-5"
            />
            <Image
              src="/images/common/see_all.png"
              height={20}
              width={20}
              alt="see all"
              className="object-cover rounded-full border-2 border-blue-00 w-8 h-8 -ml-5"
            />
          </div>
          <span>See all Products</span>
          <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
        </Link>
      )}
    </section>
  );
};

export default ProductSection;
