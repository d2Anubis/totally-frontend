"use client";

interface ProductDetailsProps {
  description: string;
  ingredients: string[];
  benefits: string[];
  directions: string;
}

const ProductDetails = ({
  description,
}: ProductDetailsProps) => {
  return (
    <div className="mt-8">
      <h2 className="title-2 mb-3 text-blue-00">Product Details</h2>

      {/* Description */}
      <div className="mb-3">
        {/* <h3 className="title-2 text-blue-00 mb-1">Vedistry Gokshur+ Tablet</h3> */}
        <p
          className="small-medium text-gray-90"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
