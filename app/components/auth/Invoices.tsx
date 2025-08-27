"use client";

import Link from "next/link";

export default function Invoices() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="heading-3 text-gray-600 mb-2">
            No Invoices Available
          </h3>
          <p className="body-semibold text-gray-500 mb-6">
            You don&apos;t have any invoices yet. Invoices will appear here
            after you make purchases.
          </p>
          <Link
            href="/"
            className="bg-blue-00 text-white px-6 py-3 rounded-md title-2-semibold hover:bg-blue-10 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
