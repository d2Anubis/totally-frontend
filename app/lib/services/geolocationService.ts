import Swal from "sweetalert2";
import currencyService from "./currencyService";

// Interface for standardized location response
interface LocationResponse {
  country: string;
  countryCode: string;
  status: string;
}

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  UK: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  AT: "EUR",
  BE: "EUR",
  IE: "EUR",
  PT: "EUR",
  GR: "EUR",
  FI: "EUR",
  LU: "EUR",
  MT: "EUR",
  CY: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  SI: "EUR",
  SK: "EUR",
  CH: "CHF",
  AE: "AED",
  JP: "JPY",
  AU: "AUD",
  NZ: "NZD",
  IN: "INR",
};

// Country names mapping
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  UK: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  AT: "Austria",
  BE: "Belgium",
  IE: "Ireland",
  PT: "Portugal",
  GR: "Greece",
  FI: "Finland",
  LU: "Luxembourg",
  MT: "Malta",
  CY: "Cyprus",
  EE: "Estonia",
  LV: "Latvia",
  LT: "Lithuania",
  SI: "Slovenia",
  SK: "Slovakia",
  CH: "Switzerland",
  AE: "United Arab Emirates",
  JP: "Japan",
  AU: "Australia",
  NZ: "New Zealand",
  IN: "India",
};

class GeolocationService {
  private userCountry: string | null = null;
  private userCurrency: string | null = null;

