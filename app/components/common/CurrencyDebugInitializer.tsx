"use client";

import { useEffect } from "react";
import geolocationService from "../../lib/services/geolocationService";

interface CurrencyDebugInitializerProps {
  enabled?: boolean;
}

export default function CurrencyDebugInitializer({
  enabled = true,
}: CurrencyDebugInitializerProps) {
  useEffect(() => {
    if (!enabled) return;

    // Initialize debug mode after component mounts
    const initializeDebug = async () => {
      try {
        await geolocationService.initializeDebugMode();
      } catch (error) {
        console.error("Failed to initialize currency debug:", error);
      }
    };

    // Add debug trigger to window for manual testing
    if (typeof window !== "undefined") {
      (
        window as typeof window & { triggerCurrencyDebug?: () => Promise<void> }
      ).triggerCurrencyDebug = async () => {
        try {
          await geolocationService.triggerDebug();
        } catch (error) {
          console.error("Failed to trigger currency debug:", error);
        }
      };

      // Add keyboard shortcut (Ctrl+Shift+D or Cmd+Shift+D)
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key === "D"
        ) {
          event.preventDefault();
          geolocationService.triggerDebug();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      // Cleanup
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        delete (
          window as typeof window & {
            triggerCurrencyDebug?: () => Promise<void>;
          }
        ).triggerCurrencyDebug;
      };
    }

    initializeDebug();
  }, [enabled]);

  return null; // This component doesn't render anything
}
