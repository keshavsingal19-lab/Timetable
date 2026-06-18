// SRCC Weather API — fetches current weather + air quality from Open-Meteo (free, no key)
const SRCC_LAT = 28.6903;
const SRCC_LON = 77.2056;

const WMO_CODES = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '❄️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Light showers', icon: '🌦️' },
  81: { label: 'Showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm + hail', icon: '⛈️' },
  99: { label: 'Severe thunderstorm', icon: '⛈️' },
};

function getAqiLabel(aqi) {
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' };
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: '#f97316' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#7c3aed' };
  return { label: 'Hazardous', color: '#991b1b' };
}

export async function onRequestGet() {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${SRCC_LAT}&longitude=${SRCC_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia/Kolkata`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${SRCC_LAT}&longitude=${SRCC_LON}&current=us_aqi,pm2_5,pm10&timezone=Asia/Kolkata`;

    const [wRes, aqiRes] = await Promise.all([
      fetch(weatherUrl, { cf: { cacheTtl: 600 } }),
      fetch(aqiUrl, { cf: { cacheTtl: 600 } })
    ]);

    if (!wRes.ok || !aqiRes.ok) {
      return Response.json({ error: 'Weather API unavailable' }, { status: 502 });
    }

    const wData = (await wRes.json()).current;
    const aqiData = (await aqiRes.json()).current;
    const wCode = wData.weather_code;
    const condition = WMO_CODES[wCode] || { label: 'Unknown', icon: '🌡️' };
    const aqiInfo = getAqiLabel(aqiData.us_aqi);

    return Response.json({
      campus: 'Shri Ram College of Commerce',
      temperature: Math.round(wData.temperature_2m),
      feelsLike: Math.round(wData.apparent_temperature),
      humidity: wData.relative_humidity_2m,
      precipitation: wData.precipitation,
      windSpeed: Math.round(wData.wind_speed_10m),
      condition: condition.label,
      conditionIcon: condition.icon,
      aqi: aqiData.us_aqi,
      aqiLabel: aqiInfo.label,
      aqiColor: aqiInfo.color,
      pm25: aqiData.pm2_5,
      pm10: aqiData.pm10,
      updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    }, {
      headers: { 'Cache-Control': 'public, max-age=600' }
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
