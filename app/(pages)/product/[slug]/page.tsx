import { Suspense } from "react";
import ProductPageContent from "@/app/components/product/ProductPageContent";
import { notFound } from "next/navigation";

// Define the config
export const dynamic = "force-dynamic";
export const dynamicParams = true;

// Make this a server component and async function
export default async function ProductPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { productid?: string; variant?: string };
}) {
  // Correctly await the params object
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  if (!resolvedParams || !resolvedParams.slug) {
    return notFound();
  }

  const slug = resolvedParams.slug;
  const productId = resolvedSearchParams.productid || null;
  const variantId = resolvedSearchParams.variant || null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductPageContent 
        slug={slug} 
        productId={productId} 
        variantId={variantId}
      />
    </Suspense>
  );
}
