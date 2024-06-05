"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const citySelect = document.getElementById("citySelect");
  const weatherForecast = document.getElementById("weatherForecast");

  // Populate the dropdown with cities
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(city);
    option.textContent = city.name;
    citySelect.appendChild(option);
  });

  // Event listener for dropdown change
  citySelect.addEventListener("change", async (event) => {
    const selectedCity = JSON.parse(event.target.value);
    if (selectedCity) {
      const { latitude, longitude } = selectedCity;
      const stationLookupUrl = `https://api.weather.gov/points/${latitude},${longitude}`;

      try {
        const response = await fetch(stationLookupUrl);
        const data = await response.json();
        const forecastUrl = data.properties.forecast;
        getWeather(forecastUrl);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }
  });

  // Function to get weather forecast
  async function getWeather(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      const forecastArray = data.properties.periods;
      displayWeather(forecastArray);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  }

});
