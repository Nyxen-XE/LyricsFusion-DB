import requests

url = 'https://lyricsfusion-db.onrender.com/save_lyrics'
myobj = {"somekey": "Mykey"}
res = requests.post(url,myobj)
print(res.text)