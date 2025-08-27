import axiosInstance from "../axiosConfig";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import { UPLOAD_DEBUG_MODE } from "../config";

// Import debug utilities in development
if (UPLOAD_DEBUG_MODE) {
  import("./debugUpload").then(() => {
    console.log("S3 Debug utilities loaded. Use debugUploadFlow() to test.");
  });
}

// TypeScript interfaces for presigned URL functionality
export interface PresignedUrlRequest {
  key: string;
  filename: string;
}

export interface PresignedUrlResponse {
  key: string;
  url: string;
  originalName: string;
}

export interface GetPresignedUrlsRequest {
  count: number;
  keys: PresignedUrlRequest[];
}

export interface GetPresignedUrlsResponse {
  success: boolean;
  message: string;
  data: PresignedUrlResponse[];
}

export interface DeleteFilesRequest {
  urls: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface UploadResult {
  success: boolean;
  url: string;
  key: string;
  originalName: string;
  error?: string;
}

/**
 * Upload Service - Handles presigned URL-based uploads to S3
 */
export class UploadService {
  /**
   * Request presigned URLs for file uploads
   * @param request - The request containing count and keys for files to upload
   * @returns Array of presigned URL data or null if error
   */
  static async getPresignedUrls(
    request: GetPresignedUrlsRequest
  ): Promise<PresignedUrlResponse[] | null> {
    try {
      const response = await axiosInstance.post<GetPresignedUrlsResponse>(
        "/user/get-presigned-urls",
        request
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        const errorMessage =
          response.data.message || "Failed to get presigned URLs";
        console.error("Get presigned URLs error:", errorMessage);

        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonColor: "#00478f",
        });

        return null;
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = "Failed to get presigned URLs";

      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.response?.status === 401) {
        errorMessage = "Authentication required";
      } else if (axiosError.response?.status === 400) {
        errorMessage = "Invalid request data";
      }

