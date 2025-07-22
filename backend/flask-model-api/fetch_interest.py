from pytrends.request import TrendReq
from datetime import datetime, timedelta
import time, random, math
import json
from pathlib import Path
import pandas as pd

DEFAULT_INTEREST = 0  # fallback if trends data is missing

def fetch_interest(zone_name, timeframe='now 7-d', geo='US-NY', tz=360):
    """
    Fetch average Google Trends interest for the given zone_name.
    Returns DEFAULT_INTEREST if data is missing or API fails.
    """
    print(f"[INFO] Fetching Google Trends data for '{zone_name}'...")
    pytrends = TrendReq(hl='en-US', tz=tz)

    # Define yesterday's 24‑hour window in local time
    yesterday = datetime.now() - timedelta(days=1)
    y_start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
    y_end = yesterday.replace(hour=23, minute=59, second=59, microsecond=0)

    try:
        pytrends.build_payload([zone_name], geo=geo, timeframe=timeframe)
        df = pytrends.interest_over_time().reset_index()

        print(f"[DEBUG] DataFrame returned:\n{df}")

        if df.empty:
            print(f"[WARN] No trends data for '{zone_name}' in timeframe '{timeframe}'. Returning default {DEFAULT_INTEREST}.")
            return DEFAULT_INTEREST
        
        # df_y = df.loc[(df.index >= y_start) & (df.index <= y_end)]
        df_y = df.loc[(df["date"] >= y_start) & (df["date"] <= y_end)]

        avg_interest = df_y[zone_name].mean() if zone_name in df_y else DEFAULT_INTEREST

        print(f"[INFO] Average interest for '{zone_name}': {avg_interest:.2f}")
        return avg_interest

    except Exception as e:
        print(f"[ERROR] Trends API failed for '{zone_name}': {e}. Returning default {DEFAULT_INTEREST}.")
        return DEFAULT_INTEREST
    


#ADD
CACHE_FILE = Path(__file__).parent / "trends_cache.json"
DEFAULT_ZONE_FILE = Path(__file__).parent / "default_zone_interest.csv"

default_zone_interest_map = {}
if DEFAULT_ZONE_FILE.exists():
    df_default = pd.read_csv(DEFAULT_ZONE_FILE)
    for _, row in df_default.iterrows():
        default_zone_interest_map[row['keyword']] = row['interest']
        

def get_cached_interest(zone_name):
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # Read cache if exists and is for today
    if CACHE_FILE.exists():
        with open(CACHE_FILE) as f:
            cache = json.load(f)

        if cache.get("date") == today_str:
            data = cache.get("data", {})
            if zone_name in data:
                print(f"[CACHE] Using cached interest for {zone_name}")
                return data[zone_name]
    else:
        cache = {"date": today_str, "data": {}}

    print(f"[FETCH] No cache or expired. Fetching new data for {zone_name}")
    interest = fetch_interest(zone_name)

    if interest != DEFAULT_INTEREST:
        cache["data"][zone_name] = interest
        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f)
        return interest
    else:
        fallback = default_zone_interest_map.get(zone_name, DEFAULT_INTEREST)
        print(f"[FALLBACK] Using default average for {zone_name}: {fallback}")
        return fallback