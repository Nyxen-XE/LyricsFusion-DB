const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

const { getFirestore } = require('firebase-admin/firestore');

const server = express();
const serviceAccount = require('./private-key/exposure-94eb1-firebase-adminsdk-799fh-b101aed240.json'); // Ensure this file is in the same directory
// Middleware
server.use(cors()); // Optional: Enable if frontend will talk to it

server.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
//Allow post requests from any origin
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
server.use(express.json({ limit: '50mb' })); // Parse JSON bodies (as sent by API clients)

server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
require('dotenv').config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "listify-5fd65.appspot.com",

  databaseURL: "https://listify-5fd65.firebaseio.com",
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
