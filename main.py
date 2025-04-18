import requests

url = 'http://localhost:3000/save_lyrics'
myobj = {"somekey": "Mykey"}
res = requests.post(url,myobj)
print(res.text)