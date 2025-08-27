import { Metadata } from "next";
import { Suspense } from "react";
import CategoryContent from "./CategoryContent";
import { getCategoryBySlug } from "@/app/data/categories";
import { notFound } from "next/navigation";

type Props = {
  params: {
    category: string;
  };
  searchParams: {
    id?: string;
    category?: string;
    type?: string;
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

  if (!resolvedParams || !resolvedParams.category) {
    return {
      title: "Totally Indian",
      description: "The requested category could not be found.",
    };
  }

  const slug = resolvedParams.category;

  // Try to get category name from search params first (API data)
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

  // Fallback to local data
  const category = getCategoryBySlug(slug);

  if (!category) {
    // If no local data and no search params, use a generic title
    const formattedSlug = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      title: `${formattedSlug} - Totally Indian`,
      description: `Browse our collection of ${formattedSlug.toLowerCase()} products from India.`,
    };
  }

  return {
    title: `${category.name} - Totally Indian`,
    description: category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // Correctly await the params object
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  if (!resolvedParams || !resolvedParams.category) {
    return notFound();
  }

  const slug = resolvedParams.category;
  
  // Get the category type from search params
  const categoryType = resolvedSearchParams?.type === 'super-category' ? 'super-category' : 'category';

  return (
    <Suspense
      fallback={
        <div className="py-6 flex items-center justify-center h-96">
          Loading category...
        </div>
      }
    >
      <CategoryContent categorySlug={slug} categoryType={categoryType} />
    </Suspense>
  );
}
