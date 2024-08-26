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
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          padding: "20px",
          borderRadius: "10px",
          width: "400px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Select City</h2>
      <input
        type="text"
        value={city}
        onChange={handleInputChange}
        className="border border-gray-600 rounded p-1"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      {loading && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <FaSpinner className="animate-spin" />
        </div>
      )}
      <ul style={{ listStyleType: "none", padding: "0" }}>
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.id}
            onClick={() => handleSelectCity(suggestion)}
            style={{
              padding: "10px",
              cursor: "pointer",
              borderBottom: "1px solid #ccc",
            }}
          >
            {suggestion.name}
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default CityModal;
