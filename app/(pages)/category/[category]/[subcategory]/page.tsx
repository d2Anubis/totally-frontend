import { Metadata } from "next";
import { Suspense } from "react";
import SubcategoryContent from "./SubcategoryContent";
import { getCategoryBySlug } from "@/app/data/categories";
import { notFound } from "next/navigation";

type Props = {
  params: {
    category: string;
    subcategory: string;
  };
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Correctly await the params object
  const resolvedParams = await Promise.resolve(params);

  if (
    !resolvedParams ||
    !resolvedParams.category ||
    !resolvedParams.subcategory
  ) {
    return {
      title: "Totally Indian",
      description: "The requested subcategory could not be found.",
    };
  }

  const categorySlug = resolvedParams.category;
  const subcategorySlug = resolvedParams.subcategory;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Totally Indian",
      description: "The requested category could not be found.",
    };
  }

  // Find the subcategory in the category
  const subcategory = category.subcategories?.find(
    (sub) => sub.slug === subcategorySlug
  );

  if (!subcategory) {
    return {
      title: "Subcategory Not Found - Totally Indian",
      description: "The requested subcategory could not be found.",
    };
  }

  return {
    title: `${subcategory.name} - ${category.name} - Totally Indian`,
    description: subcategory.description || category.description,
  };
}

export default async function SubcategoryPage({ params }: Props) {
  // Correctly await the params object
  const resolvedParams = await Promise.resolve(params);

  if (
    !resolvedParams ||
    !resolvedParams.category ||
    !resolvedParams.subcategory
  ) {
    return notFound();
  }

  const categorySlug = resolvedParams.category;
  const subcategorySlug = resolvedParams.subcategory;

  return (
    <Suspense
      fallback={
        <div className="py-6 flex items-center justify-center h-96">
          Loading subcategory...
        </div>
      }
    >
      <SubcategoryContent
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug}
      />
    </Suspense>
  );
}
