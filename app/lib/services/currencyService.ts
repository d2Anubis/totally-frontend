import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";

// TypeScript Interfaces
export interface CurrencyRate {
  id: string;
  targetCurrency: string;
  closingRate: string;
  ourRate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CurrencyResponse {
  success: boolean;
  data: CurrencyRate[];
  message?: string;
}

export interface ConvertedPrice {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  formattedPrice: string;
}

export interface CachedRates {
  data: CurrencyRate[];
  timestamp: number;
}

// Supported currencies with symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  CHF: "CHF",
  AED: "AED",
  JPY: "¥",
  AUD: "A$",
  NZD: "NZ$",
  INR: "₹",
};

export const SUPPORTED_CURRENCIES = [
  "USD",
  "CAD",
  "GBP",
  "EUR",
  "CHF",
  "AED",
  "JPY",
  "AUD",
  "NZD",
  "INR",
];

class CurrencyService {
  private rates: Map<string, number> = new Map();
  private initialized: boolean = false;
  private readonly cacheTimeout: number = 3600000; // 1 hour
  private readonly cacheKey: string = "currency_rates_cache";
  private readonly selectedCurrencyKey: string = "selected_currency_data";

  /**
   * Initialize the currency service by fetching rates
   */
  async initialize(): Promise<boolean> {
    try {
      const rates = await this.fetchFreshRates();
      if (rates && rates.length > 0) {
        this.rates.clear();
        rates.forEach((rate) => {
          this.rates.set(rate.targetCurrency, parseFloat(rate.ourRate));
        });
        this.initialized = true;
        return true;
      }
      console.error("No currency rates received from API");
      return false;
    } catch (error) {
      console.error("Failed to initialize currency service:", error);
      return false;
    }
  }

  /**
   * Fetch fresh rates from API
   */
  private async fetchFreshRates(): Promise<CurrencyRate[] | null> {
    try {
      const response = await axiosInstance.get<CurrencyResponse>(
        "/user/currency/get-currencies"
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "API returned unsuccessful response"
        );
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<CurrencyResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch currency rates";

      console.error("Failed to fetch fresh currency rates:", errorMessage);
      return null;
    }
  }

  /**
   * Get cached rates from localStorage
   */
  private getCachedRates(): CachedRates | null {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const parsed: CachedRates = JSON.parse(cached);

      // Check if cache is still valid
      if (Date.now() - parsed.timestamp > this.cacheTimeout) {
        localStorage.removeItem(this.cacheKey);
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Failed to get cached rates:", error);
      return null;
    }
  }

