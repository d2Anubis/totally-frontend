"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingScreen from "../components/layout/LoadingScreen";

interface NavigationContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

// Helper function to determine if it's a major navigation
const isMajorNavigation = (
  currentPath: string,
  previousPath: string
): boolean => {
  // Extract main path segments
  const currentSegments = currentPath.split("/").filter(Boolean);
  const prevSegments = previousPath.split("/").filter(Boolean);

  // If paths are identical, it's not a major navigation
  if (currentPath === previousPath) return false;

  // Check if we're just moving between tabs in the same section
  if (currentSegments.length > 0 && prevSegments.length > 0) {
    // If first segment changes (e.g., from /products to /account), it's a major navigation
    if (currentSegments[0] !== prevSegments[0]) return true;

    // Special case: if we're in account section, tab changes aren't major navigations
    if (currentSegments[0] === "account" && prevSegments[0] === "account") {
      return false;
    }
  }

  // By default, treat as major navigation
  return true;
};

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  const previousPathname = useRef(pathname);
  const previousSearchParams = useRef(searchParams);

  // Functions to manually control loading state
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  // Show loading screen on initial page load only once
  useEffect(() => {
    if (isInitialMount.current) {
      startLoading();
      isInitialMount.current = false;
    }
  }, []);

  // Trigger loading only on actual route changes, not tab switches
  useEffect(() => {
    const shouldShowLoader = isMajorNavigation(
      pathname!,
      previousPathname.current!
    );

    // Only trigger loader for major navigation changes
    if (shouldShowLoader) {
      console.log(
        `Loading for navigation: ${previousPathname.current} -> ${pathname}`
      );
      startLoading();
    }

    // Always update refs for next comparison
    previousPathname.current = pathname;
    previousSearchParams.current = searchParams;
  }, [pathname, searchParams]);

  return (
    <NavigationContext.Provider
      value={{ isLoading, startLoading, stopLoading }}
    >
      <LoadingScreen isLoading={isLoading} setIsLoading={setIsLoading} />
      {children}
    </NavigationContext.Provider>
  );
}
