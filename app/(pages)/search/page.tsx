import { Metadata } from "next";
import { Suspense } from "react";
import SearchContent from "./SearchContent";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Search Results - Totally Indian",
    description:
      "Search results for authentic Indian products including health & wellness, beauty, books, divinity items, home decor, and fashion.",
  };
}

export default async function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-00"></div>
          <p className="ml-3 text-gray-500">Loading search results...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
