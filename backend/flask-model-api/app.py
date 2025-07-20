from flask import Flask, request, jsonify
import pandas as pd
import pickle
from linear import linear_predict
from map_openweather_to_coco import map_openweather_to_coco
from datetime import datetime
from rf_predict import random_forest
from xgb_predict import xgb_predict
from fetch_interest import fetch_interest, get_cached_interest

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
def predict_randomforest():
    try:
        data = request.get_json()
        timestamp = data["timestamp"]
        zone_id = data["zone_id"]
        zone_name = data["zone_name"]
        weather = data["weather"]
        temp = weather.get("temp")
        prcp = weather.get("prcp")

        print(f"[INFO] Received prediction request for zone_id={zone_id}, zone_name='{zone_name}'")
        # interest = fetch_interest(zone_name)
        interest = get_cached_interest(zone_name)
        score = random_forest(timestamp, zone_id, temp, prcp, interest)

        return jsonify({"busyness_score": round(score, 2)})

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return jsonify({"error": str(e)}), 400


#ADD
@app.route("/predict/xgb", methods=["POST"])
def predict_xgb():
    try:
        data = request.get_json()
        timestamp = data["timestamp"]
        zone_id = data["zone_id"]
        zone_name = data["zone_name"]
        weather = data["weather"]
        temp = weather.get("temp")
        prcp = weather.get("prcp")

        print(f"[INFO] Received prediction request for zone_id={zone_id}, zone_name='{zone_name}'")
        interest = get_cached_interest(zone_name)
        score = xgb_predict(timestamp, zone_id, temp, prcp, interest)


        return jsonify({"busyness_score": round(score, 2)})

    except Exception as e:

        print(f"[ERROR] XGB prediction failed: {e}")
        return jsonify({"error": str(e)}), 400    
    


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)