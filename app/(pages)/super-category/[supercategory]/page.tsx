import { Metadata } from "next";
import { Suspense } from "react";
import CategoryContent from "../../category/[category]/CategoryContent";
import { notFound } from "next/navigation";

type Props = {
  params: {
    supercategory: string;
  };
  searchParams: {
    id?: string;
    category?: string;
    trending?: string;
  };
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  // Correctly await the params object
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  if (!resolvedParams || !resolvedParams.supercategory) {
    return {
      title: "Totally Indian",
      description: "The requested super category could not be found.",
    };
  }

  const slug = resolvedParams.supercategory;

  // Try to get super category name from search params first (API data)
  const categoryName = resolvedSearchParams?.category;

  if (categoryName) {
    const trending = resolvedSearchParams?.trending === "true";
    const title = trending
      ? `${categoryName} - Trending - Totally Indian`
      : `${categoryName} - Totally Indian`;
    return {
      title,
      description: `Browse our collection of ${categoryName.toLowerCase()} products from India.`,
    };
  }

  // Fallback to slug-based title
  const formattedSlug = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedSlug} - Totally Indian`,
    description: `Browse our collection of ${formattedSlug.toLowerCase()} products from India.`,
  };
}

export default async function SuperCategoryPage({ params }: Props) {
  // Correctly await the params object
  const resolvedParams = await Promise.resolve(params);

  if (!resolvedParams || !resolvedParams.supercategory) {
    return notFound();
  }

  const slug = resolvedParams.supercategory;

  return (
    <Suspense
      fallback={
        <div className="py-6 flex items-center justify-center h-96">
          Loading super category...
        </div>
      }
    >
      <CategoryContent categorySlug={slug} categoryType="super-category" />
    </Suspense>
  );
} 