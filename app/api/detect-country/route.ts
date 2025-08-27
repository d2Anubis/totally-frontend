import { NextRequest, NextResponse } from "next/server";

interface CountryResponse {
  success: boolean;
  data?: {
    ip: string;
    country: string;
    countryCode: string;
    currency: string;
  };
  error?: string;
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

async function getCountryFromIP(
  ip: string
): Promise<{ country: string; countryCode: string; realIp: string } | null> {
  console.log(`[API] Detecting country for IP: ${ip}`);

  // If localhost or private IP, try to get real public IP first
  let realIp = ip;
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip?.startsWith("192.168.") ||
    ip?.startsWith("10.")
  ) {
    console.log(
      "[API] Localhost/Private IP detected, trying to get real public IP..."
    );
    try {
      // Get real public IP using ipify service
      const ipResponse = await fetch("https://api.ipify.org?format=json", {
        signal: AbortSignal.timeout(5000),
      });
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        realIp = ipData.ip;
        console.log(`[API] Got real public IP: ${realIp}`);
      } else {
        throw new Error(`Failed to get public IP: ${ipResponse.status}`);
      }
    } catch (error) {
      console.log("[API] Failed to get real public IP:", error);
      console.log("[API] Using fallback country: United States");
      return { country: "United States", countryCode: "US", realIp: ip };
    }
  }

  const services = [
    {
      name: "ipapi.co",
      url: `https://ipapi.co/${realIp}/json/`,
      parser: (data: Record<string, unknown>) => ({
        country: data.country_name as string,
        countryCode: data.country_code as string,
        success: !!data.country_code,
      }),
    },
    {
      name: "ip-api.com",
      url: `http://ip-api.com/json/${realIp}`,
      parser: (data: Record<string, unknown>) => ({
        country: data.country as string,
        countryCode: data.countryCode as string,
        success: data.status === "success",
      }),
    },
    {
      name: "ipgeolocation.io",
      url: `https://api.ipgeolocation.io/ipgeo?apiKey=demo&ip=${realIp}`,
      parser: (data: Record<string, unknown>) => ({
        country: data.country_name as string,
        countryCode: data.country_code2 as string,
        success: !!data.country_code2,
      }),
    },
  ];

  for (const service of services) {
    try {
      console.log(`[API] Trying ${service.name} for IP ${realIp}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(service.url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "TotallyIndian-GeoDetection/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const parsed = service.parser(data);

      console.log(`[API] ${service.name} response:`, parsed);

      if (parsed.success && parsed.countryCode) {
        return {
          country: parsed.country,
          countryCode: parsed.countryCode,
          realIp: realIp,
        };
      }
    } catch (error) {
      console.log(
        `[API] ${service.name} failed:`,
        error instanceof Error ? error.message : error
      );
      continue;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    // Get the real IP address from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");

    const ip =
      cfConnectingIp ||
      realIp ||
      (forwarded ? forwarded.split(",")[0].trim() : null) ||
      "127.0.0.1";

    console.log(`[API] Detecting country for request. IP: ${ip}, Headers:`, {
      "x-forwarded-for": forwarded,
      "x-real-ip": realIp,
      "cf-connecting-ip": cfConnectingIp,
    });

    // Get country from IP
    const locationData = await getCountryFromIP(ip);

    if (locationData) {
      const currency = COUNTRY_CURRENCY_MAP[locationData.countryCode] || "USD";

      console.log(
        `[API] Successfully detected: ${locationData.country} (${locationData.countryCode}) -> ${currency}`
      );

      return NextResponse.json({
        success: true,
        data: {
          ip,
          realIp: locationData.realIp || ip,
          country: locationData.country,
          countryCode: locationData.countryCode,
          currency,
        },
      } as CountryResponse);
    } else {
      // Fallback to US
      console.log("[API] All geolocation services failed, using fallback");
      return NextResponse.json({
        success: true,
        data: {
          ip,
          country: "United States",
          countryCode: "US",
          currency: "USD",
        },
      } as CountryResponse);
    }
  } catch (error) {
    console.error("[API] Error in detect-country:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to detect country",
      } as CountryResponse,
      { status: 500 }
    );
  }
}
