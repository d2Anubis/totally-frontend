import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope, faMapMarkerAlt, faClock, faWhatsapp } from "@fortawesome/free-solid-svg-icons";

const ContactUsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Contact Us
        </h1>

        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Get in Touch
            </h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              We're here to help! Whether you have questions about our products, 
              need assistance with your order, or want to learn more about our services, 
              our team is ready to assist you.
            </p>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faPhone} className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Phone</h3>
                  <p className="text-gray-700 mb-2">+91 6262462162</p>
                  <p className="text-sm text-gray-600">Available during business hours</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faWhatsapp} className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">WhatsApp</h3>
                  <a 
                    href="https://wa.me/916262462162?text=Hi,%20I%20need%20help%20with%20my%20order"
                    className="text-green-600 hover:text-green-700 underline mb-2 block"
                  >
                    +91 6262462162
                  </a>
                  <p className="text-sm text-gray-600">Quick support and instant responses</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faEnvelope} className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Email</h3>
                  <a 
                    href="mailto:contact@totallyindian.com"
                    className="text-purple-600 hover:text-purple-700 underline mb-2 block"
                  >
                    contact@totallyindian.com
                  </a>
                  <p className="text-sm text-gray-600">General inquiries and support</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Address</h3>
                  <p className="text-gray-700 mb-2">
                    TezTrade Exports Private Limited<br />
                    Mumbai, India
                  </p>
                  <p className="text-sm text-gray-600">Our headquarters location</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faClock} className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Business Hours</h3>
                  <div className="text-gray-700 space-y-1">
                    <p>Monday to Friday: 10:00 a.m. to 7:00 p.m. IST</p>
                    <p>Saturday: 10:00 a.m. to 3:00 p.m. IST</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            
          </div>


        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                How long does shipping take?
              </h3>
              <p className="text-gray-700">
                Shipping times vary by location. Domestic orders typically arrive within 
                3-7 business days, while international orders may take 7-14 business days.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                What is your return policy?
              </h3>
              <p className="text-gray-700">
                We offer a 30-day return policy for most items. Please contact us 
                before returning any products to ensure a smooth process.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Do you ship internationally?
              </h3>
              <p className="text-gray-700">
                Yes! We ship to most countries worldwide. Shipping costs and delivery 
                times vary by destination.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                How can I track my order?
              </h3>
              <p className="text-gray-700">
                Once your order ships, you'll receive a tracking number via email. 
                You can also contact us for order status updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
