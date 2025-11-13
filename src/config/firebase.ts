// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBS-UxGjKMGGg_4mjttKewyU6jvmAOf42k",
  authDomain: "new-pr-app.firebaseapp.com",
  projectId: "new-pr-app",
  storageBucket: "new-pr-app.firebasestorage.app",
  messagingSenderId: "305812612220",
  appId: "1:305812612220:web:77963486a4b5402d8215f9",
  measurementId: "G-5T0V79PNM5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

