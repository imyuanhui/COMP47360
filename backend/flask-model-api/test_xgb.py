import pandas as pd
from pandas.api.types import CategoricalDtype
from xgboost_predict import _onehot_align, FEATURES_R

# 測試資料：故意不含 zone_id_3, hour=13
test_df = pd.DataFrame([{
    "zone_id": 1,
    "hour": 9,
    "weekday": 1,
    "month": 2,
    "coco_group": "Clear/Fair",
    "category_top": "restaurant",
    "zone_tourist_count": 50,
    "tourist_ratio": 0.1
}])

# 套用 one-hot 對齊
X = _onehot_align(test_df)

# 驗證結果
# print(f" zone_id_3 存在? {'zone_id_3' in X.columns}")
# print(f" hour_13 存在? {'hour_13' in X.columns}")
# print(f" 欄位數一致? {len(X.columns) == len(FEATURES_R)}")
# print(f" 全部欄位一致? {list(X.columns) == FEATURES_R}")

import requests

payload = {
    "timestamp": "2025-07-21 12:00:00",
    "zone_id": 3,
    "zone_name": "Apollo Theater",
    "weather": {
        "temp": 28.0,
        "prcp": 0.0,
        "weather_id": 800
    },
    # "flow_features": {
    #     "zone_tourist_count": 50,
    #     "tourist_ratio": 0.1
    # }
}

try:
    resp = requests.post("http://localhost:5000/predict/xgb", json=payload, timeout=10)
    print(" Status:", resp.status_code)
    print(" Response:", resp.json())
except Exception as e:
    print("Error calling API:", e)


print("End")