"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import dynamic from "next/dynamic";

// Dynamic imports for components to avoid linter errors
const AccountInfo = dynamic(() => import("@/app/components/auth/AccountInfo"));
const MyOrders = dynamic(() => import("@/app/components/auth/MyOrders"));
const ChangePassword = dynamic(
  () => import("@/app/components/auth/ChangePassword")
);
const Invoices = dynamic(() => import("@/app/components/auth/Invoices"));
const Wishlist = dynamic(() => import("@/app/components/auth/Wishlist"));

export default function AccountPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("info");
  const tabsRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      // Save current URL for return after login
      const currentUrl = window.location.href;
      console.log("Account page: saving return URL:", currentUrl);
      localStorage.setItem("return_url", currentUrl);
      router.push("/auth?tab=login");
    }
  }, [isLoggedIn, router]);

  // Set active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams!.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Logout
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (tabsRef.current) {
      const activeElement = tabsRef.current.querySelector(
        `.tab-${activeTab}`
      ) as HTMLElement;

      if (activeElement) {
        const tabsContainer = tabsRef.current;
        const containerWidth = tabsContainer.offsetWidth;
        const activeTabLeft = activeElement.offsetLeft;
        const activeTabWidth = activeElement.offsetWidth;

        // Calculate the center position for the active tab
        const scrollPosition =
          activeTabLeft - containerWidth / 2 + activeTabWidth / 2;

        // Scroll to the active tab smoothly
        tabsContainer.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      }
    }
  }, [activeTab]);

  const updateTab = (tab: string) => {
    setActiveTab(tab);
    router.push(`/account?tab=${tab}`, { scroll: false });
  };

  if (!isLoggedIn || !user) {
    return null; // Don't render anything until we redirect
  }

  return (
    <div className="bg-white p-3 md:p-6 my-8 min-h-[calc(100vh-300px)] rounded-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading-3-semibold md:display-3-semibold text-blue-00 text-center">
          Account
        </h1>
        <button
          onClick={handleLogout}
          className="text-red-500 title-1-semibold px-4 py-1 bg-red-50 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Account Navigation Tabs */}
      <div className="mb-8 border-b border-t border-gray-200 relative">
        <div
          ref={tabsRef}
          className="flex md:flex-wrap md:justify-center overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          <button
            onClick={() => updateTab("info")}
            className={`tab-info whitespace-nowrap px-4 md:px-6 py-3 flex items-center border-b-2 flex-shrink-0 snap-start ${
              activeTab === "info"
                ? "border-blue-00 text-blue-00 title-1-semibold"
                : "border-transparent text-gray-500 title-1-medium"
            }`}
          >
            <i className="fas fa-user-circle mr-2"></i>
            <span>Account Info</span>
          </button>
          <button
            onClick={() => updateTab("wishlist")}
            className={`tab-wishlist whitespace-nowrap px-4 md:px-6 py-3 flex items-center border-b-2 flex-shrink-0 snap-start ${
              activeTab === "wishlist"
                ? "border-blue-00 text-blue-00 title-1-semibold"
                : "border-transparent text-gray-500 title-1-medium"
            }`}
          >
            <i className="far fa-heart mr-2"></i>
            <span>Wishlist</span>
          </button>
          <button
            onClick={() => updateTab("orders")}
            className={`tab-orders whitespace-nowrap px-4 md:px-6 py-3 flex items-center border-b-2 flex-shrink-0 snap-start ${
              activeTab === "orders"
                ? "border-blue-00 text-blue-00 title-1-semibold"
                : "border-transparent text-gray-500 title-1-medium"
            }`}
          >
            <i className="fas fa-box mr-2"></i>
            <span>My Orders</span>
          </button>
          <button
            onClick={() => updateTab("password")}
            className={`tab-password whitespace-nowrap px-4 md:px-6 py-3 flex items-center border-b-2 flex-shrink-0 snap-start ${
              activeTab === "password"
                ? "border-blue-00 text-blue-00 title-1-semibold"
                : "border-transparent text-gray-500 title-1-medium"
            }`}
          >
            <i className="fas fa-key mr-2"></i>
            <span>Change Password</span>
          </button>
          <button
            onClick={() => updateTab("invoices")}
            className={`tab-invoices whitespace-nowrap px-4 md:px-6 py-3 flex items-center border-b-2 flex-shrink-0 snap-start ${
              activeTab === "invoices"
                ? "border-blue-00 text-blue-00 title-1-semibold"
                : "border-transparent text-gray-500 title-1-medium"
            }`}
          >
            <i className="fas fa-file-invoice mr-2"></i>
            <span>Invoices</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "info" && <AccountInfo user={user} />}
        {activeTab === "orders" && <MyOrders />}
        {activeTab === "password" && <ChangePassword />}
        {activeTab === "invoices" && <Invoices />}
        {activeTab === "wishlist" && <Wishlist />}
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
