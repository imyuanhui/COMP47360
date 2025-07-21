import joblib
import json
import numpy as np
import pandas as pd
from datetime import datetime
from flask import Flask, request, jsonify

# ----------- Load model and features -----------
xgb_model = joblib.load("xgboost_model_0720_exp.pkl")
gmm_model = joblib.load("gmm_model.pkl") #model for cluster L,M,H
scaler = joblib.load("scaler.pkl")

with open("features_r.json") as f:
    FEATURES_R = json.load(f)

with open("zone_defaults.json", encoding="utf-8") as f:
    ZONE_LOOKUP = {z["zone_id"]: z for z in json.load(f)}

with open("global_defaults.json", encoding="utf-8") as f:
    GLOBAL_DEFAULT = json.load(f)

with open("zone_bias_dict.json") as f:    #adjust predict bias for flow
    zone_bias_dict = json.load(f)

# GMM map according to gmm_level_mapping.json file
level_map = {
    1: "Low",
    0: "Medium",
    2: "High"
}

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
#ADD
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

    # 預測 flow (log scale)，並進行 log 反轉
    y_pred_log = xgb_model.predict(X)[0]
    score = float(np.expm1(y_pred_log))

    # Bias 修正
    zone_id_str = str(zone_id)
    bias_correction = zone_bias_dict.get(zone_id_str, 0)
    score += bias_correction

    # GMM 分群（std 設 0）
    hour_sin = np.sin(2 * np.pi * dt.hour / 24)
    hour_cos = np.cos(2 * np.pi * dt.hour / 24)
    gmm_input = np.array([[score, 0, hour_sin, hour_cos]])
    gmm_input_scaled = scaler.transform(gmm_input)
    gmm_cluster = gmm_model.predict(gmm_input_scaled)[0]
    level = level_map[gmm_cluster]

    return {
        "busyness_score": round(score, 2),
        "busyness_level": level
    }

