import currencyService, { ConvertedPrice } from "./currencyService";

// Interface for location detection response
interface LocationData {
  success: boolean;
  data?: {
    ip: string;
    realIp?: string;
    country: string;
    countryCode: string;
    currency: string;
  };
  error?: string;
}

// Interface for pricing context
interface PricingContext {
  userCountry: string;
  userCurrency: string;
  detectedAt: number;
  isInitialized: boolean;
}

class LocationPricingService {
  private pricingContext: PricingContext | null = null;
  private readonly contextKey = "user_pricing_context";
  private readonly contextTimeout = 300000; // 5 minutes
  private initializationPromise: Promise<boolean> | null = null;

  /**
   * Initialize the service by detecting user location and setting up pricing context
   */
  async initialize(): Promise<boolean> {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<boolean> {
    try {
      console.log("[LocationPricing] Initializing location-based pricing...");

      // First check if we have saved currency data from manual selection
      const savedCurrencyData = currencyService.getSelectedCurrencyData();
      if (savedCurrencyData) {
        console.log(
          "[LocationPricing] Using saved currency preference:",
          savedCurrencyData
        );

        // Find the country name for the saved currency
        let countryName = "Unknown";
        switch (savedCurrencyData.currency) {
          case "INR":
            countryName = "India";
            break;
          case "USD":
            countryName = "United States";
            break;
          case "CAD":
            countryName = "Canada";
            break;
          case "GBP":
            countryName = "United Kingdom";
            break;
          case "EUR":
            countryName = "Europe";
            break;
          case "CHF":
            countryName = "Switzerland";
            break;
          case "AED":
            countryName = "United Arab Emirates";
            break;
          case "JPY":
            countryName = "Japan";
            break;
          case "AUD":
            countryName = "Australia";
            break;
          case "NZD":
            countryName = "New Zealand";
            break;
        }

        this.pricingContext = {
          userCountry: countryName,
          userCurrency: savedCurrencyData.currency,
          detectedAt: Date.now(),
          isInitialized: true,
        };

        this.setCachedContext(this.pricingContext);

        // Initialize currency service in background
        currencyService.initialize();

        return true;
      }

      // Check if we have valid cached context
      const cachedContext = this.getCachedContext();
      if (cachedContext && this.isContextValid(cachedContext)) {
        this.pricingContext = cachedContext;
        console.log("[LocationPricing] Using cached context:", cachedContext);

        // Initialize currency service in background
        currencyService.initialize();

        // Try to refresh location in background for better accuracy
        this.detectUserLocation()
          .then((locationData) => {
            if (locationData?.success && locationData.data) {
              console.log(
                "[LocationPricing] Background location refresh:",
                locationData
              );
            }
          })
          .catch((err) => {
            console.log("[LocationPricing] Background refresh failed:", err);
          });

        return true;
      }

      // Detect user location
      const locationData = await this.detectUserLocation();
      if (!locationData || !locationData.success || !locationData.data) {
        console.warn("[LocationPricing] Failed to detect user location, using fallback");
        // Use fallback location (India/US) instead of throwing error
        this.pricingContext = {
          userCountry: "IN", // Default to India
          userCurrency: "INR", // Default to INR
          detectedAt: Date.now(),
          isInitialized: true,
        };
        this.setCachedContext(this.pricingContext);
        await currencyService.initialize();
        return true;
      }

      // Create pricing context
      this.pricingContext = {
        userCountry: locationData.data.country,
        userCurrency: locationData.data.currency,
        detectedAt: Date.now(),
        isInitialized: true,
      };

      // Cache the context
      this.setCachedContext(this.pricingContext);

      // Initialize currency service
      await currencyService.initialize();

      return true;
    } catch (error) {
      console.error("[LocationPricing] Failed to initialize:", error);

      // Fallback to US context
      this.pricingContext = {
        userCountry: "United States",
        userCurrency: "USD",
        detectedAt: Date.now(),
        isInitialized: true,
      };

      this.setCachedContext(this.pricingContext);

      // Still try to initialize currency service
      currencyService.initialize();

      console.log("[LocationPricing] Using fallback context (USD)");
      return false;
    }
  }

  /**
   * Detect user location using our API
   */
  private async detectUserLocation(): Promise<LocationData | null> {
    try {
      const response = await fetch("/api/detect-country", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Location API error: ${response.status}`);
      }

      const locationData: LocationData = await response.json();
      console.log("[LocationPricing] Location detected:", locationData);

      return locationData;
    } catch (error) {
      console.error("[LocationPricing] Location detection failed:", error);
      return null;
    }
  }

  /**
   * Convert INR price to user's currency
   */
  async convertPrice(inrAmount: number): Promise<ConvertedPrice> {
    // Ensure service is initialized
    if (!this.pricingContext?.isInitialized) {
      await this.initialize();
    }

    const targetCurrency = this.getUserCurrency();

    // If user currency is INR, no conversion needed
    if (targetCurrency === "INR") {
      return {
        originalAmount: inrAmount,
        convertedAmount: inrAmount,
        fromCurrency: "INR",
        toCurrency: "INR",
        rate: 1,
        formattedPrice: currencyService.formatCurrency(inrAmount, "INR"),
      };
    }

    // Use currency service for conversion
    return currencyService.convert(inrAmount, targetCurrency);
  }

  /**
   * Convert multiple prices at once
   */
  async convertPrices(inrAmounts: number[]): Promise<ConvertedPrice[]> {
    const promises = inrAmounts.map((amount) => this.convertPrice(amount));
    return Promise.all(promises);
  }

  /**
   * Format a price with currency symbol
   */
  formatPrice(amount: number, currency?: string): string {
    const targetCurrency = currency || this.getUserCurrency();
    return currencyService.formatCurrency(amount, targetCurrency);
  }

  /**
   * Get user's detected currency
   */
  getUserCurrency(): string {
    // First check if we have saved currency data from manual selection
    const savedCurrencyData = currencyService.getSelectedCurrencyData();
    if (savedCurrencyData) {
      return savedCurrencyData.currency;
    }

    return this.pricingContext?.userCurrency || "USD";
  }

  /**
   * Get user's detected country
   */
  getUserCountry(): string {
    return this.pricingContext?.userCountry || "United States";
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.pricingContext?.isInitialized || false;
  }

  /**
   * Get pricing context for debugging
   */
  getContext(): PricingContext | null {
    return this.pricingContext;
  }

  /**
   * Set pricing context manually (for manual currency selection)
   */
  setPricingContext(country: string, currency: string): void {
    this.pricingContext = {
      userCountry: country,
      userCurrency: currency,
      detectedAt: Date.now(),
      isInitialized: true,
    };
    this.setCachedContext(this.pricingContext);
  }

  /**
   * Force refresh location and pricing context
   */
  async refresh(): Promise<boolean> {
    this.pricingContext = null;
    this.clearCachedContext();
    this.initializationPromise = null;
    return this.initialize();
  }

  /**
   * Get cached pricing context
   */
  private getCachedContext(): PricingContext | null {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(this.contextKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("[LocationPricing] Failed to get cached context:", error);
      return null;
    }
  }

  /**
   * Set cached pricing context
   */
  private setCachedContext(context: PricingContext): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.contextKey, JSON.stringify(context));
    } catch (error) {
      console.warn("[LocationPricing] Failed to cache context:", error);
    }
  }

  /**
   * Clear cached context
   */
  private clearCachedContext(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.contextKey);
  }

  /**
   * Check if cached context is still valid
   */
  private isContextValid(context: PricingContext): boolean {
    return Date.now() - context.detectedAt < this.contextTimeout;
  }
}

// Create singleton instance
const locationPricingService = new LocationPricingService();

// Utility functions for easy use across the app
export const convertPrice = async (
  inrAmount: number
): Promise<ConvertedPrice> => {
  return locationPricingService.convertPrice(inrAmount);
};

export const convertPrices = async (
  inrAmounts: number[]
): Promise<ConvertedPrice[]> => {
  return locationPricingService.convertPrices(inrAmounts);
};

export const formatPrice = (amount: number, currency?: string): string => {
  return locationPricingService.formatPrice(amount, currency);
};

export const getUserCurrency = (): string => {
  return locationPricingService.getUserCurrency();
};

export const getUserCountry = (): string => {
  return locationPricingService.getUserCountry();
};

export const isPricingReady = (): boolean => {
  return locationPricingService.isReady();
};

export const getPricingContext = (): PricingContext | null => {
  return locationPricingService.getContext();
};

export const setPricingContext = (country: string, currency: string): void => {
  return locationPricingService.setPricingContext(country, currency);
};

export const refreshLocationPricing = async (): Promise<boolean> => {
  return locationPricingService.refresh();
};

// Export the service instance
export default locationPricingService;

// Export types
export type { PricingContext, LocationData };
