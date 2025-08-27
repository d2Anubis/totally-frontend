# Totally Indian - Buyer Frontend

This is the buyer frontend for the Totally Indian e-commerce platform.

## Project Structure

The project follows Next.js App Router structure:

```
/app
  /components         # Reusable components (Header, Footer, etc.)
  /data               # JSON data files
    navigation.json   # Header and footer navigation configuration
  /(pages)            # All pages grouped by type
    /page-template    # Generic page template
    /product          # Product detail pages
      /[id]           # Dynamic route for product details
    /category         # Category pages
      /[category]     # Dynamic route for category listings
  layout.tsx          # Root layout with Header and Footer
  page.tsx            # Homepage
  globals.css         # Global CSS including colors, typography, etc.
```

## Navigation Configuration

The application uses a central JSON file for navigation configuration:

- **File path**: `app/data/navigation.json`
- **Structure**:
  - `header`: Header component configuration
    - `logoUrl`: Site logo
    - `searchOptions`: Dropdown options for search
    - `userNavigation`: Login, cart, wishlist links
    - `mainNavigation`: Main category links
    - `rightNavigation`: About us, blog, contact
  - `footer`: Footer component configuration
    - `newsletter`: Email subscription section
    - `qrCode`: QR code image
    - `paymentMethods`: Payment options
    - `socialMedia`: Social media links
    - `accessibility`: Accessibility option

To update navigation items, edit the `navigation.json` file rather than modifying the components directly.

## Page Structure

When creating new pages, follow this structure:

1. **Create a directory for the page** under `app/(pages)/`

   - For static pages: `app/(pages)/about/`
   - For dynamic pages: `app/(pages)/products/[id]/`

2. **Create an index.tsx or page.tsx file** in the directory

   - Use `index.tsx` for non-dynamic pages
   - Use `page.tsx` for dynamic pages that use route parameters

3. **Define metadata** for SEO (title, description)

4. **Use existing components and styles** from `app/components` and `globals.css`

## Example: Creating a New Page

```tsx
// app/(pages)/new-page/index.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Page - Totally Indian",
  description: "Description for the new page",
};

export default function NewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="display-1 text-blue-00 mb-4">New Page</h1>
      <section className="bg-white border-1 mb-8">
        <h2 className="title-2 mb-4">Section Title</h2>
        <p className="body">Your content here</p>
      </section>
    </div>
  );
}
```

## Styling

The project uses:

- Tailwind CSS for layout and basic styling
- Custom CSS classes defined in `globals.css` for colors, typography, and components

### Available Color Classes

- Text colors: `text-blue-00`, `text-black`, `text-white`, etc.
- Background colors: `bg-blue-00`, `bg-white`, `bg-gray-50`, etc.

### Typography Classes

- `display-1`, `title-1-bold`, `body`, `small-semibold`, etc.

### Component Classes

- `border-1`, `border-2` for styled containers
- `main-container` for page containers

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
