import axiosInstance from "../axiosConfig";

// TypeScript interfaces for Banner Management System
export interface BannerImage {
  mobile: string[];
  desktop: string[];
}

export interface Banner {
  id: string;
  title: string;
  type: "carousel" | "single";
  section_type: BannerSectionType;
  images: BannerImage;
  url?: string; // Add URL field for banner click redirect
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BannerSectionType =
  | "hero_carousel"
  | "sale_banner"
  | "mega_sales"
  | "deals_banner"
  | "banner_one"
  | "banner_two"
  | "banner_three"
  | "checkout_banner_one"
  | "checkout_banner_two"
  | "checkout_banner_three"
  | "checkout_banner_four";

export interface BannerResponse {
  success: boolean;
  data: {
    section: string;
    page: string;
    banners: Banner[];
    total: number;
  };
  message?: string;
}

export interface ConsolidatedBannerResponse {
  success: boolean;
  data: {
    page: string;
    banners: {
      [key: string]: Banner[];
    };
    sections: string[];
    totalSections: number;
  };
  message?: string;
}

export interface BannerCreateUpdateResponse {
  success: boolean;
  message: string;
  data: Banner;
}

export interface BannerError {
  success: false;
  message: string;
  errors?: Array<{
    filename: string;
    mimetype: string;
    message: string;
  }>;
}

// Banner section configurations
export const BANNER_SECTIONS = {
  home: [
    {
      key: "hero_carousel",
      name: "Hero Carousel",
      type: "carousel",
      maxImages: 8,
    },
    { key: "sale_banner", name: "Sale Banner", type: "single", maxImages: 1 },
    { key: "mega_sales", name: "Mega Sales", type: "single", maxImages: 1 },
    { key: "deals_banner", name: "Deals Banner", type: "single", maxImages: 1 },
  ],
  category: [
    { key: "banner_one", name: "Banner One", type: "single", maxImages: 1 },
    { key: "banner_two", name: "Banner Two", type: "single", maxImages: 1 },
    { key: "banner_three", name: "Banner Three", type: "single", maxImages: 1 },
  ],
  checkout: [
    {
      key: "checkout_banner_one",
      name: "Checkout Banner One",
      type: "single",
      maxImages: 1,
    },
    {
      key: "checkout_banner_two",
      name: "Checkout Banner Two",
      type: "single",
      maxImages: 1,
    },
    {
      key: "checkout_banner_three",
      name: "Checkout Banner Three",
      type: "single",
      maxImages: 1,
    },
    {
      key: "checkout_banner_four",
      name: "Checkout Banner Four",
      type: "single",
      maxImages: 1,
    },
  ],
} as const;

// User Banner Service (Read-only access)
export class UserBannerService {
  private baseUrl = "/user/banners";

  /**
   * Get hero carousel banners
   */
  async getHeroCarouselBanners(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/home/hero-carousel`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching hero carousel banners:", error);
      throw error;
    }
  }

  /**
   * Get sale banner
   */
  async getSaleBanner(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/home/sale-banner`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sale banner:", error);
      throw error;
    }
  }

