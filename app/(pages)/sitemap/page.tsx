import React from "react";
import Link from "next/link";

const SitemapPage = () => {
  const mainCategories = [
    { name: "Health & Wellness", url: "/category/health-wellness" },
    { name: "Beauty & Personal Care", url: "/category/body-care" },
    { name: "Books", url: "/category/books" },
    { name: "Divinity", url: "/category/divinity" },
    { name: "Home & Decor", url: "/category/home-decor" },
    { name: "Fashion", url: "/category/fashion" },
  ];

  const companyPages = [
    { name: "About Us", url: "/about-us" },
    { name: "Contact Us", url: "/contact-us" },
    { name: "Careers", url: "/careers" },
    { name: "Our Story", url: "/our-story" },
    { name: "Press", url: "/press" },
  ];

  const supportPages = [
    { name: "FAQs", url: "/faqs" },
    { name: "Shipping Policy", url: "/shipping-policy" },
    { name: "Return Policy", url: "/return-policy" },
    { name: "Privacy Policy", url: "/privacy-policy" },
    { name: "Terms of Service", url: "/terms-of-service" },
  ];

  const accountPages = [
    { name: "My Account", url: "/account" },
    { name: "Order History", url: "/account?tab=orders" },
    { name: "Wishlist", url: "/account?tab=wishlist" },
    { name: "Track Order", url: "/track-order" },
  ];

  const authPages = [
    { name: "Login", url: "/auth?tab=login" },
    { name: "Register", url: "/auth?tab=register" },
    { name: "Forgot Password", url: "/forgot-password" },
  ];

  const shoppingPages = [
    { name: "Cart", url: "/cart" },
    { name: "Checkout", url: "/checkout" },
    { name: "Search", url: "/search" },
    { name: "Categories", url: "/categories" },
    { name: "New Arrivals", url: "/category/new-arrivals" },
    { name: "Recently Viewed", url: "/collections/recently-viewed" },
  ];

  const sellerPages = [
    { name: "Become a Seller", url: "/seller" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-sm p-8 text-gray-900">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Sitemap
        </h1>
        
        <p className="text-gray-700 text-center mb-12 leading-relaxed">
          Find all the pages and sections available on Totally Indian. 
          Use this sitemap to navigate through our website easily.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Main Categories */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Shop Categories
            </h2>
            <ul className="space-y-2">
              {mainCategories.map((category) => (
                <li key={category.url}>
                  <Link
                    href={category.url}
                    className="text-gray-700 hover:text-blue-600 transition-colors block py-1"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Pages */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">
              Company
            </h2>
            <ul className="space-y-2">
              {companyPages.map((page) => (
                <li key={page.url}>
                  <Link
                    href={page.url}
                    className="text-gray-700 hover:text-green-600 transition-colors block py-1"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Pages */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">
              Support & Policies
            </h2>
            <ul className="space-y-2">
              {supportPages.map((page) => (
                <li key={page.url}>
                  <Link
                    href={page.url}
                    className="text-gray-700 hover:text-purple-600 transition-colors block py-1"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Pages */}
          <div className="bg-orange-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-orange-800 mb-4">
              My Account
            </h2>
            <ul className="space-y-2">
              {accountPages.map((page) => (
                <li key={page.url}>
                  <Link
                    href={page.url}
                    className="text-gray-700 hover:text-orange-600 transition-colors block py-1"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Authentication Pages */}
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
              Authentication
            </h2>
            <ul className="space-y-2">
              {authPages.map((page) => (
                <li key={page.url}>
                  <Link
                    href={page.url}
                    className="text-gray-700 hover:text-indigo-600 transition-colors block py-1"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shopping Pages */}
          <div className="bg-pink-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-pink-800 mb-4">
              Shopping
            </h2>
            <ul className="space-y-2">
              {shoppingPages.map((page) => (
                <li key={page.url}>
                  <Link
                    href={page.url}
                    className="text-gray-700 hover:text-pink-600 transition-colors block py-1"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Seller Section */}
        <div className="mt-8">
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
              For Sellers
            </h2>
            <ul className="space-y-2">
              {sellerPages.map((page) => (
                <li key={page.url}>
                  <Link
                    href={page.url}
                    className="text-gray-700 hover:text-yellow-600 transition-colors block py-1"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Additional Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Contact Information</h3>
              <p className="text-gray-600 mb-1">Email: contact@totallyindian.com</p>
              <p className="text-gray-600 mb-1">Phone: +91 6262462162</p>
              <p className="text-gray-600">WhatsApp: <a href="https://wa.me/916262462162" className="text-blue-600 hover:underline">+91 6262462162</a></p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Business Hours</h3>
              <p className="text-gray-600 mb-1">Monday to Friday: 10:00 a.m. to 7:00 p.m. IST</p>
              <p className="text-gray-600 mb-1">Saturday: 10:00 a.m. to 3:00 p.m. IST</p>
              <p className="text-gray-600">Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-700 mb-4">
            Use our search feature to find specific products or pages.
          </p>
          <Link
            href="/search"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Search Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
