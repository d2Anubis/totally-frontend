"use client";

import Link from "next/link";
import ProductCard from "../home/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface RelatedProductsProps {
  title: string;
  categoryUrl: string;
}

const RelatedProducts = ({ title, categoryUrl }: RelatedProductsProps) => {
  // Sample related products data
  const products = [
    {
      id: 1,
      title: "JivaTattva Dhoop Sticks - Vrindavan",
      imageUrl: "/images/common/new_arrival.png",
      price: 150.0,
      originalPrice: 300.0,
      discount: 50,
      brand: "Jiva Tattva Wellness",
      rating: 4.5,
      url: "/product/dhoop-sticks",
      isQuickShip: true,
      isSale: true,
    },
    {
      id: 2,
      title: "Himalaya Ashvagandha Tablet",
      imageUrl: "/images/common/new_arrival.png",
      price: 253.0,
      originalPrice: 316.0,
      discount: 25,
      brand: "Himalaya Wellness",
      rating: 4.5,
      url: "/product/ashvagandha",
      isQuickShip: false,
      isSale: false,
    },
    {
      id: 3,
      title: "Crushed Georgette Co-ord Set (NNK1100TEL)",
      imageUrl: "/images/common/new_arrival.png",
      price: 2565.0,
      originalPrice: 3000.0,
      discount: 15,
      brand: "Totally Indian",
      rating: 4.5,
      url: "/product/dress",
      isQuickShip: false,
      isSale: false,
    },
    {
      id: 4,
      title:
        "Templexity: Comprehensive Analysis & Interpretation Of Temple Art",
      imageUrl: "/images/common/new_arrival.png",
      price: 3720.0,
      originalPrice: 5000.0,
      discount: 45,
      brand: "Totally Indian",
      rating: 4.5,
      url: "/product/templexity",
      isQuickShip: false,
      isSale: false,
    },
    {
      id: 5,
      title: "Ayuda Homes - Handloom Cushion Cover",
      imageUrl: "/images/common/new_arrival.png",
      price: 449.0,
      originalPrice: 500.0,
      discount: 10,
      brand: "Ayuda Homes",
      rating: 4.5,
      url: "/product/cushion",
      isQuickShip: true,
      isSale: true,
    },
  ];

  return (
    <section className="mb-8 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="title-2">{title}</h2>
        <Link
          href={categoryUrl}
          className="flex items-center small-semibold text-blue-00 hover:underline bg-blue-110 rounded-lg px-4 py-1"
        >
          View All
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
    </section>
  );
};

export default RelatedProducts;