  /**
   * Get mega sales banners
   */
  async getMegaSalesBanners(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/home/mega-sales`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching mega sales banners:", error);
      throw error;
    }
  }

  /**
   * Get deals banner
   */
  async getDealsBanner(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/home/deals-banner`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching deals banner:", error);
      throw error;
    }
  }

  /**
   * Get category banner one
   */
  async getCategoryBannerOne(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/category/banner-one`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category banner one:", error);
      throw error;
    }
  }

  /**
   * Get category banner two
   */
  async getCategoryBannerTwo(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/category/banner-two`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category banner two:", error);
      throw error;
    }
  }

  /**
   * Get category banner three
   */
  async getCategoryBannerThree(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/category/banner-three`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category banner three:", error);
      throw error;
    }
  }

  /**
   * Get checkout banner one
   */
  async getCheckoutBannerOne(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/checkout/banner-one`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching checkout banner one:", error);
      throw error;
    }
  }

  /**
   * Get checkout banner two
   */
  async getCheckoutBannerTwo(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/checkout/banner-two`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching checkout banner two:", error);
      throw error;
    }
  }

  /**
   * Get checkout banner three
   */
  async getCheckoutBannerThree(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/checkout/banner-three`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching checkout banner three:", error);
      throw error;
    }
  }

  /**
   * Get checkout banner four
   */
  async getCheckoutBannerFour(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/checkout/banner-four`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching checkout banner four:", error);
      throw error;
    }
  }

  /**
   * Get all home page banners in one API call (Recommended)
   */
  async getAllHomeBanners(): Promise<ConsolidatedBannerResponse> {
    try {
      const response = await axiosInstance.get<ConsolidatedBannerResponse>(
        `${this.baseUrl}/home`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all home banners:", error);
      throw error;
    }
  }

  /**
   * Get all category page banners in one API call (Recommended)
   */
  async getAllCategoryBanners(): Promise<ConsolidatedBannerResponse> {
    try {
      const response = await axiosInstance.get<ConsolidatedBannerResponse>(
        `${this.baseUrl}/category`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all category banners:", error);
      throw error;
    }
  }

  /**
   * Get all checkout page banners in one API call (Recommended)
   */
  async getAllCheckoutBanners(): Promise<ConsolidatedBannerResponse> {
    try {
      const response = await axiosInstance.get<ConsolidatedBannerResponse>(
        `${this.baseUrl}/checkout`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all checkout banners:", error);
      throw error;
    }
  }

  /**
   * Get all banners for a specific page
   */
  async getAllPageBanners(page: "home" | "category" | "checkout"): Promise<{
    [key: string]: Banner[];
  }> {
    try {
      const sections = BANNER_SECTIONS[page];
      const bannerData: { [key: string]: Banner[] } = {};

      await Promise.all(
        sections.map(async (section) => {
          try {
            const sectionKey = section.key.replace("_", "-");
            const response = await axiosInstance.get<BannerResponse>(
              `${this.baseUrl}/${page}/${sectionKey}`
            );
            if (response.data.success) {
              bannerData[section.key] = response.data.data.banners;
            }
          } catch (error) {
            console.error(`Error fetching ${section.key} banners:`, error);
            bannerData[section.key] = [];
          }
        })
      );

      return bannerData;
    } catch (error) {
      console.error(`Error fetching all ${page} banners:`, error);
      throw error;
    }
  }

  /**
   * Get banners by section
   */
  async getBannersBySection(
    page: "home" | "category" | "checkout",
    section: string
  ): Promise<BannerResponse> {
    try {
      const sectionKey = section.replace("_", "-");
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/${page}/${sectionKey}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${section} banners:`, error);
      throw error;
    }
  }
}

// Admin Banner Service (Full CRUD access)
export class AdminBannerService {
  private baseUrl = "/admin/banners";

  /**
   * Create FormData for file upload
   */
  private createFormData(
    title: string,
    mobileFiles?: FileList | File[] | null,
    desktopFiles?: FileList | File[] | null,
    isActive?: boolean
  ): FormData {
    const formData = new FormData();
    formData.append("title", title);

    if (isActive !== undefined) {
      formData.append("is_active", isActive.toString());
    }

    // Add mobile images
    if (mobileFiles) {
      Array.from(mobileFiles).forEach((file) => {
        formData.append("mobile_images", file);
      });
    }

    // Add desktop images
    if (desktopFiles) {
      Array.from(desktopFiles).forEach((file) => {
        formData.append("desktop_images", file);
      });
    }

    return formData;
  }

