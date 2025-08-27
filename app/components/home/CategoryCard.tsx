import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

const CategoryCard = ({
  category,
}: {
  category: {
    id: string;
    title: string;
    image_url: string;
    description: string;
    caption: string;
  };
}) => {
  // Create URL with super category name and id - redirecting to super category page
  const superCategoryUrl = `/super-category/${encodeURIComponent(
    category.title.toLowerCase().replace(/\s+/g, "-")
  )}?category=${encodeURIComponent(category.title)}&id=${category.id}`;

  // Truncate title if longer than 15 characters
  const truncatedTitle =
    category.title.length > 18
      ? category.title.substring(0, 15) + "..."
      : category.title;

  return (
    <div className="overflow-hidden h-full w-full">
      <Link href={superCategoryUrl} className="block overflow-hidden rounded-lg">
        <div className="relative w-full aspect-square rounded-lg bg-blue-100">
          <Image
            src={category.image_url}
            alt={category.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105 delay-75 rounded-lg overflow-hidden"
          />
        </div>
      </Link>
      <div className="mt-2 flex justify-center md:justify-between items-center">
        <Link href={superCategoryUrl} className="block">
          <h3
            className="md:title-2-semibold text-black md:mr-2 caption-semibold"
            title={category.title}
          >
            {truncatedTitle}
          </h3>
        </Link>
        <div className="hidden md:block">
          <Link
            href={superCategoryUrl}
            className="body-semibold text-blue-00 flex items-center gap-1 hover:underline whitespace-nowrap"
          >
            <span>Shop Now</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              height={12}
              className="text-xs"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
