let map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 39.8283, lng: -98.5795 }, // Center of the USA
        zoom: 4
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('citySelect');
    const weatherForecast = document.getElementById('weatherForecast');

    // Populate the dropdown with cities
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

    // Function to update the map location
    function updateMap(latitude, longitude) {
        const location = { lat: latitude, lng: longitude };
        map.setCenter(location);
        new google.maps.Marker({
            position: location,
            map: map
        });
    }
});
