
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCk_YIdjL9flCack3d3ukQuL57zQ1Pkq2s",
  authDomain: "routecraft-99b7e.firebaseapp.com",
  projectId: "routecraft-99b7e",
  storageBucket: "routecraft-99b7e.firebasestorage.app",
  messagingSenderId: "30749047721",
  appId: "1:30749047721:web:816cb88556c86cbb03e2b8",
  measurementId: "G-K4QEXR9XG3"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig); 
export const analytics = getAnalytics(app);

