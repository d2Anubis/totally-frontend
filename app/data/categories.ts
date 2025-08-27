export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  banner?: string;
  subcategories?: Subcategory[];
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Health & Wellness",
    slug: "health-wellness",
    description:
      "Explore our range of health and wellness products for overall wellbeing.",
    imageUrl: "/images/categories/health-wellness.jpg",
    banner: "/images/banners/health-wellness-banner.jpg",
    subcategories: [
      {
        name: "Ayurveda",
        slug: "ayurveda",
        description: "Traditional Indian medicine and wellness products",
      },
      {
        name: "Health Supplements",
        slug: "health-supplements",
        description: "Vitamins, minerals and dietary supplements",
      },
      {
        name: "Personal Care",
        slug: "personal-care",
        description: "Products for personal hygiene and wellness",
      },
    ],
  },
  {
    id: 2,
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description:
      "Discover beauty and personal care products from India's finest brands.",
    imageUrl: "/images/categories/beauty-personal-care.jpg",
    banner: "/images/banners/beauty-personal-care-banner.jpg",
    subcategories: [
      {
        name: "Hair Care",
        slug: "hair-care",
        description: "Products for hair health and styling",
      },
      {
        name: "Skin Care",
        slug: "skin-care",
        description: "Products for skin health and beauty",
      },
      {
        name: "Makeup",
        slug: "makeup",
        description: "Cosmetics and beauty products",
      },
    ],
  },
  {
    id: 3,
    name: "Ayurveda",
    slug: "ayurveda",
    description: "Traditional Indian medicinal products based on Ayurveda",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 4,
    name: "Body Care",
    slug: "body-care",
    description: "Natural body care products for all skin types",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 5,
    name: "Men's Health Care",
    slug: "mens-health-care",
    description: "Health products specifically formulated for men",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 6,
    name: "Women's Health Care",
    slug: "womens-health-care",
    description: "Health products specifically formulated for women",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 7,
    name: "Homeopathy",
    slug: "homeopathy",
    description: "Homeopathic remedies and supplements",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 8,
    name: "Pain Relief",
    slug: "pain-relief",
    description: "Natural products for pain relief and management",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 9,
    name: "Spices",
    slug: "spices",
    description: "Authentic Indian spices and blends",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 10,
    name: "Sweets",
    slug: "sweets",
    description: "Traditional Indian sweets and desserts",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 11,
    name: "Beverages",
    slug: "beverages",
    description: "Indian teas, coffees, and other beverages",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 12,
    name: "Dairy",
    slug: "dairy",
    description: "Traditional dairy products from India",
    imageUrl: "/images/common/new_arrival.png",
  },
  {
    id: 13,
    name: "Ready-to-Cook",
    slug: "ready-to-cook",
    description: "Convenient ready-to-cook Indian meals and mixes",
    imageUrl: "/images/common/new_arrival.png",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getAllCategoryNames(): string[] {
  return categories.map((category) => category.name);
}

export function getAllCategorySlugs(): string[] {
  return categories.map((category) => category.slug);
}
