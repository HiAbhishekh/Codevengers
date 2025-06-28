# Firebase Authentication Setup Guide

## 🔥 Firebase Configuration

To enable Google authentication in your BuildNow app, follow these steps:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `buildnow-ai` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Google** sign-in provider:
   - Click on Google
   - Toggle **Enable**
   - Add your project support email
   - Click **Save**

### 3. Add Web App to Firebase

1. In project overview, click the **Web** icon (`</>`)
2. Register your app with name: `BuildNow Client`
3. **DO NOT** check "Firebase Hosting" (we'll use Vite)
4. Click **Register app**
5. Copy the Firebase configuration object

### 4. Update Configuration

1. Open `client/src/firebase/config.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 5. Configure Authorized Domains

1. In Firebase Console → Authentication → Settings → Authorized domains
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (when deploying)

### 6. Test Authentication

1. Start your development server: `npm run dev`
2. Click "Sign In" button
3. Try Google authentication
4. Check browser console for any errors

## 🔒 Security Best Practices

- Never commit your Firebase config with real API keys to public repositories
- Use environment variables for production deployments
- Set up Firebase Security Rules for your database (if using Firestore)
- Enable app verification for production

## 🚀 Ready to Go!

Your Firebase authentication is now set up! Users can:
- Sign in with Google
- Sign up with email/password
- Sign in with email/password  
- View their profile
- Sign out

The authentication state is managed globally through React Context and persists across page refreshes. 