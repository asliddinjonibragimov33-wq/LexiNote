import requests


url = "http://127.0.0.1:5000/sets"

data = {
    "user_id": 1,
    "date": "2026-08-17",
    "title": "Kasblar"
}

response = requests.post(url, json=data)

print(response.status_code)
print(response.json())