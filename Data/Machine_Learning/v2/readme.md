# NYC Zone Traffic-Flow Model — Quick Start Guide

---

## 1. Files

| File name            | Description                                                               |
|----------------------|---------------------------------------------------------------------------|--------------|
| **`ML_RF_v2.pkl`**   | Pickled dictionary `{ "model": RandomForestRegressor, "features_r": list[str] }` |
| **`zone_defaults.json`**   | Static per-zone features (`coco_group`, `category_top`, `zone_tourist_count`, …) |
| **`global_defaults.json`** | Global mean features (`temp_hist`, `prcp_hist`, …)                       |

> **Note:** If `features_r` is **not** embedded in the pickle, also ship `features_r.json`.

---

## 2. Backend integration – minimal Python example

```python
import json, joblib, pandas as pd, numpy as np

# -------------------------------------------------------------------
# Load resources
# -------------------------------------------------------------------
bundle      = joblib.load('ML_RF_v2.pkl')
model       = bundle['model']
features_r  = bundle['features_r']                 # ordered feature list

ZONE   = {z['zone_id']: z
          for z in json.load(open('zone_defaults.json', encoding='utf-8'))}
GLOBAL = json.load(open('global_defaults.json', encoding='utf-8'))

# -------------------------------------------------------------------
# Helper functions
# -------------------------------------------------------------------
def build_payload(req: dict) -> dict:
    """Merge real-time fields with static defaults."""
    zone_id = req['zone_id']
    payload = req.copy()
    payload.update(ZONE.get(zone_id, {}))          # per-zone constants
    for k, v in GLOBAL.items():                    # global averages
        payload.setdefault(k, v)
    return payload

def onehot_align(df_raw: pd.DataFrame) -> pd.DataFrame:
    """One-hot encode and align to *exactly* `features_r` order."""
    dummies = pd.get_dummies(df_raw, prefix_sep='_')
    for col in features_r:                         # add missing dummy cols
        if col not in dummies:
            dummies[col] = 0
    return dummies[features_r]

def predict(request_json: dict) -> float:
    """Return predicted `total_flow` (people)."""
    X = onehot_align(pd.DataFrame([build_payload(request_json)]))
    y_log = model.predict(X)[0]
    return float(np.expm1(y_log))                  # invert log-transform



#-------------------------------
# mimal request example
#--------------------------------

{
  "zone_id": 3,
  "hour": 18,
  "weekday": 4,
  "month": 6,
  "day": 27,
  "is_weekend": 0,
  "temp": 29.4,
  "prcp": 0.0,
  "interest": 0.72,
}

call predict(request) will returns total_flow(people)


### note
can make sure if `features_r` (order of cols for machine) is in pkl file
#-----test-------
bundle = joblib.load('ML_RF_v2.pkl')
assert 'features_r' in bundle and isinstance(bundle['features_r'], list)
#-----------------