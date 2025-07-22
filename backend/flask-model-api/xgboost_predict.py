import joblib
import json
import numpy as np
import pandas as pd
from datetime import datetime
from flask import Flask, request, jsonify
from pandas.api.types import CategoricalDtype

print("[XGB] Start prediction")
# ----------- Load model and features -----------
_loaded = joblib.load("xgboost_model_0721_exp.pkl")
xgb_model = _loaded['model']
FEATURES_R = _loaded['features_r']


with open("features_r.json") as f:
    FEATURES_R = json.load(f)

with open("zone_defaults.json", encoding="utf-8") as f:
    ZONE_LOOKUP = {z["zone_id"]: z for z in json.load(f)}

with open("global_defaults.json", encoding="utf-8") as f:
    GLOBAL_DEFAULT = json.load(f)

with open("zone_bias_dict.json") as f:    #adjust predict bias for flow
    zone_bias_dict = json.load(f)


# ----------- Payload builder -----------
def _build_payload(req: dict) -> dict:
    zone_id = req["zone_id"]
    payload = req.copy()
    payload.update(ZONE_LOOKUP.get(zone_id, {}))
    for k, v in GLOBAL_DEFAULT.items():
        payload.setdefault(k, v)
    return payload

# ----------- One-hot align -----------


#ADD

def _onehot_align(df_raw: pd.DataFrame) -> pd.DataFrame:
    category_cols = ['zone_id', 'hour', 'weekday', 'month', 'coco_group', 'category_top']
    available_cols = [col for col in category_cols if col in df_raw.columns]

    for col in ['zone_tourist_count', 'tourist_ratio']:
        if col in df_raw.columns:
            df_raw[col] = pd.to_numeric(df_raw[col], errors='coerce').fillna(0)

    for col in available_cols:
        df_raw[col] = df_raw[col].astype(str)

    zone_type = CategoricalDtype([str(i) for i in range(32)], ordered=False)
    hour_type = CategoricalDtype([str(i) for i in range(9, 19)], ordered=False)

    if 'zone_id' in df_raw.columns:
        df_raw['zone_id'] = df_raw['zone_id'].astype(zone_type)
    if 'hour' in df_raw.columns:
        df_raw['hour'] = df_raw['hour'].astype(hour_type)

    dummies = pd.get_dummies(df_raw, columns=available_cols, prefix_sep="_")

    missing_cols = [col for col in FEATURES_R if col not in dummies.columns]
    for col in missing_cols:
        dummies[col] = 0

    dummies = dummies[[col for col in dummies.columns if col in FEATURES_R]]

    return dummies[FEATURES_R]




# ----------- XGBoost prediction function -----------
#ADD

def xgb_predict(timestamp, zone_id, temp, prcp, interest, zone_tourist_count=None, tourist_ratio=None):
    print("[XGB] Start prediction")

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

    # print("[XGB] Raw input req:", req)

    df = pd.DataFrame([_build_payload(req)])
    # print("[XGB] Payload after _build_payload:", df.to_dict())

    X = _onehot_align(df)
    # print("[XGB] One-hot encoded shape:", X.shape)
    # print("[XGB] Final X input:\n", X.to_dict(orient="records")[0])


    # print("[XGB] Calling xgb_model.predict")
    y_pred_log = xgb_model.predict(X)[0]
    # print("[XGB] Raw prediction (log):", y_pred_log)

    score = float(np.expm1(y_pred_log))
    # print("[XGB] Expm1 score:", score)

    zone_id_str = str(zone_id)
    bias_correction = zone_bias_dict.get(zone_id_str, 0)
    # print(f"[XGB] Bias correction for zone {zone_id_str}: {bias_correction}")
    score += bias_correction


    return {
        "busyness_score": round(score, 2),
    }

