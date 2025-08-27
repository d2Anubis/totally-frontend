"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import navigationData from "../../data/navigation.json";
import { newsletterService } from "../../lib/services/subscribeService";

// Define types for the navigation structure
type NavigationItem = {
  title: string;
  url: string;
  icon?: string;
};

const Footer = () => {
  const { footer, header } = navigationData;
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle newsletter form submission
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubmitting(true);

    try {
      // Use the newsletter service to subscribe
      const success = await newsletterService.subscribeWithFeedback(
        email,
        "footer"
      );

      if (success) {
        // Clear the email field on successful subscription
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-blue-90 mt-4">
      {/* Newsletter Subscription */}
      <div className="bg-blue-80 py-8 rounded-2xl">
        <div className="px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src={footer.newsletter.icon}
                alt={footer.newsletter.title}
                width={20}
                height={20}
                className="object-contain h-12 w-auto"
              />

              <div>
                <h3 className="heading-2 text-black">
                  {footer.newsletter.title}
                </h3>
                <p className="title-1-medium text-black">
                  {footer.newsletter.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col w-[500px]">
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex w-full p-1 bg-white rounded-lg"
              >
                <input
                  type="email"
                  placeholder={footer.newsletter.inputPlaceholder}
                  className="flex-grow py-2 px-4 small-medium focus:outline-none w-40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-00 text-white py-0 px-3 rounded-md button"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : footer.newsletter.buttonText}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer with Navigation */}
      <div className="py-10 flex gap-1 w-full">
        <div className="left border border-gray-40 rounded-md p-4 flex flex-col items-center text-center w-[300px]">
          <Image
            src={footer.qrCode.imageUrl}
            alt={footer.qrCode.alt}
            width={140}
            height={140}
            className="object-contain mb-4"
          />
          <p className="small-medium text-gray-10 mb-4">
            Lorem ipsum is simply dummy text of the printing and typesetting
            industry, duis aute irure dolor in reprehenderit.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center text-white title-4-bold py-1 px-4 rounded-full bg-highlight transition-colors"
          >
            <i className={`fas ${footer.followButton.icon} mr-2`}></i>
            {footer.followButton.text}
          </Link>
        </div>
        <div className="right flex flex-col gap-1 w-full">
          <div className="top">
            <div className="container flex justify-between mx-auto px-4">
              <div className="flex justify-between gap-10 w-full">
                {/* QR Code Section */}

                {/* Quick Links */}
                <div>
                  <h4 className="heading-3 mb-4">Quick Links</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/search"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Search
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about-us"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact-us"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/track-order"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Track Order
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/sitemap"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Sitemap
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Shop */}
                <div>
                  <h4 className="heading-3 mb-4">Shop</h4>
                  <ul className="space-y-2">
                    {header.mainNavigation.map((item: NavigationItem) => (
                      <li key={item.title}>
                        <Link
                          href={item.url}
                          className="body-large-medium text-gray-10 hover:text-blue-00"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Policy Links */}
                <div>
                  <h4 className="heading-3 mb-4">Policy Links</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/terms-of-service"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/return-policy"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Return Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shipping-policy"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Shipping Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/shipping-rates"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Shipping Rates
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/search"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Search
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h4 className="heading-3 mb-4">Support</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/help-center"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="https://wa.me/916262462162?text=Namaste"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Contact: +91 6262462162
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="mailto:contact@totallyindian.com"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Email: contact@totallyindian.com
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/do-not-sell"
                        className="body-large-medium text-gray-10 hover:text-blue-00"
                      >
                        Do Not Sell My Personal Information
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="bottom px-4">
            <div className="flex justify-between items-end">
              <div className="left">
                {/* all the payment methods */}
                <div className="flex gap-2">
                  {footer.paymentMethods.map((method) => (
                    <Image
                      key={method.imageUrl}
                      src={method.imageUrl}
                      alt={method.alt}
                      width={method.width}
                      height={method.height}
                      className="object-contain h-6 w-auto"
                    />
                  ))}
                </div>
              </div>
              <div className="right flex gap-5 justify-end items-end">
                {/* social media icons */}
                <div className="flex gap-2">
                  {footer.socialMedia.map((social) => (
                    <Link
                      key={social.url}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-blue-00 bg-white h-10 w-10 flex items-center justify-center rounded-xl"
                    >
                      <i className={`fab ${social.icon}`}></i>
                    </Link>
                  ))}
                </div>

                {/* copyright */}
                <div className="copyright">
                  <p className="body-large-medium text-gray-10">
                    &copy; {new Date().getFullYear()} Totally Indian. All rights
                    reserved.
                  </p>
                  {/* button */}
                  <Link
                    href={footer.accessibility.url}
                    className="bg-blue-00 text-white px-3 rounded-lg title-4-bold flex gap-2 py-2 justify-center items-center mt-3"
                  >
                    <Image
                      src={footer.accessibility.icon}
                      alt={footer.accessibility.text}
                      width={20}
                      height={20}
                      className="object-contain h-5 w-auto"
                    />
                    For the visually impaired
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* seo content */}
      <div className="px-6 py-6 bg-white rounded-xl">
        <h2 className="body-medium mb-2">Namaste!</h2>
        <p className="body-medium mb-6">
          Welcome to TotallyIndian.com, your go-to destination for online
          shopping from India. Discover a thoughtfully curated collection of
          authentic Indian products online, featuring the best of India&apos;s
          traditions, craftsmanship, and flavors. As a leading online shopping
          site in India, we make it simple to buy stuff from India online and
          ship it globally through our international online shopping store.
          Whether you&apos;re searching for Ayurvedic remedies, artistic
          treasures, or gourmet delights, TotallyIndian.com is the ultimate
          platform for international shopping of premium and luxury products.
          Experience the richness of Indian culture with seamless worldwide
          shipping today!
        </p>

        <div className="mb-2">
          <h2 className="title-2-semibold mb-2">Health & Wellness</h2>
          <div className="">
            <Link
              href="/category/the-ayurveda"
              className="body-large-semibold text-blue-120 underline"
            >
              The Ayurveda
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Learn how Ayurveda integrates traditional knowledge with modern
              medical needs. Discover Ayurvedic supplements such as ashwagandha
              capsules, tulsi drops as well as herbal teas and essential oils.
              These traditional remedies encourage strength, immunity, and a
              healthy, balanced way of life. Ayurveda, with its wellness-focused
              products, remains the distinguishing feature of Indian health
              practices.
            </p>
            <Link
              href="/category/essentials-in-healthcare"
              className="body-large-semibold text-blue-120 underline"
            >
              Essentials in Healthcare
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Use our collection of healthcare basics to improve your overall
              well-being. From Triphala powder and Shatavari tonics to Giloy
              tablets, this dependable products aid digestion, boost immunity,
              and promote overall health. The best of Indian wellness solutions
              are reflected in these meticulously crafted essentials, which
              guarantee that you feel great every day.
            </p>

            <Link
              href="/category/pure-herbs"
              className="body-large-semibold text-blue-120 underline"
            >
              Pure Herbs
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Pure Indian herbs such as Neem, Amla, and Tulsi can help you get
              closer to nature&apos;s goodness. Explore products with natural
              healing properties, such as Organic India Tulsi Tea and Kapiva
              Amla Juice. These herbal remedies are ideal for those looking for
              holistic health solutions sourced from India.
            </p>
          </div>
        </div>

        <div className="mb-2">
          <h2 className="title-2-semibold mb-2">Beauty & Personal Care</h2>
          <div className="">
            <Link
              href="/category/facial-care"
              className="body-large-semibold text-blue-120 underline"
            >
              Facial Care
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Get a healthy glow with herbal face care products like Kumkumadi
              Oil, Biotique Face Wash, and Lotus Herbals Masks. These natural
              formulations are intended to cleanse, nourish, and restore your
              skin while imparting the gentle touch of traditional Indian beauty
              secrets.
            </p>

            <Link
              href="/category/body-care"
              className="body-large-semibold text-blue-120 underline"
            >
              Body Care
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Pamper your skin with natural body care products such as Khadi
              Soaps, Mysore Sandalwood Oil, and Forest Essentials Body Cream.
              These products are made with botanical ingredients that deeply
              nourish your skin, leaving it soft, supple, and refreshed.
            </p>

            <Link
              href="/category/baby-care"
              className="body-large-semibold text-blue-120 underline"
            >
              Baby Care
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Give your baby the best by using natural baby care products such
              as Mamaearth Baby Lotion, Himalaya Baby Powder, and Johnson&apos;s
              Baby Shampoo. These products are specifically designed for
              delicate skin and provide safe, gentle, and effective care for
              your baby.
            </p>
          </div>
        </div>

        <div className="mb-2">
          <h2 className="title-2-semibold mb-2">Books</h2>
          <div>
            <Link
              href="/category/vedas"
              className="body-large-semibold text-blue-120 underline"
            >
              Vedas
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Discover the in-depth wisdom of the Vedas, ancient Indian texts
              that explore spirituality, philosophy, and cultural traditions.
              These books, whether about the Rig Veda or the Yajur Veda, are
              ideal for anyone looking to gain a better understanding of
              India&apos;s spiritual heritage.
            </p>

            <Link
              href="/category/puranas"
              className="body-large-semibold text-blue-120 underline"
            >
              Puranas
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Explore the mythical world of the Puranas, including the Shiv
              Puran and Vishnu Puran. These attractive texts tell interesting
              tales about deities, cosmic battles, and life lessons, making them
              must-reads for anyone interested in Indian mythology.
            </p>

            <Link
              href="/category/srimad-bhagavatam"
              className="body-large-semibold text-blue-120 underline"
            >
              Srimad-Bhagavatam
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Find yourself in the sacred words of the Shrimad Bhagavatam, a
              scripture that combines spirituality and mythology. It is a
              treasure trove of wisdom, devotion, and philosophical insights for
              readers looking to connect with India&apos;s spiritual roots.
            </p>
          </div>
        </div>

        <div className="mb-2">
          <h2 className="title-2-semibold mb-2">Divinity</h2>
          <div>
            <Link
              href="/category/worship-products"
              className="body-large-semibold text-blue-120 underline"
            >
              Worship Products
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Develop your spiritual practices with Indian worship tools such as
              brass lamps, incense sticks, and copper kalash. These items are
              designed to improve your rituals and create a peaceful, godlike
              environment in your home.
            </p>

            <Link
              href="/category/attar-and-essential-oils"
              className="body-large-semibold text-blue-120 underline"
            >
              Attar and Essential Oils
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Indian attars like Ruh Khus, as well as essential oils like
              Jasmine and Sandalwood Oil, promote relaxation and peace. These
              natural treasures are ideal for meditation, prayer, or just
              refreshing your home.
            </p>

            <Link
              href="/category/deity-hub"
              className="body-large-semibold text-blue-120 underline"
            >
              Deity Hub
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Bring home beautifully crafted lord idols such as Ganesha,
              Lakshmi, and Saraswati statues, which will add devotion and
              prestige to your space. These artistic creations are perfect for
              personal memorials or gifts.
            </p>

            <Link
              href="/category/mala-beads"
              className="body-large-semibold text-blue-120 underline"
            >
              Mala/Beads
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Spiritual beads such as gemstone necklaces, Tulsi beads, and
              Rudraksha malas can improve your meditation. These holy objects
              are ideal for attaining peace and mindfulness.
            </p>
          </div>
        </div>

        <div className="mb-2">
          <h2 className="title-2-semibold mb-2">Flavor of India</h2>
          <div>
            <Link
              href="/category/spices-masalas"
              className="body-large-semibold text-blue-120 underline"
            >
              Spices & Masalas
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Use Indian spices like MDH Garam Masala, Catch Turmeric, and
              Everest Masalas to enhance your cooking. These ingredients are a
              must-have for any kitchen because they give every dish a genuine
              flavor and aroma.
            </p>

            <Link
              href="/category/snacks-and-candies"
              className="body-large-semibold text-blue-120 underline"
            >
              Snacks and Candies
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Indian sweets and snacks like Soan Papdi, Kaju Katli, and
              Haldiram&apos;s Bhujia will satisfy your cravings. A taste of
              India&apos;s cuisine heritage can be had with these delectable
              treats.
            </p>

            <Link
              href="/category/chutney-and-pickles"
              className="body-large-semibold text-blue-120 underline"
            >
              Chutney and Pickles
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Indian pickles like Mother&apos;s Mango Pickle and Tamarind
              Chutney can give your food an explosion of flavor. The essence of
              India is brought to your dining table by these fresh flavors.
            </p>
          </div>
        </div>

        <div className="mb-2">
          <h2 className="title-2-semibold mb-2">Art & Crafts</h2>
          <div>
            <Link
              href="/category/interior-design"
              className="body-large-semibold text-blue-120 underline"
            >
              Interior Design
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Add some Indian flair to your house with brass decorations, wooden
              carvings, and Madhubani paintings. These pieces improve any area
              and are indicative of India&apos;s artistic traditions.
            </p>

            <Link
              href="/category/jewelry"
              className="body-large-semibold text-blue-120 underline"
            >
              Jewelry
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Buy beautiful Indian jewelry, such as temple earrings, Meenakari
              bangles, and Kundan necklaces. These delicately crafted designs
              highlight the depth of Indian quality.
            </p>

            <Link
              href="/category/textiles-and-handlooms"
              className="small-semibold text-blue-120 underline"
            >
              Textiles and Handlooms
            </Link>
            <p className="mb-3 mt-2 body-medium">
              Embrace luxury by dressing in handloom fabrics such as cotton
              dupattas, Pashmina shawls, and Banarasi sarees. These items are
              evidence of India&apos;s talented craftspeople and rich textile
              legacy.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="title-2-semibold mb-2">Global Availability</h2>
          <p className="mb-3 mt-2 body-medium">
            Our goal at TotallyIndian.com is to make online shopping from India
            easy and accessible for customers worldwide. We offer a wide variety
            of genuine Indian goods, including Ayurvedic products, spices,
            cosmetics, handcrafted crafts, and spiritual items. Whether
            you&apos;re in the USA, UK, Canada, Australia, Germany, France, New
            Zealand, Singapore, or any other nation, our platform ensures you
            can conveniently shop for your favorite Indian products online. From
            organic Ayurvedic oils to Pashmina shawls, we make it simple to
            experience the richness of India&apos;s heritage and have it
            delivered to your door.
          </p>

          <p className="mt-2 body-medium">
            By providing easy access to India&apos;s rich cultural legacy, we
            help close the gap between the country and the rest of the world.
            Enjoy premium goods that showcase Indian craftsmanship and
            traditions while having a seamless shopping experience. We deliver
            the best of India right to your door, whether you&apos;re searching
            for religious artifacts, ethnic clothing, or health supplements.
            Begin your shopping adventure with TotallyIndian.com right now and
            explore the exciting world of Indian products, which are accurately
            and securely delivered all over the world.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
