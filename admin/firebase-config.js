// Firebase Configuration
// Firestore configuration for jobsearch-a3a6c project
const firebaseConfig = {
  apiKey: "AIzaSyBHw7K6HMLa2W_PmN9Yctq4XO3Zsng5PXI",
  authDomain: "jobsearch-a3a6c.firebaseapp.com",
  projectId: "jobsearch-a3a6c",
  storageBucket: "jobsearch-a3a6c.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
  // NOTE: No databaseURL for Firestore (only for Realtime Database)
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
      console.log('Loading CV data for version:', cvVersion);
      const docRef = db.collection('cv-data').doc(cvVersion);
      const doc = await docRef.get();
      
      if (doc.exists) {
        const docData = doc.data();
        console.log('Document data:', docData);
        
        // Data is stored as JSON string to avoid Firestore restrictions
        if (docData.cvData) {
          // If cvData is already a string, parse it
          if (typeof docData.cvData === 'string') {
            return JSON.parse(docData.cvData);
          }
          // If it's already an object, return it
          return docData.cvData;
        }
        // Fallback for old format
        return docData;
      } else {
        console.log('No CV data found for version:', cvVersion);
        return null;
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
      console.error('Error details:', error.message);
      return null;
    }
  },

  // Save CV data to Firestore (requires authentication)
  async saveCVData(cvVersion, data, passwordHash) {
    try {
      console.log('Saving CV data for version:', cvVersion);
      
      // Verify password
      const isValid = await this.verifyPassword(passwordHash);
      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Store as JSON string to avoid Firestore field name restrictions
      const docRef = db.collection('cv-data').doc(cvVersion);
      const saveData = {
        cvData: typeof data === 'string' ? data : JSON.stringify(data),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        version: cvVersion
      };
      
      console.log('Saving data:', saveData);
      await docRef.set(saveData);
      
      console.log('CV data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving CV data:', error);
      console.error('Error details:', error.message);
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
