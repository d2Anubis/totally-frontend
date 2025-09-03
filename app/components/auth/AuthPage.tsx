"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Login from "./Login";
import Registration from "./Registration";

const AuthPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "registration">("login");
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // Debug: Check localStorage state when AuthPage loads
    const checkoutRedirectUrl = localStorage.getItem("checkout_redirect");
    const returnUrl = localStorage.getItem("return_url");
    const buyNowPending = localStorage.getItem("buy_now_pending");
    const referrer = document.referrer;
    const cameFromCheckout = referrer && referrer.includes('/checkout');

    console.log("AuthPage useEffect - localStorage state:");
    console.log("checkoutRedirectUrl:", checkoutRedirectUrl);
    console.log("returnUrl:", returnUrl);
    console.log("buyNowPending:", buyNowPending);
    console.log("referrer:", referrer);
    console.log("cameFromCheckout:", cameFromCheckout);
    console.log("isLoggedIn:", isLoggedIn);

    // Only redirect if already logged in AND there are no pending redirects
    // Let the Login component handle all redirects when user logs in
    if (isLoggedIn) {
      // Check if there are any pending redirects
      const currentCheckoutRedirect = localStorage.getItem("checkout_redirect");
      const currentReturnUrl = localStorage.getItem("return_url");
      const currentBuyNowPending = localStorage.getItem("buy_now_pending");
      const currentReferrer = document.referrer;
      const currentCameFromCheckout = currentReferrer && currentReferrer.includes('/checkout');

      // If there are pending redirects or came from checkout, don't redirect to homepage
      // Let the Login component handle the redirect
      if (currentCheckoutRedirect || currentReturnUrl || currentBuyNowPending || currentCameFromCheckout) {
        console.log("User logged in with pending redirects or came from checkout, not redirecting from AuthPage");
        setJustLoggedIn(true);
        return;
      }

      // Only redirect to homepage if no pending redirects
      console.log("User already logged in with no pending redirects, going to homepage");
      router.replace("/");
    } else {
      setJustLoggedIn(false);
    }

    // Set active tab based on URL parameter
    const tab = searchParams!.get("tab");
    if (tab === "registration") {
      setActiveTab("registration");
    } else {
      setActiveTab("login");
    }
  }, [searchParams, isLoggedIn, router]);

  useEffect(() => {
    // Check if there's a return_url in the URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("return_url");

    if (returnUrl) {
      // Store in localStorage for use after successful login
      localStorage.setItem("return_url", returnUrl);
    }
  }, []);

  const switchTab = (tab: "login" | "registration") => {
    setActiveTab(tab);
    router.push(`/auth?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="main-container rounded-2xl bg-white mx-auto min-h-[calc(100vh-300px)] !p-5">
      {/* Login/Registration Tabs */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-3xl">
          <div className="flex text-center border-b border-gray-40">
            <div
              className={`flex-1 pb-2 ${
                activeTab === "login" ? "border-b-2 border-blue-00" : ""
              } cursor-pointer`}
              onClick={() => switchTab("login")}
            >
              <h2
                className={`title-2 ${
                  activeTab === "login" ? "text-blue-00" : "text-gray-30"
                }`}
              >
                Login
              </h2>
            </div>
            <div
              className={`flex-1 pb-2 ${
                activeTab === "registration" ? "border-b-2 border-blue-00" : ""
              } cursor-pointer`}
              onClick={() => switchTab("registration")}
            >
              <h2
                className={`title-2 ${
                  activeTab === "registration" ? "text-blue-00" : "text-gray-30"
                }`}
              >
                Registration
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form Container */}
      <div
        className="w-full max-w-3xl mx-auto"
        style={{
          backgroundImage: "url('/images/map.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mb-6">
          {activeTab === "login" ? (
            <p className="title-2-medium">
              You Don&apos;t Have An Account Yet?{" "}
              <span
                className="text-blue-00 title-2 cursor-pointer"
                onClick={() => switchTab("registration")}
              >
                Register Now
              </span>
            </p>
          ) : (
            <p className="title-2-medium">
              Already Have An Account?{" "}
              <span
                className="text-blue-00 title-2 cursor-pointer"
                onClick={() => switchTab("login")}
              >
                Login
              </span>
            </p>
          )}
        </div>

        {activeTab === "login" ? (
          <Login showTabs={false} />
        ) : (
          <Registration showTabs={false} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
