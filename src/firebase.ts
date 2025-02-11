// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyBKFAxF9V4Zyi3lDPmLlRmekYTTXIA17BU",
  authDomain: "imdbclone-89870.firebaseapp.com",
  projectId: "imdbclone-89870",
  storageBucket: "imdbclone-89870.firebasestorage.app",
  messagingSenderId: "311588045083",
  appId: "1:311588045083:web:b66ab6cd798251e25ed3be",
  measurementId: "G-J8739B56MR"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
const db = getFirestore(app);



export { db };