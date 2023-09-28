const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

function hideloader() {
  loader.style.visibility = "hidden";
  loader.style.width = "0";
  loader.style.transition = "width 0.5s ease";
}

function showloader() {
  loader.style.visibility = "visible";
}

let OriginalTemp;
const API_KEY = "ae728f3d92556cfc08c0f16771f24c98";

let convertedTemperature;
let unitSymbol = "°C";
let temp = [];

function changeTemperatureUnit() {
  const selectedUnit = document.getElementById("temperatureUnit").value;
  if (selectedUnit === "celsius") {
    for (let i = 0; i <= 5; i++) {
      document.getElementById(`temp${i}`).textContent = `Temp: ${temp[
        i
      ].toFixed(2)} °C`;
      // console.log(temp[i])
    }
  } else if (selectedUnit === "fahrenheit") {
    for (let i = 0; i <= 5; i++) {
      document.getElementById(`temp${i}`).textContent = `Temp: ${(
        (temp[i] * 9) / 5 +
        32
      ).toFixed(2)} °F`;
      // console.log(temp[i]*9/5 + 32)
    }
  }
}

const createWeatherCard = (cityName, weatherItem, index) => {
  if (temp.length == 6) temp = [];
  convertedTemperature = weatherItem.main.temp - 273.15;
  temp.push(convertedTemperature);

  loader.style.width = "100%";
  setTimeout(hideloader, 400);
  if (index === 0) {
    return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6 id=temp${
                      temp.length - 1
                    }>Temp: ${convertedTemperature.toFixed(2)}${unitSymbol}</h6>
                    <h6 >Wind: ${weatherItem.wind.speed} m/sec</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
  } else {
    return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6 id=temp${
                      temp.length - 1
                    } >Temp: ${convertedTemperature.toFixed(
      2
    )}${unitSymbol}</h6>
                    <h6>Wind: ${weatherItem.wind.speed} m/sec</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
  }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  const xhr = new XMLHttpRequest();

  xhr.open("GET", WEATHER_API_URL);

  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);

      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    } else {
      alert("An error occurred while fetching the weather forecast!");
    }
  };

  xhr.send();
};

const getCityCoordinates = () => {
  var loader = document.getElementById("loader");
  showloader();
  loader.style.width = "20%";
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  const xhr = new XMLHttpRequest();

  xhr.open("GET", API_URL);

  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      loader.style.width = "50%";
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    } else {
      alert("An error occurred while fetching the coordinates!");
    }
  };

  xhr.send();
};

const getUserCoordinates = () => {
  var loader = document.getElementById("loader");
  showloader();
  loader.style.width = "20%";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

        const xhr = new XMLHttpRequest();

        xhr.open("GET", API_URL);
        loader.style.width = "50%";
        xhr.onload = function () {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const { name } = data[0];
            getWeatherDetails(name, latitude, longitude);
          } else {
            alert("An error occurred while fetching the city name!");
          }
        };
        xhr.send();
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert(
            "Geolocation request denied. Please reset location permission to grant access again."
          );
        } else {
          alert("Geolocation request error. Please reset location permission.");
        }
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);
