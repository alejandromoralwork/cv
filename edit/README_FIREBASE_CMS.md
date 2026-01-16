# Firebase CV CMS - Quick Start Guide

## 🎯 Overview

Your CV system now supports **full database-driven content management**. All CV content (personal info, work experience, education, skills, projects, etc.) can be edited via a web interface and stored in Firebase.

## 📁 New Files Created

1. **cv-data-complete.json** - Complete data for all 7 CV versions (generated)
2. **cv-data-loader.js** - Script to load CV content from Firebase or JSON
3. **firebase-config.js** - Firebase configuration and database functions
4. **admin.html** - Web-based admin panel for editing CV content
5. **generate-complete-data.ps1** - PowerShell script to regenerate complete data
6. **FIREBASE_SETUP.md** - Detailed Firebase setup instructions

## 🚀 Quick Setup (3 Steps)

### Step 1: Generate Complete Data (✅ DONE)

The complete CV data for all 7 versions has been generated in `cv-data-complete.json`.

### Step 2: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (e.g., "cv-cms")
3. Enable Firestore Database (production mode)
4. Get your Firebase config from Project Settings
5. Update `firebase-config.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### Step 3: Initialize Password & Upload Data

1. Open `admin.html` in your browser
2. Open browser console (F12)
3. Run this code to set your password:

```javascript
initializeFirebase();
CVDatabase.initializePassword('your-password-here').then(() => {
  console.log('Password set!');
});
```

4. Login to admin panel with your password
5. Select each CV version and click "Save Changes" to upload to Firebase

## 📊 Data Structure

Each CV version now contains **complete** data:

```json
{
  "neutral-finance": {
    "personal": {
      "name": "Alejandro Moral Aranda",
      "jobTitle": "Finance & Data Analytics Professional",
      "photo": "yo.png",
      "about": "..."
    },
    "contact": {
      "phone": "+34 675949628",
      "location": "Luxembourg",
      "email": "alejandromoralcontact@gmail.com",
      "website": "https://alemxral.github.io/cv/finance/",
      "github": "https://www.github.com/alejandromoralwork"
    },
    "education": [...],
    "workExperience": [...],
    "skills": [...],
    "interests": [...],
    "languages": [...],
    "projects": [...]
  }
}
```

## 🔄 Workflow

### Editing Content

1. **Via Admin Panel** (Recommended)
   - Open `edit/admin.html`
   - Login with your password
   - Select CV version
   - Edit in JSON editor or Visual editor
   - Click "Save Changes"
   - Changes automatically sync to Firebase

2. **Via JSON File** (For bulk updates)
   - Edit `edit/cv-versions.json` (for overrides)
   - Run `.\generate-complete-data.ps1`
   - Upload via admin panel

### Updating Public CV Versions

**Option A: Keep Static (Current Setup)**
- CVs remain static HTML files
- Rebuild using `.\build-versions.ps1` when needed
- Fast loading, no Firebase dependency for public site

**Option B: Dynamic Loading (Advanced)**
- Uncomment Firebase scripts in `index.html`:
  ```html
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="./firebase-config.js"></script>
  <script src="./cv-data-loader.js"></script>
  ```
- CVs load content from Firebase in real-time
- Edit once, updates instantly across all versions

## 📝 Admin Panel Features

### Three Editing Modes:

1. **JSON Editor**
   - Full control over all data
   - Syntax validation
   - Direct JSON editing

2. **Visual Editor**
   - Form-based editing for basic fields
   - Personal info, contact details
   - User-friendly interface

3. **Preview**
   - See changes in real-time
   - Preview specific CV version
   - Test before publishing

## 🔐 Security

- **Password Protection**: SHA-256 hashed passwords
- **Firebase Rules**: Read-only public access, write requires authentication
- **Admin Panel**: Keep in `/edit/` folder (block in robots.txt)
- **Git Safety**: Never commit real Firebase credentials

## 🛠️ Maintenance

### Regenerate Complete Data

If you update `cv-versions.json`, regenerate complete data:

```powershell
cd edit
.\generate-complete-data.ps1
```

This updates `cv-data-complete.json` with:
- Latest work description overrides
- Education description overrides
- Project filters
- Experience ordering
- Updated URLs for each version

### Backup Data

1. **Export from Firebase Console**
   - Firestore → Export data
   
2. **Local Backup**
   - `cv-data-complete.json` serves as backup
   - Or download JSON from admin panel

## 📂 File Organization

```
cv/
├── edit/                                  # Private admin area
│   ├── admin.html                        # Admin panel
│   ├── firebase-config.js                # Firebase setup
│   ├── cv-data-loader.js                 # Dynamic loader
│   ├── cv-data-complete.json             # Complete data (all versions)
│   ├── cv-versions.json                  # Config & overrides
│   ├── generate-complete-data.ps1        # Data generator
│   ├── build-versions.ps1                # Static builder
│   └── FIREBASE_SETUP.md                 # Setup guide
│
├── finance/                              # Public CV versions
├── fund-accounting/                      # (static HTML or dynamic)
├── developer/
└── ...
```

## 🎨 Customization

### Adding New Fields

1. Edit `cv-data-complete.json` structure
2. Update `cv-data-loader.js` populate functions
3. Add form fields in admin.html visual editor (optional)
4. Update HTML template in `index.html` to display field

### Adding New CV Version

1. Add version to `cv-versions.json` with overrides
2. Run `.\generate-complete-data.ps1`
3. Upload to Firebase via admin panel
4. Add to `build-versions.ps1` directory mapping
5. Run `.\build-versions.ps1` to generate static version

## 🌐 Deployment Options

### Static Site (Current)
✅ Fast loading  
✅ No Firebase dependency for visitors  
✅ SEO-friendly  
❌ Must rebuild after edits  

### Dynamic Site (Advanced)
✅ Instant updates  
✅ Edit once, update everywhere  
✅ No rebuild needed  
❌ Requires Firebase on client side  
❌ Slightly slower initial load  

### Hybrid (Recommended)
✅ Best of both worlds  
- Edit via admin panel → Firebase
- Scheduled rebuild (e.g., GitHub Actions)
- Static sites auto-update from Firebase data

## 📞 Support

For detailed Firebase setup, see `FIREBASE_SETUP.md`

## ✅ Next Steps

1. [ ] Set up Firebase project
2. [ ] Update firebase-config.js with credentials
3. [ ] Initialize admin password
4. [ ] Upload CV data to Firebase
5. [ ] Test editing in admin panel
6. [ ] Choose static or dynamic deployment
7. [ ] Add robots.txt to block /edit/ folder
