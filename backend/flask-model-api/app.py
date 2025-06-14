from flask import Flask, request, jsonify
import pandas as pd
import pickle
from linear import linear_predict

app = Flask(__name__)

# Load the trained model
with open("linreg_model.pkl", "rb") as f:
    model = pickle.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_data()
        
        predicted_busyness_score = linear_predict(data["timestamp"], data["zone_id"], data["weather_code"])

        return jsonify({
            "busyness_score": predicted_busyness_score
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)