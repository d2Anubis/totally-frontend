"use client";

import { useState, useEffect } from "react";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface LocationSelectorProps {
  selectedCountry?: ICountry | null;
  selectedState?: IState | null;
  selectedCity?: ICity | null;
  onCountryChange?: (country: ICountry | null) => void;
  onStateChange?: (state: IState | null) => void;
  onCityChange?: (city: ICity | null) => void;
  showCountry?: boolean;
  showState?: boolean;
  showCity?: boolean;
  countryPlaceholder?: string;
  statePlaceholder?: string;
  cityPlaceholder?: string;
  inputClassName?: string;
  required?: boolean;
}

const LocationSelector = ({
  selectedCountry,
  selectedState,
  selectedCity,
  onCountryChange,
  onStateChange,
  onCityChange,
  showCountry = true,
  showState = true,
  showCity = true,
  countryPlaceholder = "Select Country",
  statePlaceholder = "Select State",
  cityPlaceholder = "Select City",
  inputClassName = "w-full border border-gray-40 rounded-md p-3 body-semibold md:title-2-semibold focus:outline-none focus:border-blue-00 appearance-none",
  required = false,
}: LocationSelectorProps) => {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  // Load countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);
    } else {
      setStates([]);
    }
    setCities([]);
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const country = countries.find((c) => c.isoCode === countryCode) || null;
    onCountryChange?.(country);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    const state = states.find((s) => s.isoCode === stateCode) || null;
    onStateChange?.(state);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    const city = cities.find((c) => c.name === cityName) || null;
    onCityChange?.(city);
  };

  return (
    <>
      {/* Country Selector */}
      {showCountry && (
        <div className="relative">
          <select
            value={selectedCountry?.isoCode || ""}
            onChange={handleCountryChange}
            className={inputClassName}
            required={required}
          >
            <option value="">{countryPlaceholder}</option>
            {countries.map((country) => (
              <option key={country.isoCode} value={country.isoCode}>
                {country.name}
              </option>
            ))}
          </select>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-40 pointer-events-none"
          />
        </div>
      )}

      {/* State Selector */}
      {showState && (
        <div className="relative">
          <select
            value={selectedState?.isoCode || ""}
            onChange={handleStateChange}
            className={inputClassName}
            disabled={!selectedCountry}
            required={required}
          >
            <option value="">{statePlaceholder}</option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-40 pointer-events-none"
          />
        </div>
      )}

      {/* City Selector */}
      {showCity && (
        <div className="relative">
          <select
            value={selectedCity?.name || ""}
            onChange={handleCityChange}
            className={inputClassName}
            disabled={!selectedState}
            required={required}
          >
            <option value="">{cityPlaceholder}</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-40 pointer-events-none"
          />
        </div>
      )}
    </>
  );
};

export default LocationSelector;
