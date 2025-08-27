"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User } from "@/app/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faEnvelope,
  faPhone,
  faChevronDown,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  getUserProfile,
  updateUserProfile,
  DefaultAddressPayload,
} from "@/app/lib/services/profileService";
import LocationSelector from "@/app/components/checkout/LocationSelector";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";
import {
  isValidCurrency,
  saveSelectedCurrencyData,
  getSelectedCurrencyData,
} from "@/app/lib/services/currencyService";
import {
  setPricingContext,
  getPricingContext,
} from "@/app/lib/services/locationPricingService";

// Country to currency mapping with flag-icons country codes
const COUNTRY_CURRENCY_MAP = [
  { code: "IN", name: "India", currency: "INR", flag: "in" },
  { code: "US", name: "United States", currency: "USD", flag: "us" },
  { code: "CA", name: "Canada", currency: "CAD", flag: "ca" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "gb" },
  { code: "DE", name: "Germany", currency: "EUR", flag: "de" },
  { code: "FR", name: "France", currency: "EUR", flag: "fr" },
  { code: "IT", name: "Italy", currency: "EUR", flag: "it" },
  { code: "ES", name: "Spain", currency: "EUR", flag: "es" },
  { code: "NL", name: "Netherlands", currency: "EUR", flag: "nl" },
  { code: "CH", name: "Switzerland", currency: "CHF", flag: "ch" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", flag: "ae" },
  { code: "JP", name: "Japan", currency: "JPY", flag: "jp" },
  { code: "AU", name: "Australia", currency: "AUD", flag: "au" },
  { code: "NZ", name: "New Zealand", currency: "NZD", flag: "nz" },
];

interface AccountInfoProps {
  user: User;
}

export default function AccountInfo({ user }: AccountInfoProps) {
  const [avatarPreview, setAvatarPreview] = useState(
    user.avatar || "/assets/images/common/profile.jpeg"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  // Location selector state
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);

  // Currency selector state
  const [selectedCurrency, setSelectedCurrency] = useState<
    (typeof COUNTRY_CURRENCY_MAP)[0] | null
  >(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
    email: user.email,
    dob: "",
    gender: (user.gender || "male").toLowerCase(),
    phone: user.phone || "",
    country_code: user.country_code || "",
    language: user.language || "",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    country: "Country/Region",
    is_marketing_emails: false,
    is_marketing_sms: false,
  });

  // Format date from ISO string to YYYY-MM-DD
  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const profile = await getUserProfile(String(user.id));
      if (profile) {
        // Get the default address from the profile
        const defaultAddress = profile.defaultAddress;

        console.log("Profile data:", profile);
        console.log("Default address:", defaultAddress);

        // Resolve location objects from string names
        let resolvedCountry: ICountry | null = null;
        let resolvedState: IState | null = null;
        let resolvedCity: ICity | null = null;

        if (defaultAddress?.country) {
          const allCountries = Country.getAllCountries();
          resolvedCountry =
            allCountries.find((c) => c.name === defaultAddress.country) || null;

          if (resolvedCountry && defaultAddress?.state) {
            const countryStates = State.getStatesOfCountry(
              resolvedCountry.isoCode
            );
            resolvedState =
              countryStates.find((s) => s.name === defaultAddress.state) ||
              null;

            if (resolvedState && defaultAddress?.city) {
              const stateCities = City.getCitiesOfState(
                resolvedCountry.isoCode,
                resolvedState.isoCode
              );
              resolvedCity =
                stateCities.find((c) => c.name === defaultAddress.city) || null;
            }
          }
        }

        // Set the resolved location objects
        setSelectedCountry(resolvedCountry);
        setSelectedState(resolvedState);
        setSelectedCity(resolvedCity);

        // Update form data with profile information
        setFormData({
          fullName: `${profile.first_name} ${profile.last_name}`.trim(),
          email: profile.email,
          dob: formatDate(profile.dob || ""),
          gender: profile.gender.toLowerCase(),
          phone: profile.phone || "",
          country_code: profile.country_code || "",
          language: profile.language || "",
          address: defaultAddress?.address_line_1 || "",
          addressLine2: defaultAddress?.address_line_2 || "",
          city: defaultAddress?.city || "",
          state: defaultAddress?.state || "",
          zip: defaultAddress?.zip_code || "",
          country: defaultAddress?.country || "Country/Region",
          is_marketing_emails: profile.is_marketing_emails,
          is_marketing_sms: profile.is_marketing_sms,
        });
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [user.id]);

  // Initialize currency on component mount
  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        // First check if we have saved currency data
        const savedCurrencyData = getSelectedCurrencyData();
        if (savedCurrencyData) {
          // Find the matching country from our map
          const matchingCountry = COUNTRY_CURRENCY_MAP.find(
            (country) => country.currency === savedCurrencyData.currency
          );
          if (matchingCountry) {
            setSelectedCurrency(matchingCountry);
            return;
          }
        }

        // Otherwise check pricing context
        const context = getPricingContext();
        if (context && context.userCurrency) {
          const detectedCountry = COUNTRY_CURRENCY_MAP.find(
            (country) => country.currency === context.userCurrency
          );
          if (detectedCountry) {
            setSelectedCurrency(detectedCountry);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to initialize currency:", error);
      }

      // Default to India
      setSelectedCurrency(COUNTRY_CURRENCY_MAP[0]);
    };

    initializeCurrency();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Location selector handlers
  const handleCountryChange = (country: ICountry | null) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setFormData((prev) => ({
      ...prev,
      country: country?.name || "",
      state: "",
      city: "",
    }));
  };

  const handleStateChange = (state: IState | null) => {
    setSelectedState(state);
    setSelectedCity(null);
    setFormData((prev) => ({
      ...prev,
      state: state?.name || "",
      city: "",
    }));
  };

  const handleCityChange = (city: ICity | null) => {
    setSelectedCity(city);
    setFormData((prev) => ({
      ...prev,
      city: city?.name || "",
    }));
  };

  // Handle currency selection
  const handleCurrencySelect = async (
    country: (typeof COUNTRY_CURRENCY_MAP)[0]
  ) => {
    try {
      // Check if the currency is supported
      if (!isValidCurrency(country.currency)) {
        console.warn(`Currency ${country.currency} not supported`);
        return;
      }

      // Update selected currency
      setSelectedCurrency(country);
      setShowCurrencyDropdown(false);

      // Update pricing context
      setPricingContext(country.name, country.currency);

      // Save currency conversion data to localStorage
      await saveSelectedCurrencyData(country.currency);

      // Force refresh of all PriceDisplay components
      window.dispatchEvent(
        new CustomEvent("currencyChanged", {
          detail: {
            currency: country.currency,
            country: country.code,
          },
        })
      );

      // Reload page immediately to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Failed to update currency:", error);
      alert("Failed to update currency. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.id) {
      return;
    }

    // Split full name into first and last name
    const nameParts = formData.fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const profileUpdateData: {
      first_name: string;
      last_name: string;
      email: string;
      language: string;
      country_code: string;
      phone: string;
      dob: string;
      gender: "male" | "female" | "other";
      is_marketing_emails: boolean;
      is_marketing_sms: boolean;
      address?: DefaultAddressPayload;
    } = {
      first_name: firstName,
      last_name: lastName,
      email: formData.email,
      language: formData.language,
      country_code: formData.country_code,
      phone: formData.phone,
      dob: formData.dob,
      gender: formData.gender as "male" | "female" | "other",
      is_marketing_emails: formData.is_marketing_emails,
      is_marketing_sms: formData.is_marketing_sms,
    };

    // Add address data in the new format if address is provided
    if (formData.address) {
      // Get country code and ISO from selected country
      const countryCode = selectedCountry?.phonecode
        ? `+${selectedCountry.phonecode}`
        : "";
      const countryCodeIso = selectedCountry?.isoCode || "";

      profileUpdateData.address = {
        address_name: "Default Address",
        country: formData.country,
        country_code: countryCode,
        country_code_iso: countryCodeIso,
        first_name: firstName,
        last_name: lastName,
        address_line_1: formData.address,
        address_line_2: formData.addressLine2,
        company: "N/A",
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip,
      };
    }

    // Update the profile with address data included
    const profileSuccess = await updateUserProfile(
      String(user.id),
      profileUpdateData
    );

    // Refresh the profile data if update was successful
    if (profileSuccess) {
      const updatedProfile = await getUserProfile(String(user.id));
      if (updatedProfile) {
        // Get the default address from the updated profile
        const defaultAddress = updatedProfile.defaultAddress;

        // Resolve location objects from string names after update
        let resolvedCountry: ICountry | null = null;
        let resolvedState: IState | null = null;
        let resolvedCity: ICity | null = null;

        if (defaultAddress?.country) {
          const allCountries = Country.getAllCountries();
          resolvedCountry =
            allCountries.find((c) => c.name === defaultAddress.country) || null;

          if (resolvedCountry && defaultAddress?.state) {
            const countryStates = State.getStatesOfCountry(
              resolvedCountry.isoCode
            );
            resolvedState =
              countryStates.find((s) => s.name === defaultAddress.state) ||
              null;

            if (resolvedState && defaultAddress?.city) {
              const stateCities = City.getCitiesOfState(
                resolvedCountry.isoCode,
                resolvedState.isoCode
              );
              resolvedCity =
                stateCities.find((c) => c.name === defaultAddress.city) || null;
            }
          }
        }

        // Set the resolved location objects
        setSelectedCountry(resolvedCountry);
        setSelectedState(resolvedState);
        setSelectedCity(resolvedCity);

        // Update form data with profile information
        setFormData({
          fullName:
            `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim(),
          email: updatedProfile.email,
          dob: formatDate(updatedProfile.dob || ""),
          gender: updatedProfile.gender.toLowerCase(),
          phone: updatedProfile.phone || "",
          country_code: updatedProfile.country_code || "",
          language: updatedProfile.language || "",
          address: defaultAddress?.address_line_1 || "",
          addressLine2: defaultAddress?.address_line_2 || "",
          city: defaultAddress?.city || "",
          state: defaultAddress?.state || "",
          zip: defaultAddress?.zip_code || "",
          country: defaultAddress?.country || "Country/Region",
          is_marketing_emails: updatedProfile.is_marketing_emails,
          is_marketing_sms: updatedProfile.is_marketing_sms,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p>Loading profile information...</p>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/css/flag-icons.min.css"
      />
      <div className="max-w-4xl mx-auto px-0 md:px-4">
        <h1 className=" md:heading-2-semibold title-1 text-center md:text-left text-black mb-6 md:mb-8">
          Account information
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
            {/* Profile Photo Section */}
            <div className="relative w-24 h-24 mb-5 md:mr-8">
              <div className="w-full h-full rounded-full overflow-hidden border border-gray-70 relative">
                <Image
                  src={avatarPreview}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute bottom-1 right-1 bg-white text-blue-00 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer z-10 border border-gray-70"
              >
                <FontAwesomeIcon icon={faPencilAlt} className="h-2.5 w-2.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="profile-image-upload"
              />
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-15-semibold mb-2"
                >
                  Full name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00"
                  placeholder="Full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-15-semibold mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-blue-00"
                    />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full p-3 pl-10 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex gap-4">
                <div className="dob w-1/2">
                  <label htmlFor="dob" className="block text-15-semibold mb-2">
                    Date of birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faCalendarDays}
                        className="text-blue-00"
                      />
                    </div>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00"
                    />
                  </div>
                </div>

                <div className="gender w-1/2">
                  <label
                    htmlFor="gender"
                    className="block text-15-semibold mb-2"
                  >
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleSelectChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00 appearance-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-blue-00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <label className="block text-15-semibold mb-2">Address</label>

                {/* Country and State in one row on big screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <LocationSelector
                    selectedCountry={selectedCountry}
                    selectedState={selectedState}
                    selectedCity={selectedCity}
                    onCountryChange={handleCountryChange}
                    onStateChange={handleStateChange}
                    onCityChange={handleCityChange}
                    countryPlaceholder="Country/Region"
                    inputClassName="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00 appearance-none"
                    showCountry={true}
                    showState={false}
                    showCity={false}
                  />

                  <LocationSelector
                    selectedCountry={selectedCountry}
                    selectedState={selectedState}
                    selectedCity={selectedCity}
                    onCountryChange={handleCountryChange}
                    onStateChange={handleStateChange}
                    onCityChange={handleCityChange}
                    statePlaceholder="Select A State"
                    inputClassName="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00 appearance-none"
                    showCountry={false}
                    showState={true}
                    showCity={false}
                  />
                </div>

                {/* Address Line 1 */}
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00 mb-3"
                  placeholder="Address"
                />

                {/* Address Line 2 */}
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00 mb-3"
                  placeholder="Apartment, suite, etc. (optional)"
                />

                {/* City and PIN Code in second row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LocationSelector
                    selectedCountry={selectedCountry}
                    selectedState={selectedState}
                    selectedCity={selectedCity}
                    onCountryChange={handleCountryChange}
                    onStateChange={handleStateChange}
                    onCityChange={handleCityChange}
                    cityPlaceholder="Select A City"
                    inputClassName="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00 appearance-none"
                    showCountry={false}
                    showState={false}
                    showCity={true}
                  />

                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00"
                    placeholder="PIN Code"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-15-semibold mb-2">
                  Phone number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faPhone} className="text-blue-00" />
                  </div>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-15-semibold mb-2">
                  Currency Preference
                </label>
                <div className="relative" ref={currencyDropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                    className="w-full p-3 border border-gray-300 rounded-md text-blue-00 focus:outline-none focus:border-blue-00 appearance-none flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {selectedCurrency && (
                        <>
                          <span
                            className={`fi fi-${selectedCurrency.flag} w-5 h-5 rounded-full mr-3`}
                            style={{ backgroundSize: "cover" }}
                          ></span>
                          <span>
                            {selectedCurrency.currency} -{" "}
                            {selectedCurrency.name}
                          </span>
                        </>
                      )}
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="text-blue-00"
                    />
                  </button>

                  {showCurrencyDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                      {COUNTRY_CURRENCY_MAP.filter((country) =>
                        isValidCurrency(country.currency)
                      ).map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCurrencySelect(country)}
                          className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left ${
                            selectedCurrency?.code === country.code
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <span
                            className={`fi fi-${country.flag} w-5 h-5 rounded-full mr-3`}
                            style={{ backgroundSize: "cover" }}
                          ></span>
                          <div className="flex-1">
                            <span className="font-medium">
                              {country.currency}
                            </span>
                            <span className="text-gray-500 ml-2">
                              {country.name}
                            </span>
                          </div>
                          {selectedCurrency?.code === country.code && (
                            <svg
                              className="w-5 h-5 text-blue-00"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-blue-00 text-white py-3 px-8 rounded-md text-15-semibold hover:bg-blue-10 transition-colors"
                >
                  Update Account
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
