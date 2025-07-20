import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

# ----------- Load model and features -----------
MODEL = joblib.load("xgboost_model_0719_exp.pkl")
with open("features_r.json") as f:
    FEATURES_R = json.load(f)

with open("zone_defaults.json", encoding="utf-8") as f:
    ZONE_LOOKUP = {z["zone_id"]: z for z in json.load(f)}

with open("global_defaults.json", encoding="utf-8") as f:
    GLOBAL_DEFAULT = json.load(f)

# ----------- Payload builder -----------
def _build_payload(req: dict) -> dict:
    zone_id = req["zone_id"]
    payload = req.copy()
    payload.update(ZONE_LOOKUP.get(zone_id, {}))
    for k, v in GLOBAL_DEFAULT.items():
        payload.setdefault(k, v)
    return payload

# ----------- One-hot align -----------

def _onehot_align(df_raw: pd.DataFrame) -> pd.DataFrame:
    category_cols = ['zone_id', 'hour', 'weekday', 'month', 'coco_group', 'category_top']
    available_cols = [col for col in category_cols if col in df_raw.columns]

    #ADD
    for col in ['zone_tourist_count', 'tourist_ratio']:
        if col in df_raw.columns:
            df_raw[col] = pd.to_numeric(df_raw[col], errors='coerce').fillna(0)

    for col in available_cols:
        df_raw[col] = df_raw[col].astype(str)

    dummies = pd.get_dummies(df_raw, columns=available_cols, prefix_sep="_")

    missing_cols = [col for col in FEATURES_R if col not in dummies.columns]
    for col in missing_cols:
        dummies[col] = 0

    return dummies[FEATURES_R]


# ----------- XGBoost prediction function -----------
def xgb_predict(timestamp, zone_id, temp, prcp, interest, zone_tourist_count=None, tourist_ratio=None):
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
        "tourist_ratio": tourist_ratio
    }

    df = pd.DataFrame([_build_payload(req)])
    X = _onehot_align(df)
    y_pred_log = MODEL.predict(X)[0]
    return float(np.expm1(y_pred_log))  # Invert log1p transform
