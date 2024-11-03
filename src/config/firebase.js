// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEOjKQpZ2pH_51smW96TeoV-5aZ-dNYZI",
  authDomain: "trackboti1.firebaseapp.com",
  databaseURL: "https://trackboti1-default-rtdb.firebaseio.com",
  projectId: "trackboti1",
  storageBucket: "trackboti1.firebasestorage.app",
  messagingSenderId: "2407238240",
  appId: "1:2407238240:web:8832408b0bd5230b6f9105",
  measurementId: "G-JCHSDTV5Q2"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

if (process.env.NODE_ENV === 'development') {
  try {
    connectDatabaseEmulator(db, 'localhost', 9000);
  } catch (e) {
    console.log('Emulator not running');
  }
}


export { db };