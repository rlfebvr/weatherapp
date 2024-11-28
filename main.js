const apiKey = "eb30af66096fe9afcc5c8984fa545899";

// https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}

async function apiFetch(url){

    try {
        console.log(url)
        const response = await fetch(url);
        if (!response.ok) {
            console.log("test1")
          throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return json;
      } catch (error) {
        console.error(error.message);
        return false;
      }
}

function sortedForecast(list, numberOfDays){
    let i = -1;
    let stock = []
    while(++i < numberOfDays){
        stock.push(list[i*8])
    }
    return stock;
}

function dayMonthHour(fromList){
    let stock = fromList.dt_txt.split(" ");
    const hour = stock[1]
    stock = stock[0].split("-");
    const day = stock[2]
    const month = stock[1]
    return [day,month,hour]
}

function cityChoices(cities){
    let stock = [];
    cities.forEach(element => {
        let temp = element.country === "US" ? element.name + " " + element.state : element.name;
        stock.push(`${temp}, ${element.country}`)
    });
    return stock;
}

function weatherUrl(city){
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}`
}

function cityChoicesUrl(search, limit){
    return `http://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=${limit}&appid=${apiKey}`
}

function selectedCityUrl(city){
    return `http://api.openweathermap.org/geo/1.0/direct?q=${city[0]},${city[1]}&appid=${apiKey}`
}

function getTemp(fromList){
    return (list.main.temp - 273.15).toFixed(1)
}

function minMaxTemp(list){
    let firstHour = parseInt(dayMonthHour(list[0])[2]);
    let firstDayCycle = 8 - (firstHour / 3)
    let minMax = [[],[]];
    let stock = [[],[]]
    let i = -1;
    while(++i < firstDayCycle){
        stock[0].push(list[i].main.temp_min)
        stock[1].push(list[i].main.temp_max)
    }
    minMax[0].push((Math.min(...stock[0])- 273.15).toFixed(1))
    minMax[1].push((Math.max(...stock[1])- 273.15).toFixed(1))
 //   minMax.push([(Math.min(...stock[0])- 273.15).toFixed(1), (Math.max(...stock[1])- 273.15).toFixed(1)])
    stock = [[],[]]
    console.log(minMax)
    i = -1;
    while(++i < 4){
        let j = -1;
        while(++j < 8 && (firstDayCycle + i * 8 + j) < list.length)
        {
            stock[0].push(list[firstDayCycle + i * 8 + j].main.temp_min)
            stock[1].push(list[firstDayCycle + i * 8 + j].main.temp_max)
        }
        //minMax.push([(Math.min(...stock[0])- 273.15).toFixed(1), (Math.max(...stock[1])- 273.15).toFixed(1)])
        minMax[0].push((Math.min(...stock[0])- 273.15).toFixed(1))
        minMax[1].push((Math.max(...stock[1])- 273.15).toFixed(1))
        stock = [[],[]]
    }
    return minMax;
}

function getDates(list){
    let stock = [];
    let temp;
    let i = -1;
    while(++i < list.length){
        temp = dayMonthHour(list[i])
        stock.push(temp[0] + "/" + temp[1])
    }
    return stock;
}
let usedChart;
function chartDisplay(minMax,dates){

const ctx = document.getElementById('myChart');

  usedChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Max',
        data: [...minMax[1]],
        backgroundColor: ['rgba(250, 141, 56, 0.94)'],
        borderColor: ['rgb(255, 99, 132)'],
        borderWidth: 1
    },
    {
        label: 'Min',
        data: [...minMax[0]],
        backgroundColor: ['rgba(9, 247, 247, 0.8)'],
        borderColor: ['rgb(255, 99, 132)'],
        borderWidth: 1
    }]
    },
    options: {
      scales: {
        y: {
         // beginAtZero: true
        }
      }
    }
  });
}

/*
async function main(){
    let test = cityChoicesUrl("Paris", 5);
let print = await apiFetch(test);

let url = weatherUrl(print[0])
let weather = await apiFetch(url)
let sorted = sortedForecast(weather.list, 3)
const filteredCities = cityChoices(apiFetch(cityChoicesUrl("charle", 5)));
console.log(filteredCities)
//console.log(minMaxTemp(weather.list))
}
main()
*/


const submitButton = document.querySelector('button');
const cityInput = document.getElementById('myCity');
let inputValue;
cityInput.addEventListener("input",async function () {
    const cityDatalist = document.getElementById('cities');
    inputValue = cityInput.value;
        cityDatalist.innerHTML = '';
        if (inputValue.length >= 3) {
            const filteredCities = cityChoices(await apiFetch(cityChoicesUrl(inputValue, 5)));
            filteredCities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                cityDatalist.appendChild(option);
            });
        }
});

    // Add event listener to button
submitButton.addEventListener('click',async function() {
    // Get the value from the input field
    let cityUrl = selectedCityUrl(inputValue);
    let city = await apiFetch(cityUrl);
    let weatherU = weatherUrl(city[0])
    let weather = await apiFetch(weatherU)
    let minMax = minMaxTemp(weather.list)
    let dates = getDates(sortedForecast(weather.list, 5));
    if(usedChart)
        usedChart.destroy();
    chartDisplay(minMax, dates)
});

