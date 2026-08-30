import requests

latitude = 31.5204
longitude = 74.3587

url = (
    f"https://api.open-meteo.com/v1/forecast?"
    f"latitude={latitude}&longitude={longitude}"
    f"&hourly=precipitation,rain"
    f"&forecast_days=1"
)

response = requests.get(url)

print(response.status_code)
print(response.json())