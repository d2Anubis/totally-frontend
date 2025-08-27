"use client";

interface Category {
  id: string;
  name: string;
  active: boolean;
}

interface BrandCategoryTabsProps {
  categories: Category[];
  onCategorySelect?: (categoryId: string) => void;
}

export default function BrandCategoryTabs({
  categories,
  onCategorySelect,
}: BrandCategoryTabsProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide space-x-4 mb-6 bg-white rounded-lg p-2">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`whitespace-nowrap px-4 py-2 rounded-md title-4-semibold ${
            category.active
              ? "text-blue-00 border-b-2 border-blue-00"
              : "text-gray-80"
          }`}
          onClick={() => onCategorySelect && onCategorySelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