  /**
   * Upload banner with file upload
   */
  async uploadBanner(
    page: "home" | "category" | "checkout",
    section: string,
    title: string,
    mobileFiles: FileList | File[],
    desktopFiles: FileList | File[]
  ): Promise<BannerCreateUpdateResponse> {
    try {
      const sectionKey = section.replace("_", "-");
      const formData = this.createFormData(title, mobileFiles, desktopFiles);

      const response = await axiosInstance.post<BannerCreateUpdateResponse>(
        `${this.baseUrl}/${page}/${sectionKey}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading banner:", error);
      throw error;
    }
  }

  /**
   * Update banner with optional file upload
   */
  async updateBanner(
    page: "home" | "category" | "checkout",
    section: string,
    bannerId: string,
    title?: string,
    isActive?: boolean,
    mobileFiles?: FileList | File[] | null,
    desktopFiles?: FileList | File[] | null
  ): Promise<BannerCreateUpdateResponse> {
    try {
      const sectionKey = section.replace("_", "-");
      const formData = new FormData();

      // Add optional fields
      if (title !== undefined) formData.append("title", title);
      if (isActive !== undefined)
        formData.append("is_active", isActive.toString());

      // Add mobile images if provided
      if (mobileFiles && mobileFiles.length > 0) {
        Array.from(mobileFiles).forEach((file) => {
          formData.append("mobile_images", file);
        });
      }

      // Add desktop images if provided
      if (desktopFiles && desktopFiles.length > 0) {
        Array.from(desktopFiles).forEach((file) => {
          formData.append("desktop_images", file);
        });
      }

      const response = await axiosInstance.put<BannerCreateUpdateResponse>(
        `${this.baseUrl}/${page}/${sectionKey}/${bannerId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating banner:", error);
      throw error;
    }
  }

  /**
   * Update banner by ID (generic update)
   */
  async updateBannerById(
    bannerId: string,
    title?: string,
    isActive?: boolean,
    mobileFiles?: FileList | File[] | null,
    desktopFiles?: FileList | File[] | null
  ): Promise<BannerCreateUpdateResponse> {
    try {
      const formData = new FormData();

      // Add optional fields
      if (title !== undefined) formData.append("title", title);
      if (isActive !== undefined)
        formData.append("is_active", isActive.toString());

      // Add mobile images if provided
      if (mobileFiles && mobileFiles.length > 0) {
        Array.from(mobileFiles).forEach((file) => {
          formData.append("mobile_images", file);
        });
      }

      // Add desktop images if provided
      if (desktopFiles && desktopFiles.length > 0) {
        Array.from(desktopFiles).forEach((file) => {
          formData.append("desktop_images", file);
        });
      }

      const response = await axiosInstance.put<BannerCreateUpdateResponse>(
        `${this.baseUrl}/${bannerId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating banner by ID:", error);
      throw error;
    }
  }

  /**
   * Get all banners (admin overview)
   */
  async getAllBanners(): Promise<BannerResponse> {
    try {
      const response = await axiosInstance.get<BannerResponse>(
        `${this.baseUrl}/`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all banners:", error);
      throw error;
    }
  }

  /**
   * Get single banner by ID
   */
  async getBannerById(
    bannerId: string
  ): Promise<{ success: boolean; data: Banner }> {
    try {
      const response = await axiosInstance.get<{
        success: boolean;
        data: Banner;
      }>(`${this.baseUrl}/${bannerId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching banner by ID:", error);
      throw error;
    }
  }

  /**
   * Delete banner by ID
   */
  async deleteBanner(
    bannerId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete<{
        success: boolean;
        message: string;
      }>(`${this.baseUrl}/${bannerId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting banner:", error);
      throw error;
    }
  }

  /**
   * Upload banner with progress tracking
   */
  async uploadBannerWithProgress(
    page: "home" | "category",
    section: string,
    title: string,
    mobileFiles: FileList | File[],
    desktopFiles: FileList | File[],
    progressCallback?: (progress: number) => void
  ): Promise<BannerCreateUpdateResponse> {
    return new Promise((resolve, reject) => {
      const sectionKey = section.replace("_", "-");
      const formData = this.createFormData(title, mobileFiles, desktopFiles);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && progressCallback) {
          const percentComplete = (e.loaded / e.total) * 100;
          progressCallback(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error("Failed to parse response"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      // Get auth token
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      xhr.open("POST", `/app/v1${this.baseUrl}/${page}/${sectionKey}`);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  // Specific section methods for convenience

  /**
   * Create hero carousel banner
   */
  async createHeroCarouselBanner(
    title: string,
    mobileFiles: FileList | File[],
    desktopFiles: FileList | File[]
  ): Promise<BannerCreateUpdateResponse> {
    return this.uploadBanner(
      "home",
      "hero_carousel",
      title,
      mobileFiles,
      desktopFiles
    );
  }

  /**
   * Create sale banner
   */
  async createSaleBanner(
    title: string,
    mobileFiles: FileList | File[],
    desktopFiles: FileList | File[]
  ): Promise<BannerCreateUpdateResponse> {
    return this.uploadBanner(
      "home",
      "sale_banner",
      title,
      mobileFiles,
      desktopFiles
    );
  }

  /**
   * Create mega sales banner
   */
  async createMegaSalesBanner(
    title: string,
    mobileFiles: FileList | File[],
    desktopFiles: FileList | File[]
  ): Promise<BannerCreateUpdateResponse> {
    return this.uploadBanner(
      "home",
      "mega_sales",
      title,
      mobileFiles,
      desktopFiles
    );
  }

  /**
   * Create deals banner
   */
  async createDealsBanner(
    title: string,
    mobileFiles: FileList | File[],
    desktopFiles: FileList | File[]
  ): Promise<BannerCreateUpdateResponse> {
    return this.uploadBanner(
      "home",
      "deals_banner",
      title,
      mobileFiles,
      desktopFiles
    );
  }

  /**
   * Create category banner
   */
  async createCategoryBanner(
    section: "banner_one" | "banner_two" | "banner_three",
    title: string,
    mobileFiles: FileList | File[],
    desktopFiles: FileList | File[]
  ): Promise<BannerCreateUpdateResponse> {
    return this.uploadBanner(
      "category",
      section,
      title,
      mobileFiles,
      desktopFiles
    );
  }

  /**
   * Create checkout banner
   */
  async createCheckoutBanner(
    section:
      | "checkout_banner_one"
      | "checkout_banner_two"
      | "checkout_banner_three"
      | "checkout_banner_four",
    title: string,
    mobileFiles: FileList | File[],
    desktopFiles: FileList | File[]
  ): Promise<BannerCreateUpdateResponse> {
    return this.uploadBanner(
      "checkout",
      section,
      title,
      mobileFiles,
      desktopFiles
    );
  }

  /**
   * Toggle banner active status
   */
  async toggleBannerStatus(
    page: "home" | "category" | "checkout",
    section: string,
    bannerId: string,
    isActive: boolean
  ): Promise<BannerCreateUpdateResponse> {
    return this.updateBanner(
      page,
      section,
      bannerId,
      undefined,
      isActive,
      null,
      null
    );
  }

  /**
   * Update banner title only
   */
  async updateBannerTitle(
    page: "home" | "category" | "checkout",
    section: string,
    bannerId: string,
    title: string
  ): Promise<BannerCreateUpdateResponse> {
    return this.updateBanner(
      page,
      section,
      bannerId,
      title,
      undefined,
      null,
      null
    );
  }

  /**
   * Update banner images only
   */
  async updateBannerImages(
    page: "home" | "category" | "checkout",
    section: string,
    bannerId: string,
    mobileFiles?: FileList | File[],
    desktopFiles?: FileList | File[]
  ): Promise<BannerCreateUpdateResponse> {
    return this.updateBanner(
      page,
      section,
      bannerId,
      undefined,
      undefined,
      mobileFiles,
      desktopFiles
    );
  }
}

// Utility functions
export const validateImageFiles = (
  files: FileList | File[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  Array.from(files).forEach((file, index) => {
    if (!validTypes.includes(file.type)) {
      errors.push(
        `File ${index + 1}: Invalid file type. Allowed: JPEG, PNG, WebP`
      );
    }
    if (file.size > maxSize) {
      errors.push(`File ${index + 1}: File size exceeds 10MB limit`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getBannerSectionConfig = (sectionKey: string) => {
  const allSections = [
    ...BANNER_SECTIONS.home,
    ...BANNER_SECTIONS.category,
    ...BANNER_SECTIONS.checkout,
  ];
  return allSections.find((section) => section.key === sectionKey);
};

export const validateBannerSection = (
  sectionKey: string,
  files: FileList | File[]
): { valid: boolean; error?: string } => {
  const config = getBannerSectionConfig(sectionKey);
  if (!config) {
    return { valid: false, error: "Invalid banner section" };
  }

  if (files.length > config.maxImages) {
    return {
      valid: false,
      error: `Maximum ${config.maxImages} images allowed for ${config.name}`,
    };
  }

  return { valid: true };
};

// Create service instances
export const userBannerService = new UserBannerService();
export const adminBannerService = new AdminBannerService();

// Export default services
export default {
  user: userBannerService,
  admin: adminBannerService,
  validateImageFiles,
  getBannerSectionConfig,
  validateBannerSection,
  BANNER_SECTIONS,
};
