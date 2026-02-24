import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyDctZdl294WHN_0rjoRIhUAkDrFXBqulOI",
    authDomain: "sistemaama-c03f7.firebaseapp.com",
    projectId: "sistemaama-c03f7",
    storageBucket: "sistemaama-c03f7.firebasestorage.app",
    messagingSenderId: "235779444077",
    appId: "1:235779444077:web:6cbb3a1098e4a6702b1e64",
    measurementId: "G-RPH5FMKH9H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
