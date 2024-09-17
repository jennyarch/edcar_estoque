// import firebase from 'firebase/app';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBYGl2z0TQyG0bl5lMXsXZQW5CDAtHOS6A",
    authDomain: "edcar-estoque.firebaseapp.com",
    projectId: "edcar-estoque",
    storageBucket: "edcar-estoque.appspot.com",
    messagingSenderId: "835617695824",
    appId: "1:835617695824:web:1ea5876c212253b1f9c955",
    measurementId: "G-SGD3FL0LFJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };