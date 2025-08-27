import { Metadata } from "next";
import { Suspense } from "react";
import RecentlyViewedContent from "./RecentlyViewedContent";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Recently Viewed - Totally Indian",
    description:
      "Browse through products you've recently viewed. Continue shopping from where you left off and discover similar items from our authentic Indian product collection.",
  };
}

export default async function RecentlyViewedPage() {
  return (
    <Suspense
      fallback={
        <div className="py-6 flex items-center justify-center h-96">
          Loading recently viewed products...
        </div>
      }
    >
      <RecentlyViewedContent />
    </Suspense>
  );
}
