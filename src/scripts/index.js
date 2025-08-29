import "../styles/style.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const OPTIONDATE = {
  month: "long",
  day: "numeric",
};

const OPTIONDAY = {
  weekday: "short",
};

const OPTIONTIME = {
  hour12: false,
  hour: "numeric",
  minute: "numeric",
};

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

let currentData = undefined;

async function fetchWeatherData(city) {
  if (!city) {
    console.log("No City!");
    return;
  }

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
  const currentDate = new Date();

  locationText.textContent = data.address;
  tempRealText.textContent = `${data.days[0].temp}°`;
  tempUnitText.textContent = "F";
  conditionText.textContent = `${data.days[0].conditions}`;
  feelText.textContent = `Feels like ${data.days[0].feelslike}°`;

  nextDayDisplays.forEach((display, index) => {
    const nextData = data.days[index + 1];
    const nextDate = new Date(nextData.datetime);

    display.querySelector(".next-dayname").textContent =
      nextDate.toLocaleDateString(navigator.language, OPTIONDAY);
    display.querySelector(".next-date").textContent =
      nextDate.toLocaleDateString(navigator.language, OPTIONDATE);
    // display.querySelector(".next-icon");
    display.querySelector(".next-temp").textContent = `${nextData.temp}°`;
  });

  nextHourDisplays.forEach((display, index) => {
    const nextData = data.days[0].hours[currentDate.getHours() + index + 1];
    const nextDate = new Date(
      currentDate.getTime() +
        60 * 60 * 1000 * (index + 1) -
        currentDate.getMinutes() * 60 * 1000,
    );

    display.querySelector(".next-hourname").textContent =
      nextDate.toLocaleTimeString(navigator.language, OPTIONTIME);
    // display.querySelector(".next-icon");
    display.querySelector(".next-temp").textContent = `${nextData.temp}°`;
  });
}

async function updateTimeDateDisplay() {
  const currentDate = new Date();

  if (currentDate.getMinutes() == 0) {
    if (!timeText.dataset.rollover) {
      currentData = await fetchWeatherData("Tokyo");
      await displayWeatherData(currentData);

      timeText.dataset.rollovr = true;
    }
  } else if (timeText.dataset.rollover) {
    timeText.dataset.rollover = false;
  }

  dateText.textContent = currentDate.toLocaleDateString(navigator.language, {
    ...OPTIONDAY,
    ...OPTIONDATE,
  });
  timeText.textContent = currentDate.toLocaleTimeString(
    navigator.language,
    OPTIONTIME,
  );

  setTimeout(updateTimeDateDisplay, 1000);
}

window.onload = async (e) => {
  timeText.dataset.rollover = false;

  currentData = await fetchWeatherData("Tokyo");
  await displayWeatherData(currentData);
  await updateTimeDateDisplay();
};
