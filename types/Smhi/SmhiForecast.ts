export interface SmhiForecast {
  createdTime: string
  referenceTime: string
  timeSeries: TimeSeries[]
}

export interface TimeSeries {
  time: string
  data: ForecastData
}

export interface ForecastData {
  air_temperature: number
  wind_speed: number
  wind_speed_of_gust: number
  wind_from_direction: number
  relative_humidity: number
  cloud_area_fraction: number
  precipitation_rate_mean: number
  symbol_code: number
}
