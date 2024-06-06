"use strict";

let map;
let marker;
let currentPage = 0; // 0 for the first week, 1 for next week, -1 for previous week
const daysPerPage = 7;
let forecastData = [];

function loadGoogleMapsApi() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBOshfecc2t88jhluv1OtvPuGN9bYpaVYo&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 39.8283, lng: -98.5795 }, // Center of the USA
    zoom: 4,
  });
  marker = new google.maps.Marker({
    map: map,
  });

  const citySelect = document.getElementById("citySelect");
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(city);
    option.textContent = city.name;
    citySelect.appendChild(option);
  });

  citySelect.addEventListener("change", async (event) => {
    const selectedCity = JSON.parse(event.target.value);
    if (selectedCity) {
      const { latitude, longitude } = selectedCity;
      const stationLookupUrl = `https://api.weather.gov/points/${latitude},${longitude}`;

      try {
        const response = await fetch(stationLookupUrl);
        const data = await response.json();
        const forecastUrl = data.properties.forecast;
        console.log("Forecast URL:", forecastUrl); // Debugging
        await getWeather(forecastUrl);
        updateMap(latitude, longitude);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }
  });

  document.getElementById("prevPage").addEventListener("click", () => {
    currentPage = Math.max(currentPage - 1, 0);
    displayWeather(forecastData);
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    // if ((currentPage + 1) * daysPerPage < forecastData.length) {
      currentPage++;
      displayWeather(forecastData);
    // }
  });
}

function updateMap(latitude, longitude) {
  const location = { lat: latitude, lng: longitude };
  map.setCenter(location);
  marker.setPosition(location);
}

async function getWeather(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    forecastData = filterForecast(data.properties.periods); // Store filtered forecast data
    console.log("Filtered Forecast Data:", forecastData); // Debugging
    currentPage = 0; // Reset to the first page
    displayWeather(forecastData);
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// Function to filter forecast data to get one entry per day
function filterForecast(forecastArray) {
  const filteredArray = [];
  const seenDates = new Set();

  for (const period of forecastArray) {
    const date = new Date(period.startTime).toLocaleDateString();
    if (!seenDates.has(date)) {
      seenDates.add(date);
      filteredArray.push(period);
    }
  }

  return filteredArray;
}

function getWeatherImage(description) {
  if (description.toLowerCase().includes("thunderstorm"))
    return "images/thunderstorm.png";
  if (description.toLowerCase().includes("rain")) return "images/rain.png";
  if (description.toLowerCase().includes("snow")) return "images/snow.png";
  if (description.toLowerCase().includes("cloud")) return "images/cloud.png";
  if (
    description.toLowerCase().includes("sun") ||
    description.toLowerCase().includes("clear")
  )
    return "images/sun.png";
  return "images/default.png";
}

function displayWeather(forecastArray) {
  const weatherForecast = document.getElementById("weatherForecast");
  weatherForecast.innerHTML = "";

  const forecastContainer = document.createElement("div");
  forecastContainer.classList.add("forecastContainer");

  // Calculate the start and end indices based on the current page
  const start = currentPage * daysPerPage;
  const end = Math.min(start + daysPerPage, forecastArray.length);

  // Ensure the indices are within the bounds of the forecast array
  const currentForecast = forecastArray.slice(start, end);

  console.log("Current Page:", currentPage); // Debugging
  console.log("Displaying Forecast:", currentForecast); // Debugging

  currentForecast.forEach((period) => {
    const card = document.createElement("div");
    card.classList.add("forecastCard");

    const date = document.createElement("div");
    date.classList.add("date");
    date.innerText = new Date(period.startTime).toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    card.appendChild(date);

    const icon = document.createElement("img");
    icon.src = getWeatherImage(period.shortForecast);
    card.appendChild(icon);

    const temperature = document.createElement("div");
    temperature.classList.add("temperature");
    temperature.innerText = `${period.temperature} ${period.temperatureUnit}`;
    card.appendChild(temperature);

    const details = document.createElement("div");
    details.classList.add("details");
    details.innerText = `Wind: ${period.windDirection} ${period.windSpeed}\n${period.shortForecast}`;
    card.appendChild(details);

    forecastContainer.appendChild(card);
  });

  weatherForecast.appendChild(forecastContainer);
}

loadGoogleMapsApi();
