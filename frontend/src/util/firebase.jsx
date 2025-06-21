// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBNzfcOkWu4wDZgjS75pdBnXBmAhgbw6Zg",
  authDomain: "file-transfer-by-socketio.firebaseapp.com",
  projectId: "file-transfer-by-socketio",
  storageBucket: "file-transfer-by-socketio.firebasestorage.app",
  messagingSenderId: "1073877552974",
  appId: "1:1073877552974:web:2452ab099842a1cd15d81f",
  measurementId: "G-YHZWTCG3BD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();