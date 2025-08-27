import React from "react";

const ShippingPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>
        <p className="mb-8">
          At TotallyIndian, we take pride in bringing India&apos;s finest
          treasures to your doorstep, no matter where in the world you are.
          Here&apos;s everything you need to know about how we ship:
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Where we ship</h2>
          <p className="mb-4">
            We proudly deliver to a wide range of countries including the USA,
            Canada, United Kingdom, European Union nations, Russia, Australia,
            and New Zealand.
          </p>
          <p className="mb-4">
            If your country isn&apos;t on the list yet, stay tuned, we&apos;re
            expanding fast!
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Delivery Partners</h2>
          <p className="mb-4">
            To ensure your order reaches you safely and swiftly, we&apos;ve
            partnered with some of the world&apos;s most reliable logistics
            providers like DHL Express, Aramex, ShipGlobal, USPS, UPS, Royal
            Mail, and FedEx.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Delivery Timelines</h2>
          <p className="mb-4">
            Your estimated delivery time will be visible during checkout,
            depending on your location and the shipping option you choose.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="mb-0">
              <strong>⚠️ Please Note:</strong> International orders may undergo
              customs inspections, which can cause unforeseen delays. Such
              delays are beyond our control and are not counted in the delivery
              estimate.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Shipping Fees & Extra Charges
          </h2>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Shipping charges are calculated dynamically at checkout based on
              your location and the weight of your order.
            </li>
            <li>
              In the case of restricted items like liquids, sprays, or Ayurvedic
              medicines, there may be an extra handling fee of ₹250 per kg. If
              applicable, we&apos;ll notify you after the order is placed.
            </li>
            <li>
              Addresses located in remote areas may attract an additional fee of
              ₹4,500, which we&apos;ll confirm via email post-order.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Order Processing Time</h2>
          <p className="mb-4">
            We usually pack and dispatch your order within 24 to 48 business
            hours. Once your order is on the move, you&apos;ll receive an email
            with tracking details so you can follow its journey in real time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tracking Your Order</h2>
          <p className="mb-4">
            As soon as your order is packed and handed over, we&apos;ll email
            you your tracking number (AWB) along with a link to track it in real
            time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Responsibility & Support
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">
              DHL, Aramex, FedEx, Air Cargo:
            </h3>
            <p className="mb-4">
              If your parcel is lost in transit, we&apos;re here to help. For
              delays or re-delivery coordination, kindly connect directly with
              the courier.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">
              IndiaPost & ShipGlobal:
            </h3>
            <p className="mb-4">
              Once dispatched, we do not hold responsibility for delays, customs
              issues, or lost shipments. Please contact the courier directly for
              assistance.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Customs Duties & Import Fees
          </h2>
          <p className="mb-4">
            Please note that any customs duties, import taxes, or additional
            fees imposed by your country are your responsibility. Every country
            has different rules and thresholds, you can check your
            country&apos;s threshold here.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Questions? We&apos;re Here!
          </h2>
          <p className="mb-4">
            Need help with your shipment or have a question? Just reach out via
            our Contact Page and our team will be happy to assist you.
          </p>

          <div className="mb-4">
            <p>
              <strong>Email:</strong> contact@totallyindian.com
            </p>
            <p>
              <strong>Phone:</strong> +91 6262462162
            </p>
          </div>

          <div className="mb-4">
            <p>
              <strong>Customer Service Hours:</strong>
            </p>
            <p>Monday to Saturday: 8:00 a.m. to 10:00 p.m. IST</p>
            <p>Sunday: 10:00 a.m. to 7:00 p.m. IST</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
