"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const testimonials = [
  {
    id: 1,
    name: "Olivia",
    image: "/images/testimonial/olivia.png",
    rating: 5,
    text: "Totally Indian's website is a passport to cultural immersion! Their clothing collection celebrates the vibrant colors and intricate designs of India. I felt like a fashionista with each item I purchased. The website offers a seamless checkout process, ensuring a stylish journey every step of the way",
  },
  {
    id: 2,
    name: "Manvi",
    image: "/images/testimonial/manvi.png",
    rating: 5,
    text: "Amazing website which comes with fastest delivery experience and affordable shipment price. Ideal platform for varities related to Spiritual, Health, Beauty, Fashion and much more. Has a great range in Toxins free products.",
  },
  {
    id: 3,
    name: "Ashish",
    image: "/images/testimonial/olivia.png",
    rating: 5,
    text: "I've been shopping from Totally Indian for the past year and I'm extremely satisfied with their products and service. The authentic Indian items are of exceptional quality and the shipping is always on time.",
  },
  {
    id: 4,
    name: "Priya",
    image: "/images/testimonial/olivia.png",
    rating: 5,
    text: "The customer service at Totally Indian is exceptional! They helped me choose the perfect gift for my mom. I love the traditional handicrafts section - such beautiful artisanal work at reasonable prices.",
  },
  {
    id: 5,
    name: "Raj",
    image: "/images/testimonial/olivia.png",
    rating: 5,
    text: "I've been shopping from Totally Indian for the past year and I'm extremely satisfied with their products and service. The authentic Indian items are of exceptional quality and the shipping is always on time.",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll settings
  const AUTO_SCROLL_INTERVAL = 5000; // Change testimonial every 5 seconds
  const RESUME_DELAY = 8000; // Resume auto-scroll 8 seconds after user interaction

  // Function to go to next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 >= testimonials.length ? 0 : prevIndex + 1
    );
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? testimonials.length - 1 : prevIndex - 1
    );
    handleUserInteraction();
  };

  // Handle user interaction (pause auto-scroll temporarily)
  const handleUserInteraction = useCallback(() => {
    setIsAutoScrollPaused(true);

    // Clear existing timers
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    if (userInteractionTimerRef.current) {
      clearTimeout(userInteractionTimerRef.current);
    }

    // Resume auto-scroll after delay
    userInteractionTimerRef.current = setTimeout(() => {
      setIsAutoScrollPaused(false);
    }, RESUME_DELAY);
  }, []);

  // Modified nextSlide for manual navigation
  const handleNextSlide = () => {
    nextSlide();
    handleUserInteraction();
  };

  // Set up auto-sliding
  useEffect(() => {
    if (!isAutoScrollPaused) {
      autoScrollIntervalRef.current = setInterval(() => {
        nextSlide();
      }, AUTO_SCROLL_INTERVAL);
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [nextSlide, isAutoScrollPaused]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      if (userInteractionTimerRef.current) {
        clearTimeout(userInteractionTimerRef.current);
      }
    };
  }, []);

  // Get current and next testimonial for larger screens
  const currentTestimonial = testimonials[currentIndex];
  const nextTestimonial =
    testimonials[(currentIndex + 1) % testimonials.length];

  return (
    <section className="hidden md:block p-6 bg-white rounded-xl">
      <div className="flex">
        {/* Left side - "Good news" part */}
        <div className=" pr-16 mb-6 md:mb-0">
          <Link href="https://www.trustpilot.com/evaluate/totallyindian.com" target="_blank">
            <div className="border border-highlight-70 inline-flex items-center gap-2 px-4 py-2 mb-8">
              <span className="title-3-semibold">Review us</span>
              <Image
                src="/images/testimonial/trustpilot.png"
                alt="Trustpilot"
                width={100}
                height={24}
                className="object-contain"
              />
            </div>
          </Link>
          <h3 className="title-1-semibold mb-3 whitespace-nowrap">
            Good news from far away
          </h3>
          <p className="body-large mb-4">
            Let&apos;s see what people think of TotallyIndian.
          </p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={prevSlide}
              className="p-1 border-2 border-black rounded-lg hover:bg-gray-50 flex items-center justify-center h-9 w-9"
              aria-label="Previous testimonial"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextSlide}
              className="p-1 border-2 border-black rounded-lg hover:bg-gray-50 flex items-center justify-center h-9 w-9"
              aria-label="Next testimonial"
            >
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </button>
          </div>

          {/* Auto-scroll indicator */}
          {/* <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-1">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-blue-00" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            {isAutoScrollPaused && (
              <span className="caption-medium text-gray-30 ml-2">
                Auto-scroll paused
              </span>
            )}
          </div> */}
        </div>

        {/* Right side - Testimonials */}
        <div className="w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-6"
            style={{
              transform: `translateX(0%)`,
            }}
          >
            {/* First testimonial */}
            <div className="w-full lg:w-1/2 flex-shrink-0">
              <div className="flex items-center gap-6">
                <Image
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
                <div className="relative">
                  <Image
                    src="/images/testimonial/quote.png"
                    alt="Quote"
                    width={30}
                    height={30}
                    className="mb-3"
                  />
                  <p className="body-large mb-3">{currentTestimonial.text}</p>
                  <p className="body-large-semibold">
                    {currentTestimonial.name}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#FFC107"
                      >
                        <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Second testimonial (only visible on larger screens) */}
            <div className="hidden lg:block w-1/2 flex-shrink-0">
              <div className="flex items-center gap-6">
                <Image
                  src={nextTestimonial.image}
                  alt={nextTestimonial.name}
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
                <div className="relative">
                  <Image
                    src="/images/testimonial/quote.png"
                    alt="Quote"
                    width={30}
                    height={30}
                    className="mb-3"
                  />
                  <p className="body-large mb-3">{nextTestimonial.text}</p>
                  <p className="body-large-semibold">{nextTestimonial.name}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(nextTestimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#FFC107"
                      >
                        <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
