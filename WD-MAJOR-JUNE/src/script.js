
//------------------------------Made Function to get all the data related to day, date and time-------------------------------------//
function getTime(timestamp) {
  let allMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let allDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let now = new Date(timestamp * 1000);
  let month = allMonths[now.getMonth()];
  let weekday = allDays[now.getDay()];
  let theDate = now.getDate();
  let hour = now.getHours();

  let year = now.getFullYear();
  let minutes = now.getMinutes();

//------------------------------Here we converted the 24 hours format to 12 hours format and assigns AM and PM---------------------// 
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  if (hour < 12) {
    minutes = `${minutes} AM`;
    if (hour == 0) {
      hour = 12;
    }
  } else {
    minutes = `${minutes} PM`;
    if (hour != 12) {
      hour = hour - 12;
    }
  }

  let currentDayTime = document.querySelector("#current-day-time");
  currentDayTime.innerHTML = ` ${weekday} , ${hour}:${minutes} `;
 
}
//------------------------------------------------------Shows the real time date---------------------------------------------------//
var dt = new Date();
document.getElementById("span").innerHTML = (("0"+dt.getDate()).slice(-2)) +"/"+ (("0"+(dt.getMonth()+1)).slice(-2)) +"/"+ 
(dt.getFullYear());

function search(city) {
  if (unitF.classList.contains("active-units")) {
    units = "imperial";
  } else {
    units = "metric";
  }

  //-----------------------------------------------------Get Data by City Name----------------------------------------------------//

  let ApiEndpoint = `https://api.openweathermap.org/data/2.5/weather?`;
  let Key = `28ae6024d5ca8fdbf0e5b7d7fe38ed95`;
  let ApiUrlCity = `${ApiEndpoint}q=${city}&appid=${Key}&units=${units}`;

  axios.get(ApiUrlCity).then(retrieveWx);
}

function cityName(event) {
  event.preventDefault();
  let city = document.querySelector("#city-input").value;
  search(city);
}

//--------------------------------------------User can search the city from the search box-----------------------------------------//

let searchForm = document.querySelector(".city-search-form");
searchForm.addEventListener("submit", cityName);

//--------------------------------------------Searched city's data is getting fetcehd here-----------------------------------------//

function showPosition(position) {
  if (unitF.classList.contains("active-units")) {
    units = "imperial";
  } else {
    units = "metric";
  }

  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;

 //------------------------------API with its key is used here to fetch the data--------------------------------------------------//

  let ApiEndpoint = `https://api.openweathermap.org/data/2.5/weather?`;
  let Key = `28ae6024d5ca8fdbf0e5b7d7fe38ed95`;
  let ApiUrlGeo = `${ApiEndpoint}&lat=${latitude}&lon=${longitude}&appid=${Key}&units=${units}`;
  axios.get(ApiUrlGeo).then(retrieveWx);
}
//------------------------------Here we get the current position's weather details and conversion of units------------------------//
let temp = null;
let tempConvert = null;
let feelsLikeTemp = null;
let feelsLikeTempConvert = null;
let units = null;
let windUnits = null;
let windSpeed = null;
let windUnitsConvert = null;

function retrieveWx(wxData) {
 
  temp = Math.round(wxData.data.main.temp);
  feelsLikeTemp = Math.round(wxData.data.main.feels_like);
  windSpeed = Math.round(wxData.data.wind.speed);

  if (units == "imperial") {
    //then convert to metric
    tempConvert = Math.round(((wxData.data.main.temp - 32) * 5) / 9);
    feelsLikeTempConvert = Math.round(
      ((wxData.data.main.feels_like - 32) * 5)  / 9
    );
    windConvert = Math.round(windSpeed * 0.44704);
    windUnits = "mph";
    windUnitsConvert = "m/s";
 
  } else {
    tempConvert = Math.round(wxData.data.main.temp * (9 / 5) + 32);
    feelsLikeTempConvert = Math.round(
      wxData.data.main.feels_like * (9 / 5) + 32
    );
    //Units of wind speed
    windUnits = "m/s";
    windConvert = Math.round(windSpeed * 2.23694);
    windUnitsConvert = "mph";
 
  }
  let RH = wxData.data.main.humidity;
  let wxDescription = wxData.data.weather[0].description;
  let wxIcon = wxData.data.weather[0].icon;

//------------------------------Here the output of Weather Details is reflected on the screen-------------------------------------//

  document.querySelector(".city-description").innerHTML = `${wxDescription} in`;
  document.querySelector("#city-name").innerHTML = wxData.data.name;
  document.querySelector("#current-temp").innerHTML = temp;
  document.querySelector("#feels-like").innerHTML = feelsLikeTemp ;
  document.querySelector("#humidity").innerHTML = `${RH}%`;
  document.querySelector("#windspeed").innerHTML = `${windSpeed} ${windUnits}`;
  document
    .querySelector("#wx-icon")
    .setAttribute("src", `https://openweathermap.org/img/wn/${wxIcon}.png`);
  document.querySelector("#wx-icon").setAttribute("alt", `${wxDescription}`);

  getTime(wxData.data.dt);

  getForecast(wxData.data.coord);
}
//--------------------------------------------Fetches the Current Location -------------------------------------------------------//

function getForecast(coordinates) {
//Here also the API with its key is g etting used to fetch the data
  let ApiEndpoint = `https://api.openweathermap.org/data/2.5/onecall?`;
  let wxKey = `28ae6024d5ca8fdbf0e5b7d7fe38ed95`;
  let latitude = coordinates.lat;
  let longitude = coordinates.lon;
  let exclude = `hourly,minutely,alerts`;
  if (unitF.classList.contains("active-units")) {
    units = "imperial";
  } else {
    units = "metric";
  }
  let ApiUrlForecast = `${ApiEndpoint}&lat=${latitude}&lon=${longitude}&exclude=${exclude}&appid=${wxKey}&units=${units}`;
 //Here we have reflectedd the forecast data on the screen
  axios.get(ApiUrlForecast).then(displayForecast);
}
//---------------------------------------------------Display 6 Days Forecast------------------------------------------------------//

