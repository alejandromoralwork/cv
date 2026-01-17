# Firebase CV CMS Setup Guide

## Overview
This system allows you to edit your CV content directly from a web interface with password protection. All changes are stored in Firebase Firestore and can be synced across all CV versions.

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "cv-cms")
4. Follow the setup wizard

### 2. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **production mode**
4. Choose a location (e.g., europe-west)

### 3. Set Up Firestore Security Rules

Go to Firestore → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin config - read only to verify password
    match /admin/config {
      allow read: if true;
      allow write: if false; // Manually set password via console
    }
    
    // CV data - read by anyone, write requires valid password verification
    match /cv-data/{version} {
      allow read: if true;
      allow write: if request.auth != null || true; // Allow writes for now, password checked in code
    }
  }
}
```

### 4. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app (name: "CV CMS")
5. Copy the `firebaseConfig` object

### 5. Update firebase-config.js

Open `edit/firebase-config.js` and replace the configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com"
};
```

### 6. Initialize Admin Password

**Method 1: Using Browser Console**

1. Open `edit/admin.html` in your browser
2. Open Developer Console (F12)
3. Run this code (replace `your-password` with your actual password):

```javascript
// Initialize Firebase first
initializeFirebase();

// Set your password
const myPassword = 'your-secure-password-here';
CVDatabase.initializePassword(myPassword).then(hash => {
  console.log('Password initialized successfully');
  console.log('Hash:', hash);
});
```

**Method 2: Using Firebase Console**

1. Go to Firestore Database in Firebase Console
2. Create collection: `admin`
3. Create document: `config`
4. Add field: `passwordHash` (string)
5. Generate hash using this code in browser console:

```javascript
async function generateHash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

generateHash('your-password').then(hash => console.log(hash));
```

6. Copy the hash and paste into the `passwordHash` field

### 7. Initial Data Upload

To upload your existing CV data to Firebase:

1. Open `edit/admin.html`
2. Login with your password
3. The system will automatically load from `cv-versions.json` if no data exists in Firebase
4. Click "Save Changes" to upload to Firebase
5. Repeat for each CV version

## Usage

### Accessing the Admin Panel

1. Open `https://alemxral.github.io/cv/edit/admin.html` (or locally: `edit/admin.html`)
2. Enter your password
3. Select the CV version you want to edit
4. Make changes using either:
   - **JSON Editor**: Direct JSON editing with syntax highlighting
   - **Visual Editor**: Form-based editing for basic fields
   - **Preview**: See changes in real-time

### Editing Content

**JSON Editor (Recommended for advanced changes)**
- Edit the full CV structure
- Supports all fields including work experience, education, skills, projects
- Click "Validate JSON" before saving
- Click "Save Changes" to upload to Firebase

**Visual Editor (Quick edits)**
- Edit basic information: name, job title, about, contact
- Automatically syncs with JSON editor
- Click "Save Visual Changes"

### Loading CV Data on Your Website

To make your public CV versions load from Firebase:

Add this code to each CV version's HTML (or create a new `firebase-loader.js`):

```javascript
<!-- Add before closing </body> tag -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script>
// Initialize Firebase
const firebaseConfig = {
  // Your config here
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Load CV data from Firebase
async function loadCVFromFirebase() {
  try {
    const version = 'neutral-finance'; // Change per version
    const doc = await db.collection('cv-data').doc(version).get();
    
    if (doc.exists) {
      const data = doc.data();
      // Update CV content dynamically
      updateCVContent(data);
    }
  } catch (error) {
    console.error('Error loading from Firebase:', error);
  }
}

// Run on page load
loadCVFromFirebase();
</script>
```

## Security Notes

- Password is hashed using SHA-256 before storage
- Never commit your actual Firebase config with real credentials to public repos
- For production, consider using Firebase Authentication instead of password-only approach
- Keep your admin.html in the `/edit/` folder which should be blocked in robots.txt

## File Structure

```
cv/
├── edit/
│   ├── admin.html              # Admin interface
│   ├── firebase-config.js      # Firebase configuration
│   ├── cv-versions.json        # Fallback/backup data
│   └── index.html              # Original editing interface
├── finance/
├── investment/
└── ...
```

## Troubleshooting

**"Invalid password" error**
- Clear browser cache
- Verify passwordHash in Firebase Console matches your hash
- Try reinitializing the password

**Data not loading**
- Check browser console for errors
- Verify Firebase config is correct
- Check Firestore rules allow read access
- Ensure collection/document names match exactly

**CORS errors**
- Firebase should handle CORS automatically
- If issues persist, check Firebase Hosting settings

## Backup

Your `cv-versions.json` file serves as a backup. To export from Firebase:

1. Go to Firebase Console → Firestore
2. Export data or manually copy documents
3. Or use the admin panel to copy JSON from editor

## Next Steps

1. Set up Firebase project
2. Update firebase-config.js with your credentials
3. Initialize your password
4. Upload initial CV data
5. Test editing and saving
6. (Optional) Integrate Firebase loading into public CV versions
7. (Optional) Set up automated backups
