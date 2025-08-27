"use client";

import React from "react";
import HeroSection from "@/app/components/seller/HeroSection";
import SellingSteps from "@/app/components/seller/SellingSteps";
import ProductCategories from "@/app/components/seller/ProductCategories";
import BrandShowcase from "@/app/components/seller/BrandShowcase";

export default function SellerPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <SellingSteps />
      <ProductCategories />
      <BrandShowcase />
    </div>
  );
}
