import "../styles/style.css";
import { createClient } from "pexels";

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
const weatherKey = "43GQQ65K28BCAUG6QME297TQD";

const pexelsClient = createClient(
  "PGTLBTxH7j2OBf74YxbWddjeq9umPhfKiPGU8zoqcDiSUSQIEeXftb0w",
);

const locationText = document.querySelector("#location > h2");
const todayDisplay = document.querySelector("#today");
const dateText = document.querySelector("#date");
const timeText = document.querySelector("#time");
const creditText = document.querySelector("#photographer");
const commentText = document.querySelector("#comment");
const weatherIcon = document.querySelector("#weather-icon");
const tempRealText = document.querySelector("#temp-real");
const tempUnitText = document.querySelector("#temp-unit");
const conditionText = document.querySelector("#condition");
const feelText = document.querySelector("#feel");

const nextDayDisplays = document.querySelectorAll(".next-day");
const nextHourDisplays = document.querySelectorAll(".next-hour");

const optionsBar = document.querySelector("#options");
const searchBar = document.querySelector("#search > input");
const errorDisplay = document.querySelector("#error");

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

  const request = `${weatherAPI}${city}/${start}/${end}?unitGroup=us&elements=datetime%2Caddress%2Ctemp%2Cfeelslike%2Cconditions%2Cdescription%2Cicon&key=${weatherKey}&contentType=json`;

  return await sendAPIRequest(request);
}

async function fetchRandomPhoto(query) {
  const data = await pexelsClient.photos
    .search({ query, "per-page": 1 })
    .then((photos) => {
      return photos;
    });

  return data;
}

async function sendAPIRequest(request, cors = false) {
  const response = await fetch(request, {
    mode: cors ? "no-cors" : "cors",
    method: "GET",
    headers: {},
  });

  let asJSON = false;
  try {
    asJSON = await response.json();
  } catch (error) {
    asJSON = false;
  }

  return asJSON;
}

optionsBar.addEventListener("click", async (e) => {
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
  } else if (e.target.id === "search-submit") {
    const city = searchBar.value;

    currentData = await fetchWeatherData(city);
    if (currentData) {
      await displayWeatherData(currentData);
      await displayRandomBackground();
      updateTimeDateDisplay(true);
    } else {
      displayNotFoundError(city);
    }
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
  if ("description" in data) {
    commentText.textContent = data.description.replace(/.([^.]*)$/, "");
  } else {
    commentText.textContent = "";
  }
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

async function displayRandomBackground() {
  const query = `${currentData.resolvedAddress} ${currentData.days[0].icon.replace("-", " ")}`;
  const photos = await fetchRandomPhoto(query);

  const photoData = photos.photos[Math.floor(Math.random() * 10)];
  creditText.textContent = photoData.photographer;
  creditText.setAttribute("href", photoData.url);

  todayDisplay.style.backgroundImage = `url(${photoData.src.large})`;
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

async function displayNotFoundError(city) {
  error.textContent = `${city} was not found`;
  error.classList.add("show");

  setTimeout(closeNotFoundError, 3000);
}

async function closeNotFoundError() {
  error.classList.remove("show");
}

function toCelsius(value) {
  let celsius = ((value - 32) * 5) / 9;
  return Math.round((celsius + Number.EPSILON) * 10) / 10;
}

window.onload = async (e) => {
  timeText.dataset.rollover = false;

  currentData = await fetchWeatherData("jakarta");
  await displayWeatherData(currentData);
  await displayRandomBackground();
  await updateTimeDateDisplay();
};
