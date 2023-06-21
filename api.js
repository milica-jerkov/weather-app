export const fetchWeather = async (lat, long) => {
    try {
      if (!lat || !long) {
        return null;
      }
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('The data could not be retrieved at this time. Please try again later.!');
      return null;
    }
  };
  
  export const getCityDataByCords = async (lat, long) => {
    //b8812b7aa84741ef89c93757e38d59f8
    const API_KEY = 'e129b6ea22254569b357342e61450b68';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${long}&key=${API_KEY}&language=en&pretty=1`;
    try {
      const response = await fetch(url);
      if (response.status === 402) {
        const errorData = await response.json();
        const errorMessage = errorData.status.message;
        console.log(errorMessage);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data.results;
    }
    catch (error) {
      console.log(error.message);
      throw new Error('The data could not be retrieved at this time. Please try again later.!');
    }
  }
  
  export const fetchWeathercode = async (i) => {
    try {
      const url = './weathercode.json';
      const response = await fetch(url);
      const data = await response.json();
      return data[i];
    } catch (error) {
      console.error('The data could not be retrieved at this time. Please try again later.!');
    }
  };
  
  export const fetchLocations = async (searchQuery) => {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      await fetchWeather(data.results[0].latitude, data.results[0].longitude);
      return data;
    } catch (error) {
      throw new Error('The data could not be retrieved at this time. Please try again later.!');
    }
  };