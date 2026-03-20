/* ═══════════════════════════════════════════════════════════════════
   FIREBASE CONFIGURATION
   ═══════════════════════════════════════════════════════════════════

   IMPORTANT: Replace these values with YOUR Firebase project config!
   
   How to get your Firebase config:
   1. Go to https://console.firebase.google.com/
   2. Create a new project (or use existing)
   3. Go to Project Settings > General
   4. Scroll to "Your apps" and click the web icon (</>)
   5. Register app and copy the config object
   6. Go to Firestore Database > Create Database > Start in Test Mode
   7. For production, set proper security rules

   ═══════════════════════════════════════════════════════════════════ */

const FIREBASE_CONFIG = {
  // REPLACE THESE WITH YOUR FIREBASE CONFIG:
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

// Collection reference
const DATA_DOC = "parlor_data"; // Single document for all data

/* ══════════════════════════════════════════════════════
   FIRESTORE HELPER FUNCTIONS
══════════════════════════════════════════════════════ */

// Check if Firebase is configured
function isFirebaseConfigured() {
  return FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY_HERE";
}

// Load data from Firestore
async function loadFromFirestore() {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured, using localStorage");
    return null;
  }
  
  try {
    const doc = await db.collection("abeenaz").doc(DATA_DOC).get();
    if (doc.exists) {
      console.log("✅ Data loaded from Firebase");
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error("Firebase load error:", error);
    return null;
  }
}

// Save data to Firestore
async function saveToFirestore(data) {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured, saving to localStorage only");
    return false;
  }
  
  try {
    await db.collection("abeenaz").doc(DATA_DOC).set(data);
    console.log("✅ Data saved to Firebase");
    return true;
  } catch (error) {
    console.error("Firebase save error:", error);
    return false;
  }
}

// Listen for real-time updates
function listenToFirestore(callback) {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured, no real-time sync");
    return null;
  }
  
  return db.collection("abeenaz").doc(DATA_DOC).onSnapshot((doc) => {
    if (doc.exists) {
      console.log("🔄 Real-time update received");
      callback(doc.data());
    }
  }, (error) => {
    console.error("Firebase listen error:", error);
  });
}
