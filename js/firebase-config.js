// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4nvhHK1f4nxyJ6fnLV9tlyUMK-dUIB3g",
  authDomain: "itsmuttakin-adf2b.firebaseapp.com",
  databaseURL: "https://itsmuttakin-adf2b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "itsmuttakin-adf2b",
  storageBucket: "itsmuttakin-adf2b.firebasestorage.app",
  messagingSenderId: "804285355395",
  appId: "1:804285355395:web:307cfeaabac8423a1b92b6"
};

// Initialize Firebase safely
if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = (typeof firebase !== "undefined" && typeof firebase.auth === "function") ? firebase.auth() : null;
const database = (typeof firebase !== "undefined" && typeof firebase.database === "function") ? firebase.database() : null;
