"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function HeroSection() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isGstRegistered, setIsGstRegistered] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showSignupModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSignupModal]);

  const handleSignupClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowSignupModal(true);
  };

  const closeModal = () => {
    setShowSignupModal(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted");
    // Close modal after submission
    setShowSignupModal(false);
  };

  const toggleGstRegistered = () => {
    setIsGstRegistered(!isGstRegistered);
  };

  return (
    <>
      <section className="bg-white rounded-2xl">
        <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-2xl">
          {/* Left Column - Text Content */}
          <div>
            <h2 className="title-2-medium md:heading-4-medium mb-2 md:mb-4">
              Sell On TotallyIndians
            </h2>
            <h1 className="heading-2-semibold md:display-2-semibold text-blue-00 leading-tight mb-3">
              <span className="hidden md:block">
                Put Your Products
                <br />
                In Front Of Millions Of High
                <br />
                Value Asian Customers
              </span>
              <span className="block md:hidden">
                Put Your Products In Front Of Millions Of High Value Asian
                Customers
              </span>
            </h1>
            <p className="title-2-medium md:heading-3-medium text-gray-10 mb-6">
              <span className="hidden md:block">
                TotallyIndians Is The Ideal Platform For Vendors
                <br />
                That Want To Reach A Large Number Of Asian
                <br />
                Customers.
              </span>
              <span className="block md:hidden">
                TotallyIndians Is The Ideal Platform For Vendors That Want To
                Reach A Large Number Of Asian Customers.
              </span>
            </p>
            <button
              onClick={handleSignupClick}
              className="inline-flex items-center text-blue-00 rounded-md hover:bg-blue-10 transition-colors duration-300 title-2-medium md:heading-3-regular"
            >
              Sign Up Today And Join Us
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>

          {/* Right Column - Image */}
          <div className="relative h-80 md:h-96 bg-gray-50 rounded-xl">
            {/* Placeholder for seller hero image */}
            <div className="w-full h-full bg-blue-40 rounded-xl flex items-center justify-center">
              <Image
                src="/images/seller/hero-image.jpg"
                alt="Sell on TotallyIndians"
                fill
                className="object-cover rounded-xl"
                onError={(e) => {
                  // Fallback in case image doesn't exist
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seller Signup Modal */}
      {showSignupModal && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-blue-00 hover:text-blue-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="p-6">
              {/* Form Header */}
              <h2 className="title-1-bold mb-6">Personal Info</h2>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      id="fullName"
                      className="w-full p-3 bg-blue-40 rounded-md border-0 focus:ring-1 focus:ring-blue-00 text-blue-00 placeholder:text-blue-00"
                      placeholder="Full Name"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      id="title"
                      className="w-full p-3 bg-blue-40 rounded-md border-0 focus:ring-1 focus:ring-blue-00 text-blue-00 placeholder:text-blue-00"
                      placeholder="Title*"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      className="w-full p-3 bg-blue-40 rounded-md border-0 focus:ring-1 focus:ring-blue-00 text-blue-00 placeholder:text-blue-00"
                      placeholder="Phone Number"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 bg-blue-40 rounded-md border-0 focus:ring-1 focus:ring-blue-00 text-blue-00 placeholder:text-blue-00"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                </div>

                {/* Business Info Section */}
                <div>
                  <h2 className="title-1-bold mb-4">Business Info</h2>

                  <div className="mb-4">
                    <div className="relative">
                      <select
                        id="entityType"
                        className="w-full p-3 bg-blue-40 rounded-md border-0 appearance-none focus:ring-1 focus:ring-blue-00 pr-10 text-blue-00"
                        required
                      >
                        <option value="">
                          Type of Entity - Sole Proprietor, Partnership, LLP,
                          Pvt Ltd
                        </option>
                        <option value="Sole Proprietor">Sole Proprietor</option>
                        <option value="Partnership">Partnership</option>
                        <option value="LLP">LLP</option>
                        <option value="Pvt Ltd">Pvt Ltd</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-00"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <p className="body-large-semibold mr-4">
                        Is your Business GST registered ?
                      </p>
                      <button
                        type="button"
                        onClick={toggleGstRegistered}
                        className={`w-5 h-5 rounded ${
                          isGstRegistered
                            ? "bg-blue-00 text-white"
                            : "border border-blue-00"
                        } flex items-center justify-center`}
                      >
                        {isGstRegistered && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {isGstRegistered && (
                      <div>
                        <input
                          type="text"
                          id="gstin"
                          className="w-full p-3 bg-blue-40 rounded-md border-0 focus:ring-1 focus:ring-blue-00 text-blue-00 placeholder:text-blue-00"
                          placeholder="Enter your GSTIN"
                          required={isGstRegistered}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mt-6">
                    <button
                      type="submit"
                      className="bg-blue-00 text-white py-3 px-12 rounded-md body-large-semibold hover:bg-blue-10 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
