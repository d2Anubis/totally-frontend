"use client";

import React from "react";
import Image from "next/image";

// Step card component for each selling step
interface StepCardProps {
  title: string;
  description: string;
  imageSrc: string;
}

const StepCard = ({ title, description, imageSrc }: StepCardProps) => {
  return (
    <div className="">
      <div className="relative h-[150px] md:h-[200px] mb-4 rounded-2xl overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback in case image doesn't exist
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <h3 className="title-1 md:heading-5 text-blue-00 mb-2">{title}</h3>
      <p className="body-large md:title-2-regular text-gray-10">{description}</p>
    </div>
  );
};

export default function SellingSteps() {
  const steps = [
    {
      title: "Verify your business",
      description:
        "Provide information to verify your business. Our team will contact you to discuss the collaboration and submit your business details to complete your seller profile and get verified.",
      imageSrc: "/images/seller/verify.png",
    },
    {
      title: "Access the portal",
      description:
        "Next, set up your Seller Portal and payment account. After verification, we will guide you to set up your Seller Portal account and payment system to receive deposits.",
      imageSrc: "/images/seller/access.png",
    },
    {
      title: "Set up your storefront",
      description:
        "You can manage your store listing and shipping details in the Seller portal. Log in to your Seller Portal account and start to manage your store, products, shipping policy, etc.",
      imageSrc: "/images/seller/setup.png",
    },
  ];

  return (
    <section className="bg-white rounded-2xl my-5">
      <div className="px-5 py-5">
        <div className="mb-4">
          <h3 className="body-large-medium md:title-1-medium text-gray-80">
            India&apos;s Largest Online Supermarket
          </h3>
          <h2 className="heading-3-semibold md:heading-1-semibold mt-2">
            Sell with us in three easy steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              title={step.title}
              description={step.description}
              imageSrc={step.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
