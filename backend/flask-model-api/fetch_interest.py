from pytrends.request import TrendReq

DEFAULT_INTEREST = 0  # fallback if trends data is missing

def fetch_interest(zone_name, timeframe='now 1-d', geo='US-NY-501'):
    """
    Fetch average Google Trends interest for the given zone_name.
    Returns DEFAULT_INTEREST if data is missing or API fails.
    """
    print(f"[INFO] Fetching Google Trends data for '{zone_name}'...")
    pytrends = TrendReq(hl='en-US', tz=360)

    try:
        pytrends.build_payload([zone_name], geo=geo, timeframe=timeframe)
        df = pytrends.interest_over_time().reset_index()

        print(f"[DEBUG] DataFrame returned:\n{df}")

        if df.empty:
            print(f"[WARN] No trends data for '{zone_name}' in timeframe '{timeframe}'. Returning default {DEFAULT_INTEREST}.")
            return DEFAULT_INTEREST

        valid_rows = df[df['isPartial'] == False]
        if valid_rows.empty:
            print(f"[WARN] No complete trends data for '{zone_name}'. Returning default {DEFAULT_INTEREST}.")
            return DEFAULT_INTEREST

        avg_interest = valid_rows[zone_name].mean()
        print(f"[INFO] Average interest for '{zone_name}': {avg_interest:.2f}")
        return avg_interest

    except Exception as e:
        print(f"[ERROR] Trends API failed for '{zone_name}': {e}. Returning default {DEFAULT_INTEREST}.")
        return DEFAULT_INTEREST