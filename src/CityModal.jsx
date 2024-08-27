import React, { useCallback, useState } from "react";

import { FaSpinner } from "react-icons/fa";
import Modal from "react-modal";
import axios from "axios";
import { debounce } from "lodash";

Modal.setAppElement("#root");

const CityModal = ({ isOpen, onRequestClose, onSelectCity }) => {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (query) => {
    setLoading(true);
    const response = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${query}`
    );
    const results = response.data.results || [];
    const uniqueResults = Array.from(
      new Set(results.map((result) => result.name))
    ).map((name) => results.find((result) => result.name === name));
    setSuggestions(uniqueResults);
    setLoading(false);
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 500),
    []
  );

  const handleInputChange = (e) => {
    setCity(e.target.value);
    debouncedFetchSuggestions(e.target.value);
  };

  const handleSelectCity = (city) => {
    const cityData = {
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    };
    onSelectCity(cityData);
    setCity("");
    setSuggestions([]);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-md sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <h2 className="text-center mb-5">Select City</h2>
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          className="border border-gray-600 rounded p-2 w-full mb-3"
        />
        {loading && (
          <div className="text-center mb-3">
            <FaSpinner className="animate-spin" />
          </div>
        )}
        <ul className="list-none p-0">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelectCity(suggestion)}
              className="p-2 cursor-pointer border-b border-gray-300"
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default CityModal;
