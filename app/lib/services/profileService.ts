import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";
import Swal from "sweetalert2";

// TypeScript interfaces
export interface UserAddress {
  id: string;
  user_id: string;
  address_name: string;
  is_default: boolean;
  country: string;
  country_code: string;
  country_code_iso: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  company: string;
  city: string;
  state: string;
  zip_code: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  language: string;
  email: string;
  country_code: string;
  phone: string;
  dob?: string;
  gender: "male" | "female" | "other";
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
  last_order?: string;
  google_id?: string;
  facebook_id?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  defaultAddress?: UserAddress | null;
}

export interface DefaultAddressPayload {
  address_name?: string;
  country?: string;
  country_code?: string;
  country_code_iso?: string;
  first_name?: string;
  last_name?: string;
  address_line_1?: string;
  address_line_2?: string;
  company?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country_code?: string;
  language?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  is_marketing_emails?: boolean;
  is_marketing_sms?: boolean;
  address?: DefaultAddressPayload; // Optional object for default address management
}

export interface AddAddressRequest {
  address_name: string;
  is_default: boolean;
  country: string;
  country_code: string;
  country_code_iso: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  company: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Get user profile
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>(
      `/user/profile/get-user/${userId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to fetch user profile";

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Get user profile error:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  profileData: UpdateProfileRequest
): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(
      `/user/profile/update-user/${userId}`,
      profileData
    );

    if (response.data.success) {
      Swal.fire({
        title: "Success",
        text: response.data.message || "Profile updated successfully!",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return true;
    } else {
      Swal.fire({
        title: "Error",
        text: response.data.message || "Failed to update profile",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return false;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to update profile";

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Update profile error:", error);
    return false;
  }
};

// Get user addresses
export const getUserAddresses = async (
  userId: string
): Promise<UserAddress[] | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<UserAddress[]>>(
      `/user/profile/get-addresses/${userId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to fetch addresses";

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Get addresses error:", error);
    return null;
  }
};

// Add new address
export const addUserAddress = async (
  userId: string,
  addressData: AddAddressRequest
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(
      `/user/profile/add-address/${userId}`,
      addressData
    );

    if (response.data.success) {
      Swal.fire({
        title: "Success",
        text: response.data.message || "Address added successfully!",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return true;
    } else {
      Swal.fire({
        title: "Error",
        text: response.data.message || "Failed to add address",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return false;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to add address";

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Add address error:", error);
    return false;
  }
};

// Update address
export const updateUserAddress = async (
  addressId: string,
  addressData: AddAddressRequest
): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(
      `/user/profile/update-address/${addressId}`,
      addressData
    );

    if (response.data.success) {
      Swal.fire({
        title: "Success",
        text: response.data.message || "Address updated successfully!",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return true;
    } else {
      Swal.fire({
        title: "Error",
        text: response.data.message || "Failed to update address",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return false;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to update address";

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Update address error:", error);
    return false;
  }
};

// Delete address
export const deleteUserAddress = async (
  addressId: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete<ApiResponse>(
      `/user/profile/delete-address/${addressId}`
    );

    if (response.data.success) {
      Swal.fire({
        title: "Success",
        text: response.data.message || "Address deleted successfully!",
        icon: "success",
        confirmButtonColor: "#00478f",
      });
      return true;
    } else {
      Swal.fire({
        title: "Error",
        text: response.data.message || "Failed to delete address",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
      return false;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage =
      axiosError.response?.data?.message || "Failed to delete address";

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#00478f",
    });

    console.error("Delete address error:", error);
    return false;
  }
};
