import "../styles/style.css";

const weatherAPI =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const key = "43GQQ65K28BCAUG6QME297TQD";

const locationText = document.querySelector("#location > h2");
const dateText = document.querySelector("#date");
const timeText = document.querySelector("#time");
const tempRealText = document.querySelector("#temp-real");
const tempUnitText = document.querySelector("#temp-unit");
const conditionText = document.querySelector("#condition");
const feelText = document.querySelector("#feel");

const nextDayDisplays = document.querySelectorAll(".next-day");
const nextHourDisplays = document.querySelectorAll(".next-hour");

async function fetchWeatherData(city) {
  const response = await fetch(
    `${weatherAPI}${city}?unitGroup=us&key=${key}&contentType=json`,
    {
      method: "GET",
      headers: {},
    },
  );

  return await response.json();
}

async function displayWeatherData(data) {
  locationText.textContent = "Tokyo";
  dateText.textContent = "Wed, June 18";
  timeText.textContent = "12:01";
  tempRealText.textContent = "75°";
  tempUnitText.textContent = "F";
  conditionText.textContent = "Sunny";
  feelText.textContent = "Feels like 77°";

  nextDayDisplays.forEach((display) => {
    display.querySelector(".next-dayname").textContent = "Wed";
    display.querySelector(".next-date").textContent = "June 19";
    // display.querySelector(".next-icon");
    display.querySelector(".next-temp").textContent = "72°";
  });

  nextHourDisplays.forEach((display) => {
    display.querySelector(".next-hourname").textContent = "13:01";
    // display.querySelector(".next-icon");
    display.querySelector(".next-temp").textContent = "77°";
  });
}

document.onload = displayWeatherData("Jay");
// console.log(await fetchWeatherData("Tokyo"));
