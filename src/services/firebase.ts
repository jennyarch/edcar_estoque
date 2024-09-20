// import firebase from 'firebase/app';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAMOuJHkMmkPlbdHfm2ATrwoEvigX6IC0c",
    authDomain: "edcar-freios.firebaseapp.com",
    databaseURL: "https://edcar-freios-default-rtdb.firebaseio.com",
    projectId: "edcar-freios",
    storageBucket: "edcar-freios.appspot.com",
    messagingSenderId: "663078992108",
    appId: "1:663078992108:web:ddc3fa5e3458c114b40dc9",
    measurementId: "G-CQEEZEMV0B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };