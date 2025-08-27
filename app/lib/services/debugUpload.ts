/**
 * Debug utility for testing S3 uploads and CORS configuration
 * This can be used in browser console to test uploads directly
 */

interface TestUploadResult {
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Test CORS configuration by making a simple request to S3
 */
async function testS3CORS(bucketUrl: string): Promise<TestUploadResult> {
  try {
    console.log("Testing CORS for:", bucketUrl);

    const response = await fetch(bucketUrl, {
      method: "OPTIONS",
      headers: {
        Origin: window.location.origin,
        "Access-Control-Request-Method": "PUT",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    console.log("CORS Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (response.status === 200 || response.status === 204) {
      return {
        success: true,
        details: {
          status: response.status,
          allowedMethods: response.headers.get("Access-Control-Allow-Methods"),
          allowedHeaders: response.headers.get("Access-Control-Allow-Headers"),
          allowedOrigins: response.headers.get("Access-Control-Allow-Origin"),
        },
      };
    } else {
      return {
        success: false,
        error: `CORS preflight failed: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
      };
    }
  } catch (error) {
    console.error("CORS test error:", error);
    return {
      success: false,
      error: `CORS test failed: ${error}`,
      details: { error },
    };
  }
}

/**
 * Test actual file upload to a presigned URL
 */
async function testPresignedUpload(
  presignedUrl: string,
  testFile?: File
): Promise<TestUploadResult> {
  try {
    // Create a small test file if none provided
    const file =
      testFile ||
      new File(["test content"], "test.txt", { type: "text/plain" });

    console.log("Testing upload to:", presignedUrl);
    console.log("File:", { name: file.name, type: file.type, size: file.size });

    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log("Upload Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (response.ok) {
      return {
        success: true,
        details: {
          status: response.status,
          url: presignedUrl.split("?")[0],
        },
      };
    } else {
      const errorText = await response.text().catch(() => "");
      return {
        success: false,
        error: `Upload failed: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          errorText,
        },
      };
    }
  } catch (error) {
    console.error("Upload test error:", error);
    return {
      success: false,
      error: `Upload test failed: ${error}`,
      details: { error },
    };
  }
}

/**
 * Debug the entire upload flow
 */
async function debugUploadFlow() {
  console.log("=== S3 Upload Debug Tool ===");
  console.log("Origin:", window.location.origin);
  console.log("User Agent:", navigator.userAgent);

  // Test basic connectivity
  try {
    const testUrl = "https://totallyassets.s3.ap-south-1.amazonaws.com/";
    console.log("\n1. Testing basic S3 connectivity...");

    const basicResponse = await fetch(testUrl, { method: "HEAD" });
    console.log(
      "Basic connectivity:",
      basicResponse.status,
      basicResponse.statusText
    );
  } catch (error) {
    console.error("Basic connectivity failed:", error);
  }

  // Instructions for manual testing
  console.log("\n2. Manual Testing Instructions:");
  console.log("- Get a presigned URL from your backend");
  console.log("- Run: testPresignedUpload('YOUR_PRESIGNED_URL')");
  console.log(
    "- Or: testS3CORS('https://totallyassets.s3.ap-south-1.amazonaws.com/')"
  );
}

// Make functions available globally for console testing
if (typeof window !== "undefined") {
  const globalWindow = window as typeof window & {
    testS3CORS: typeof testS3CORS;
    testPresignedUpload: typeof testPresignedUpload;
    debugUploadFlow: typeof debugUploadFlow;
  };

  globalWindow.testS3CORS = testS3CORS;
  globalWindow.testPresignedUpload = testPresignedUpload;
  globalWindow.debugUploadFlow = debugUploadFlow;

  console.log("S3 Debug tools loaded. Available functions:");
  console.log("- testS3CORS(bucketUrl)");
  console.log("- testPresignedUpload(presignedUrl, file?)");
  console.log("- debugUploadFlow()");
}

export { testS3CORS, testPresignedUpload, debugUploadFlow };
