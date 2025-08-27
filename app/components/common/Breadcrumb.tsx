import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  url: string;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <div className="flex flex-wrap items-center text-gray-10 small-medium">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.url}-${index}`} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}

            {isLast ? (
              <span className="text-black">{item.label}</span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-blue-00 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