  /**
   * Get user's country from IP address using a free IP geolocation service
   */
  async getUserCountryFromIP(): Promise<{
    country: string;
    countryCode: string;
  } | null> {
    console.log("Getting user country from IP using server-side API...");

    try {
      // Use our server-side API route for better reliability
      const response = await fetch("/api/detect-country", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Server-side country detection result:", result);

      if (result.success && result.data) {
        this.userCountry = result.data.countryCode;
        this.userCurrency = result.data.currency;

        console.log(
          `Successfully detected: ${result.data.country} (${result.data.countryCode}) -> ${this.userCurrency}`
        );

        return {
          country: result.data.country,
          countryCode: result.data.countryCode,
        };
      } else {
        throw new Error(result.error || "API returned unsuccessful response");
      }
    } catch (error) {
      console.error("Failed to get user country from server API:", error);

      // Fallback to default
      this.userCountry = "US";
      this.userCurrency = "USD";

      console.log("Using fallback: United States (US) -> USD");

      return {
        country: "United States",
        countryCode: "US",
      };
    }
  }

  /**
   * Get user's detected currency
   */
  getUserCurrency(): string {
    return this.userCurrency || "USD";
  }

  /**
   * Get user's detected country code
   */
  getUserCountryCode(): string {
    return this.userCountry || "US";
  }

  /**
   * Debug function to show country detection and currency rates
   */
  async showDebugInfo(): Promise<void> {
    try {
      // Get user's country
      const locationData = await this.getUserCountryFromIP();
      if (!locationData) return;

      // Initialize currency service
      const currencyInitialized = await currencyService.initialize();

      // Get all currency rates
      const availableCurrencies = currencyService.getAvailableCurrencies();
      const userCurrency = this.getUserCurrency();
      const countryCode = locationData.countryCode.toLowerCase();
      const countryName =
        COUNTRY_NAMES[locationData.countryCode] || locationData.country;

      // Create currency rates table
      let ratesTable =
        '<div style="text-align: left; max-height: 300px; overflow-y: auto;">';
      ratesTable +=
        '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
      ratesTable +=
        '<thead><tr style="background-color: #f5f5f5;"><th style="border: 1px solid #ddd; padding: 8px;">Currency</th><th style="border: 1px solid #ddd; padding: 8px;">Rate (1 INR =)</th><th style="border: 1px solid #ddd; padding: 8px;">Example (₹1000 =)</th></tr></thead>';
      ratesTable += "<tbody>";

      availableCurrencies.forEach((currency) => {
        if (currency !== "INR") {
          const rate = currencyService.getRate(currency);
          const converted = currencyService.convert(1000, currency);
          const isUserCurrency = currency === userCurrency;
          const rowStyle = isUserCurrency
            ? "background-color: #e8f5e8; font-weight: bold;"
            : "";

          ratesTable += `<tr style="${rowStyle}">`;
          ratesTable += `<td style="border: 1px solid #ddd; padding: 8px;">${currency}${
            isUserCurrency ? " 🎯" : ""
          }</td>`;
          ratesTable += `<td style="border: 1px solid #ddd; padding: 8px;">${
            rate?.toFixed(6) || "N/A"
          }</td>`;
          ratesTable += `<td style="border: 1px solid #ddd; padding: 8px;">${converted.formattedPrice}</td>`;
          ratesTable += "</tr>";
        }
      });

      ratesTable += "</tbody></table></div>";

      // Create the debug popup
      await Swal.fire({
        title: "🌍 Currency Debug Information",
        html: `
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">
              <i class="fi fi-${countryCode}" style="font-size: 48px;"></i>
            </div>
            <h3 style="margin: 5px 0; color: #333;">Detected Location: ${countryName}</h3>
            <h4 style="margin: 5px 0; color: #666;">Country Code: ${
              locationData.countryCode
            }</h4>
            <h4 style="margin: 5px 0; color: #666;">Detected Currency: ${userCurrency}</h4>
            <div style="margin: 10px 0; padding: 10px; background-color: ${
              currencyInitialized ? "#d4edda" : "#f8d7da"
            }; border-radius: 5px;">
              <strong>Currency Service Status: ${
                currencyInitialized ? "✅ Initialized" : "❌ Failed"
              }</strong>
            </div>
          </div>
          <h4 style="margin: 15px 0 10px 0; color: #333;">Live Exchange Rates:</h4>
          ${ratesTable}
          <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; font-size: 12px; color: #6c757d;">
            <strong>Debug Info:</strong><br>
            Cache Status: ${JSON.stringify(
              currencyService.getCacheStatus()
            )}<br>
            Available Currencies: ${availableCurrencies.length}<br>
            Service Initialized: ${currencyService.isInitialized()}
          </div>
        `,
        width: "600px",
        confirmButtonText: "Close Debug",
        confirmButtonColor: "#00478f",
        showCloseButton: true,
        customClass: {
          popup: "debug-popup",
        },
        didOpen: () => {
          // Add flag-icons CSS if not already added
          if (!document.querySelector('link[href*="flag-icons"]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href =
              "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css";
            document.head.appendChild(link);
          }
        },
      });
    } catch (error) {
      console.error("Error showing debug info:", error);

      await Swal.fire({
        title: "❌ Debug Error",
        html: `
          <div style="text-align: left;">
            <h4>Failed to load debug information:</h4>
            <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px; overflow-x: auto;">
${error instanceof Error ? error.message : "Unknown error"}
            </pre>
          </div>
        `,
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    }
  }

  /**
   * Initialize debug mode - call this on page load
   */
  async initializeDebugMode(): Promise<void> {
    // Check if we're in browser environment
    if (typeof window === "undefined") return;

    // More reliable development check for Next.js
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.port === "3000";

    const isDebugEnabled = localStorage.getItem("currency_debug") === "true";
    const hasDebugParam = window.location.search.includes("debug=currency");

    // TEMPORARY: Always enable debug mode for testing
    const isDebugMode = true; // isDevelopment || isDebugEnabled || hasDebugParam;

    console.log("Currency Debug Check:", {
      isDevelopment,
      isDebugEnabled,
      hasDebugParam,
      isDebugMode,
      hostname: window.location.hostname,
      port: window.location.port,
      temporaryAlwaysEnabled: true,
    });

    if (isDebugMode) {
      console.log(
        "Currency debug mode enabled - showing popup in 2 seconds..."
      );
      // Add a small delay to ensure page is loaded
      setTimeout(async () => {
        try {
          await this.showDebugInfo();
        } catch (error) {
          console.error("Failed to show debug info:", error);
        }
      }, 2000);
    } else {
      console.log(
        'Currency debug mode disabled. To enable: localStorage.setItem("currency_debug", "true") or add ?debug=currency to URL'
      );
    }
  }

  /**
   * Manually trigger debug mode
   */
  async triggerDebug(): Promise<void> {
    await this.showDebugInfo();
  }
}

// Create singleton instance
const geolocationService = new GeolocationService();

export default geolocationService;
export { GeolocationService };
