import joblib
import numpy as np
import pandas as pd
from datetime import datetime

# Load the trained model
model = joblib.load("linreg_model.pkl")

# Define the feature columns as they were during training
feature_columns = [
    'log_mta_flow', 'log_taxi_flow', 'fare_amount', 'has_congestion_surcharge',
    'lat', 'lon', 'log_zone_avg_flow', 'temp', 'prcp',
    'hour_10', 'hour_11', 'hour_12', 'hour_13', 'hour_14', 'hour_15',
    'hour_16', 'hour_17', 'hour_18',
    'weekday_1', 'weekday_2', 'weekday_3', 'weekday_4', 'weekday_5', 'weekday_6',
    'month_6',
    'coco_group_Cloudy/Overcast', 'coco_group_Fog/Low-Vis', 'coco_group_Heavy Rain',
    'coco_group_Heavy Snow/Sleet', 'coco_group_Rain', 'coco_group_Snow/Sleet', 'coco_group_Unknown',
    'is_weekend_1',
    'zone_id_1', 'zone_id_2', 'zone_id_3', 'zone_id_4', 'zone_id_5', 'zone_id_6',
    'zone_id_7', 'zone_id_8', 'zone_id_9', 'zone_id_10', 'zone_id_11', 'zone_id_12'
]

def linear_predict(timestamp: str, zone_id: int, lat: float, lon: float, 
                   weather: dict, flow_features: dict, coco_group: str, is_weekend: bool) -> float:
    """
    Predict total passenger flow (not log-transformed) using a pre-trained linear model.
    """
    try:
        dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
        hour = dt.hour
        weekday = dt.weekday()  # Monday = 0
        month = dt.month
    except Exception as e:
        raise ValueError("Invalid timestamp format") from e

    # Base features
    base = {
        "log_mta_flow": flow_features.get("log_mta_flow", 0),
        "log_taxi_flow": flow_features.get("log_taxi_flow", 0),
        "fare_amount": flow_features.get("fare_amount", 0),
        "has_congestion_surcharge": flow_features.get("has_congestion_surcharge", 0),
        "lat": lat,
        "lon": lon,
        # "zone_avg_flow": flow_features.get("zone_avg_flow", 0),
        "log_zone_avg_flow": np.log(flow_features.get("zone_avg_flow", 1e-5)),
        "temp": weather.get("temp", 0),
        "prcp": weather.get("prcp", 0),
    }

    # One-hot: hour (10–18)
    for h in range(10, 19):
        base[f"hour_{h}"] = int(hour == h)

    # One-hot: weekday (1–6), skip 0 (Monday) if not used in training
    for w in range(1, 7):
        base[f"weekday_{w}"] = int(weekday == w)

    # One-hot: month (6)
    base["month_6"] = int(month == 6)

    # One-hot: is weekend
    base["is_weekend_1"] = int(is_weekend)

    # One-hot: weather
    coco_groups = [
        "Cloudy/Overcast", "Fog/Low-Vis", "Heavy Rain", "Heavy Snow/Sleet",
        "Rain", "Snow/Sleet", "Unknown"
    ]
    for group in coco_groups:
        base[f"coco_group_{group}"] = int(coco_group == group)

    # One-hot: zone_id (0–12 or however trained)
    for i in range(13):
        base[f"zone_id_{i}"] = int(zone_id == i)

    # Reindex to match training order
    input_df = pd.DataFrame([base])
    input_df = input_df.reindex(columns=feature_columns, fill_value=0)

    missing = set(feature_columns) - set(input_df.columns)
    extra = set(input_df.columns) - set(feature_columns)
    if missing or extra:
        raise ValueError(f"Missing: {missing}, Extra: {extra}")


    # Predict log_flow → exponentiate to get total flow
    log_flow = model.predict(input_df)[0]
    return float(np.exp(log_flow))
