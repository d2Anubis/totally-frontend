import { Metadata } from "next";
import { Suspense } from "react";
import NewArrivalsContent from "./NewArrivalsContent";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New Arrivals - Totally Indian",
    description:
      "Discover our latest collection of authentic Indian products, carefully curated just for you. Shop the newest arrivals in health & wellness, beauty, books, divinity items, home decor, and fashion.",
  };
}

export default async function NewArrivalsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-6 flex items-center justify-center h-96">
          Loading new arrivals...
        </div>
      }
    >
      <NewArrivalsContent />
    </Suspense>
  );
}