  /**
   * Set cached rates in localStorage
   */
  private setCachedRates(rates: CurrencyRate[]): void {
    if (typeof window === "undefined") return;

    try {
      const cacheData: CachedRates = {
        data: rates,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to cache rates:", error);
    }
  }

  /**
   * Save selected currency data to localStorage
   */
  async saveSelectedCurrencyData(currency: string): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      // First ensure we have rates
      if (!this.initialized || this.rates.size === 0) {
        await this.initialize();
      }

      const rate = currency === "INR" ? 1 : this.rates.get(currency);
      if (!rate) {
        throw new Error(`Rate not found for currency: ${currency}`);
      }

      const currencyData = {
        currency,
        rate,
        symbol: CURRENCY_SYMBOLS[currency] || currency,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        this.selectedCurrencyKey,
        JSON.stringify(currencyData)
      );
      console.log(
        "[CurrencyService] Saved selected currency data:",
        currencyData
      );
    } catch (error) {
      console.error("Failed to save selected currency data:", error);
    }
  }

  /**
   * Get selected currency data from localStorage
   */
  getSelectedCurrencyData(): {
    currency: string;
    rate: number;
    symbol: string;
  } | null {
    if (typeof window === "undefined") return null;

    try {
      const saved = localStorage.getItem(this.selectedCurrencyKey);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      return {
        currency: parsed.currency,
        rate: parsed.rate,
        symbol: parsed.symbol,
      };
    } catch (error) {
      console.error("Failed to get selected currency data:", error);
      return null;
    }
  }

  /**
   * Convert INR amount to target currency
   */
  async convert(
    amountINR: number,
    targetCurrency: string
  ): Promise<ConvertedPrice> {
    // First check if we have saved currency data in localStorage
    const savedCurrencyData = this.getSelectedCurrencyData();
    if (savedCurrencyData && savedCurrencyData.currency === targetCurrency) {
      const convertedAmount = Number(
        (amountINR * savedCurrencyData.rate).toFixed(2)
      );
      return {
        originalAmount: amountINR,
        convertedAmount,
        fromCurrency: "INR",
        toCurrency: targetCurrency,
        rate: savedCurrencyData.rate,
        formattedPrice: this.formatCurrency(convertedAmount, targetCurrency),
      };
    }

    // Fallback to the original logic
    if (!this.initialized) {
      console.warn("Currency service not initialized, fetching fresh rates...");
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error(
          "Failed to initialize currency service - cannot convert currency without fresh rates"
        );
      }
    }

    if (targetCurrency === "INR") {
      return {
        originalAmount: amountINR,
        convertedAmount: amountINR,
        fromCurrency: "INR",
        toCurrency: "INR",
        rate: 1,
        formattedPrice: this.formatCurrency(amountINR, "INR"),
      };
    }

    const rate = this.rates.get(targetCurrency);
    if (!rate) {
      // Try to refresh rates one more time if rate not found
      console.warn(
        `Rate not found for currency: ${targetCurrency}, refreshing rates...`
      );
      const refreshed = await this.refreshRates();
      if (!refreshed) {
        throw new Error(
          `Currency rate not available for ${targetCurrency} and failed to refresh rates`
        );
      }

      const refreshedRate = this.rates.get(targetCurrency);
      if (!refreshedRate) {
        throw new Error(`Currency rate not available for ${targetCurrency}`);
      }

      const convertedAmount = Number((amountINR * refreshedRate).toFixed(2));
      return {
        originalAmount: amountINR,
        convertedAmount,
        fromCurrency: "INR",
        toCurrency: targetCurrency,
        rate: refreshedRate,
        formattedPrice: this.formatCurrency(convertedAmount, targetCurrency),
      };
    }

    const convertedAmount = Number((amountINR * rate).toFixed(2));

    return {
      originalAmount: amountINR,
      convertedAmount,
      fromCurrency: "INR",
      toCurrency: targetCurrency,
      rate,
      formattedPrice: this.formatCurrency(convertedAmount, targetCurrency),
    };
  }

  /**
   * Format currency with appropriate symbol
   */
  formatCurrency(amount: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;

    // Special formatting for JPY (no decimal places)
    if (currency === "JPY") {
      return `${symbol}${Math.round(amount)}`;
    }

    return `${symbol}${amount.toFixed(2)}`;
  }

  /**
   * Get all available currencies
   */
  getAvailableCurrencies(): string[] {
    return ["INR", ...Array.from(this.rates.keys())];
  }

  /**
   * Get current exchange rate for a currency
   */
  getRate(currency: string): number | null {
    if (currency === "INR") return 1;
    return this.rates.get(currency) || null;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Force refresh rates from API
   */
  async refreshRates(): Promise<boolean> {
    try {
      const fresh = await this.fetchFreshRates();
      if (fresh) {
        this.rates.clear();
        fresh.forEach((rate) => {
          this.rates.set(rate.targetCurrency, parseFloat(rate.ourRate));
        });
        this.setCachedRates(fresh);
        this.initialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to refresh rates:", error);
      return false;
    }
  }

  /**
   * Clear cached rates
   */
  clearCache(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.cacheKey);
    }
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: string): string {
    return CURRENCY_SYMBOLS[currency] || currency;
  }

  /**
   * Validate currency code
   */
  isValidCurrency(currency: string): boolean {
    return SUPPORTED_CURRENCIES.includes(currency);
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { cached: boolean; valid: boolean; age?: number } {
    const cached = this.getCachedRates();
    if (!cached) {
      return { cached: false, valid: false };
    }

    const age = Date.now() - cached.timestamp;
    const valid = age < this.cacheTimeout;

    return {
      cached: true,
      valid,
      age: Math.round(age / 1000 / 60), // age in minutes
    };
  }
}

// Create and export singleton instance
const currencyService = new CurrencyService();

// Utility functions for direct use
export const convertCurrency = async (
  amountINR: number,
  targetCurrency: string
): Promise<ConvertedPrice> => {
  return currencyService.convert(amountINR, targetCurrency);
};

export const formatCurrency = (amount: number, currency: string): string => {
  return currencyService.formatCurrency(amount, currency);
};

export const getCurrencySymbol = (currency: string): string => {
  return currencyService.getCurrencySymbol(currency);
};

export const isValidCurrency = (currency: string): boolean => {
  return currencyService.isValidCurrency(currency);
};

export const saveSelectedCurrencyData = async (
  currency: string
): Promise<void> => {
  return currencyService.saveSelectedCurrencyData(currency);
};

export const getSelectedCurrencyData = (): {
  currency: string;
  rate: number;
  symbol: string;
} | null => {
  return currencyService.getSelectedCurrencyData();
};

// Export the service instance
export default currencyService;