function formatDay(timestamp) {
  let date = new Date(timestamp * 1000);
  let day = date.getDay();
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return days[day];
}

function displayForecast(response) {
  forecastData = response.data.daily;

  let forecastHTML = "";
  forecastHTML = forecastHTML + `<div class="row">`;
  //here we have defined index, as the number of days of which we have to fetch the forecast
  forecastData.forEach(function (forecastDay, index) {
    if (index <6 ) {
      let theDay = formatDay(forecastDay.dt);
      if (index < 1) {
        theDay = "Today";
      }
      forecastHTML =
        forecastHTML +
        `<div class="daily-forecast col-2">
              <ul>
                <li>
                ${theDay}
                </li>
                <li class="daily-icon"><img src="https://openweathermap.org/img/wn/${
                  forecastDay.weather[0].icon
                }@2x.png" alt="" width="90" /></li>
                <li>
                  <span class="hi-temp">${Math.round(
                    forecastDay.temp.max
                  )}°</span>
                  <span class="low-temp"> / ${Math.round(
                    forecastDay.temp.min
                  )}°</span>
                </li>
              </ul>
            </div>`;
    }
  });

  forecastHTML = forecastHTML + ` </div>`;
  document.querySelector("#forecast").innerHTML = forecastHTML;
}

//---------------------Here we have converted the values of C to F, F to C and other weather details of the 6 days---------------//

function convertTemp(event) {
  event.preventDefault();

  if (unitF.classList.contains("active-units")) {
    unitF.classList.remove("active-units");
    unitF.classList.add("inactive-units");
    unitC.classList.add("active-units");
    unitC.classList.remove("inactive-units");
  } else {
    unitC.classList.remove("active-units");
    unitC.classList.add("inactive-units");
    unitF.classList.add("active-units");
    unitF.classList.remove("inactive-units");
  }

  let displayTemp = document.querySelector("#current-temp");
  let displayFeelsLikeTemp = document.querySelector("#feels-like");
  let forecastHiTemps = document.querySelectorAll("span.hi-temp");
  let forecastLowTemps = document.querySelectorAll("span.low-temp");
  let displayWind = document.querySelector("#windspeed");

//--------------------------------------------conversion of Farenhite to celsius--------------------------------------------------//

  //If searched units were imperial, convert to metric
  if (units == "imperial" && unitC.classList.contains("active-units")) {
    displayTemp.innerHTML = `${tempConvert}`;
    displayFeelsLikeTemp.innerHTML = `${feelsLikeTempConvert}°`;
    displayWind.innerHTML = `${windConvert} ${windUnitsConvert}`;

    forecastData.forEach(function (forecastTemp, index) {
      if (index < 6) {
        forecastHiTemps[index].innerHTML = `${Math.round(
          ((forecastTemp.temp.max - 32) * 5) / 9
        )}°`;
        forecastLowTemps[index].innerHTML = ` | ${Math.round(
          ((forecastTemp.temp.min - 32) * 5) / 9
        )}°`;
      }
    });

    //If searched units were metric, convert to imperial
  } else if (units == "metric" && unitF.classList.contains("active-units")) {
    displayTemp.innerHTML = `${tempConvert}`;
    displayFeelsLikeTemp.innerHTML = `${feelsLikeTempConvert}`;
    displayWind.innerHTML = `${windConvert} ${windUnitsConvert}`;

    forecastData.forEach(function (forecastTemp, index) {
      if (index < 6) {
        forecastHiTemps[index].innerHTML = `${Math.round(
          forecastTemp.temp.max * (9 / 5) + 32
        )}°`;
        forecastLowTemps[index].innerHTML = ` | ${Math.round(
          forecastTemp.temp.min * (9 / 5) + 32
        )}°`;
      }
    });
    //If returning to searched units
  } else if (
    (units == "metric" && unitC.classList.contains("active-units")) ||
    (units == "imperial" && unitF.classList.contains("active-units"))
  ) {
    displayTemp.innerHTML = `${temp}`;
    displayFeelsLikeTemp.innerHTML = `${feelsLikeTemp}`;
    displayWind.innerHTML = `${windSpeed} ${windUnits}`;

    forecastData.forEach(function (forecastTemp, index) {
      if (index < 6) {
        forecastHiTemps[index].innerHTML = `${Math.round(
          forecastTemp.temp.max
        )} F`;
        forecastLowTemps[index].innerHTML = ` | ${Math.round(
          forecastTemp.temp.min
        )} F`;
      }
    });
  }
}

let degreesFtoC = document.querySelector(".degreesC");
degreesFtoC.addEventListener("click", convertTemp);

let degreesCtoF = document.querySelector(".degreesF");
degreesCtoF.addEventListener("click", convertTemp);

let unitC = document.querySelector(".degreesC");
let unitF = document.querySelector(".degreesF");

let forecastData = [];

function getPosition(event) {
  event.preventDefault();
  document.getElementById("city-input").value = "";
  navigator.geolocation.getCurrentPosition(showPosition);
}
//------------------------------------------------------On click we get the current location--------------------------------------//

let buttonLocation = document.querySelector("#button-location");
buttonLocation.addEventListener("click", getPosition);

//----------------------------------------------------------On load, search for a defualt city------------------------------------//
search("Delhi");
