"use client";

import Link from "next/link";
import Image from "next/image";

const ExploreGrid = () => {
  // Hardcoded data with the exact categories specified
  const exploreData = [
    {
      id: "1",
      title: "Beauty & Personal Care",
      description: "Natural beauty and personal care products",
      image_url: "/images/start-exploring/Face Care.png",
      categories: [
        {
          id: "1",
          title: "Face Care",
          description: "Natural face care products",
          image_url: "/images/start-exploring/Face Care.png",
        },
        {
          id: "2",
          title: "Body Care",
          description: "Natural body care products",
          image_url: "/images/start-exploring/Body Care.png",
        },
        {
          id: "3",
          title: "Baby Care",
          description: "Natural baby care products",
          image_url: "/images/start-exploring/Baby Care.png",
        },
        {
          id: "4",
          title: "Hair Care",
          description: "Natural hair care products",
          image_url: "/images/start-exploring/Hair Care.png",
        },
      ],
    },
    {
      id: "2",
      title: "Health & Wellness",
      description: "Traditional health and wellness products",
      image_url: "/images/start-exploring/Ayurveda.png",
      categories: [
        {
          id: "5",
          title: "Ayurvedic",
          description: "Traditional Ayurvedic products",
          image_url: "/images/start-exploring/Ayurveda.png",
        },
        {
          id: "6",
          title: "Homeopathy",
          description: "Homeopathic remedies",
          image_url: "/images/start-exploring/Homeopathy.png",
        },
        {
          id: "7",
          title: "Unani",
          description: "Traditional Unani medicine",
          image_url: "/images/start-exploring/Unani.png",
        },
        {
          id: "8",
          title: "Pure Herbs",
          description: "Natural healing herbs",
          image_url: "/images/start-exploring/Pure Herbs.png",
        },
      ],
    },
    {
      id: "3",
      title: "Books",
      description: "Spiritual and educational books",
      image_url: "/images/start-exploring/Spiritual Book.png",
      categories: [
        {
          id: "9",
          title: "Spiritual Books",
          description: "Sacred texts and spiritual literature",
          image_url: "/images/start-exploring/Spiritual Book.png",
        },
        {
          id: "10",
          title: "Kids Books",
          description: "Educational books for children",
          image_url: "/images/start-exploring/Kids Book.png",
        },
        {
          id: "11",
          title: "Sanskrit Books",
          description: "Ancient Sanskrit texts",
          image_url: "/images/start-exploring/Sanskrit Book.png",
        },
        {
          id: "12",
          title: "Daily Path & Bajan",
          description: "Daily spiritual practices and hymns",
          image_url: "/images/start-exploring/Daily Path & Bhajan.png",
        },
      ],
    },
    {
      id: "4",
      title: "Flavours Of India",
      description: "Authentic Indian flavors and cuisine",
      image_url: "/images/start-exploring/Whole Spices.png",
      categories: [
        {
          id: "13",
          title: "Whole Spices",
          description: "Pure and authentic whole spices",
          image_url: "/images/start-exploring/Whole Spices.png",
        },
        {
          id: "14",
          title: "Masalas",
          description: "Traditional masala blends",
          image_url: "/images/start-exploring/Masala.png",
        },
        {
          id: "15",
          title: "Snacks & Sweets",
          description: "Authentic Indian snacks and sweets",
          image_url: "/images/start-exploring/Snacks & Sweets.png",
        },
        {
          id: "16",
          title: "Tea & Coffee",
          description: "Premium tea and coffee",
          image_url: "/images/start-exploring/Tea & Coffee.png",
        },
      ],
    },
    {
      id: "5",
      title: "Divinity",
      description: "Items for spiritual practice and worship",
      image_url: "/images/start-exploring/Divine Accessories.png",
      categories: [
        {
          id: "17",
          title: "Incense, Attar, Dhoop",
          description: "Sacred fragrances and oils",
          image_url: "/images/start-exploring/Incense, Attar, Dhoop & Much More.png",
        },
        {
          id: "18",
          title: "Divine Accessories",
          description: "Sacred spiritual accessories",
          image_url: "/images/start-exploring/Divine Accessories.png",
        },
        {
          id: "19",
          title: "Musical Instruments",
          description: "Traditional musical instruments",
          image_url: "/images/start-exploring/Musical Instruments.png",
        },
        {
          id: "20",
          title: "Deity Dress & Ornaments",
          description: "Beautiful deity attire and ornaments",
          image_url: "/images/start-exploring/Deity Dress & Ornaments.png",
        },
      ],
    },
    {
      id: "6",
      title: "Fashion",
      description: "Traditional and modern fashion",
      image_url: "/images/start-exploring/Women's.png",
      categories: [
        {
          id: "21",
          title: "Men",
          description: "Traditional and modern men's wear",
          image_url: "/images/start-exploring/Men's.png",
        },
        {
          id: "22",
          title: "Women",
          description: "Traditional and modern women's wear",
          image_url: "/images/start-exploring/Women's.png",
        },
        {
          id: "23",
          title: "Kids",
          description: "Traditional and modern kids wear",
          image_url: "/images/start-exploring/Kids.png",
        },
        {
          id: "24",
          title: "Jwellery",
          description: "Traditional Indian jewellery",
          image_url: "/images/start-exploring/Jewellery.png",
        },
      ],
    },
  ];

  // Helper function to generate URLs for super categories (should go to CategoryContent.tsx)
  const getSuperCategoryUrl = (superCategory: any): string => {
    const slug = superCategory.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    
    return `/super-category/${slug}?id=${superCategory.id}&category=${encodeURIComponent(
      superCategory.title
    )}`;
  };

  // Helper function to generate URLs for categories (should go to SubcategoryContent.tsx)
  const getCategoryUrl = (
    superCategory: any,
    category: { id: string; title: string }
  ): string => {
    const superCategorySlug = superCategory.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    
    const categorySlug = category.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    return `/category/${categorySlug}/all?id=${category.id}&subcategory=${encodeURIComponent(
      category.title
    )}&type=category`;
  };

  return (
    <div className="hidden md:block mb-8 bg-white rounded-2xl">
      {/* Top Section */}
      <div className="flex justify-center items-center mb-4 rounded-t-xl bg-blue-110 p-3 title-1">
        Your One-Stop Destination for Online Shopping from India
      </div>

      {/* Bottom Section */}
      <div className="rounded-b-xl bg-white p-4">
        <h2 className="heading-3-semibold mb-6">Start exploring</h2>

        {/* 2x3 Grid Layout: 2 rows with 3 super categories each */}
        <div className="grid grid-cols-3 gap-6">
          {exploreData.map((superCategory) => (
            <div key={superCategory.id} className="space-y-4">
              
              {/* Categories Grid - 2x2 layout */}
              <div className="grid grid-cols-2 gap-3 h-auto">
                {superCategory.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={getCategoryUrl(superCategory, category)}
                    className="flex flex-col items-center bg-blue-100 rounded-lg aspect-square overflow-hidden hover:bg-blue-200 transition-colors"
                  >
                    <div className="relative w-full overflow-hidden mb-2 h-full">
                      <Image
                        src={category.image_url}
                        alt={category.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <h4 className="body-medium text-black truncate w-full px-2 pb-3 text-center">
                      {category.title}
                    </h4>
                  </Link>
                ))}
              </div>

              {/* Super Category Header with Shop Now Button */}
              <div className="flex items-center justify-between">
                <h3 className="title-2-semibold">{superCategory.title}</h3>
                <Link
                  href={getSuperCategoryUrl(superCategory)}
                  className="body-large-semibold text-blue-00 flex items-center gap-1 hover:underline"
                >
                  Shop Now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreGrid;