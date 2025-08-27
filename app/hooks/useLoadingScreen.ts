"use client";

import { useCallback } from "react";
import { useNavigation } from "../context/NavigationContext";

export default function useLoadingScreen() {
  const { startLoading, stopLoading } = useNavigation();

  // Show loading screen for a specific duration
  const showLoadingFor = useCallback(
    (durationMs: number = 1500) => {
      startLoading();
      setTimeout(() => {
        stopLoading();
      }, durationMs);
    },
    [startLoading, stopLoading]
  );

  return {
    showLoading: startLoading,
    hideLoading: stopLoading,
    showLoadingFor,
  };
}
