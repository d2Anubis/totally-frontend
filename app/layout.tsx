import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";
import { NavigationProvider } from "./context/NavigationContext";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './lib/config';
import ScrollToTop from "./components/common/ScrollToTop";
import CurrencyDebugInitializer from "./components/common/CurrencyDebugInitializer";
import LocationPricingInitializer from "./components/common/LocationPricingInitializer";
import Analytics from "./components/common/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Totally Indian - Authentic Indian Products",
  description:
    "Shop authentic Indian products including health & wellness, beauty, books, divinity items, home decor, and fashion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css"
        />
        <script
          async
          src="https://checkout.razorpay.com/v1/checkout.js"
        ></script>
      </head>

      <body className={`main-container bg-blue-70`}  suppressHydrationWarning>
        <Analytics />
        <Suspense fallback={<div>Loading navigation context...</div>}>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 2000,
              className:
                "custom-toast transform transition-all duration-500 ease-in-out",
              style: {
                background: "#fff",
                color: "#333",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                padding: "12px",
              },
              success: {
                duration: 2000,
                className: "custom-toast-success",
                iconTheme: {
                  primary: "#009846",
                  secondary: "#FFFFFF",
                },
              },
              error: {
                duration: 3000,
                className: "custom-toast-error",
                iconTheme: {
                  primary: "#a02334",
                  secondary: "#FFFFFF",
                },
              },
            }}
          />
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <ShopProvider>
                <NavigationProvider>
                  <CurrencyDebugInitializer />
                  <LocationPricingInitializer />
                  <ScrollToTop />
                  <Header />
                  <main className="min-h-screen">{children}</main>
                  <Footer />
                </NavigationProvider>
              </ShopProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
