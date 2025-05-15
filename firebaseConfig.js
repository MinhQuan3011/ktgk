// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdHHgMTnPTRR550OtyDt_5r-nersnMKPY",
  authDomain: "appkt-b750e.firebaseapp.com",
  projectId: "appkt-b750e",
  storageBucket: "appkt-b750e.firebasestorage.app",
  messagingSenderId: "1058950985721",
  appId: "1:1058950985721:web:183f966ef99de8e2dd2f28",
  measurementId: "G-X2G2HSMBZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);