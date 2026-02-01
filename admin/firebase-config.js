// Firebase Configuration - CLEAN VERSION (no password logic)
// Firestore configuration for jobsearch-a3a6c project
const firebaseConfig = {
  apiKey: "AIzaSyBHw7K6HMLa2W_PmN9Yctq4XO3Zsng5PXI",
  authDomain: "jobsearch-a3a6c.firebaseapp.com",
  projectId: "jobsearch-a3a6c",
  storageBucket: "jobsearch-a3a6c.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
let app, db;

function normalizeVersionKey(version) {
  if (!version) return version;
  const normalized = String(version).trim().toLowerCase();
  const versionMap = {
    'data-science': 'data_science',
    'data_science': 'data_science',
    'fintech': 'fintech',
    'fund-accounting': 'fund_accounting',
    'fund_accounting': 'fund_accounting',
    'investment': 'investment_analysis',
    'investment-analysis': 'investment_analysis',
    'investment_analysis': 'investment_analysis',
    'finance': 'neutral_finance',
    'neutral-finance': 'neutral_finance',
    'neutral_finance': 'neutral_finance',
    'developer': 'pure_coding',
    'pure-coding': 'pure_coding',
    'pure_coding': 'pure_coding',
    'reporting-analyst': 'reporting_analyst',
    'reporting_analyst': 'reporting_analyst',
    'reporting analyst': 'reporting_analyst'
  };
  if (versionMap[normalized]) return versionMap[normalized];
  return normalized.includes('-') ? normalized.replace(/-/g, '_') : normalized;
}

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
  async loadCVData(cvVersion = 'neutral_finance') {
    try {
      const firebaseVersion = normalizeVersionKey(cvVersion);
      console.log('Loading CV data for version:', firebaseVersion);
      const docRef = db.collection('cv-data').doc(firebaseVersion);
      const doc = await docRef.get();
      
      if (doc.exists) {
        const docData = doc.data();
        console.log('Document data:', docData);
        
        // Data is stored as JSON string to avoid Firestore restrictions
        if (docData.cvData) {
          if (typeof docData.cvData === 'string') {
            return JSON.parse(docData.cvData);
          }
          return docData.cvData;
        }
        // Fallback for old format
        return docData;
      } else {
        console.log('No CV data found for version:', firebaseVersion);
        return null;
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
      console.error('Error details:', error.message);
      return null;
    }
  },

  // Save CV data to Firestore - NO PASSWORD VERIFICATION
  async saveCVData(cvVersion, data) {
    try {
      const firebaseVersion = normalizeVersionKey(cvVersion);
      console.log('Saving CV data for version:', firebaseVersion);

      const docRef = db.collection('cv-data').doc(firebaseVersion);
      const saveData = {
        cvData: typeof data === 'string' ? data : JSON.stringify(data),
        lastUpdated: new Date().toISOString(),
        version: firebaseVersion
      };
      
      console.log('Saving document...');
      await docRef.set(saveData, { merge: true });
      
      console.log('CV data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving CV data:', error);
      console.error('Firebase error code:', error.code);
      console.error('Firebase error message:', error.message);
      throw error;
    }
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
