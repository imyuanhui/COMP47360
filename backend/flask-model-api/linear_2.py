import joblib
import numpy as np
import pandas as pd
from datetime import datetime


model, feature_columns = joblib.load("linreg_model.pkl")

def linear_predict(timestamp: str, zone_id: str, weather: dict,
                   flow_features: dict, coco_group: str, is_weekend: bool) -> float:
    """
    Construct full feature input and predict total flow (not log).
    
    Predict total flow using a pre-trained linear regression model.

    Parameters
    ----------
    timestamp : str
        Format "YYYY-MM-DD HH:MM:SS", e.g., "2023-06-14 08:00:00"
    zone_id : str
        Zone identifier string (e.g., "3")
    weather : dict
        {
            "temp": float,
            "prcp": float
        }
    flow_features : dict
        {
            "log_mta_flow": float,
            "log_taxi_flow": float,
            "fare_amount": float,
            "has_congestion_surcharge": int,
            "lat": float,
            "lon": float,
            "zone_avg_flow": float
        }
    coco_group : str
        Weather category group. One of:
        ["Cloudy/Overcast", "Fog/Low-Vis", "Heavy Rain", "Heavy Snow/Sleet", "Rain", "Snow/Sleet", "Unknown"]
    is_weekend : bool
        True if weekend or holiday, False otherwise

    Returns
    -------
    float
        Predicted total passenger flow (not log-transformed).
    """
    
    try:
        dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
        hour = dt.hour
        weekday = dt.weekday()
        month = dt.month
    except Exception as e:
        raise ValueError("Invalid timestamp format") from e
    
    try:
        zone_int = int(zone_id)
    except:
        raise ValueError("zone_id must be integer-compatible string")

    base = {
        "log_mta_flow": flow_features.get("log_mta_flow", 0),
        "log_taxi_flow": flow_features.get("log_taxi_flow", 0),
        "fare_amount": flow_features.get("fare_amount", 0),
        "has_congestion_surcharge": flow_features.get("has_congestion_surcharge", 0),
        "lat": flow_features.get("lat", 0),
        "lon": flow_features.get("lon", 0),
        "zone_avg_flow": flow_features.get("zone_avg_flow", 0),
        "temp": weather.get("temp", 0),
        "prcp": weather.get("prcp", 0),
    }

    #One-hot 
    for h in range(10, 19):
        base[f"hour_{h}"] = 1 if hour == h else 0

    for w in range(1, 7):
        base[f"weekday_{w}"] = 1 if weekday == w else 0

    base["month_6"] = 1 if month == 6 else 0
    base["is_weekend_1"] = 1 if is_weekend else 0

    coco_groups = [
        "Cloudy/Overcast", "Fog/Low-Vis", "Heavy Rain", "Heavy Snow/Sleet",
        "Rain", "Snow/Sleet", "Unknown"
    ]
    for g in coco_groups:
        base[f"coco_group_{g}"] = 1 if coco_group == g else 0


    for i in range(1, 13):
        base[f"zone_id_{i}"] = 1 if int(zone_id) == i else 0


    input_df = pd.DataFrame([base])
    input_df = input_df.reindex(columns=feature_columns, fill_value=0)

    log_flow = model.predict(input_df)[0]
    return float(np.exp(log_flow))
