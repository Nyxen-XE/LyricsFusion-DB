const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

const { getFirestore } = require('firebase-admin/firestore');

const server = express();

// Middleware
server.use(cors()); // Optional: Enable if frontend will talk to it
server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),// Replace escaped newlines with actual newlines

  }),
});

// console.log(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'))

const db = getFirestore();
const lyricsCollection = db.collection("Lyrics");


// API Route to Save Lyrics
server.post('/save_lyrics', async (req, res) => {
  try {
    const lyricsData = req.body;

    // Basic Validation
    if (!lyricsData) {
        console.error(`[LYRICS][❌] Validation failed:`, lyricsData);
        //Save errors to Firestore
        await db.collection("Errors").add({
            error: "No data provided",
            timestamp: new Date()
        });
        return res.status(400).json({ message: "Missing required fields: title, artist, lyrics" });
    }


 
    // Add timestamp
    lyricsData.timestamp = new Date();

    await lyricsCollection.add(lyricsData);
    console.log("Lyrics saved successfully:", lyricsData);
    res.status(200).json({ message: "Lyrics saved successfully." });

  } catch (error) {
    console.error(`[LYRICS][❌] Save failed:`, error.message);
    await db.collection("Errors").add({
        error: error.message,
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
