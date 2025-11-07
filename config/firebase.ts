// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXKEaMwx1Yc6EmxlBpKQs4qWM8FJ-o4LU",
  authDomain: "spendly-b96d1.firebaseapp.com",
  projectId: "spendly-b96d1",
  storageBucket: "spendly-b96d1.firebasestorage.app",
  messagingSenderId: "661070349887",
  appId: "1:661070349887:web:a37886b10aa2cc382a1a8a",
  measurementId: "G-40RMDHG6FM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//authentication
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})

//database

export const firestore = getFirestore(app)