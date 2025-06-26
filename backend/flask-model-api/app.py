from flask import Flask, request, jsonify
import pandas as pd
import pickle
from linear import linear_predict
from map_openweather_to_coco import map_openweather_to_coco
from datetime import datetime
from rf_predict import random_forest

app = Flask(__name__)

@app.route("/predict/linear", methods=["POST"])
def linear_predict():
    try:
        data = request.get_json()

        timestamp = data["timestamp"]
        zone_id = data["zone_id"]
        lat = data["lat"]
        lon = data["lon"]
        weather = data["weather"]
        flow_features = data["flow_features"]

        # Map weather_id to coco_group
        weather_id = weather.get("weather_id")
        coco_group = map_openweather_to_coco(weather_id)
        weather["weather_group"] = coco_group

        # Determine if weekend
        dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
        is_weekend = dt.weekday() in [5, 6]  # Saturday=5, Sunday=6
        
         # Call prediction function
        score = linear_predict(
            timestamp=timestamp,
            zone_id=zone_id,
            lat=lat,
            lon=lon,
            weather=weather,
            flow_features=flow_features,
            coco_group=coco_group,
            is_weekend=is_weekend
        )

        return jsonify({"busyness_score": round(score, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/predict/randomforest", methods=["POST"])
def rf_predict():

    try:
        # Organise parameters
        data = request.get_json()

        timestamp = data["timestamp"]
        zone_id = data["zone_id"]

        weather = data["weather"]
        temp = weather.get("temp")
        prcp = weather.get("prcp")

        
        # Call prediction function
        score = random_forest(
            timestamp, zone_id, temp, prcp, interest=0.72
        )

        return jsonify({"busyness_score": round(score, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)