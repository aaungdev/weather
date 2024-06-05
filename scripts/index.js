"use strict";

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

});
