import { Metadata } from "next";

// Define page metadata
export const metadata: Metadata = {
  title: "Page Title - Totally Indian",
  description: "Description for the page",
};

export default function PageTemplate() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="display-1 text-blue-00 mb-4">Page Template</h1>
        <p className="body mb-4">
          This is a template page. You can use this structure to create new
          pages.
        </p>
      </section>

      <section className="bg-white border-1 mb-8">
        <h2 className="title-2 mb-4">Section Title</h2>
        <p className="body">
          Replace this content with your page-specific content.
        </p>
      </section>
    </div>
  );
}
