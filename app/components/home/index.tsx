"use client";

import HeroSlider from "./HeroSlider";
import CategoryGrid from "./CategoryGrid";
import ExploreGrid from "./ExploreGrid";
import NewArrivalsSection from "./NewArrivalsSection";
import TrendingNowSection from "./TrendingNowSection";
import RecentlyViewedSection from "./RecentlyViewedSection";
import SaleSection from "./SaleSection";
import MegaSaleSection from "./MegaSaleSection";
import Testimonials from "./Testimonials";
import SaleBanner from "./SaleBanner";
import { useAuth } from "@/app/context/AuthContext";

const HomePage = () => {
  const { isLoggedIn } = useAuth();

  return (
    <main className="overflow-x-hidden">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Grid / Shop by Category Section*/}
      <CategoryGrid />

      {/* Sale Banner */}
      <SaleBanner />

      {/* Explore Grid - START EXPLORING SECTION */}
      <ExploreGrid />

      {/* New Arrivals */}
      <NewArrivalsSection />

      {/* Mega Sale Section */}
      <MegaSaleSection />

      {/* What's Trending Now */}
      <TrendingNowSection />

      {/* Sale Section */}
      <SaleSection />

      {/* Top Brands */}
      {/* <TopBrandsSection /> */}

      {/* Recently Viewed Products - Only show for logged in users */}
      {isLoggedIn && <RecentlyViewedSection />}

      {/* Testimonials */}
      <Testimonials />
    </main>
  );
};

export default HomePage;
