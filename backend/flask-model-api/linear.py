import pickle

# Load the trained model
with open("linreg_model.pkl", "rb") as f:
    model = pickle.load(f)


def linear_predict(timestamp: str, zone_id: str, weather: dict) -> float:
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
    
    # TODO: Implement data lookup for historical mta/taxi flow,
    #       feature engineering (e.g., extract hour, weekday from timestamp),
    #       combine with weather, encode zone_id, call the ML model,
    #       and return predicted flow.

    return
