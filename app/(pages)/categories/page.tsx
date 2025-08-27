"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  getFeaturedCategories,
  FeaturedCategory,
  FeaturedSubCategory,
} from "../../lib/services/collectionService";

// Define type for API-based category groups
interface ApiCategoryGroup {
  id: string;
  title: string;
  description: string;
  image_url: string;
  categoryUrl: string;
  subcategories: {
    id: string;
    title: string;
    image_url: string;
    url: string;
  }[];
}

export default function CategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryGroups, setCategoryGroups] = useState<ApiCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  // Available currencies and flags
  const currencies = [
    {
      code: "INR",
      symbol: "₹",
      flag: "/images/common/flag-india.png",
      name: "India",
    },
    {
      code: "USD",
      symbol: "$",
      flag: "/images/common/flag-usa.png",
      name: "USA",
    },
    {
      code: "GBP",
      symbol: "£",
      flag: "/images/common/flag-uk.png",
      name: "UK",
    },
    {
      code: "EUR",
      symbol: "€",
      flag: "/images/common/flag-eu.png",
      name: "EU",
    },
  ];

  // Current currency and flag
  const currentCurrency = currencies[currencyIndex];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getFeaturedCategories(false);

        if (response && response.categories) {
          // Transform API data to component format
          const transformedData: ApiCategoryGroup[] = response.categories.map(
            (category: FeaturedCategory) => ({
              id: category.id,
              title: category.title,
              description: category.description,
              image_url: category.image_url || "/images/common/product.png",
              // Categories should go to SubcategoryContent.tsx via /category/.../all route
              categoryUrl: `/category/${category.title
                .toLowerCase()
                .replace(/\s+/g, "-")}/all?id=${
                category.id
              }&subcategory=${encodeURIComponent(category.title)}&type=category`,
              subcategories: category.subCategories.map(
                (subCategory: FeaturedSubCategory) => ({
                  id: subCategory.id,
                  title: subCategory.title,
                  image_url:
                    subCategory.image_url || "/images/common/product.png",
                  // Subcategories under regular categories - using proper routing structure
                  url: (() => {
                    const url = `/category/${category.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}/${subCategory.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}?id=${
                      subCategory.id
                    }&subcategory=${encodeURIComponent(
                      subCategory.title
                    )}&type=sub-category&parentId=${category.id}`;
                    console.log(
                      "Categories page subcategory URL:",
                      url,
                      "for subcategory:",
                      subCategory
                    );
                    return url;
                  })(),
                })
              ),
            })
          );

          setCategoryGroups(transformedData);
        } else {
          // Fallback to static data if API fails
          setCategoryGroups(getFallbackData());
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        // Use fallback data on error
        setCategoryGroups(getFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fallback data in case API fails
  const getFallbackData = (): ApiCategoryGroup[] => {
    return [
      {
        id: "1",
        title: "Books",
        description: "Spiritual and educational books",
        image_url: "/images/common/product.png",
        categoryUrl: "/category/books?id=1&category=Books&type=category",
        subcategories: [
          {
            id: "1",
            title: "Vedas",
            image_url: "/images/common/product.png",
            url: "/category/books/vedas?id=1&subcategory=Vedas&type=sub-category&parentId=1",
          },
          {
            id: "2",
            title: "Puranas",
            image_url: "/images/common/product.png",
            url: "/category/books/puranas?id=2&subcategory=Puranas&type=sub-category&parentId=1",
          },
          {
            id: "3",
            title: "Spiritual Books",
            image_url: "/images/common/product.png",
            url: "/category/books/spiritual-books?id=3&subcategory=Spiritual%20Books&type=sub-category&parentId=1",
          },
          {
            id: "4",
            title: "Kid's Books",
            image_url: "/images/common/product.png",
            url: "/category/books/kids-books?id=4&subcategory=Kid's%20Books&type=sub-category&parentId=1",
          },
        ],
      },
      {
        id: "2",
        title: "Divinity",
        description: "Religious and spiritual items",
        image_url: "/images/common/product.png",
        categoryUrl: "/category/divinity?id=2&category=Divinity&type=category",
        subcategories: [
          {
            id: "5",
            title: "Worship Products",
            image_url: "/images/common/product.png",
            url: "/category/divinity/worship-products?id=5&subcategory=Worship%20Products&type=sub-category&parentId=2",
          },
          {
            id: "6",
            title: "Deity Hub",
            image_url: "/images/common/product.png",
            url: "/category/divinity/deity-hub?id=6&subcategory=Deity%20Hub&type=sub-category&parentId=2",
          },
          {
            id: "7",
            title: "Mala/Beads",
            image_url: "/images/common/product.png",
            url: "/category/divinity/mala-beads?id=7&subcategory=Mala%2FBeads&type=sub-category&parentId=2",
          },
          {
            id: "8",
            title: "Attar and Essential Oils",
            image_url: "/images/common/product.png",
            url: "/category/divinity/attar-and-essential-oils?id=8&subcategory=Attar%20and%20Essential%20Oils&type=sub-category&parentId=2",
          },
        ],
      },
      {
        id: "3",
        title: "Health & Beauty",
        description: "Ayurvedic and beauty products",
        image_url: "/images/common/product.png",
        categoryUrl:
          "/category/health-beauty?id=3&category=Health%20%26%20Beauty&type=category",
        subcategories: [
          {
            id: "9",
            title: "The Ayurveda",
            image_url: "/images/common/product.png",
            url: "/category/health-beauty/the-ayurveda?id=9&subcategory=The%20Ayurveda&type=sub-category&parentId=3",
          },
          {
            id: "10",
            title: "Pure Herbs",
            image_url: "/images/common/product.png",
            url: "/category/health-beauty/pure-herbs?id=10&subcategory=Pure%20Herbs&type=sub-category&parentId=3",
          },
          {
            id: "11",
            title: "Facial Care",
            image_url: "/images/common/product.png",
            url: "/category/health-beauty/facial-care?id=11&subcategory=Facial%20Care&type=sub-category&parentId=3",
          },
          {
            id: "12",
            title: "Body Care",
            image_url: "/images/common/product.png",
            url: "/category/health-beauty/body-care?id=12&subcategory=Body%20Care&type=sub-category&parentId=3",
          },
        ],
      },
      {
        id: "4",
        title: "Flavor of India",
        description: "Indian spices and food items",
        image_url: "/images/common/product.png",
        categoryUrl:
          "/category/flavor-of-india?id=4&category=Flavor%20of%20India&type=category",
        subcategories: [
          {
            id: "13",
            title: "Spices & Masalas",
            image_url: "/images/common/product.png",
            url: "/category/flavor-of-india/spices-masalas?id=13&subcategory=Spices%20%26%20Masalas&type=sub-category&parentId=4",
          },
          {
            id: "14",
            title: "Snacks and Candies",
            image_url: "/images/common/product.png",
            url: "/category/flavor-of-india/snacks-and-candies?id=14&subcategory=Snacks%20and%20Candies&type=sub-category&parentId=4",
          },
          {
            id: "15",
            title: "Chutney and Pickles",
            image_url: "/images/common/product.png",
            url: "/category/flavor-of-india/chutney-and-pickles?id=15&subcategory=Chutney%20and%20Pickles&type=sub-category&parentId=4",
          },
          {
            id: "16",
            title: "Tea & Coffee",
            image_url: "/images/common/product.png",
            url: "/category/flavor-of-india/tea-coffee?id=16&subcategory=Tea%20%26%20Coffee&type=sub-category&parentId=4",
          },
        ],
      },
    ];
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Category Section Component
  const CategorySection = ({ category }: { category: ApiCategoryGroup }) => (
    <div className="mb-4 bg-white p-4">
      {/* Category Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="title-2-semibold text-blue-00">{category.title}</h2>
        <Link
          href={category.categoryUrl}
          className="flex items-center caption-bold text-blue-00 hover:underline bg-blue-110 rounded-lg px-2 py-1 whitespace-nowrap"
        >
          View Products
        </Link>
      </div>

      {/* Subcategory Grid */}
      <div className="grid grid-cols-2 gap-3">
        {category.subcategories.slice(0, 6).map((subcategory) => (
          <Link
            key={subcategory.id}
            href={subcategory.url}
            className="flex flex-col items-center"
          >
            <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-100">
              <Image
                src={subcategory.image_url}
                alt={subcategory.title}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-1 text-xs text-center text-gray-700 truncate w-full">
              {subcategory.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-blue-70 min-h-screen pb-16 fixed inset-0 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center flex-col gap-4 md:hidden p-4 bg-white rounded-b-2xl mb-4">
          <div className="flex items-center justify-between w-full">
            <button
              className="flex items-center justify-center"
              onClick={() => router.back()}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <Link href="/" className="flex items-center justify-center">
              <Image
                src="/images/common/logo.png"
                alt="Totally Indian"
                width={120}
                height={40}
                className="object-contain h-9 translate-x-[5px]"
              />
            </Link>

            <div className="flex items-center justify-end">
              <button className="bg-gray-50 rounded-full py-1.5 px-1.5 flex items-center">
                <Image
                  src={currentCurrency.flag}
                  alt={`${currentCurrency.name} Flag`}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                />
              </button>
            </div>
          </div>

          <div className="md:hidden w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(
                    `/search?q=${encodeURIComponent(searchQuery.trim())}`
                  );
                }
              }}
            >
              <div className="border-2 border-blue-00 rounded-[10px] overflow-hidden">
                <div className="flex h-10 bg-white">
                  <div className="flex-1 flex items-center px-3">
                    <Image
                      src="/images/header/search-dark.png"
                      alt="Search"
                      width={16}
                      height={16}
                      className="object-contain mr-2"
                    />
                    <input
                      type="text"
                      placeholder="Search for any product..."
                      className="w-full h-full body-medium focus:outline-none text-black bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-00"></div>
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-70 min-h-screen pb-16 fixed inset-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center flex-col gap-4 md:hidden p-4 bg-white rounded-b-2xl mb-4">
        <div className="flex items-center justify-between w-full">
          {/* Mobile menu button */}
          <button
            className="flex items-center justify-center"
            onClick={() => router.back()}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {/* Logo centered on mobile */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/images/common/logo.png"
              alt="Totally Indian"
              width={120}
              height={40}
              className="object-contain h-9 translate-x-[5px]"
            />
          </Link>

          {/* Currency and flag on right */}
          <div
            className="flex items-center justify-end relative"
            ref={currencyDropdownRef}
          >
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="bg-gray-50 rounded-full py-1.5 px-1.5 flex items-center"
            >
              <Image
                src={currentCurrency.flag}
                alt={`${currentCurrency.name} Flag`}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-md py-2 z-50 min-w-[150px]">
                {currencies.map((currency, index) => (
                  <button
                    key={currency.code}
                    onClick={() => {
                      setCurrencyIndex(index);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 hover:bg-gray-50 text-left ${
                      currencyIndex === index ? "bg-blue-50" : ""
                    }`}
                  >
                    <Image
                      src={currency.flag}
                      alt={`${currency.name} Flag`}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-full object-cover mr-2"
                    />
                    <span className="text-xs font-medium">
                      {currency.code} {currency.symbol}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {currency.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Search Bar */}
        <div className="md:hidden w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(
                  `/search?q=${encodeURIComponent(searchQuery.trim())}`
                );
              }
            }}
          >
            <div className="border-2 border-blue-00 rounded-[10px] overflow-hidden">
              <div className="flex h-10 bg-white">
                <div className="flex-1 flex items-center px-3">
                  <Image
                    src="/images/header/search-dark.png"
                    alt="Search"
                    width={16}
                    height={16}
                    className="object-contain mr-2"
                  />
                  <input
                    type="text"
                    placeholder="Search for any product..."
                    className="w-full h-full body-medium focus:outline-none text-black bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Category Sections */}
      <div className="mt-1">
        {categoryGroups.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}

        {/* Error state */}
        {error && (
          <div className="text-center py-4 mx-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-red-500 text-sm">
                {error}. Showing default categories.
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && categoryGroups.length === 0 && !error && (
          <div className="text-center py-8 mx-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <p className="text-gray-500 text-lg">No categories available</p>
              <p className="text-gray-400 text-sm mt-2">
                Please check back later
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
