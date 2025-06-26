# must include files--
# ML_RF_v2.pkl
# zone_defaults.json
# global_defaults.json
#----------------------


# rf_predict.py  -----------------------------------------------------------
"""
Random-Forest passenger-flow inference.

Assumptions
-----------
• The pickle `ML_RF_v2.pkl` is a dict with keys
    ├── "model"       : sklearn.ensemble.RandomForestRegressor
    └── "features_r"  : list[str]  (training feature order)
• Static-feature lookup tables:
    ├── zone_defaults.json   – per-zone constants
    └── global_defaults.json – global mean values
"""

import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path

# --------------------------------------------------------------------------
# one-time initialisation (loads in < 100 ms)
# --------------------------------------------------------------------------
BUNDLE         = joblib.load("ML_RF_v2.pkl")
MODEL          = BUNDLE["model"]
FEATURES_R     = BUNDLE["features_r"]

ZONE_LOOKUP    = {z["zone_id"]: z
                for z in json.load(open("zone_defaults.json", encoding="utf-8"))}
GLOBAL_DEFAULT = json.load(open("global_defaults.json", encoding="utf-8"))

# --------------------------------------------------------------------------
# internal helpers
# --------------------------------------------------------------------------
def _build_payload(req: dict) -> dict:
    """Fill missing static fields using lookup tables."""
    z = req["zone_id"]
    payload = req.copy()
    # (a) per-zone constants
    payload.update(ZONE_LOOKUP.get(z, {}))
    # (b) global defaults
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

# --------------------------------------------------------------------------
# public API
# --------------------------------------------------------------------------
def rf_predict(                       # call this from your service
    timestamp: str,
    zone_id: int,
    temp: float,
    prcp: float,
    interest: float,
    zone_tourist_count: int | None = None,
    tourist_ratio: float | None = None
) -> float:
    """
    Return predicted total_flow (people).

    Parameters
    ----------
    timestamp : "YYYY-MM-DD HH:MM:SS"
    zone_id   : TLC zone ID (1-263)
    temp      : current temperature (°C)
    prcp      : current precipitation (mm)
    interest  : Google-Trends interest (0-1)
    zone_tourist_count, tourist_ratio : optional real-time overrides
    """
    try:
        dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        raise ValueError("timestamp must be 'YYYY-MM-DD HH:MM:SS'") from e

    req = {
        "zone_id":           zone_id,
        "hour":              dt.hour,
        "weekday":           dt.weekday(),      # 0 = Monday
        "month":             dt.month,
        "day":               dt.day,
        "is_weekend":        int(dt.weekday() >= 5),
        "temp":              temp,
        "prcp":              prcp,
        "interest":          interest,
        "zone_tourist_count": zone_tourist_count,
        "tourist_ratio":      tourist_ratio,
    }

    # fill defaults ➔ one-hot ➔ predict
    X = _onehot_align(pd.DataFrame([_build_payload(req)]))
    y_log = MODEL.predict(X)[0]
    return float(np.expm1(y_log))      # invert log-transform


# --------------------------------------------------------------------------
# smoke-test when run directly
# --------------------------------------------------------------------------
if __name__ == "__main__":
    example = rf_predict(
        timestamp="2025-06-27 18:00:00",
        zone_id=33,
        temp=29.4,
        prcp=0.0,
        interest=0.72,
    )
    print(f"Predicted total_flow = {example:,.1f} ppl")