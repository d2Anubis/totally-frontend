"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";

import { useMediaQuery } from "../../hooks/useMediaQuery";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [loading, setLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState<number>(300); // Default height
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Function to calculate height maintaining aspect ratio for full width
  const calculateImageHeight = useCallback(
    (naturalWidth: number, naturalHeight: number, containerWidth: number) => {
      // Calculate height based on aspect ratio and container width
      const aspectRatio = naturalHeight / naturalWidth;
      const calculatedHeight = containerWidth * aspectRatio;
      setImageHeight(calculatedHeight);
      return calculatedHeight;
    },
    []
  );

  // Handle image load to get natural dimensions
  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const img = e.currentTarget;
      const containerWidth =
        img.parentElement?.offsetWidth || window.innerWidth;
      calculateImageHeight(img.naturalWidth, img.naturalHeight, containerWidth);
    },
    [calculateImageHeight]
  );

  // No need to fetch banners from API since we're using hardcoded ones
  useEffect(() => {
    setLoading(false); // Set loading to false immediately
  }, []);

  // Create slides from hardcoded banners
  const slides = useMemo(() => {
    // Hardcoded banners as requested
    return [
      {
        id: "banner1",
        title: "Mega Sale Banner One",
        imageUrl: "/images/banners/1.png",
        buttonText: "",
        buttonUrl: "", // First banner doesn't redirect anywhere
      },
      {
        id: "banner2", 
        title: "Mega Sale Banner Two",
        imageUrl: "/images/banners/2.png",
        buttonText: "",
        buttonUrl: "", // Second banner doesn't redirect anywhere
      },
      {
        id: "banner3",
        title: "Get Help & Support",
        imageUrl: "/images/banners/3.png",
        buttonText: "Contact Support",
        buttonUrl: "https://wa.me/916262462162?text=Hi,%20I%20need%20some%20help%20!", // Third banner goes to WhatsApp
      },
    ];

    // No need to process API banners since we're using hardcoded ones
    return slides;
  }, []);

  const infoData = [
    {
      id: 1,
      title: "Secure Payment",
      description:
        "Your payment information is 100% secured with SSL encryption.",
      imageUrl: "/images/home/secure-payment.png",
    },
    {
      id: 2,
      title: "Express Shipping",
      description: "Enjoy lightning-fast delivery right to your doorstep",
      imageUrl: "/images/home/express-shipping.png",
    },
    {
      id: 3,
      title: "Customer Support",
      description:
        "Our support team are ready 24/7 to answer any questions you may have.",
      imageUrl: "/images/home/customer-support.png",
    },
  ];

  // Function to go to next slide
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Function to go to previous slide
  // const prevSlide = () => {
  //   setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  // };

  // Function to go to a specific slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Set up auto-sliding
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [nextSlide]);

  // Recalculate height when slide changes
  useEffect(() => {
    if (slides.length > 0) {
      // Create a temporary image to get natural dimensions
      const img = new window.Image();
      img.onload = () => {
        const containerWidth = window.innerWidth; // Use window width as container width
        calculateImageHeight(
          img.naturalWidth,
          img.naturalHeight,
          containerWidth
        );
      };
      img.src = slides[currentSlide].imageUrl;
    }
  }, [currentSlide, slides, calculateImageHeight]);

  // Handle window resize to recalculate height
  useEffect(() => {
    const handleResize = () => {
      if (slides.length > 0) {
        const img = new window.Image();
        img.onload = () => {
          const containerWidth = window.innerWidth; // Use window width as container width
          calculateImageHeight(
            img.naturalWidth,
            img.naturalHeight,
            containerWidth
          );
        };
        img.src = slides[currentSlide].imageUrl;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentSlide, slides, calculateImageHeight]);

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full overflow-hidden rounded-[2rem] mb-3 md:mb-6 px-4 md:px-0">
        <div
          className="relative w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center"
          style={{ height: `${imageHeight}px` }}
        >
          <p className="text-gray-500">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-[2rem] mb-3 md:mb-6 px-4 md:px-0">
        <div className="relative w-full" style={{ height: `${imageHeight}px` }}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute top-0 left-0 w-full h-full rounded-[2rem] transition-opacity duration-500 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div 
                className={`w-full h-full rounded-[2rem] ${slide.buttonUrl ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (slide.buttonUrl) {
                    if (slide.buttonUrl.startsWith('http://') || slide.buttonUrl.startsWith('https://')) {
                      window.open(slide.buttonUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      window.location.href = slide.buttonUrl;
                    }
                  }
                }}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-contain rounded-[2rem]"
                  priority={index === 0}
                  onLoad={index === currentSlide ? handleImageLoad : undefined}
                  onError={(e) => {
                    console.error(
                      "Hero banner image failed to load:",
                      e.currentTarget.src
                    );
                    // Fallback to default image on error
                    e.currentTarget.src = "/images/home/home_banner.png";
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 z-20">
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-blue-00" : "bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* info section */}
      <div className="flex gap-4 justify-between mb-3 md:mb-8 md:bg-blue-80 rounded-xl p-4">
        {infoData.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="bg-blue-00 p-2 md:p-4 rounded-lg w-8 h-8 md:h-14 md:w-14">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="max-w-[60px] md:max-w-[350px]">
              <p className="caption-semibold md:title-1">{item.title}</p>
              <p className="text-sm text-gray-700 hidden lg:block">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default HeroSlider;
