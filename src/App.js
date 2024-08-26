import "./App.css";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";

import CityModal from "./CityModal";
import { Line } from "react-chartjs-2";
import Modal from "react-modal";
import axios from "axios";
import responseExample from "./responseExample.json";
import weatherCodes from "./weatherCodes.json";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

Modal.setAppElement("#root");

function App() {
  const storedCity = JSON.parse(localStorage.getItem("city")) || {};
  const [city, setCity] = useState(storedCity.name || "");
  const [weatherData, setWeatherData] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(!city);

  useEffect(() => {
    if (city) {
      fetchWeatherData(storedCity);
      fetchCurrentWeather(storedCity);
    }
  }, [city]);

  const fetchCurrentWeather = async (cityData) => {
    await axios
      .get(
        `https://api.open-meteo.com/v1/forecast?latitude=${cityData.latitude}&longitude=${cityData.longitude}&current=temperature_2m,precipitation,weather_code&timezone=auto`
      )
      .then((response) => {
        setCurrentWeather(response.data.current);
      });
  };

  const fetchWeatherData = async (cityData) => {
    await axios
      .get(
        `https://api.open-meteo.com/v1/forecast?latitude=${cityData.latitude}&longitude=${cityData.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
      )
      .then((response) => {
        setWeatherData(response.data);
      });
  };

  const handleSelectCity = (selectedCity) => {
    localStorage.setItem("city", JSON.stringify(selectedCity));
    setCity(selectedCity.name);
  };

  const chartData = {
    labels: weatherData
      ? weatherData.daily.time.map((date) =>
          new Date(date).toLocaleDateString("hu-HU", { weekday: "long" })
        )
      : [],
    datasets: [
      {
        label: "Maximális hőmérséklet",
        data: weatherData ? weatherData.daily.temperature_2m_max : [],
        fill: false,
        backgroundColor: "rgba(255,255,255,0.4)",
        borderColor: "rgba(255,255,255,1)",
        cubicInterpolationMode: "monotone",
      },
    ],
  };

  const isSmallWindow = () => window.innerWidth <= 480;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !isSmallWindow(),
      },
    },
    scales: {
      x: {
        display: !isSmallWindow(),
      },
    },
  };

  return (
    <div className="App">
      <div className="weather-layout">
        {currentWeather && (
          <div className="current-weather">
            <h2 onClick={() => setIsModalOpen(true)}>{city}</h2>
            <h4 className="text-4xl"> {currentWeather.temperature_2m}°C</h4>
            <p>{weatherCodes[currentWeather.weather_code].description}</p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm"
              onClick={() => setIsModalOpen(true)}
            >
              Város kiválasztása
            </button>
          </div>
        )}
        {weatherData && (
          <div className="forecast-container">
            <table className="weather-table">
              <thead>
                <tr>
                  <th className="px-4 py-2">Nap</th>
                  <th className="px-4 py-2">Időjárás</th>
                  <th className="px-4 py-2">Min/Max Hőmérséklet</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.daily.time.slice(0, 7).map((date, index) => (
                  <tr key={date}>
                    <td className="border px-4 py-2">
                      {new Date(date).toLocaleDateString("hu-HU", {
                        weekday: "long",
                      })}
                    </td>
                    <td className="border px-4 py-2">
                      <i
                        className={`${
                          weatherCodes[weatherData.daily.weather_code[index]]
                            .icon
                        } h-10 w-10 text-2xl`}
                      ></i>
                      {weatherData.daily.precipitation_probability_max[index]}%
                    </td>
                    <td className="border px-4 py-2">
                      {weatherData.daily.temperature_2m_min[index]}°C /{" "}
                      {weatherData.daily.temperature_2m_max[index]}°C
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
      <CityModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSelectCity={handleSelectCity}
      />
      <div className="signature">Palkuc Richard</div>
    </div>
  );
}

export default App;
