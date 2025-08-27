import axiosInstance from "../axiosConfig";

// TypeScript interfaces for the new API response structure
export interface ApiSubCategory {
  id: string;
  sub_category: {
    id: string;
    title: string;
    category_type: "sub-category";
  };
  display_order: number;
  is_active: boolean;
  level: "sub_category";
}

export interface ApiCategory {
  id: string;
  category: {
    id: string;
    title: string;
    category_type: "category";
  };
  sub_categories: ApiSubCategory[];
  display_order: number;
  is_active: boolean;
  level: "category";
}

export interface ApiSuperCategory {
  id: string;
  super_category: {
    id: string;
    title: string;
    category_type: "super-category";
  };
  categories: ApiCategory[];
  display_order: number;
  is_active: boolean;
  level: "super_category";
}

export interface CustomNavigationResponse {
  success: boolean;
  data: ApiSuperCategory[];
  message?: string;
}

// Transformed navigation structure for easy rendering
export interface NavigationNode {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  category_type: 'super-category' | 'category' | 'sub-category';
  collection_id: string; // The actual collection ID
  display_order: number;
  children?: NavigationNode[];
}

export interface CustomNavigationTree {
  success: boolean;
  data: NavigationNode[];
}

// Helper function to create URL slug from category title
const createCategorySlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

// Helper function to get category URL
export const getNavigationUrl = (node: NavigationNode): string => {
  const slug = createCategorySlug(node.title);
  
  switch (node.category_type) {
    case "super-category":
      // Super categories should go to CategoryContent.tsx via /category route
      return `/category/${slug}?id=${node.collection_id}&type=super-category`;
    case "category":
      // Categories should go to SubcategoryContent.tsx via /category/[category]/[subcategory] route
      return `/category/${slug}/all?id=${node.collection_id}&type=category`;
    case "sub-category":
      // Sub-categories should go to SubcategoryContent.tsx via /category/[category]/[subcategory] route
      return `/category/${slug}?id=${node.collection_id}&type=sub-category`;
    default:
      return `/category/${slug}`;
  }
};

// Helper function to get subcategory URL with parent context
export const getSubcategoryUrl = (
  parent: NavigationNode,
  subcategory: NavigationNode
): string => {
  const parentSlug = createCategorySlug(parent.title);
  const subcategorySlug = createCategorySlug(subcategory.title);

  // Ensure we're using the correct URL structure based on the subcategory type
  return `/category/${parentSlug}/${subcategorySlug}?id=${
    subcategory.collection_id
  }&type=sub-category`;
};

// Transform API response to hierarchical structure
const transformNavigationData = (apiData: ApiSuperCategory[]): NavigationNode[] => {
  const transformedData = apiData.map(superCategoryItem => {
    // Transform sub-categories
    const transformSubCategories = (categories: ApiCategory[]): NavigationNode[] => {
      return categories.map(categoryItem => {
        const subCategories: NavigationNode[] = categoryItem.sub_categories
          .filter(subCat => subCat.is_active)
          .sort((a, b) => a.display_order - b.display_order)
          .map(subCat => ({
            id: subCat.id,
            title: subCat.sub_category.title,
            category_type: 'sub-category' as const,
            collection_id: subCat.sub_category.id,
            display_order: subCat.display_order,
            children: []
          }));

        return {
          id: categoryItem.id,
          title: categoryItem.category.title,
          category_type: 'category' as const,
          collection_id: categoryItem.category.id,
          display_order: categoryItem.display_order,
          children: subCategories
        };
      });
    };

    // Transform categories
    const categories = transformSubCategories(
      superCategoryItem.categories
        .filter(cat => cat.is_active)
        .sort((a, b) => a.display_order - b.display_order)
    );

    // Create super category node
    const superCategoryNode: NavigationNode = {
      id: superCategoryItem.id,
      title: superCategoryItem.super_category.title,
      category_type: 'super-category',
      collection_id: superCategoryItem.super_category.id,
      display_order: superCategoryItem.display_order,
      children: categories
    };

    return superCategoryNode;
  });

  // Sort by display_order
  const sortedData = transformedData
    .filter(item => item !== null)
    .sort((a, b) => a.display_order - b.display_order);

  return sortedData;
};

// Fetch custom navigation data
export const getCustomNavigation = async (): Promise<CustomNavigationTree | null> => {
  try {
    
    const response = await axiosInstance.get<CustomNavigationResponse>(
      "/public/navigation"
    );

    if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
      const transformedData = transformNavigationData(response.data.data);
      

      return {
        success: true,
        data: transformedData
      };
    } else {
      return {
        success: false,
        data: []
      };
    }
  } catch (error: any) {
    
    // Return empty structure to prevent crashes
    return {
      success: false,
      data: []
    };
  }
}; 