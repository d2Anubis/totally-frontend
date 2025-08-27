export type Product = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  url: string;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  discount?: number;
  slug?: string;
};

export const popularProducts: Product[] = [
  {
    id: 1,
    name: "MDH Garam Masala - 100g",
    imageUrl: "https://picsum.photos/400/400?random=101",
    price: 3.99,
    originalPrice: 4.99,
    url: "/product/mdh-garam-masala",
    slug: "mdh-garam-masala",
    category: "Spices",
    discount: 20,
  },
  {
    id: 2,
    name: "Haldiram's Soan Papdi - 250g",
    imageUrl: "https://picsum.photos/400/400?random=102",
    price: 5.49,
    url: "/product/haldirams-soan-papdi",
    slug: "haldirams-soan-papdi",
    category: "Sweets",
    isBestseller: true,
  },
  {
    id: 3,
    name: "Tata Tea Premium - 500g",
    imageUrl: "https://picsum.photos/400/400?random=103",
    price: 6.99,
    originalPrice: 8.99,
    url: "/product/tata-tea-premium",
    slug: "tata-tea-premium",
    category: "Beverages",
    discount: 22,
  },
  {
    id: 4,
    name: "Amul Pure Ghee - 500ml",
    imageUrl: "https://picsum.photos/400/400?random=104",
    price: 10.99,
    url: "/product/amul-ghee",
    slug: "amul-ghee",
    category: "Dairy",
    isBestseller: true,
  },
  {
    id: 5,
    name: "MTR Rava Idli Mix - 500g",
    imageUrl: "https://picsum.photos/400/400?random=105",
    price: 4.99,
    url: "/product/mtr-rava-idli-mix",
    slug: "mtr-rava-idli-mix",
    category: "Ready-to-Cook",
    isNew: true,
  },
];

export const newArrivals: Product[] = [
  {
    id: 6,
    name: "Britannia Good Day Cookies - 200g",
    imageUrl: "https://picsum.photos/400/400?random=106",
    price: 2.99,
    url: "/product/britannia-good-day",
    slug: "britannia-good-day",
    category: "Snacks",
    isNew: true,
  },
  {
    id: 7,
    name: "Everest Chicken Masala - 100g",
    imageUrl: "https://picsum.photos/400/400?random=107",
    price: 3.49,
    url: "/product/everest-chicken-masala",
    slug: "everest-chicken-masala",
    category: "Spices",
    isNew: true,
  },
  {
    id: 8,
    name: "Patanjali Honey - 500g",
    imageUrl: "https://picsum.photos/400/400?random=108",
    price: 7.99,
    originalPrice: 9.99,
    url: "/product/patanjali-honey",
    slug: "patanjali-honey",
    category: "Health Foods",
    isNew: true,
    discount: 20,
  },
  {
    id: 9,
    name: "Lijjat Papad - 200g",
    imageUrl: "https://picsum.photos/400/400?random=109",
    price: 3.29,
    url: "/product/lijjat-papad",
    slug: "lijjat-papad",
    category: "Papad",
    isNew: true,
  },
  {
    id: 10,
    name: "Daawat Basmati Rice - 5kg",
    imageUrl: "https://picsum.photos/400/400?random=110",
    price: 19.99,
    url: "/product/daawat-basmati-rice",
    slug: "daawat-basmati-rice",
    category: "Rice & Grains",
    isNew: true,
  },
];

export const featuredPickles: Product[] = [
  {
    id: 11,
    name: "Mother's Recipe Mango Pickle - 400g",
    imageUrl: "https://picsum.photos/400/400?random=111",
    price: 5.99,
    url: "/product/mothers-mango-pickle",
    slug: "mothers-mango-pickle",
    category: "Pickles",
  },
  {
    id: 12,
    name: "Priya Lime Pickle - 300g",
    imageUrl: "https://picsum.photos/400/400?random=112",
    price: 4.99,
    originalPrice: 5.99,
    url: "/product/priya-lime-pickle",
    slug: "priya-lime-pickle",
    category: "Pickles",
    discount: 16,
  },
  {
    id: 13,
    name: "Bedekar Mixed Pickle - 400g",
    imageUrl: "https://picsum.photos/400/400?random=113",
    price: 5.49,
    url: "/product/bedekar-mixed-pickle",
    slug: "bedekar-mixed-pickle",
    category: "Pickles",
    isBestseller: true,
  },
  {
    id: 14,
    name: "Nilon's Ginger Garlic Paste - 200g",
    imageUrl: "https://picsum.photos/400/400?random=114",
    price: 2.99,
    url: "/product/nilons-ginger-garlic-paste",
    slug: "nilons-ginger-garlic-paste",
    category: "Cooking Pastes",
  },
  {
    id: 15,
    name: "Ruchi Mango Thokku - 300g",
    imageUrl: "https://picsum.photos/400/400?random=115",
    price: 4.79,
    url: "/product/ruchi-mango-thokku",
    slug: "ruchi-mango-thokku",
    category: "Pickles",
    isNew: true,
  },
];
