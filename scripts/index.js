let map;
let marker;

function loadGoogleMapsApi() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBOshfecc2t88jhluv1OtvPuGN9bYpaVYo&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 39.8283, lng: -98.5795 }, // Center of the USA
        zoom: 4
    });
    marker = new google.maps.Marker({
        map: map
    });

    // Populate the dropdown with cities
    const citySelect = document.getElementById('citySelect');
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = JSON.stringify(city);
        option.textContent = city.name;
        citySelect.appendChild(option);
    });

    // Event listener for dropdown change
    citySelect.addEventListener('change', async (event) => {
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
                console.error('Error fetching weather data:', error);
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
        const forecastArray = data.properties.periods;
        displayWeather(forecastArray);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

// Function to display weather forecast
function displayWeather(forecastArray) {
    const weatherForecast = document.getElementById('weatherForecast');
    weatherForecast.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Period</th>
                    <th>Temperature</th>
                    <th>Winds</th>
                    <th>Forecast</th>
                </tr>
            </thead>
            <tbody>
                ${forecastArray.map(period => `
                    <tr>
                        <td>${period.name}</td>
                        <td>${period.temperature} ${period.temperatureUnit}</td>
                        <td>${period.windDirection} ${period.windSpeed} mph</td>
                        <td>${period.shortForecast}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load the Google Maps API
loadGoogleMapsApi();
