import React from "react";
import Image from "next/image";

const AboutUsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          About Totally Indian
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Totally Indian, we are passionate about bringing authentic Indian products 
              to customers worldwide. Our mission is to bridge the gap between traditional 
              Indian craftsmanship and modern global consumers, ensuring that the rich 
              heritage of India reaches every corner of the world.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We believe in supporting local artisans, preserving traditional techniques, 
              and promoting sustainable practices while delivering exceptional quality 
              products that celebrate the diversity and beauty of Indian culture.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-blue-800">
                  Authentic Products
                </h3>
                <p className="text-gray-700">
                  From traditional spices and herbs to handcrafted jewelry and textiles, 
                  we curate only the most authentic Indian products.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-green-800">
                  Global Shipping
                </h3>
                <p className="text-gray-700">
                  We deliver to customers worldwide with reliable shipping partners 
                  and secure packaging to ensure your products arrive safely.
                </p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-yellow-800">
                  Quality Assurance
                </h3>
                <p className="text-gray-700">
                  Every product undergoes rigorous quality checks to meet our high 
                  standards before reaching your doorstep.
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-purple-800">
                  Customer Support
                </h3>
                <p className="text-gray-700">
                  Our dedicated support team is here to help you with any questions 
                  or concerns, available via WhatsApp and email.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Our Story
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded with a vision to make authentic Indian products accessible globally, 
              Totally Indian started as a small initiative to support local artisans and 
              traditional craftsmen. Over time, we have grown into a trusted platform 
              that connects customers worldwide with the finest Indian products.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our journey is driven by the belief that every product tells a story - 
              of tradition, craftsmanship, and cultural heritage. We are committed to 
              preserving these stories while making them accessible to a global audience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Our Values
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span><strong>Authenticity:</strong> We ensure every product is genuine and true to its origin.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span><strong>Quality:</strong> We maintain the highest standards in product selection and packaging.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span><strong>Transparency:</strong> We believe in honest communication and fair pricing.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span><strong>Sustainability:</strong> We support eco-friendly practices and sustainable sourcing.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span><strong>Community:</strong> We support local artisans and contribute to their livelihoods.</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Contact Information
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Get in Touch</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> contact@totallyindian.com</p>
                    <p><strong>Phone:</strong> +91 6262462162</p>
                    <p><strong>WhatsApp:</strong> <a href="https://wa.me/916262462162" className="text-blue-600 hover:underline">+91 6262462162</a></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Business Hours</h3>
                  <div className="space-y-1 text-gray-700">
                    <p>Monday to Friday: 10:00 a.m. to 7:00 p.m. IST</p>
                    <p>Saturday: 10:00 a.m. to 3:00 p.m. IST</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Join Our Journey
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We invite you to explore our collection and become part of our community 
              that celebrates the beauty and richness of Indian culture. Together, 
              let's keep traditions alive while embracing the future.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="https://wa.me/916262462162?text=Hi,%20I%20would%20like%20to%20know%20more%20about%20Totally%20Indian"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Chat with Us
              </a>
              <a 
                href="mailto:contact@totallyindian.com"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Email Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
