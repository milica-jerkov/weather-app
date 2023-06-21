import { fetchWeather, getCityDataByCords, fetchWeathercode, fetchLocations } from './api.js';
import { createElement, formatDate } from './utils.js';

const wrapper = document.querySelector('#wrapper');
const dropdown = document.querySelector('#dropdown');
const searchQuery = document.querySelector('#searchQuery');
const currentLocation = document.querySelector('#currentLocation');
const weatherContainer = document.querySelector('#weatherContainer');
const gradientBox = document.querySelector('#gradientBox');
const searchButton = document.querySelector('#searchButton');

const SEOUL = ['37.5665', '126.9780'];
const OYMYAKON = ['63.4648', '142.7737'];
const DOHA = ['25.2854', '51.5310'];

renderCities([SEOUL, OYMYAKON, DOHA]);

async function renderCities(citiesArray) {
    for (const city of citiesArray) {
        const lat = city[0];
        const long = city[1];
        const weatherData = await fetchWeather(lat, long);
        const cityData = await getCityDataByCords(lat, long);
        const code = await fetchWeathercode(weatherData.current_weather.weathercode);
        const name = cityData ? (cityData[0].components.city || cityData[0].components.village) + ', ' + cityData[0].components.country : null;
        const temp = `${Math.round(weatherData.current_weather.temperature)} °C`;
        const cardEl = createElement('div', 'card');
        const cityEl = createElement('p', 'city-name', name);
        const tempEl = createElement('div', 'city-temp', temp);
        const iconEl = createElement('img', 'city-icon', null, { src: code.path });
        const descEl = createElement('p', 'city-desc', code.description);
        cardEl.appendChild(iconEl);
        cardEl.appendChild(descEl);
        if (name) {
            cardEl.appendChild(cityEl);
        }
        cardEl.appendChild(tempEl);
        document.querySelector('.cards').appendChild(cardEl);
    }
};

const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        currentLocation.innerHTML = "Geolocation is not supported by this browser."
    }
};

const showPosition = async (position) => {
    try {
        const location = await getCityDataByCords(position.coords.latitude, position.coords.longitude) || [];
        const weather = await fetchWeather(position.coords.latitude, position.coords.longitude);
        renderCurrentLocation(location, weather);
    } catch (error) {
        console.log('Failed to retrieve current location and weather data');
    }
};

getLocation();

const renderCurrentLocation = async (location, weather) => {
    try {
        const city = location.length !== 0 ? location[0].components.city || location[0].components.village : 'We could not retrieve the name of the location where you are currently located.';
        const country = location[0].components.country;
        const cityCountry = city + ', ' + country;
        const temperature = `${Math.round(weather.current_weather.temperature)} °C`;
        const weathercode = weather.current_weather.weathercode;
        const date = formatDate(weather.current_weather.time);
        const icon = await fetchWeathercode(weathercode);
        const min = Math.round(weather.daily.temperature_2m_min[0]);
        const max = Math.round(weather.daily.temperature_2m_max[0]);

        const locationDetails = createElement('div', 'location-details');
        const cityEl = createElement('p', 'current-location-name', cityCountry);
        const temperatureEl = createElement('p', 'location-temperature', temperature);
        const dateEl = createElement('p', 'location-date', `${date.date}`);
        const iconEl = createElement('img', 'location-icon', null, { src: icon.path });
        console.log(icon);

        locationDetails.appendChild(dateEl);
        locationDetails.appendChild(cityEl);
        locationDetails.appendChild(temperatureEl);
        currentLocation.appendChild(iconEl);
        currentLocation.appendChild(locationDetails);
        currentLocation.style.display = 'flex';

        setGradient(min, max);

    } catch (error) {
        console.log(error);
        throw new Error('Failed to render current location and weather data');
    }
}

