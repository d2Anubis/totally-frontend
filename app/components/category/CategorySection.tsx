import Link from "next/link";
import Image from "next/image";
import { Category } from "@/app/data/categories";

interface CategorySectionProps {
  title: string;
  categories: Category[];
  defaultImage: string;
}

export default function CategorySection({
  title,
  categories,
  defaultImage,
}: CategorySectionProps) {
  return (
    <div className="mb-4 bg-white p-4">
      {/* Category Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="title-2-semibold text-blue-00">{title}</h2>
        <Link
          href={`/categories/${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="flex items-center caption-bold text-blue-00 hover:underline bg-blue-110 rounded-lg px-2 py-1 whitespace-nowrap"
        >
          View Products
        </Link>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-3">
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center"
          >
            <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-100">
              <Image
                src={category.imageUrl || defaultImage}
                alt={category.name}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-1 text-xs text-center text-gray-700 truncate w-full">
              {/* Show the subcategory name if available, or just the main category */}
              {category.name.includes(title)
                ? category.name.replace(title, "").trim() || category.name
                : category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
