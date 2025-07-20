# rf_predict.py
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

# Load once at module level
BUNDLE = joblib.load("xgboost_model_0708_exp.pkl")
MODEL = BUNDLE["model"]
FEATURES_R = BUNDLE["features_r"]

with open("zone_defaults.json", encoding="utf-8") as f:
    ZONE_LOOKUP = {z["zone_id"]: z for z in json.load(f)}

with open("global_defaults.json", encoding="utf-8") as f:
    GLOBAL_DEFAULT = json.load(f)

def _build_payload(req: dict) -> dict:
    """Fill missing static fields using zone & global defaults."""
    z = req["zone_id"]
    payload = req.copy()
    payload.update(ZONE_LOOKUP.get(z, {}))
    for k, v in GLOBAL_DEFAULT.items():
        payload.setdefault(k, v)
    return payload

def _onehot_align(df_raw: pd.DataFrame) -> pd.DataFrame:
    """One-hot encode and align columns to FEATURES_R."""
    dummies = pd.get_dummies(df_raw, prefix_sep="_")
    for col in FEATURES_R:
        if col not in dummies:
            dummies[col] = 0
    return dummies[FEATURES_R]

def xgboost(timestamp, zone_id, temp, prcp, interest, zone_tourist_count=None, tourist_ratio=None):
    """
    Predict total flow based on weather & interest data.
    """
    try:
        dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        raise ValueError("timestamp must be 'YYYY-MM-DD HH:MM:SS'") from e

    req = {
        "zone_id": zone_id,
        "hour": dt.hour,
        "weekday": dt.weekday(),
        "month": dt.month,
        "day": dt.day,
        "is_weekend": int(dt.weekday() >= 5),
        "temp": temp,
        "prcp": prcp,
        "interest": interest,
        "zone_tourist_count": zone_tourist_count,
        "tourist_ratio": tourist_ratio,
    }

    X = _onehot_align(pd.DataFrame([_build_payload(req)]))
    y_log = MODEL.predict(X)[0]
    return float(np.expm1(y_log))  # invert log-transform