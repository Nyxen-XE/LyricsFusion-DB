const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./private-key/secret-file.json');

const server = express();

// Middleware
server.use(cors()); // Optional: Enable if frontend will talk to it
server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Firebase Admin Init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();
const lyricsCollection = db.collection("Lyrics");
const errosCollection = db.collection("Errors")

// API Route to Save Lyrics
server.post('/save_lyrics', async (req, res) => {
  try {
    const lyricsData = req.body;

    // Basic Validation
    if (!lyricsData || !lyricsData.title || !lyricsData.artist || !lyricsData.lyrics) {
        // Save error to Firestore
        await errosCollection.add({
            error: "Missing required fields",
            data: lyricsData,
            timestamp: new Date()
        });
        return res.status(400).json({ message: "Missing required fields: title, artist, lyrics" });
    }

    // Add timestamp
    lyricsData.timestamp = new Date();

    await lyricsCollection.add(lyricsData);
    console.log(`[LYRICS][✔] Saved: "${lyricsData.title}" by ${lyricsData.artist}`);
    res.status(200).json({ message: "Lyrics saved successfully." });

  } catch (error) {
    console.error(`[LYRICS][❌] Save failed:`, error.message);
    await errosCollection.add({
      error: "Internal Server Error",
      data: req.body,
      timestamp: new Date()
    });

    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Test Ping Route
server.get('/', (req, res) => {
  res.send("🧠 LyricsFusion Backend is alive.");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🎵 Server running at http://localhost:${PORT}`);
});