      console.error("Get presigned URLs error:", error);

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });

      return null;
    }
  }

  /**
   * Upload a file directly to S3 using a presigned URL (Fetch API version)
   * @param presignedUrl - The presigned URL from the backend
   * @param file - The file to upload
   * @param key - The S3 key for this file
   * @returns Upload result with success status and URL
   */
  static async uploadToS3WithFetch(
    presignedUrl: string,
    file: File,
    key: string
  ): Promise<UploadResult> {
    try {
      if (UPLOAD_DEBUG_MODE) {
        console.log("Uploading to S3 with fetch:", {
          url: presignedUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      }

      const response = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (UPLOAD_DEBUG_MODE) {
        console.log("S3 Response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });
      }

      if (response.ok) {
        return {
          success: true,
          url: presignedUrl.split("?")[0], // Remove query parameters
          key: key,
          originalName: file.name,
        };
      } else {
        const errorText = await response.text().catch(() => "Unknown error");
        return {
          success: false,
          url: "",
          key: key,
          originalName: file.name,
          error: `Upload failed: ${response.status} ${response.statusText} - ${errorText}`,
        };
      }
    } catch (error) {
      console.error("S3 upload error:", error);

      let errorMessage = "Upload failed due to unexpected error";
      if (error instanceof TypeError && error.message.includes("CORS")) {
        errorMessage =
          "CORS error: S3 bucket needs to allow uploads from this domain. Please contact support.";
      }

      return {
        success: false,
        url: "",
        key: key,
        originalName: file.name,
        error: errorMessage,
      };
    }
  }

  /**
   * Upload a file directly to S3 using a presigned URL
   * @param presignedUrl - The presigned URL from the backend
   * @param file - The file to upload
   * @param key - The S3 key for this file
   * @param onProgress - Optional callback to track upload progress
   * @returns Upload result with success status and URL
   */
  static async uploadToS3(
    presignedUrl: string,
    file: File,
    key: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      return new Promise<UploadResult>((resolve) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              onProgress(percentComplete);
            }
          });
        }

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve({
              success: true,
              url: presignedUrl.split("?")[0], // Remove query parameters
              key: key,
              originalName: file.name,
            });
          } else {
            resolve({
              success: false,
              url: "",
              key: key,
              originalName: file.name,
              error: `Upload failed: ${xhr.status}`,
            });
          }
        });

        xhr.addEventListener("error", (event) => {
          console.error("XHR Error Event:", event);
          console.error("XHR Status:", xhr.status);
          console.error("XHR Status Text:", xhr.statusText);
          console.error("XHR Response:", xhr.response);

          let errorMessage = "Upload failed due to network error";

          // Check for CORS errors
          if (xhr.status === 0) {
            errorMessage =
              "CORS error: S3 bucket needs to allow uploads from this domain. Please contact support.";
          }

          resolve({
            success: false,
            url: "",
            key: key,
            originalName: file.name,
            error: errorMessage,
          });
        });

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      console.error("S3 upload error:", error);
      return {
        success: false,
        url: "",
        key: key,
        originalName: file.name,
        error: "Upload failed due to unexpected error",
      };
    }
  }

  /**
   * Upload multiple files to S3 with retry logic
   * @param presignedUrls - Array of presigned URL data
   * @param files - Array of files to upload
   * @param onProgress - Optional callback to track overall progress
   * @param maxRetries - Maximum number of retry attempts per file
   * @returns Array of upload results
   */
  static async uploadMultipleToS3(
    presignedUrls: PresignedUrlResponse[],
    files: File[],
    onProgress?: (progress: number) => void,
    maxRetries: number = 3
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    let completedUploads = 0;

    const uploadPromises = files.map(async (file, index) => {
      const presignedData = presignedUrls[index];
      if (!presignedData) {
        return {
          success: false,
          url: "",
          key: "",
          originalName: file.name,
          error: "No presigned URL available for this file",
        };
      }

      // Retry logic - try fetch first, then fallback to XHR
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (UPLOAD_DEBUG_MODE) {
            console.log(`Upload attempt ${attempt} for ${file.name}`);
          }

          // Try fetch API first (simpler, better error messages)
          const result = await this.uploadToS3WithFetch(
            presignedData.url,
            file,
            presignedData.key
          );

          if (result.success) {
            completedUploads++;
            if (onProgress) {
              onProgress((completedUploads / files.length) * 100);
            }
            return {
              ...result,
              originalName: presignedData.originalName,
            };
          }

          if (UPLOAD_DEBUG_MODE) {
            console.log(`Upload attempt ${attempt} failed:`, result.error);
          }

          if (attempt === maxRetries) {
            return result;
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        } catch {
          if (attempt === maxRetries) {
            return {
              success: false,
              url: "",
              key: presignedData.key,
              originalName: presignedData.originalName,
              error: `Upload failed after ${maxRetries} attempts`,
            };
          }
        }
      }

      return {
        success: false,
        url: "",
        key: presignedData.key,
        originalName: presignedData.originalName,
        error: "Upload failed",
      };
    });

    const uploadResults = await Promise.all(uploadPromises);
    results.push(...uploadResults);

    return results;
  }

  /**
   * Delete files from S3 using the backend endpoint
   * @param urls - Array of S3 URLs to delete
   * @returns Success status
   */
  static async deleteFiles(urls: string[]): Promise<boolean> {
    try {
      const request: DeleteFilesRequest = { urls };

      const response = await axiosInstance.delete<ApiResponse>(
        "/user/delete-files",
        {
          data: request,
        }
      );

      if (response.data.success) {
        return true;
      } else {
        const errorMessage = response.data.message || "Failed to delete files";
        console.error("Delete files error:", errorMessage);

        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonColor: "#00478f",
        });

        return false;
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to delete files";

      console.error("Delete files error:", error);

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#00478f",
      });

      return false;
    }
  }

  /**
   * Helper function to validate image files before upload
   * @param files - Array of File objects
   * @returns Validation result with errors
   */
  static validateImageFiles(
    files: File[],
    maxFiles: number = 5,
    maxSizePerFile: number = 10 * 1024 * 1024 // 10MB
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} images allowed`);
    }

    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      errors.push(
        `Only image files are allowed. Invalid files: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`
      );
    }

    const oversizedFiles = files.filter((file) => file.size > maxSizePerFile);
    if (oversizedFiles.length > 0) {
      const maxSizeMB = maxSizePerFile / (1024 * 1024);
      errors.push(
        `File size must be less than ${maxSizeMB}MB. Large files: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Complete workflow for uploading review images
   * @param files - Array of image files to upload
   * @param onProgress - Optional progress callback
   * @returns Array of successfully uploaded image keys with original names
   */
  static async uploadReviewImages(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<Array<{ key: string; originalName: string }> | null> {
    try {
      // Step 1: Validate files
      const validation = this.validateImageFiles(files, 5);
      if (!validation.isValid) {
        Swal.fire({
          title: "Invalid Files",
          text: validation.errors.join("\n"),
          icon: "error",
          confirmButtonColor: "#00478f",
        });
        return null;
      }

      // Step 2: Request presigned URLs
      const keys = files.map((file) => ({
        key: "reviews/temp",
        filename: file.name,
      }));

      const presignedUrls = await this.getPresignedUrls({
        count: files.length,
        keys,
      });

      if (!presignedUrls || presignedUrls.length !== files.length) {
        return null;
      }

      // Step 3: Upload files to S3
      const uploadResults = await this.uploadMultipleToS3(
        presignedUrls,
        files,
        onProgress
      );

      // Step 4: Filter successful uploads
      const successfulUploads = uploadResults.filter(
        (result) => result.success
      );

      if (successfulUploads.length === 0) {
        Swal.fire({
          title: "Upload Failed",
          text: "No files were uploaded successfully",
          icon: "error",
          confirmButtonColor: "#00478f",
        });
        return null;
      }

      if (successfulUploads.length < files.length) {
        const failedCount = files.length - successfulUploads.length;
        Swal.fire({
          title: "Partial Upload",
          text: `${successfulUploads.length} files uploaded successfully, ${failedCount} failed`,
          icon: "warning",
          confirmButtonColor: "#00478f",
        });
      }

      return successfulUploads.map((result) => ({
        key: result.key,
        originalName: result.originalName,
      }));
    } catch (error) {
      console.error("Upload review images error:", error);

      Swal.fire({
        title: "Upload Error",
        text: "Failed to upload images. Please try again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });

      return null;
    }
  }
}

// Export default instance for convenience
export default UploadService;
