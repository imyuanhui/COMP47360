from pytrends.request import TrendReq
from datetime import datetime, timedelta
import time, random, math

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
        
        df_y = df.loc[(df.index >= y_start) & (df.index <= y_end)]
        avg_interest = df_y[zone_name].mean() if zone_name in df_y else DEFAULT_INTEREST

        print(f"[INFO] Average interest for '{zone_name}': {avg_interest:.2f}")
        return avg_interest

    except Exception as e:
        print(f"[ERROR] Trends API failed for '{zone_name}': {e}. Returning default {DEFAULT_INTEREST}.")
        return DEFAULT_INTEREST