"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProductGallery from "@/app/components/product/ProductGallery";
import ProductInfo from "@/app/components/product/ProductInfo";
import ProductDetails from "@/app/components/product/ProductDetails";
import CustomerReviews from "@/app/components/product/CustomerReviews";
import Breadcrumb from "@/app/components/common/Breadcrumb";
import NewArrivalsSection from "@/app/components/home/NewArrivalsSection";
import RecentlyViewedSection from "@/app/components/home/RecentlyViewedSection";
import ProductSection, {
  Product,
} from "@/app/components/common/ProductSection";
import {
  getProductByIdWithSlug,
  trackProductView,
  ProductDetail,
  VariationOption,
  ImageUrl,
} from "@/app/lib/services/productService";
import { useAuth } from "@/app/context/AuthContext";
import {
  getProductsByAnyCategory,
  Product as CollectionProduct,
} from "@/app/lib/services/collectionService";

// Define product type
interface ProductData {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  originalPrice: number;
  discount: number;
  brand: string;
  seller: string;
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription: string;
  images: string[];
  ingredients: string[];
  benefits: string[];
  directions: string;
  categories: string[];
  categoryIds: { id: string; title: string }[];
  // Variant data
  hasVariant: boolean;
  variantId?: string | null;
  optionValues?: { [key: string]: string };
  // Actual product ID for reviews (different from variant ID)
  actualProductId: string;
  variants?: {
    commonAttributes: {
      title: string;
      description: string;
      shortDescription: string;
      brand: string;
      type: string;
    };
    variationOptions: VariationOption[];
    variantProducts: Array<{
      id: string;
      title: string;
      price: number;
      compare_price?: number;
      sku: string;
      stock_qty: number;
      image_urls: Array<{ url: string; position: number }>;
      option_values: { [key: string]: string };
      variant_id: string;
    }>;
  } | null;
}

