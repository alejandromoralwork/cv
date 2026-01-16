// Firebase Configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let app, db;

function initializeFirebase() {
  if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
    return true;
  } else {
    console.error('Firebase SDK not loaded');
    return false;
  }
}

// CV Data Management
const CVDatabase = {
  // Load CV data from Firestore
  async loadCVData(cvVersion = 'neutral-finance') {
    try {
      const docRef = db.collection('cv-data').doc(cvVersion);
      const doc = await docRef.get();
      
      if (doc.exists) {
        const docData = doc.data();
        // Data is stored as JSON string to avoid Firestore restrictions
        if (docData.cvData) {
          return JSON.parse(docData.cvData);
        }
        // Fallback for old format
        return docData;
      } else {
        console.log('No CV data found for version:', cvVersion);
        return null;
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
      return null;
    }
  },

  // Save CV data to Firestore (requires authentication)
  async saveCVData(cvVersion, data, passwordHash) {
    try {
      // Verify password
      const isValid = await this.verifyPassword(passwordHash);
      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Store as JSON string to avoid Firestore field name restrictions
      const docRef = db.collection('cv-data').doc(cvVersion);
      await docRef.set({
        cvData: JSON.stringify(data),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        version: cvVersion
      });
      
      console.log('CV data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving CV data:', error);
      throw error;
    }
  },

  // Verify password against stored hash
  async verifyPassword(inputHash) {
    try {
      const configDoc = await db.collection('admin').doc('config').get();
      if (configDoc.exists) {
        const storedHash = configDoc.data().passwordHash;
        return inputHash === storedHash;
      }
      return false;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },

  // Initialize admin password (run once)
  async initializePassword(password) {
    try {
      const hash = await this.hashPassword(password);
      await db.collection('admin').doc('config').set({
        passwordHash: hash,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Admin password initialized');
      return hash;
    } catch (error) {
      console.error('Error initializing password:', error);
      throw error;
    }
  },

  // Hash password using SHA-256
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  // Load all CV versions metadata
  async loadAllVersions() {
    try {
      const snapshot = await db.collection('cv-data').get();
      const versions = {};
      snapshot.forEach(doc => {
        versions[doc.id] = doc.data();
      });
      return versions;
    } catch (error) {
      console.error('Error loading versions:', error);
      return {};
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, CVDatabase, initializeFirebase };
}
