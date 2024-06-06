let map;
let marker;

function loadGoogleMapsApi() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBOshfecc2t88jhluv1OtvPuGN9bYpaVYo&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initMap() {
  // Initialize the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 39.8283, lng: -98.5795 }, // Center of the USA
    zoom: 4,
  });
  marker = new google.maps.Marker({
    map: map,
  });

  // Populate the dropdown with cities
  const citySelect = document.getElementById("citySelect");
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
        updateMap(latitude, longitude);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }
  });
}

// Function to update the map location
function updateMap(latitude, longitude) {
  const location = { lat: latitude, lng: longitude };
  map.setCenter(location);
  marker.setPosition(location);
}

// Function to get weather forecast
async function getWeather(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const forecastArray = data.properties.periods.slice(0, 7); // Limit to 7 days
    displayWeather(forecastArray);
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// Function to get image based on weather description
function getWeatherImage(description) {
  if (description.toLowerCase().includes("thunderstorm")) return "images/thunderstorm.png";
  if (description.toLowerCase().includes("rain")) return "images/rain.png";
  if (description.toLowerCase().includes("snow")) return "images/snow.png";
  if (description.toLowerCase().includes("cloud")) return "images/cloud.png";
  if (description.toLowerCase().includes("sun") || description.toLowerCase().includes("clear")) return "images/sun.png";
  return "images/default.png"; // Default image if no match
}

// Function to display weather forecast
function displayWeather(forecastArray) {
  const weatherForecast = document.getElementById("weatherForecast");
  weatherForecast.innerHTML = ""; // Clear previous content

  const forecastContainer = document.createElement("div");
  forecastContainer.classList.add("forecastContainer");

  forecastArray.forEach((period) => {
    const card = document.createElement("div");
    card.classList.add("forecastCard");

    const date = document.createElement("div");
    date.classList.add("date");
    date.innerText = new Date(period.startTime).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
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
    details.innerText = `Wind: ${period.windDirection} ${period.windSpeed} mph\n${period.shortForecast}`;
    card.appendChild(details);

    forecastContainer.appendChild(card);
  });

  weatherForecast.appendChild(forecastContainer);
}

// Load the Google Maps API
loadGoogleMapsApi();
