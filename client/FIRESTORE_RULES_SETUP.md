# Firestore Security Rules Setup Guide

## 🔒 Security Rules Overview

The `firestore.rules` file contains comprehensive security rules for your BuildNow project that ensure:

- **User Authentication**: Only authenticated users can access data
- **Data Isolation**: Users can only access their own projects
- **Data Validation**: Strict validation of data structure and content
- **Protection Against Malicious Data**: Prevents injection attacks and data corruption

## 🚀 How to Deploy These Rules

### Method 1: Firebase Console (Recommended for beginners)

1. **Go to Firebase Console**
   - Open [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `buildnow-9d8fb`

2. **Navigate to Firestore**
   - In the left sidebar, click **Firestore Database**
   - Click on the **Rules** tab

3. **Copy and Paste Rules**
   - Open the `firestore.rules` file from your project
   - Copy all the content
   - Paste it into the Firebase Console rules editor
   - Click **Publish** to deploy

### Method 2: Firebase CLI (For developers)

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done)
   ```bash
   firebase init firestore
   ```
   - Select your existing project
   - Choose the default database
   - Use `firestore.rules` as your rules file
   - Choose firestore.indexes.json for indexes

4. **Deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🛡️ What These Rules Protect

### 1. Authentication Required
```javascript
allow read, write: if request.auth != null && request.auth.uid == userId;
```
- Only signed-in users can access data
- Users can only access their own data

### 2. Data Structure Validation
- **Title**: Must be string, 1-200 characters
- **Description**: Must be string, max 1000 characters
- **UserId**: Must match authenticated user
- **Timestamps**: Must be valid strings
- **Status**: Only allows 'active', 'completed', 'paused'

### 3. Progress Tracking Validation
- **completedSteps**: Must be an array
- **currentStep**: Must be a number ≥ 0
- **lastUpdated**: Must be a timestamp string

### 4. Immutable Fields Protection
- Prevents modification of `userId`, `savedAt`, `startedAt`
- Ensures data integrity over time

## 🔍 Testing Your Rules

### Test in Firebase Console
1. Go to **Firestore Database** → **Rules** tab
2. Click on **Rules playground**
3. Test different scenarios:
   - Authenticated user accessing their own data ✅
   - Unauthenticated user accessing data ❌
   - User accessing another user's data ❌

### Test with Your App
1. Try saving a project while signed out → Should fail
2. Try saving a project while signed in → Should work
3. Try accessing another user's projects → Should fail

## 📋 Rule Structure Explained

```
/users/{userId}/savedProjects/{projectId}
├── Read/Write: Only if authenticated and userId matches
├── Create: Must validate project structure
└── Update: Can modify most fields except immutable ones

/users/{userId}/activeProjects/{projectId}
├── Read/Write: Only if authenticated and userId matches
├── Create: Must validate project + progress structure
└── Update: Can modify progress and status
```

## 🚨 Important Security Notes

1. **Never disable authentication checks** in production
2. **Always validate user ownership** before allowing access
3. **Limit field sizes** to prevent DoS attacks
4. **Validate data types** to prevent injection
5. **Make critical fields immutable** (userId, timestamps)

## 🔧 Troubleshooting

### Common Errors

**Error: "Missing or insufficient permissions"**
- Solution: Ensure user is signed in and accessing their own data

**Error: "Invalid document"**
- Solution: Check that required fields are present and valid

**Error: "String too long"**
- Solution: Ensure title ≤ 200 chars, description ≤ 1000 chars

### Testing Rules Locally
```bash
# Install emulator
firebase emulators:start --only firestore

# Test rules
firebase emulators:exec --only firestore "npm test"
```

## ✅ Verification Checklist

After deploying rules, verify:
- [ ] Users can save their own projects
- [ ] Users cannot access other users' projects
- [ ] Unauthenticated users cannot access any data
- [ ] Invalid data structures are rejected
- [ ] String length limits are enforced
- [ ] Progress updates work correctly

Your Firestore database is now secured! 🎉 