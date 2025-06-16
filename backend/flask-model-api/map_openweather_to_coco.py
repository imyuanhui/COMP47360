def map_openweather_to_coco(weather_id: int) -> str:
    """
    Map OpenWeather weather ID to coco_group category.
    Reference: https://openweathermap.org/weather-conditions
    """

    if 200 <= weather_id < 300:
        return "Heavy Rain"
    elif 300 <= weather_id < 400:
        return "Rain"
    elif 500 <= weather_id < 600:
        if weather_id in [502, 503, 504]:
            return "Heavy Rain"
        else:
            return "Rain"
    elif 600 <= weather_id < 700:
        if weather_id in [602, 622]:  
            return "Heavy Snow/Sleet"
        else:
            return "Snow/Sleet"
    elif 700 <= weather_id < 800:
        return "Fog/Low-Vis"          
    elif weather_id == 800:
        return "Cloudy/Overcast"     
    elif 801 <= weather_id <= 804:
        return "Cloudy/Overcast"     
    else:
        return "Unknown"

