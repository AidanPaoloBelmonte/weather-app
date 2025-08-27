const weatherAPI =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const key = "43GQQ65K28BCAUG6QME297TQD";

async function fetchWeatherData(city) {
  const response = await fetch(
    `${weatherAPI}${city}?unitGroup=us&key=${key}&contentType=json`,
    {
      method: "GET",
      headers: {},
    },
  );
  const data = await response.json();
}

fetchWeatherData("Tokyo");
