import pickle
import numpy as np
import pandas as pd
from datetime import datetime

# Load the trained model
with open("linreg_model.pkl", "rb") as f:
    model = pickle.load(f)


def linear_predict(timestamp: str, zone_id: str, weather: dict, flow_features: dict, coco_group: str, is_weekend: bool) -> float:
    """
    Predict the total flow using a pre-trained linear regression model.

    Parameters:
    ----------
    timestamp : str
        The datetime string (e.g., '2023-06-14 08:00:00') representing the prediction time.
        Used to extract time features such as hour, weekday, and month.
    
    zone_id : str
        The zone identifier (e.g., '10'), representing the geographical area.
    
    weather : dict
        A dictionary containing weather-related inputs, for example:
        {
            "temp": float,     # temperature
            "prcp": float      # precipitation
        }

    Returns:
    -------
    float
        The predicted total flow (not log scale), as a float value.
    """
    dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
    hour = dt.hour
    weekday = dt.weekday()  # monday = 0
    month = dt.month
    
    input_data = pd.DataFrame([{
        'zone_id': int(zone_id),
        'hour': hour,
        'weekday': weekday,
        'month': month,
        'temp': weather['temp'],
        'prcp': weather['prcp']
    }])
    
    log_flow_pred = model.predict(input_data)[0]
    
    total_flow = np.exp(log_flow_pred)
    
    return total_flow
    
    # TODO: Implement data lookup for historical mta/taxi flow,
    #       feature engineering (e.g., extract hour, weekday from timestamp),
    #       combine with weather, encode zone_id, call the ML model,
    #       and return predicted flow.

    return
