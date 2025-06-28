// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyAAUwXMVKzyXnIPnslcVtrut66mJ9K34ts",
    authDomain: "buildnow-9d8fb.firebaseapp.com",
    projectId: "buildnow-9d8fb",
    storageBucket: "buildnow-9d8fb.firebasestorage.app",
    messagingSenderId: "892826903781",
    appId: "1:892826903781:web:14328f1871a1574346600c",
    measurementId: "G-5SZJYJ1BYS"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app; 