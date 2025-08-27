export interface AdItem {
  id: string;
  imageUrl: string;
  alt: string;
  targetUrl: string;
}

export interface AdsConfig {
  categoryAds: {
    positions: number[]; // The positions/indices where ads should appear in the product grid
    items: AdItem[]; // The ad items to be displayed in a rotating manner
  };
}

// Sample ads configuration
export const adsConfig: AdsConfig = {
  categoryAds: {
    // After which products the ads should appear (0-indexed)
    // e.g. [3, 7, 11] means ads will appear after the 4th, 8th, and 12th products
    positions: [1, 3, 5, 7, 9, 11],

    // Ad items to be displayed in rotation at the specified positions
    items: [
      {
        id: "ad-1",
        imageUrl: "/images/common/new_arrival.png",
        alt: "Special Ayurvedic Products Sale",
        targetUrl: "/offers/ayurvedic-sale",
      },
      {
        id: "ad-2",
        imageUrl: "/images/common/new_arrival.png",
        alt: "New Collection Launch",
        targetUrl: "/new-arrivals",
      },
      {
        id: "ad-3",
        imageUrl: "/images/common/new_arrival.png",
        alt: "Festive Season Discounts",
        targetUrl: "/offers/festive-sale",
      },
    ],
  },
};

// Helper function to get ads for a specific category page
export const getCategoryAds = (): AdItem[] => {
  return adsConfig.categoryAds.items;
};

// Helper function to get ad positions in the product grid
export const getAdPositions = (): number[] => {
  return adsConfig.categoryAds.positions;
};
