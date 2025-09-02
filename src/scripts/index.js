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
const commentText = document.querySelector("#comment");
const weatherIcon = document.querySelector("#weather-icon");
const tempRealText = document.querySelector("#temp-real");
const tempUnitText = document.querySelector("#temp-unit");
const conditionText = document.querySelector("#condition");
const feelText = document.querySelector("#feel");

const nextDayDisplays = document.querySelectorAll(".next-day");
const nextHourDisplays = document.querySelectorAll(".next-hour");

const optionsBar = document.querySelector("#options");

let isFahrenheit = true;
let currentData = undefined;

async function fetchWeatherData(city) {
  if (!city) {
    console.log("No City!");
    return;
  }

  const currentDate = new Date();
  const start = currentDate.toISOString().slice(0, 10);

  currentDate.setTime(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const end = currentDate.toISOString().slice(0, 10);

  const response = await fetch(
    `${weatherAPI}${city}/${start}/${end}?unitGroup=us&elements=datetime%2Caddress%2Ctemp%2Cfeelslike%2Cconditions%2Cdescription%2Cicon&key=${key}&contentType=json`,
    {
      method: "GET",
      headers: {},
    },
  );

  return await response.json();
}

optionsBar.addEventListener("click", (e) => {
  const currentDate = new Date();

  // Toggle Temperature
  if (e.target.id === "toggle-temp") {
    isFahrenheit = !isFahrenheit;
    e.target.classList.toggle("toggled");

    let currentTemp = currentData.days[0].temp;
    if (!isFahrenheit) {
      currentTemp = toCelsius(currentTemp);
    }

    tempRealText.textContent = `${currentTemp}°`;
    tempUnitText.textContent = isFahrenheit ? "F" : "C";

    nextDayDisplays.forEach((display, index) => {
      const nextData = currentData.days[index + 1];

      let temp = nextData.temp;
      if (!isFahrenheit) {
        temp = toCelsius(temp);
      }

      display.querySelector(".next-temp").textContent = `${temp}°`;
    });

    nextHourDisplays.forEach((display, index) => {
      let hour = currentDate.getHours() + index + 1;
      let day = 0;

      if (hour > 23) {
        hour = hour - 24;
        day = 1;
      }

      const nextData = currentData.days[day].hours[hour];
      let temp = nextData.temp;
      if (!isFahrenheit) {
        temp = toCelsius(temp);
      }

      display.querySelector(".next-temp").textContent = `${temp}°`;
    });
    // Toggle Hour Format
  } else if (e.target.id === "toggle-hour") {
    OPTIONTIME.hour12 = !OPTIONTIME.hour12;
    e.target.classList.toggle("toggled");

    updateTimeDateDisplay(true);

    nextHourDisplays.forEach((display, index) => {
      const nextDate = new Date(
        currentDate.getTime() +
          60 * 60 * 1000 * (index + 1) -
          currentDate.getMinutes() * 60 * 1000,
      );

      display.querySelector(".next-hourname").textContent =
        nextDate.toLocaleTimeString(navigator.language, OPTIONTIME);
    });
  }
});

async function displayWeatherData(data) {
  const currentDate = new Date();

  let locationName = data.resolvedAddress;
  if (locationName.indexOf(",") > -1) {
    locationName = locationName.substring(0, locationName.indexOf(","));
  }
  locationName = locationName.charAt(0).toUpperCase() + locationName.slice(1);

  locationText.textContent = locationName;
  commentText.textContent = data.description.replace(/.([^.]*)$/, "");
  weatherIcon.classList = `icon-target ${data.days[0].icon}`;
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
    display.querySelector(".next-temp").textContent = `${nextData.temp}°`;

    let iconDisplay = display.querySelector(".next-icon");
    iconDisplay.classList = `next-icon icon-target ${nextData.icon}`;
  });

  nextHourDisplays.forEach((display, index) => {
    let hour = currentDate.getHours() + index + 1;
    let day = 0;

    if (hour > 23) {
      hour = hour - 24;
      day = 1;
    }

    const nextData = data.days[day].hours[hour];
    const nextDate = new Date(
      currentDate.getTime() +
        60 * 60 * 1000 * (index + 1) -
        currentDate.getMinutes() * 60 * 1000,
    );

    display.querySelector(".next-hourname").textContent =
      nextDate.toLocaleTimeString(navigator.language, OPTIONTIME);
    display.querySelector(".next-temp").textContent = `${nextData.temp}°`;

    let iconDisplay = display.querySelector(".next-icon");
    iconDisplay.classList = `next-icon icon-target ${nextData.icon}`;
  });
}

async function updateTimeDateDisplay(oneshot = false) {
  const currentDate = new Date();

  if (currentDate.getMinutes() == 0) {
    if (!timeText.dataset.rollover) {
      currentData = await fetchWeatherData("Tokyo");
      await displayWeatherData(currentData);

      timeText.dataset.rollover = true;
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

  if (!oneshot) setTimeout(updateTimeDateDisplay, 1000);
}

function toCelsius(value) {
  let celsius = ((value - 32) * 5) / 9;
  return Math.round((celsius + Number.EPSILON) * 10) / 10;
}

window.onload = async (e) => {
  timeText.dataset.rollover = false;

  currentData = await fetchWeatherData("jakarta");
  await displayWeatherData(currentData);
  await updateTimeDateDisplay();
};
