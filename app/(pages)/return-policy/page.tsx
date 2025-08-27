import React from "react";

const ReturnPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-6">
          Refunds, Returns & Cancellations Policy
        </h1>
        <p className="mb-8">
          We want you to feel confident shopping with TotallyIndian, and that
          includes knowing exactly how our refund, return, and cancellation
          process works. Please read the policy below carefully to understand
          your rights and responsibilities.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Change of Shipping Address
          </h2>
          <p className="mb-4">
            Placed an order and realized you need to update the delivery
            address? No worries, just contact us within 30 minutes of order
            confirmation. After this window, we won&apos;t be able to make
            changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Reporting Damaged or Defective Items
          </h2>
          <p className="mb-4">
            If your item arrives damaged or defective, please report it within
            12 hours of delivery.
          </p>
          <p className="mb-4">To help us assist you quickly, kindly share:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>A clear unboxing video showing the entire opening process</li>
            <li>Visible footage of the damage or defect</li>
          </ul>
          <p className="mb-4">
            This ensures fair and prompt resolution on our side.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Reporting Missing Items
          </h2>
          <p className="mb-4">
            If something&apos;s missing from your package, you must report it
            within 12 hours of receiving the order.
          </p>
          <p className="mb-4">
            A proper unboxing video is mandatory here too, capturing the moment
            the sealed parcel is opened and its contents are displayed. This
            helps us verify the claim and take swift action.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Returning Products (Non-Damaged)
          </h2>
          <p className="mb-4">
            Changed your mind or ordered the wrong item? We totally understand.
            You may raise a return request within 12 hours of receiving your
            parcel. Please note:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Returns will only be accepted after our team evaluates the
              request.
            </li>
            <li>
              Product must be unused, unopened, and in original packaging.
            </li>
            <li>
              Return approvals are at the discretion of our quality control
              team.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            No Returns on Food Items
          </h2>
          <p className="mb-4">
            Due to safety and hygiene standards, we do not accept returns on any
            food items. We strive to deliver the freshest, cleanest Indian foods
            and this policy helps maintain that promise.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Who Pays Return Shipping?
          </h2>
          <p className="mb-4">
            If your return is approved, you&apos;ll need to ship the product
            back to our warehouse in India.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              The return shipping cost including any import duties or taxes must
              be covered by you.
            </li>
            <li>
              We strongly recommend using a trusted courier service with a
              tracking ID to avoid any loss in transit.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Refunds & Processing Timelines
          </h2>
          <p className="mb-4">
            If your return or claim is approved, we&apos;ll process your refund
            to the original payment method. Refunds usually reflect in your
            account within 4 to 7 working days.
          </p>
          <p className="mb-4 font-semibold">
            Please note: A 5% deduction will apply to cover payment gateway and
            processing charges.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How to Raise a Claim?</h2>
          <p className="mb-4">
            To report a defect, missing item, or request a return, email us at
            contact@totallyindian.com with:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your order number</li>
            <li>Unboxing video (clearly showing the issue) & Photos</li>
            <li>A short description of the issue</li>
            <li>Your contact details</li>
          </ul>
          <p className="mb-4">
            Our team will review your request and respond with next steps as
            soon as possible.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Abuse of Return Policy
          </h2>
          <p className="mb-4">
            We trust our customers to use our policies fairly. However, if we
            detect misuse, such as repeated false claims or manipulation, we
            reserve the right to permanently block such buyers from using
            TotallyIndian services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our return and refund policy, please
            contact us:
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

export default ReturnPolicyPage;
