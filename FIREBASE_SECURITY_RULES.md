# Firebase Firestore Security Rules

The admin panel needs to save CV data to Firestore. Update your Firestore Security Rules in the Firebase Console to allow writes:

## Setup Instructions:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `jobsearch-a3a6c`
3. Navigate to: **Firestore Database** → **Rules** tab
4. Replace the rules with the following:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to cv-data collection (public editing)
    match /cv-data/{document=**} {
      allow read, write: if true;
    }
    
    // Restrict admin config to read-only
    match /admin/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Alternative - More Restrictive Rules (Recommended):

If you want to restrict writes to specific IP addresses or add back some authentication:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to cv-data for everyone
    match /cv-data/{document=**} {
      allow read: if true;
      allow write: if request.auth != null || request.headers['Authorization'] == 'Bearer admin-token';
    }
  }
}
```

## After updating rules:
- Click **Publish** to save the changes
- Wait a few seconds for the rules to take effect
- Try saving from the admin panel again

The first option (allow read, write: if true) is simpler but completely public. The second option requires authentication.