export default function ProductPageContent({
  slug,
  productId,
  variantId,
}: {
  slug: string;
  productId: string | null;
  variantId?: string | null;
}) {
  const { isLoggedIn } = useAuth();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState<string>("More Products");
  const [currentVariantId, setCurrentVariantId] = useState<string | null>(
    variantId || null
  );
  const router = useRouter();

  // Handle variant changes
  const handleVariantChange = (
    variantProduct: {
      id: string;
      title: string;
      price: number;
      compare_price?: number;
      sku: string;
      stock_qty: number;
      image_urls: Array<{ url: string; position: number }>;
      option_values: { [key: string]: string };
      variant_id: string;
    } | null
  ) => {
    if (variantProduct && productData) {
      // Get default images (product level)
      const defaultImages = productData.images.filter(
        (img) =>
          !productData.variants?.variantProducts.some((v) =>
            v.image_urls.some((vImg) => vImg.url === img)
          )
      );

      // Get variant-specific images
      const variantImages =
        variantProduct.image_urls
          ?.sort((a, b) => a.position - b.position)
          .map((img) => img.url) || [];

      // Combine variant images with default images (variant images first)
      const allImages = [...variantImages, ...defaultImages];

      // Update product data with variant information
      const updatedProductData: ProductData = {
        ...productData,
        id: variantProduct.id,
        name: variantProduct.title,
        sku: variantProduct.sku,
        price: variantProduct.price,
        originalPrice: variantProduct.compare_price || variantProduct.price,
        discount: variantProduct.compare_price
          ? Math.round(
              ((variantProduct.compare_price - variantProduct.price) /
                variantProduct.compare_price) *
                100
            )
          : 0,
        images: allImages.length > 0 ? allImages : productData.images,
        variantId: variantProduct.variant_id,
        optionValues: variantProduct.option_values,
        // Keep the same actual product ID for reviews
        actualProductId: productData.actualProductId,
      };

      setProductData(updatedProductData);
      setCurrentVariantId(variantProduct.variant_id);

      // Update URL with variant parameter
      const newUrl = new URL(window.location.href);
      if (productId) {
        newUrl.searchParams.set("productid", productId);
      }
      newUrl.searchParams.set("variant", variantProduct.variant_id);
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  };

  // Function to create slug from product title
  const createSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Function to convert API product to ProductData format
  const convertApiProductToProductData = useCallback(
    (apiProduct: ProductDetail): ProductData => {
      // Handle default product images
      const defaultImages =
        apiProduct.default_image_urls
          ?.sort((a: ImageUrl, b: ImageUrl) => a.position - b.position)
          .map((img: ImageUrl) => img.url) || [];

      // Get pricing info from DefaultVariant (new structure)
      const defaultVariant = apiProduct.DefaultVariant;
      const price = defaultVariant?.price || 0;
      const comparePrice = defaultVariant?.compare_price || null;
      const sku = defaultVariant?.sku || "";

      // Get variant-specific images, fallback to default images
      const variantImages =
        defaultVariant?.image_urls
          ?.sort((a: ImageUrl, b: ImageUrl) => a.position - b.position)
          .map((img: ImageUrl) => img.url) || [];

      // Combine variant images with default images (variant images first)
      const allImages = [...variantImages, ...defaultImages];

      return {
        id: apiProduct.id, // This remains the main identifier
        slug: apiProduct.page_url || createSlug(apiProduct.title),
        name: apiProduct.title,
        sku: sku,
        price: price,
        originalPrice:
          comparePrice && comparePrice > price ? comparePrice : price,
        discount:
          comparePrice && comparePrice > price
            ? Math.round(((comparePrice - price) / comparePrice) * 100)
            : 0,
        brand: apiProduct.brand || "",
        seller:
          apiProduct.Seller?.firm_name || apiProduct.brand || "Unknown Seller",
        rating: apiProduct.reviews?.statistics?.average_rating || 0,
        reviewCount: apiProduct.reviews?.statistics?.total_reviews || 0,
        description: apiProduct.description || "",
        shortDescription: apiProduct.short_description || "",
        images:
          allImages.length > 0 ? allImages : ["/images/common/product.png"],
        ingredients: [], // Default empty since not available in API
        benefits: [], // Default empty since not available in API
        directions: "", // Default empty since not available in API
        categories: apiProduct.Collections?.map((col) => col.title) ||
          apiProduct.Tags?.map((tag) => tag.name) || ["General"],
        categoryIds:
          apiProduct.Collections?.map((col) => ({
            id: col.id,
            title: col.title,
          })) || [],
        // Variant data
        hasVariant: apiProduct.has_variant || false,
        variantId: apiProduct.variant_id || defaultVariant?.id || null,
        optionValues: defaultVariant?.option_values || {},
        // Add actual product ID for reviews (when dealing with variants)
        actualProductId: apiProduct.has_variant
          ? (apiProduct as any).product_id || apiProduct.id
          : apiProduct.id,
        variants: apiProduct.variants
          ? {
              commonAttributes: {
                title: apiProduct.variants.common_attributes.title,
                description: apiProduct.variants.common_attributes.description,
                shortDescription:
                  apiProduct.variants.common_attributes.short_description,
                brand: apiProduct.variants.common_attributes.brand,
                type: apiProduct.variants.common_attributes.type,
              },
              variationOptions: apiProduct.variants.variation_options,
              variantProducts: apiProduct.variants.variant_products.map(
                (variant: any) => ({
                  id: variant.id,
                  title: apiProduct.title, // Use main product title
                  price: variant.price,
                  compare_price: variant.compare_price,
                  sku: variant.sku,
                  stock_qty: variant.stock_qty,
                  image_urls: variant.image_urls || [],
                  option_values: variant.option_values,
                  variant_id: variant.id,
                })
              ),
            }
          : null,
      };
    },
    []
  );

  // Function to convert CollectionProduct to Product format for ProductSection
  const convertCollectionProductToProduct = useCallback(
    (collectionProduct: CollectionProduct): Product => {
      const slug =
        collectionProduct.page_url || createSlug(collectionProduct.title);

      const price = collectionProduct.price || 0;
      const comparePrice = collectionProduct.compare_price || null;

      return {
        id: collectionProduct.id.toString(),
        title: collectionProduct.title,
        imageUrl:
          collectionProduct.image_url ||
          collectionProduct.image_urls?.[0]?.url ||
          "/images/common/product.png",
        price: price,
        originalPrice:
          comparePrice && comparePrice > price ? comparePrice : undefined,
        discount:
          comparePrice && comparePrice > price
            ? Math.round(((comparePrice - price) / comparePrice) * 100)
            : undefined,
        brand: collectionProduct.brand || "Unknown Brand",
        rating: collectionProduct.rating || 0,
        url: `/product/${slug}/?productid=${collectionProduct.id}`,
        isQuickShip:
          collectionProduct.in_stock || collectionProduct.stock_qty > 0,
        isSale:
          collectionProduct.is_sale || !!(comparePrice && comparePrice > price),
      };
    },
    []
  ); // Empty dependency array since this function doesn't depend on any state

  // Fetch related products from the same category
  const fetchRelatedProducts = useCallback(
    async (
      categoryIds: { id: string; title: string }[],
      currentProductId: string
    ) => {
      if (!categoryIds || categoryIds.length === 0) {
        console.log("No category IDs available for fetching related products");
        return;
      }

      setRelatedProductsLoading(true);

      try {
        // Use the first category to fetch related products
        const primaryCategory = categoryIds[0];
        setCategoryTitle(primaryCategory.title);

        const response = await getProductsByAnyCategory(
          primaryCategory.id.toString(),
          {
            limit: 10, // Get 10 products
            page: 1,
          }
        );

        if (response && response.products) {
          // Filter out the current product and convert to Product format
          const filteredProducts = response.products
            .filter((product) => product.id !== currentProductId)
            .slice(0, 5) // Take only 5 products
            .map(convertCollectionProductToProduct);

          setRelatedProducts(filteredProducts);
          console.log(
            `Found ${filteredProducts.length} related products from category: ${primaryCategory.title}`
          );
        } else {
          console.log("No related products found");
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setRelatedProductsLoading(false);
      }
    },
    [convertCollectionProductToProduct]
  ); // Add dependency for the function used inside

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      // For now, we require productId. In future, we could implement slug-based lookup
      if (!productId) {
        console.log(`No product ID provided for slug: ${slug}`);
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const apiProduct = await getProductByIdWithSlug(productId, true, 10);

        console.log("Product fetched successfully", apiProduct);

        if (apiProduct) {
          const convertedProduct = convertApiProductToProductData(apiProduct);
          console.log(`Found product: ${convertedProduct.name}`);

          // Auto-select first available variant if variants exist and no specific variant is requested
          if (
            convertedProduct.variants &&
            convertedProduct.variants.variantProducts.length > 0 &&
            !currentVariantId
          ) {
            // Find the best matching variant based on the order of optiVarient Productons
            // We want to select the variant that matches the first values in each variation option
            const variationOptions = convertedProduct.variants.variantProducts;
            const optionDefinitions =
              convertedProduct.variants.variationOptions;

            // Create a map of preferred option values (first value for each option)
            const preferredOptions: { [key: string]: string } = {};
            optionDefinitions.forEach((option) => {
              if (option.values && option.values.length > 0) {
                preferredOptions[option.name] = option.values[0];
              }
            });

            // Score each variant based on how well it matches the preferred options
            // Lower score is better (0 would be a perfect match for all options)
            type ScoredVariant = {
              variant: {
                id: string;
                title: string;
                price: number;
                compare_price?: number;
                sku: string;
                stock_qty: number;
                image_urls: Array<{ url: string; position: number }>;
                option_values: { [key: string]: string };
                variant_id: string;
              };
              score: number;
            };

            const scoredVariants = variationOptions.map((variant) => {
              let score = 0;

              // For each option, check if it matches the preferred value
              // If not, find the index difference and add to score
              // Add null/undefined check for variant.option_values
              if (variant.option_values && typeof variant.option_values === 'object') {
                Object.entries(variant.option_values).forEach(
                  ([optionName, optionValue]) => {
                    const optionDef = optionDefinitions.find(
                      (opt) => opt.name === optionName
                    );
                    if (optionDef && optionDef.values) {
                      const preferredValue = preferredOptions[optionName];
                      if (optionValue !== preferredValue) {
                        const preferredIndex =
                          optionDef.values.indexOf(preferredValue);
                        const actualIndex = optionDef.values.indexOf(optionValue);
                        // Add the distance from preferred index as score (higher = worse)
                        score += Math.abs(actualIndex - preferredIndex);
                      }
                    }
                  }
                );
              }

              return { variant, score };
            });

            // Sort by score (ascending) and pick the best match
            scoredVariants.sort(
              (a: ScoredVariant, b: ScoredVariant) => a.score - b.score
            );
            const bestVariant = scoredVariants[0]?.variant;

            if (bestVariant) {
              // Set the current variant ID
              setCurrentVariantId(bestVariant.variant_id);

              // Apply variant data to the product data directly
              const defaultImages = convertedProduct.images.filter(
                (img: string) =>
                  !convertedProduct.variants?.variantProducts.some((v) =>
                    v.image_urls.some((vImg) => vImg.url === img)
                  )
              );

              // Get variant-specific images
              const variantImages =
                bestVariant.image_urls
                  ?.sort((a, b) => a.position - b.position)
                  .map((img) => img.url) || [];

              // Combine variant images with default images (variant images first)
              const allImages = [...variantImages, ...defaultImages];

              // Update product data with variant information
              const updatedProductData: ProductData = {
                ...convertedProduct,
                id: bestVariant.id,
                name: bestVariant.title,
                sku: bestVariant.sku,
                price: bestVariant.price,
                originalPrice: bestVariant.compare_price || bestVariant.price,
                discount: bestVariant.compare_price
                  ? Math.round(
                      ((bestVariant.compare_price - bestVariant.price) /
                        bestVariant.compare_price) *
                        100
                    )
                  : 0,
                images:
                  allImages.length > 0 ? allImages : convertedProduct.images,
                variantId: bestVariant.variant_id,
                optionValues: bestVariant.option_values,
                // Keep the same actual product ID for reviews
                actualProductId: convertedProduct.actualProductId,
              };

              setProductData(updatedProductData);

              // Update URL with variant parameter
              const newUrl = new URL(window.location.href);
              if (productId) {
                newUrl.searchParams.set("productid", productId);
              }
              newUrl.searchParams.set("variant", bestVariant.variant_id);
              router.replace(newUrl.pathname + newUrl.search, {
                scroll: false,
              });

              return;
            }
          }

          // If a specific variant is requested, update the product data accordingly
          if (currentVariantId && convertedProduct.variants) {
            const requestedVariant =
              convertedProduct.variants.variantProducts.find(
                (v) => v.variant_id === currentVariantId
              );

            if (requestedVariant) {
              // Apply variant data to the product data directly
              const defaultImages = convertedProduct.images.filter(
                (img) =>
                  !convertedProduct.variants?.variantProducts.some((v) =>
                    v.image_urls.some((vImg) => vImg.url === img)
                  )
              );

              const variantImages =
                requestedVariant.image_urls
                  ?.sort((a, b) => a.position - b.position)
                  .map((img) => img.url) || [];

              const allImages = [...variantImages, ...defaultImages];

              const updatedProductData: ProductData = {
                ...convertedProduct,
                id: requestedVariant.id,
                name: requestedVariant.title,
                sku: requestedVariant.sku,
                price: requestedVariant.price,
                originalPrice:
                  requestedVariant.compare_price || requestedVariant.price,
                discount: requestedVariant.compare_price
                  ? Math.round(
                      ((requestedVariant.compare_price -
                        requestedVariant.price) /
                        requestedVariant.compare_price) *
                        100
                    )
                  : 0,
                images:
                  allImages.length > 0 ? allImages : convertedProduct.images,
                variantId: requestedVariant.variant_id,
                optionValues: requestedVariant.option_values,
                // Keep the same actual product ID for reviews
                actualProductId: convertedProduct.actualProductId,
              };

              setProductData(updatedProductData);
            } else {
              console.warn(
                `Variant ${currentVariantId} not found, using default variant`
              );
              setProductData(convertedProduct);
            }
          } else {
            setProductData(convertedProduct);
          }

          // Track product view for recently viewed functionality
          trackProductView(productId);

          // Fetch related products from the same category
          fetchRelatedProducts(
            convertedProduct.categoryIds,
            convertedProduct.id
          );

          // Update URL to include productId if not present (for future reloads)
          const currentUrl = new URL(window.location.href);
          let shouldUpdateUrl = false;

          if (!currentUrl.searchParams.has("productid")) {
            currentUrl.searchParams.set("productid", productId);
            shouldUpdateUrl = true;
          }

          if (shouldUpdateUrl) {
            router.replace(currentUrl.pathname + currentUrl.search, {
              scroll: false,
            });
          }
        } else {
          console.log(`Product not found for ID: ${productId}`);
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [
    productId,
    currentVariantId,
    convertApiProductToProductData,
    fetchRelatedProducts,
    slug,
  ]);

  // Return loading state if data is not loaded yet
  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center h-96">
        Loading product details...
      </div>
    );
  }

  // Return error message if product not found
  if (notFound || !productData) {
    return (
      <div className="py-6 flex flex-col items-center justify-center h-96">
        <h2 className="title-2 text-gray-10 mb-4">Product Not Found</h2>
        <p className="body text-gray-30 mb-4">
          The product you are looking for does not exist.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-00 text-white px-6 py-2 rounded-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="py-0 md:py-6">
      <div className="bg-white rounded-xl p-4 md:p-6">
        <div className="hidden md:block">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              {
                label: productData.categories[0] || "Home",
                url: productData.categoryIds && productData.categoryIds.length > 0
                  ? `/category/${(productData.categories[0] || "")
                      .toLowerCase()
                      .replace(/\s+/g, "-")}/all?id=${productData.categoryIds[0].id}&type=sub-category&subcategory=${encodeURIComponent(productData.categories[0] || "")}`
                  : `/`,
              },
              {
                label: productData.brand || "Brand",
                url: "#", // Prevent navigation on brand click
              },
              {
                label: productData.name,
                url: `/product/${productData.slug}/?productid=${productData.id}`,
              },
            ]}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-0 md:gap-8 mt-0 md:mt-6 mb-4 md:mb-8">
          {/* Product Gallery and Main Image */}
          <div className="lg:w-[50%]">
            <ProductGallery images={productData.images} />
          </div>

          {/* Product Info - Right column */}
          <div className="lg:w-[50%]">
            <ProductInfo
              id={productData.id}
              name={productData.name}
              shortDescription={productData.shortDescription}
              sku={productData.sku}
              price={productData.price}
              originalPrice={productData.originalPrice}
              discount={productData.discount}
              brand={productData.brand}
              seller={productData.seller}
              rating={productData.rating}
              reviewCount={productData.reviewCount}
              imageUrl={productData.images[0]}
              hasVariant={productData.hasVariant}
              variantId={productData.variantId || undefined}
              optionValues={productData.optionValues}
              variants={productData.variants}
              onVariantChange={handleVariantChange}
            />
          </div>
        </div>

        {/* Product Details */}
        <ProductDetails
          description={productData.description}
          ingredients={productData.ingredients}
          benefits={productData.benefits}
          directions={productData.directions}
        />
      </div>

      {/* Customer Reviews */}
      <CustomerReviews
        productId={productData.actualProductId.toString()}
        reviewCount={productData.reviewCount}
      />

      {/* Related Products Section - Only show if we have products */}
      {relatedProductsLoading ? (
        <div className="mb-8 mt-8 bg-white rounded-2xl px-6 py-6">
          <h2 className="text-xl font-semibold mb-4">
            Loading related products...
          </h2>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      ) : relatedProducts.length > 0 ? (
        <ProductSection
          title={`More Products From ${categoryTitle}`}
          products={relatedProducts}
          categoryUrl={`/category/${categoryTitle
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          className="mb-8 mt-8 bg-white rounded-2xl px-6 py-6"
        />
      ) : null}

      {/* Continue to use the original components for these sections */}
      <NewArrivalsSection />

      {/* Recently Viewed Section - Only show for logged in users */}
      {isLoggedIn && <RecentlyViewedSection />}
    </div>
  );
}
