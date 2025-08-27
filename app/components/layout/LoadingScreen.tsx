"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
// Import the animation data but don't import Lottie directly
import loaderAnimation from "../../data/loader.json";

// Dynamically import Lottie component with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-64 h-64 flex items-center justify-center">Loading...</div>
  ),
});

interface LoadingScreenProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LoadingScreen({
  isLoading,
  setIsLoading,
}: LoadingScreenProps) {
  // Track if component is mounted to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state once client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading && isMounted) {
      // Prevent scrolling while loading
      document.body.style.overflow = "hidden";

      // Set a timeout to automatically hide the loading screen after ~1.5 seconds
      const timeout = setTimeout(() => {
        // Re-enable scrolling
        document.body.style.overflow = "";
        setIsLoading(false);
      }, 1500); // Loading duration in milliseconds

      // Clean up timeout on unmount
      return () => {
        clearTimeout(timeout);
        document.body.style.overflow = "";
      };
    }
  }, [isLoading, setIsLoading, isMounted]);

  // Don't render anything server-side or if not loading
  if (!isMounted || !isLoading) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-white z-[9999] flex flex-col items-center justify-center">
      <div className="w-64 h-64 relative">
        <Lottie animationData={loaderAnimation} loop={true} autoplay={true} />
      </div>
    </div>
  );
}
