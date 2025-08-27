"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CategoryCardProps {
  title: string;
  icon: string;
  href: string;
}

const CategoryCard = ({ title, icon, href }: CategoryCardProps) => {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-end bg-white border border-blue-00 rounded-lg p-3 md:p-6"
    >
      <div className="relative h-20 w-20 mb-4">
        <Image
          src={icon}
          alt={title}
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      <h3 className="title-2-semibold text-blue-00 text-center">{title}</h3>
    </Link>
  );
};

export default function ProductCategories() {
  const categories = [
    {
      title: "Ayurvedic Medicine",
      icon: "/images/seller/category/ayurvedic.png",
      href: "/seller/category/ayurvedic-medicine",
    },
    {
      title: "Beauty Products",
      icon: "/images/seller/category/beauty.png",
      href: "/seller/category/beauty-products",
    },
    {
      title: "Books",
      icon: "/images/seller/category/books.png",
      href: "/seller/category/books",
    },
    {
      title: "Digital Product",
      icon: "/images/seller/category/digital.png",
      href: "/seller/category/digital-product",
    },
    {
      title: "Fashion",
      icon: "/images/seller/category/fashion.png",
      href: "/seller/category/fashion",
    },
    {
      title: "Food Products",
      icon: "/images/seller/category/food.png",
      href: "/seller/category/food-products",
    },
    {
      title: "Spiritual Products",
      icon: "/images/seller/category/spiritual.png",
      href: "/seller/category/spiritual-products",
    },
    {
      title: "Toys",
      icon: "/images/seller/category/toys.png",
      href: "/seller/category/toys",
    },
  ];

  return (
    <section className="bg-white rounded-2xl my-5">
      <div className="px-5 py-5">
        <div className="mb-10 mt-8 relative">
          <h2 className="heading-1-semibold md:display-1-semibold text-center md:text-left text-black mb-2">
            Sell{" "}
            <span
              className="text-blue-00 title-1 md:display-1-regular flex flex-col items-center justify-center w-fit absolute -top-4 left-1/2 -translate-x-[calc(50%+28px)] md:-top-8 md:left-12 rotate-[11.35deg]"
              style={{ fontFamily: "SquarePeg" }}
            >
              <span className="leading-3">almost</span>

              <FontAwesomeIcon
                icon={faChevronDown}
                className="h-2 w-2 md:h-4 md:w-4"
              />
            </span>{" "}
            <span className="text-blue-00">Anything</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              icon={category.icon}
              href={category.href}
            />
          ))}
        </div>

        <div className="text-right mt-8">
          <p className="title-4-medium text-gray-10">&amp; much more...</p>
        </div>
      </div>
    </section>
  );
}
