import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDV671dRG2H2f-AoE5bSQwWe2EKKMhKqj8",
  authDomain: "storyeditor-45f06.firebaseapp.com",
  projectId: "storyeditor-45f06",
  storageBucket: "storyeditor-45f06.firebasestorage.app",
  messagingSenderId: "1054995231838",
  appId: "1:1054995231838:web:3af4a92160bae1e436b0cf",
  measurementId: "G-N363Y1GK0V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);