let weatherData = null;
//variable that stores the API data

const fetchWeatherData = () => {
    if(!weatherData) {
        //if data do not exist, get it from the API
        return fetch('https://api.openweathermap.org/data/2.5/weather?q=Stockholm,Sweden&units=metric&APPID=006f1343b19ee38d1d4dadea1be7c6cf')
        .then((response) => response.json())
        .then((json) => {
            weatherData = json;
            //store data in variable
            return json;
            //return data
        });
    } else {
        return Promise.resolve(weatherData);
        //if data already exist, return a promise that immediately resolves with that data
    }
}

//function for logging the whole fetched data
const weatherApp = () => {
    fetchWeatherData()
    .then((json) => {
        console.log (json);
    })
    .catch((error) => {
        console.error("Error fetching data", error)
    });
};

weatherApp()

//function for display tempature
const tempature = () => {
   fetchWeatherData()
    .then((json) => {
         let temp = json.main.temp
         let rounded = Math.round(temp)
         document.getElementById("temp").innerHTML = rounded + "°C";
     }).catch((error) => {
          console.error("Error fetching tempature", error);
     })
};

tempature()

//function for display name of the city
const cityname = () => {
    fetchWeatherData()
    .then((json) => {
        let name = json.name
        document.getElementById("name").innerHTML = name;
    }).catch((error) => {
        console.error("Error fetching cityname", error);
    })
}

cityname()


const fetchAndDisplaySunTime = (sunTime, elementId, label) => {
    fetchWeatherData()
    .then((json) => {
        let sunTimeStamp = json.sys[sunTime];
        //sunrise or sunset in unix timestamp

        //convert unix timestamp to date object
        let sunDate = new Date(sunTimeStamp * 1000);
        //multiply with 1000 to get milliseconds

        //get timezone offset infromation
        let timezoneOffset = json.timezone;

        let localSunDate = new Date(sunDate.getTime() + timezoneOffset * 1000);
        //adjust time for ciurrent location

        let hours = localSunDate.getHours();
        let minutes = localSunDate.getMinutes();
        //get time in hours and minutes

        let formattedTime = hours.toString().padStart(2,'0') + ":" + minutes.toString().padStart(2,'0');

        document.getElementById(elementId).innerHTML = `${label} ${formattedTime}`
    });
};

fetchAndDisplaySunTime("sunrise", "sunrise", "Sunrise")
//fetching data for sunrise

fetchAndDisplaySunTime("sunset", "sunset", "Sunset")
//fetching data for sunset

//function for what temp feels like
const tempFeelsLike = () => {
    fetchWeatherData()
    .then((json) => {
        let feelsLike = json.main.feels_like
        let roundedTemp = Math.round(feelsLike);

        document.getElementById("feelsLike").innerHTML = roundedTemp + "°C";
    }).catch((error) => {
        return console.error("Error fetching what temp feels like", error);
    });
};

tempFeelsLike()

//function for fetching humidity
const humidity = () => {
    fetchWeatherData()
    .then((json) => {
        let humidityPercentage = json.main.humidity

        document.getElementById("humidity").innerHTML = humidityPercentage + '%';
    }).catch((error) => {
        console.error("Error when fetching humidity", error)
    });
};

humidity()


//function for weather description
const weatherDescription = () => {
    fetchWeatherData()
    .then((json) => {
        let description = json.weather[0].description
        let upperCaseDescription = description.charAt(0).toUpperCase() + description.slice(1);
        //makes the first letter in description to upper case 

        document.getElementById("description").innerHTML = upperCaseDescription;
    });
};

weatherDescription()


const weatherData4Days = () => {
    fetch('https://api.openweathermap.org/data/2.5/forecast?q=Stockholm,Sweden&units=metric&APPID=006f1343b19ee38d1d4dadea1be7c6cf')
        .then((response) => {
            return response.json()
        }).then((json) => {

            //create an object to hold daily forcasts
            const dailyForecast = {};

            //loop through each forecast iten in the api response
            json.list.forEach(item => {
                //extract the date from the timestamp
                const date = item.dt_txt.split(" ")[0];

                //create a new object from the timestamp
                const dateName = new Date(item.dt_txt);

                //get the swedish name for the weekday (short version)
                const weekday = dateName.toLocaleDateString("sv-SE", {weekday: 'short'});

                //Capitalize the first letter of the weekday
                const upperCaseWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

                //fetch todays date
                const today = new Date().toISOString().split("T")[0];

                //check if the date is today, if so display "Idag"
                const displayDate = (date === today) ? "Idag" : upperCaseWeekday;

                //if there is no entry for this date in dailyForcast, create one
                if (!dailyForecast[date]) {
                    dailyForecast[date] = {
                        displayDate: displayDate, //save the display date
                        tempMax: item.main.temp, //Initialize max temp
                        tempMin: item.main.temp //Initialize min temp
                    };
                } else {
                    //update max and min temp if the current temp is higher or lower
                    if (item.main.temp > dailyForecast[date].tempMax) {
                        dailyForecast[date].tempMax = item.main.temp;
                    }
                    if (item.main.temp < dailyForecast[date].tempMin) {
                        dailyForecast[date].tempMin = item.main.temp; 
                    }
                }
            });

            //fidn html element where the list will be 
            const weatherList = document.getElementById('4daycast');

            //empty the list if there are already something there
            weatherList.innerHTML = '';

            //loop through the collected daily forecast and log the results
            Object.keys(dailyForecast).forEach( date => {
                //round the max and min temp to nearest integer
                let roundedTempMax = Math.round(dailyForecast[date].tempMax);
                let roundedTempMin = Math.round(dailyForecast[date].tempMin);  

                //create a list
                const listItem = document.createElement('li');
                listItem.textContent = `${dailyForecast[date].displayDate} ${roundedTempMax} / ${roundedTempMin}°C`;

                //add in li in ul 
                weatherList.appendChild(listItem);
            })    
        })
        .catch((error) => {
            console.error("Error fetching weather data", error);
        });
}

weatherData4Days();
