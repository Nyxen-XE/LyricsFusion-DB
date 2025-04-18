import requests 

data = {
    "From": "Hello"
}
url = "http://localhost:3000/save_lyrics"
req = requests.post(url,data=data)

print(req)