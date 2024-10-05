// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyPe2QtLOLe_-NinbKRuh53vjsEunYWGo",
  authDomain: "poster-9656b.firebaseapp.com",
  projectId: "poster-9656b",
  storageBucket: "poster-9656b.appspot.com",
  messagingSenderId: "229488390978",
  appId: "1:229488390978:web:dde9634edd055e520b0edb",
  measurementId: "G-TJQNDJ7XD9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore();