const renderDropdown = (locations) => {
    dropdown.innerHTML = '';
    locations.results.forEach((location) => {
      const option = createElement('div', 'dropdown-option');
      const countryCode = location.country_code.toLowerCase();
      const formattedLocation = location.name + ', ' + location.country;
      const formattedLocationEl = createElement('div', 'dropdown-el', formattedLocation);
      const flag = createElement('img', 'flag', null, { src: `https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg` });
  
      option.addEventListener('click', async () => {
        try {
          const data = await fetchWeather(location.latitude, location.longitude);
          renderCurrentWeather(data);
          searchQuery.value = option.textContent;
        } catch (error) {
          throw new Error('This is an error!!!!!!!!!');
        }
      });
      option.addEventListener('mouseover', () => {
        searchQuery.value = option.textContent;
      });
      option.appendChild(formattedLocationEl);
      option.appendChild(flag);
      dropdown.appendChild(option);
  
    });
  };

 const renderCurrentWeather = (data) => {
    const currentWeather = createElement('div', 'current-weather', null);
    const forecastContainer = createElement('div', 'forecast-container', null);
    
    while (weatherContainer.firstChild) {
      weatherContainer.removeChild(weatherContainer.firstChild);
    }
  
    const min = Math.round(data.daily.temperature_2m_min[0]);
    const max = Math.round(data.daily.temperature_2m_max[0]);
  
    setGradient(min, max);
  
    const temp = `${Math.round(data.current_weather.temperature)} °C`;
    const tempEl = createElement('p', 'curr-temp', temp, {});
    const date = formatDate(data.current_weather.time);
    const dateEl = createElement('p', 'curr', date.date);
    currentWeather.appendChild(dateEl);
    currentWeather.appendChild(tempEl);
    weatherContainer.appendChild(currentWeather);
    weatherContainer.appendChild(forecastContainer);
  
    data.daily.time.map((day, index) => {
      const avgTemp = `${Math.round((data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2)} °C`;
      const formattedDate = formatDate(data.daily.time[index], true);
      const dayOfWeek = formattedDate.day;
      const date = formattedDate.date;
      const min = `${Math.round(data.daily.temperature_2m_min[index])} °C`;
      const max = `${Math.round(data.daily.temperature_2m_max[index])} °C`;
  
      const dayEl = createElement('p', 'forecast-day', dayOfWeek);
      const dateEl = createElement('p', 'forecast-date', date);
      const forecastCard = createElement('div', 'forecastCard');
      const avgEl = createElement('p', 'avg', avgTemp);
      const minEl = createElement('p', 'min', ('Min: ' + min));
      const maxEl = createElement('p', 'max', ('Max: ' + max));
  
      forecastCard.appendChild(dateEl);
      forecastCard.appendChild(dayEl);
      forecastCard.appendChild(avgEl);
      forecastCard.appendChild(maxEl);
      forecastCard.appendChild(minEl);
      forecastContainer.appendChild(forecastCard);
    })
  } 

searchQuery.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
        const location = await fetchLocations(searchQuery.value);
        const weather = await fetchWeather(location.results[0].latitude, location.results[0].longitude);
        renderCurrentWeather(weather);
        dropdown.style.display = 'none';
    }
    if (searchQuery.value.length >= 2) {
        const location = await fetchLocations(searchQuery.value);
        const results = location ? location : null;
        renderDropdown(results);
    }
});

searchButton.addEventListener('click', async () => {
    const location = await fetchLocations(searchQuery.value);
    const weather = await fetchWeather(location.results[0].latitude, location.results[0].longitude);
    renderCurrentWeather(weather);
    dropdown.style.display = 'none';
});

searchQuery.addEventListener('focus', () => {
    setTimeout(() => {
      dropdown.style.display = 'block';
    }, 200);
  });
  
  searchQuery.addEventListener('blur', () => {
    setTimeout(() => {
      dropdown.style.display = 'none';
    }, 200);
  });

const setGradient = (min, max, box) => {
    const color1 = chroma('#162E76');
    const color2 = chroma('#83D3FE');
    const color3 = chroma('#F6D576');
    const color4 = chroma('#F99456');

    const gradient1 = chroma.scale([color1, color2]).colors(40);
    const gradient2 = chroma.scale([color2, color3]).colors(20);
    const gradient3 = chroma.scale([color3, color4]).colors(20);

    const gradient = [...gradient1, ...gradient2, ...gradient3];
    const start = Math.floor(gradient.length / 2);

    wrapper.style.backgroundImage = `linear-gradient(142deg, ${gradient[start + min]} 0%, ${gradient[start + max]} 100%)`;

    box ? box.style.backgroundImage = `linear-gradient(to right, ${gradient1[0]} 0%, ${gradient1[gradient1.length - 1]} 50%, 
      ${gradient2[0]} 50%, ${gradient2[gradient2.length - 1]} 75%, 
      ${gradient3[0]} 75%, ${gradient3[gradient3.length - 1]} 100%)` : null;
}

setGradient(-40, 39);
setGradient(-40, 39, gradientBox);