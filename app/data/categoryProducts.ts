export interface CategoryProduct {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brand: string;
  rating: number;
  url: string;
  isQuickShip?: boolean;
  isSale?: boolean;
  inStock?: boolean;
  categorySlug: string;
  subcategories?: string[];
  apiProductId?: string;
  variant_id?: string;
  option_values?: { [key: string]: string }; // Add variant option values
}

// Mock products for different categories
export const categoryProducts: CategoryProduct[] = [];

// Mock function to get products by category
export function getProductsByCategory(categorySlug: string) {
  // Filter products by the specified category
  return categoryProducts.filter(
    (product) => product.categorySlug === categorySlug
  );
}

// Function to get products by subcategory
export function getProductsBySubcategory(
  categorySlug: string,
  subcategorySlug: string
) {
  // First get all products for the category
  const categoryProducts = getProductsByCategory(categorySlug);

  // Then filter to only include products that have the subcategory
  return categoryProducts.filter((product) =>
    product.subcategories?.includes(subcategorySlug)
  );
}

// Function to get product by ID
export function getProductById(id: number): CategoryProduct | undefined {
  return categoryProducts.find((product) => product.id === id);
}
