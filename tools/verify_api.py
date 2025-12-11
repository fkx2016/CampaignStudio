import requests
import json

BASE_URL = "http://localhost:8001"

def check_api():
    print(f"Checking API at {BASE_URL}...")
    
    # 1. Check Health
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"Health: {r.status_code} {r.text}")
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return

    # 2. Check Posts (Should be Public now)
    try:
        r = requests.get(f"{BASE_URL}/api/posts")
        print(f"Posts Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"Posts Found: {len(data)}")
            if len(data) > 0:
                print(f"Sample Post: {data[0]['title']}")
        else:
            print(f"Error: {r.text}")
    except Exception as e:
        print(f"Posts Check Failed: {e}")

    # 3. Check Campaigns
    try:
        r = requests.get(f"{BASE_URL}/api/campaigns")
        print(f"Campaigns Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"Campaigns Found: {len(data)}")
    except Exception as e:
        print(f"Campaigns Check Failed: {e}")

if __name__ == "__main__":
    check_api()
