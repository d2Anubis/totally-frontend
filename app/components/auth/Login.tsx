"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { RECAPTCHA_SITE_KEY, API_BASE_URL, GOOGLE_CLIENT_ID, setAuthToken, setRefreshToken, setUserData } from "@/app/lib/config";
import Swal from "sweetalert2";



interface LoginProps {
  showTabs?: boolean;
}

const Login = ({ showTabs = true }: LoginProps) => {
  const { login, isLoggedIn, setUserFromStorage } = useAuth();
  const router = useRouter();
  
  // Handle redirects after login state changes
  useEffect(() => {
    if (isLoggedIn) {
      // Check if we should redirect to checkout
      const checkoutRedirectUrl = localStorage.getItem("checkout_redirect");
      const returnUrl = localStorage.getItem("return_url");
      const buyNowPending = localStorage.getItem("buy_now_pending");
      const referrer = document.referrer;
      const cameFromCheckout = referrer && referrer.includes('/checkout');
      
      // Check URL parameters for redirect info
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');
      const shouldRedirectToCheckout = redirectParam === 'checkout' || cameFromCheckout;
      const shouldRedirectToTrackOrder = redirectParam === 'track-order';
      
      // Also check sessionStorage as backup
      const sessionCheckoutRedirect = sessionStorage.getItem("checkout_redirect");
      const sessionCameFromCheckout = sessionStorage.getItem("came_from_checkout");
      const sessionCameFromTrackOrder = sessionStorage.getItem("came_from_track_order");
      
      console.log("Login component - user just logged in, checking redirects:");
      console.log("checkoutRedirectUrl:", checkoutRedirectUrl);
      console.log("returnUrl:", returnUrl);
      console.log("buyNowPending:", buyNowPending);
      console.log("referrer:", referrer);
      console.log("cameFromCheckout:", cameFromCheckout);
      console.log("redirectParam:", redirectParam);
      console.log("shouldRedirectToCheckout:", shouldRedirectToCheckout);
      console.log("shouldRedirectToTrackOrder:", shouldRedirectToTrackOrder);
      console.log("sessionCheckoutRedirect:", sessionCheckoutRedirect);
      console.log("sessionCameFromCheckout:", sessionCameFromCheckout);
      console.log("sessionCameFromTrackOrder:", sessionCameFromTrackOrder);
      
      // Small delay to ensure all state updates are complete
      const redirectTimeout = setTimeout(() => {
        if (checkoutRedirectUrl) {
          console.log("Login useEffect: Redirecting to checkout (localStorage):", checkoutRedirectUrl);
          localStorage.removeItem("checkout_redirect");
          sessionStorage.removeItem("checkout_redirect");
          sessionStorage.removeItem("came_from_checkout");
          // Use window.location.href for production reliability
          window.location.href = checkoutRedirectUrl;
        } else if (sessionCheckoutRedirect) {
          console.log("Login useEffect: Redirecting to checkout (sessionStorage):", sessionCheckoutRedirect);
          sessionStorage.removeItem("checkout_redirect");
          sessionStorage.removeItem("came_from_checkout");
          // Use window.location.href for production reliability
          window.location.href = sessionCheckoutRedirect;
        } else if (shouldRedirectToCheckout || sessionCameFromCheckout === 'true') {
          console.log("Login useEffect: Should redirect to checkout, redirecting to checkout");
          sessionStorage.removeItem("came_from_checkout");
          // Use window.location.href for production reliability
          window.location.href = "/checkout";
        } else if (shouldRedirectToTrackOrder || sessionCameFromTrackOrder === 'true') {
          console.log("Login useEffect: Should redirect to track order, redirecting to orders");
          console.log("shouldRedirectToTrackOrder:", shouldRedirectToTrackOrder);
          console.log("sessionCameFromTrackOrder:", sessionCameFromTrackOrder);
          sessionStorage.removeItem("came_from_track_order");
          // Use window.location.href for production reliability
          window.location.href = "/account?tab=orders";
        } else if (returnUrl) {
          console.log("Login useEffect: Redirecting to return URL:", returnUrl);
          localStorage.removeItem("return_url");
          // Use window.location.href for production reliability
          window.location.href = returnUrl;
        } else {
          console.log("Login useEffect: No specific redirect needed, going to homepage");
          // Use window.location.href for production reliability
          window.location.href = "/";
        }
      }, 200); // Increased delay for production
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [isLoggedIn, router]);



  // Check for social login redirects and handle OAuth process completion
  useEffect(() => {
    const handleSocialLoginRedirect = async () => {
      try {
        // Check URL parameters for auth code or token
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const token = urlParams.get('token');
        
        // Get what kind of social login was in progress
        const socialLoginType = localStorage.getItem("social_login_in_progress");
        
        if (!socialLoginType) {
          // No social login in progress, just a regular visit to login page
          return;
        }
        
        console.log("Detected social login redirect with:", { code, token, error, socialLoginType });
        
        // Clear the in-progress flag right away
        localStorage.removeItem("social_login_in_progress");
        
        // Check for error first
        if (error) {
          console.error("Social login error:", error);
          Swal.fire({
            title: "Authentication Failed",
            text: "Failed to complete authentication. Please try again.",
            icon: "error",
            confirmButtonColor: "#00478f",
          });
          return;
        }
        
        // Show loading state
        Swal.fire({
          title: "Completing Login",
          text: "Please wait while we complete your authentication...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        
        // If we have a token directly, use it
        if (token) {
          console.log("Received token directly from redirect");
          // Get user data and complete login
          await completeSocialLogin(token, token);
          return;
        }
        
        // If we have a code, we need to exchange it for a token
        if (code) {
          console.log("Received authorization code, exchanging for token");
          
          // Make a request to exchange the code for a token
          const tokenEndpoint = `${API_BASE_URL}/user/auth/${socialLoginType}/token`;
          const response = await fetch(tokenEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          const data = await response.json();
          
          if (data.success && data.access_token) {
            console.log("Successfully exchanged code for token");
            await completeSocialLogin(data.access_token, data.refresh_token, data.user);
          } else {
            throw new Error(data.message || "Failed to exchange code for token");
          }
        }
      } catch (error) {
        console.error("Error handling social login redirect:", error);
        Swal.close();
        Swal.fire({
          title: "Login Failed",
          text: "We couldn't complete your login. Please try again.",
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    };
    
    // Helper function to complete the social login process
    // Define the user data interface
    interface SocialUserData {
      id?: number;
      email: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
      country_code?: string;
      language?: string;
      dob?: string;
      gender?: string;
      access_token?: string;
      refresh_token?: string;
      avatar?: string;
      address?: {
        line1?: string;
        line2?: string;
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
      };
    }
    
    const completeSocialLogin = async (token: string, refresh_token: string, initialUserData?: SocialUserData) => {
      // Ensure userData is defined
      let userData: SocialUserData = initialUserData || {
        email: 'unknown@example.com'
      };
      try {
        if (!initialUserData) {
          // If we don't have user data yet, fetch it using the token
          const response = await fetch(`${API_BASE_URL}/user/auth/google/tokens`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          
          if (!data.success || !data.user) {
            throw new Error("Failed to get user data");
          }
          
          userData = data.user;
        }
        
        // Store tokens
        // if (userData.access_token) {
        //   setAuthToken(userData.access_token);
        // } else if (token) {
        //   setAuthToken(token);
        // }
        setAuthToken(token);
        
        if (userData.refresh_token) {
          setRefreshToken(refresh_token);
        }
        
        // Store user information
        setUserData({
          id: userData.id || 0,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          country_code: userData.country_code || '',
          language: userData.language || 'en',
          dob: userData.dob || '',
          gender: userData.gender || '',
          avatar: userData.avatar || '/images/common/profile.jpeg',
          address: userData.address || {}
        });
        
        // Update AuthContext state to reflect logged-in user
        setUserFromStorage();
        
        // Close the loading dialog
        Swal.close();
        
        // Get the stored return URLs from localStorage (same as regular login)
        const buyNowPending = localStorage.getItem("buy_now_pending");
        const checkoutRedirectUrl = localStorage.getItem("checkout_redirect");
        const returnUrl = localStorage.getItem("return_url");
        
        // Check if user came from checkout page via referrer or URL parameter
        const referrer = document.referrer;
        const cameFromCheckout = referrer && referrer.includes('/checkout');
        
        // Also check URL parameters for redirect info
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get('redirect');
        const shouldRedirectToCheckout = redirectParam === 'checkout' || cameFromCheckout;
        
        console.log("Social login success - checking redirect URLs:");
        console.log("buyNowPending:", buyNowPending);
        console.log("checkoutRedirectUrl:", checkoutRedirectUrl);
        console.log("returnUrl:", returnUrl);
        console.log("referrer:", referrer);
        console.log("cameFromCheckout:", cameFromCheckout);
        console.log("redirectParam:", redirectParam);
        console.log("shouldRedirectToCheckout:", shouldRedirectToCheckout);
        
        // Additional debugging - check all localStorage items
        console.log("All localStorage items related to redirects (Social login):");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('redirect') || key.includes('checkout') || key.includes('return'))) {
            console.log(`${key}:`, localStorage.getItem(key));
          }
        }
        
        // Handle buy now pending if any
        if (buyNowPending) {
          try {
            const pendingData = JSON.parse(buyNowPending);
            localStorage.removeItem("buy_now_pending");
            
            const { buyNowCheckout } = await import("@/app/lib/services/orderService");
            const response = await buyNowCheckout({
              product_id: pendingData.product_id,
              quantity: pendingData.quantity,
            });
            
            if (response) {
              localStorage.setItem("buy_now_cart_id", response.cart_id);
              router.push(`/checkout?cart_id=${response.cart_id}&buy_now=true`);
              return;
            }
          } catch (error) {
            console.error("Failed to process buy now after social login:", error);
          }
        }
        
        // Redirect logic is now handled by the useEffect above
        console.log("Social login: Login successful, redirect will be handled by useEffect");
      } catch (error) {
        console.error("Error completing social login:", error);
        Swal.close();
        Swal.fire({
          title: "Login Failed",
          text: "We couldn't complete your login. Please try again.",
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    };
    
    handleSocialLoginRedirect();
  }, [router]);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    { email: false, password: false }
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Inline validation for email and password fields, only show errors after field is touched
  useEffect(() => {
    const validateForm = () => {
      const newErrors: { [key: string]: string } = { ...errors };
      // Email validation
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Email is invalid";
      } else {
        delete newErrors.email;
      }
      // Password validation
      if (!password.trim()) {
        newErrors.password = "Password is required";
      } else {
        delete newErrors.password;
      }
      setErrors(newErrors);
      const isEmailValid = !newErrors.email;
      const isPasswordValid = !newErrors.password;
      const isRecaptchaValid = recaptchaCompleted;
      setIsFormValid(isEmailValid && isPasswordValid && isRecaptchaValid);
    };
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password, recaptchaCompleted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    // Clear any previous errors
    setErrors({});

    try {
      const result = await login(email, password);

      if (result.success) {
        // Clear form only on success
        setEmail("");
        setPassword("");

        // Check for buy now pending action
        const buyNowPending = localStorage.getItem("buy_now_pending");

        // First check for checkout redirect URL
        const checkoutRedirectUrl = localStorage.getItem("checkout_redirect");
        // Then check for general return URL (for wishlist feature)
        const returnUrl = localStorage.getItem("return_url");

        // Check if user came from checkout page via referrer or URL parameter
        const referrer = document.referrer;
        const cameFromCheckout = referrer && referrer.includes('/checkout');
        
        // Also check URL parameters for redirect info
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get('redirect');
        const shouldRedirectToCheckout = redirectParam === 'checkout' || cameFromCheckout;

        // Debug logging to see what redirect URLs are available
        console.log("Login success - checking redirect URLs:");
        console.log("buyNowPending:", buyNowPending);
        console.log("checkoutRedirectUrl:", checkoutRedirectUrl);
        console.log("returnUrl:", returnUrl);
        console.log("referrer:", referrer);
        console.log("cameFromCheckout:", cameFromCheckout);
        console.log("redirectParam:", redirectParam);
        console.log("shouldRedirectToCheckout:", shouldRedirectToCheckout);

        // The cart will be automatically synced in ShopContext when user changes
        console.log("Login successful - cart will be synced automatically");
        
        // Additional debugging - check all localStorage items
        console.log("All localStorage items related to redirects:");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('redirect') || key.includes('checkout') || key.includes('return'))) {
            console.log(`${key}:`, localStorage.getItem(key));
          }
        }

        // Handle buy now pending action
        if (buyNowPending) {
          try {
            const pendingData = JSON.parse(buyNowPending);
            localStorage.removeItem("buy_now_pending");

            // Show a loading message
            Swal.fire({
              title: "Processing Buy Now",
              text: `Preparing to purchase ${pendingData.product_name}...`,
              allowOutsideClick: false,
              allowEscapeKey: false,
              showConfirmButton: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });

            // Import and call buyNowCheckout
            const { buyNowCheckout } = await import(
              "@/app/lib/services/orderService"
            );
            const response = await buyNowCheckout({
              product_id: pendingData.product_id,
              quantity: pendingData.quantity,
            });

            // Close loading
            Swal.close();

            if (response) {
              // Store the temporary cart_id in localStorage to clean up later if needed
              localStorage.setItem("buy_now_cart_id", response.cart_id);
              // Redirect to checkout with the buy now cart
              router.push(`/checkout?cart_id=${response.cart_id}&buy_now=true`);
              return;
            }
          } catch (error) {
            console.error("Failed to process buy now after login:", error);
            Swal.fire({
              title: "Error",
              text: "Failed to process Buy Now. Please try again from the product page.",
              icon: "error",
              confirmButtonColor: "#00478f",
            });
          }
        }

        // Redirect logic is now handled by the useEffect above
        console.log("Regular login: Login successful, redirect will be handled by useEffect");
      } else {
        // Show error message without page reload
        Swal.fire({
          title: "Login Failed",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    } finally {
      setLoading(false);
      // Reset reCAPTCHA after login attempt
      recaptchaRef.current?.reset();
      setRecaptchaCompleted(false);
    }
  };





  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      
      console.log("Google OAuth response:", credentialResponse);
      
      // Send the credential to your backend
      const response = await fetch(`${API_BASE_URL}/user/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          client_id: GOOGLE_CLIENT_ID
        }),
      });

      const data = await response.json();

      if (data.success && data.access_token) {
        // Store tokens
        setAuthToken(data.access_token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
        }

        // Store user information
        if (data.user) {
          setUserData({
            id: data.user.id || 0,
            email: data.user.email,
            first_name: data.user.first_name || '',
            last_name: data.user.last_name || '',
            phone: data.user.phone || '',
            country_code: data.user.country_code || '',
            language: data.user.language || 'en',
            dob: data.user.dob || '',
            gender: data.user.gender || '',
            avatar: data.user.avatar || '/images/common/profile.jpeg',
            address: data.user.address || {}
          });
        }

        // Update AuthContext state to reflect logged-in user
        setUserFromStorage();

        // Handle redirects
        const buyNowPending = localStorage.getItem("buy_now_pending");
        const checkoutRedirectUrl = localStorage.getItem("checkout_redirect");
        const returnUrl = localStorage.getItem("return_url");

        // Check if user came from checkout page via referrer or URL parameter
        const referrer = document.referrer;
        const cameFromCheckout = referrer && referrer.includes('/checkout');
        
        // Also check URL parameters for redirect info
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get('redirect');
        const shouldRedirectToCheckout = redirectParam === 'checkout' || cameFromCheckout;

        console.log("Google login success - checking redirect URLs:");
        console.log("buyNowPending:", buyNowPending);
        console.log("checkoutRedirectUrl:", checkoutRedirectUrl);
        console.log("returnUrl:", returnUrl);
        console.log("referrer:", referrer);
        console.log("cameFromCheckout:", cameFromCheckout);
        console.log("redirectParam:", redirectParam);
        console.log("shouldRedirectToCheckout:", shouldRedirectToCheckout);
        
        // Additional debugging - check all localStorage items
        console.log("All localStorage items related to redirects (Google login):");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('redirect') || key.includes('checkout') || key.includes('return'))) {
            console.log(`${key}:`, localStorage.getItem(key));
          }
        }

        if (buyNowPending) {
          try {
            const pendingData = JSON.parse(buyNowPending);
            localStorage.removeItem("buy_now_pending");

            const { buyNowCheckout } = await import("@/app/lib/services/orderService");
            const checkoutResponse = await buyNowCheckout({
              product_id: pendingData.product_id,
              quantity: pendingData.quantity,
            });

            if (checkoutResponse) {
              localStorage.setItem("buy_now_cart_id", checkoutResponse.cart_id);
              router.push(`/checkout?cart_id=${checkoutResponse.cart_id}&buy_now=true`);
              return;
            }
          } catch (error) {
            console.error("Failed to process buy now after Google login:", error);
          }
        }

        // Redirect logic is now handled by the useEffect above
        console.log("Google login: Login successful, redirect will be handled by useEffect");
      } else {
        throw new Error(data.message || "Google authentication failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      Swal.fire({
        title: "Login Failed",
        text: "Google authentication failed. Please try again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google OAuth error");
    Swal.fire({
      title: "Authentication Failed",
      text: "Google authentication was cancelled or failed. Please try again.",
      icon: "error",
      confirmButtonColor: "#00478f",
    });
  };
  
  const handleCustomGoogleLogin = () => {
    // Add a small delay to ensure Google button is loaded
    setTimeout(() => {
      // Try multiple selectors to find the Google button
      let googleButton = document.querySelector('[data-testid="google-button"]') as HTMLElement;
    
    if (!googleButton) {
      // Try alternative selectors
      googleButton = document.querySelector('div[role="button"]') as HTMLElement;
    }
    
    if (!googleButton) {
      // Try finding by iframe
      const iframe = document.querySelector('iframe[src*="accounts.google.com"]') as HTMLIFrameElement;
      if (iframe) {
        googleButton = iframe.parentElement as HTMLElement;
      }
    }
    
    if (!googleButton) {
      // Try finding any button in the google-login-container
      const container = document.querySelector('.google-login-container');
      if (container) {
        googleButton = container.querySelector('div[role="button"], button, iframe') as HTMLElement;
      }
    }
    
    if (googleButton) {
      // Temporarily make the button visible to ensure it can be clicked
      googleButton.style.display = 'block';
      googleButton.style.visibility = 'visible';
      googleButton.style.position = 'absolute';
      googleButton.style.left = '-9999px';
      googleButton.style.top = '-9999px';
      googleButton.style.zIndex = '-1';
      
      // Trigger the click
      googleButton.click();
      
      // Hide it again after a short delay
      setTimeout(() => {
        googleButton.style.display = 'none';
        googleButton.style.visibility = 'hidden';
      }, 100);
    } else {
      console.error('Google button not found with any selector');
      // Fallback: try to trigger the Google OAuth flow directly
      console.log('Attempting to trigger Google OAuth flow directly...');
    }
    }, 100); // 100ms delay to ensure Google button is loaded
  };

  return (
    <div
      className={
        showTabs ? "py-8 px-4 max-w-6xl mx-auto min-h-[calc(100vh-300px)]" : ""
      }
    >
      {/* Login/Registration Tabs */}
      {showTabs && (
        <>
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-3xl">
              <div className="flex text-center border-b border-gray-40">
                <div className="flex-1 pb-2 border-b-2 border-blue-00">
                  <h2 className="title-2 text-blue-00">Login</h2>
                </div>
                <Link href="/register" className="flex-1 pb-2">
                  <h2 className="title-2 text-gray-30">Registration</h2>
                </Link>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <p className="title-2-semibold">
                You Don&apos;t Have An Account Yet?{" "}
                <Link href="/register" className="text-blue-00 title-2">
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </>
      )}

      {/* Login Form */}
      <div className={showTabs ? "w-full max-w-3xl mx-auto" : ""}>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block title-1-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={`w-full bg-transparent border ${
                touched.email && errors.email
                  ? "border-red-500"
                  : "border-blue-00"
              } rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium`}
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                setTouched((prev) => ({ ...prev, email: true }));
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  if (!value.trim()) {
                    newErrors.email = "Email is required";
                  } else if (!/\S+@\S+\.\S+/.test(value)) {
                    newErrors.email = "Email is invalid";
                  } else {
                    delete newErrors.email;
                  }
                  return newErrors;
                });
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              required
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block title-1-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className={`w-full bg-transparent border ${
                  touched.password && errors.password
                    ? "border-red-500"
                    : "border-blue-00"
                } rounded-md p-3 pr-12 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium`}
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  setTouched((prev) => ({ ...prev, password: true }));
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    if (!value.trim()) {
                      newErrors.password = "Password is required";
                    } else {
                      delete newErrors.password;
                    }
                    return newErrors;
                  });
                }}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, password: true }))
                }
                required
              />
              {touched.password && errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fas fa-eye-slash w-5 h-5 text-blue-00"></i>
                ) : (
                  <i className="fas fa-eye w-5 h-5 text-blue-00"></i>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <div className="mb-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(value) => {
                    setRecaptchaCompleted(!!value);
                    if (errors.recaptcha) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.recaptcha;
                        return newErrors;
                      });
                    }
                  }}
                  theme="light"
                  size="normal"
                  badge="bottomright"
                />
              </div>
              {errors.recaptcha && (
                <p className="text-red-500 text-sm">{errors.recaptcha}</p>
              )}
            </div>
            <Link
              href="/forgot-password"
              className="body-medium text-blue-00 hover:underline self-start"
            >
              Lost Your Password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-00 text-white button py-3 rounded-md hover:bg-blue-10 transition-colors disabled:opacity-70 mb-3"
              disabled={loading || !isFormValid}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="w-full">
              {/* Hidden Google Login Component */}
              <div className="google-login-container" style={{ display: 'none' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  auto_select={false}
                  cancel_on_tap_outside={false}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="100%"
                  locale="en"
                />
              </div>

              {/* Custom Google Login Button */}
              <button
                type="button"
                onClick={handleCustomGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <svg
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;