// Major Cities for dropdown
const majorCities = [
  'London', 'New York', 'Tokyo', 'Paris', 'Sydney',
  'Dubai', 'Singapore', 'Hong Kong', 'Berlin', 'Toronto',
  'Madrid', 'Rome', 'Amsterdam', 'Bangkok', 'Istanbul',
  'Mumbai', 'Bangkok', 'Los Angeles', 'Chicago', 'Houston',
  'Mexico City', 'São Paulo', 'Buenos Aires', 'Cairo', 'Shanghai'
];

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeatherContent = document.getElementById('currentWeatherContent');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const cityList = document.getElementById('cityList');
const forecastContainer = document.getElementById('forecastContainer');

// Populate city datalist
function populateCityList() {
  cityList.innerHTML = majorCities.map(city => `<option value="${city}">`).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  populateCityList();
  // Load weather for London by default
  fetchWeather('London');
});

// Event listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) {
      fetchWeather(city);
    }
  }
});

// Fetch weather data from OpenWeather API
async function fetchWeather(city) {
  try {
    loadingSpinner.style.display = 'block';
    currentWeatherContent.style.display = 'none';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Get coordinates from city name
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );

    if (!geoResponse.ok) throw new Error('City not found');

    const geoData = await geoResponse.json();
    if (geoData.length === 0) throw new Error('City not found');

    const { lat, lon, name, country } = geoData[0];

    // Fetch weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    if (!weatherResponse.ok) throw new Error('Failed to fetch weather data');

    const weatherData = await weatherResponse.json();

    // Fetch forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );

    if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data');

    const forecastData = await forecastResponse.json();

    // Display weather data
    displayCurrentWeather(weatherData, name, country);
    displayForecast(forecastData);
    displayAdditionalInfo(weatherData);

    // Update input value
    cityInput.value = name;

    loadingSpinner.style.display = 'none';
    currentWeatherContent.style.display = 'block';

  } catch (error) {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    errorMessage.textContent = `⚠️ ${error.message}`;
    currentWeatherContent.style.display = 'none';
  }
}

// Display current weather
function displayCurrentWeather(data, cityName, country) {
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const description = data.weather[0].main;
  const icon = getWeatherIcon(data.weather[0].icon);
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const visibility = (data.visibility / 1000).toFixed(1);
  const pressure = data.main.pressure;
  const clouds = data.clouds.all;
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  document.getElementById('cityName').textContent = `${cityName}, ${country}`;
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('temp').textContent = temp;
  document.getElementById('weatherDesc').textContent = description;
  document.getElementById('weatherIcon').src = icon;
  document.getElementById('humidity').textContent = `${humidity}%`;
  document.getElementById('windSpeed').textContent = `${windSpeed.toFixed(1)} m/s`;
  document.getElementById('visibility').textContent = `${visibility} km`;
  document.getElementById('pressure').textContent = `${pressure} mb`;
  document.getElementById('feelsLike').textContent = `${feelsLike}°C`;
  document.getElementById('clouds').textContent = `${clouds}%`;
  document.getElementById('sunrise').textContent = sunrise;
  document.getElementById('sunset').textContent = sunset;
  document.getElementById('rainChance').textContent = `${Math.round(data.clouds.all)}%`;
  document.getElementById('uvIndex').textContent = 'N/A';
}

// Display 5-day forecast
function displayForecast(data) {
  const dailyForecasts = {};

  // Group forecasts by day
  data.list.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toLocaleDateString();

    if (!dailyForecasts[day]) {
      dailyForecasts[day] = forecast;
    }
  });

  forecastContainer.innerHTML = '';

  // Display next 5 days
  Object.keys(dailyForecasts).slice(0, 5).forEach(day => {
    const forecast = dailyForecasts[day];
    const temp = Math.round(forecast.main.temp);
    const description = forecast.weather[0].main;
    const icon = getWeatherIcon(forecast.weather[0].icon);
    const date = new Date(forecast.dt * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const forecastCard = document.createElement('div');
    forecastCard.className = 'forecast-card';
    forecastCard.innerHTML = `
      <div class="date">${date}</div>
      <img src="${icon}" alt="${description}" class="icon" style="width: 50px; height: 50px; filter: brightness(0) invert(1);">
      <div class="temp">${temp}°C</div>
      <div class="desc">${description}</div>
    `;
    forecastContainer.appendChild(forecastCard);
  });
}

// Display additional info
function displayAdditionalInfo(data) {
  // Most of this is already handled in displayCurrentWeather
  // This function is here for extensibility
}

// Get weather icon from OpenWeather
function getWeatherIcon(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}