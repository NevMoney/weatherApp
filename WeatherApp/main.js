import './style.css'
import { getWeather } from './weather'
import { ICON_MAP } from './iconMap'

function renderWeather({ current, daily, hourly }) {
  // console.log(current, daily, hourly)
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)
  document.body.classList.remove('blurred')
}

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value
}

const currentIcon = document.querySelector('[data-current-icon]')

function getIconUrl(iconCode) {
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

function renderCurrentWeather(current) {
  let sunset = new Date(current.sunset[0] * 1000)
  sunset = sunset.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  })
  let sunrise = new Date(current.sunrise[6] * 1000)
  sunrise = sunrise.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  })
  currentIcon.src = getIconUrl(current.iconCode)

  windArrow(current.windDirection)

  setValue('current-temp', current.currentTemp)
  setValue('current-high', current.highTemp)
  setValue('current-low', current.lowTemp)
  setValue('current-fl-high', current.highFeelsLike)
  setValue('current-fl-low', current.lowFeelsLike)
  setValue('current-wind', current.windSpeed)
  setValue('current-precip', current.precip)
  if (!isNaN(current.feelsLike)) {
    setValue('current-fl', current.feelsLike)
  } else {
    document.querySelector('[data-current-fl]').textContent = ''
    // hide class degrees-fl
    document.querySelector('.degrees-fl').classList.add('hidden')
  }
  setValue('current-sunrise', sunrise)
  setValue('current-sunset', sunset)
}

function renderDailyWeather(daily) {
  const dailySection = document.querySelector('[data-day-section]')
  const dayCardTemplate = document.getElementById('day-card-template')
  const DAY_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
  dailySection.innerHTML = ''
  daily.forEach((day) => {
    const dayCard = dayCardTemplate.content.cloneNode(true)
    setValue('day', DAY_FORMAT.format(day.timestamp), { parent: dayCard })
    setValue('temp', day.maxTemp, { parent: dayCard })
    dayCard.querySelector('[data-icon]').src = getIconUrl(day.iconCode)
    dailySection.appendChild(dayCard)
  })
}

function renderHourlyWeather(hourly) {
  const hourlySection = document.querySelector('[data-hour-section]')
  const hourRowTemplate = document.getElementById('hour-row-template')
  const HOUR_FORMAT = new Intl.DateTimeFormat(undefined, { hour: 'numeric' })
  hourlySection.innerHTML = ''
  hourly.forEach((hour) => {
    const hourRow = hourRowTemplate.content.cloneNode(true)
    setValue('day', HOUR_FORMAT.format(hour.timestamp), { parent: hourRow })
    hourRow.querySelector('[data-icon]').src = getIconUrl(hour.iconCode)
    setValue('temp', hour.temp, { parent: hourRow })
    setValue('fl-temp', hour.feelsLike, { parent: hourRow })
    setValue('wind', hour.windSpeed, { parent: hourRow })
    setValue('precip', hour.precip, { parent: hourRow })
    hourlySection.appendChild(hourRow)
  })
}

// function to uncover which location the user is in
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition)
  } else {
    alert('Geolocation is not supported by this browser.')
  }
}

function showPosition(position) {
  document.querySelector(
    '#location',
  ).textContent = `Lat: ${position.coords.latitude} Long: ${position.coords.longitude}`
  getWeather(
    position.coords.latitude,
    position.coords.longitude,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  )
    .then(renderWeather)
    .catch((e) => {
      console.error(e)
      alert('Error:' + e.message)
    })
}

getLocation()

// use current weather windSpeed and windDirection to create a wind arrow
function windArrow(windDirection) {
  const windArrow = document.querySelector('[data-wind-arrow]')
  windArrow.style.transform = `translate(-10%, 11%) rotate(${windDirection}deg)`
}
