"use client";

import Script from "next/script";
import { useEffect } from "react";
import { GA_TRACKING_ID, GTM_ID } from "../../lib/config";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics 4 (GA4) Component
export const GoogleAnalytics = () => {
  useEffect(() => {
    // Initialize gtag function
    window.gtag = window.gtag || function () {
      (window.dataLayer = window.dataLayer || []).push(arguments);
    };

    // Track page view on route change
    const handleRouteChange = (url: string) => {
      window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
      });
    };

    // Track initial page load
    if (typeof window !== "undefined") {
      handleRouteChange(window.location.pathname);
    }

    // Listen for route changes (Next.js 13+ app router)
    const handlePopState = () => {
      handleRouteChange(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
};

// Google Tag Manager Component
export const GoogleTagManager = () => {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
  }, []);

  if (!GTM_ID) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager Script */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  );
};

// Google Tag Manager NoScript (for users with JavaScript disabled)
export const GoogleTagManagerNoScript = () => {
  if (!GTM_ID) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
};

// Combined Analytics Component
export const Analytics = () => {
  return (
    <>
      <GoogleAnalytics />
      <GoogleTagManager />
      <GoogleTagManagerNoScript />
    </>
  );
};

export default Analytics;
