"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { RECAPTCHA_SITE_KEY } from "@/app/lib/config";
import ReCAPTCHA from "react-google-recaptcha";
import Swal from "sweetalert2";
import { Country } from "country-state-city";

interface RegistrationProps {
  showTabs?: boolean;
}

const Registration = ({ showTabs = true }: RegistrationProps) => {
  const { register, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    language: "en", // Default language
    email: "",
    country_code: "+91", // Default to India country code
    phone: "",
    password: "",
    confirmPassword: "", // For validation only, not sent to API
    dob: "",
    gender: "male" as "male" | "female" | "other", // Properly typed gender
    is_marketing_emails: false,
    is_marketing_sms: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Country dropdown state
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [selectedCountryDisplay, setSelectedCountryDisplay] =
    useState("🇮🇳 India (+91)");
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Validate form whenever form fields change
  useEffect(() => {
    const validateForm = () => {
      const isFirstNameValid = formData.first_name.trim() !== "";
      const isLastNameValid = formData.last_name.trim() !== "";
      const isEmailValid =
        formData.email.trim() !== "" && /\S+@\S+\.\S+/.test(formData.email);
      const isCountryCodeValid = formData.country_code.trim() !== "";
      const isPhoneValid = formData.phone.trim() !== "";
      const isPasswordValid =
        formData.password.trim() !== "" && formData.password.length >= 6;
      const isConfirmPasswordValid =
        formData.password === formData.confirmPassword;
      const isRecaptchaValid = recaptchaCompleted;

      setIsFormValid(
        isFirstNameValid &&
          isLastNameValid &&
          isEmailValid &&
          isCountryCodeValid &&
          isPhoneValid &&
          isPasswordValid &&
          isConfirmPasswordValid &&
          isRecaptchaValid
      );
    };

    validateForm();
  }, [formData, recaptchaCompleted]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Real-time validation for inline error messages
    const newErrors = { ...errors };

    // Validate individual fields
    switch (id) {
      case "first_name":
        if (!value.trim()) {
          newErrors.first_name = "First name is required";
        } else {
          delete newErrors.first_name;
        }
        break;

      case "last_name":
        if (!value.trim()) {
          newErrors.last_name = "Last name is required";
        } else {
          delete newErrors.last_name;
        }
        break;

      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = "Email is invalid";
        } else {
          delete newErrors.email;
        }
        break;

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!/^\d+$/.test(value)) {
          newErrors.phone = "Phone number must contain only digits";
        } else if (value.length < 10) {
          newErrors.phone = "Phone number must be at least 10 digits";
        } else {
          delete newErrors.phone;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }

        // Also validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (
          formData.confirmPassword &&
          value === formData.confirmPassword
        ) {
          delete newErrors.confirmPassword;
        }
        break;

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  // Country dropdown functions
  const getAllCountries = () => {
    return Country.getAllCountries().filter((country) => country.phonecode);
  };

  const filteredCountries = getAllCountries().filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
      country.phonecode.includes(countrySearchTerm) ||
      `+${country.phonecode}`.includes(countrySearchTerm)
  );

  const handleCountrySelect = (country: {
    name: string;
    flag: string;
    phonecode: string;
    isoCode: string;
  }) => {
    const phoneCode = `+${country.phonecode}`;
    const displayText = `${country.flag} ${country.name} (${phoneCode})`;

    setFormData((prev) => ({
      ...prev,
      country_code: phoneCode,
    }));
    setSelectedCountryDisplay(displayText);
    setIsCountryDropdownOpen(false);
    setCountrySearchTerm("");

    // Clear country code error when field is updated
    if (errors.country_code) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.country_code;
        return newErrors;
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
        setCountrySearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.country_code.trim()) {
      newErrors.country_code = "Country code is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Validate reCAPTCHA
    const recaptchaValue = recaptchaRef.current?.getValue();
    if (!recaptchaValue) {
      newErrors.recaptcha = "Please verify you are not a robot";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create API request object by excluding UI-only fields
      const apiRequestData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        language: formData.language,
        email: formData.email,
        country_code: formData.country_code,
        phone: formData.phone,
        password: formData.password,
        dob: formData.dob,
        gender: formData.gender,
        is_marketing_emails: formData.is_marketing_emails,
        is_marketing_sms: formData.is_marketing_sms,
        // In a production environment, you would send the recaptcha value to your backend for verification
        recaptcha_token: recaptchaRef.current?.getValue(),
      };

      const { success, message } = await register(apiRequestData);

      if (success) {
        // Try auto-login using the same credentials
        const loginResult = await login(formData.email, formData.password);

        if (loginResult.success) {
          // Redirect to return_url if present, otherwise to account page
          const returnUrl = localStorage.getItem("return_url");
          const targetUrl = returnUrl
            ? decodeURIComponent(returnUrl)
            : "/account";

          Swal.fire({
            title: "Welcome!",
            text: "Your account was created and you are now logged in.",
            icon: "success",
            confirmButtonColor: "#00478f",
            timer: 1500,
            showConfirmButton: false,
          });

          router.push(targetUrl);
        } else {
          // Fallback: show registration success and send to login
          Swal.fire({
            title: "Registration Successful",
            text: message,
            icon: "success",
            confirmButtonColor: "#00478f",
          }).then(() => {
            const returnUrl = localStorage.getItem("return_url");
            let loginUrl = "/auth?tab=login";
            if (returnUrl) {
              loginUrl += `&return_url=${encodeURIComponent(returnUrl)}`;
            }
            router.push(loginUrl);
          });
        }
      } else {
        Swal.fire({
          title: "Registration Failed",
          text: message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
      // Reset reCAPTCHA after registration attempt
      recaptchaRef.current?.reset();
      setRecaptchaCompleted(false);
    }
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
                <Link href="/login" className="flex-1 pb-2">
                  <h2 className="title-2 text-gray-30">Login</h2>
                </Link>
                <div className="flex-1 pb-2 border-b-2 border-blue-00">
                  <h2 className="title-2 text-blue-00">Registration</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <p className="title-2-semibold">
                Already Have An Account?{" "}
                <Link href="/login" className="text-blue-00 title-2">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </>
      )}

      {/* Registration Form */}
      <div className={showTabs ? "w-full max-w-3xl mx-auto" : ""}>
        <form className="space-y-6" onSubmit={handleRegistration}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="first_name"
                className="block title-1-semibold mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                placeholder="Enter your first name"
                className={`w-full bg-transparent border ${
                  errors.first_name ? "border-red-500" : "border-blue-00"
                } rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium`}
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block title-1-semibold mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                placeholder="Enter your last name"
                className={`w-full bg-transparent border ${
                  errors.last_name ? "border-red-500" : "border-blue-00"
                } rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium`}
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block title-1-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className={`w-full bg-transparent border ${
                  errors.email ? "border-red-500" : "border-blue-00"
                } rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium`}
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="language" className="block title-1-semibold mb-2">
                Language
              </label>
              <div className="relative">
                <select
                  id="language"
                  className="w-full bg-transparent border border-blue-00 rounded-md p-3 pr-10 text-blue-00 focus:outline-none title-2-medium appearance-none"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="ar">Arabic</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-blue-00"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="country_code"
                className="block title-1-semibold mb-2"
              >
                Country Code
              </label>
              <div className="relative" ref={countryDropdownRef}>
                <div
                  className={`w-full bg-transparent border ${
                    errors.country_code ? "border-red-500" : "border-blue-00"
                  } rounded-md p-3 pr-10 text-blue-00 focus:outline-none title-2-medium cursor-pointer flex items-center justify-between`}
                  onClick={() =>
                    setIsCountryDropdownOpen(!isCountryDropdownOpen)
                  }
                >
                  <span>{selectedCountryDisplay}</span>
                  <svg
                    className={`w-5 h-5 text-blue-00 transition-transform absolute right-3 ${
                      isCountryDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isCountryDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-blue-00 rounded-md shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search countries or codes..."
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-00"
                        value={countrySearchTerm}
                        onChange={(e) => setCountrySearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                          <div
                            key={country.isoCode}
                            className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-blue-00"
                            onClick={() => handleCountrySelect(country)}
                          >
                            {country.flag} {country.name} (+{country.phonecode})
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          No countries found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.country_code && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.country_code}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block title-1-semibold mb-2">
                Phone Number
              </label>
              <input
                type="number"
                id="phone"
                placeholder="Enter your phone number"
                className={`w-full bg-transparent border ${
                  errors.phone ? "border-red-500" : "border-blue-00"
                } rounded-md p-3 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium`}
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
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
                    errors.password ? "border-red-500" : "border-blue-00"
                  } rounded-md p-3 pr-12 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block title-1-semibold mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  className={`w-full bg-transparent border ${
                    errors.confirmPassword ? "border-red-500" : "border-blue-00"
                  } rounded-md p-3 pr-12 text-blue-00 focus:outline-none placeholder:text-blue-00 title-2-medium`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <i className="fas fa-eye-slash w-5 h-5 text-blue-00"></i>
                  ) : (
                    <i className="fas fa-eye w-5 h-5 text-blue-00"></i>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="dob" className="block title-1-semibold mb-2">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                id="dob"
                className="w-full bg-transparent border border-blue-00 rounded-md p-3 text-blue-00 focus:outline-none title-2-medium"
                value={formData.dob}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label htmlFor="gender" className="block title-1-semibold mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  className="w-full bg-transparent border border-blue-00 rounded-md p-3 pr-10 text-blue-00 focus:outline-none title-2-medium appearance-none"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-blue-00"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_marketing_emails"
                className="w-4 h-4 mr-2"
                checked={formData.is_marketing_emails}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="is_marketing_emails" className="body-medium">
                I want to receive marketing emails
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_marketing_sms"
                className="w-4 h-4 mr-2"
                checked={formData.is_marketing_sms}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="is_marketing_sms" className="body-medium">
                I want to receive marketing SMS
              </label>
            </div>
          </div>

          <div>
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

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-00 text-white button py-3 px-10 rounded-md hover:bg-blue-10 transition-colors disabled:opacity-70"
              disabled={loading || !isFormValid}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
