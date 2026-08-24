import requests


url = "http://127.0.0.1:5000/sets/1/words"

data = {
    "word": "Doctor",
    "translation": "Shifokor",
    "definition": "A person who treats sick people.",
    "example": "My brother is a doctor."
}

response = requests.post(url, json=data)

print(response.status_code)
print(response.json())
