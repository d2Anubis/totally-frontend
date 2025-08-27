import Link from "next/link";
import Image from "next/image";

export default function BrandNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-white rounded-xl">
      <div className="mb-8">
        <Image
          src="/images/common/brand-not-found.png"
          alt="Brand not found"
          width={250}
          height={250}
          className="mx-auto"
          priority
        />
      </div>

      <h1 className="display-2 text-blue-00 mb-4">Brand Not Found</h1>

      <p className="title-3-medium text-gray-10 mb-8 max-w-lg">
        We couldn&apos;t find the brand you&apos;re looking for. It may have
        been removed or the URL might be incorrect.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="bg-blue-00 text-white py-3 px-6 rounded-md small-semibold hover:bg-blue-10 transition-colors duration-300"
        >
          Back to Home
        </Link>

        <Link
          href="/brands"
          className="border border-blue-00 text-blue-00 py-3 px-6 rounded-md small-semibold hover:bg-blue-70 transition-colors duration-300"
        >
          Browse All Brands
        </Link>
      </div>

      <div className="mt-12 p-6 bg-blue-70 rounded-lg max-w-xl">
        <h2 className="title-3-semibold text-blue-00 mb-4">Popular Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["himalaya", "dabur", "patanjali", "organic-india"].map((slug) => (
            <Link
              key={slug}
              href={`/brand/${slug}`}
              className="flex flex-col items-center hover:text-blue-00 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-2 border border-blue-50">
                <Image
                  src={`/images/home/brands/brand_one.png`}
                  alt={slug}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="small-medium capitalize">
                {slug.replace("-", " ")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
