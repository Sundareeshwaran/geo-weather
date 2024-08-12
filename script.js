const cityName = document.querySelector(".location");
const date = document.querySelector(".date");
const greeting = document.querySelector(".greeting");
const time = document.querySelector(".time");
const temp = document.querySelectorAll(".temp");
const windSpeed = document.querySelectorAll(".wind-speed");
const humidity = document.querySelectorAll(".humidity");
const info = document.querySelectorAll(".weather-description");
const dailyForecast = document.querySelector(".d-rows");
const hourForecast = document.querySelector(".h-rows");
const display = document.getElementById("weather-card");

async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function weather() {
  try {
    const position = await getCurrentLocation();
    const apiKey = "2cf161da490fe0c711e08daf8cf4dfac";
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();

    cityName.innerHTML = `${data.name}`;
    temp.forEach((temp) => {
      temp.innerHTML = `${Math.round(data.main.temp)}°`;
    });
    windSpeed.forEach((wind) => {
      wind.innerHTML = `<i class="ri-windy-fill"></i> ${data.wind.speed} km/hr`;
    });
    humidity.forEach((humidity) => {
      humidity.innerHTML = `<i class="ri-contrast-drop-line"></i> ${data.main.humidity}%`;
    });
    info.forEach((weather_info) => {
      weather_info.innerHTML = `${data.weather[0].main}`;
    });

    const dt = new Date();
    let dd = String(dt.getDate()).padStart(2, "0");
    let mm = String(dt.getMonth() + 1).padStart(2, "0");
    let yy = dt.getFullYear();
    let curDate = `${dd}.${mm}.${yy}`;
    date.innerHTML = curDate;

    updateTimeAndGreeting();

    dayForecast(lat, lon);
    hourlyForecast(lat, lon);

    display.style.display = "block";
    display.style.transition = "all 0.5s ease-in-out";
  } catch (error) {
    console.error("Error fetching weather data:", error);
    display.style.display = "none";
  }
}

function updateTimeAndGreeting() {
  setInterval(() => {
    const day = new Date();
    let greetHr = day.getHours();
    let currHr = greetHr % 12 || 12;
    let currMin = day.getMinutes().toString().padStart(2, "0");
    let period = greetHr >= 12 ? "PM" : "AM";

    time.innerHTML = `${currHr}:${currMin} ${period}`;
    greet(greetHr);
  }, 100);
}

function greet(hour) {
  if (hour >= 12 && hour <= 15) {
    greeting.innerHTML = "Good Afternoon!";
  } else if (hour > 15 && hour <= 18) {
    greeting.innerHTML = "Good Evening!";
  } else if (hour > 18 && hour <= 23) {
    greeting.innerHTML = "Good Night!";
  } else {
    greeting.innerHTML = "Good Morning!";
  }
}

/*-------------------------------|
---------------------------------|
Forecast data for 5 day / 3 hours|
---------------------------------|
---------------------------------*/

/* ------------------------------------------------------------------------------------------------------------------------------------- */

/*---------------------
Forecast data for 5 day
---------------------*/

async function dayForecast(lat, lon) {
  try {
    const apiKey = "2cf161da490fe0c711e08daf8cf4dfac";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    const filteredData = [];
    const uniqueDates = new Set();

    data.list.forEach((forecast) => {
      const date = new Date(forecast.dt_txt);
      const dateString = date.toISOString().split("T")[0];

      if (date.getHours() === 12 && !uniqueDates.has(dateString)) {
        uniqueDates.add(dateString);
        filteredData.push({
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          temp: Math.round(forecast.main.temp_max),
          weather_dis: forecast.weather[0].description,
        });
      }
    });
    dailyForecast.innerHTML = "";
    filteredData.forEach((data) => {
      dailyForecast.innerHTML += `
        <div class="days">
          <div class="day">${data.day}</div>
          <div class="temp">${data.temp}°</div>
          <div class="sub-description">${data.weather_dis}</div>
        </div>`;
    });
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

/*-----------------------
Forecast data for 3 hours
-----------------------*/

async function hourlyForecast(lat, lon) {
  try {
    const apiKey = "2cf161da490fe0c711e08daf8cf4dfac";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    hourForecast.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      let temp = Math.round(data.list[i].main.temp);
      let weather_dis = data.list[i].weather[0].main;
      let time = new Date(data.list[i].dt_txt);
      let hours = time.getHours();
      let timeFormat = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      let hrs = hours + " " + timeFormat;

      hourForecast.innerHTML += `
        <div class="hrs">
          <div class="hr">${hrs}</div>
          <div class="temp">${temp}°</div>
          <div class="sub-description">${weather_dis}</div>
        </div>`;
    }
  } catch (error) {
    console.error("Error fetching hourly forecast data:", error);
  }
}

weather();
