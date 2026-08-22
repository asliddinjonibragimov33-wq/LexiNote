import requests


word_id = 1

url = f"http://127.0.0.1:5000/words/{word_id}"


response = requests.delete(url)


print("Status:", response.status_code)
print("Response:", response.text)